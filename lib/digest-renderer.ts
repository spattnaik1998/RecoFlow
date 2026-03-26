import type { SupabaseClient } from "@supabase/supabase-js";
import type { DigestContent, ExportStyle } from "@/types";

// ─── Content Builder ─────────────────────────────────────────────────────────

export async function buildDigestContent(
  sessionId: string,
  supabase: SupabaseClient
): Promise<DigestContent> {
  const [sessionRes, booksRes, recsRes] = await Promise.all([
    supabase
      .from("reading_sessions")
      .select("id, created_at, user_id")
      .eq("id", sessionId)
      .single(),
    supabase
      .from("current_books")
      .select("title, author")
      .eq("session_id", sessionId),
    supabase
      .from("recommendations")
      .select("rank, title, author, thematic_connection")
      .eq("session_id", sessionId)
      .order("rank"),
  ]);

  const session = sessionRes.data;
  if (!session) throw new Error(`Session ${sessionId} not found`);

  // Fetch user profile for display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", session.user_id)
    .single();

  // Fetch intersection data (stored in current_books raw_analysis or profiles)
  // Use themes from books as stand-in for confluences
  const { data: booksWithAnalysis } = await supabase
    .from("current_books")
    .select("themes, raw_analysis")
    .eq("session_id", sessionId);

  const confluences: string[] = Array.from(
    new Set(
      (booksWithAnalysis ?? []).flatMap(
        (b: { themes: string[] | null }) => b.themes ?? []
      )
    )
  ).slice(0, 5);

  // intellectual_territory from raw_analysis if available
  let intellectual_territory = "";
  for (const b of booksWithAnalysis ?? []) {
    const ra = b.raw_analysis as {
      intersection?: { intellectual_territory?: string };
    } | null;
    if (ra?.intersection?.intellectual_territory) {
      intellectual_territory = ra.intersection.intellectual_territory;
      break;
    }
  }
  if (!intellectual_territory && confluences.length > 0) {
    intellectual_territory = `A convergence of ${confluences.slice(0, 3).join(", ")}.`;
  }

  const recs = recsRes.data ?? [];

  return {
    session_date: session.created_at,
    books_read: (booksRes.data ?? []).map((b: { title: string; author: string }) => ({
      title: b.title,
      author: b.author,
    })),
    intellectual_territory,
    confluences,
    recommendations: recs.map(
      (r: {
        rank: number;
        title: string;
        author: string;
        thematic_connection: string;
      }) => ({
        rank: r.rank,
        title: r.title,
        author: r.author,
        thematic_connection: r.thematic_connection,
        why_now: "", // why_now is not persisted to DB, omit gracefully
      })
    ),
    profile_name: profile?.display_name ?? null,
  };
}

// ─── Share ID Generator ──────────────────────────────────────────────────────

export function generateShareId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

// ─── HTML Renderer ───────────────────────────────────────────────────────────

