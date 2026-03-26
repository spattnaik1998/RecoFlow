import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getUserCircles } from "@/lib/circles";
import type { CreateCircleRequest } from "@/types";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const circles = await getUserCircles(user.id, supabase);
    return NextResponse.json({ circles });
  } catch (err) {
    console.error("[circles GET]", err);
    return NextResponse.json({ error: "Failed to load circles." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await req.json() as CreateCircleRequest;
    if (!name?.trim()) {
      return NextResponse.json({ error: "Circle name is required" }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient();

    // Create circle
    const { data: circle, error: circleErr } = await serviceClient
      .from("circles")
      .insert({ name: name.trim(), owner_id: user.id, status: "active" })
      .select()
      .single();

    if (circleErr || !circle) {
      console.error("[circles POST] insert error:", circleErr);
      return NextResponse.json({ error: "Failed to create circle." }, { status: 500 });
    }

    // Insert owner as member
    await serviceClient
      .from("circle_members")
      .insert({ circle_id: circle.id, user_id: user.id, role: "owner" });

    return NextResponse.json({ circle }, { status: 201 });
  } catch (err) {
    console.error("[circles POST]", err);
    return NextResponse.json({ error: "Failed to create circle." }, { status: 500 });
  }
}
