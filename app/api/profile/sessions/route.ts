import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSessionSummaryRows } from "@/lib/profile-aggregator";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

    const { rows, total } = await buildSessionSummaryRows(user.id, page, limit, supabase);

    return NextResponse.json({ sessions: rows, total, page, limit });
  } catch (err) {
    console.error("[profile/sessions GET]", err);
    return NextResponse.json(
      { error: "Failed to load session history." },
      { status: 500 }
    );
  }
}
