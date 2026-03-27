# RecoFlow — The Library of Nyx

> *"The most dangerous books are those that answer questions you haven't yet thought to ask."*

RecoFlow is an AI-powered book recommendation engine with a Victorian gothic aesthetic. It analyzes thematic intersections across the books you're currently reading and — through a guided conversation with Nyx, an arcane librarian — recommends your next read with uncanny precision.

---

## Overview

Most recommendation engines ask what you've enjoyed in the past. RecoFlow asks something more interesting: **what are you thinking about right now?**

By finding the hidden thematic convergences across your current reads, then asking a series of introspective questions drawn from those convergences, Nyx builds a portrait of your intellectual and emotional state — and recommends books that speak directly to that moment.

---

## User Flow

```
/ → /auth → /enter → /session → /recommendations → /library
```

| Step | Route | Description |
|------|-------|-------------|
| 1 | `/` | Landing page with animated introduction to Nyx |
| 2 | `/auth` | Sign up or sign in (Supabase email auth) |
| 3 | `/enter` | Enter 1–5 books you're currently reading |
| 4 | `/session` | Three-phase AI analysis session |
| 5 | `/recommendations` | Reveal of 5 ranked recommendations |
| 6 | `/library` | Persistent history of all past consultations |

---

## Features

### AI Analysis Engine

The recommendation pipeline runs in three sequential phases:

**Phase 1 — Thematic Intersection Analysis**
- Runs parallel Serper web searches to gather metadata on each book
- Sends all results to Claude Sonnet 4.6 with a single synthesis prompt
- Extracts a `ThematicIntersection` object containing:
  - Shared thematic confluences across all books
  - Productive tensions and contradictions between them
  - An overall intellectual territory
  - An emotional undercurrent

**Phase 2 — Introspective Questions (SSE Streaming)**
- Claude generates personalized questions based on the thematic intersection
- Questions stream in real-time via Server-Sent Events, showing Nyx "thinking"
- Questions are categorized as `intellectual` or `emotional`
- Returning users have their historical intellectual themes woven into new questions
- The BrainDump interface collects answers with a progress bar and animated transitions

**Phase 3 — Recommendation Generation**
- Three parallel Serper searches find candidate books at the thematic intersection
- Claude ranks candidates against the thematic analysis and the user's answers
- Returns exactly 5 ranked recommendations with:
  - Thematic connection to your current reads
  - "Why now" reasoning tailored to your answers
- Results are persisted to Supabase and the user's intellectual profile is updated

### Nyx Character System

Nyx is a consistent AI persona maintained across all interactions through a strict system prompt. Her voice is scholarly, measured, and arcane — never cheerful or casual.

- `lib/nyx-dialogue.ts` centralizes 50+ static dialogue strings
- Dynamic greetings for returning users
- Character avatar (SVG portrait) with typewriter text delivery
- Phase-appropriate dialogue at every step of the session

### Persistent User Profiles

Every consultation builds a long-term intellectual profile:
- `intellectual_themes` — accumulated across all sessions (max 20 items)
- `emotional_context` — stored per session
- Returning users receive questions informed by their reading history
- The `/library` page shows all past sessions with input books and recommendations

### Victorian Gothic UI

The visual design is fully custom-themed:

**Atmosphere**
- Film grain overlay (SVG turbulence, 4% opacity)
- Radial vignette darkening the edges
- `VictorianBackground` canvas component: dust particles and sparks rising from a bookshelf silhouette at 60fps
- Three animated candles with `candleFlicker` keyframe animation on key pages

**Typography**
- **Cinzel Decorative** — all headings, labels, and buttons
- **IM Fell English** — body text and atmospheric prose (italic-first)

**Color Palette**
| Name | Hex | Usage |
|------|-----|-------|
| `background` | `#0D0A07` | Page background (near-black) |
| `gold` | `#C8A96E` | Primary accent, interactive elements |
| `gold-light` | `#E8C98A` | Highlights |
| `gold-dim` | `#8B7340` | Secondary gold |
| `parchment` | `#E8D5B7` | Readable body text |
| `parchment-dim` | `#B8A58A` | Secondary text |
| `forest` | `#2C4A1E` | Deep green accent |
| `brown` | `#8B4513` | Borders, dividers |
| `ash` | `#4A4035` | Muted backgrounds |

**Animations (Framer Motion + CSS)**
- Staggered entrance animations on every page
- `AnimatePresence` mode="wait" for phase transitions in `/session`
- Typewriter text effect (character-by-character, 28ms/char) with blinking cursor
- Recommendation reveal: each of the 5 cards appears 1.8s after the previous
- Book rank labels use Roman numerals (I–V) with custom descriptors ("The Oracle's Choice", "Second Sight", etc.)

### Authentication

- Supabase email/password authentication
- Email confirmation flow with PKCE callback at `/auth/callback`
- Auth middleware via `proxy.ts` (Next.js 16 convention) guards `/enter`, `/session`, `/recommendations`, `/library`
- Persistent sessions via cookie-based Supabase SSR client

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 + custom config |
| Animations | Framer Motion 12 |
| AI | Anthropic Claude Sonnet 4.6 |
| Search | Serper API |
| Database/Auth | Supabase (PostgreSQL + Supabase Auth) |
| Deployment | Vercel |

### Project Structure

