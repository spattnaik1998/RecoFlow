const SERPER_API_URL = "https://google.serper.dev/search";

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  position?: number;
}

interface SerperResponse {
  organic?: SerperResult[];
  answerBox?: { answer?: string; snippet?: string; title?: string };
  knowledgeGraph?: { description?: string; title?: string };
}

export async function searchWeb(query: string, num = 5): Promise<string> {
  const response = await fetch(SERPER_API_URL, {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as SerperResponse;

  const parts: string[] = [];

  if (data.answerBox?.snippet) {
    parts.push(`Answer: ${data.answerBox.snippet}`);
  }
  if (data.knowledgeGraph?.description) {
    parts.push(`Overview: ${data.knowledgeGraph.description}`);
  }

  const organic = data.organic ?? [];
  for (const result of organic.slice(0, num)) {
    parts.push(`[${result.title}]\n${result.snippet}\n(${result.link})`);
  }

  return parts.join("\n\n");
}

export async function searchBook(title: string, author: string): Promise<string> {
  const query = `"${title}" "${author}" themes summary goodreads review`;
  return searchWeb(query, 8);
}

export async function searchMediaAtIntersection(
  intellectualTerritory: string,
  confluences: string[]
): Promise<{ podcastResults: string; articleResults: string; newsletterResults: string }> {
  const territory = intellectualTerritory.slice(0, 80);
  const firstConfluence = (confluences[0] ?? territory).slice(0, 60);

  const queries = [
    `(site:open.spotify.com OR site:podcasts.apple.com) ${territory} podcast episode`,
    `(site:longreads.com OR site:aeon.co OR site:theatlantic.com OR site:newyorker.com) ${territory}`,
    `site:substack.com ${firstConfluence}`,
  ];

  const [podcastResults, articleResults, newsletterResults] = await Promise.all(
    queries.map((q) => searchWebRecent(q, 5))
  );

  return { podcastResults, articleResults, newsletterResults };
}

async function searchWebRecent(query: string, num = 5): Promise<string> {
  const response = await fetch(SERPER_API_URL, {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num, tbs: "qdr:y" }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as SerperResponse;

  const parts: string[] = [];
  const organic = data.organic ?? [];
  for (const result of organic.slice(0, num)) {
    parts.push(`[${result.title}]\n${result.snippet}\n(${result.link})`);
  }
  return parts.join("\n\n") || "(no results)";
}

export async function searchBooksAtIntersection(
  themes: string[],
  intellectualTerritory: string
): Promise<string> {
  // Run 3 targeted searches in parallel
  const queries = [
    `books about "${themes.slice(0, 2).join('" and "')}" literary fiction recommendation`,
    `best books "${intellectualTerritory.slice(0, 60)}" novel nonfiction`,
    `books similar "${themes[0]}" themes goodreads must-read`,
  ];

  const results = await Promise.all(queries.map((q) => searchWeb(q, 5)));
  return results.join("\n\n=== ===\n\n");
}
