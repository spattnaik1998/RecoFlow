// ─── Book Types ───────────────────────────────────────────────────────────────

export interface Book {
  id?: string;
  title: string;
  author: string;
  goodreads_url?: string;
  themes?: string[];
  core_tension?: string;
  raw_analysis?: BookAnalysis;
}

export interface BookAnalysis {
  title: string;
  author: string;
  themes: string[];
  core_tension: string;
  emotional_register: string;
  key_ideas: string[];
}

// ─── Thematic Intersection ────────────────────────────────────────────────────

export interface ThematicIntersection {
  books: BookAnalysis[];
  intersection: {
    confluences: string[];
    tensions: string[];
    intellectual_territory: string;
    emotional_undercurrent: string;
  };
}

// ─── Brain Dump / Questions ───────────────────────────────────────────────────

export type QuestionCategory = "intellectual" | "emotional";

export interface NyxQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  hint?: string;
}

export interface BrainDumpAnswer {
  question: string;
  answer: string;
  category: QuestionCategory;
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export interface Recommendation {
  id?: string; // DB row id, present after persistence; absent in transient session-storage use
  title: string;
  author: string;
  cover_url?: string;
  thematic_connection: string;
  why_now: string;
  rank: number;
}

// ─── Feedback & Preferences ──────────────────────────────────────────────────

export type FeedbackVote = "like" | "dislike";
export type DislikeReason =
  | "too_academic"
  | "too_commercial"
  | "already_read"
  | "wrong_tone"
  | "not_relevant";

export interface RecommendationFeedback {
  id: string;
  recommendation_id: string;
  session_id: string;
  user_id: string;
  vote: FeedbackVote;
  reason?: DislikeReason;
  created_at: string;
}

export interface UserPreferences {
  user_id: string;
  blocked_authors: string[];
  blocked_titles: string[];
  blocked_themes: string[];
  preferred_themes: string[];
  updated_at: string;
}

export interface FeedbackRequest {
  vote: FeedbackVote;
  reason?: DislikeReason;
}

export interface PreferencesPatchRequest {
  blocked_authors?: string[];
  blocked_titles?: string[];
  blocked_themes?: string[];
  preferred_themes?: string[];
}

// ─── Session Types ────────────────────────────────────────────────────────────

export interface ReadingSession {
  id: string;
  user_id: string;
  status: "active" | "completed";
  created_at: string;
  books?: Book[];
  recommendations?: Recommendation[];
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  display_name: string | null;
  intellectual_themes: string[] | null;
  emotional_context: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// ─── API Request / Response Types ────────────────────────────────────────────

export interface AnalyzeBooksRequest {
  books: Pick<Book, "title" | "author" | "goodreads_url">[];
  session_id: string;
}

export interface AnalyzeBooksResponse {
  intersection: ThematicIntersection;
  session_id: string;
}

export interface GenerateQuestionsRequest {
  intersection: ThematicIntersection;
  user_themes?: string[];
}

export interface GetRecommendationsRequest {
  intersection: ThematicIntersection;
  brain_dump: BrainDumpAnswer[];
  session_id: string;
  user_profile?: UserProfile;
}

export interface GetRecommendationsResponse {
  recommendations: Recommendation[];
  session_id: string;
}

// ─── Session Storage Keys ────────────────────────────────────────────────────

export const SESSION_KEYS = {
  BOOKS: "rf_books",
  SESSION_ID: "rf_session_id",
  INTERSECTION: "rf_intersection",
  QUESTIONS: "rf_questions",
  ANSWERS: "rf_answers",
  RECOMMENDATIONS: "rf_recommendations",
} as const;

export type SessionKey = (typeof SESSION_KEYS)[keyof typeof SESSION_KEYS];
