import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getRecommendations } from "@/lib/recommendation-engine";
import type { GetRecommendationsRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as GetRecommendationsRequest;
    const { intersection, brain_dump, session_id } = body;

    if (!intersection || !brain_dump) {
      return NextResponse.json(
        { error: "Missing intersection or brain_dump" },
        { status: 400 }
      );
    }

    // Fetch user profile for personalization
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Generate recommendations
    const recommendations = await getRecommendations(
      intersection,
      brain_dump,
      profile ?? undefined
    );

    // Persist recommendations to Supabase
    const serviceClient = createServiceRoleClient();

    const { error: insertError } = await serviceClient
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
      );

    if (insertError) {
      console.error("[get-recommendations] insert error:", insertError);
    }

    // Update session status to completed
    await serviceClient
      .from("reading_sessions")
      .update({ status: "completed" })
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

    return NextResponse.json({ recommendations, session_id });
  } catch (err) {
    console.error("[get-recommendations]", err);
    return NextResponse.json(
      { error: "Recommendation generation failed." },
      { status: 500 }
    );
  }
}
