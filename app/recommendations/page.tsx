"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import RecommendationReveal from "@/components/RecommendationReveal";
import ExportPanel from "@/components/ExportPanel";
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 px-6" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: "var(--brand-subtle)" }}>
            Your reading list
          </p>
          <h1
            className="font-display text-2xl"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            10 recommendations, ranked by resonance
          </h1>
        </motion.div>

        {/* Cards */}
        <RecommendationReveal recommendations={recommendations} sessionId={sessionId} />

        {/* Export */}
        {sessionId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 8, duration: 0.8 }}
            className="mt-10"
          >
            <ExportPanel sessionId={sessionId} />
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 8, duration: 0.8 }}
          className="mt-8 pt-8 flex flex-col sm:flex-row gap-3"
          style={{ borderTop: "1px solid rgba(99,135,255,0.08)" }}
        >
          <Link href="/enter" className="btn-secondary">
            New session
          </Link>
          <Link href="/library" className="btn-ghost">
            View history
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
