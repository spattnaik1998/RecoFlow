"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BookCard from "./BookCard";
import Nyx from "./Nyx";
import type { Recommendation } from "@/types";
import { NYX_DIALOGUE, nyxRevealIntro } from "@/lib/nyx-dialogue";

interface RecommendationRevealProps {
  recommendations: Recommendation[];
  sessionId?: string;
}

const REVEAL_DELAY_MS = NYX_DIALOGUE.recs_reveal_delay_ms;

export default function RecommendationReveal({
  recommendations,
  sessionId,
}: RecommendationRevealProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (recommendations.length === 0) return;

    setRevealedCount(1);

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < recommendations.length; i++) {
      const t = setTimeout(() => {
        setRevealedCount(i + 1);
      }, i * REVEAL_DELAY_MS);
      timers.push(t);
    }

    return () => timers.forEach(clearTimeout);
  }, [recommendations]);

  if (recommendations.length === 0) return null;

  return (
    <div>
      {/* Nyx intro */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Nyx dialogue={nyxRevealIntro(recommendations.length)} />
      </motion.div>

      {/* Cards */}
      <div className="space-y-4">
        {recommendations.map((rec, i) => (
          <BookCard
            key={`${rec.title}-${i}`}
            recommendation={rec}
            rank={rec.rank}
            revealed={i < revealedCount}
            delay={0}
            feedbackState={
              sessionId && rec.id
                ? { recommendationId: rec.id, sessionId }
                : undefined
            }
          />
        ))}
      </div>

      {revealedCount >= recommendations.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 pt-6 text-center"
          style={{ borderTop: "1px solid rgba(99,135,255,0.08)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            All {recommendations.length} recommendations ready
          </p>
        </motion.div>
      )}
    </div>
  );
}
