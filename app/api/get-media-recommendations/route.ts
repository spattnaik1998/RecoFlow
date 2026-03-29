import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchMediaAtIntersection } from "@/lib/serper";
import { generateMediaRecommendations } from "@/lib/anthropic";
import type { GetMediaRecommendationsRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as GetMediaRecommendationsRequest;
    const { intersection, media_answers } = body;

    if (!intersection || !media_answers) {
      return NextResponse.json(
        { error: "Missing intersection or media_answers" },
        { status: 400 }
      );
    }

    // Guard: if every answer is skipped, return empty immediately
    const hasActiveAnswers = media_answers.some((a) => !a.skipped && a.answer.trim().length > 0);
    if (!hasActiveAnswers) {
      return NextResponse.json({ podcasts: [], articles: [] });
    }

    // Run all three Serper queries in parallel
    const searchResults = await searchMediaAtIntersection(
      intersection.intersection.intellectual_territory,
      intersection.intersection.confluences
    );

    // Claude selects and formats the media recommendations
    const { podcasts, articles } = await generateMediaRecommendations(
      intersection,
      media_answers,
      searchResults
    );

    return NextResponse.json({ podcasts, articles });
  } catch (err) {
    console.error("[get-media-recommendations]", err);
    return NextResponse.json(
      { error: "Media recommendation generation failed." },
      { status: 500 }
    );
  }
}
