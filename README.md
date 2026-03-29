# RecoFlow

**Intelligence-driven book recommendations for readers who think deeply.**

RecoFlow analyzes the hidden thematic intersections across everything you're currently reading, then — through a guided conversation with Nyx, an AI research companion — surfaces exactly what you should read next. Every session builds a long-term portrait of your intellectual life.

---

## How it works

Most recommendation engines look backward at what you've read. RecoFlow asks something more interesting: **what are you thinking about right now?**

1. **Enter your books** — add up to 5 titles you're currently reading
2. **Nyx analyzes** — parallel web searches gather metadata; Claude finds the thematic confluences, tensions, and emotional undercurrents connecting your reads
3. **Introspective questions** — Nyx asks personalized questions drawn from your reading's intersection, streamed live
4. **Media layer** — optional questions about podcasts, articles, and essays you're consuming that enrich the analysis
5. **Recommendations** — ranked results with thematic reasoning, plus podcast and article suggestions when media answers are provided
6. **Reading DNA** — your profile accumulates over time: theme constellation, temporal drift map, Nyx's prose portrait of your intellectual life

---

## User flow

```
/ → /auth → /enter → /session → /recommendations → /library
                                                  → /profile
```

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth` | Sign up / sign in (Supabase email auth) |
| `/enter` | Book entry form; optional "fresh recommendations" mood toggle |
| `/session` | 5-phase AI session: analyze → questions (SSE) → brain dump → media layer → generate |
| `/recommendations` | Ranked book recommendations + podcast/article panels; preference suggestion card |
| `/library` | Full history of past sessions with expandable details and export |
| `/profile` | Reading DNA: Nyx portrait, theme constellation, temporal drift map, insights, session history |
| `/preferences` | Manage blocked authors, titles, themes; preferred authors |
| `/circles` | Shared reading circles — collaborate with others on recommendations |
| `/circles/[id]` | Circle detail: shared sessions, member votes, comments |

---

## Features

### AI analysis pipeline

The recommendation pipeline runs in five sequential phases within `/session`:

**Phase 1 — Book entry**
User submits 1–5 books currently being read.

**Phase 2 — Thematic intersection analysis**
- Parallel Serper searches gather metadata per book
- Single Claude synthesis call produces a `ThematicIntersection`:
  - Shared thematic confluences
  - Productive tensions and contradictions
  - Intellectual territory
  - Emotional undercurrent

**Phase 3 — Introspective questions (SSE streaming)**
- Claude generates personalized questions from the intersection
- Questions stream in real-time; returning users have their historical themes woven in
- BrainDump interface collects free-form answers

**Phase 4 — Media consumption layer**
- 2–4 Nyx-voiced questions about podcasts, articles, and essays the user is consuming
- Answers are skippable; active answers enrich the recommendation prompt
- Conditional question logic: Q3/Q4 only appear when Q1/Q2 show substantive media consumption

**Phase 5 — Recommendation generation**
- Three parallel Serper searches find candidate books at the thematic intersection
- Claude ranks candidates against the intersection, brain dump answers, and media context
- User preferences (blocked authors/themes, preferred authors) are applied
- Results persisted to Supabase; user's intellectual profile updated

### Cross-media recommendations

When media answers are provided, a parallel call to `/api/get-media-recommendations` surfaces:
- Up to 3 podcast episodes (Spotify, Apple Podcasts)
- Up to 3 longform articles (Longreads, Aeon, The Atlantic, The New Yorker, Substack)

Each item includes a Nyx-voiced rationale. These appear as collapsible panels on the recommendations page.

### Reading DNA

The `/profile` page builds over time with three visualizations:

**Nyx's portrait** — a 120-word prose reading of your intellectual character, regenerated whenever a new session completes.

**Theme constellation** — a D3 force-directed graph where nodes are recurring themes sized by frequency, colored by recency (dark blue → gold), and linked by co-occurrence across sessions. Click a node to filter the timeline.

**Temporal drift map** — a Recharts scatter plot showing how your themes have shifted over time. Each point is a session; the Y-axis shows theme names, the X-axis shows date. Responds to the constellation's theme filter.

### Adaptive preference refinement

Nyx learns from feedback across sessions using a temporal decay model:

- Every like/dislike writes to a `preference_signals` table with a `weight` of 1.0
- `/api/preferences/learn` applies `0.95^days` decay and aggregates weighted signal counts
- When a dislike reason exceeds a threshold (2.5 decayed weight), a Nyx-voiced suggestion card appears on the recommendations page — "Yes, adjust" patches the user's preferences; "Not now" dismisses
- Like signals from the same author accumulate into `preferred_authors`, boosting similar voices in future prompts
- The `/enter` page offers a "In a different mood today?" toggle that bypasses all learned preferences for one session

### Recommendation feedback

Each recommendation card supports like/dislike voting. Dislike accepts a reason:
- `too_academic` → eventually suggests blocking academic-theory recommendations
- `too_commercial` → eventually suggests blocking commercial-mainstream recommendations
- `already_read` → immediately and permanently blocks that title
- `wrong_tone` / `not_relevant` → informational signal, informs Nyx's portrait

### Shared reading circles

Teams or reading groups can share sessions and vote on recommendations together:
- Create a circle and invite members by email
- Sessions can be scoped to a circle (visible to all members)
- Members vote on recommendations (`like` / `neutral` / `dislike`) and leave comments
- The library filters by active circle

### Exports and digests

Completed sessions can be exported as:
- **PDF** — branded or minimal style
- **JSON** — full structured data for integrations

Exports are generated asynchronously and fetched via a shareable download URL. A weekly digest preference can be configured per user.

---

## Architecture

### Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Animations | Framer Motion |
| Charts | D3 v7 (constellation), Recharts (drift map) |
| AI | Anthropic Claude Sonnet 4.6 |
| Search | Serper API |
| Database / Auth | Supabase (PostgreSQL + Supabase Auth) |
| Deployment | Vercel |

### Project structure

```
app/
├── page.tsx                          # Landing
├── layout.tsx                        # Root layout (NavBar, fonts, metadata)
├── globals.css                       # Design tokens (CSS vars), component classes
├── auth/
│   ├── page.tsx
│   └── callback/route.ts
├── enter/page.tsx                    # Book entry + mood toggle
├── session/page.tsx                  # 5-phase session
├── recommendations/page.tsx          # Results + media panels + preference suggestion
├── library/
│   ├── page.tsx
│   └── LibraryClient.tsx
├── profile/
│   ├── page.tsx
│   ├── ProfileClient.tsx
│   └── InsightCards.tsx
├── preferences/page.tsx
├── circles/
│   ├── page.tsx
│   └── [id]/page.tsx
└── api/
    ├── analyze-books/route.ts
    ├── generate-questions/route.ts
    ├── get-recommendations/route.ts
    ├── get-media-recommendations/route.ts
    ├── search-books/route.ts
    ├── preferences/
    │   ├── route.ts                  # GET / PATCH user preferences
    │   └── learn/route.ts            # Temporal decay + suggestion generation
    ├── recommendations/[id]/
    │   ├── feedback/route.ts
    │   └── vote/route.ts
    ├── profile/
    │   ├── route.ts
    │   ├── portrait/route.ts
    │   ├── insights/route.ts
    │   └── sessions/route.ts
    ├── exports/
    │   └── [id]/route.ts
    ├── circles/
    │   └── [id]/route.ts
    └── sessions/[id]/share/route.ts

