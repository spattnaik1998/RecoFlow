# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build (validates TypeScript)
npm run lint     # ESLint check
npm run start    # Start production server
```

There are no tests. Use `npm run build` to validate TypeScript correctness.

## Architecture

**RecoFlow** is a Next.js 16 App Router application that analyzes thematic intersections across books a user is reading, then recommends their next read.

### User Flow

```
/ → /auth → /enter → /session → /recommendations → /library
```

1. `/enter` — User enters 1–5 books they're currently reading
2. `/session` — 3-phase SSE flow: analyze books → Nyx asks questions → brain dump answers → generate recommendations
3. `/recommendations` — Display 10 ranked recommendations
4. `/library` — Persistent history of all past recommendations

### API Routes (`app/api/`)

| Route | Purpose | Timeout |
|-------|---------|---------|
| `analyze-books` | Serper per book + Claude thematic intersection analysis | 60s |
| `generate-questions` | Claude generates introspective questions from intersection | 60s |
| `get-recommendations` | Serper candidate search + Claude ranking → top 10 | 60s |
| `search-books` | Serper book metadata lookup (used in book entry form) | default |

The 60s timeouts are set in `vercel.json` for Vercel deployment.

### Core Library (`lib/`)

- **`anthropic.ts`** — Anthropic client, `NYX_SYSTEM_PROMPT`, all prompt builder functions, `extractJSON()`, `streamQuestions()`
- **`book-analyzer.ts`** — `analyzeBooks()`: parallel Serper fetch per book → single Claude synthesis call
- **`recommendation-engine.ts`** — `getRecommendations()`: Serper candidate search → Claude ranking
- **`nyx-dialogue.ts`** — All static Nyx character voice strings (keeps AI persona consistent)
- **`serper.ts`** — `searchBook()` and `searchBooksAtIntersection()`
- **`supabase/client.ts`** + **`supabase/server.ts`** — Browser and server Supabase clients

### State Between Routes

Data is passed between routes via `sessionStorage` using keys defined in `types/index.ts`:

```typescript
SESSION_KEYS = { BOOKS, SESSION_ID, INTERSECTION, QUESTIONS, ANSWERS, RECOMMENDATIONS }
```

### Critical Next.js 16 Behavior

- **Middleware file is `proxy.ts`**, not `middleware.ts` — this is a Next.js 16 breaking change
- The export must be named `proxy` (not `middleware`)
- Auth-protected routes: `/enter`, `/session`, `/recommendations`, `/library`

### Supabase

Two clients exist:
- `lib/supabase/client.ts` — browser-side (uses anon key)
- `lib/supabase/server.ts` — server-side (`createClient` for SSR, `createServiceRoleClient` for admin ops)

When adding `setAll` to cookie handlers, use explicit type annotation:
```typescript
{ name: string; value: string; options?: Record<string, unknown> }[]
```

### TypeScript

Strict mode is enabled. `Recommendation` has no `id` field — use `title + index` as React key. `ThematicIntersection` is the central data type passed between all three API phases.

## Environment Variables

```
ANTHROPIC_API_KEY              # Claude Sonnet 4.6
SERPER_API_KEY                 # Book search
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Public key
SUPABASE_SERVICE_ROLE_KEY      # Server admin key
```

## Visual Theme

Victorian gothic aesthetic. Custom Tailwind colors: `background` (#0D0A07), `gold` (#C8A96E), `forest` (#2C4A1E), `brown` (#8B4513), `parchment` (#E8D5B7). Fonts: Cinzel Decorative (headings) + IM Fell English (body). Film grain and vignette overlays are applied in `app/layout.tsx`.
