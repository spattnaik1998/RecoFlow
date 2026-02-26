"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Nyx from "@/components/Nyx";
import BrainDump from "@/components/BrainDump";
import CandleFlicker from "@/components/CandleFlicker";
import { NYX_DIALOGUE, nyxAnalysisResult } from "@/lib/nyx-dialogue";
import { SESSION_KEYS } from "@/types";
import type { ThematicIntersection, NyxQuestion, BrainDumpAnswer, Book } from "@/types";

type Phase =
  | "loading_books"
  | "analysis_in_progress"
  | "analysis_done"
  | "generating_questions"
  | "brain_dump"
  | "getting_recommendations"
  | "done"
  | "error";

const ANALYSIS_STEPS = [
  NYX_DIALOGUE.analysis_step1,
  NYX_DIALOGUE.analysis_step2,
  NYX_DIALOGUE.analysis_step3,
];

export default function SessionPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading_books");
  const [stepIndex, setStepIndex] = useState(0);
  const [intersection, setIntersection] = useState<ThematicIntersection | null>(null);
  const [questions, setQuestions] = useState<NyxQuestion[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    runSession();
  }, []);

  async function runSession() {
    // ── Phase 1: Book Analysis ────────────────────────────────────────────────
    const booksRaw = sessionStorage.getItem(SESSION_KEYS.BOOKS);
    const sessionId = sessionStorage.getItem(SESSION_KEYS.SESSION_ID);

    if (!booksRaw || !sessionId) {
      router.push("/enter");
      return;
    }

    const books: Book[] = JSON.parse(booksRaw);
    setPhase("analysis_in_progress");

    // Cycle through analysis step messages
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1));
    }, 2500);

    try {
      const analyzeRes = await fetch("/api/analyze-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ books, session_id: sessionId }),
      });

      clearInterval(stepTimer);

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error ?? "Analysis failed");
      }

      const { intersection: inter } = await analyzeRes.json();
      setIntersection(inter);
      sessionStorage.setItem(SESSION_KEYS.INTERSECTION, JSON.stringify(inter));
      setPhase("analysis_done");

      // Short pause so Nyx dialogue is readable
      await delay(2800);

      // ── Phase 2: Question Generation (SSE) ──────────────────────────────────
      setPhase("generating_questions");

      const qs = await fetchQuestionsSSE(inter);
      setQuestions(qs);
      sessionStorage.setItem(SESSION_KEYS.QUESTIONS, JSON.stringify(qs));
      setPhase("brain_dump");
    } catch (err) {
      clearInterval(stepTimer);
      setErrorMessage(err instanceof Error ? err.message : NYX_DIALOGUE.error_analysis);
      setPhase("error");
    }
  }

  async function fetchQuestionsSSE(inter: ThematicIntersection): Promise<NyxQuestion[]> {
    return new Promise((resolve, reject) => {
      fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intersection: inter }),
      }).then(async (res) => {
        const reader = res.body?.getReader();
        if (!reader) { reject(new Error("No stream")); return; }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);
            try {
              const parsed = JSON.parse(jsonStr) as {
                done?: boolean;
                questions?: NyxQuestion[];
                error?: string;
              };
              if (parsed.done && parsed.questions) {
                resolve(parsed.questions);
                return;
              }
              if (parsed.done && parsed.error) {
                reject(new Error(parsed.error));
                return;
              }
            } catch { /* incomplete chunk */ }
          }
        }
        reject(new Error("Stream ended without questions"));
      }).catch(reject);
    });
  }

  async function handleBrainDumpComplete(answers: BrainDumpAnswer[]) {
    sessionStorage.setItem(SESSION_KEYS.ANSWERS, JSON.stringify(answers));
    setPhase("getting_recommendations");

    const sessionId = sessionStorage.getItem(SESSION_KEYS.SESSION_ID);

    try {
      const recRes = await fetch("/api/get-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intersection,
          brain_dump: answers,
          session_id: sessionId,
        }),
      });

      if (!recRes.ok) {
        const err = await recRes.json();
        throw new Error(err.error ?? "Recommendation failed");
      }

      const { recommendations } = await recRes.json();
      sessionStorage.setItem(SESSION_KEYS.RECOMMENDATIONS, JSON.stringify(recommendations));
      setPhase("done");

      await delay(800);
      router.push("/recommendations");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : NYX_DIALOGUE.error_recommendations);
      setPhase("error");
    }
  }

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Candles */}
        <div className="flex gap-10 justify-center mb-10">
          <CandleFlicker size={26} />
          <CandleFlicker size={32} />
          <CandleFlicker size={26} />
        </div>

        <AnimatePresence mode="wait">
          {/* Analysis in progress */}
          {(phase === "analysis_in_progress" || phase === "loading_books") && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h2 className="font-cinzel text-2xl mb-4" style={{ color: "#C8A96E" }}>
                {NYX_DIALOGUE.analysis_header}
              </h2>
              <div className="gold-divider-center mb-8">✦</div>
              <div className="loading-dots justify-center flex mb-6">
                <span /><span /><span />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="font-fell italic"
                  style={{ color: "rgba(232,213,183,0.6)" }}
                >
                  {ANALYSIS_STEPS[stepIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Analysis done — show intersection */}
          {phase === "analysis_done" && intersection && (
            <motion.div
              key="analysis-done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Nyx
                dialogue={nyxAnalysisResult(
                  intersection.intersection.intellectual_territory
                )}
                showPortrait={true}
              />
            </motion.div>
          )}

          {/* Generating questions */}
          {phase === "generating_questions" && (
            <motion.div
              key="gen-questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="loading-dots justify-center flex mb-4">
                <span /><span /><span />
              </div>
              <p className="font-fell italic" style={{ color: "rgba(232,213,183,0.5)" }}>
                {NYX_DIALOGUE.questions_thinking}
              </p>
            </motion.div>
          )}

          {/* Brain dump */}
          {phase === "brain_dump" && questions.length > 0 && (
            <motion.div
              key="brain-dump"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-10">
                <h2 className="font-cinzel text-2xl mb-2" style={{ color: "#C8A96E" }}>
                  {NYX_DIALOGUE.questions_header}
                </h2>
                <div className="gold-divider-center">✦</div>
              </div>
              <BrainDump
                questions={questions}
                onComplete={handleBrainDumpComplete}
              />
            </motion.div>
          )}

          {/* Getting recommendations */}
          {phase === "getting_recommendations" && (
            <motion.div
              key="getting-recs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h2 className="font-cinzel text-2xl mb-4" style={{ color: "#C8A96E" }}>
                The Oracle Deliberates
              </h2>
              <div className="gold-divider-center mb-8">✦</div>
              <div className="loading-dots justify-center flex mb-6">
                <span /><span /><span />
              </div>
              <p className="font-fell italic" style={{ color: "rgba(232,213,183,0.5)" }}>
                {NYX_DIALOGUE.loading_recommendations}
              </p>
            </motion.div>
          )}

          {/* Error */}
          {phase === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Nyx
                dialogue={errorMessage || NYX_DIALOGUE.error_generic}
                showPortrait={true}
              />
              <div className="mt-8">
                <button
                  className="btn-ghost"
                  onClick={() => router.push("/enter")}
                >
                  Return to the entrance
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