lib/
├── anthropic.ts              # Claude client, NYX_SYSTEM_PROMPT, all prompt builders
├── book-analyzer.ts          # Parallel Serper fetch → Claude intersection synthesis
├── recommendation-engine.ts  # Candidate search → Claude ranking
├── preference-engine.ts      # getUserPreferences, buildPreferenceContext, applyPreferenceFilter
├── nyx-dialogue.ts           # All static Nyx character strings (MEDIA, NYX_DIALOGUE)
├── serper.ts                 # searchBook, searchBooksAtIntersection, searchMediaAtIntersection
└── supabase/
    ├── client.ts             # Browser-side Supabase client
    └── server.ts             # Server-side + service role clients

components/
├── NavBar.tsx
├── BookEntry.tsx
├── BrainDump.tsx
├── RecommendationReveal.tsx
├── ThemeConstellation.tsx    # D3 force-directed theme graph
├── TemporalDriftMap.tsx      # Recharts scatter timeline
├── ExportPanel.tsx
├── CircleSwitcher.tsx
├── Nyx.tsx
└── TypewriterText.tsx

types/index.ts                # All shared types + SESSION_KEYS
proxy.ts                      # Auth middleware (Next.js 16 — not middleware.ts)
vercel.json                   # 60s timeouts for AI routes
supabase/migrations/          # SQL migration files
```

### API routes

| Route | Method | Purpose | Timeout |
|-------|--------|---------|---------|
| `/api/analyze-books` | POST | Serper per book → Claude intersection | 60s |
| `/api/generate-questions` | POST | Claude questions streamed via SSE | 60s |
| `/api/get-recommendations` | POST | Serper candidates → Claude ranking | 60s |
| `/api/get-media-recommendations` | POST | Media search → Claude podcast/article recs | 60s |
| `/api/search-books` | POST | Single book metadata lookup | default |
| `/api/preferences` | GET / PATCH | Read and update user preferences | default |
| `/api/preferences/learn` | GET | Temporal decay analysis + suggestions | default |
| `/api/recommendations/[id]/feedback` | POST | Like/dislike + preference signal write | default |
| `/api/profile` | GET | Full profile dashboard data | default |
| `/api/profile/portrait` | GET | Nyx reading portrait (cached, regenerates on new session) | default |
| `/api/profile/insights` | GET | Insight cards | default |
| `/api/profile/sessions` | GET | Paginated session history | default |
| `/api/exports` | POST | Create export job | default |
| `/api/exports/[id]` | GET | Poll export status | default |
| `/api/circles` | GET / POST | List / create circles | default |
| `/api/circles/[id]` | GET / PATCH / DELETE | Circle management | default |

All routes require authentication via Supabase session cookie.

### sessionStorage keys

Data flows between routes via `sessionStorage`:

```typescript
SESSION_KEYS = {
  BOOKS:                "rf_books",
  SESSION_ID:           "rf_session_id",
  INTERSECTION:         "rf_intersection",
  QUESTIONS:            "rf_questions",
  ANSWERS:              "rf_answers",
  MEDIA_ANSWERS:        "rf_media_answers",
  RECOMMENDATIONS:      "rf_recommendations",
  MEDIA_RECOMMENDATIONS:"rf_media_recommendations",
  OVERRIDE_PREFS:       "rf_override_prefs",   // set by mood toggle in /enter
  PREF_SUGGESTIONS:     "rf_pref_suggestions",
}
```

### Design system

**Fonts:** Inter (UI) + DM Serif Display (headings / display text)

**Color tokens (CSS custom properties):**

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-base` | `#0A0E1A` | Page background |
| `--bg-surface` | `#0F1729` | Card backgrounds |
| `--bg-raised` | `#151E35` | Elevated surfaces |
| `--bg-overlay` | `#1C2847` | Modals, tooltips |
| `--brand` | `#6387FF` | Primary interactive |
| `--brand-subtle` | `#A8BBFF` | Secondary brand |
| `--text-primary` | `#F0F4FF` | Headings, labels |
| `--text-secondary` | `#A8B8D8` | Body text |
| `--text-tertiary` | `#6B7FA3` | Supporting text |
| `--text-muted` | `#3D4F6E` | Timestamps, captions |

