import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(
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

    return NextResponse.json(exportRow);
  } catch (err) {
    console.error("[exports/[id] GET]", err);
    return NextResponse.json({ error: "Failed to load export." }, { status: 500 });
  }
}
