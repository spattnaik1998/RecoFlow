import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { assertCircleRole, generateInviteToken, hashToken } from "@/lib/circles";
import type { InviteRequest } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: circleId } = await params;
    // Editors and owners can invite
    await assertCircleRole(circleId, user.id, "editor", supabase);

    const { email } = await req.json() as InviteRequest;
    if (!email?.trim()) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const rawToken = generateInviteToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const serviceClient = createServiceRoleClient();
    const { error: inviteErr } = await serviceClient
      .from("circle_invites")
      .insert({
        circle_id: circleId,
        email: email.trim().toLowerCase(),
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (inviteErr) {
      console.error("[circles/invite POST] insert error:", inviteErr);
      return NextResponse.json({ error: "Failed to create invite." }, { status: 500 });
    }

    // TODO: send via Resend once email provider is configured
    const inviteLink = `/api/circles/${circleId}/join?token=${rawToken}`;
    console.log("[circles/invite] stub — email provider not configured", { inviteLink, email });

    return NextResponse.json({
      invite_link: inviteLink,
      expires_at: expiresAt,
      stubbed_email: true,
    });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
