"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import CandleFlicker from "@/components/CandleFlicker";
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

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Candles */}
        <div className="flex gap-10 justify-center mb-10">
          <CandleFlicker size={28} />
          <CandleFlicker size={36} />
          <CandleFlicker size={28} />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="font-cinzel text-3xl mb-3" style={{ color: "#C8A96E" }}>
            Reading Circles
          </h1>
          <div className="gold-divider-center mb-4">✦</div>
          <p className="font-fell italic text-sm" style={{ color: "rgba(232,213,183,0.55)" }}>
            Collaborative spaces for shared consultations and recommendations.
          </p>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Create circle */}
            {!showCreate ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 text-center"
              >
                <button
                  onClick={() => setShowCreate(true)}
                  className="btn-ghost"
                >
                  Form a New Circle
                </button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleCreate}
                className="mb-8 flex gap-3"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Circle name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 font-fell italic text-sm px-4 py-3 bg-transparent outline-none"
                  style={{
                    border: "1px solid rgba(200,169,110,0.4)",
                    color: "rgba(232,213,183,0.9)",
                  }}
                  onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(200,169,110,0.7)"; }}
                  onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(200,169,110,0.4)"; }}
                />
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="font-cinzel text-xs tracking-widest uppercase px-5 py-3 transition-all duration-200"
                  style={{
                    border: "1px solid rgba(200,169,110,0.4)",
                    color: "rgba(200,169,110,0.8)",
                    background: "transparent",
                    cursor: creating ? "not-allowed" : "pointer",
                    opacity: creating || !newName.trim() ? 0.5 : 1,
                  }}
                >
                  {creating ? "..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setNewName(""); }}
                  className="font-fell italic text-sm px-4"
                  style={{ color: "rgba(200,169,110,0.4)", cursor: "pointer", background: "none", border: "none" }}
                >
                  Cancel
                </button>
              </motion.form>
            )}

            {/* Empty */}
            {circles.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center font-fell italic"
                style={{ color: "rgba(232,213,183,0.4)" }}
              >
                No circles yet. Form one to share consultations with others.
              </motion.p>
            )}

            {/* Circle list */}
            <div className="space-y-4">
              {circles.map((circle, i) => (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i }}
                >
                  <Link
                    href={`/circles/${circle.id}`}
                    className="block victorian-border p-5 transition-all duration-200"
                    style={{ textDecoration: "none" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,169,110,0.4)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = ""; }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="font-cinzel text-base mb-1" style={{ color: "#E8D5B7" }}>
                          {circle.name}
                        </h2>
                        <p className="font-fell italic text-xs" style={{ color: "rgba(200,169,110,0.5)" }}>
                          {circle.member_count} member{circle.member_count !== 1 ? "s" : ""} &middot; {circle.my_role}
                        </p>
                      </div>
                      <span style={{ color: "rgba(200,169,110,0.4)" }}>→</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