export function renderDigestHTML(content: DigestContent, style: ExportStyle): string {
  const date = new Date(content.session_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isBranded = style === "branded";

  const GOTHIC_PALETTE = {
    bg: "#0D0A07",
    gold: "#C8A96E",
    parchment: "#E8D5B7",
    parchmentDim: "rgba(232,213,183,0.7)",
    goldDim: "rgba(200,169,110,0.5)",
    border: "rgba(200,169,110,0.2)",
    section: "rgba(200,169,110,0.04)",
  };

  const MINIMAL_PALETTE = {
    bg: "#FAFAF8",
    gold: "#6B5B3E",
    parchment: "#1A1A1A",
    parchmentDim: "#4A4A4A",
    goldDim: "#8B7340",
    border: "#D0C8B8",
    section: "#F5F3EF",
  };

  const p = isBranded ? GOTHIC_PALETTE : MINIMAL_PALETTE;
  const bodyFont = isBranded
    ? "Georgia, 'IM Fell English', serif"
    : "Georgia, serif";
  const headingFont = isBranded
    ? "'Cinzel Decorative', 'Palatino Linotype', serif"
    : "Georgia, serif";

  const booksHtml = content.books_read
    .map(
      (b) =>
        `<li style="margin-bottom:6px;font-style:italic;color:${p.parchmentDim}">&ldquo;${escapeHtml(b.title)}&rdquo; <span style="color:${p.goldDim}">by ${escapeHtml(b.author)}</span></li>`
    )
    .join("");

  const recsHtml = content.recommendations
    .map(
      (r, i) => `
    <div style="margin-bottom:24px;padding:16px;border:1px solid ${p.border};background:${p.section}">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
        <span style="font-family:${headingFont};font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${p.goldDim}">
          ${getRankLabel(i + 1)}
        </span>
        <span style="font-family:${headingFont};font-size:18px;color:${p.goldDim}">${getRomanNumeral(i + 1)}</span>
      </div>
      <p style="margin:0 0 4px;font-family:${headingFont};font-size:16px;color:${p.parchment}">${escapeHtml(r.title)}</p>
      <p style="margin:0 0 12px;font-style:italic;color:${p.goldDim};font-size:13px">${escapeHtml(r.author)}</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:${p.parchmentDim}">${escapeHtml(r.thematic_connection)}</p>
    </div>`
    )
    .join("");

  const confluencesHtml =
    content.confluences.length > 0
      ? content.confluences
          .map(
            (c) =>
              `<span style="display:inline-block;margin:3px;padding:3px 10px;border:1px solid ${p.border};font-style:italic;font-size:12px;color:${p.goldDim}">${escapeHtml(c)}</span>`
          )
          .join("")
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RecoFlow — Consultation ${date}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    * { box-sizing: border-box; }
    body {
      font-family: ${bodyFont};
      background: ${p.bg};
      color: ${p.parchment};
      margin: 0;
      padding: 0;
    }
    .container { max-width: 680px; margin: 0 auto; padding: 48px 32px; }
    .gold-line { height: 1px; background: linear-gradient(to right, transparent, ${p.gold}, transparent); margin: 24px 0; }
    a { color: ${p.gold}; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px">
      ${isBranded ? `<p style="font-family:${headingFont};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${p.goldDim};margin-bottom:8px">RecoFlow — The Library of Nyx</p>` : ""}
      <h1 style="font-family:${headingFont};font-size:${isBranded ? "24px" : "20px"};color:${p.gold};margin:0 0 8px;font-weight:normal">
        Consultation Chronicle
      </h1>
      <p style="font-size:12px;color:${p.goldDim};letter-spacing:0.05em">${date}${content.profile_name ? ` &mdash; ${escapeHtml(content.profile_name)}` : ""}</p>
    </div>
    <div class="gold-line"></div>

    <!-- Books -->
    <div style="margin-bottom:32px">
      <p style="font-family:${headingFont};font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${p.goldDim};margin-bottom:12px">Currently Reading</p>
      <ul style="list-style:none;padding:0;margin:0">${booksHtml}</ul>
    </div>

    <!-- Intellectual Territory -->
    ${
      content.intellectual_territory
        ? `
    <div style="margin-bottom:32px;padding:16px;border:1px solid ${p.border};background:${p.section}">
      <p style="font-family:${headingFont};font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${p.goldDim};margin-bottom:8px">Intellectual Territory</p>
      <p style="font-style:italic;color:${p.parchmentDim};line-height:1.7;margin:0">${escapeHtml(content.intellectual_territory)}</p>
    </div>`
        : ""
    }

    <!-- Confluences -->
    ${
      confluencesHtml
        ? `
    <div style="margin-bottom:32px">
      <p style="font-family:${headingFont};font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${p.goldDim};margin-bottom:12px">Thematic Confluences</p>
      <div>${confluencesHtml}</div>
    </div>`
        : ""
    }

    <div class="gold-line"></div>

    <!-- Recommendations -->
    <div style="margin-bottom:40px">
      <p style="font-family:${headingFont};font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${p.goldDim};margin-bottom:20px">Nyx's Recommendations</p>
      ${recsHtml}
    </div>

    <div class="gold-line"></div>

    <!-- Footer CTA -->
    <div class="no-print" style="text-align:center;margin-top:32px">
      <p style="font-size:12px;color:${p.goldDim}">
        Begin your own consultation at <a href="https://recoflow.app">RecoFlow</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getRomanNumeral(n: number): string {
  return ["I", "II", "III", "IV", "V"][n - 1] ?? String(n);
}

function getRankLabel(n: number): string {
  return (
    [
      "The Oracle's Choice",
      "Second Sight",
      "The Hidden Path",
      "The Fourth Mirror",
      "The Final Augury",
    ][n - 1] ?? `Recommendation ${n}`
  );
}
