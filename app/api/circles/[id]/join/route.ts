import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { verifyInviteToken } from "@/lib/circles";
import type { JoinCircleRequest } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: circleId } = await params;

    // Also support token from query string (direct link clicks)
    let token: string | undefined;
    const body = await req.json().catch(() => ({})) as Partial<JoinCircleRequest>;
    token = body.token;
    if (!token) {
      const url = new URL(req.url);
      token = url.searchParams.get("token") ?? undefined;
    }

    if (!token) {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    const invite = await verifyInviteToken(token, circleId, supabase);

    const serviceClient = createServiceRoleClient();

    // Check user is not already a member
    const { data: existing } = await serviceClient
      .from("circle_members")
      .select("id")
      .eq("circle_id", circleId)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already a member of this circle" }, { status: 409 });
    }

    // Add member
    await serviceClient
      .from("circle_members")
      .insert({ circle_id: circleId, user_id: user.id, role: "viewer" });

    // Mark invite as accepted
    await serviceClient
      .from("circle_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    // Return the circle
    const { data: circle } = await serviceClient
      .from("circles")
      .select("*")
      .eq("id", circleId)
      .single();

    return NextResponse.json({ circle, joined: true });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
