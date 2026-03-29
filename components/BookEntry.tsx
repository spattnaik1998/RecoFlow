"use client";

import { useState, useRef } from "react";
import type { Book } from "@/types";

interface BookEntryProps {
  index: number;
  book: Partial<Book>;
  onChange: (index: number, book: Partial<Book>) => void;
  onRemove?: (index: number) => void;
  canRemove?: boolean;
}

const GOODREADS_PATTERN = /goodreads\.com\/book\/show\/\d+/;

export default function BookEntry({
  index,
  book,
  onChange,
  onRemove,
  canRemove = false,
}: BookEntryProps) {
  const [urlInput, setUrlInput] = useState(book.goodreads_url ?? "");
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [lookupError, setLookupError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function triggerLookup(url: string) {
    if (!GOODREADS_PATTERN.test(url)) return;

    setLookupState("loading");
    setLookupError("");

    try {
      const res = await fetch("/api/lookup-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json() as {
        title?: string;
        author?: string;
        goodreads_url?: string;
        partial?: boolean;
        error?: string;
      };

      if (!res.ok || data.error) {
        setLookupState("error");
        setLookupError(data.error ?? "Could not extract book info. Enter title and author manually.");
        onChange(index, { ...book, goodreads_url: url });
        return;
      }

      setLookupState(data.partial ? "error" : "success");
      if (data.partial) {
        setLookupError("Author not found — please fill it in.");
      }

      onChange(index, {
        ...book,
        title: data.title ?? book.title ?? "",
        author: data.author ?? book.author ?? "",
        goodreads_url: url,
      });
    } catch {
      setLookupState("error");
      setLookupError("Lookup failed. Enter title and author manually.");
      onChange(index, { ...book, goodreads_url: url });
    }
  }

  function handleUrlChange(value: string) {
    setUrlInput(value);
    setLookupState("idle");
    setLookupError("");

    // Debounce: fire lookup 600ms after the user stops typing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (GOODREADS_PATTERN.test(value)) {
      debounceRef.current = setTimeout(() => triggerLookup(value), 600);
    } else {
      // Just store the URL without triggering a lookup
      onChange(index, { ...book, goodreads_url: value || undefined });
    }
  }

  function handleUrlBlur() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (GOODREADS_PATTERN.test(urlInput) && lookupState === "idle") {
      triggerLookup(urlInput);
    }
  }

  const hasUrl = urlInput.trim().length > 0;

  return (
    <div className="card p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          Book {index + 1}
        </span>
        {canRemove && (
          <button
            onClick={() => onRemove?.(index)}
            className="text-xs transition-colors duration-150"
            style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--danger)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
            aria-label="Remove book"
          >
            Remove
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Goodreads URL — top of form, since pasting it auto-fills everything below */}
        <div style={{ position: "relative" }}>
          <input
            type="url"
            className="input text-sm"
            placeholder="Paste Goodreads URL to auto-fill — or enter title below"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            onBlur={handleUrlBlur}
            autoComplete="off"
            style={{ paddingRight: hasUrl ? "2rem" : undefined }}
          />

          {/* Status indicator */}
          {lookupState === "loading" && (
            <span
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <span className="spinner" style={{ width: 14, height: 14 }} />
            </span>
          )}
          {lookupState === "success" && (
            <span
              title="Book info extracted"
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--success, #4ade80)",
                fontSize: "0.85rem",
                lineHeight: 1,
              }}
            >
              ✓
            </span>
          )}
        </div>

        {/* Lookup error message */}
        {lookupError && (
          <p className="text-xs" style={{ color: "var(--warning, #f59e0b)" }}>
            {lookupError}
          </p>
        )}

        {/* Divider with label when both URL and manual fields are visible */}
        {hasUrl && (
          <div className="flex items-center gap-2" style={{ opacity: 0.4 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or edit manually</span>
            <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
          </div>
        )}

        <input
          type="text"
          className="input"
          placeholder="Title"
          value={book.title ?? ""}
          onChange={(e) => onChange(index, { ...book, title: e.target.value })}
          autoComplete="off"
        />
        <input
          type="text"
          className="input"
          placeholder="Author"
          value={book.author ?? ""}
          onChange={(e) => onChange(index, { ...book, author: e.target.value })}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
