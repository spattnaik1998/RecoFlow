"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import RecommendationReveal from "@/components/RecommendationReveal";
import ExportPanel from "@/components/ExportPanel";
import { SESSION_KEYS } from "@/types";
import type { Recommendation, MediaRecommendation, GetMediaRecommendationsResponse, NyxPreferenceSuggestion } from "@/types";

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [podcasts, setPodcasts] = useState<MediaRecommendation[]>([]);
  const [articles, setArticles] = useState<MediaRecommendation[]>([]);
  const [podcastsOpen, setPodcastsOpen] = useState(true);
  const [articlesOpen, setArticlesOpen] = useState(true);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [prefSuggestions, setPrefSuggestions] = useState<NyxPreferenceSuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEYS.RECOMMENDATIONS);
    if (!raw) { router.push("/enter"); return; }
    try {
      setRecommendations(JSON.parse(raw) as Recommendation[]);
      setSessionId(sessionStorage.getItem(SESSION_KEYS.SESSION_ID) ?? undefined);

      const mediaRaw = sessionStorage.getItem(SESSION_KEYS.MEDIA_RECOMMENDATIONS);
      if (mediaRaw) {
        const mediaData = JSON.parse(mediaRaw) as GetMediaRecommendationsResponse;
        setPodcasts(mediaData.podcasts ?? []);
        setArticles(mediaData.articles ?? []);
      }
    } catch {
      router.push("/enter");
    } finally {
      setLoading(false);
    }

    // Fire-and-forget learn call to surface preference suggestions
    fetch("/api/preferences/learn")
      .then((r) => r.json())
      .then((d: { suggestions?: NyxPreferenceSuggestion[] }) => {
        if (d.suggestions && d.suggestions.length > 0) {
          setPrefSuggestions(d.suggestions);
        }
      })
      .catch(() => {/* non-fatal */});
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 px-6" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: "var(--brand-subtle)" }}>
            Your reading list
          </p>
          <h1
            className="font-display text-2xl"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            10 recommendations, ranked by resonance
          </h1>
        </motion.div>

        {/* Cards */}
        <RecommendationReveal recommendations={recommendations} sessionId={sessionId} />

        {/* Export */}
        {sessionId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 8, duration: 0.8 }}
            className="mt-10"
          >
            <ExportPanel sessionId={sessionId} />
          </motion.div>
        )}

        {/* ── Preference Suggestions ─────────────────────────────── */}
        <AnimatePresence>
          {prefSuggestions
            .filter((s) => !dismissedSuggestions.has(s.reason_code))
            .slice(0, 1) // show one at a time
            .map((suggestion) => (
              <motion.div
                key={suggestion.reason_code}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: 9.5, duration: 0.5 }}
                className="mt-8"
              >
                <PreferenceSuggestionCard
                  suggestion={suggestion}
                  onAccept={async () => {
                    if (suggestion.action === "block_theme" && suggestion.payload) {
                      await fetch("/api/preferences", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ blocked_themes: [suggestion.payload] }),
                      }).catch(() => {/* non-fatal */});
                    } else if (suggestion.action === "prefer_author" && suggestion.payload) {
                      await fetch("/api/preferences", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ preferred_authors: [suggestion.payload] }),
                      }).catch(() => {/* non-fatal */});
                    }
                    setDismissedSuggestions((prev) => new Set([...prev, suggestion.reason_code]));
                  }}
                  onDismiss={() =>
                    setDismissedSuggestions((prev) => new Set([...prev, suggestion.reason_code]))
                  }
                />
              </motion.div>
            ))}
        </AnimatePresence>

        {/* ── Cross-Media Panels ─────────────────────────────────── */}
        {podcasts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 9, duration: 0.6 }}
            className="mt-10"
          >
            <MediaPanel
              title="Also Heard: Podcasts"
              items={podcasts}
              isOpen={podcastsOpen}
              onToggle={() => setPodcastsOpen((v) => !v)}
              durationKey="duration_estimate"
            />
          </motion.div>
        )}

        {articles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: podcasts.length > 0 ? 9.4 : 9, duration: 0.6 }}
            className="mt-6"
          >
            <MediaPanel
              title="Also Read: Longform"
              items={articles}
              isOpen={articlesOpen}
              onToggle={() => setArticlesOpen((v) => !v)}
              durationKey="read_time_estimate"
            />
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 8, duration: 0.8 }}
          className="mt-8 pt-8 flex flex-col sm:flex-row gap-3"
          style={{ borderTop: "1px solid rgba(99,135,255,0.08)" }}
        >
          <Link href="/enter" className="btn-secondary">
            New session
          </Link>
          <Link href="/library" className="btn-ghost">
            View history
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Preference Suggestion Card ──────────────────────────────────────────────

