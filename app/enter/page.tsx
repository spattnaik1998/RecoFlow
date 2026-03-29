"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import BookEntry from "@/components/BookEntry";
import Nyx from "@/components/Nyx";
import { NYX_DIALOGUE } from "@/lib/nyx-dialogue";
import { SESSION_KEYS } from "@/types";
import type { Book } from "@/types";
import { getActiveCircleId } from "@/components/CircleSwitcher";

const MAX_BOOKS = 5;
const EMPTY_BOOK: Partial<Book> = { title: "", author: "", goodreads_url: "" };

export default function EnterPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Partial<Book>[]>([{ ...EMPTY_BOOK }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [moodOpen, setMoodOpen] = useState(false);
  const [moodActive, setMoodActive] = useState(false);

  function updateBook(index: number, book: Partial<Book>) {
    setBooks((prev) => prev.map((b, i) => (i === index ? book : b)));
  }

  function addBook() {
    if (books.length < MAX_BOOKS) {
      setBooks((prev) => [...prev, { ...EMPTY_BOOK }]);
    }
  }

  function removeBook(index: number) {
    setBooks((prev) => prev.filter((_, i) => i !== index));
  }

  const validBooks = books.filter((b) => b.title?.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validBooks.length === 0) {
      setError("Please name at least one book.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const activeCircleId = getActiveCircleId();
      const sessionInsert: Record<string, unknown> = { user_id: user.id, status: "active" };
      if (activeCircleId) sessionInsert.circle_id = activeCircleId;

      const { data: session, error: sessionError } = await supabase
        .from("reading_sessions")
        .insert(sessionInsert)
        .select("id")
        .single();

      if (sessionError || !session) {
        throw new Error("Could not create reading session");
      }

      sessionStorage.setItem(SESSION_KEYS.BOOKS, JSON.stringify(validBooks));
      sessionStorage.setItem(SESSION_KEYS.SESSION_ID, session.id);
      if (moodActive) {
        sessionStorage.setItem(SESSION_KEYS.OVERRIDE_PREFS, "true");
      } else {
        sessionStorage.removeItem(SESSION_KEYS.OVERRIDE_PREFS);
      }

      router.push("/session");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-6" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-xl mx-auto">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {["Books", "Analyze", "Reflect", "Discover"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`step-dot ${i === 0 ? "step-dot-active" : ""}`} />
              <span
                className="text-xs"
                style={{ color: i === 0 ? "var(--brand-subtle)" : "var(--text-muted)" }}
              >
                {step}
              </span>
              {i < 3 && (
                <div
                  className="w-8 h-px"
                  style={{ background: "rgba(99,135,255,0.15)" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1
            className="font-display text-2xl mb-2"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            What are you reading?
          </h1>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Add up to {MAX_BOOKS} books you're currently reading.
          </p>
        </motion.div>

        {/* Nyx message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <Nyx dialogue={NYX_DIALOGUE.enter_subtitle} />
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-3"
        >
          {books.map((book, i) => (
            <BookEntry
              key={i}
              index={i}
              book={book}
              onChange={updateBook}
              onRemove={removeBook}
              canRemove={books.length > 1}
            />
          ))}

          {books.length < MAX_BOOKS && (
            <button
              type="button"
              onClick={addBook}
              className="btn-ghost w-full"
            >
              + Add another book
            </button>
          )}

          {error && (
            <p className="text-sm" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading || validBooks.length === 0}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner" />
                  Analyzing your reading list…
                </span>
              ) : (
                "Analyze my reading list →"
              )}
            </button>
          </div>
        </motion.form>

        {/* Mood override toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6"
        >
          <button
            type="button"
            onClick={() => setMoodOpen((v) => !v)}
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{ transform: moodOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
            >
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            In a different mood today?
          </button>

          <AnimatePresence>
            {moodOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div
                  className="mt-3 p-4 rounded-xl"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid rgba(99,135,255,0.10)",
                  }}
                >
                  <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)", lineHeight: 1.6 }}>
                    Nyx usually tailors recommendations to your reading history. Toggle this off for a fresh perspective — no past preferences applied.
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setMoodActive((v) => !v)}
                      style={{
                        width: 36,
                        height: 20,
                        borderRadius: 10,
                        background: moodActive ? "var(--brand-subtle)" : "rgba(99,135,255,0.15)",
                        position: "relative",
                        transition: "background 0.2s ease",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: "#fff",
                          position: "absolute",
                          top: 3,
                          left: moodActive ? 19 : 3,
                          transition: "left 0.2s ease",
                        }}
                      />
                    </div>
                    <span className="text-xs" style={{ color: moodActive ? "var(--brand-subtle)" : "var(--text-muted)" }}>
                      {moodActive ? "Fresh recommendations — no past preferences" : "Use my reading preferences"}
                    </span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
