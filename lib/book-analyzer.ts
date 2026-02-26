import { anthropic, NYX_SYSTEM_PROMPT, buildBookAnalysisPrompt, extractJSON } from "./anthropic";
import { searchBook } from "./serper";
import type { Book, ThematicIntersection } from "@/types";

export async function analyzeBooks(books: Pick<Book, "title" | "author" | "goodreads_url">[]): Promise<ThematicIntersection> {
  if (books.length === 0) {
    throw new Error("At least one book is required for analysis");
  }

  // Step 1: Parallel Serper searches for each book
  const searchResults = await Promise.all(
    books.map(async (book) => {
      try {
        const results = await searchBook(book.title, book.author || "");
        return {
          title: book.title,
          author: book.author || "Unknown",
          searchResults: results,
        };
      } catch (err) {
        console.error(`Search failed for "${book.title}":`, err);
        return {
          title: book.title,
          author: book.author || "Unknown",
          searchResults: `Book: "${book.title}" by ${book.author || "Unknown Author"}`,
        };
      }
    })
  );

  // Step 2: Single Claude call with ALL books together
  const prompt = buildBookAnalysisPrompt(searchResults);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: NYX_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const intersection = extractJSON<ThematicIntersection>(text);

  return intersection;
}
