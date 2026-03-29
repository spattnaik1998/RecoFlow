"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import InsightCards from "./InsightCards";
import type { ProfileDashboardData, SessionSummaryRow } from "@/types";
import type { PortraitResponse } from "@/app/api/profile/portrait/route";

// Dynamic imports keep D3/Recharts out of the server bundle
const ThemeConstellation = dynamic(() => import("@/components/ThemeConstellation"), {
  ssr: false,
  loading: () => <div style={{ height: 320, background: "#0A0E1A", borderRadius: 10 }} />,
});
const TemporalDriftMap = dynamic(() => import("@/components/TemporalDriftMap"), {
  ssr: false,
  loading: () => <div style={{ height: 280, background: "transparent" }} />,
});

export default function ProfileClient() {
  const [data, setData] = useState<ProfileDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allSessions, setAllSessions] = useState<SessionSummaryRow[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);

  // Reading DNA state
  const [portrait, setPortrait] = useState<PortraitResponse | null>(null);
  const [portraitLoading, setPortraitLoading] = useState(false);
  const [filterTheme, setFilterTheme] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d: ProfileDashboardData) => {
        setData(d);
        setAllSessions(d.recent_sessions);
        setTotalSessions(d.total_session_count);
      })
      .catch(() => {/* silent */})
      .finally(() => setLoading(false));
  }, []);

  // Fetch portrait + DNA sessions once profile is loaded and has sessions
  useEffect(() => {
    if (loading) return;
    if (!data?.summary || data.summary.total_sessions === 0) return;
    setPortraitLoading(true);
    fetch("/api/profile/portrait")
      .then((r) => r.json())
      .then((d: PortraitResponse) => setPortrait(d))
      .catch(() => {/* silent */})
      .finally(() => setPortraitLoading(false));
  }, [loading, data?.summary?.total_sessions]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/profile/sessions?page=${nextPage}&limit=10`);
      const json = await res.json() as { sessions: SessionSummaryRow[]; total: number };
      setAllSessions((prev) => [...prev, ...json.sessions]);
      setPage(nextPage);
    } catch {/* silent */}
    setLoadingMore(false);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
  function formatMemberSince(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long" });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="spinner" />
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="min-h-screen pt-20 pb-20 px-6" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1
            className="font-display text-2xl mb-1"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            {summary?.display_name ? `${summary.display_name}'s profile` : "Your profile"}
          </h1>
          {summary?.member_since && (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Reading since {formatMemberSince(summary.member_since)}
            </p>
          )}
        </motion.div>

        {/* Empty state */}
        {summary && summary.total_sessions === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
              Your profile builds over time. Start your first session to see insights.
            </p>
            <Link href="/enter" className="btn-primary">Start a session</Link>
          </motion.div>
        )}

        {summary && summary.total_sessions > 0 && (
          <>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="grid grid-cols-3 gap-3 mb-8"
            >
              {[
                { value: summary.total_sessions, label: "Sessions" },
                { value: summary.total_recommendations, label: "Recommendations" },
                { value: summary.top_themes.length, label: "Themes" },
              ].map((stat) => (
                <div key={stat.label} className="stat-card">
                  <div className="stat-value">{stat.value}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Intellectual territory */}
            {summary.intellectual_territory && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="card p-5 mb-6"
              >
                <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
                  Intellectual territory
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {summary.intellectual_territory}
                </p>
              </motion.div>
            )}

            {/* Theme cloud */}
            {summary.top_themes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
                  Recurring themes
                </p>
                <div className="flex flex-wrap gap-2">
                  {summary.top_themes.map((cluster) => {
                    const maxFreq = summary.top_themes[0].frequency;
                    const sizeFactor = maxFreq > 1 ? 0.75 + ((cluster.frequency - 1) / (maxFreq - 1)) * 0.3 : 1;
                    return (
                      <span
                        key={cluster.theme}
                        className="px-2.5 py-1 rounded-full text-xs transition-colors duration-150"
                        style={{
                          fontSize: `${sizeFactor * 0.8}rem`,
                          background: "rgba(99,135,255,0.08)",
                          border: "1px solid rgba(99,135,255,0.15)",
                          color: "var(--brand-subtle)",
                          cursor: "default",
                        }}
                        title={`${cluster.frequency} session${cluster.frequency !== 1 ? "s" : ""}`}
                      >
                        {cluster.theme}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Reading DNA ─────────────────────────────────── */}
            {(portraitLoading || portrait) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.5 }}
                className="mb-8"
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Reading DNA
                  </p>
                  <div style={{ flex: 1, height: 1, background: "rgba(99,135,255,0.08)" }} />
                </div>

                {/* 1. Reading Portrait */}
                <div className="card p-5 mb-5">
                  <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
                    Nyx&rsquo;s portrait of you
                  </p>
                  {portraitLoading && !portrait?.portrait ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner" style={{ width: 14, height: 14 }} />
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nyx is composing your portrait…</p>
                    </div>
                  ) : portrait?.portrait ? (
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
                      &ldquo;{portrait.portrait}&rdquo;
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Portrait not yet available. Complete more sessions.
                    </p>
                  )}
                </div>

                {/* 2. Theme Constellation */}
                {data?.summary?.top_themes && data.summary.top_themes.length > 0 && portrait?.dna_sessions && (
                  <div className="mb-5">
                    <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
                      Theme constellation
                    </p>
                    <ThemeConstellation
                      themes={data.summary.top_themes}
                      sessions={portrait.dna_sessions}
                      activeTheme={filterTheme}
                      onThemeClick={setFilterTheme}
                    />
                  </div>
                )}

                {/* 3. Temporal Drift Map */}
                {portrait?.dna_sessions && portrait.dna_sessions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        Temporal drift map
                      </p>
                      {filterTheme && (
                        <span className="text-xs px-2 py-0.5 rounded"
                          style={{ background: "rgba(200,169,110,0.12)", color: "#C8A96E", border: "1px solid rgba(200,169,110,0.25)" }}>
                          Filtered: {filterTheme}
                        </span>
                      )}
                    </div>
                    <TemporalDriftMap
                      sessions={portrait.dna_sessions}
                      filterTheme={filterTheme}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Insights */}
            {data?.insights && data.insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="mb-8"
              >
                <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
                  Insights
                </p>
                <InsightCards insights={data.insights} />
              </motion.div>
            )}

            {/* Session history */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
                Session history
              </p>

              <div className="space-y-2">
                {allSessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.35 }}
                    className="card cursor-pointer"
                    onClick={() => setExpanded(expanded === session.id ? null : session.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                            {formatDate(session.created_at)}
                          </p>
                          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                            {session.books.map((b) => b.title).join(", ")}
                          </p>
                          {session.theme_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {session.theme_tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-0.5 rounded"
                                  style={{
                                    background: "rgba(99,135,255,0.07)",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <svg
                          width="14" height="14" viewBox="0 0 14 14" fill="none"
                          className="flex-shrink-0 mt-1 transition-transform duration-200"
                          style={{
                            color: "var(--text-muted)",
                            transform: expanded === session.id ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        >
                          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expanded === session.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid rgba(99,135,255,0.08)" }}>
                            {session.top_recommendation && (
                              <div className="mb-3">
                                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Top recommendation</p>
                                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                  {session.top_recommendation.title}
                                </p>
                                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                                  {session.top_recommendation.author}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Books</p>
                              {session.books.map((b, bi) => (
                                <p key={bi} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                  {b.title} <span style={{ color: "var(--text-muted)" }}>— {b.author}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {allSessions.length < totalSessions && (
                <div className="mt-5">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="btn-ghost"
                    style={{ opacity: loadingMore ? 0.5 : 1 }}
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </motion.div>

            <div className="mt-10">
              <Link href="/enter" className="btn-ghost">
                New session
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
