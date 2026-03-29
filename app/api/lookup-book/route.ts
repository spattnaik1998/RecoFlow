import { NextRequest, NextResponse } from "next/server";

const SERPER_API_URL = "https://google.serper.dev/search";

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
}

interface SerperResponse {
  organic?: SerperResult[];
  knowledgeGraph?: { description?: string; title?: string; attributes?: Record<string, string> };
}

/**
 * Parse a human-readable title from a Goodreads URL slug.
 * Handles both formats:
 *   /book/show/12345.The_Name_of_the_Rose
 *   /book/show/12345-the-name-of-the-rose
 */
function parseTitleSlug(url: string): string | null {
  try {
    const match = url.match(/\/book\/show\/\d+[.\-](.+?)(?:\?|$)/);
    if (!match) return null;
    return match[1]
      .replace(/[_\-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return null;
  }
}

/**
 * Extract the Goodreads numeric book ID from a URL.
 * /book/show/12345 or /book/show/12345.Title or /book/show/12345-title
 */
function parseBookId(url: string): string | null {
  const match = url.match(/\/book\/show\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * From a Goodreads search result title like:
 *   "The Name of the Rose by Umberto Eco | Goodreads"
 *   "1984 by George Orwell - Goodreads"
 * extract { title, author }.
 */
function parseFromResultTitle(
  resultTitle: string
): { title: string; author: string } | null {
  // Strip trailing site suffix
  const cleaned = resultTitle
    .replace(/\s*[|\-–]\s*Goodreads.*$/i, "")
    .trim();

  const byMatch = cleaned.match(/^(.+?)\s+by\s+(.+)$/i);
  if (!byMatch) return null;

  const title = byMatch[1].trim();
  const author = byMatch[2].trim();

  if (!title || !author) return null;
  return { title, author };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json() as { url: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    // Validate it looks like a Goodreads book URL
    if (!url.includes("goodreads.com/book/show/")) {
      return NextResponse.json(
        { error: "URL must be a Goodreads book page (goodreads.com/book/show/...)" },
        { status: 400 }
      );
    }

    const titleSlug = parseTitleSlug(url);
    const bookId = parseBookId(url);

    if (!bookId) {
      return NextResponse.json(
        { error: "Could not parse a book ID from this URL" },
        { status: 400 }
      );
    }

    // Build the best Serper query we can
    const query = titleSlug
      ? `"${titleSlug}" site:goodreads.com book`
      : `site:goodreads.com/book/show/${bookId}`;

    const serperRes = await fetch(SERPER_API_URL, {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 5 }),
    });

    if (!serperRes.ok) {
      throw new Error(`Serper error: ${serperRes.status}`);
    }

    const data = (await serperRes.json()) as SerperResponse;

    // Try to extract from knowledge graph first (highest confidence)
    if (data.knowledgeGraph?.title) {
      const parsed = parseFromResultTitle(data.knowledgeGraph.title);
      if (parsed) {
        return NextResponse.json({ ...parsed, goodreads_url: url });
      }
    }

    // Try organic results — prioritize results that link back to the Goodreads ID
    const organic = data.organic ?? [];
    for (const result of organic) {
      if (!result.link.includes("goodreads.com/book/show")) continue;
      const parsed = parseFromResultTitle(result.title);
      if (parsed) {
        return NextResponse.json({ ...parsed, goodreads_url: url });
      }
    }

    // Fallback: if we parsed a title from the slug but couldn't find an author,
    // return what we have with a flag so the client can display partial data
    if (titleSlug) {
      // Try to find an author in snippets via "by Author" pattern
      for (const result of organic) {
        const snippetMatch = result.snippet?.match(/\bby\s+([A-Z][a-z]+(?: [A-Z][a-z]+)+)/);
        if (snippetMatch) {
          return NextResponse.json({
            title: titleSlug,
            author: snippetMatch[1],
            goodreads_url: url,
          });
        }
      }

      // Partial — return title only, no author found
      return NextResponse.json({
        title: titleSlug,
        author: "",
        goodreads_url: url,
        partial: true,
      });
    }

    return NextResponse.json(
      { error: "Could not extract book information from this URL. Please enter the title and author manually." },
      { status: 422 }
    );
  } catch (err) {
    console.error("[lookup-book]", err);
    return NextResponse.json(
      { error: "Lookup failed. Please enter the title and author manually." },
      { status: 500 }
    );
  }
}
