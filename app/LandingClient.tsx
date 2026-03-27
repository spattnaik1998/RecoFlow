"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import VictorianBackground from "@/components/VictorianBackground";
import CandleFlicker from "@/components/CandleFlicker";
import TypewriterText from "@/components/TypewriterText";
import { NYX_DIALOGUE } from "@/lib/nyx-dialogue";

export default function LandingClient() {
  const [phase, setPhase] = useState<"greeting" | "invitation" | "ready">("greeting");

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
      <VictorianBackground />

      {/* Ambient glow at center */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(200,169,110,0.05) 0%, transparent 70%)",
          zIndex: 5,
        }}
      />

      {/* Content */}
      <div className="relative z-20 w-full max-w-xl mx-auto px-8 py-20 flex flex-col items-center text-center">

        {/* Candles — tighter, more intimate */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="flex gap-12 mb-10"
        >
          <CandleFlicker size={28} />
          <CandleFlicker size={38} />
          <CandleFlicker size={28} />
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-1"
        >
          <h1
            className="font-cinzel tracking-wider leading-none"
            style={{
              fontSize: "clamp(2.8rem, 8vw, 5rem)",
              color: "var(--gold)",
              textShadow: "0 0 60px rgba(200,169,110,0.25), 0 0 120px rgba(200,169,110,0.08)",
            }}
          >
            RecoFlow
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="font-cinzel uppercase mb-8"
          style={{
            fontSize: "0.6rem",
            letterSpacing: "0.45em",
            color: "rgba(200,169,110,0.35)",
          }}
        >
          The Library of Nyx
        </motion.p>

        {/* Ornamental divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full mb-10"
          style={{ transformOrigin: "center" }}
        >
          <div className="gold-divider-center">✦</div>
        </motion.div>

        {/* Nyx speech — first */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="nyx-speech text-left w-full mb-4"
        >
          <TypewriterText
            text={NYX_DIALOGUE.landing_greeting}
            speed={20}
            delay={1500}
            className="font-fell italic leading-relaxed"
            onComplete={() => setPhase("invitation")}
          />
        </motion.div>

        {/* Nyx speech — second */}
        <AnimatePresence>
          {phase !== "greeting" && (
            <motion.div
              key="invitation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="nyx-speech text-left w-full mb-10"
            >
              <TypewriterText
                text={NYX_DIALOGUE.landing_invitation}
                speed={20}
                delay={200}
                className="font-fell italic leading-relaxed"
                onComplete={() => setPhase("ready")}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <AnimatePresence>
          {phase === "ready" && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <Link href="/auth" className="btn-primary">
                {NYX_DIALOGUE.landing_cta}
              </Link>
              <p
                className="font-fell italic text-xs"
                style={{ color: "rgba(200,169,110,0.3)" }}
              >
                No appointment necessary
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip — only visible during typewriter phases */}
        {phase !== "ready" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.5, duration: 1 }}
            onClick={() => setPhase("ready")}
            className="mt-10 font-fell italic text-xs transition-opacity hover:opacity-70"
            style={{ color: "rgba(200,169,110,0.28)", background: "none", border: "none", cursor: "pointer" }}
          >
            Skip introduction →
          </motion.button>
        )}
      </div>
    </div>
  );
}
