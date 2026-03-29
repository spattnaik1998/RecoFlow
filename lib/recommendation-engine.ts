import { generateRecommendations } from "./anthropic";
import { searchBooksAtIntersection } from "./serper";
import { applyPreferenceFilter, buildPreferenceContext } from "./preference-engine";
import type {
  ThematicIntersection,
  BrainDumpAnswer,
  MediaConsumptionAnswer,
  UserProfile,
  UserPreferences,
  Recommendation,
} from "@/types";

export async function getRecommendations(
  intersection: ThematicIntersection,
  brainDump: BrainDumpAnswer[],
  userProfile?: UserProfile,
  userPreferences?: UserPreferences,
  mediaAnswers?: MediaConsumptionAnswer[]
): Promise<Recommendation[]> {
  // Step 1: Search for candidate books at the intellectual intersection
  const themes = intersection.intersection.confluences;
  const territory = intersection.intersection.intellectual_territory;

  let searchResults = await searchBooksAtIntersection(themes, territory);

  // Step 2: Filter out blocked authors/titles from candidate pool
  if (userPreferences) {
    searchResults = applyPreferenceFilter(searchResults, userPreferences);
    const blockedCount =
      userPreferences.blocked_authors.length +
      userPreferences.blocked_titles.length +
      userPreferences.blocked_themes.length;
    if (blockedCount > 0) {
      console.log(
        `[recommendation-engine] preference filter applied: ${blockedCount} blocked items`
      );
    }
  }

  // Step 3: Build preference context string for Claude
  const preferenceContext = userPreferences
    ? buildPreferenceContext(userPreferences)
    : undefined;

  // Step 4: Claude synthesizes candidates into 5 ranked recommendations
  const recommendations = await generateRecommendations(
    intersection,
    brainDump,
    searchResults,
    userProfile,
    preferenceContext,
    mediaAnswers
  );

  // Ensure we have exactly 5, sorted by rank
  return recommendations
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);
}
