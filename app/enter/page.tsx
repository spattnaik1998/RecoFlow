"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import BookEntry from "@/components/BookEntry";
import Nyx from "@/components/Nyx";
import CandleFlicker from "@/components/CandleFlicker";
import { NYX_DIALOGUE } from "@/lib/nyx-dialogue";
import { SESSION_KEYS } from "@/types";
import type { Book } from "@/types";

const MAX_BOOKS = 5;
const EMPTY_BOOK: Partial<Book> = { title: "", author: "", goodreads_url: "" };

export default function EnterPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Partial<Book>[]>([{ ...EMPTY_BOOK }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      // Create a reading session in Supabase
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: session, error: sessionError } = await supabase
        .from("reading_sessions")
        .insert({ user_id: user.id, status: "active" })
        .select("id")
        .single();

      if (sessionError || !session) {
        throw new Error("Could not create reading session");
      }

      // Store to sessionStorage for handoff
      sessionStorage.setItem(SESSION_KEYS.BOOKS, JSON.stringify(validBooks));
      sessionStorage.setItem(SESSION_KEYS.SESSION_ID, session.id);

      router.push("/session");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-xl mx-auto">
        {/* Candles */}
        <div className="flex gap-10 justify-center mb-8">
          <CandleFlicker size={28} />
          <CandleFlicker size={34} />
          <CandleFlicker size={28} />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1
            className="font-cinzel text-3xl mb-4 leading-tight"
            style={{ color: "#C8A96E" }}
          >
            {NYX_DIALOGUE.enter_header}
          </h1>
          <div className="gold-divider-center mb-4">✦</div>
        </motion.div>

        {/* Nyx prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-8"
        >
          <Nyx dialogue={NYX_DIALOGUE.enter_subtitle} showPortrait={true} />
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          onSubmit={handleSubmit}
          className="space-y-4"
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

          {/* Add book */}
          {books.length < MAX_BOOKS && (
            <button
              type="button"
              onClick={addBook}
              className="btn-ghost w-full"
            >
              {NYX_DIALOGUE.enter_add_book}
            </button>
          )}

          {/* Error */}
          {error && (
            <p className="font-fell italic text-sm" style={{ color: "#C0392B" }}>
              ✦ {error}
            </p>
          )}

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading || validBooks.length === 0}
            >
              {loading ? NYX_DIALOGUE.enter_analyzing : NYX_DIALOGUE.enter_submit}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
