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
    <div className="victorian-border p-4 relative group">
      {/* Book number */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="font-cinzel text-xs tracking-widest uppercase"
          style={{ color: "rgba(200,169,110,0.5)" }}
        >
          Volume {index + 1}
        </span>
        {canRemove && (
          <button
            onClick={() => onRemove?.(index)}
            className="text-xs font-fell italic"
            style={{ color: "rgba(200,169,110,0.4)" }}
            aria-label="Remove book"
          >
            Remove
          </button>
        )}
      </div>

      <div className="space-y-3">
        <input
          type="text"
          className="nyx-input"
          placeholder="Title"
          value={book.title ?? ""}
          onChange={(e) => onChange(index, { ...book, title: e.target.value })}
          autoComplete="off"
        />
        <input
          type="text"
          className="nyx-input"
          placeholder="Author"
          value={book.author ?? ""}
          onChange={(e) => onChange(index, { ...book, author: e.target.value })}
          autoComplete="off"
        />

        {/* Goodreads URL toggle */}
        {!showUrl ? (
          <button
            type="button"
            onClick={() => setShowUrl(true)}
            className="text-xs font-fell italic"
            style={{ color: "rgba(200,169,110,0.4)", padding: "0.25rem 0" }}
          >
            + Add Goodreads URL (optional)
          </button>
        ) : (
          <input
            type="url"
            className="nyx-input text-sm"
            placeholder="https://www.goodreads.com/book/show/..."
            value={book.goodreads_url ?? ""}
            onChange={(e) =>
              onChange(index, { ...book, goodreads_url: e.target.value })
            }
          />
        )}
      </div>
    </div>
  );
}
