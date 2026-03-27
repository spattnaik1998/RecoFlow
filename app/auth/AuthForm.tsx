"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

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
        setMessage("Check your email to confirm your account, then sign in.");
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
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 400,
          background: "radial-gradient(ellipse, rgba(99,135,255,0.05) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--brand)", boxShadow: "0 0 20px rgba(99,135,255,0.3)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 14L9 4L16 14" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 10.5H13" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <AnimatePresence mode="wait">
            <motion.h1
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="font-semibold text-xl mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {isSignIn ? "Welcome back" : "Create your account"}
            </motion.h1>
          </AnimatePresence>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            {isSignIn
              ? "Sign in to continue to RecoFlow"
              : "Start getting intelligence-driven book recommendations"}
          </p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  key="displayName"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <label className="label block mb-1.5">Your name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="How should we call you?"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="label block mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label block mb-1.5">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isSignIn ? "current-password" : "new-password"}
                minLength={6}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm"
                  style={{ color: "var(--danger)" }}
                >
                  {error}
                </motion.p>
              )}
              {message && (
                <motion.p
                  key="message"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm"
                  style={{ color: "var(--success)" }}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading
                ? isSignIn ? "Signing in…" : "Creating account…"
                : isSignIn ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

        {/* Toggle mode */}
        <p className="text-center mt-5 text-sm" style={{ color: "var(--text-tertiary)" }}>
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => { setMode(isSignIn ? "signup" : "signin"); setError(""); setMessage(""); }}
            className="transition-colors duration-150"
            style={{ color: "var(--brand-subtle)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--brand)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--brand-subtle)"; }}
          >
            {isSignIn ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
