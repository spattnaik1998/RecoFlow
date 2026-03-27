"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10C3 6.13 6.13 3 10 3s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 7v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Thematic Intersection",
    desc: "AI finds the hidden conceptual threads connecting everything you're reading at once.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 15V8l6-5 6 5v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 16v-4h4v4" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: "10 Ranked Picks",
    desc: "Sonnet 4.6 ranks candidates by thematic resonance, intellectual tension, and right-now relevance.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M17 12a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v4Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Compounds Over Time",
    desc: "Every session enriches your reading profile. Recommendations get sharper the more you use it.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Reading Circles",
    desc: "Share sessions and recommendations with your team. Vote, comment, and build a collective canon.",
  },
];

const STEPS = [
  { n: "01", label: "Enter your books", detail: "Tell us what you're reading right now — 1 to 5 titles." },
  { n: "02", label: "Nyx analyzes", detail: "AI maps the thematic intersections across your reading list." },
  { n: "03", label: "Brain dump", detail: "Answer three introspective questions to sharpen the signal." },
  { n: "04", label: "Get your list", detail: "10 ranked recommendations, explained. Yours to keep." },
];

export default function LandingClient() {
  return (
    <div className="min-h-screen relative" style={{ background: "var(--bg-base)" }}>
      {/* Subtle grid background */}
      <div className="hero-grid-bg" />

      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 600,
          background: "radial-gradient(ellipse at center, rgba(99,135,255,0.06) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      {/* ── Hero ── */}
      <section className="relative z-10 pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
            style={{
              background: "rgba(99,135,255,0.08)",
              border: "1px solid rgba(99,135,255,0.2)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--brand)", boxShadow: "0 0 6px var(--brand)" }}
            />
            <span className="text-xs font-medium" style={{ color: "var(--brand-subtle)" }}>
              AI Reading Intelligence
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display mb-6"
            style={{
              fontSize: "clamp(2.6rem, 6vw, 4.5rem)",
              lineHeight: 1.1,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Smarter reading,<br />
            <span style={{ color: "var(--brand)" }}>for teams that think.</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-lg mb-10 mx-auto"
            style={{ color: "var(--text-secondary)", maxWidth: 520, lineHeight: 1.7 }}
          >
            RecoFlow analyzes what you're reading, finds the hidden connections,
            and recommends exactly what to read next — every time.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/auth" className="btn-primary">
              Get started free
            </Link>
            <Link
              href="/auth"
              className="btn-ghost"
            >
              See how it works →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <p className="text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: "var(--brand-subtle)" }}>
              How it works
            </p>
            <h2
              className="font-display"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              Four steps to your next great read
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(({ n, label, detail }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card p-5"
              >
                <div
                  className="text-2xl font-bold mb-3"
                  style={{ color: "rgba(99,135,255,0.2)", fontVariantNumeric: "tabular-nums" }}
                >
                  {n}
                </div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {label}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  {detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <p className="text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: "var(--brand-subtle)" }}>
              Features
            </p>
            <h2
              className="font-display"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              Built for serious readers
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="feature-card p-6"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(99,135,255,0.1)",
                    color: "var(--brand-subtle)",
                    border: "1px solid rgba(99,135,255,0.15)",
                  }}
                >
                  {icon}
                </div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA footer ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="font-display mb-4"
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Your next book is waiting.
            </h2>
            <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
              It takes under 3 minutes to get 10 personalized recommendations.
            </p>
            <Link href="/auth" className="btn-primary">
              Start reading smarter
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
