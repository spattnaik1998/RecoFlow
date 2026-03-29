import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { NyxPreferenceSuggestion } from "@/types";

// Temporal decay factor: weight * 0.95^days
function decayedWeight(weight: number, createdAt: string): number {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return weight * Math.pow(0.95, days);
}

// Threshold for generating a suggestion
const SUGGESTION_THRESHOLD = 2.5;

// Maps a dislike reason to the theme label that should be blocked
const REASON_THEME_MAP: Record<string, string> = {
  too_academic: "academic theory",
  too_commercial: "commercial mainstream",
};

// Nyx-voiced messages per reason
const REASON_MESSAGES: Record<string, string> = {
  too_academic:
    "I have noticed a pattern — the heavily theoretical leaves you cold. Shall I steer away from those dense scholarly waters?",
  too_commercial:
    "The loudly commercial seems to jar against your frequency. Shall I guide you toward quieter, less market-driven shores?",
  already_read:
    "Your hands have already turned these pages many times. I shall remember not to offer what you already know.",
  wrong_tone:
    "These offerings strike a discordant note. Shall I recalibrate my sense of your rhythm?",
  not_relevant:
    "Some of what I have offered seems to miss your mark entirely. Shall I narrow my aim?",
};

interface PreferenceSignalRow {
  signal_type: string;
  book_title: string;
  book_author: string | null;
  reason: string | null;
  weight: number;
  created_at: string;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceRoleClient();

    // Fetch all signals for this user in the last 180 days
    const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    const { data: signals } = await serviceClient
      .from("preference_signals")
      .select("signal_type, book_title, book_author, reason, weight, created_at")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (!signals || signals.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const rows = signals as PreferenceSignalRow[];

    // ── 1. Dislike reason pattern detection ─────────────────────────────────
    const reasonWeights = new Map<string, number>();
    for (const row of rows) {
      if (row.signal_type === "dislike" && row.reason) {
        const current = reasonWeights.get(row.reason) ?? 0;
        reasonWeights.set(row.reason, current + decayedWeight(row.weight, row.created_at));
      }
    }

    const suggestions: NyxPreferenceSuggestion[] = [];

    for (const [reason, totalWeight] of reasonWeights.entries()) {
      if (totalWeight >= SUGGESTION_THRESHOLD) {
        suggestions.push({
          reason_code: reason,
          message: REASON_MESSAGES[reason] ?? `I have noticed a recurring pattern with "${reason}". Shall I adjust?`,
          action: "block_theme",
          payload: REASON_THEME_MAP[reason] ?? "",
          signal_count: Math.round(totalWeight),
        });
      }
    }

    // ── 2. Preferred author detection from like signals ──────────────────────
    const authorWeights = new Map<string, number>();
    for (const row of rows) {
      if (row.signal_type === "like" && row.book_author) {
        const current = authorWeights.get(row.book_author) ?? 0;
        authorWeights.set(row.book_author, current + decayedWeight(row.weight, row.created_at));
      }
    }

    const newPreferredAuthors: string[] = [];
    for (const [author, totalWeight] of authorWeights.entries()) {
      if (totalWeight >= SUGGESTION_THRESHOLD) {
        newPreferredAuthors.push(author);
        suggestions.push({
          reason_code: "preferred_author",
          message: `I have noticed you return warmly to ${author}. Shall I keep similar voices closer to hand?`,
          action: "prefer_author",
          payload: author,
          signal_count: Math.round(totalWeight),
        });
      }
    }

    // ── 3. Auto-persist preferred authors (non-fatal) ────────────────────────
    if (newPreferredAuthors.length > 0) {
      const { data: existingPrefs } = await serviceClient
        .from("user_preferences")
        .select("preferred_authors")
        .eq("user_id", user.id)
        .single();

      const current: string[] = existingPrefs?.preferred_authors ?? [];
      const merged = Array.from(new Set([...current, ...newPreferredAuthors])).slice(0, 20);

      await serviceClient
        .from("user_preferences")
        .upsert(
          { user_id: user.id, preferred_authors: merged, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        )
        .then(({ error: upErr }) => {
          if (upErr) console.warn("[preferences/learn] preferred_authors upsert:", upErr.message);
        });
    }

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[preferences/learn]", err);
    return NextResponse.json(
      { error: "Failed to compute preference signals." },
      { status: 500 }
    );
  }
}
