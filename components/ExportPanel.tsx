"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Export, ExportStyle } from "@/types";

interface ExportPanelProps {
  sessionId: string;
  existingExport?: Export;
}

const STATUS_COPY: Record<string, string> = {
  queued:     "Queuing export…",
  generating: "Rendering your digest…",
  ready:      "Export ready.",
  failed:     "Export failed.",
};

export default function ExportPanel({ sessionId, existingExport }: ExportPanelProps) {
  const [exp, setExp] = useState<Export | null>(existingExport ?? null);
  const [creating, setCreating] = useState(false);
  const [style, setStyle] = useState<ExportStyle>("branded");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!exp || exp.status === "ready" || exp.status === "failed") {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/exports/${exp.id}`);
        if (res.ok) {
          const updated: Export = await res.json();
          setExp(updated);
          if (updated.status === "ready" || updated.status === "failed") {
            if (pollRef.current) clearInterval(pollRef.current);
          }
        }
      } catch {/* silent */}
    }, 2000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [exp]);

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, type: "pdf", style }),
      });
      const data = await res.json() as Export & { existing?: Export };
      if (res.status === 409 && data.existing) {
        setExp(data.existing);
      } else if (res.ok) {
        setExp(data);
      }
    } catch {/* silent */}
    setCreating(false);
  }

  async function handleCopyLink() {
    if (!exp?.share_id) return;
    const url = `${window.location.origin}/s/${exp.share_id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {/* fallback */}
  }

  const shareUrl = exp?.share_id
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/s/${exp.share_id}`
    : null;

  return (
    <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(99,135,255,0.08)" }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 transition-colors duration-150"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          Export & share
        </span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className="transition-transform duration-200"
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 overflow-hidden"
          >
            {/* No export yet */}
            {!exp && (
              <div>
                <div className="flex gap-2 mb-3">
                  {(["branded", "minimal"] as ExportStyle[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className="text-xs px-3 py-1.5 rounded transition-all duration-150 capitalize"
                      style={{
                        border: `1px solid ${style === s ? "rgba(99,135,255,0.4)" : "rgba(99,135,255,0.12)"}`,
                        color: style === s ? "var(--brand-subtle)" : "var(--text-muted)",
                        background: style === s ? "rgba(99,135,255,0.08)" : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="btn-secondary text-xs"
                  style={{ opacity: creating ? 0.5 : 1 }}
                >
                  {creating ? "Generating…" : "Generate export"}
                </button>
              </div>
            )}

            {/* Export exists */}
            {exp && (
              <div>
                <p
                  className="text-xs mb-3"
                  style={{
                    color: exp.status === "ready"
                      ? "var(--success)"
                      : exp.status === "failed"
                      ? "var(--danger)"
                      : "var(--text-tertiary)",
                  }}
                >
                  {STATUS_COPY[exp.status] ?? exp.status}
                </p>

                {exp.status === "ready" && (
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/api/exports/${exp.id}/download`}
                      download="recoflow.html"
                      className="btn-secondary text-xs"
                      style={{ textDecoration: "none", display: "inline-flex" }}
                    >
                      Download
                    </a>

                    {shareUrl && (
                      <button
                        onClick={handleCopyLink}
                        className="btn-secondary text-xs"
                      >
                        {copied ? "Copied!" : "Copy link"}
                      </button>
                    )}

                    {exp.share_id && (
                      <a
                        href={`/s/${exp.share_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-xs"
                        style={{ textDecoration: "none", display: "inline-flex" }}
                      >
                        View
                      </a>
                    )}
                  </div>
                )}

                {exp.status === "failed" && (
                  <button
                    onClick={() => setExp(null)}
                    className="text-xs"
                    style={{ color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" }}
                  >
                    Try again
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
