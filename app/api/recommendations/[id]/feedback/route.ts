import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { FeedbackRequest } from "@/types";

const VALID_VOTES = ["like", "dislike"] as const;
const VALID_REASONS = [
  "too_academic",
  "too_commercial",
  "already_read",
  "wrong_tone",
  "not_relevant",
] as const;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: recommendationId } = await params;
    const body = await req.json() as FeedbackRequest & { session_id: string };
    const { vote, reason, session_id } = body;

    if (!vote || !VALID_VOTES.includes(vote)) {
      return NextResponse.json(
        { error: "vote must be 'like' or 'dislike'" },
        { status: 400 }
      );
    }
    if (reason && !VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason value" }, { status: 400 });
    }
    if (!session_id) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient();

    // Upsert feedback (UNIQUE constraint on recommendation_id + user_id)
    const { data: feedback, error } = await serviceClient
      .from("recommendation_feedback")
      .upsert(
        {
          recommendation_id: recommendationId,
          session_id,
          user_id: user.id,
          vote,
          reason: reason ?? null,
        },
        { onConflict: "recommendation_id,user_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("[recommendations/feedback] upsert error:", error);
      return NextResponse.json(
        { error: "Failed to save feedback." },
        { status: 500 }
      );
    }

    // If user disliked and provided a reason, update their durable preference blocks
    if (vote === "dislike" && reason) {
      // Fetch the recommendation to get author/title for potential blocks
      const { data: rec } = await serviceClient
        .from("recommendations")
        .select("title, author")
        .eq("id", recommendationId)
        .single();

      if (rec) {
        const { data: existingPrefs } = await serviceClient
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        const current = existingPrefs ?? {
          user_id: user.id,
          blocked_authors: [],
          blocked_titles: [],
          blocked_themes: [],
          preferred_themes: [],
        };

        // "already_read" → block the specific title so it never reappears
        if (reason === "already_read") {
          const blocked = Array.from(
            new Set([...current.blocked_titles, rec.title])
          );
          await serviceClient
            .from("user_preferences")
            .upsert(
              { ...current, blocked_titles: blocked, updated_at: new Date().toISOString() },
              { onConflict: "user_id" }
            );
        }
      }
    }

    // If user liked, add preferred_themes signal from session thematic data
    if (vote === "like") {
      const { data: session } = await serviceClient
        .from("reading_sessions")
        .select("id")
        .eq("id", session_id)
        .single();

      if (session) {
        const { data: books } = await serviceClient
          .from("current_books")
          .select("themes")
          .eq("session_id", session_id);

        if (books && books.length > 0) {
          const themes = books.flatMap((b) => (b.themes as string[]) ?? []);
          const { data: existingPrefs } = await serviceClient
            .from("user_preferences")
            .select("*")
            .eq("user_id", user.id)
            .single();

          const current = existingPrefs ?? {
            user_id: user.id,
            blocked_authors: [],
            blocked_titles: [],
            blocked_themes: [],
            preferred_themes: [],
          };

          const preferred = Array.from(
            new Set([...current.preferred_themes, ...themes])
          ).slice(0, 20);

          await serviceClient
            .from("user_preferences")
            .upsert(
              { ...current, preferred_themes: preferred, updated_at: new Date().toISOString() },
              { onConflict: "user_id" }
            );
        }
      }
    }

    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    console.error("[recommendations/feedback]", err);
    return NextResponse.json(
      { error: "Failed to save your feedback." },
      { status: 500 }
    );
  }
}
