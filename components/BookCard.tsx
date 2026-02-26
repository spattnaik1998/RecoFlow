"use client";

import { motion } from "framer-motion";
import type { Recommendation } from "@/types";

interface BookCardProps {
  recommendation: Recommendation;
  rank: number;
  revealed?: boolean;
  delay?: number;
}

const RANK_LABELS = [
  "The Oracle's Choice",
  "Second Sight",
  "The Hidden Path",
  "The Fourth Mirror",
  "The Final Augury",
];

export default function BookCard({
  recommendation,
  rank,
  revealed = true,
  delay = 0,
}: BookCardProps) {
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
