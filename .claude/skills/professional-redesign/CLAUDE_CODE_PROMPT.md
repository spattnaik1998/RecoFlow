# Claude Code Prompt: RecoFlow Professional Redesign

Paste the following prompt into Claude Code to execute the full redesign.

---

## PROMPT

You are redesigning the RecoFlow application from a Victorian gothic aesthetic into a professional, modern B2B SaaS product that can be sold to small businesses. The design must look like it belongs alongside products like Linear, Vercel, or Pitch.com — clean, dark, confident, and polished.

**Before doing anything else**, read the full design specification at:
`.claude/skills/professional-redesign/SKILL.md`

This file contains the complete design system, color tokens, CSS classes, component guidelines, and the exact list of things to remove and replace. Follow it precisely.

---

### Your task is to execute the following changes in order:

---

#### PHASE 1 — Foundation (do this first, in one pass)

**1. Replace `tailwind.config.ts`** with the new configuration from SKILL.md. The new config uses Inter + DM Serif Display fonts, a blue/indigo brand color system (`--brand: #6387FF`), and removes all Victorian gold/parchment colors.

**2. Replace `app/globals.css`** entirely with the new CSS from SKILL.md. This defines all reusable class utilities: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.card`, `.input`, `.textarea`, `.label`, `.badge-*`, `.ai-message`, `.rec-card`, `.spinner`, `.skeleton`, `.progress-track`, `.step-dot`, `.nav-link`, `.hero-grid-bg`, `.hero-glow`, and all animation keyframes.

**3. Update `app/layout.tsx`**:
- Remove the Google Fonts imports for Cinzel Decorative and IM Fell English
- Add these fonts instead:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
  ```
- Remove the `<div className="grain-overlay" />` element entirely
- Remove the `<div className="vignette" />` element entirely
- Set body className to: `className="min-h-screen bg-base antialiased font-sans"`

---

#### PHASE 2 — Delete Legacy Components

Delete these files entirely (they have no place in the new design):
- `components/VictorianBackground.tsx`
- `components/CandleFlicker.tsx`
- `components/TypewriterText.tsx` (or repurpose as a simple fade-in wrapper — see below)

If `TypewriterText` is used as a fade-in wrapper elsewhere, replace it with this minimal version:
```tsx
// components/FadeIn.tsx
"use client";
import { useEffect, useState } from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      {children}
    </div>
  );
}
```

---

#### PHASE 3 — Redesign `components/NavBar.tsx`

Replace the entire component with this professional implementation:

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/enter", label: "New Session" },
  { href: "/library", label: "Library" },
  { href: "/profile", label: "Profile" },
  { href: "/circles", label: "Circles" },
];

const HIDDEN_ON = ["/", "/auth"];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (HIDDEN_ON.includes(pathname)) return null;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "56px",
        zIndex: 100,
        background: scrolled ? "rgba(10,14,26,0.92)" : "rgba(10,14,26,0.80)",
        backdropFilter: "blur(12px) saturate(180%)",
        borderBottom: `1px solid ${scrolled ? "rgba(99,135,255,0.14)" : "rgba(99,135,255,0.06)"}`,
        transition: "background 0.25s ease, border-color 0.25s ease",
        display: "flex",
        alignItems: "center",
        padding: "0 1.5rem",
        gap: "1.5rem",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", flexShrink: 0 }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "7px",
          background: "var(--brand)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "#fff"
        }}>R</div>
        <span style={{ fontSize: "0.938rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          RecoFlow
        </span>
      </Link>

      {/* Nav Links */}
      <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem", flex: 1 }}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${pathname.startsWith(link.href) ? "nav-link-active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {user && (
          <span style={{ fontSize: "0.813rem", color: "var(--text-tertiary)" }}>
            {user.email}
          </span>
        )}
        <button className="btn-ghost" onClick={handleSignOut} style={{ padding: "0.4rem 0.875rem", fontSize: "0.813rem" }}>
          Sign out
        </button>
      </div>
    </header>
  );
}
```

---

#### PHASE 4 — Redesign `components/Nyx.tsx`

Replace with a clean professional AI message component:

```tsx
"use client";
import { useEffect, useState } from "react";

interface NyxMessageProps {
  message: string;
  loading?: boolean;
  className?: string;
}

