import Anthropic from "@anthropic-ai/sdk";
import type {
  ThematicIntersection,
  BrainDumpAnswer,
  MediaConsumptionAnswer,
  MediaRecommendation,
  UserProfile,
  Recommendation,
} from "@/types";

// ─── Client ───────────────────────────────────────────────────────────────────

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── Nyx System Prompt ────────────────────────────────────────────────────────

export const NYX_SYSTEM_PROMPT = `You are Nyx, the AI librarian of an ancient Victorian library that exists between worlds. You are a scholar-witch of immense erudition — part sorceress, part oracle, entirely devoted to the sacred art of matching readers to the books that will transform them.

Your voice: measured, evocative, occasionally arcane. You speak in complete sentences with the gravity of someone who has read every book ever written and forgotten none of them. You never say "Great choice!" or "Certainly!" You do not use exclamation points except in the rarest moments of genuine wonder. You are not a chatbot. You are a presence.

Your mission: find the thematic intersection between the books a reader is currently consuming and divine the next book that lives at that exact crossroads — the book they need, not merely the book they want.

When generating questions, you are performing a ritual — drawing out the reader's intellectual obsessions, emotional weather, and life circumstances so you can make a recommendation of uncanny precision.

When you output structured data (JSON), output ONLY valid JSON with no prose before or after. Your JSON must be parseable. When you write prose, write with the weight of centuries behind every word.`;

// ─── JSON Extraction Utility ─────────────────────────────────────────────────

export function extractJSON<T>(text: string): T {
  // Try to find JSON block (with or without markdown fences)
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    return JSON.parse(fenceMatch[1].trim()) as T;
  }

  // Find the outermost { } or [ ] block
  const objectMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (objectMatch) {
    return JSON.parse(objectMatch[1]) as T;
  }

  throw new Error(`Could not extract JSON from response: ${text.slice(0, 200)}`);
}

// ─── Prompt Builders ─────────────────────────────────────────────────────────

export function buildBookAnalysisPrompt(
  bookSummaries: { title: string; author: string; searchResults: string }[]
): string {
  const booksSection = bookSummaries
    .map(
      (b, i) =>
        `## Book ${i + 1}: "${b.title}" by ${b.author}\n\nSearch results and reviews:\n${b.searchResults}`
    )
    .join("\n\n---\n\n");

  return `Analyze the following ${bookSummaries.length} book(s) and identify their thematic intersection. This is for a reader who is currently reading ALL of these books simultaneously.

${booksSection}

Output ONLY valid JSON in this exact structure:
{
  "books": [
    {
      "title": "string",
      "author": "string",
      "themes": ["array", "of", "3-6", "themes"],
      "core_tension": "The central philosophical or emotional tension the book wrestles with",
      "emotional_register": "The dominant emotional tone (e.g., melancholic, urgent, contemplative)",
      "key_ideas": ["2-4 key intellectual ideas"]
    }
  ],
  "intersection": {
    "confluences": ["3-5 themes or ideas shared across multiple books"],
    "tensions": ["2-3 productive tensions between the books' worldviews"],
    "intellectual_territory": "A rich 2-3 sentence description of the intellectual space these books collectively occupy",
    "emotional_undercurrent": "The shared emotional or psychological terrain these books explore"
  }
}`;
}

