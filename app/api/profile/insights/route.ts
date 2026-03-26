import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildProfileSummary, buildProfileInsights } from "@/lib/profile-aggregator";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await buildProfileSummary(user.id, supabase);
    const insights = await buildProfileInsights(user.id, summary);

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("[profile/insights GET]", err);
    return NextResponse.json(
      { error: "Failed to load insights." },
      { status: 500 }
    );
  }
}
