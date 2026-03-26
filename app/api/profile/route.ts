import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfileDashboardData } from "@/lib/profile-aggregator";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getProfileDashboardData(user.id, supabase);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[profile GET]", err);
    return NextResponse.json(
      { error: "Failed to load your profile." },
      { status: 500 }
    );
  }
}
