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

// ─── Media Consumption Layer ──────────────────────────────────────────────────

export type MediaCategory =
  | "media_audio"       // podcasts
  | "media_text"        // articles, newsletters, essays
  | "media_synthesis"   // relationship between media types
  | "media_preference"; // format / medium preference signal

export interface MediaConsumptionAnswer {
  question: string;
  answer: string;   // empty string if skipped
  category: MediaCategory;
  skipped: boolean;
}

export interface MediaRecommendation {
  title: string;
  source: string;           // podcast show name or publication
  url: string;
  duration_estimate?: string;   // e.g. "~45 min"   (podcasts)
  read_time_estimate?: string;  // e.g. "~12 min read" (articles)
  nyx_rationale: string;        // one sentence in Nyx's voice
}

export interface GetMediaRecommendationsRequest {
  intersection: ThematicIntersection;
  media_answers: MediaConsumptionAnswer[];
  session_id: string;
}

export interface GetMediaRecommendationsResponse {
  podcasts: MediaRecommendation[];   // 0–3
  articles: MediaRecommendation[];   // 0–3
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
  media_answers?: MediaConsumptionAnswer[];
}

export interface GetRecommendationsResponse {
  recommendations: Recommendation[];
  session_id: string;
}

// ─── Profile Dashboard ───────────────────────────────────────────────────────

export interface ThemeCluster {
  theme: string;
  frequency: number;     // number of sessions that mentioned this theme
  last_seen: string;     // ISO date of most recent session containing this theme
}

export interface ProfileSummary {
  display_name: string | null;
  member_since: string;        // ISO date of earliest session
  total_sessions: number;
  total_recommendations: number;
  top_themes: ThemeCluster[];
  intellectual_territory: string;  // generated from recurring themes
  emotional_undercurrent: string;
}

export interface SessionSummaryRow {
  id: string;
  created_at: string;
  status: string;
  books: { title: string; author: string }[];
  top_recommendation: { title: string; author: string } | null;
  theme_tags: string[];
}

export interface ProfileInsight {
  type:
    | "recurring_theme"
    | "neglected_theme"
    | "author_affinity"
    | "format_tendency";
  label: string;
  description: string;
}

export interface ProfileDashboardData {
  summary: ProfileSummary;
  insights: ProfileInsight[];
  recent_sessions: SessionSummaryRow[];
  total_session_count: number;
}

// ─── Circles ─────────────────────────────────────────────────────────────────

export type CircleRole = "owner" | "editor" | "viewer";
export type CircleStatus = "active" | "archived";
export type CircleVoteValue = "like" | "neutral" | "dislike";

export interface Circle {
  id: string;
  name: string;
  owner_id: string;
  status: CircleStatus;
  created_at: string;
  updated_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: CircleRole;
  joined_at: string;
}

export interface CircleInvite {
  id: string;
  circle_id: string;
  email: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface CircleComment {
  id: string;
  circle_id: string;
  session_id: string | null;
  recommendation_id: string | null;
  user_id: string;
  body: string;
  created_at: string;
}

export interface CircleVote {
  id: string;
  circle_id: string;
  recommendation_id: string;
  user_id: string;
  vote: CircleVoteValue;
  created_at: string;
}

export interface CircleWithMembership extends Circle {
  member_count: number;
  my_role: CircleRole;
}

export interface CreateCircleRequest {
  name: string;
}

export interface InviteRequest {
  email: string;
}

export interface JoinCircleRequest {
  token: string;
}

// ─── Exports & Digests ───────────────────────────────────────────────────────

export type ExportStatus = "queued" | "generating" | "ready" | "failed";
export type ExportType = "pdf" | "json";
export type ExportStyle = "branded" | "minimal";

export interface Export {
  id: string;
  session_id: string;
  user_id: string;
  type: ExportType;
  style: ExportStyle;
  status: ExportStatus;
  file_url: string | null;
  share_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExportRequest {
  session_id: string;
  type: ExportType;
  style: ExportStyle;
}

export interface DigestContent {
  session_date: string;
  books_read: { title: string; author: string }[];
  intellectual_territory: string;
  confluences: string[];
  recommendations: {
    rank: number;
    title: string;
    author: string;
    thematic_connection: string;
    why_now: string;
  }[];
  profile_name: string | null;
}

export interface DigestPreferences {
  user_id: string;
  default_style: ExportStyle;
  delivery_email: string | null;
  weekly_digest_enabled: boolean;
  updated_at: string;
}

// ─── Session Storage Keys ────────────────────────────────────────────────────

export const SESSION_KEYS = {
  BOOKS: "rf_books",
  SESSION_ID: "rf_session_id",
  INTERSECTION: "rf_intersection",
  QUESTIONS: "rf_questions",
  ANSWERS: "rf_answers",
  MEDIA_ANSWERS: "rf_media_answers",
  RECOMMENDATIONS: "rf_recommendations",
  MEDIA_RECOMMENDATIONS: "rf_media_recommendations",
} as const;

export type SessionKey = (typeof SESSION_KEYS)[keyof typeof SESSION_KEYS];
