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

const RANK_NUMERALS = ["I", "II", "III", "IV", "V"];
const RANK_LABELS = [
  "The Oracle's Choice",
  "Second Sight",
  "The Hidden Path",
  "The Fourth Mirror",
  "The Final Augury",
];

const DISLIKE_REASONS: { value: DislikeReason; label: string }[] = [
  { value: "too_academic",   label: "Too academic"  },
  { value: "too_commercial", label: "Too commercial" },
  { value: "already_read",   label: "Already read"  },
  { value: "wrong_tone",     label: "Wrong tone"    },
  { value: "not_relevant",   label: "Not relevant"  },
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

  const isPrime = rank === 1;

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
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={revealed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 28, scale: 0.97 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`book-card p-7 relative overflow-hidden ${isPrime ? "book-card-prime" : ""}`}
    >
      {/* Rank header row */}
      <div className="flex items-start justify-between mb-5">
        <span
          className="label-overline"
          style={{ color: isPrime ? "var(--gold-dim)" : "rgba(200,169,110,0.3)" }}
        >
          {RANK_LABELS[rank - 1] ?? `Recommendation ${rank}`}
        </span>
        <span
          className="font-cinzel font-bold"
          style={{
            fontSize: "1.5rem",
            lineHeight: 1,
            color: isPrime ? "rgba(200,169,110,0.5)" : "rgba(200,169,110,0.15)",
          }}
        >
          {RANK_NUMERALS[rank - 1] ?? rank}
        </span>
      </div>

      {/* Divider */}
      <div className="gold-divider" style={{ marginTop: 0 }} />

      {/* Title & author */}
      <h3
        className="font-cinzel leading-snug mb-1"
        style={{
          fontSize: "0.98rem",
          color: isPrime ? "var(--parchment)" : "rgba(232,213,183,0.88)",
          letterSpacing: "0.03em",
        }}
      >
        {recommendation.title}
      </h3>
      <p
        className="font-fell italic mb-5"
        style={{ fontSize: "0.92rem", color: "var(--gold-dim)" }}
      >
        {recommendation.author}
      </p>

      {/* Thematic connection */}
      <p
        className="font-fell leading-relaxed mb-4"
        style={{ fontSize: "0.92rem", color: "rgba(232,213,183,0.68)" }}
      >
        {recommendation.thematic_connection}
      </p>

      {/* Why now */}
      {recommendation.why_now && (
        <div
          className="pt-4 mt-1"
          style={{ borderTop: "1px solid rgba(200,169,110,0.08)" }}
        >
          <p
            className="font-fell italic"
            style={{ fontSize: "0.82rem", color: "rgba(200,169,110,0.5)", lineHeight: 1.7 }}
          >
            <span style={{ opacity: 0.7 }}>✦ </span>
            {recommendation.why_now}
          </p>
        </div>
      )}

      {/* Feedback controls */}
      {feedbackState && (
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(200,169,110,0.07)" }}>
          <AnimatePresence mode="wait">
            {confirmed ? (
              <motion.p
                key="confirmed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-fell italic"
                style={{ fontSize: "0.78rem", color: "rgba(200,169,110,0.45)" }}
              >
                {vote === "like" ? "The oracle notes your approval." : "Your counsel has been recorded."}
              </motion.p>
            ) : showReasons ? (
              <motion.div
                key="reasons"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <p className="label-overline mb-3" style={{ color: "rgba(200,169,110,0.4)" }}>
                  Why not this one?
                </p>
                <div className="flex flex-wrap gap-2">
                  {DISLIKE_REASONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => submitFeedback("dislike", value)}
                      disabled={submitting}
                      className="font-fell italic transition-all duration-200"
                      style={{
                        fontSize: "0.78rem",
                        padding: "0.25rem 0.75rem",
                        border: "1px solid rgba(200,169,110,0.18)",
                        color: "rgba(232,213,183,0.55)",
                        background: "transparent",
                        cursor: submitting ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,169,110,0.45)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,213,183,0.85)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,169,110,0.18)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,213,183,0.55)";
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowReasons(false); setVote(null); }}
                    className="font-fell italic"
                    style={{
                      fontSize: "0.78rem",
                      padding: "0.25rem 0.75rem",
                      color: "rgba(200,169,110,0.3)",
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                    }}
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
                className="flex items-center gap-4"
              >
                <span
                  className="label-overline"
                  style={{ color: "rgba(200,169,110,0.28)", fontSize: "0.58rem" }}
                >
                  Resonance
                </span>
                <button
                  onClick={() => submitFeedback("like")}
                  title="This resonates"
                  style={{
                    fontSize: "0.9rem",
                    color: "rgba(200,169,110,0.35)",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                    transition: "color 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.9)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.15)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.35)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  }}
                >
                  ✦
                </button>
                <button
                  onClick={() => { setVote("dislike"); setShowReasons(true); }}
                  title="Not for me"
                  style={{
                    fontSize: "0.9rem",
                    color: "rgba(200,169,110,0.35)",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                    transition: "color 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.9)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.15)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.35)";
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  }}
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Circle vote controls */}
      {circleContext && recommendation.id && (
        <div className="mt-2">
          <VoteControls
            recommendationId={recommendation.id}
            circleId={circleContext.circleId}
          />
        </div>
      )}

      {/* Prime card ambient glow */}
      {isPrime && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at top right, rgba(200,169,110,0.05) 0%, transparent 60%)",
          }}
        />
      )}
    </motion.div>
  );
}