interface PreferenceSuggestionCardProps {
  suggestion: NyxPreferenceSuggestion;
  onAccept: () => Promise<void>;
  onDismiss: () => void;
}

function PreferenceSuggestionCard({ suggestion, onAccept, onDismiss }: PreferenceSuggestionCardProps) {
  const [accepting, setAccepting] = useState(false);

  const isActionable = suggestion.payload.length > 0;

  async function handleAccept() {
    setAccepting(true);
    await onAccept();
    setAccepting(false);
  }

  return (
    <div
      style={{
        border: "1px solid rgba(200,169,110,0.20)",
        borderRadius: "12px",
        background: "rgba(200,169,110,0.04)",
        padding: "1.25rem 1.5rem",
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        {/* Nyx glyph */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(200,169,110,0.12)",
            border: "1px solid rgba(200,169,110,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4" stroke="#C8A96E" strokeWidth="1.2"/>
            <circle cx="6" cy="6" r="1.5" fill="#C8A96E"/>
          </svg>
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)", fontStyle: "italic" }}
        >
          {suggestion.message}
        </p>
      </div>

      <div className="flex gap-2">
        {isActionable && (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="btn-primary"
            style={{ fontSize: "0.75rem", padding: "0.4rem 1rem", opacity: accepting ? 0.6 : 1 }}
          >
            {accepting ? "Adjusting…" : "Yes, adjust"}
          </button>
        )}
        <button
          onClick={onDismiss}
          className="btn-ghost"
          style={{ fontSize: "0.75rem", padding: "0.4rem 1rem" }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}

// ─── Media Panel ──────────────────────────────────────────────────────────────

interface MediaPanelProps {
  title: string;
  items: MediaRecommendation[];
  isOpen: boolean;
  onToggle: () => void;
  durationKey: "duration_estimate" | "read_time_estimate";
}

function MediaPanel({ title, items, isOpen, onToggle, durationKey }: MediaPanelProps) {
  return (
    <div
      style={{
        border: "1px solid rgba(99,135,255,0.10)",
        borderRadius: "12px",
        background: "var(--bg-surface)",
        overflow: "hidden",
      }}
    >
      {/* Panel header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          borderBottom: isOpen ? "1px solid rgba(99,135,255,0.08)" : "none",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "#A8BBFF", letterSpacing: "0.08em" }}
          >
            {title}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: "rgba(99,135,255,0.08)", color: "var(--text-muted)" }}
          >
            {items.length}
          </span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{
            color: "var(--text-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <path
            d="M2.5 5L7 9.5L11.5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Cards */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="p-4 space-y-3">
              {items.map((item, i) => (
                <a
                  key={`${item.title}-${i}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "var(--bg-raised)",
                      border: "1px solid rgba(99,135,255,0.08)",
                      borderRadius: "10px",
                      padding: "1rem 1.125rem",
                      transition: "border-color 0.2s ease, background 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,135,255,0.22)";
                      (e.currentTarget as HTMLDivElement).style.background = "var(--bg-overlay)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,135,255,0.08)";
                      (e.currentTarget as HTMLDivElement).style.background = "var(--bg-raised)";
                    }}
                  >
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4
                        className="font-medium leading-snug text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.title}
                      </h4>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: "3px" }}
                      >
                        <path
                          d="M2 10L10 2M10 2H5M10 2V7"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* Source + duration row */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {item.source}
                      </span>
                      {item[durationKey] && (
                        <>
                          <span style={{ color: "rgba(99,135,255,0.25)", fontSize: "0.6rem" }}>•</span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {item[durationKey]}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Nyx rationale */}
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                      {item.nyx_rationale}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