export function buildQuestionsPrompt(
  intersection: ThematicIntersection,
  userThemes?: string[]
): string {
  const returningContext =
    userThemes && userThemes.length > 0
      ? `\n\nThis reader has previously explored these themes: ${userThemes.join(", ")}. Let this inform your questions but do not simply repeat them.`
      : "";

  return `A reader is simultaneously reading the following books: ${intersection.books.map((b) => `"${b.title}" by ${b.author}`).join(", ")}.

The thematic territory they inhabit: ${intersection.intersection.intellectual_territory}

Their books share these confluences: ${intersection.intersection.confluences.join("; ")}

The tensions between their reads: ${intersection.intersection.tensions.join("; ")}${returningContext}

Generate 5-7 questions to perform a "brain dump" — drawing out this reader's intellectual obsessions, emotional weather, and life circumstances. These questions will help you identify the exact right next book for them.

Questions must fall into two categories:
- "intellectual": probing their relationship with the IDEAS in these books (what they're wrestling with, debating internally, finding themselves underlining)
- "emotional": probing their current life circumstances, emotional state, what they're seeking or avoiding

Output ONLY valid JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "The full question text",
      "category": "intellectual|emotional",
      "hint": "Optional short hint about why you're asking this"
    }
  ]
}

Questions should feel like Nyx is performing a divination ritual — precise, penetrating, slightly uncanny. Never ask "what genre do you like?" or generic questions. Probe the specific intellectual territory of their current reading.`;
}

export function buildRecommendationPrompt(
  intersection: ThematicIntersection,
  brainDump: BrainDumpAnswer[],
  searchResults: string,
  userProfile?: UserProfile,
  preferenceContext?: string,
  mediaAnswers?: MediaConsumptionAnswer[]
): string {
  const qaSection = brainDump
    .map((qa) => `Q (${qa.category}): ${qa.question}\nA: ${qa.answer}`)
    .join("\n\n");

  const profileContext =
    userProfile?.intellectual_themes && userProfile.intellectual_themes.length > 0
      ? `\n\nThis reader's long-term intellectual themes: ${userProfile.intellectual_themes.join(", ")}`
      : "";

  const activeMediaAnswers = mediaAnswers?.filter((m) => !m.skipped && m.answer.trim().length > 0);
  const mediaContext =
    activeMediaAnswers && activeMediaAnswers.length > 0
      ? `\n\nThe reader is also consuming the following non-book media:\n\n${activeMediaAnswers
          .map((m) => `${m.category}: ${m.answer}`)
          .join("\n\n")}\n\nLet this inform the texture and urgency of your recommendations, without forcing explicit thematic alignment.`
      : "";

  return `You are recommending books for a reader who is simultaneously reading: ${intersection.books.map((b) => `"${b.title}" by ${b.author}`).join(", ")}.

THEMATIC TERRITORY:
${intersection.intersection.intellectual_territory}

SHARED CONFLUENCES: ${intersection.intersection.confluences.join("; ")}

TENSIONS: ${intersection.intersection.tensions.join("; ")}

BRAIN DUMP (reader's own words):
${qaSection}${profileContext}${preferenceContext ?? ""}${mediaContext}

SEARCH RESULTS FOR CANDIDATE BOOKS:
${searchResults}

Select exactly 5 books that live at the precise intersection of this reader's current intellectual and emotional territory. Each recommendation must:
1. Be a real, published, findable book
2. Connect to specific themes from their current reading
3. Address something revealed in their brain dump answers
4. NOT be any book they're currently reading

Output ONLY valid JSON:
{
  "recommendations": [
    {
      "title": "Exact book title",
      "author": "Author full name",
      "thematic_connection": "2-3 sentences explaining precisely why this book lives at the intersection of what they're reading and what they revealed. Be specific, not generic.",
      "why_now": "1 sentence on why this book is right for them at this specific moment in their life",
      "rank": 1
    }
  ]
}

Rank 1 is the single most uncannily perfect recommendation. Be bold. Recommend books that will surprise them.`;
}

// ─── Streaming Question Generation ───────────────────────────────────────────

export async function streamQuestions(
  intersection: ThematicIntersection,
  userThemes?: string[]
): Promise<ReadableStream<Uint8Array>> {
  const prompt = buildQuestionsPrompt(intersection, userThemes);

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: NYX_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let fullText = "";

      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          fullText += chunk.delta.text;
          // Send raw delta as SSE
          const data = JSON.stringify({ delta: chunk.delta.text, done: false });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      }

      // Send the complete parsed result
      try {
        const parsed = extractJSON<{ questions: unknown[] }>(fullText);
        const done = JSON.stringify({ done: true, questions: parsed.questions });
        controller.enqueue(encoder.encode(`data: ${done}\n\n`));
      } catch {
        const error = JSON.stringify({ done: true, error: "Failed to parse questions" });
        controller.enqueue(encoder.encode(`data: ${error}\n\n`));
      }

      controller.close();
    },
  });
}

