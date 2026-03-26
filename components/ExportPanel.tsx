"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Export, ExportStyle } from "@/types";

interface ExportPanelProps {
  sessionId: string;
  existingExport?: Export;
}

const STATUS_COPY: Record<string, string> = {
  queued: "The presses are warming...",
  generating: "Rendering the chronicle...",
  ready: "Your chronicle is prepared.",
  failed: "The chronicle could not be rendered.",
};

export default function ExportPanel({ sessionId, existingExport }: ExportPanelProps) {
  const [exp, setExp] = useState<Export | null>(existingExport ?? null);
  const [creating, setCreating] = useState(false);
  const [style, setStyle] = useState<ExportStyle>("branded");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for status updates while queued or generating
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
    } catch {
      // Fallback: select the text
    }
  }

  const shareUrl = exp?.share_id
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/s/${exp.share_id}`
    : null;

  return (
    <div className="mt-6 pt-5 border-t border-gold/10">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full text-left"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <span
          className="font-cinzel text-xs tracking-widest uppercase"
          style={{ color: "rgba(200,169,110,0.5)" }}
        >
          Export Chronicle
        </span>
        <span
          className="font-fell italic text-xs"
          style={{ color: "rgba(200,169,110,0.3)" }}
        >
          {open ? "▲" : "▼"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            {/* No export yet */}
            {!exp && (
              <div>
                {/* Style selector */}
                <div className="flex gap-3 mb-4">
                  {(["branded", "minimal"] as ExportStyle[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className="font-fell italic text-sm px-4 py-2 transition-all duration-200"
                      style={{
                        border: `1px solid ${style === s ? "rgba(200,169,110,0.7)" : "rgba(200,169,110,0.25)"}`,
                        color: style === s ? "rgba(200,169,110,1)" : "rgba(200,169,110,0.5)",
                        background: style === s ? "rgba(200,169,110,0.06)" : "transparent",
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="font-cinzel text-xs tracking-widest uppercase px-5 py-3 transition-all duration-200"
                  style={{
                    border: "1px solid rgba(200,169,110,0.4)",
                    color: "rgba(200,169,110,0.8)",
                    background: "transparent",
                    cursor: creating ? "not-allowed" : "pointer",
                    opacity: creating ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!creating) {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,169,110,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,169,110,0.7)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,169,110,0.4)";
                  }}
                >
                  {creating ? "Preparing..." : "Generate Chronicle"}
                </button>
              </div>
            )}

            {/* Export exists — show status */}
            {exp && (
              <div>
                <p
                  className="font-fell italic text-sm mb-4"
                  style={{
                    color:
                      exp.status === "ready"
                        ? "rgba(200,169,110,0.8)"
                        : exp.status === "failed"
                        ? "rgba(200,100,100,0.7)"
                        : "rgba(232,213,183,0.5)",
                  }}
                >
                  {STATUS_COPY[exp.status] ?? exp.status}
                </p>

                {exp.status === "ready" && (
                  <div className="flex flex-wrap gap-3">
                    {/* Download */}
                    <a
                      href={`/api/exports/${exp.id}/download`}
                      download="recoflow-consultation.html"
                      className="font-cinzel text-xs tracking-widest uppercase px-4 py-2 transition-all duration-200"
                      style={{
                        border: "1px solid rgba(200,169,110,0.4)",
                        color: "rgba(200,169,110,0.8)",
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(200,169,110,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      }}
                    >
                      Download
                    </a>

                    {/* Copy share link */}
                    {shareUrl && (
                      <button
                        onClick={handleCopyLink}
                        className="font-cinzel text-xs tracking-widest uppercase px-4 py-2 transition-all duration-200"
                        style={{
                          border: "1px solid rgba(200,169,110,0.4)",
                          color: copied ? "rgba(200,169,110,1)" : "rgba(200,169,110,0.8)",
                          background: copied ? "rgba(200,169,110,0.08)" : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        {copied ? "Link Copied ✦" : "Copy Share Link"}
                      </button>
                    )}

                    {/* View in new tab */}
                    {exp.share_id && (
                      <a
                        href={`/s/${exp.share_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-cinzel text-xs tracking-widest uppercase px-4 py-2 transition-all duration-200"
                        style={{
                          border: "1px solid rgba(200,169,110,0.25)",
                          color: "rgba(200,169,110,0.5)",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,169,110,0.5)";
                          (e.currentTarget as HTMLAnchorElement).style.color = "rgba(200,169,110,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,169,110,0.25)";
                          (e.currentTarget as HTMLAnchorElement).style.color = "rgba(200,169,110,0.5)";
                        }}
                      >
                        View
                      </a>
                    )}
                  </div>
                )}

                {exp.status === "failed" && (
                  <button
                    onClick={() => setExp(null)}
                    className="font-fell italic text-xs"
                    style={{ color: "rgba(200,169,110,0.4)", cursor: "pointer", background: "none", border: "none" }}
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
