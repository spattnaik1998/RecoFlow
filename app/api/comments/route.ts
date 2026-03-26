import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { assertCircleMembership } from "@/lib/circles";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      circle_id,
      session_id,
      recommendation_id,
      body,
    } = await req.json() as {
      circle_id: string;
      session_id?: string;
      recommendation_id?: string;
      body: string;
    };

    if (!circle_id) return NextResponse.json({ error: "circle_id is required" }, { status: 400 });
    if (!body?.trim()) return NextResponse.json({ error: "body is required" }, { status: 400 });
    if (!session_id && !recommendation_id) {
      return NextResponse.json(
        { error: "session_id or recommendation_id must be provided" },
        { status: 400 }
      );
    }

    await assertCircleMembership(circle_id, user.id, supabase);

    const serviceClient = createServiceRoleClient();
    const { data, error } = await serviceClient
      .from("circle_comments")
      .insert({
        circle_id,
        session_id: session_id ?? null,
        recommendation_id: recommendation_id ?? null,
        user_id: user.id,
        body: body.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("[comments POST] insert error:", error);
      return NextResponse.json({ error: "Failed to post comment." }, { status: 500 });
    }

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const circle_id = searchParams.get("circle_id");
    const session_id = searchParams.get("session_id");

    if (!circle_id) return NextResponse.json({ error: "circle_id is required" }, { status: 400 });

    await assertCircleMembership(circle_id, user.id, supabase);

    const serviceClient = createServiceRoleClient();
    let query = serviceClient
      .from("circle_comments")
      .select("*")
      .eq("circle_id", circle_id)
      .order("created_at", { ascending: true });

    if (session_id) query = query.eq("session_id", session_id);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: "Failed to load comments." }, { status: 500 });

    return NextResponse.json({ comments: data ?? [] });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
