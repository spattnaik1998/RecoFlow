"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nyx from "./Nyx";
import type { NyxQuestion, BrainDumpAnswer } from "@/types";

interface BrainDumpProps {
  questions: NyxQuestion[];
  onComplete: (answers: BrainDumpAnswer[]) => void;
  isSkippable?: boolean;
}

export default function BrainDump({ questions, onComplete, isSkippable }: BrainDumpProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<BrainDumpAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = (currentIndex / questions.length) * 100;

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

  function handleSkip() {
    const skippedAnswer: BrainDumpAnswer = {
      question: currentQuestion.question,
      answer: "",
      category: currentQuestion.category,
    };

    const updatedAnswers = [...answers, skippedAnswer];
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
    if (e.key === "Tab" && isSkippable) {
      e.preventDefault();
      handleSkip();
    }
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {currentQuestion?.category === "intellectual" ? "Intellectual" : "Emotional"}
          </span>
        </div>
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.3 }}
        >
          {/* Nyx question */}
          <Nyx dialogue={currentQuestion?.question ?? ""} className="mb-5" />

          {/* Hint */}
          {currentQuestion?.hint && (
            <p className="text-xs mb-4 ml-12" style={{ color: "var(--text-muted)" }}>
              {currentQuestion.hint}
            </p>
          )}

          {/* Answer textarea */}
          <div>
            <textarea
              className="textarea resize-none"
              rows={4}
              placeholder="Write freely — your answer shapes the recommendations."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={submitting}
              autoFocus
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {isSkippable ? "Ctrl+Enter to answer / Tab to skip" : "Ctrl+Enter to continue"}
              </span>
              <div className="flex items-center gap-2">
                {isSkippable && (
                  <button
                    className="btn-ghost text-xs"
                    onClick={handleSkip}
                    disabled={submitting}
                  >
                    Skip
                  </button>
                )}
                <button
                  className="btn-primary"
                  onClick={handleNext}
                  disabled={!currentAnswer.trim() || submitting}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="spinner" style={{ width: 14, height: 14 }} />
                      Generating…
                    </span>
                  ) : isLast ? "Get recommendations →" : "Next →"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
