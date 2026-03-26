import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { assertCircleMembership } from "@/lib/circles";
import type { CircleVoteValue } from "@/types";

const VALID_VOTES: CircleVoteValue[] = ["like", "neutral", "dislike"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: recommendationId } = await params;
    const { circle_id, vote } = await req.json() as { circle_id: string; vote: CircleVoteValue };

    if (!circle_id) return NextResponse.json({ error: "circle_id is required" }, { status: 400 });
    if (!vote || !VALID_VOTES.includes(vote)) {
      return NextResponse.json({ error: "vote must be like, neutral, or dislike" }, { status: 400 });
    }

    await assertCircleMembership(circle_id, user.id, supabase);

    const serviceClient = createServiceRoleClient();
    const { data, error } = await serviceClient
      .from("circle_votes")
      .upsert(
        { circle_id, recommendation_id: recommendationId, user_id: user.id, vote },
        { onConflict: "circle_id,recommendation_id,user_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("[votes POST] upsert error:", error);
      return NextResponse.json({ error: "Failed to save vote." }, { status: 500 });
    }

    return NextResponse.json({ vote: data });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