**Component classes** (defined in `globals.css`): `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.card`, `.stat-card`, `.spinner`, `.step-dot`, `.step-dot-active`

---

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key
- A [Serper](https://serper.dev) API key

### Environment variables

Create `.env.local`:

```env
ANTHROPIC_API_KEY=
SERPER_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Supabase schema

Run the following in your Supabase SQL editor:

```sql
-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  display_name text,
  intellectual_themes text[],
  emotional_context jsonb,
  reading_portrait text,
  portrait_generated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reading sessions
create table reading_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  circle_id uuid,
  status text default 'active',
  media_context jsonb,
  created_at timestamptz default now()
);

-- Books per session
create table current_books (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references reading_sessions not null,
  user_id uuid references auth.users not null,
  title text not null,
  author text not null,
  goodreads_url text,
  themes text[],
  raw_analysis jsonb
);

-- Recommendations per session
create table recommendations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references reading_sessions not null,
  user_id uuid references auth.users not null,
  title text not null,
  author text not null,
  cover_url text,
  thematic_connection text,
  why_now text,
  rank integer,
  created_at timestamptz default now()
);

-- Feedback on recommendations
create table recommendation_feedback (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid references recommendations not null,
  session_id uuid references reading_sessions not null,
  user_id uuid references auth.users not null,
  vote text not null,
  reason text,
  created_at timestamptz default now(),
  unique (recommendation_id, user_id)
);

-- User preferences
create table user_preferences (
  user_id uuid references auth.users primary key,
  blocked_authors text[] default '{}',
  blocked_titles text[] default '{}',
  blocked_themes text[] default '{}',
  preferred_themes text[] default '{}',
  preferred_authors text[] default '{}',
  updated_at timestamptz default now()
);

