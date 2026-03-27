"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import CandleFlicker from "@/components/CandleFlicker";
import { NYX_DIALOGUE } from "@/lib/nyx-dialogue";

interface AuthFormProps {
  redirectTo: string;
  callbackError?: string | null;
}

export default function AuthForm({ redirectTo, callbackError }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    callbackError === "confirmation_failed"
      ? "The confirmation link has expired or is invalid. Please sign in or request a new link."
      : ""
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const supabase = createClient();
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || null },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage("A letter has been dispatched to your correspondence address. Verify it to enter the library.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }

  const isSignIn = mode === "signin";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative z-20"
      style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(44,30,15,0.12) 0%, transparent 70%)" }}
    >
      {/* Candles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="flex gap-10 mb-10"
      >
        <CandleFlicker size={24} />
        <CandleFlicker size={32} />
        <CandleFlicker size={24} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <AnimatePresence mode="wait">
            <motion.h1
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="font-cinzel mb-2 leading-snug"
              style={{ fontSize: "1.05rem", color: "var(--gold)", letterSpacing: "0.05em" }}
            >
              {isSignIn ? NYX_DIALOGUE.auth_sign_in_header : NYX_DIALOGUE.auth_sign_up_header}
            </motion.h1>
          </AnimatePresence>
          <p className="font-fell italic text-sm" style={{ color: "var(--parchment-dim)" }}>
            {isSignIn ? NYX_DIALOGUE.auth_sign_in_subtitle : NYX_DIALOGUE.auth_sign_up_subtitle}
          </p>
        </div>

        <div className="gold-divider-center mb-8">✦</div>

        {/* Form card */}
        <div
          style={{
            background: "linear-gradient(160deg, rgba(18,13,7,0.98) 0%, rgba(14,10,5,0.96) 100%)",
            border: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-mid)",
            boxShadow: "0 16px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,169,110,0.04)",
            padding: "2.25rem 2rem",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  key="displayName"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="label-overline block mb-2">Your Name</label>
                  <input
                    type="text"
                    className="nyx-input"
                    placeholder="As you wish to be known"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="label-overline block mb-2">Correspondence</label>
              <input
                type="email"
                className="nyx-input"
                placeholder={NYX_DIALOGUE.auth_email_placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label-overline block mb-2">Cipher Key</label>
              <input
                type="password"
                className="nyx-input"
                placeholder={NYX_DIALOGUE.auth_password_placeholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isSignIn ? "current-password" : "new-password"}
                minLength={6}
              />
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-fell italic text-sm"
                  style={{ color: "#d97474" }}
                >
                  ✦ {error}
                </motion.p>
              )}
              {message && (
                <motion.p
                  key="message"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-fell italic text-sm leading-relaxed"
                  style={{ color: "rgba(200,169,110,0.75)" }}
                >
                  ✦ {message}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="pt-2">
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading
                  ? isSignIn ? NYX_DIALOGUE.auth_signing_in : NYX_DIALOGUE.auth_signing_up
                  : isSignIn ? "Enter the Library" : "Sign the Ledger"}
              </button>
            </div>
          </form>
        </div>

        {/* Toggle mode */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => { setMode(isSignIn ? "signup" : "signin"); setError(""); setMessage(""); }}
            className="font-fell italic text-sm transition-colors duration-200"
            style={{ color: "rgba(200,169,110,0.38)", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.7)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.38)"; }}
          >
            {isSignIn
              ? "First visit? Sign your name in the ledger →"
              : "Already inscribed? Enter instead →"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
