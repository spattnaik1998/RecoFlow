"use client";

import { useState, useEffect } from "react";

interface NyxProps {
  dialogue: string;
  onDialogueComplete?: () => void;
  className?: string;
}

export default function Nyx({ dialogue, onDialogueComplete, className = "" }: NyxProps) {
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(dialogue.slice(0, i));
      if (i >= dialogue.length) {
        clearInterval(interval);
        setDone(true);
        onDialogueComplete?.();
      }
    }, 18);
    return () => clearInterval(interval);
  }, [visible, dialogue, onDialogueComplete]);

  return (
    <div
      className={`ai-message ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div className="ai-avatar">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="4" fill="white" opacity="0.9" />
          <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1" opacity="0.3" />
          <circle cx="9" cy="9" r="5.5" stroke="white" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-medium"
            style={{ color: "var(--brand-subtle)", letterSpacing: "0.04em" }}
          >
            Nyx
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: "rgba(99,135,255,0.1)", color: "var(--brand-subtle)", fontSize: "0.6rem" }}
          >
            AI
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {displayed}
          {!done && (
            <span
              className="inline-block w-0.5 h-3.5 ml-0.5 align-middle"
              style={{ background: "var(--brand)", animation: "pulse 1s ease-in-out infinite" }}
            />
          )}
        </p>
      </div>
    </div>
  );
}
