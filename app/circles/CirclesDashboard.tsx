"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { CircleWithMembership } from "@/types";

export default function CirclesDashboard() {
  const [circles, setCircles] = useState<CircleWithMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/circles")
      .then((r) => r.json())
      .then((d: { circles: CircleWithMembership[] }) => setCircles(d.circles ?? []))
      .catch(() => {/* silent */})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/circles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const { circle }: { circle: CircleWithMembership } = await res.json();
        circle.member_count = 1;
        circle.my_role = "owner";
        setCircles((prev) => [circle, ...prev]);
        setNewName("");
        setShowCreate(false);
      }
    } catch {/* silent */}
    setCreating(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 px-6" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1
              className="font-display text-2xl mb-1"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              Reading circles
            </h1>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Shared spaces for collaborative reading.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            New circle
          </button>
        </motion.div>

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              key="create-form"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="card p-5 mb-6"
            >
              <p className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
                Create a circle
              </p>
              <form onSubmit={handleCreate} className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Circle name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input flex-1"
                />
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="btn-primary"
                  style={{ opacity: creating || !newName.trim() ? 0.5 : 1 }}
                >
                  {creating ? "Creating…" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setNewName(""); }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {circles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20"
          >
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(99,135,255,0.08)", border: "1px solid rgba(99,135,255,0.12)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="6" stroke="var(--brand-subtle)" strokeWidth="1.5"/>
                <path d="M10 7v6M7 10h6" stroke="var(--brand-subtle)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
              No circles yet. Create one and invite your team.
            </p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Create your first circle
            </button>
          </motion.div>
        )}

        {/* Circle list */}
        <div className="space-y-3">
          {circles.map((circle, i) => (
            <motion.div
              key={circle.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
            >
              <Link
                href={`/circles/${circle.id}`}
                className="card p-4 flex items-center justify-between group transition-all duration-150 hover:border-brand/30"
                style={{ display: "flex", textDecoration: "none" }}
              >
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-sm font-semibold mb-0.5 transition-colors duration-150"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {circle.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {circle.member_count} {circle.member_count === 1 ? "member" : "members"}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: circle.my_role === "owner"
                          ? "rgba(99,135,255,0.12)"
                          : "rgba(99,135,255,0.06)",
                        color: "var(--brand-subtle)",
                        border: "1px solid rgba(99,135,255,0.15)",
                      }}
                    >
                      {circle.my_role}
                    </span>
                  </div>
                </div>
                <svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  className="flex-shrink-0 ml-3 transition-transform duration-150 group-hover:translate-x-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