-- Preference signals (for temporal decay analysis)
create table preference_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  signal_type text not null check (signal_type in ('like', 'dislike', 'add_to_library')),
  book_title text not null,
  book_author text,
  reason text,
  session_id uuid references reading_sessions,
  weight decimal default 1.0,
  created_at timestamptz default now()
);
create index on preference_signals(user_id, created_at);

-- Circles
create table circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users not null,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references circles on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text default 'viewer',
  joined_at timestamptz default now(),
  unique (circle_id, user_id)
);

create table circle_invites (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references circles on delete cascade,
  email text not null,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

create table circle_comments (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references circles,
  session_id uuid references reading_sessions,
  recommendation_id uuid references recommendations,
  user_id uuid references auth.users not null,
  body text not null,
  created_at timestamptz default now()
);

create table circle_votes (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references circles,
  recommendation_id uuid references recommendations not null,
  user_id uuid references auth.users not null,
  vote text not null,
  created_at timestamptz default now(),
  unique (recommendation_id, user_id)
);

-- Exports
create table exports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references reading_sessions not null,
  user_id uuid references auth.users not null,
  type text not null,
  style text not null,
  status text default 'queued',
  file_url text,
  share_id text unique,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table digest_preferences (
  user_id uuid references auth.users primary key,
  default_style text default 'branded',
  delivery_email text,
  weekly_digest_enabled boolean default false,
  updated_at timestamptz default now()
);

-- RLS (enable for all tables, then add policies)
alter table profiles enable row level security;
alter table reading_sessions enable row level security;
alter table current_books enable row level security;
alter table recommendations enable row level security;
alter table recommendation_feedback enable row level security;
alter table user_preferences enable row level security;
alter table preference_signals enable row level security;
alter table circles enable row level security;
alter table circle_members enable row level security;
alter table exports enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own sessions" on reading_sessions for all using (auth.uid() = user_id);
create policy "own books" on current_books for all using (auth.uid() = user_id);
create policy "own recommendations" on recommendations for all using (auth.uid() = user_id);
create policy "own feedback" on recommendation_feedback for all using (auth.uid() = user_id);
create policy "own preferences" on user_preferences for all using (auth.uid() = user_id);
create policy "own signals" on preference_signals for all using (auth.uid() = user_id);
create policy "own exports" on exports for all using (auth.uid() = user_id);
create policy "circle members read" on circles for select using (
  exists (select 1 from circle_members where circle_id = circles.id and user_id = auth.uid())
);
create policy "circle owner write" on circles for all using (auth.uid() = owner_id);
```

### Running locally

```bash
npm install
npm run dev       # http://localhost:3000
```

### Validation

```bash
npm run build     # TypeScript check + production build
npm run lint      # ESLint
```

There are no automated tests. `npm run build` is the validation step.

---

## Deployment

Configured for Vercel. Set environment variables in the Vercel dashboard; `vercel.json` handles 60-second function timeouts for AI routes automatically.

```bash
vercel deploy
```

---

## Notable implementation details

**Next.js 16 middleware**
The auth middleware lives in `proxy.ts` (not `middleware.ts`) and exports a function named `proxy`. This is a breaking change in Next.js 16.

**D3 force simulation in React**
`ThemeConstellation` runs the D3 simulation synchronously (`.stop()` + tick loop) to get deterministic node positions without React re-renders during force calculation. D3 and Recharts components are loaded via `next/dynamic` with `ssr: false` to keep them out of the server bundle.

**Temporal decay formula**
`/api/preferences/learn` computes `effectiveWeight = weight * 0.95^days` for each signal at query time. The original `weight` column is never overwritten, allowing the decay to be recalculated correctly at any future date.

**Portrait caching**
`/api/profile/portrait` compares `portrait_generated_at` against the most recent completed session's `created_at`. Regeneration only fires when a new session has completed since the last portrait was written — keeping Claude calls minimal.

**Override preferences**
The "In a different mood today?" toggle in `/enter` writes `OVERRIDE_PREFS=true` to `sessionStorage`. The session page reads and clears this flag, passing `override_prefs: true` in the recommendation request body. The API skips `getUserPreferences()` entirely when this flag is set, giving Claude a clean slate.

**Service role client**
`createServiceRoleClient()` is only ever called inside API routes for privileged writes (upserts that bypass RLS). It is never imported from client components.

**Supabase SSR cookie typing**
The `setAll` cookie handler in `lib/supabase/server.ts` uses an explicit type annotation required by TypeScript strict mode:
```typescript
{ name: string; value: string; options?: Record<string, unknown> }[]
```

---

## License

MIT
