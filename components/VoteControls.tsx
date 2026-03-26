"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CircleVoteValue } from "@/types";

interface VoteControlsProps {
  recommendationId: string;
  circleId: string;
}

const VOTES: { value: CircleVoteValue; label: string; symbol: string }[] = [
  { value: "like", label: "Endorse", symbol: "✦" },
  { value: "neutral", label: "Neutral", symbol: "◌" },
  { value: "dislike", label: "Dissent", symbol: "✕" },
];

export default function VoteControls({ recommendationId, circleId }: VoteControlsProps) {
  const [vote, setVote] = useState<CircleVoteValue | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function castVote(v: CircleVoteValue) {
    if (submitting) return;
    // Toggle off if same vote
    const newVote = vote === v ? null : v;
    setSubmitting(true);
    try {
      await fetch(`/api/recommendations/${recommendationId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circle_id: circleId, vote: newVote ?? "neutral" }),
      });
      setVote(newVote);
    } catch {/* silent */}
    setSubmitting(false);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-1 mt-1"
      >
        <span
          className="font-cinzel text-xs tracking-widest uppercase mr-2"
          style={{ color: "rgba(200,169,110,0.3)", fontSize: "0.6rem" }}
        >
          Circle
        </span>
        {VOTES.map(({ value, label, symbol }) => (
          <button
            key={value}
            onClick={() => castVote(value)}
            disabled={submitting}
            title={label}
            className="font-fell text-sm transition-all duration-150 px-2 py-0.5"
            style={{
              border: `1px solid ${vote === value ? "rgba(200,169,110,0.6)" : "rgba(200,169,110,0.15)"}`,
              color: vote === value ? "#C8A96E" : "rgba(200,169,110,0.4)",
              background: vote === value ? "rgba(200,169,110,0.06)" : "transparent",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (vote !== value) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,169,110,0.4)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.8)";
              }
            }}
            onMouseLeave={(e) => {
              if (vote !== value) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,169,110,0.15)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.4)";
              }
            }}
          >
            {symbol}
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
