"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CircleVoteValue } from "@/types";

interface VoteControlsProps {
  recommendationId: string;
  circleId: string;
}

const VOTES: { value: CircleVoteValue; label: string }[] = [
  { value: "like",    label: "Yes"     },
  { value: "neutral", label: "Neutral" },
  { value: "dislike", label: "No"      },
];

export default function VoteControls({ recommendationId, circleId }: VoteControlsProps) {
  const [vote, setVote] = useState<CircleVoteValue | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function castVote(v: CircleVoteValue) {
    if (submitting) return;
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-1.5"
    >
      <span className="text-xs mr-1" style={{ color: "var(--text-muted)" }}>
        Circle vote
      </span>
      {VOTES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => castVote(value)}
          disabled={submitting}
          title={label}
          className="text-xs px-2.5 py-1 rounded transition-all duration-150"
          style={{
            border: `1px solid ${vote === value ? "rgba(99,135,255,0.4)" : "rgba(99,135,255,0.12)"}`,
            color: vote === value ? "var(--brand-subtle)" : "var(--text-muted)",
            background: vote === value ? "rgba(99,135,255,0.1)" : "transparent",
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {label}
        </button>
      ))}
    </motion.div>
  );
}
