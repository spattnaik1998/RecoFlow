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
    // Dispatch event so other components can react without a full page reload
    window.dispatchEvent(new CustomEvent("circle-changed", { detail: { circleId: id } }));
  }

  const activeCircle = circles.find((c) => c.id === activeId);
  const label = activeCircle ? activeCircle.name : "Personal";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="font-fell italic text-sm flex items-center gap-1 transition-all"
        style={{ color: "rgba(232,213,183,0.55)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,213,183,0.85)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,213,183,0.55)"; }}
      >
        <span style={{ color: "rgba(200,169,110,0.5)", marginRight: 2 }}>◎</span>
        {label}
        <span style={{ fontSize: "0.6rem", color: "rgba(200,169,110,0.4)" }}>{open ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 min-w-[180px] z-50"
            style={{
              background: "#0D0A07",
              border: "1px solid rgba(200,169,110,0.2)",
            }}
          >
            {/* Personal (no circle) */}
            <button
              onClick={() => select(null)}
              className="w-full text-left px-4 py-2 font-fell italic text-sm transition-all"
              style={{
                color: activeId === null ? "#C8A96E" : "rgba(232,213,183,0.6)",
                background: activeId === null ? "rgba(200,169,110,0.05)" : "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { if (activeId !== null) (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,169,110,0.03)"; }}
              onMouseLeave={(e) => { if (activeId !== null) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              Personal
            </button>

            {circles.length > 0 && (
              <div style={{ borderTop: "1px solid rgba(200,169,110,0.1)" }}>
                {circles.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => select(c.id)}
                    className="w-full text-left px-4 py-2 font-fell italic text-sm transition-all"
                    style={{
                      color: activeId === c.id ? "#C8A96E" : "rgba(232,213,183,0.6)",
                      background: activeId === c.id ? "rgba(200,169,110,0.05)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { if (activeId !== c.id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,169,110,0.03)"; }}
                    onMouseLeave={(e) => { if (activeId !== c.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            {/* Manage link */}
            <div style={{ borderTop: "1px solid rgba(200,169,110,0.1)" }}>
              <a
                href="/circles"
                className="block px-4 py-2 font-cinzel text-xs tracking-widest uppercase"
                style={{ color: "rgba(200,169,110,0.35)", textDecoration: "none" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(200,169,110,0.65)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(200,169,110,0.35)"; }}
              >
                Manage Circles →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
