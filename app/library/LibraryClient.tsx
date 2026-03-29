"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ExportPanel from "@/components/ExportPanel";
import { getActiveCircleId } from "@/components/CircleSwitcher";
import type { ReadingSession, Book, Recommendation } from "@/types";

interface SessionWithDetails extends ReadingSession {
  books: Book[];
  recommendations: Recommendation[];
}

export default function LibraryClient() {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);

  useEffect(() => {
    const circleId = getActiveCircleId();
    setActiveCircleId(circleId);
    loadSessions(circleId);

    function onCircleChanged(e: Event) {
      const detail = (e as CustomEvent<{ circleId: string | null }>).detail;
      setActiveCircleId(detail.circleId);
      loadSessions(detail.circleId);
    }
    window.addEventListener("circle-changed", onCircleChanged);
    return () => window.removeEventListener("circle-changed", onCircleChanged);
  }, []);

  async function loadSessions(circleId?: string | null) {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    let query = supabase
      .from("reading_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (circleId) query = query.eq("circle_id", circleId);

    const { data: sessionData } = await query;
    if (!sessionData) { setLoading(false); return; }

    const detailed = await Promise.all(
      sessionData.map(async (session) => {
        const [booksRes, recsRes] = await Promise.all([
          supabase.from("current_books").select("*").eq("session_id", session.id),
          supabase.from("recommendations").select("*").eq("session_id", session.id).order("rank"),
        ]);
        return { ...session, books: booksRes.data ?? [], recommendations: recsRes.data ?? [] };
      })
    );

    setSessions(detailed);
    setLoading(false);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-6" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1
            className="font-display text-2xl mb-1"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Reading history
          </h1>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            {activeCircleId
              ? "Showing sessions shared with this circle."
              : "All your past sessions and recommendations."}
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="spinner" />
          </div>
        )}

        {/* Empty state */}
        {!loading && sessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(99,135,255,0.08)", border: "1px solid rgba(99,135,255,0.12)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 4h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke="var(--brand-subtle)" strokeWidth="1.5"/>
                <path d="M7 8h6M7 11h4" stroke="var(--brand-subtle)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
              No sessions yet. Start your first consultation.
            </p>
            <Link href="/enter" className="btn-primary">
              Start a session
            </Link>
          </motion.div>
        )}

        {/* Sessions list */}
        {!loading && sessions.length > 0 && (
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="card cursor-pointer transition-all duration-150 hover:border-brand/30"
                onClick={() => setExpanded(expanded === session.id ? null : session.id)}
              >
                <div className="p-4">
                  {/* Session header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                        {formatDate(session.created_at)}
                      </p>
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {session.books.map((b) => b.title).join(", ")}
                      </p>
                      {session.recommendations.length > 0 && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {session.recommendations.length} recommendations
                        </p>
                      )}
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
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

                {/* Expanded */}
                <AnimatePresence>
                  {expanded === session.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-4 pb-4 pt-3"
                        style={{ borderTop: "1px solid rgba(99,135,255,0.08)" }}
                      >
                        {/* Books read */}
                        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                          Books read
                        </p>
                        <div className="space-y-1 mb-4">
                          {session.books.map((b, bi) => (
                            <p key={bi} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              {b.title}
                              <span style={{ color: "var(--text-muted)" }}> — {b.author}</span>
                            </p>
                          ))}
                        </div>

                        {/* Top rec */}
                        {session.recommendations.length > 0 && (
                          <>
                            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                              Top recommendation
                            </p>
                            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                              {session.recommendations[0].title}
                            </p>
                            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                              {session.recommendations[0].author}
                            </p>
                          </>
                        )}

                        {/* Export panel */}
                        <div className="mt-4">
                          <ExportPanel sessionId={session.id} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <Link href="/enter" className="btn-ghost">
              New session
            </Link>
            <Link href="/profile" className="btn-ghost">
              My Reading DNA
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
