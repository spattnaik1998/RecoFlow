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

    // Reveal first card immediately, then stagger the rest
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
    <div className="max-w-2xl mx-auto">
      {/* Nyx intro */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-10"
      >
        <Nyx
          dialogue={nyxRevealIntro(recommendations.length)}
          showPortrait={true}
          typewriterSpeed={20}
        />
      </motion.div>

      {/* Cards */}
      <div className="space-y-6">
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

      {/* Footer when all revealed */}
      {revealedCount >= recommendations.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="gold-divider-center">✦ The Oracle Has Spoken ✦</div>
        </motion.div>
      )}
    </div>
  );
}
