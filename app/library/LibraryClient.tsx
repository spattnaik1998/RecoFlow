"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CandleFlicker from "@/components/CandleFlicker";
import { NYX_DIALOGUE } from "@/lib/nyx-dialogue";
import type { ReadingSession, Book, Recommendation } from "@/types";

interface SessionWithDetails extends ReadingSession {
  books: Book[];
  recommendations: Recommendation[];
}

export default function LibraryClient() {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: sessionData } = await supabase
      .from("reading_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!sessionData) { setLoading(false); return; }

    // Fetch books and recommendations for each session
    const detailed = await Promise.all(
      sessionData.map(async (session) => {
        const [booksRes, recsRes] = await Promise.all([
          supabase
            .from("current_books")
            .select("*")
            .eq("session_id", session.id),
          supabase
            .from("recommendations")
            .select("*")
            .eq("session_id", session.id)
            .order("rank"),
        ]);
        return {
          ...session,
          books: booksRes.data ?? [],
          recommendations: recsRes.data ?? [],
        };
      })
    );

    setSessions(detailed);
    setLoading(false);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Candles */}
        <div className="flex gap-10 justify-center mb-10">
          <CandleFlicker size={26} />
          <CandleFlicker size={32} />
          <CandleFlicker size={26} />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1 className="font-cinzel text-3xl mb-3" style={{ color: "#C8A96E" }}>
            {NYX_DIALOGUE.library_header}
          </h1>
          <p className="font-fell italic" style={{ color: "rgba(232,213,183,0.5)" }}>
            {NYX_DIALOGUE.library_subtitle}
          </p>
          <div className="gold-divider-center mt-4">✦</div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="loading-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && sessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="font-fell italic mb-8" style={{ color: "rgba(232,213,183,0.5)" }}>
              {NYX_DIALOGUE.library_empty}
            </p>
            <Link href="/enter" className="btn-primary">
              Begin a Consultation
            </Link>
          </motion.div>
        )}

        {/* Sessions */}
        {!loading && sessions.length > 0 && (
          <div className="space-y-4">
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="victorian-border p-5 cursor-pointer"
                onClick={() =>
                  setExpanded(expanded === session.id ? null : session.id)
                }
              >
                {/* Session header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="font-cinzel text-xs tracking-widest uppercase mb-1"
                      style={{ color: "rgba(200,169,110,0.5)" }}
                    >
                      {NYX_DIALOGUE.library_session_prefix} {formatDate(session.created_at)}
                    </p>
                    <p className="font-fell" style={{ color: "#E8D5B7" }}>
                      {session.books
                        .map((b) => `"${b.title}"`)
                        .join(", ")}
                    </p>
                  </div>
                  <span
                    className="font-fell italic text-xs mt-1"
                    style={{ color: "rgba(200,169,110,0.4)" }}
                  >
                    {expanded === session.id ? "▲" : "▼"}
                  </span>
                </div>

                {/* Expanded recommendations */}
                {expanded === session.id && session.recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gold/10"
                  >
                    <p
                      className="font-cinzel text-xs tracking-widest uppercase mb-3"
                      style={{ color: "rgba(200,169,110,0.4)" }}
                    >
                      Nyx Recommended
                    </p>
                    <div className="space-y-3">
                      {session.recommendations.map((rec, ri) => (
                        <div key={`${rec.title}-${ri}`} className="flex items-start gap-3">
                          <span
                            className="font-cinzel text-sm"
                            style={{ color: "rgba(200,169,110,0.5)", minWidth: "1.5rem" }}
                          >
                            {rec.rank}.
                          </span>
                          <div>
                            <p className="font-fell" style={{ color: "#E8D5B7" }}>
                              {rec.title}
                            </p>
                            <p
                              className="font-fell italic text-sm"
                              style={{ color: "rgba(200,169,110,0.6)" }}
                            >
                              {rec.author}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* New consultation */}
        {!loading && sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <Link href="/enter" className="btn-ghost">
              Begin a New Consultation
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
