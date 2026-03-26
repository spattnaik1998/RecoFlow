"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import CandleFlicker from "@/components/CandleFlicker";
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
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatMemberSince(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Candles */}
        <div className="flex gap-10 justify-center mb-10">
          <CandleFlicker size={28} />
          <CandleFlicker size={36} />
          <CandleFlicker size={28} />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="font-cinzel text-3xl mb-2" style={{ color: "#C8A96E" }}>
            {summary?.display_name ? `${summary.display_name}&rsquo;s Archive` : "Your Archive"}
          </h1>
          <div className="gold-divider-center mb-4">✦</div>
          {summary && summary.total_sessions > 0 && (
            <p className="font-fell italic text-sm" style={{ color: "rgba(232,213,183,0.5)" }}>
              Reading since {formatMemberSince(summary.member_since)} &middot;{" "}
              {summary.total_sessions} consultation{summary.total_sessions !== 1 ? "s" : ""} &middot;{" "}
              {summary.total_recommendations} path{summary.total_recommendations !== 1 ? "s" : ""} revealed
            </p>
          )}
        </motion.div>

        {/* Empty state */}
        {summary && summary.total_sessions === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="font-fell italic mb-4" style={{ color: "rgba(232,213,183,0.5)" }}>
              The archive is empty. Begin a consultation and your reading identity will take shape.
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
              className="mb-10 p-6"
              style={{
                border: "1px solid rgba(200,169,110,0.2)",
                background: "rgba(200,169,110,0.03)",
              }}
            >
              <p
                className="font-cinzel text-xs tracking-widest uppercase mb-3"
                style={{ color: "rgba(200,169,110,0.5)" }}
              >
                Intellectual Territory
              </p>
              <p className="font-fell italic leading-relaxed" style={{ color: "rgba(232,213,183,0.75)" }}>
                {summary.intellectual_territory}
              </p>
            </motion.div>

            {/* Theme clusters */}
            {summary.top_themes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.7 }}
                className="mb-10"
              >
                <p
                  className="font-cinzel text-xs tracking-widest uppercase mb-4"
                  style={{ color: "rgba(200,169,110,0.5)" }}
                >
                  Recurring Themes
                </p>
                <div className="flex flex-wrap gap-2">
                  {summary.top_themes.map((cluster) => {
                    // Larger font-size = higher frequency (range: 0.7rem – 1.1rem)
                    const maxFreq = summary.top_themes[0].frequency;
                    const minSize = 0.7;
                    const maxSize = 1.1;
                    const size =
                      maxFreq > 1
                        ? minSize + ((cluster.frequency - 1) / (maxFreq - 1)) * (maxSize - minSize)
                        : maxSize;
                    return (
                      <span
                        key={cluster.theme}
                        className="px-3 py-1 font-fell italic"
                        style={{
                          fontSize: `${size}rem`,
                          border: "1px solid rgba(200,169,110,0.25)",
                          color: `rgba(232,213,183,${0.5 + (cluster.frequency / maxFreq) * 0.45})`,
                          background: "rgba(200,169,110,0.04)",
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

            {/* Insights */}
            {data?.insights && data.insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="mb-12"
              >
                <p
                  className="font-cinzel text-xs tracking-widest uppercase mb-4"
                  style={{ color: "rgba(200,169,110,0.5)" }}
                >
                  Nyx&rsquo;s Observations
                </p>
                <InsightCards insights={data.insights} />
              </motion.div>
            )}

            {/* Divider */}
            <div
              className="mb-10"
              style={{
                height: "1px",
                background:
                  "linear-gradient(to right, transparent, rgba(200,169,110,0.2), transparent)",
              }}
            />

            {/* Session history */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
            >
              <p
                className="font-cinzel text-xs tracking-widest uppercase mb-6"
                style={{ color: "rgba(200,169,110,0.5)" }}
              >
                Consultation History
              </p>

              <div className="space-y-3">
                {allSessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                    className="victorian-border p-5 cursor-pointer"
                    onClick={() =>
                      setExpanded(expanded === session.id ? null : session.id)
                    }
                  >
                    {/* Session header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-cinzel text-xs tracking-widest uppercase mb-1"
                          style={{ color: "rgba(200,169,110,0.45)" }}
                        >
                          {formatDate(session.created_at)}
                        </p>
                        <p
                          className="font-fell truncate"
                          style={{ color: "#E8D5B7" }}
                        >
                          {session.books.map((b) => `"${b.title}"`).join(", ")}
                        </p>
                        {/* Theme tags */}
                        {session.theme_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {session.theme_tags.map((tag) => (
                              <span
                                key={tag}
                                className="font-fell italic text-xs px-2 py-0.5"
                                style={{
                                  border: "1px solid rgba(200,169,110,0.15)",
                                  color: "rgba(200,169,110,0.5)",
                                  fontSize: "0.7rem",
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span
                        className="font-fell italic text-xs mt-1 ml-3 flex-shrink-0"
                        style={{ color: "rgba(200,169,110,0.4)" }}
                      >
                        {expanded === session.id ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* Expanded: top recommendation + all books */}
                    {expanded === session.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-gold/10"
                      >
                        {session.top_recommendation && (
                          <div className="mb-4">
                            <p
                              className="font-cinzel text-xs tracking-widest uppercase mb-2"
                              style={{ color: "rgba(200,169,110,0.4)" }}
                            >
                              Oracle&rsquo;s Choice
                            </p>
                            <p className="font-fell" style={{ color: "#E8D5B7" }}>
                              {session.top_recommendation.title}
                            </p>
                            <p
                              className="font-fell italic text-sm"
                              style={{ color: "rgba(200,169,110,0.6)" }}
                            >
                              {session.top_recommendation.author}
                            </p>
                          </div>
                        )}
                        <div>
                          <p
                            className="font-cinzel text-xs tracking-widest uppercase mb-2"
                            style={{ color: "rgba(200,169,110,0.4)" }}
                          >
                            Books Entered
                          </p>
                          <div className="space-y-1">
                            {session.books.map((b, bi) => (
                              <p
                                key={bi}
                                className="font-fell text-sm"
                                style={{ color: "rgba(232,213,183,0.7)" }}
                              >
                                {b.title}
                                <span
                                  className="italic ml-1"
                                  style={{ color: "rgba(200,169,110,0.5)" }}
                                >
                                  — {b.author}
                                </span>
                              </p>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Load more */}
              {allSessions.length < totalSessions && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="btn-ghost"
                    style={{ opacity: loadingMore ? 0.5 : 1 }}
                  >
                    {loadingMore ? "Loading..." : "Load Earlier Consultations"}
                  </button>
                </div>
              )}
            </motion.div>

            {/* New consultation CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 text-center"
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
