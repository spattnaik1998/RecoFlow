import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserPreferences } from "@/types";

const EMPTY_PREFERENCES: Omit<UserPreferences, "user_id" | "updated_at"> = {
  blocked_authors: [],
  blocked_titles: [],
  blocked_themes: [],
  preferred_themes: [],
};

export async function getUserPreferences(
  userId: string,
  supabase: SupabaseClient
): Promise<UserPreferences> {
  const { data } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!data) {
    return {
      user_id: userId,
      updated_at: new Date().toISOString(),
      ...EMPTY_PREFERENCES,
    };
  }

  return data as UserPreferences;
}

// Filter blocked authors and titles from Serper search result text before
// passing it to Claude. This prevents blocked books from appearing as candidates.
export function applyPreferenceFilter(
  searchResults: string,
  preferences: UserPreferences
): string {
  if (
    preferences.blocked_authors.length === 0 &&
    preferences.blocked_titles.length === 0
  ) {
    return searchResults;
  }

  const lines = searchResults.split("\n");
  const filtered = lines.filter((line) => {
    const lower = line.toLowerCase();
    const blockedByAuthor = preferences.blocked_authors.some((a) =>
      lower.includes(a.toLowerCase())
    );
    const blockedByTitle = preferences.blocked_titles.some((t) =>
      lower.includes(t.toLowerCase())
    );
    return !blockedByAuthor && !blockedByTitle;
  });

  return filtered.join("\n");
}

// Build a preference context string to inject into the Claude recommendation
// prompt so blocked themes are excluded and preferred themes are boosted.
export function buildPreferenceContext(preferences: UserPreferences): string {
  const parts: string[] = [];

  if (preferences.blocked_authors.length > 0) {
    parts.push(
      `Do NOT recommend books by these authors: ${preferences.blocked_authors.join(", ")}.`
    );
  }
  if (preferences.blocked_titles.length > 0) {
    parts.push(
      `Do NOT recommend these specific titles: ${preferences.blocked_titles.join(", ")}.`
    );
  }
  if (preferences.blocked_themes.length > 0) {
    parts.push(
      `Avoid recommendations that are heavily focused on: ${preferences.blocked_themes.join(", ")}.`
    );
  }
  if (preferences.preferred_themes.length > 0) {
    parts.push(
      `The reader has shown affinity for: ${preferences.preferred_themes.join(", ")}. Weight toward these when quality candidates exist.`
    );
  }

  if (parts.length === 0) return "";
  return `\n\nREADER PREFERENCE SIGNALS:\n${parts.join(" ")}`;
}
