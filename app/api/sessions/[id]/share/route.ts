import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { assertCircleMembership } from "@/lib/circles";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sessionId } = await params;
    const { circle_id } = await req.json() as { circle_id: string };

    if (!circle_id) {
      return NextResponse.json({ error: "circle_id is required" }, { status: 400 });
    }

    // Verify session ownership
    const { data: session } = await supabase
      .from("reading_sessions")
      .select("id, user_id")
      .eq("id", sessionId)
      .single();

    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify circle membership
    await assertCircleMembership(circle_id, user.id, supabase);

    const serviceClient = createServiceRoleClient();
    const { data, error } = await serviceClient
      .from("reading_sessions")
      .update({ circle_id, updated_at: new Date().toISOString() })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Failed to share session." }, { status: 500 });
    return NextResponse.json({ session: data });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
