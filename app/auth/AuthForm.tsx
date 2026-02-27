"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
        setMessage(
          "A letter has been dispatched to your correspondence address. Verify it to enter the library."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
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

  const header =
    mode === "signin"
      ? NYX_DIALOGUE.auth_sign_in_header
      : NYX_DIALOGUE.auth_sign_up_header;
  const subtitle =
    mode === "signin"
      ? NYX_DIALOGUE.auth_sign_in_subtitle
      : NYX_DIALOGUE.auth_sign_up_subtitle;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative z-20">
      {/* Candle row */}
      <div className="flex gap-12 mb-10">
        <CandleFlicker size={30} />
        <CandleFlicker size={38} />
        <CandleFlicker size={30} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="font-cinzel text-2xl mb-3 leading-snug"
            style={{ color: "#C8A96E" }}
          >
            {header}
          </h1>
          <p className="font-fell italic" style={{ color: "rgba(232,213,183,0.6)" }}>
            {subtitle}
          </p>
        </div>

        {/* Gold divider */}
        <div className="gold-divider-center mb-8">✦</div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="victorian-border p-8 space-y-4">
          {mode === "signup" && (
            <div>
              <label
                className="font-cinzel text-xs tracking-widest uppercase block mb-2"
                style={{ color: "rgba(200,169,110,0.6)" }}
              >
                Your Name
              </label>
              <input
                type="text"
                className="nyx-input"
                placeholder="As you wish to be known"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label
              className="font-cinzel text-xs tracking-widest uppercase block mb-2"
              style={{ color: "rgba(200,169,110,0.6)" }}
            >
              Correspondence Address
            </label>
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
            <label
              className="font-cinzel text-xs tracking-widest uppercase block mb-2"
              style={{ color: "rgba(200,169,110,0.6)" }}
            >
              Cipher Key
            </label>
            <input
              type="password"
              className="nyx-input"
              placeholder={NYX_DIALOGUE.auth_password_placeholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
            />
          </div>

          {/* Error */}
          {error && (
            <p
              className="font-fell italic text-sm"
              style={{ color: "#e05c5c" }}
            >
              ✦ {error}
            </p>
          )}

          {/* Success message */}
          {message && (
            <p
              className="font-fell italic text-sm"
              style={{ color: "rgba(200,169,110,0.8)" }}
            >
              ✦ {message}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading
                ? mode === "signin"
                  ? NYX_DIALOGUE.auth_signing_in
                  : NYX_DIALOGUE.auth_signing_up
                : mode === "signin"
                ? "Enter the Library"
                : "Sign the Ledger"}
            </button>
          </div>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setMessage("");
            }}
            className="font-fell italic text-sm"
            style={{ color: "rgba(200,169,110,0.5)" }}
          >
            {mode === "signin"
              ? "First visit? Sign your name in the ledger."
              : "Already inscribed? Enter instead."}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
