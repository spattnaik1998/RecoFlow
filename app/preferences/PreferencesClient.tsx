"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { UserPreferences } from "@/types";

type PreferenceKey = "blocked_authors" | "blocked_titles" | "blocked_themes" | "preferred_themes";

const SECTIONS: { key: PreferenceKey; label: string; description: string }[] = [
  {
    key: "blocked_authors",
    label: "Blocked authors",
    description: "Recommendations by these authors will never appear.",
  },
  {
    key: "blocked_titles",
    label: "Blocked titles",
    description: "These specific titles are excluded from recommendations.",
  },
  {
    key: "blocked_themes",
    label: "Avoided themes",
    description: "Themes to steer away from in future sessions.",
  },
  {
    key: "preferred_themes",
    label: "Preferred themes",
    description: "Themes that will be weighted higher when strong candidates exist.",
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
    } catch {/* silent */}
    finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-6" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1
            className="font-display text-2xl mb-1"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Preferences
          </h1>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Control what appears — and what doesn't — in your recommendations.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map(({ key, label, description }, sectionIdx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * sectionIdx }}
              className="card p-5"
            >
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {label}
                  </h2>
                  {saving === key && (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      saving…
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {description}
                </p>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                {(prefs?.[key] ?? []).length === 0 ? (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>None set</span>
                ) : (
                  (prefs?.[key] ?? []).map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-xs"
                      style={{
                        border: "1px solid rgba(99,135,255,0.2)",
                        color: "var(--text-secondary)",
                        background: "rgba(99,135,255,0.07)",
                      }}
                    >
                      {item}
                      <button
                        onClick={() => removeItem(key, item)}
                        className="ml-1 leading-none transition-colors duration-150"
                        style={{ color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--danger)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
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
                  placeholder={`Add ${label}…`}
                  className="input flex-1 text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") addItem(key); }}
                />
                <button
                  onClick={() => addItem(key)}
                  className="btn-secondary text-xs px-3"
                >
                  Add
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-10 text-xs text-center"
          style={{ color: "var(--text-muted)" }}
        >
          Preferences apply to your next session.
        </motion.p>
      </div>
    </div>
  );
}
