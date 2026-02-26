import { generateRecommendations } from "./anthropic";
import { searchBooksAtIntersection } from "./serper";
import type {
  ThematicIntersection,
  BrainDumpAnswer,
  UserProfile,
  Recommendation,
} from "@/types";

export async function getRecommendations(
  intersection: ThematicIntersection,
  brainDump: BrainDumpAnswer[],
  userProfile?: UserProfile
): Promise<Recommendation[]> {
  // Step 1: Search for candidate books at the intellectual intersection
  const themes = intersection.intersection.confluences;
  const territory = intersection.intersection.intellectual_territory;

  const searchResults = await searchBooksAtIntersection(themes, territory);

  // Step 2: Claude synthesizes candidates into 5 ranked recommendations
  const recommendations = await generateRecommendations(
    intersection,
    brainDump,
    searchResults,
    userProfile
  );

  // Ensure we have exactly 5, sorted by rank
  return recommendations
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);
}
