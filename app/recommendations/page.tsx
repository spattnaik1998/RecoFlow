"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import RecommendationReveal from "@/components/RecommendationReveal";
import CandleFlicker from "@/components/CandleFlicker";
import ExportPanel from "@/components/ExportPanel";
import { NYX_DIALOGUE } from "@/lib/nyx-dialogue";
import { SESSION_KEYS } from "@/types";
import type { Recommendation } from "@/types";

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEYS.RECOMMENDATIONS);
    if (!raw) {
      router.push("/enter");
      return;
    }
    try {
      const recs = JSON.parse(raw) as Recommendation[];
      setRecommendations(recs);
      const sid = sessionStorage.getItem(SESSION_KEYS.SESSION_ID) ?? undefined;
      setSessionId(sid);
    } catch {
      router.push("/enter");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Candles */}
        <div className="flex gap-10 justify-center mb-10">
          <CandleFlicker size={28} />
          <CandleFlicker size={36} />
          <CandleFlicker size={28} />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1
            className="font-cinzel text-3xl mb-3"
            style={{ color: "#C8A96E" }}
          >
            {NYX_DIALOGUE.recs_header}
          </h1>
          <div className="gold-divider-center">✦</div>
        </motion.div>

        {/* Dramatic reveal */}
        <RecommendationReveal recommendations={recommendations} sessionId={sessionId} />

        {/* Export */}
        {sessionId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 10, duration: 1 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <ExportPanel sessionId={sessionId} />
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 10, duration: 1 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/enter" className="btn-ghost text-center">
            Begin a New Consultation
          </Link>
          <Link href="/library" className="btn-ghost text-center">
            View Your Reading History
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
