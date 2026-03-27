# SKILL: RecoFlow Professional Redesign

## Purpose

This skill defines the complete design system for transforming RecoFlow from a Victorian gothic hobby aesthetic into a professional, sales-ready B2B SaaS product. The target buyer is a small business owner or HR/L&D manager who wants to offer AI-powered book recommendations for their team or customers.

---

## Strategic Positioning

**Product**: RecoFlow — AI Reading Intelligence Platform
**Tagline**: *"Smarter reading, for teams that think."*
**Buyer Persona**: Small business owners, L&D managers, team leads, corporate book club organizers.
**Tone**: Confident, intelligent, clean. Premium without being opaque.

---

## Design Direction: Modern Professional Dark SaaS

Think **Linear.app** meets **Vercel** meets **Pitch.com**.

- Dark but **not gothic**: deep navy/slate backgrounds, not parchment and candlelight
- **Electric blue/indigo** as the primary accent (trust, intelligence, authority)
- Clean geometric shapes, subtle gradients
- **No** candles, Victorian borders, film grain, serif fantasy fonts
- Dashboard-quality information hierarchy
- Micro-interactions that feel fast and purposeful, not theatrical

---

## Color System

### Primitives

```css
/* Backgrounds */
--bg-base:    #0A0E1A;   /* Page background — deep navy */
--bg-surface: #0F1729;   /* Cards, panels */
--bg-raised:  #151E35;   /* Elevated surfaces, dropdowns */
--bg-overlay: #1C2847;   /* Modals, tooltips */

/* Borders */
--border-subtle:  rgba(99, 135, 255, 0.08);
--border-mid:     rgba(99, 135, 255, 0.18);
--border-strong:  rgba(99, 135, 255, 0.38);
--border-focus:   rgba(99, 135, 255, 0.70);

/* Brand Accent — Electric Blue/Indigo */
--brand-500:  #6387FF;   /* Primary — buttons, links, highlights */
--brand-400:  #849DFF;   /* Hover state */
--brand-300:  #A8BBFF;   /* Subtle tints */
--brand-600:  #4F6EE8;   /* Active/pressed state */
--brand-glow: rgba(99, 135, 255, 0.20);

/* Text */
--text-primary:   #F0F4FF;   /* Headings */
--text-secondary: #A8B8D8;   /* Body, labels */
--text-tertiary:  #6B7FA3;   /* Placeholders, captions */
--text-muted:     #3D4F6E;   /* Disabled */
--text-inverse:   #0A0E1A;   /* On brand buttons */

/* Semantic */
--success: #34D399;
--warning: #FBBF24;
--error:   #F87171;
--info:    #60A5FA;
```

### Usage Rules

