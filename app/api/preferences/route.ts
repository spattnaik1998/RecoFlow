import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { PreferencesPatchRequest } from "@/types";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Return defaults if no row exists yet
    return NextResponse.json(
      data ?? {
        user_id: user.id,
        blocked_authors: [],
        blocked_titles: [],
        blocked_themes: [],
        preferred_themes: [],
        updated_at: new Date().toISOString(),
      }
    );
  } catch (err) {
    console.error("[preferences GET]", err);
    return NextResponse.json({ error: "Failed to load preferences." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as PreferencesPatchRequest;

    // Fetch existing to merge (so PATCH is additive/replacement, not destructive)
    const { data: existing } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const merged = {
      user_id: user.id,
      blocked_authors: existing?.blocked_authors ?? [],
      blocked_titles: existing?.blocked_titles ?? [],
      blocked_themes: existing?.blocked_themes ?? [],
      preferred_themes: existing?.preferred_themes ?? [],
      ...(body.blocked_authors !== undefined && { blocked_authors: body.blocked_authors }),
      ...(body.blocked_titles !== undefined && { blocked_titles: body.blocked_titles }),
      ...(body.blocked_themes !== undefined && { blocked_themes: body.blocked_themes }),
      ...(body.preferred_themes !== undefined && { preferred_themes: body.preferred_themes }),
      updated_at: new Date().toISOString(),
    };

    const serviceClient = createServiceRoleClient();
    const { data, error } = await serviceClient
      .from("user_preferences")
      .upsert(merged, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("[preferences PATCH] upsert error:", error);
      return NextResponse.json({ error: "Failed to update preferences." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[preferences PATCH]", err);
    return NextResponse.json({ error: "Failed to update preferences." }, { status: 500 });
  }
}
