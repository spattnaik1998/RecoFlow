import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { buildDigestContent, renderDigestHTML, generateShareId } from "@/lib/digest-renderer";
import type { CreateExportRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as CreateExportRequest;
    const { session_id, type = "pdf", style = "branded" } = body;

    if (!session_id) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient();

    // Verify session ownership
    const { data: session } = await serviceClient
      .from("reading_sessions")
      .select("id, user_id, status")
      .eq("id", session_id)
      .single();

    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check for an existing ready/queued export to avoid duplicates (409)
    const { data: existing } = await serviceClient
      .from("exports")
      .select("*")
      .eq("session_id", session_id)
      .eq("user_id", user.id)
      .in("status", ["ready", "queued", "generating"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An export already exists for this session.", existing },
        { status: 409 }
      );
    }

    const share_id = generateShareId();

    // Insert export row as queued
    const { data: exportRow, error: insertErr } = await serviceClient
      .from("exports")
      .insert({
        session_id,
        user_id: user.id,
        type,
        style,
        status: "queued",
        share_id,
      })
      .select()
      .single();

    if (insertErr || !exportRow) {
      console.error("[exports POST] insert error:", insertErr);
      return NextResponse.json({ error: "Failed to create export." }, { status: 500 });
    }

    // Inline generation (synchronous HTML for MVP — no headless PDF on Vercel)
    try {
      await serviceClient
        .from("exports")
        .update({ status: "generating", updated_at: new Date().toISOString() })
        .eq("id", exportRow.id);

      const content = await buildDigestContent(session_id, serviceClient);
      renderDigestHTML(content, style); // validate rendering; HTML is served at /s/[shareId]

      await serviceClient
        .from("exports")
        .update({
          status: "ready",
          file_url: `/s/${share_id}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", exportRow.id);

      const { data: readyExport } = await serviceClient
        .from("exports")
        .select("*")
        .eq("id", exportRow.id)
        .single();

      return NextResponse.json(readyExport);
    } catch (renderErr) {
      console.error("[exports POST] render error:", renderErr);
      await serviceClient
        .from("exports")
        .update({
          status: "failed",
          error_message: String(renderErr),
          updated_at: new Date().toISOString(),
        })
        .eq("id", exportRow.id);

      return NextResponse.json(
        { error: "Export generation failed. Please try again." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[exports POST]", err);
    return NextResponse.json({ error: "Failed to create export." }, { status: 500 });
  }
}