- **Backgrounds**: Never pure black. Always use `--bg-base` (#0A0E1A) minimum.
- **Cards**: `--bg-surface` with `--border-subtle` border. Never heavy drop shadows.
- **Accent sparingly**: `--brand-500` only for CTAs, active states, and key links. Don't accent everything.
- **Text hierarchy**: H1 → `--text-primary`, body → `--text-secondary`, meta → `--text-tertiary`.

---

## Typography

### Fonts

```html
<!-- In <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
```

- **Sans (UI)**: `Inter` — navigation, labels, buttons, body text, all UI chrome
- **Display (Hero)**: `DM Serif Display` — used *only* for the main landing headline (H1) and major section titles. Maximum 2–3 instances per page.
- **Mono**: `ui-monospace, 'SF Mono', Consolas` — code, IDs, technical labels

### Scale

```css
--text-xs:   0.70rem / 1.4;   /* Captions, badges */
--text-sm:   0.813rem / 1.5;  /* Labels, secondary */
--text-base: 0.938rem / 1.6;  /* Body default */
--text-lg:   1.063rem / 1.5;  /* Card headings */
--text-xl:   1.25rem  / 1.4;  /* Section subheads */
--text-2xl:  1.5rem   / 1.3;  /* Page titles */
--text-3xl:  2rem     / 1.2;  /* Hero subtitle */
--text-4xl:  2.75rem  / 1.1;  /* Hero title (Inter) */
--display:   clamp(3rem, 6vw, 5rem) / 1.0; /* DM Serif hero */
```

### Rules

- **Never use** Cinzel Decorative or IM Fell English anywhere in the redesign.
- All weights should be Inter 400 (regular), 500 (medium), 600 (semibold), 700 (bold).
- Letter-spacing: slightly tight on headings (`-0.02em`), normal on body.
- Line-height: generous on body (1.6), tight on display (1.0–1.1).

---

## Tailwind Config (replace existing)

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        base:    "#0A0E1A",
        surface: "#0F1729",
        raised:  "#151E35",
        overlay: "#1C2847",
        // Brand
        brand: {
          DEFAULT: "#6387FF",
          hover:   "#849DFF",
          subtle:  "#A8BBFF",
          active:  "#4F6EE8",
          ghost:   "rgba(99,135,255,0.10)",
          glow:    "rgba(99,135,255,0.20)",
        },
        // Text
        primary:   "#F0F4FF",
        secondary: "#A8B8D8",
        tertiary:  "#6B7FA3",
        muted:     "#3D4F6E",
        // Borders (use opacity utilities or full values)
        border: {
          subtle: "rgba(99,135,255,0.08)",
          mid:    "rgba(99,135,255,0.18)",
          strong: "rgba(99,135,255,0.38)",
        },
        // Semantic
        success: "#34D399",
        warning: "#FBBF24",
        danger:  "#F87171",
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["DM Serif Display", "Georgia", "serif"],
        mono:    ["ui-monospace", "SF Mono", "Consolas", "monospace"],
      },
      fontSize: {
        xs:   ["0.70rem",  { lineHeight: "1.4" }],
        sm:   ["0.813rem", { lineHeight: "1.5" }],
        base: ["0.938rem", { lineHeight: "1.6" }],
        lg:   ["1.063rem", { lineHeight: "1.5" }],
        xl:   ["1.25rem",  { lineHeight: "1.4" }],
        "2xl":["1.5rem",   { lineHeight: "1.3" }],
        "3xl":["2rem",     { lineHeight: "1.2" }],
        "4xl":["2.75rem",  { lineHeight: "1.1" }],
      },
      borderRadius: {
        sm:   "4px",
        md:   "8px",
        lg:   "12px",
        xl:   "16px",
        "2xl":"20px",
        full: "9999px",
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,135,255,0.08)",
        lift:  "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,135,255,0.14)",
        glow:  "0 0 24px rgba(99,135,255,0.18)",
        brand: "0 4px 24px rgba(99,135,255,0.28)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "fade-up":   "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":   "fadeIn 0.35s ease forwards",
        "slide-in":  "slideIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-brand": "pulseBrand 2s ease-in-out infinite",
        "shimmer":   "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        pulseBrand: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(99,135,255,0)" },
          "50%":      { boxShadow: "0 0 0 6px rgba(99,135,255,0.10)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Global CSS (replace existing globals.css)

```css
/* app/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Base ─────────────────────────────────────────────── */
:root {
  --bg-base:    #0A0E1A;
  --bg-surface: #0F1729;
  --bg-raised:  #151E35;
  --bg-overlay: #1C2847;

  --brand:      #6387FF;
  --brand-hover:#849DFF;
  --brand-glow: rgba(99,135,255,0.20);

  --border-subtle: rgba(99,135,255,0.08);
  --border-mid:    rgba(99,135,255,0.18);
  --border-strong: rgba(99,135,255,0.38);
  --border-focus:  rgba(99,135,255,0.70);

  --text-primary:   #F0F4FF;
  --text-secondary: #A8B8D8;
  --text-tertiary:  #6B7FA3;
  --text-muted:     #3D4F6E;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { -webkit-font-smoothing: antialiased; }

body {
  background: var(--bg-base);
  color: var(--text-secondary);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.938rem;
  line-height: 1.6;
}

/* ─── Scrollbar ─────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(99,135,255,0.18);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover { background: rgba(99,135,255,0.30); }

/* ─── Selection ─────────────────────────────────────────── */
::selection { background: rgba(99,135,255,0.25); color: #F0F4FF; }

/* ─── Focus ─────────────────────────────────────────────── */
:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}

/* ─── Typography ─────────────────────────────────────────── */
h1, h2, h3, h4, h5, h6 {
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* ─── Buttons ────────────────────────────────────────────── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--brand);
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 0.625rem 1.375rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
  white-space: nowrap;
}
.btn-primary:hover {
  background: var(--brand-hover);
  box-shadow: 0 4px 24px rgba(99,135,255,0.30);
  transform: translateY(-1px);
}
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(99,135,255,0.08);
  color: var(--brand);
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 0.625rem 1.375rem;
  border-radius: 8px;
  border: 1px solid rgba(99,135,255,0.20);
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
}
.btn-secondary:hover {
  background: rgba(99,135,255,0.14);
  border-color: rgba(99,135,255,0.35);
  transform: translateY(-1px);
}
.btn-secondary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: transparent;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}
.btn-ghost:hover {
  background: rgba(99,135,255,0.06);
  color: var(--text-primary);
  border-color: var(--border-mid);
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(248,113,113,0.10);
  color: #F87171;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.625rem 1.375rem;
  border-radius: 8px;
  border: 1px solid rgba(248,113,113,0.25);
  cursor: pointer;
  transition: background 0.18s ease;
}
.btn-danger:hover { background: rgba(248,113,113,0.18); }

/* ─── Cards ──────────────────────────────────────────────── */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.card:hover {
  border-color: var(--border-mid);
  box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,135,255,0.12);
}
.card-interactive {
  cursor: pointer;
}
.card-interactive:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.card-active {
  border-color: var(--border-strong);
  box-shadow: 0 0 0 1px rgba(99,135,255,0.20), 0 4px 20px rgba(0,0,0,0.4);
}

/* ─── Inputs ─────────────────────────────────────────────── */
.input {
  width: 100%;
  background: rgba(10,14,26,0.8);
  border: 1px solid var(--border-mid);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 0.938rem;
  padding: 0.625rem 0.875rem;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  -webkit-appearance: none;
}
.input::placeholder { color: var(--text-muted); }
.input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(99,135,255,0.15);
}
.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.textarea {
  width: 100%;
  background: rgba(10,14,26,0.8);
  border: 1px solid var(--border-mid);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 0.938rem;
  padding: 0.75rem 0.875rem;
  outline: none;
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.textarea::placeholder { color: var(--text-muted); }
.textarea:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(99,135,255,0.15);
}

/* Input with left icon */
.input-group {
  position: relative;
}
.input-group .input {
  padding-left: 2.5rem;
}
.input-group .input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
  width: 16px;
  height: 16px;
}

/* ─── Labels ─────────────────────────────────────────────── */
.label {
  display: block;
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}
.label-required::after {
  content: ' *';
  color: #F87171;
}

/* ─── Badges ─────────────────────────────────────────────── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  text-transform: uppercase;
}
.badge-brand {
  background: rgba(99,135,255,0.12);
  color: var(--brand);
  border: 1px solid rgba(99,135,255,0.22);
}
.badge-success {
  background: rgba(52,211,153,0.10);
  color: #34D399;
  border: 1px solid rgba(52,211,153,0.20);
}
.badge-warning {
  background: rgba(251,191,36,0.10);
  color: #FBBF24;
  border: 1px solid rgba(251,191,36,0.20);
}
.badge-danger {
  background: rgba(248,113,113,0.10);
  color: #F87171;
  border: 1px solid rgba(248,113,113,0.20);
}
.badge-neutral {
  background: rgba(107,127,163,0.12);
  color: var(--text-tertiary);
  border: 1px solid rgba(107,127,163,0.18);
}

/* ─── Dividers ───────────────────────────────────────────── */
.divider {
  width: 100%;
  height: 1px;
  background: var(--border-subtle);
}
.divider-label {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 500;
}
.divider-label::before,
.divider-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}

/* ─── Progress Bar ───────────────────────────────────────── */
.progress-track {
  width: 100%;
  height: 3px;
  background: rgba(99,135,255,0.10);
  border-radius: 99px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--brand);
  border-radius: 99px;
  transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 0 8px rgba(99,135,255,0.40);
}

/* ─── Loading ────────────────────────────────────────────── */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(99,135,255,0.20);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.spinner-lg {
  width: 32px;
  height: 32px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.skeleton {
  background: linear-gradient(90deg,
    rgba(99,135,255,0.04) 25%,
    rgba(99,135,255,0.10) 50%,
    rgba(99,135,255,0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 6px;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── Navigation ─────────────────────────────────────────── */
.nav-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-decoration: none;
  padding: 0.375rem 0.625rem;
  border-radius: 6px;
  transition: color 0.18s ease, background 0.18s ease;
}
.nav-link:hover {
  color: var(--text-primary);
  background: rgba(99,135,255,0.06);
}
.nav-link-active {
  color: var(--text-primary);
  background: rgba(99,135,255,0.08);
}

/* ─── Tooltips ───────────────────────────────────────────── */
.tooltip {
  background: var(--bg-overlay);
  border: 1px solid var(--border-mid);
  border-radius: 6px;
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  pointer-events: none;
}

/* ─── Step Indicator ─────────────────────────────────────── */
.step-indicator {
  display: flex;
  align-items: center;
  gap: 0;
}
.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--border-mid);
  background: var(--bg-surface);
  color: var(--text-muted);
  transition: all 0.25s ease;
  position: relative;
  z-index: 1;
}
.step-dot.active {
  background: var(--brand);
  border-color: var(--brand);
  color: #fff;
  box-shadow: 0 0 16px rgba(99,135,255,0.30);
}
.step-dot.done {
  background: rgba(52,211,153,0.12);
  border-color: rgba(52,211,153,0.30);
  color: #34D399;
}
.step-line {
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
  min-width: 40px;
}
.step-line.done { background: rgba(52,211,153,0.30); }

/* ─── Hero Section ───────────────────────────────────────── */
.hero-grid-bg {
  background-image:
    linear-gradient(rgba(99,135,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,135,255,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
}
.hero-glow {
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 600px;
  background: radial-gradient(ellipse at center, rgba(99,135,255,0.12) 0%, transparent 70%);
  pointer-events: none;
}

/* ─── Feature Cards (Landing) ────────────────────────────── */
.feature-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 1.5rem;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.feature-card:hover {
  border-color: var(--border-mid);
  box-shadow: 0 0 0 1px rgba(99,135,255,0.10), 0 8px 32px rgba(0,0,0,0.3);
}
.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(99,135,255,0.10);
  border: 1px solid rgba(99,135,255,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand);
  margin-bottom: 1rem;
}

/* ─── Book Recommendation Card ───────────────────────────── */
.rec-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 1.5rem;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
}
.rec-card:hover {
  border-color: var(--border-mid);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  transform: translateY(-2px);
}
.rec-card-top {
  border-color: var(--brand);
  border-left: 3px solid var(--brand);
  box-shadow: -3px 0 16px rgba(99,135,255,0.12);
}
.rec-rank {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.rec-rank-top { color: var(--brand); }

/* ─── Session / Phase UI ─────────────────────────────────── */
.phase-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--brand);
}
.phase-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand);
  animation: pulseBrand 2s ease-in-out infinite;
}

/* ─── AI Response Block ──────────────────────────────────── */
.ai-message {
  background: rgba(99,135,255,0.04);
  border: 1px solid rgba(99,135,255,0.12);
  border-radius: 10px;
  padding: 1.25rem 1.375rem;
  font-size: 0.938rem;
  color: var(--text-secondary);
  line-height: 1.7;
  position: relative;
}
.ai-message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--brand);
}
.ai-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(99,135,255,0.12);
  border: 1px solid rgba(99,135,255,0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand);
}

/* ─── Stat Cards ─────────────────────────────────────────── */
.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 1.25rem;
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  line-height: 1;
}
.stat-label-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 0.375rem;
}

/* ─── Animations ─────────────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes pulseBrand {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99,135,255,0); }
  50%       { box-shadow: 0 0 0 6px rgba(99,135,255,0.10); }
}
```

---

## Component Guidelines

### NavBar
- Height: 56px, fixed top
- Background: `rgba(10,14,26,0.85)` with `backdrop-filter: blur(12px) saturate(180%)`
- Border bottom: `1px solid var(--border-subtle)`
- Logo: wordmark in Inter 700, white. Small brand dot or icon in brand color.
- Nav links: Inter 500, `--text-tertiary` → `--text-primary` on hover
- CTA button: `btn-primary` compact (small padding)
- Active route: `nav-link-active` class

### Landing Page (`/`)
- Remove candles, Victorian background, typewriter intro
- Hero: centered, large DM Serif Display headline + Inter subtitle
- Grid background (`hero-grid-bg`) with radial glow (`hero-glow`)
- 3 feature cards below hero
- Single bold CTA: "Get Started Free" (brand button)
- Social proof strip: logos or "X teams trust RecoFlow"
- No animation except `fade-up` stagger on feature cards

### Auth Page (`/auth`)
- Centered card (max-width: 400px)
- Standard `card` class with larger padding
- Email/password inputs with `input` class
- Submit: full-width `btn-primary`
- OAuth divider with `divider-label`

### Enter Page (`/enter`)
- Step indicator at top (Step 1 of 2)
- Clean form with labeled `input` fields
- "Add another book" as text link, not styled button
- Remove Victorian ornament borders

### Session Page (`/session`)
- Step indicator: "Analyzing → Questions → Recommendations"
- AI messages use `ai-message` block with brand-colored "Nyx · AI Guide" header
- Replace typewriter with simple fade-in (`animate-fade-in`)
- Progress bar (`progress-track` + `progress-fill`) during loading
- Brain dump textarea uses `textarea` class with character count

### Recommendations Page (`/recommendations`)
- Page title: "Your Reading Map" or "Recommendations for [Date]"
- `rec-card` for each book; `rec-card-top` for rank #1
- Rank as small `badge-brand` top-left
- Export button: `btn-secondary` with download icon

### Library Page (`/library`)
- Table or card list of past sessions
- Date, books read, # recommendations per row
- Click to expand → show `rec-card` list inline

---

## Remove Completely

The following must be **fully deleted** in the redesign:

| Element | File | Replacement |
|---|---|---|
| `VictorianBackground.tsx` | `components/VictorianBackground.tsx` | CSS grid bg + radial glow |
| `CandleFlicker.tsx` | `components/CandleFlicker.tsx` | None (remove usage) |
| `TypewriterText.tsx` | `components/TypewriterText.tsx` | Simple fade-in text |
| Victorian border panel CSS | `globals.css` | `.card` class |
| Grain overlay + vignette | `layout.tsx` + `globals.css` | Remove entirely |
| Film grain animation | `tailwind.config.ts` | Remove |
| Cinzel Decorative font | `layout.tsx` + everywhere | Inter |
| IM Fell English font | `layout.tsx` + everywhere | Inter |
| `btn-primary` Victorian shimmer | `globals.css` | Flat brand button above |
| `nyx-speech` bubble | `globals.css` | `.ai-message` |
| `nyx-input` | `globals.css` | `.input` |
| `victorian-border` | `globals.css` | `.card` |
| `theme-chip` italic serif | `globals.css` | `.badge-neutral` |
| Gothic gradient background | `tailwind.config.ts` + pages | `--bg-base` |
| `book-card` with Gothic styling | `globals.css` | `.rec-card` |
| Canvas particle system | `VictorianBackground.tsx` | Remove |
| Gold color system | `tailwind.config.ts` | Brand blue system |
| Nyx SVG witch portrait | `components/Nyx.tsx` | Clean `ai-avatar` icon |

---

## AI Character: Nyx Redesign

Nyx remains as the AI guide persona but is redesigned:

- **No witch hat SVG portrait.** Replace with a clean geometric avatar: rounded square with a sparkle or brain icon in brand color.
- **Name label**: "Nyx · AI Guide" in small `badge-brand`
- **Speech**: `.ai-message` block, no italic serif, no quote marks, no left gold border
- **TypewriterText**: Replace with simple `opacity: 0 → 1` fade-in on mount

New `Nyx.tsx` component signature:
```tsx
// Renders: ai-avatar icon + "Nyx · AI Guide" label + message in ai-message block
<NyxMessage message="..." loading={false} />
```

---

## Landing Page Copy (B2B Focused)

### Headline (DM Serif Display)
```
Your team reads more.
They absorb more.
```

### Subheadline (Inter, secondary color)
```
RecoFlow's AI analyzes what your team is already reading,
finds the hidden connections, and recommends exactly what to read next —
so every book compounds on the last.
```

### Feature Cards
1. **Deep Analysis** — "We don't just match genres. We map the thematic DNA of what you're reading and find titles that amplify it."
2. **Personalized Questions** — "Our AI asks three targeted questions to understand your goals, mood, and learning direction right now."
3. **Team Library** — "Every recommendation is saved. Build a shared reading history your whole team can learn from."

### CTA
"Start Your First Recommendation — Free"

---

## Professional UX Patterns to Add

1. **Empty states**: When library is empty, show a clean illustration + "No recommendations yet. Start your first session →"
2. **Onboarding tooltip**: First-time users get a subtle tooltip walkthrough (not a modal)
3. **Keyboard shortcuts**: Show `Cmd+Enter` hint in textarea placeholder
4. **Error states**: Use red `input` border + error message below (not toast)
5. **Success feedback**: Subtle green checkmark animation, not full-screen overlay
6. **Loading skeletons**: Use `.skeleton` divs while content loads, not spinners alone

---

## File Change Map

| File | Action |
|---|---|
| `tailwind.config.ts` | Full replace with new config |
| `app/globals.css` | Full replace with new CSS |
| `app/layout.tsx` | Remove fonts, grain, vignette. Add Inter + DM Serif Display. |
| `components/NavBar.tsx` | Redesign with new system |
| `components/Nyx.tsx` | Redesign as `NyxMessage` with ai-message block |
| `components/BookCard.tsx` | Redesign as `RecCard` with new card system |
| `components/BookEntry.tsx` | Use `.input` and `.label` classes |
| `components/BrainDump.tsx` | Use `.textarea`, `.progress-track` |
| `components/VictorianBackground.tsx` | **Delete** |
| `components/CandleFlicker.tsx` | **Delete** |
| `components/TypewriterText.tsx` | **Delete** (or repurpose as simple fade) |
| `app/page.tsx` / `LandingClient.tsx` | Full redesign with hero grid + features |
| `app/auth/AuthForm.tsx` | Clean centered card form |
| `app/enter/page.tsx` | Step indicator + clean form |
| `app/session/page.tsx` | Phase indicator + ai-message blocks |
| `app/recommendations/page.tsx` | rec-card grid |
| `app/library/page.tsx` + `LibraryClient.tsx` | Clean table/card list |
| `app/profile/page.tsx` + `ProfileClient.tsx` | Stat cards + clean layout |

---

## Quality Checklist

Before considering the redesign complete, verify:

- [ ] No Cinzel Decorative or IM Fell English references anywhere
- [ ] No gold/parchment color values remaining
- [ ] No film grain, vignette, candle, or Victorian border elements
- [ ] All buttons use `.btn-primary`, `.btn-secondary`, or `.btn-ghost`
- [ ] All inputs use `.input` or `.textarea`
- [ ] All cards use `.card` or `.rec-card`
- [ ] NavBar is clean, 56px, frosted glass
- [ ] Landing page has DM Serif headline + Inter body + feature cards
- [ ] AI messages use `.ai-message` block
- [ ] Progress indicators use `.progress-track` + `.progress-fill`
- [ ] Loading states use `.spinner` or `.skeleton`
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] All pages render correctly at mobile (375px) and desktop (1280px)
