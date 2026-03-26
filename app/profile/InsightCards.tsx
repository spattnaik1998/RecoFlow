"use client";

import { motion } from "framer-motion";
import type { ProfileInsight } from "@/types";

const INSIGHT_ICONS: Record<ProfileInsight["type"], string> = {
  recurring_theme: "↻",
  neglected_theme: "◌",
  author_affinity: "⟡",
  format_tendency: "▦",
};

interface InsightCardsProps {
  insights: ProfileInsight[];
}

export default function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {insights.map((insight, i) => (
        <motion.div
          key={`${insight.type}-${i}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i, duration: 0.5 }}
          className="p-4"
          style={{
            border: "1px solid rgba(200,169,110,0.2)",
            background: "rgba(200,169,110,0.03)",
          }}
        >
          <div className="flex items-start gap-3">
            <span
              className="font-cinzel text-lg mt-0.5"
              style={{ color: "rgba(200,169,110,0.5)" }}
            >
              {INSIGHT_ICONS[insight.type]}
            </span>
            <div>
              <p
                className="font-cinzel text-xs tracking-widest uppercase mb-1"
                style={{ color: "rgba(200,169,110,0.8)" }}
              >
                {insight.label}
              </p>
              <p
                className="font-fell italic text-xs leading-relaxed"
                style={{ color: "rgba(232,213,183,0.55)" }}
              >
                {insight.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
