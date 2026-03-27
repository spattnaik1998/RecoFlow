"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import InsightCards from "./InsightCards";
import type { ProfileDashboardData, SessionSummaryRow } from "@/types";

export default function ProfileClient() {
  const [data, setData] = useState<ProfileDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allSessions, setAllSessions] = useState<SessionSummaryRow[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);

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
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  function formatMemberSince(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long" });
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-dots"><span /><span /><span /></div>
        <p className="loading-screen-label">Compiling your archive</p>
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="min-h-screen px-6 pt-28 pb-20">
      <div className="max-w-2xl mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="label-overline mb-3" style={{ color: "rgba(200,169,110,0.35)" }}>
            Intellectual Archive
          </p>
          <h1
            className="font-cinzel mb-4"
            style={{ fontSize: "1.5rem", color: "var(--gold)", letterSpacing: "0.04em" }}
          >
            {summary?.display_name ? `${summary.display_name}'s Archive` : "Your Archive"}
          </h1>
          <div className="gold-divider-center mb-6">✦</div>

          {/* Stats row */}
          {summary && summary.total_sessions > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center gap-0"
            >
              {[
                { value: summary.total_sessions, label: summary.total_sessions === 1 ? "Consultation" : "Consultations" },
                { value: summary.total_recommendations, label: summary.total_recommendations === 1 ? "Path Revealed" : "Paths Revealed" },
                { value: summary.top_themes.length, label: "Recurring Themes" },
              ].map((stat, i) => (
                <div key={i} className="flex items-stretch">
                  <div className="stat-block px-8 py-4">
                    <span className="stat-number">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                  {i < 2 && (
                    <div
                      style={{
                        width: 1,
                        background: "rgba(200,169,110,0.12)",
                        alignSelf: "center",
                        height: "2.5rem",
                      }}
                    />
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {summary && summary.member_since && (
            <p
              className="font-fell italic mt-4 text-xs"
              style={{ color: "rgba(200,169,110,0.3)" }}
            >
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
            <p
              className="font-fell italic mb-2"
              style={{ color: "rgba(200,169,110,0.3)", fontSize: "2rem" }}
            >
              ◌
            </p>
            <p
              className="font-fell italic mb-8 leading-relaxed"
              style={{ color: "rgba(232,213,183,0.4)", fontSize: "0.95rem" }}
            >
              The archive is empty. Begin a consultation<br />and your reading identity will take shape.
            </p>
            <Link href="/enter" className="btn-primary">Begin a Consultation</Link>
          </motion.div>
        )}

        {summary && summary.total_sessions > 0 && (
          <>
            {/* Intellectual territory */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="mb-10"
            >
              <p className="label-overline mb-4">Intellectual Territory</p>
              <div className="panel-inset">
                <p
                  className="font-fell italic leading-relaxed"
                  style={{ color: "rgba(232,213,183,0.72)", fontSize: "0.97rem" }}
                >
                  {summary.intellectual_territory}
                </p>
              </div>
            </motion.div>

            {/* Theme cloud */}
            {summary.top_themes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.7 }}
                className="mb-10"
              >
                <p className="label-overline mb-5">Recurring Themes</p>
                <div className="flex flex-wrap gap-2">
                  {summary.top_themes.map((cluster) => {
                    const maxFreq = summary.top_themes[0].frequency;
                    const size = maxFreq > 1
                      ? 0.72 + ((cluster.frequency - 1) / (maxFreq - 1)) * 0.4
                      : 1;
                    const opacity = 0.45 + (cluster.frequency / maxFreq) * 0.5;
                    return (
                      <span
                        key={cluster.theme}
                        className="theme-chip"
                        style={{ fontSize: `${size}rem`, color: `rgba(232,213,183,${opacity})` }}
                        title={`${cluster.frequency} session${cluster.frequency !== 1 ? "s" : ""}`}
                      >
                        {cluster.theme}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Insights */}
            {data?.insights && data.insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="mb-12"
              >
                <p className="label-overline mb-5">Nyx&rsquo;s Observations</p>
                <InsightCards insights={data.insights} />
              </motion.div>
            )}

            {/* Divider */}
            <div className="gold-divider mb-10" />

            {/* Session history */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
            >
              <p className="label-overline mb-6">Consultation History</p>

              <div className="space-y-3">
                {allSessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.4 }}
                    className="victorian-border p-5 cursor-pointer"
                    onClick={() => setExpanded(expanded === session.id ? null : session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p
                          className="label-overline mb-1.5"
                          style={{ color: "rgba(200,169,110,0.35)" }}
                        >
                          {formatDate(session.created_at)}
                        </p>
                        <p
                          className="font-fell truncate"
                          style={{ color: "var(--parchment)", fontSize: "0.95rem" }}
                        >
                          {session.books.map((b) => `"${b.title}"`).join(", ")}
                        </p>
                        {session.theme_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {session.theme_tags.map((tag) => (
                              <span
                                key={tag}
                                className="font-fell italic"
                                style={{
                                  fontSize: "0.68rem",
                                  padding: "0.15rem 0.55rem",
                                  border: "1px solid rgba(200,169,110,0.12)",
                                  color: "rgba(200,169,110,0.4)",
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span
                        className="font-fell italic ml-3 flex-shrink-0"
                        style={{ fontSize: "0.7rem", color: "rgba(200,169,110,0.35)", marginTop: 2 }}
                      >
                        {expanded === session.id ? "▲" : "▼"}
                      </span>
                    </div>

                    <AnimatePresence>
                      {expanded === session.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-5 pt-5"
                          style={{ borderTop: "1px solid rgba(200,169,110,0.08)" }}
                        >
                          {session.top_recommendation && (
                            <div className="mb-5">
                              <p className="label-overline mb-2" style={{ color: "rgba(200,169,110,0.35)" }}>
                                Oracle&rsquo;s Choice
                              </p>
                              <p className="font-fell" style={{ color: "var(--parchment)", fontSize: "0.95rem" }}>
                                {session.top_recommendation.title}
                              </p>
                              <p className="font-fell italic text-sm" style={{ color: "var(--gold-dim)" }}>
                                {session.top_recommendation.author}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="label-overline mb-2" style={{ color: "rgba(200,169,110,0.35)" }}>
                              Books Entered
                            </p>
                            <div className="space-y-1">
                              {session.books.map((b, bi) => (
                                <p
                                  key={bi}
                                  className="font-fell"
                                  style={{ fontSize: "0.88rem", color: "rgba(232,213,183,0.65)" }}
                                >
                                  {b.title}
                                  <span className="italic" style={{ color: "var(--gold-dim)", marginLeft: 4 }}>
                                    — {b.author}
                                  </span>
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
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="btn-ghost"
                    style={{ opacity: loadingMore ? 0.5 : 1 }}
                  >
                    {loadingMore ? "Loading…" : "Load Earlier Consultations"}
                  </button>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-14 text-center"
            >
              <Link href="/enter" className="btn-ghost">
                Begin a New Consultation
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