export function NyxMessage({ message, loading = false, className = "" }: NyxMessageProps) {
  const [displayed, setDisplayed] = useState(loading ? "" : message);

  useEffect(() => {
    if (!loading) setDisplayed(message);
  }, [message, loading]);

  return (
    <div className={`ai-message ${className}`}>
      <div className="ai-message-header">
        <div className="ai-avatar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span>Nyx · AI Guide</span>
        {loading && (
          <div style={{ display: "flex", gap: "3px", alignItems: "center", marginLeft: "0.375rem" }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                width: "4px", height: "4px", borderRadius: "50%",
                background: "var(--brand)", opacity: 0.6,
                animation: `loadDot 1.4s ease-in-out ${i * 0.18}s infinite`,
              }} />
            ))}
          </div>
        )}
      </div>
      <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>
        {displayed}
      </p>
      <style>{`
        @keyframes loadDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Keep backward compatibility
export default NyxMessage;
export { NyxMessage as Nyx };
```

---

#### PHASE 5 — Redesign `components/BookCard.tsx`

Replace the Victorian book card with this clean implementation:

```tsx
"use client";
import { Recommendation } from "@/types";

const RANK_LABELS: Record<number, string> = {
  1: "Top Pick",
  2: "Strong Match",
  3: "Recommended",
};

interface BookCardProps {
  rec: Recommendation;
  rank: number;
  showVoting?: boolean;
}

export function BookCard({ rec, rank, showVoting }: BookCardProps) {
  const isTop = rank === 1;
  return (
    <div className={`rec-card ${isTop ? "rec-card-top" : ""}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.875rem" }}>
        <span className={`rec-rank ${isTop ? "rec-rank-top" : ""}`}>
          #{rank} {RANK_LABELS[rank] ?? "Recommended"}
        </span>
        {isTop && (
          <span className="badge badge-brand">Best Match</span>
        )}
      </div>

      <h3 style={{ fontSize: "1.063rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem", letterSpacing: "-0.01em" }}>
        {rec.title}
      </h3>
      <p style={{ fontSize: "0.813rem", color: "var(--text-tertiary)", marginBottom: "1rem" }}>
        {rec.author}
      </p>

      {rec.thematic_connection && (
        <div style={{ marginBottom: "0.875rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "0.375rem" }}>
            Why it fits
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {rec.thematic_connection}
          </p>
        </div>
      )}

      {rec.why_now && (
        <div style={{
          background: "rgba(99,135,255,0.04)",
          border: "1px solid rgba(99,135,255,0.10)",
          borderRadius: "8px",
          padding: "0.75rem",
          marginTop: "0.875rem",
        }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--brand)", marginBottom: "0.375rem" }}>
            Why now
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
            {rec.why_now}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

#### PHASE 6 — Redesign Landing Page (`app/page.tsx` + `LandingClient.tsx`)

Replace the landing page with a professional SaaS hero:

```tsx
"use client";
import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";

const FEATURES = [
  {
    icon: "◆",
    title: "Deep Thematic Analysis",
    description: "We map the conceptual DNA of what you're reading — not just genre or topic, but the ideas, tensions, and questions your books share.",
  },
  {
    icon: "◈",
    title: "Adaptive AI Questions",
    description: "Three targeted questions calibrate recommendations to your current goals, mood, and direction — so every suggestion is timely, not generic.",
  },
  {
    icon: "◇",
    title: "Persistent Reading Library",
    description: "Every session is saved. Build a reading history that compounds — for you, your team, or your entire organization.",
  },
];

export function LandingClient() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", position: "relative", overflow: "hidden" }}>
      {/* Grid background */}
      <div className="hero-grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      {/* Radial glow */}
      <div className="hero-glow" />

      {/* Nav */}
      <header style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 2rem", maxWidth: "1100px", margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "7px",
            background: "var(--brand)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "#fff"
          }}>R</div>
          <span style={{ fontSize: "0.938rem", fontWeight: 700, color: "var(--text-primary)" }}>RecoFlow</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/auth" className="btn-ghost" style={{ textDecoration: "none", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
            Sign in
          </Link>
          <Link href="/auth" className="btn-primary" style={{ textDecoration: "none", padding: "0.5rem 1.125rem", fontSize: "0.875rem" }}>
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "5rem 1.5rem 4rem" }}>
        <FadeIn delay={0}>
          <div className="badge badge-brand" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
            AI-Powered Reading Intelligence
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(3rem, 6vw, 5rem)",
            fontWeight: 400,
            color: "var(--text-primary)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: "1.5rem",
            maxWidth: "800px",
            margin: "0 auto 1.5rem",
          }}>
            Smarter reading,<br />
            <em style={{ fontStyle: "italic" }}>for teams that think.</em>
          </h1>
        </FadeIn>

        <FadeIn delay={160}>
          <p style={{
            fontSize: "1.063rem",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            maxWidth: "560px",
            margin: "0 auto 2.5rem",
          }}>
            RecoFlow analyzes what you're reading, finds the hidden connections between books,
            and recommends exactly what to read next — so every book compounds on the last.
          </p>
        </FadeIn>

        <FadeIn delay={240}>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth" className="btn-primary" style={{ textDecoration: "none", padding: "0.75rem 1.75rem", fontSize: "1rem" }}>
              Start Your First Session →
            </Link>
            <Link href="/auth" className="btn-ghost" style={{ textDecoration: "none", padding: "0.75rem 1.25rem", fontSize: "1rem" }}>
              See how it works
            </Link>
          </div>
        </FadeIn>

        {/* Feature cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
          maxWidth: "960px",
          margin: "5rem auto 0",
          textAlign: "left",
        }}>
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={320 + i * 80}>
              <div className="feature-card" style={{ height: "100%" }}>
                <div className="feature-icon">
                  <span style={{ fontSize: "16px" }}>{f.icon}</span>
                </div>
                <h3 style={{ fontSize: "0.938rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {f.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Social proof */}
        <FadeIn delay={600}>
          <p style={{ marginTop: "4rem", fontSize: "0.813rem", color: "var(--text-muted)" }}>
            Built on Claude · Powered by Serper · Deployed on Vercel
          </p>
        </FadeIn>
      </main>
    </div>
  );
}
```

---

#### PHASE 7 — Update All Remaining Pages

For each page below, apply these systematic changes:

**`app/auth/AuthForm.tsx`**:
- Wrap in centered card: `max-width: 400px`, `card` class, `padding: 2rem`
- Replace styled inputs with `.input` class
- Replace button with `.btn-primary` full-width
- Replace divider with `.divider-label`
- Remove any gold/parchment/victorian styling

**`app/enter/page.tsx`**:
- Add step indicator at top: Step 1 of 2 — "Your Books"
- Replace book entry form with clean `.input` + `.label` fields
- Remove Victorian border panels; use `.card` for each book slot
- "Add book" → plain text link (`color: var(--brand)`)
- Submit: `.btn-primary`
- Top padding of 56px for fixed navbar

**`app/session/page.tsx`**:
- Add 3-step indicator at top: "Analysis → Questions → Results"
- Wrap all Nyx dialogue in `<NyxMessage>` instead of old Nyx component
- Remove TypewriterText → FadeIn wrapper
- Progress: `.progress-track` + `.progress-fill`
- Loading phase: `.spinner` centered with label below
- Brain dump textarea: `.textarea` class + small character count

**`app/recommendations/page.tsx`**:
- Page heading: "Your Reading Map" in Inter 600
- Date/session metadata in `--text-tertiary`
- Grid of `<BookCard>` using `.rec-card`
- Export button: `.btn-secondary` with download icon
- "Start new session" link at bottom

**`app/library/LibraryClient.tsx`**:
- Remove TypewriterText/Victorian intro text
- Table or card list of sessions
- Each session row: date, books read, number of recommendations
- Clicking expands to show rec cards

**`app/profile/ProfileClient.tsx`**:
- Stat cards using `.stat-card` / `.stat-value` / `.stat-label-text`
- Remove Victorian flourishes; use clean section headers
- Theme tags use `.badge-neutral` not italic serif chips

---

#### PHASE 8 — Global Search-and-Replace

Run these replacements across ALL files after the above changes:

1. `font-cinzel` → `font-sans font-semibold`
2. `font-fell` → `font-sans`
3. `text-gold` → `text-brand`
4. `text-parchment` → `text-primary`
5. `text-parchment-dim` → `text-secondary`
6. `bg-background` → `bg-base`
7. `border-gold` → `border-brand/20`
8. `victorian-border` → `card`
9. `btn-primary` (in JSX className) → already updated (skip if using class system)
10. `nyx-speech` → `ai-message`
11. `nyx-input` → `input`
12. Remove all `italic` from non-display font usage

---

#### PHASE 9 — Validation

1. Run `npm run build` — fix any TypeScript errors
2. Run `npm run dev` and manually verify every route:
   - `/` — Landing page with hero grid, glow, feature cards
   - `/auth` — Clean centered card form
   - `/enter` — Step indicator + clean book input form
   - `/session` — Phase indicator + ai-message blocks + progress bar
   - `/recommendations` — rec-card grid with top pick highlighted
   - `/library` — Clean session list
   - `/profile` — Stat cards + clean sections
3. Check at 375px (mobile) and 1280px (desktop)
4. Confirm zero instances of: `font-cinzel`, `font-fell`, `text-gold`, `text-parchment`, `grain-overlay`, `vignette`, `victorian-border`, `nyx-speech`, `CandleFlicker`, `VictorianBackground`, `TypewriterText` (unless repurposed as FadeIn)

---

### Definition of Done

The redesign is complete when:
- The app looks like a modern dark SaaS tool (think Linear / Vercel aesthetic)
- Zero Victorian gothic visual elements remain anywhere
- All buttons, inputs, cards, and navigation use the new design system from SKILL.md
- The landing page has a DM Serif Display headline, Inter body, feature cards, and a clear CTA
- `npm run build` succeeds with no errors
- All routes render correctly and the app is fully functional
