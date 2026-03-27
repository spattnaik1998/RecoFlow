"use client";

import { useState } from "react";
import type { Book } from "@/types";

interface BookEntryProps {
  index: number;
  book: Partial<Book>;
  onChange: (index: number, book: Partial<Book>) => void;
  onRemove?: (index: number) => void;
  canRemove?: boolean;
}

export default function BookEntry({
  index,
  book,
  onChange,
  onRemove,
  canRemove = false,
}: BookEntryProps) {
  const [showUrl, setShowUrl] = useState(false);

  return (
    <div className="card p-4">
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

        {!showUrl ? (
          <button
            type="button"
            onClick={() => setShowUrl(true)}
            className="text-xs transition-colors duration-150"
            style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--brand-subtle)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
          >
            + Add Goodreads URL (optional)
          </button>
        ) : (
          <input
            type="url"
            className="input text-sm"
            placeholder="https://www.goodreads.com/book/show/..."
            value={book.goodreads_url ?? ""}
            onChange={(e) => onChange(index, { ...book, goodreads_url: e.target.value })}
          />
        )}
      </div>
    </div>
  );
}
