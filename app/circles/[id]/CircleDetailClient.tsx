"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import CandleFlicker from "@/components/CandleFlicker";
import type { Circle, CircleMember, CircleComment } from "@/types";

interface CircleDetail {
  circle: Circle;
  members: CircleMember[];
}

export default function CircleDetailClient() {
  const params = useParams();
  const circleId = params.id as string;

  const [detail, setDetail] = useState<CircleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Comments
  const [commentSessionId, setCommentSessionId] = useState<string | null>(null);
  const [comments, setComments] = useState<CircleComment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Sessions in this circle
  const [sessions, setSessions] = useState<{ id: string; created_at: string; books: { title: string }[] }[]>([]);

  useEffect(() => {
    if (!circleId) return;

    fetch(`/api/circles/${circleId}`)
      .then((r) => r.json())
      .then((d: CircleDetail) => setDetail(d))
      .catch(() => {/* silent */})
      .finally(() => setLoading(false));

    // Load sessions that belong to this circle
    // (We piggyback on the supabase client — see note below)
  }, [circleId]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || inviting) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/circles/${circleId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      if (res.ok) {
        const data = await res.json() as { invite_link: string };
        setInviteLink(`${window.location.origin}${data.invite_link}`);
        setInviteEmail("");
      }
    } catch {/* silent */}
    setInviting(false);
  }

  async function copyInviteLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink).catch(() => {/* silent */});
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  }

  async function loadComments(sessionId: string) {
    setCommentSessionId(sessionId);
    const res = await fetch(`/api/comments?circle_id=${circleId}&session_id=${sessionId}`);
    if (res.ok) {
      const data = await res.json() as { comments: CircleComment[] };
      setComments(data.comments ?? []);
    }
  }

  function closeComments() {
    setCommentSessionId(null);
    setComments([]);
    setCommentBody("");
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim() || !commentSessionId || postingComment) return;
    setPostingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          circle_id: circleId,
          session_id: commentSessionId,
          body: commentBody.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json() as { comment: CircleComment };
        setComments((prev) => [...prev, data.comment]);
        setCommentBody("");
      }
    } catch {/* silent */}
    setPostingComment(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-fell italic" style={{ color: "rgba(232,213,183,0.5)" }}>
          Circle not found.{" "}
          <Link href="/circles" style={{ color: "rgba(200,169,110,0.7)" }}>Return</Link>
        </p>
      </div>
    );
  }

  const { circle, members } = detail;

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Candles */}
        <div className="flex gap-10 justify-center mb-10">
          <CandleFlicker size={26} />
          <CandleFlicker size={32} />
          <CandleFlicker size={26} />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link
            href="/circles"
            className="font-cinzel text-xs tracking-widest uppercase mb-4 block"
            style={{ color: "rgba(200,169,110,0.4)", textDecoration: "none" }}
          >
            ← Circles
          </Link>
          <h1 className="font-cinzel text-2xl mb-2" style={{ color: "#C8A96E" }}>
            {circle.name}
          </h1>
          <div className="gold-divider mt-2 mb-6" />

          {/* Members */}
          <div className="mb-6">
            <p className="font-cinzel text-xs tracking-widest uppercase mb-3" style={{ color: "rgba(200,169,110,0.4)" }}>
              Members ({members.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <span
                  key={m.id}
                  className="font-fell italic text-xs px-3 py-1"
                  style={{
                    border: "1px solid rgba(200,169,110,0.2)",
                    color: "rgba(232,213,183,0.6)",
                    background: "rgba(200,169,110,0.03)",
                  }}
                >
                  {m.user_id.slice(0, 6)}… · {m.role}
                </span>
              ))}
            </div>
          </div>

          {/* Invite */}
          <div>
            {!showInvite ? (
              <button
                onClick={() => setShowInvite(true)}
                className="font-cinzel text-xs tracking-widest uppercase px-4 py-2 transition-all"
                style={{
                  border: "1px solid rgba(200,169,110,0.3)",
                  color: "rgba(200,169,110,0.6)",
                  background: "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,169,110,0.6)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200,169,110,0.3)"; }}
              >
                Invite a Member
              </button>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {!inviteLink ? (
                  <form onSubmit={handleInvite} className="flex gap-3">
                    <input
                      autoFocus
                      type="email"
                      placeholder="Email address..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 font-fell italic text-sm px-4 py-2 bg-transparent outline-none"
                      style={{ border: "1px solid rgba(200,169,110,0.3)", color: "rgba(232,213,183,0.85)" }}
                    />
                    <button
                      type="submit"
                      disabled={inviting}
                      className="font-cinzel text-xs tracking-widest uppercase px-4 py-2"
                      style={{
                        border: "1px solid rgba(200,169,110,0.4)",
                        color: "rgba(200,169,110,0.8)",
                        background: "transparent",
                        cursor: inviting ? "not-allowed" : "pointer",
                      }}
                    >
                      {inviting ? "..." : "Generate Link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInvite(false)}
                      style={{ color: "rgba(200,169,110,0.4)", cursor: "pointer", background: "none", border: "none" }}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "rgba(200,169,110,0.5)" }}>
                      Invite link generated
                    </p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={inviteLink}
                        className="flex-1 font-fell italic text-xs px-3 py-2 bg-transparent"
                        style={{ border: "1px solid rgba(200,169,110,0.2)", color: "rgba(232,213,183,0.5)" }}
                      />
                      <button
                        onClick={copyInviteLink}
                        className="font-cinzel text-xs tracking-widest uppercase px-4 py-2"
                        style={{
                          border: "1px solid rgba(200,169,110,0.4)",
                          color: copiedInvite ? "rgba(200,169,110,1)" : "rgba(200,169,110,0.7)",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        {copiedInvite ? "Copied ✦" : "Copy"}
                      </button>
                    </div>
                    <button
                      onClick={() => { setInviteLink(null); setShowInvite(false); }}
                      className="font-fell italic text-xs self-start"
                      style={{ color: "rgba(200,169,110,0.3)", cursor: "pointer", background: "none", border: "none" }}
                    >
                      Done
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Placeholder: sessions section */}
        {sessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <p className="font-fell italic mb-6" style={{ color: "rgba(232,213,183,0.4)" }}>
              No shared consultations yet. Start a consultation while this circle is active and share it here.
            </p>
            <Link href="/enter" className="btn-ghost">
              Begin a Consultation
            </Link>
          </motion.div>
        )}

        {/* Comments panel (slide-in) */}
        <AnimatePresence>
          {commentSessionId && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="fixed right-0 top-0 bottom-0 w-80 z-50 flex flex-col"
              style={{
                background: "#0D0A07",
                borderLeft: "1px solid rgba(200,169,110,0.2)",
              }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gold/10">
                <span className="font-cinzel text-xs tracking-widest uppercase" style={{ color: "rgba(200,169,110,0.6)" }}>
                  Comments
                </span>
                <button
                  onClick={closeComments}
                  style={{ color: "rgba(200,169,110,0.4)", cursor: "pointer", background: "none", border: "none" }}
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {comments.length === 0 && (
                  <p className="font-fell italic text-xs" style={{ color: "rgba(232,213,183,0.35)" }}>
                    No comments yet.
                  </p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="p-3" style={{ border: "1px solid rgba(200,169,110,0.12)", background: "rgba(200,169,110,0.02)" }}>
                    <p className="font-fell text-xs mb-1" style={{ color: "rgba(232,213,183,0.7)" }}>
                      {c.body}
                    </p>
                    <p className="font-cinzel text-xs" style={{ color: "rgba(200,169,110,0.3)", fontSize: "0.65rem" }}>
                      {new Date(c.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={postComment} className="p-4 border-t border-gold/10">
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full font-fell italic text-sm px-3 py-2 bg-transparent outline-none resize-none"
                  style={{ border: "1px solid rgba(200,169,110,0.25)", color: "rgba(232,213,183,0.8)" }}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) postComment(e); }}
                />
                <button
                  type="submit"
                  disabled={postingComment || !commentBody.trim()}
                  className="mt-2 w-full font-cinzel text-xs tracking-widest uppercase py-2 transition-all"
                  style={{
                    border: "1px solid rgba(200,169,110,0.3)",
                    color: "rgba(200,169,110,0.7)",
                    background: "transparent",
                    cursor: postingComment || !commentBody.trim() ? "not-allowed" : "pointer",
                    opacity: postingComment || !commentBody.trim() ? 0.5 : 1,
                  }}
                >
                  {postingComment ? "..." : "Post"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
