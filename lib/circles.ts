import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CircleRole, CircleWithMembership } from "@/types";

// ─── Role Hierarchy ───────────────────────────────────────────────────────────

const ROLE_RANK: Record<CircleRole, number> = {
  viewer: 0,
  editor: 1,
  owner: 2,
};

// ─── Membership Helpers ───────────────────────────────────────────────────────

export async function getUserCircles(
  userId: string,
  supabase: SupabaseClient
): Promise<CircleWithMembership[]> {
  const { data: memberships } = await supabase
    .from("circle_members")
    .select("circle_id, role")
    .eq("user_id", userId);

  if (!memberships || memberships.length === 0) return [];

  const circleIds = memberships.map((m: { circle_id: string }) => m.circle_id);

  const { data: circles } = await supabase
    .from("circles")
    .select("*")
    .in("id", circleIds)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (!circles) return [];

  // Fetch member counts
  const { data: counts } = await supabase
    .from("circle_members")
    .select("circle_id")
    .in("circle_id", circleIds);

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    const id = (row as { circle_id: string }).circle_id;
    countMap.set(id, (countMap.get(id) ?? 0) + 1);
  }

  return circles.map((c: { id: string; name: string; owner_id: string; status: string; created_at: string; updated_at: string }) => {
    const membership = memberships.find(
      (m: { circle_id: string; role: string }) => m.circle_id === c.id
    );
    return {
      ...c,
      status: c.status as "active" | "archived",
      member_count: countMap.get(c.id) ?? 1,
      my_role: (membership?.role ?? "viewer") as CircleRole,
    };
  });
}

// Returns the user's role in the circle, throws 403 error if not a member
export async function assertCircleMembership(
  circleId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<CircleRole> {
  const { data: membership } = await supabase
    .from("circle_members")
    .select("role")
    .eq("circle_id", circleId)
    .eq("user_id", userId)
    .single();

  if (!membership) {
    const err = new Error("Not a member of this circle");
    (err as Error & { status: number }).status = 403;
    throw err;
  }

  return membership.role as CircleRole;
}

// Throws if the user's role is below the required minimum
export async function assertCircleRole(
  circleId: string,
  userId: string,
  minRole: CircleRole,
  supabase: SupabaseClient
): Promise<void> {
  const role = await assertCircleMembership(circleId, userId, supabase);
  if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
    const err = new Error(
      `This action requires ${minRole} or higher in this circle`
    );
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}

// ─── Invite Token Helpers ─────────────────────────────────────────────────────

export function generateInviteToken(): string {
  return crypto.randomUUID();
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Verifies a raw invite token against stored hash; returns the invite row or throws
export async function verifyInviteToken(
  token: string,
  circleId: string,
  supabase: SupabaseClient
): Promise<{ id: string; circle_id: string; email: string }> {
  const tokenHash = hashToken(token);

  const { data: invite } = await supabase
    .from("circle_invites")
    .select("*")
    .eq("circle_id", circleId)
    .eq("token_hash", tokenHash)
    .single();

  if (!invite) {
    const err = new Error("Invite token not found or already used");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  if (invite.accepted_at) {
    const err = new Error("This invite has already been accepted");
    (err as Error & { status: number }).status = 409;
    throw err;
  }

  if (new Date(invite.expires_at) < new Date()) {
    const err = new Error("This invite has expired");
    (err as Error & { status: number }).status = 410;
    throw err;
  }

  return invite as { id: string; circle_id: string; email: string };
}