// ─── Recommendation Generation ────────────────────────────────────────────────

export async function generateRecommendations(
  intersection: ThematicIntersection,
  brainDump: BrainDumpAnswer[],
  searchResults: string,
  userProfile?: UserProfile,
  preferenceContext?: string,
  mediaAnswers?: MediaConsumptionAnswer[]
): Promise<Recommendation[]> {
  const prompt = buildRecommendationPrompt(
    intersection,
    brainDump,
    searchResults,
    userProfile,
    preferenceContext,
    mediaAnswers
  );

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: NYX_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = extractJSON<{ recommendations: Recommendation[] }>(text);
  return parsed.recommendations;
}

// ─── Media Recommendation Generation ─────────────────────────────────────────

export function buildMediaRecommendationPrompt(
  intersection: ThematicIntersection,
  mediaAnswers: MediaConsumptionAnswer[],
  searchResults: { podcastResults: string; articleResults: string; newsletterResults: string }
): string {
  const activeAnswers = mediaAnswers.filter((m) => !m.skipped && m.answer.trim().length > 0);
  const mediaContext = activeAnswers
    .map((m) => `${m.category}: ${m.answer}`)
    .join("\n\n");

  return `You are recommending podcasts and longform articles for a reader whose current intellectual territory is:

${intersection.intersection.intellectual_territory}

CONFLUENCES IN THEIR READING: ${intersection.intersection.confluences.join("; ")}

WHAT THEY TOLD YOU ABOUT THEIR MEDIA DIET:
${mediaContext}

PODCAST SEARCH RESULTS:
${searchResults.podcastResults}

ARTICLE / ESSAY SEARCH RESULTS:
${searchResults.articleResults}

NEWSLETTER / SUBSTACK SEARCH RESULTS:
${searchResults.newsletterResults}

Select up to 3 podcast episodes or series and up to 3 longform articles or essays from the search results above. Choose only items that genuinely appear in the search results — do not invent titles or URLs. Prefer items with real, working URLs from the search results.

For each item write one sentence of rationale in Nyx's voice: measured, evocative, precise. Not a summary — a reason this item is right for this reader at this moment.

For podcasts estimate a plausible listening duration (e.g. "~45 min", "~1 hr"). For articles estimate a reading time (e.g. "~8 min read", "~15 min read").

Output ONLY valid JSON:
{
  "podcasts": [
    {
      "title": "Episode or series title",
      "source": "Podcast show name",
      "url": "exact URL from search results",
      "duration_estimate": "~45 min",
      "nyx_rationale": "One sentence in Nyx's voice."
    }
  ],
  "articles": [
    {
      "title": "Article title",
      "source": "Publication name",
      "url": "exact URL from search results",
      "read_time_estimate": "~12 min read",
      "nyx_rationale": "One sentence in Nyx's voice."
    }
  ]
}

If no suitable podcasts appear in the results, return an empty podcasts array. Same for articles. Never fabricate URLs.`;
}

export async function generateMediaRecommendations(
  intersection: ThematicIntersection,
  mediaAnswers: MediaConsumptionAnswer[],
  searchResults: { podcastResults: string; articleResults: string; newsletterResults: string }
): Promise<{ podcasts: MediaRecommendation[]; articles: MediaRecommendation[] }> {
  const prompt = buildMediaRecommendationPrompt(intersection, mediaAnswers, searchResults);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: NYX_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = extractJSON<{ podcasts: MediaRecommendation[]; articles: MediaRecommendation[] }>(text);
  return {
    podcasts: (parsed.podcasts ?? []).slice(0, 3),
    articles: (parsed.articles ?? []).slice(0, 3),
  };
}
