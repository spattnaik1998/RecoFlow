import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { assertCircleMembership, assertCircleRole } from "@/lib/circles";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await assertCircleMembership(id, user.id, supabase);

    const serviceClient = createServiceRoleClient();
    const [circleRes, membersRes] = await Promise.all([
      serviceClient.from("circles").select("*").eq("id", id).single(),
      serviceClient.from("circle_members").select("id, user_id, role, joined_at").eq("circle_id", id),
    ]);

    if (!circleRes.data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ circle: circleRes.data, members: membersRes.data ?? [] });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await assertCircleRole(id, user.id, "owner", supabase);

    const body = await req.json() as { name?: string; status?: string };
    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (body.name?.trim()) updates.name = body.name.trim();
    if (body.status === "active" || body.status === "archived") updates.status = body.status;

    const serviceClient = createServiceRoleClient();
    const { data, error } = await serviceClient
      .from("circles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Update failed." }, { status: 500 });
    return NextResponse.json({ circle: data });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await assertCircleRole(id, user.id, "owner", supabase);

    const serviceClient = createServiceRoleClient();
    await serviceClient.from("circles").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
