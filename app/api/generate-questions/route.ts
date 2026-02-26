import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamQuestions } from "@/lib/anthropic";
import type { GenerateQuestionsRequest } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        `data: ${JSON.stringify({ error: "Unauthorized", done: true })}\n\n`,
        {
          status: 401,
          headers: { "Content-Type": "text/event-stream" },
        }
      );
    }

    const body = await req.json() as GenerateQuestionsRequest;
    const { intersection, user_themes } = body;

    if (!intersection) {
      return new Response(
        `data: ${JSON.stringify({ error: "No intersection data", done: true })}\n\n`,
        {
          status: 400,
          headers: { "Content-Type": "text/event-stream" },
        }
      );
    }

    // Get user's historical themes for returning users
    const { data: profile } = await supabase
      .from("profiles")
      .select("intellectual_themes")
      .eq("id", user.id)
      .single();

    const themes = user_themes ?? profile?.intellectual_themes ?? [];

    // Stream questions via SSE
    const stream = await streamQuestions(intersection, themes);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[generate-questions]", err);
    return new Response(
      `data: ${JSON.stringify({ error: "Question generation failed", done: true })}\n\n`,
      {
        status: 500,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }
}
