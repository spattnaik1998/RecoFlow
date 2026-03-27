"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Recommendation, FeedbackVote, DislikeReason } from "@/types";
import VoteControls from "@/components/VoteControls";

interface FeedbackState {
  recommendationId: string;
  sessionId: string;
}

interface BookCardProps {
  recommendation: Recommendation;
  rank: number;
  revealed?: boolean;
  delay?: number;
  feedbackState?: FeedbackState;
  circleContext?: { circleId: string };
}

const DISLIKE_REASONS: { value: DislikeReason; label: string }[] = [
  { value: "too_academic",   label: "Too academic"   },
  { value: "too_commercial", label: "Too commercial"  },
  { value: "already_read",   label: "Already read"   },
  { value: "wrong_tone",     label: "Wrong tone"     },
  { value: "not_relevant",   label: "Not relevant"   },
];

export default function BookCard({
  recommendation,
  rank,
  revealed = true,
  delay = 0,
  feedbackState,
  circleContext,
}: BookCardProps) {
  const [vote, setVote] = useState<FeedbackVote | null>(null);
  const [showReasons, setShowReasons] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function submitFeedback(v: FeedbackVote, reason?: DislikeReason) {
    if (!feedbackState?.recommendationId || submitting || confirmed) return;
    setSubmitting(true);
    try {
      await fetch(`/api/recommendations/${feedbackState.recommendationId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote: v, reason: reason ?? undefined, session_id: feedbackState.sessionId }),
      });
      setVote(v);
      setShowReasons(false);
      setConfirmed(true);
    } catch {/* silent */}
    setSubmitting(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rec-card"
    >
      {/* Top accent line */}
      <div className="rec-card-top" />

      {/* Rank + badge row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded"
          style={{
            background: rank === 1 ? "rgba(99,135,255,0.15)" : "rgba(99,135,255,0.07)",
            color: rank === 1 ? "var(--brand-subtle)" : "var(--text-muted)",
            border: rank === 1 ? "1px solid rgba(99,135,255,0.25)" : "1px solid rgba(99,135,255,0.1)",
          }}
        >
          {rank === 1 ? "Top pick" : `#${rank}`}
        </span>
        {recommendation.why_now && (
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}
          >
            Why now
          </span>
        )}
      </div>

      {/* Title & author */}
      <h3
        className="font-semibold leading-snug mb-1"
        style={{ fontSize: "1rem", color: "var(--text-primary)" }}
      >
        {recommendation.title}
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
        {recommendation.author}
      </p>

      {/* Thematic connection */}
      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
        {recommendation.thematic_connection}
      </p>

      {/* Why now */}
      {recommendation.why_now && (
        <div
          className="pt-3 mt-1"
          style={{ borderTop: "1px solid rgba(99,135,255,0.08)" }}
        >
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {recommendation.why_now}
          </p>
        </div>
      )}

      {/* Feedback controls */}
      {feedbackState && (
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(99,135,255,0.08)" }}>
          <AnimatePresence mode="wait">
            {confirmed ? (
              <motion.p
                key="confirmed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {vote === "like" ? "Marked as relevant" : "Feedback recorded"}
              </motion.p>
            ) : showReasons ? (
              <motion.div
                key="reasons"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                  Why not?
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DISLIKE_REASONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => submitFeedback("dislike", value)}
                      disabled={submitting}
                      className="text-xs px-2.5 py-1 rounded transition-all duration-150"
                      style={{
                        border: "1px solid rgba(99,135,255,0.15)",
                        color: "var(--text-secondary)",
                        background: "transparent",
                        cursor: submitting ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,135,255,0.08)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,135,255,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,135,255,0.15)";
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowReasons(false); setVote(null); }}
                    className="text-xs px-2 py-1"
                    style={{ color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="thumbs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-xs mr-1" style={{ color: "var(--text-muted)" }}>
                  Relevant?
                </span>
                <button
                  onClick={() => submitFeedback("like")}
                  title="Yes, relevant"
                  className="text-xs px-2.5 py-1 rounded transition-all duration-150"
                  style={{
                    border: "1px solid rgba(99,135,255,0.15)",
                    color: "var(--text-secondary)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(52,211,153,0.08)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(52,211,153,0.3)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#34D399";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,135,255,0.15)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                  }}
                >
                  Yes
                </button>
                <button
                  onClick={() => { setVote("dislike"); setShowReasons(true); }}
                  title="Not for me"
                  className="text-xs px-2.5 py-1 rounded transition-all duration-150"
                  style={{
                    border: "1px solid rgba(99,135,255,0.15)",
                    color: "var(--text-secondary)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.08)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(248,113,113,0.3)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#F87171";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,135,255,0.15)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                  }}
                >
                  No
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Circle vote controls */}
      {circleContext && recommendation.id && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(99,135,255,0.08)" }}>
          <VoteControls
            recommendationId={recommendation.id}
            circleId={circleContext.circleId}
          />
        </div>
      )}
    </motion.div>
  );
}
