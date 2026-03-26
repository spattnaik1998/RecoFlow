"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import CandleFlicker from "@/components/CandleFlicker";
import type { UserPreferences } from "@/types";

type PreferenceKey = "blocked_authors" | "blocked_titles" | "blocked_themes" | "preferred_themes";

const SECTIONS: { key: PreferenceKey; label: string; description: string }[] = [
  {
    key: "blocked_authors",
    label: "Blocked Authors",
    description: "Nyx will not recommend books by these authors.",
  },
  {
    key: "blocked_titles",
    label: "Blocked Titles",
    description: "These specific titles will never appear in your recommendations.",
  },
  {
    key: "blocked_themes",
    label: "Avoided Themes",
    description: "Themes to steer away from in future recommendations.",
  },
  {
    key: "preferred_themes",
    label: "Preferred Themes",
    description: "Themes Nyx will weight toward when strong candidates exist.",
  },
];

export default function PreferencesClient() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<PreferenceKey | null>(null);
  const inputRefs = useRef<Partial<Record<PreferenceKey, HTMLInputElement>>>({});

  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then((data: UserPreferences) => setPrefs(data))
      .catch(() => {/* silent */})
      .finally(() => setLoading(false));
  }, []);

  async function removeItem(key: PreferenceKey, item: string) {
    if (!prefs) return;
    const updated = prefs[key].filter((v) => v !== item);
    await saveKey(key, updated);
  }

  async function addItem(key: PreferenceKey) {
    const input = inputRefs.current[key];
    if (!input || !prefs) return;
    const value = input.value.trim();
    if (!value) return;
    const updated = Array.from(new Set([...prefs[key], value]));
    input.value = "";
    await saveKey(key, updated);
  }

  async function saveKey(key: PreferenceKey, values: string[]) {
    if (!prefs) return;
    setSaving(key);
    const next = { ...prefs, [key]: values };
    setPrefs(next);
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: values }),
      });
      if (res.ok) {
        const data: UserPreferences = await res.json();
        setPrefs(data);
      }
    } catch {
      /* silent */
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Candles */}
        <div className="flex gap-10 justify-center mb-10">
          <CandleFlicker size={28} />
          <CandleFlicker size={36} />
          <CandleFlicker size={28} />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1
            className="font-cinzel text-3xl mb-3"
            style={{ color: "#C8A96E" }}
          >
            Reading Preferences
          </h1>
          <div className="gold-divider-center mb-4">✦</div>
          <p
            className="font-fell italic text-sm"
            style={{ color: "rgba(232,213,183,0.6)" }}
          >
            Shape the boundaries of Nyx&rsquo;s counsel. What to avoid, what to seek.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map(({ key, label, description }, sectionIdx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * sectionIdx }}
            >
              <div className="mb-3">
                <h2
                  className="font-cinzel text-sm tracking-widest uppercase mb-1"
                  style={{ color: "#C8A96E" }}
                >
                  {label}
                  {saving === key && (
                    <span
                      className="ml-2 font-fell italic normal-case tracking-normal text-xs"
                      style={{ color: "rgba(200,169,110,0.5)" }}
                    >
                      saving…
                    </span>
                  )}
                </h2>
                <p
                  className="font-fell italic text-xs"
                  style={{ color: "rgba(232,213,183,0.45)" }}
                >
                  {description}
                </p>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                {(prefs?.[key] ?? []).length === 0 ? (
                  <span
                    className="font-fell italic text-xs"
                    style={{ color: "rgba(232,213,183,0.3)" }}
                  >
                    None set
                  </span>
                ) : (
                  (prefs?.[key] ?? []).map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-fell"
                      style={{
                        border: "1px solid rgba(200,169,110,0.3)",
                        color: "rgba(232,213,183,0.75)",
                        background: "rgba(200,169,110,0.05)",
                      }}
                    >
                      {item}
                      <button
                        onClick={() => removeItem(key, item)}
                        className="ml-1 text-xs leading-none"
                        style={{ color: "rgba(200,169,110,0.4)", cursor: "pointer", background: "none", border: "none" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.9)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.4)"; }}
                        aria-label={`Remove ${item}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add input */}
              <div className="flex gap-2">
                <input
                  ref={(el) => { if (el) inputRefs.current[key] = el; }}
                  type="text"
                  placeholder={`Add ${label.toLowerCase()}…`}
                  className="flex-1 font-fell italic text-sm px-3 py-2 bg-transparent outline-none"
                  style={{
                    border: "1px solid rgba(200,169,110,0.25)",
                    color: "rgba(232,213,183,0.85)",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addItem(key);
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(200,169,110,0.65)";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(200,169,110,0.25)";
                  }}
                />
                <button
                  onClick={() => addItem(key)}
                  className="font-cinzel text-xs tracking-widest uppercase px-4 py-2 transition-all duration-200"
                  style={{
                    border: "1px solid rgba(200,169,110,0.35)",
                    color: "rgba(200,169,110,0.7)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,169,110,0.75)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,1)";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,169,110,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,169,110,0.35)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.7)";
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  Add
                </button>
              </div>

              {/* Divider between sections */}
              {sectionIdx < SECTIONS.length - 1 && (
                <div
                  className="mt-8"
                  style={{
                    height: "1px",
                    background: "linear-gradient(to right, transparent, rgba(200,169,110,0.15), transparent)",
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 text-center font-fell italic text-xs"
          style={{ color: "rgba(232,213,183,0.3)" }}
        >
          Preferences take effect on your next consultation.
        </motion.p>
      </div>
    </div>
  );
}
