"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CircleWithMembership } from "@/types";

const STORAGE_KEY = "recoflow_active_circle";

export function getActiveCircleId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setActiveCircleId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id === null) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, id);
  }
}

export default function CircleSwitcher() {
  const [circles, setCircles] = useState<CircleWithMembership[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveId(getActiveCircleId());

    fetch("/api/circles")
      .then((r) => r.json())
      .then((d: { circles: CircleWithMembership[] }) => setCircles(d.circles ?? []))
      .catch(() => {/* silent */});

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function select(id: string | null) {
    setActiveId(id);
    setActiveCircleId(id);
    setOpen(false);
    window.dispatchEvent(new CustomEvent("circle-changed", { detail: { circleId: id } }));
  }

  const activeCircle = circles.find((c) => c.id === activeId);
  const label = activeCircle ? activeCircle.name : "Personal";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs transition-colors duration-150"
        style={{
          color: "var(--text-tertiary)",
          cursor: "pointer",
          background: "none",
          border: "none",
          padding: "4px 8px",
          borderRadius: 6,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)"; }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.25"/>
          <circle cx="6" cy="6" r="1.5" fill="currentColor" opacity="0.6"/>
        </svg>
        {label}
        <svg
          width="8" height="8" viewBox="0 0 8 8" fill="none"
          className="transition-transform duration-150"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M2 3l2 2 2-2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-1.5 min-w-[160px] z-50 rounded-lg overflow-hidden"
            style={{
              background: "var(--bg-raised)",
              border: "1px solid rgba(99,135,255,0.12)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <button
              onClick={() => select(null)}
              className="w-full text-left px-3 py-2 text-xs transition-colors duration-100"
              style={{
                color: activeId === null ? "var(--brand-subtle)" : "var(--text-secondary)",
                background: activeId === null ? "rgba(99,135,255,0.07)" : "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { if (activeId !== null) (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,135,255,0.04)"; }}
              onMouseLeave={(e) => { if (activeId !== null) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              Personal
            </button>

            {circles.length > 0 && (
              <div style={{ borderTop: "1px solid rgba(99,135,255,0.08)" }}>
                {circles.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => select(c.id)}
                    className="w-full text-left px-3 py-2 text-xs transition-colors duration-100"
                    style={{
                      color: activeId === c.id ? "var(--brand-subtle)" : "var(--text-secondary)",
                      background: activeId === c.id ? "rgba(99,135,255,0.07)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { if (activeId !== c.id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,135,255,0.04)"; }}
                    onMouseLeave={(e) => { if (activeId !== c.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            <div style={{ borderTop: "1px solid rgba(99,135,255,0.08)" }}>
              <a
                href="/circles"
                className="block px-3 py-2 text-xs transition-colors duration-100"
                style={{ color: "var(--text-muted)", textDecoration: "none" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-tertiary)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
              >
                Manage circles →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