```
app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout (film grain, vignette, fonts, NavBar)
├── auth/
│   ├── page.tsx                # Sign in / sign up
│   └── callback/route.ts       # Supabase OAuth/OTP handler
├── enter/page.tsx              # Book entry form
├── session/page.tsx            # 3-phase analysis session
├── recommendations/page.tsx    # Results reveal
├── library/page.tsx            # Consultation history
└── api/
    ├── analyze-books/route.ts
    ├── generate-questions/route.ts
    ├── get-recommendations/route.ts
    └── search-books/route.ts

lib/
├── anthropic.ts                # Claude client, system prompt, all prompt builders
├── book-analyzer.ts            # Parallel Serper + Claude intersection analysis
├── recommendation-engine.ts   # Candidate search + Claude ranking
├── nyx-dialogue.ts             # All static Nyx character strings
├── serper.ts                   # Web search helpers
└── supabase/
    ├── client.ts               # Browser-side Supabase client
    └── server.ts               # Server-side + service role clients

components/
├── NavBar.tsx
├── BookEntry.tsx
├── BookCard.tsx
├── BrainDump.tsx
├── RecommendationReveal.tsx
├── Nyx.tsx
├── TypewriterText.tsx
├── CandleFlicker.tsx
└── VictorianBackground.tsx

types/index.ts                  # All shared types + SESSION_KEYS
proxy.ts                        # Auth middleware (Next.js 16)
vercel.json                     # 60s timeouts for AI routes
```

### State Management

**Between phases (sessionStorage):**

```typescript
SESSION_KEYS = {
  BOOKS:           "rf_books",
  SESSION_ID:      "rf_session_id",
  INTERSECTION:    "rf_intersection",
  QUESTIONS:       "rf_questions",
  ANSWERS:         "rf_answers",
  RECOMMENDATIONS: "rf_recommendations",
}
```

Data flows forward through the pipeline via `sessionStorage`. This avoids re-fetching expensive AI results on navigation and survives page reloads within the same tab.

**Persistent (Supabase):**
- `reading_sessions` — one per consultation, status `active` → `completed`
- `current_books` — books + themes for each session
- `recommendations` — 5 ranked results per session
- `profiles` — accumulated intellectual themes per user

### API Routes

| Route | Method | Purpose | Timeout |
|-------|--------|---------|---------|
| `/api/analyze-books` | POST | Serper per book → Claude intersection synthesis | 60s |
| `/api/generate-questions` | POST | Claude question generation streamed via SSE | 60s |
| `/api/get-recommendations` | POST | Serper candidate search → Claude ranking | 60s |
| `/api/search-books` | POST | Single book metadata lookup via Serper | default |

All routes require authentication. The 60-second timeouts are configured in `vercel.json` to accommodate Serper + Claude round-trips.

### Core Data Types

```typescript
interface ThematicIntersection {
  books: BookAnalysis[]
  intersection: {
    confluences: string[]          // shared themes
    tensions: string[]             // productive contradictions
    intellectual_territory: string
    emotional_undercurrent: string
  }
}

interface NyxQuestion {
  id: string
  question: string
  category: "intellectual" | "emotional"
  hint?: string
}

interface Recommendation {
  title: string
  author: string
  cover_url?: string
  thematic_connection: string
  why_now: string
  rank: number  // 1–5
}
```

---

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key
- A [Serper](https://serper.dev) API key

### Environment Variables

Create `.env.local` in the project root:

```env
ANTHROPIC_API_KEY=
SERPER_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Supabase Schema

Run the following in your Supabase SQL editor:

```sql
-- User profiles (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  display_name text,
  intellectual_themes text[],
  emotional_context jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reading sessions
create table reading_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  status text default 'active',
  created_at timestamptz default now()
);

-- Books submitted per session
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
  rank integer,
  created_at timestamptz default now()
);

-- RLS policies (enable for each table)
alter table profiles enable row level security;
alter table reading_sessions enable row level security;
alter table current_books enable row level security;
alter table recommendations enable row level security;

create policy "Users can manage their own profile"
  on profiles for all using (auth.uid() = id);

create policy "Users can manage their own sessions"
  on reading_sessions for all using (auth.uid() = user_id);

create policy "Users can manage their own books"
  on current_books for all using (auth.uid() = user_id);

create policy "Users can manage their own recommendations"
  on recommendations for all using (auth.uid() = user_id);
```

### Running Locally

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

The project is configured for Vercel. Push to your connected repository and set the environment variables in the Vercel dashboard. The `vercel.json` at the root handles the 60-second function timeouts automatically.

```bash
vercel deploy
```

---

## Notable Implementation Details

**Next.js 16 Middleware**
The auth middleware lives in `proxy.ts` (not `middleware.ts`) and exports a function named `proxy` — this is a breaking change in Next.js 16.

**Supabase SSR Cookie Typing**
The `setAll` cookie handler requires an explicit type annotation in strict TypeScript:
```typescript
{ name: string; value: string; options?: Record<string, unknown> }[]
```

**Recommendation React Keys**
The `Recommendation` type has no `id` field. Use `title + index` as the React key:
```tsx
recommendations.map((rec, i) => <BookCard key={`${rec.title}-${i}`} ... />)
```

**Service Role Client**
`createServiceRoleClient()` is only used inside API routes for privileged database writes. It is never imported from client components.

---

## License

MIT
