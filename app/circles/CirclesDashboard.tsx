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
      <div className="loading-screen">
        <div className="loading-dots"><span /><span /><span /></div>
        <p className="loading-screen-label">Retrieving your circles</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-28 pb-20">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="label-overline mb-3" style={{ color: "rgba(200,169,110,0.35)" }}>
            Collaborative Reading
          </p>
          <h1
            className="font-cinzel mb-4"
            style={{ fontSize: "1.5rem", color: "var(--gold)", letterSpacing: "0.04em" }}
          >
            Reading Circles
          </h1>
          <div className="gold-divider-center mb-5">✦</div>
          <p
            className="font-fell italic"
            style={{ fontSize: "0.92rem", color: "rgba(232,213,183,0.42)" }}
          >
            Shared spaces where consultations and recommendations converge.
          </p>
        </motion.div>

        {/* Create circle CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <AnimatePresence mode="wait">
            {!showCreate ? (
              <motion.div
                key="btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <button onClick={() => setShowCreate(true)} className="btn-ghost">
                  Form a New Circle
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={handleCreate}
                className="victorian-border p-5"
              >
                <p className="label-overline mb-4">Name Your Circle</p>
                <div className="flex gap-3">
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. The Midnight Readers"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="nyx-input flex-1"
                    style={{ fontSize: "0.92rem" }}
                  />
                  <button
                    type="submit"
                    disabled={creating || !newName.trim()}
                    className="btn-ghost"
                    style={{
                      padding: "0 1.5rem",
                      opacity: creating || !newName.trim() ? 0.45 : 1,
                      flexShrink: 0,
                    }}
                  >
                    {creating ? "…" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); setNewName(""); }}
                    className="font-fell italic text-sm"
                    style={{
                      color: "rgba(200,169,110,0.35)",
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      flexShrink: 0,
                      padding: "0 0.5rem",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.65)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,169,110,0.35)"; }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {circles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <div
              className="font-cinzel mx-auto mb-6 flex items-center justify-center"
              style={{
                width: 64,
                height: 64,
                border: "1px solid rgba(200,169,110,0.15)",
                color: "rgba(200,169,110,0.2)",
                fontSize: "1.5rem",
                letterSpacing: "0.1em",
              }}
            >
              ◎
            </div>
            <p
              className="font-fell italic leading-relaxed"
              style={{ color: "rgba(232,213,183,0.38)", fontSize: "0.95rem" }}
            >
              No circles formed yet.<br />Invite fellow readers to share in the oracle&rsquo;s counsel.
            </p>
          </motion.div>
        )}

        {/* Circle list */}
        <div className="space-y-3">
          {circles.map((circle, i) => (
            <motion.div
              key={circle.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/circles/${circle.id}`}
                className="block victorian-border p-5 group"
                style={{ textDecoration: "none" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2
                      className="font-cinzel mb-1.5 transition-colors duration-200"
                      style={{
                        fontSize: "0.92rem",
                        color: "var(--parchment)",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {circle.name}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span
                        className="font-fell italic"
                        style={{ fontSize: "0.8rem", color: "rgba(200,169,110,0.4)" }}
                      >
                        {circle.member_count} {circle.member_count === 1 ? "member" : "members"}
                      </span>
                      <span
                        className={`role-badge ${circle.my_role === "owner" ? "role-badge-owner" : ""}`}
                      >
                        {circle.my_role}
                      </span>
                    </div>
                  </div>
                  <span
                    className="font-fell ml-4 flex-shrink-0 transition-all duration-200"
                    style={{
                      color: "rgba(200,169,110,0.25)",
                      fontSize: "0.9rem",
                      transform: "translateX(0)",
                    }}
                  >
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
