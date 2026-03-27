"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import RecommendationReveal from "@/components/RecommendationReveal";
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
    if (!raw) { router.push("/enter"); return; }
    try {
      setRecommendations(JSON.parse(raw) as Recommendation[]);
      setSessionId(sessionStorage.getItem(SESSION_KEYS.SESSION_ID) ?? undefined);
    } catch {
      router.push("/enter");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-dots"><span /><span /><span /></div>
        <p className="loading-screen-label">Consulting the archive</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-28 pb-20">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="label-overline mb-3" style={{ color: "rgba(200,169,110,0.4)" }}>
            The Oracle Speaks
          </p>
          <h1
            className="font-cinzel mb-4"
            style={{ fontSize: "1.5rem", color: "var(--gold)", letterSpacing: "0.04em" }}
          >
            {NYX_DIALOGUE.recs_header}
          </h1>
          <div className="gold-divider-center">✦</div>
        </motion.div>

        {/* Cards */}
        <RecommendationReveal recommendations={recommendations} sessionId={sessionId} />

        {/* Export */}
        <AnimatePresence>
          {sessionId && (
            <motion.div
              key="export"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 10, duration: 1.2 }}
              className="mt-10"
            >
              <ExportPanel sessionId={sessionId} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 10, duration: 1.2 }}
          className="mt-8 pt-8 flex flex-col sm:flex-row gap-3 justify-center"
          style={{ borderTop: "1px solid rgba(200,169,110,0.07)" }}
        >
          <Link href="/enter" className="btn-ghost text-center">
            Begin a New Consultation
          </Link>
          <Link href="/library" className="btn-ghost text-center">
            View Reading History
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
