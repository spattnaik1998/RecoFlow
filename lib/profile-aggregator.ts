import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ProfileSummary,
  ProfileInsight,
  SessionSummaryRow,
  ThemeCluster,
  ProfileDashboardData,
} from "@/types";

// ─── Summary Builder ─────────────────────────────────────────────────────────

export async function buildProfileSummary(
  userId: string,
  supabase: SupabaseClient
): Promise<ProfileSummary> {
  // Fetch profile, sessions, books, and recs in parallel
  const [profileRes, sessionsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("reading_sessions")
      .select("id, created_at, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const sessions = sessionsRes.data ?? [];
  const profile = profileRes.data;

  if (sessions.length === 0) {
    return {
      display_name: profile?.display_name ?? null,
      member_since: new Date().toISOString(),
      total_sessions: 0,
      total_recommendations: 0,
      top_themes: [],
      intellectual_territory:
        "Your reading identity is still forming. Begin a consultation to reveal the territory.",
      emotional_undercurrent:
        "The archive awaits your first entry.",
    };
  }

  const sessionIds = sessions.map((s: { id: string }) => s.id);

  // Fetch books and recs for all sessions
  const [booksRes, recsRes] = await Promise.all([
    supabase
      .from("current_books")
      .select("session_id, themes, created_at")
      .in("session_id", sessionIds),
    supabase
      .from("recommendations")
      .select("id, session_id")
      .in("session_id", sessionIds),
  ]);

  const books = booksRes.data ?? [];
  const recs = recsRes.data ?? [];

  // Compute theme frequency
  const themeMap = new Map<string, { count: number; last_seen: string }>();
  for (const book of books) {
    const themes = (book.themes as string[] | null) ?? [];
    const sessionDate =
      sessions.find((s: { id: string }) => s.id === book.session_id)
        ?.created_at ?? book.created_at;
    for (const theme of themes) {
      const existing = themeMap.get(theme);
      if (!existing) {
        themeMap.set(theme, { count: 1, last_seen: sessionDate });
      } else {
        themeMap.set(theme, {
          count: existing.count + 1,
          last_seen:
            sessionDate > existing.last_seen ? sessionDate : existing.last_seen,
        });
      }
    }
  }

  const top_themes: ThemeCluster[] = Array.from(themeMap.entries())
    .map(([theme, { count, last_seen }]) => ({ theme, frequency: count, last_seen }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 8);

  // Derive intellectual territory from top themes
  const topThemeNames = top_themes.slice(0, 4).map((t) => t.theme);
  const intellectual_territory =
    topThemeNames.length > 0
      ? `A mind drawn repeatedly to ${topThemeNames.join(", ")}. The threads between your reads form a recurring inquiry.`
      : "Your thematic territory is still emerging.";

  const emotional_undercurrent =
    profile?.emotional_context
      ? "Shaped by the emotional registers of your accumulated sessions."
      : "The emotional undercurrent has yet to be named.";

  const member_since = sessions[sessions.length - 1]?.created_at ?? new Date().toISOString();

  return {
    display_name: profile?.display_name ?? null,
    member_since,
    total_sessions: sessions.length,
    total_recommendations: recs.length,
    top_themes,
    intellectual_territory,
    emotional_undercurrent,
  };
}

// ─── Insights Builder ────────────────────────────────────────────────────────

export async function buildProfileInsights(
  userId: string,
  summary: ProfileSummary
): Promise<ProfileInsight[]> {
  const insights: ProfileInsight[] = [];

  // Recurring theme insight
  if (summary.top_themes.length > 0) {
    const top = summary.top_themes[0];
    insights.push({
      type: "recurring_theme",
      label: `You often return to: ${top.theme}`,
      description: `This theme has appeared in ${top.frequency} of your reading session${top.frequency !== 1 ? "s" : ""}, suggesting a persistent intellectual preoccupation.`,
    });
  }

  // Multi-session depth signal
  if (summary.total_sessions >= 3 && summary.top_themes.length >= 3) {
    const cluster = summary.top_themes.slice(0, 3).map((t) => t.theme);
    insights.push({
      type: "author_affinity",
      label: "A Coherent Intellectual Thread",
      description: `Across your consultations, ${cluster.join(", ")} weave through your reading. Nyx can now anticipate the edges of your curiosity.`,
    });
  }

  // Neglected theme (theme that appeared only once and long ago)
  if (summary.top_themes.length >= 5) {
    const neglected = summary.top_themes.find((t) => t.frequency === 1);
    if (neglected) {
      insights.push({
        type: "neglected_theme",
        label: `A thread left hanging: ${neglected.theme}`,
        description:
          "You touched this territory once and have not returned. It may be waiting for the right moment.",
      });
    }
  }

  // Volume milestone
  if (summary.total_recommendations >= 10) {
    insights.push({
      type: "format_tendency",
      label: `${summary.total_recommendations} paths revealed`,
      description:
        "The library grows denser with each consultation. Your archive of possible reads is becoming a landscape of its own.",
    });
  }

  // Fallback for new users
  if (insights.length === 0 && summary.total_sessions > 0) {
    insights.push({
      type: "recurring_theme",
      label: "Your reading identity is taking shape",
      description:
        "Continue consulting Nyx and your intellectual patterns will crystallize into something remarkable.",
    });
  }

  return insights;
}

// ─── Session Summary Rows ────────────────────────────────────────────────────

export async function buildSessionSummaryRows(
  userId: string,
  page: number,
  limit: number,
  supabase: SupabaseClient
): Promise<{ rows: SessionSummaryRow[]; total: number }> {
  const offset = (page - 1) * limit;

  const { data: sessions, count } = await supabase
    .from("reading_sessions")
    .select("id, created_at, status", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!sessions || sessions.length === 0) {
    return { rows: [], total: count ?? 0 };
  }

  const sessionIds = sessions.map((s: { id: string }) => s.id);

  const [booksRes, recsRes] = await Promise.all([
    supabase
      .from("current_books")
      .select("session_id, title, author, themes")
      .in("session_id", sessionIds),
    supabase
      .from("recommendations")
      .select("session_id, title, author, rank")
      .in("session_id", sessionIds)
      .order("rank"),
  ]);

  const books = booksRes.data ?? [];
  const recs = recsRes.data ?? [];

  const rows: SessionSummaryRow[] = sessions.map(
    (s: { id: string; created_at: string; status: string }) => {
      const sessionBooks = books
        .filter((b: { session_id: string }) => b.session_id === s.id)
        .map((b: { title: string; author: string }) => ({
          title: b.title,
          author: b.author,
        }));

      const topRec = recs.find(
        (r: { session_id: string; rank: number }) =>
          r.session_id === s.id && r.rank === 1
      );

      const sessionThemes = books
        .filter((b: { session_id: string }) => b.session_id === s.id)
        .flatMap((b: { themes: string[] | null }) => b.themes ?? []);

      const uniqueThemes = Array.from(new Set(sessionThemes as string[])).slice(0, 5);

      return {
        id: s.id,
        created_at: s.created_at,
        status: s.status,
        books: sessionBooks,
        top_recommendation: topRec
          ? { title: topRec.title, author: topRec.author }
          : null,
        theme_tags: uniqueThemes,
      };
    }
  );

  return { rows, total: count ?? 0 };
}

// ─── Full Dashboard Data ─────────────────────────────────────────────────────

export async function getProfileDashboardData(
  userId: string,
  supabase: SupabaseClient
): Promise<ProfileDashboardData> {
  const summary = await buildProfileSummary(userId, supabase);
  const [insights, sessionData] = await Promise.all([
    buildProfileInsights(userId, summary),
    buildSessionSummaryRows(userId, 1, 10, supabase),
  ]);

  return {
    summary,
    insights,
    recent_sessions: sessionData.rows,
    total_session_count: sessionData.total,
  };
}
