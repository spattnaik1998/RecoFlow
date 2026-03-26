import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const serviceClient = createServiceRoleClient();

    const { data: exportRow } = await serviceClient
      .from("exports")
      .select("*")
      .eq("id", id)
      .single();

    if (!exportRow || exportRow.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (exportRow.status !== "ready") {
      return NextResponse.json(
        { error: "Export is not ready to send." },
        { status: 409 }
      );
    }

    // TODO: integrate Resend (or equivalent) once email provider is configured
    // For now: log intent and mark sent_at so the lifecycle is complete
    console.log("[exports/send] stub — email provider not yet configured", {
      exportId: id,
      userId: user.id,
      shareId: exportRow.share_id,
    });

    await serviceClient
      .from("exports")
      .update({ sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ success: true, stubbed: true });
  } catch (err) {
    console.error("[exports/[id]/send POST]", err);
    return NextResponse.json({ error: "Failed to send export." }, { status: 500 });
  }
}
