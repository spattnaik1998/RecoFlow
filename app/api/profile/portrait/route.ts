// Supabase migration required before first use:
//   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reading_portrait TEXT;
//   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portrait_generated_at TIMESTAMPTZ;

import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generateReadingPortrait } from "@/lib/anthropic";

export interface SessionDNA {
  id: string;
  created_at: string;
  themes: string[];
  books: { title: string; author: string }[];
}

export interface PortraitResponse {
  portrait: string | null;
  generated_at: string | null;
  dna_sessions: SessionDNA[];
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch profile data and completed sessions in parallel
    const [profileRes, sessionsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("intellectual_themes, reading_portrait, portrait_generated_at, updated_at")
        .eq("id", user.id)
        .single(),
      supabase
        .from("reading_sessions")
        .select("id, created_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: true })
        .limit(50),
    ]);

    const profile = profileRes.data as {
      intellectual_themes: string[] | null;
      reading_portrait: string | null;
      portrait_generated_at: string | null;
      updated_at: string;
    } | null;

    const completedSessions = sessionsRes.data ?? [];

    // Build per-session DNA data from current_books
    let dna_sessions: SessionDNA[] = [];
    if (completedSessions.length > 0) {
      const sessionIds = completedSessions.map((s: { id: string }) => s.id);
      const { data: booksData } = await supabase
        .from("current_books")
        .select("session_id, title, author, themes")
        .in("session_id", sessionIds);

      const books = booksData ?? [];
      dna_sessions = completedSessions.map((s: { id: string; created_at: string }) => {
        const sessionBooks = books.filter(
          (b: { session_id: string }) => b.session_id === s.id
        );
        const themes = Array.from(
          new Set(
            sessionBooks.flatMap((b: { themes: string[] | null }) => b.themes ?? [])
          )
        ) as string[];
        return {
          id: s.id,
          created_at: s.created_at,
          themes,
          books: sessionBooks.map((b: { title: string; author: string }) => ({
            title: b.title,
            author: b.author,
          })),
        };
      });
    }

    // Determine whether portrait needs regeneration
    const intellectualThemes = profile?.intellectual_themes ?? [];
    const latestSessionDate = completedSessions.at(-1)?.created_at ?? null;
    const portraitDate = profile?.portrait_generated_at ?? null;
    const needsRegeneration =
      intellectualThemes.length > 0 &&
      (portraitDate === null ||
        (latestSessionDate !== null && latestSessionDate > portraitDate));

    let portrait = profile?.reading_portrait ?? null;
    let generated_at = portraitDate;

    if (needsRegeneration) {
      // Build session summaries for the portrait prompt
      const sessionSummaries = dna_sessions.slice(-6).map((s) => ({
        date: new Date(s.created_at).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        books: s.books.map((b) => b.title),
        topThemes: s.themes.slice(0, 4),
      }));

      portrait = await generateReadingPortrait(intellectualThemes, sessionSummaries);
      generated_at = new Date().toISOString();

      // Persist to profiles table (non-fatal if column doesn't exist yet)
      try {
        const serviceClient = createServiceRoleClient();
        await serviceClient
          .from("profiles")
          .update({
            reading_portrait: portrait,
            portrait_generated_at: generated_at,
          })
          .eq("id", user.id);
      } catch (e) {
        console.warn("[portrait] Could not cache portrait — migration may be pending:", e);
      }
    }

    const response: PortraitResponse = {
      portrait,
      generated_at,
      dna_sessions,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[profile/portrait GET]", err);
    return NextResponse.json(
      { error: "Failed to generate reading portrait." },
      { status: 500 }
    );
  }
}
