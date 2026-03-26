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

const RANK_LABELS = [
  "The Oracle's Choice",
  "Second Sight",
  "The Hidden Path",
  "The Fourth Mirror",
  "The Final Augury",
];

const DISLIKE_REASONS: { value: DislikeReason; label: string }[] = [
  { value: "too_academic", label: "Too academic" },
  { value: "too_commercial", label: "Too commercial" },
  { value: "already_read", label: "Already read" },
  { value: "wrong_tone", label: "Wrong tone" },
  { value: "not_relevant", label: "Not relevant" },
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
        body: JSON.stringify({
          vote: v,
          reason: reason ?? undefined,
          session_id: feedbackState.sessionId,
        }),
      });
      setVote(v);
      setShowReasons(false);
      setConfirmed(true);
    } catch {
      // Silent fail — feedback is best-effort
    } finally {
      setSubmitting(false);
    }
  }

  function handleThumbsUp() {
    if (confirmed) return;
    submitFeedback("like");
  }

  function handleThumbsDown() {
    if (confirmed) return;
    setVote("dislike");
    setShowReasons(true);
  }

  function handleReason(reason: DislikeReason) {
    submitFeedback("dislike", reason);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={revealed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="book-card p-6 relative overflow-hidden"
    >
      {/* Rank badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span
            className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: rank === 1 ? "#C8A96E" : "rgba(200,169,110,0.5)" }}
          >
            {RANK_LABELS[rank - 1] ?? `Recommendation ${rank}`}
          </span>
        </div>
        <div
          className="font-cinzel text-2xl font-bold"
          style={{ color: rank === 1 ? "#C8A96E" : "rgba(200,169,110,0.3)" }}
        >
          {rank === 1 ? "I" : rank === 2 ? "II" : rank === 3 ? "III" : rank === 4 ? "IV" : "V"}
        </div>
      </div>

      {/* Gold divider */}
      <div className="gold-divider" />

      {/* Book title & author */}
      <h3
        className="font-cinzel text-lg mb-1 leading-tight"
        style={{ color: "#E8D5B7" }}
      >
        {recommendation.title}
      </h3>
      <p className="font-fell italic mb-4" style={{ color: "rgba(200,169,110,0.7)", fontSize: "0.95rem" }}>
        {recommendation.author}
      </p>

      {/* Thematic connection */}
      <p
        className="font-fell leading-relaxed text-sm mb-3"
        style={{ color: "rgba(232, 213, 183, 0.75)" }}
      >
        {recommendation.thematic_connection}
      </p>

      {/* Why now */}
      {recommendation.why_now && (
        <div className="mt-4 pt-4 border-t border-gold/10">
          <p
            className="font-fell italic text-xs leading-relaxed"
            style={{ color: "rgba(200,169,110,0.6)" }}
          >
            <span className="not-italic">✦ </span>
            {recommendation.why_now}
          </p>
        </div>
      )}

      {/* Feedback controls (only when feedbackState provided) */}
      {feedbackState && (
        <div className="mt-4 pt-3 border-t border-gold/10">
          <AnimatePresence mode="wait">
            {confirmed ? (
              <motion.p
                key="confirmed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-fell italic text-xs"
                style={{ color: "rgba(200,169,110,0.5)" }}
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
                <p
                  className="font-cinzel text-xs tracking-wider mb-2"
                  style={{ color: "rgba(200,169,110,0.5)" }}
                >
                  Why not this one?
                </p>
                <div className="flex flex-wrap gap-2">
                  {DISLIKE_REASONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleReason(value)}
                      disabled={submitting}
                      className="font-fell italic text-xs px-3 py-1 transition-all duration-200"
                      style={{
                        border: "1px solid rgba(200,169,110,0.25)",
                        color: "rgba(232,213,183,0.6)",
                        background: "transparent",
                        cursor: submitting ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,169,110,0.6)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,213,183,0.9)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,169,110,0.25)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,213,183,0.6)";
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowReasons(false); setVote(null); }}
                    className="font-fell italic text-xs px-3 py-1"
                    style={{ color: "rgba(200,169,110,0.3)", cursor: "pointer" }}
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
                  className="font-cinzel text-xs tracking-widest uppercase"
                  style={{ color: "rgba(200,169,110,0.35)" }}
                >
                  Was this helpful?
                </span>
                <button
                  onClick={handleThumbsUp}
                  title="This resonates"
                  className="text-base transition-all duration-150 hover:scale-110"
                  style={{ color: "rgba(200,169,110,0.45)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.9)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.45)"; }}
                >
                  ✦
                </button>
                <button
                  onClick={handleThumbsDown}
                  title="Not for me"
                  className="text-base transition-all duration-150 hover:scale-110"
                  style={{ color: "rgba(200,169,110,0.45)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.9)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.45)"; }}
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

      {/* Decorative corner */}
      {rank === 1 && (
        <div
          className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(200,169,110,0.08) 0%, transparent 70%)",
          }}
        />
      )}
    </motion.div>
  );
}
