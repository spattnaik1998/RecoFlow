"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nyx from "./Nyx";
import type { NyxQuestion, BrainDumpAnswer } from "@/types";

interface BrainDumpProps {
  questions: NyxQuestion[];
  onComplete: (answers: BrainDumpAnswer[]) => void;
}

export default function BrainDump({ questions, onComplete }: BrainDumpProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<BrainDumpAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex) / questions.length) * 100;

  function handleNext() {
    if (!currentAnswer.trim()) return;

    const newAnswer: BrainDumpAnswer = {
      question: currentQuestion.question,
      answer: currentAnswer.trim(),
      category: currentQuestion.category,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setCurrentAnswer("");

    if (isLast) {
      setSubmitting(true);
      onComplete(updatedAnswers);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleNext();
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span
            className="font-cinzel text-xs tracking-widest uppercase"
            style={{ color: "rgba(200,169,110,0.5)" }}
          >
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span
            className="font-fell italic text-xs"
            style={{ color: "rgba(200,169,110,0.4)" }}
          >
            {currentQuestion?.category === "intellectual" ? "Intellectual" : "Emotional"}
          </span>
        </div>
        <div
          className="h-px w-full"
          style={{ background: "rgba(200,169,110,0.15)" }}
        >
          <motion.div
            className="h-px"
            style={{ background: "rgba(200,169,110,0.5)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
        >
          {/* Nyx asks the question */}
          <Nyx
            dialogue={currentQuestion?.question ?? ""}
            showPortrait={true}
            className="mb-6"
            typewriterSpeed={20}
          />

          {/* Hint */}
          {currentQuestion?.hint && (
            <p
              className="font-fell italic text-sm mb-4 ml-20"
              style={{ color: "rgba(200,169,110,0.4)" }}
            >
              ✦ {currentQuestion.hint}
            </p>
          )}

          {/* Answer textarea */}
          <div className="ml-0 md:ml-20">
            <textarea
              className="nyx-input resize-none"
              rows={4}
              placeholder="Speak freely. The library holds no judgment."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={submitting}
              autoFocus
              style={{ fontStyle: "normal" }}
            />
            <div className="flex items-center justify-between mt-3">
              <span
                className="font-fell italic text-xs"
                style={{ color: "rgba(200,169,110,0.3)" }}
              >
                Ctrl+Enter to continue
              </span>
              <button
                className="btn-primary"
                onClick={handleNext}
                disabled={!currentAnswer.trim() || submitting}
              >
                {submitting
                  ? "Consulting the oracle..."
                  : isLast
                  ? "The ritual is complete"
                  : "Continue"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
