"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

      {/* Content layer */}
      <div className="relative z-20 w-full max-w-2xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        {/* Candles */}
        <div className="flex gap-16 mb-8">
          <CandleFlicker size={36} />
          <CandleFlicker size={44} />
          <CandleFlicker size={36} />
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-2"
        >
          <h1
            className="font-cinzel text-5xl md:text-6xl tracking-wider leading-tight"
            style={{
              color: "#C8A96E",
              textShadow: "0 0 40px rgba(200,169,110,0.3), 0 0 80px rgba(200,169,110,0.1)",
            }}
          >
            RecoFlow
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mb-10"
        >
          <p
            className="font-cinzel text-sm tracking-[0.4em] uppercase"
            style={{ color: "rgba(200,169,110,0.5)" }}
          >
            The Library of Nyx
          </p>
        </motion.div>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="w-full mb-10"
        >
          <div className="gold-divider-center">✦</div>
        </motion.div>

        {/* Nyx speech */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="nyx-speech text-left w-full mb-4"
        >
          <TypewriterText
            text={NYX_DIALOGUE.landing_greeting}
            speed={22}
            delay={1400}
            className="font-fell italic text-parchment-dim leading-relaxed"
            onComplete={() => setPhase("invitation")}
          />
        </motion.div>

        {phase !== "greeting" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="nyx-speech text-left w-full mb-10"
          >
            <TypewriterText
              text={NYX_DIALOGUE.landing_invitation}
              speed={22}
              delay={200}
              className="font-fell italic text-parchment-dim leading-relaxed"
              onComplete={() => setPhase("ready")}
            />
          </motion.div>
        )}

        {/* CTA */}
        {phase === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/auth" className="btn-primary inline-block">
              {NYX_DIALOGUE.landing_cta}
            </Link>
          </motion.div>
        )}

        {/* Skip for impatient readers */}
        {phase !== "ready" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4 }}
            onClick={() => setPhase("ready")}
            className="mt-8 font-fell italic text-xs"
            style={{ color: "rgba(200,169,110,0.3)" }}
          >
            Skip introduction
          </motion.button>
        )}
      </div>
    </div>
  );
}
