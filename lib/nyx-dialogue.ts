// ─── Nyx Dialogue Strings ────────────────────────────────────────────────────
// All static dialogue. Nyx's voice: measured, evocative, arcane.
// No exclamation points except in genuine wonder.

export const NYX_DIALOGUE = {
  // Landing
  landing_greeting:
    "I have been expecting you. The dust on these shelves holds the memory of every reader who passed through — and the ghost of every book they were meant to read but never found.",

  landing_invitation:
    "Tell me what you are reading. Not what you have read, not what you wish to read — what is open on your nightstand, on your phone, in the margins of your days. From the intersection of those worlds, I will find your next.",

  landing_cta: "Enter the Library",

  // Auth
  auth_sign_in_header: "The Librarian Recognizes You",
  auth_sign_in_subtitle: "Sign your name in the ledger and step inside.",
  auth_sign_up_header: "A New Name for the Ledger",
  auth_sign_up_subtitle:
    "No one finds this library by accident. You are here because you are ready.",
  auth_email_placeholder: "Your correspondence address",
  auth_password_placeholder: "Your cipher key",
  auth_confirm_placeholder: "Confirm your cipher",
  auth_signing_in: "Consulting the ledger...",
  auth_signing_up: "Inscribing your name...",

  // Book Entry
  enter_header: "What Do You Currently Read?",
  enter_subtitle:
    "Name the books open before you — as many as three, as few as one. I require not your past but your present.",
  enter_placeholder_title: "Title",
  enter_placeholder_author: "Author",
  enter_placeholder_url: "Goodreads URL (optional)",
  enter_add_book: "Add another volume",
  enter_submit: "Lay them on the altar",
  enter_analyzing: "The pages whisper to each other...",

  // Session / Analysis
  analysis_header: "Reading the Confluence",
  analysis_subtitle:
    "I am tracing the invisible threads that bind your books to one another. This requires patience.",
  analysis_step1: "Consulting the great catalogues...",
  analysis_step2: "Mapping your thematic territory...",
  analysis_step3: "I see something forming in the confluence...",

  // Questions Phase
  questions_header: "A Brief Divination",
  questions_subtitle:
    "Before I can name your next book, I must understand not just what you read but who you are in this particular season of your mind.",
  questions_thinking: "Nyx deliberates...",
  questions_next: "Continue",
  questions_submit: "The ritual is complete",

  // Recommendation Reveal
  recs_header: "The Library Speaks",
  recs_subtitle:
    "Five books have emerged from the confluence. I have ranked them by the precision of their fit. The first is the one I would stake my reputation upon.",
  recs_loading: "Consulting the oracle...",
  recs_reveal_delay_ms: 1800,

  // Library / History
  library_header: "Your Reading History",
  library_subtitle:
    "Every session leaves a trace in the stacks. Here are your previous consultations with the library.",
  library_empty:
    "Your history with this library is yet unwritten. Return after your first consultation.",
  library_session_prefix: "Consultation from",

  // Errors
  error_analysis: "The texts resisted my reading. Please try again.",
  error_questions: "The confluence clouded my sight. Please try again.",
  error_recommendations:
    "The library's depths did not yield a clear answer. Let us try once more.",
  error_generic: "Something in the library shifted unexpectedly.",

  // Loading states
  loading_books: "Searching the great catalogues...",
  loading_themes: "Tracing the thematic threads...",
  loading_intersection: "Mapping the confluence of your reads...",
  loading_questions: "Formulating the divination...",
  loading_recommendations: "The oracle deliberates...",
};

// ─── Dynamic Dialogue Builders ───────────────────────────────────────────────

export function nyxGreetReturning(displayName: string | null): string {
  const name = displayName ? `, ${displayName}` : "";
  return `You have returned${name}. The shelves remember you. Tell me what you have been reading in your absence.`;
}

export function nyxAnalysisResult(intellectualTerritory: string): string {
  return `I see it now — ${intellectualTerritory}. This is the territory you are traversing. Now tell me who you are within it.`;
}

export function nyxRevealIntro(count: number): string {
  if (count === 5) {
    return "Five books have surfaced from the depths. Each was chosen because it lives at the precise intersection of what you are reading and what you are becoming.";
  }
  return `${count} book${count !== 1 ? "s have" : " has"} surfaced from the depths.`;
}

export function nyxQuestionTransition(questionIndex: number, total: number): string {
  const remaining = total - questionIndex;
  if (remaining > 3) return "Continue.";
  if (remaining === 3) return "We are nearly there.";
  if (remaining === 2) return "One more territory to map.";
  return "Final question.";
}
