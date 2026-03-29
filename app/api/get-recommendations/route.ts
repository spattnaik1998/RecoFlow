import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getRecommendations } from "@/lib/recommendation-engine";
import { getUserPreferences } from "@/lib/preference-engine";
import type { GetRecommendationsRequest, MediaConsumptionAnswer } from "@/types";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as GetRecommendationsRequest;
    const { intersection, brain_dump, session_id, media_answers } = body;

    if (!intersection || !brain_dump) {
      return NextResponse.json(
        { error: "Missing intersection or brain_dump" },
        { status: 400 }
      );
    }

    // Fetch user profile and preferences in parallel for personalization
    const [{ data: profile }, userPreferences] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      getUserPreferences(user.id, supabase),
    ]);

    // Generate recommendations (preference-aware, media-enriched)
    const recommendations = await getRecommendations(
      intersection,
      brain_dump,
      profile ?? undefined,
      userPreferences,
      media_answers as MediaConsumptionAnswer[] | undefined
    );

    // Persist recommendations and fetch back with DB-assigned ids
    const serviceClient = createServiceRoleClient();

    const { data: inserted, error: insertError } = await serviceClient
      .from("recommendations")
      .insert(
        recommendations.map((rec) => ({
          session_id,
          user_id: user.id,
          title: rec.title,
          author: rec.author,
          cover_url: rec.cover_url ?? null,
          thematic_connection: rec.thematic_connection,
          rank: rec.rank,
        }))
      )
      .select("id, rank");

    if (insertError) {
      console.error("[get-recommendations] insert error:", insertError);
    }

    // Attach DB ids to recommendations so the client can submit feedback
    const recommendationsWithIds = recommendations.map((rec) => {
      const row = inserted?.find((r) => r.rank === rec.rank);
      return row ? { ...rec, id: row.id as string } : rec;
    });

    // Update session status to completed; persist media context if present
    await serviceClient
      .from("reading_sessions")
      .update({
        status: "completed",
        ...(media_answers ? { media_context: media_answers } : {}),
      })
      .eq("id", session_id);

    // Update user profile with new themes
    const allThemes = intersection.intersection.confluences;
    const existingThemes = profile?.intellectual_themes ?? [];
    const mergedThemes = Array.from(new Set([...existingThemes, ...allThemes])).slice(0, 20);

    await serviceClient
      .from("profiles")
      .update({
        intellectual_themes: mergedThemes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({ recommendations: recommendationsWithIds, session_id });
  } catch (err) {
    console.error("[get-recommendations]", err);
    return NextResponse.json(
      { error: "Recommendation generation failed." },
      { status: 500 }
    );
  }
}
