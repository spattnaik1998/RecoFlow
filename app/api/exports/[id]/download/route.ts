import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { buildDigestContent, renderDigestHTML } from "@/lib/digest-renderer";
import type { ExportStyle } from "@/types";

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

    if (exportRow.status !== "ready") {
      return NextResponse.json(
        { error: "Export is not ready yet.", status: exportRow.status },
        { status: 409 }
      );
    }

    // Regenerate HTML on demand for download (not stored as a file in MVP)
    const content = await buildDigestContent(exportRow.session_id, serviceClient);
    const html = renderDigestHTML(content, exportRow.style as ExportStyle);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="recoflow-consultation.html"`,
      },
    });
  } catch (err) {
    console.error("[exports/[id]/download GET]", err);
    return NextResponse.json({ error: "Failed to generate download." }, { status: 500 });
  }
}
