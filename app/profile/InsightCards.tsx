"use client";

import { motion } from "framer-motion";
import type { ProfileInsight } from "@/types";

const INSIGHT_ICONS: Record<ProfileInsight["type"], string> = {
  recurring_theme:   "↻",
  neglected_theme:   "○",
  author_affinity:   "★",
  format_tendency:   "■",
};

interface InsightCardsProps {
  insights: ProfileInsight[];
}

export default function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {insights.map((insight, i) => (
        <motion.div
          key={`${insight.type}-${i}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 * i, duration: 0.4 }}
          className="card p-4"
        >
          <div className="flex items-start gap-3">
            <span
              className="text-base mt-0.5 flex-shrink-0"
              style={{ color: "var(--brand-subtle)", opacity: 0.7 }}
            >
              {INSIGHT_ICONS[insight.type]}
            </span>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                {insight.label}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                {insight.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
