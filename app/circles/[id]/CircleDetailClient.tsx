"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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

  const [commentSessionId, setCommentSessionId] = useState<string | null>(null);
  const [comments, setComments] = useState<CircleComment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const [sessions] = useState<{ id: string; created_at: string; books: { title: string }[] }[]>([]);

  useEffect(() => {
    if (!circleId) return;
    fetch(`/api/circles/${circleId}`)
      .then((r) => r.json())
      .then((d: CircleDetail) => setDetail(d))
      .catch(() => {/* silent */})
      .finally(() => setLoading(false));
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
        body: JSON.stringify({ circle_id: circleId, session_id: commentSessionId, body: commentBody.trim() }),
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Circle not found.{" "}
          <Link href="/circles" style={{ color: "var(--brand-subtle)" }}>Go back</Link>
        </p>
      </div>
    );
  }

  const { circle, members } = detail;

  return (
    <div className="min-h-screen pt-20 pb-16 px-6" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Back + header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/circles"
            className="text-xs mb-4 block transition-colors duration-150"
            style={{ color: "var(--text-muted)", textDecoration: "none" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
          >
            ← Circles
          </Link>
          <h1
            className="font-display text-2xl mb-6"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            {circle.name}
          </h1>

          {/* Members */}
          <div className="card p-4 mb-4">
            <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
              Members ({members.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <span
                  key={m.id}
                  className="text-xs px-2.5 py-1 rounded"
                  style={{
                    border: "1px solid rgba(99,135,255,0.15)",
                    color: "var(--text-secondary)",
                    background: "rgba(99,135,255,0.06)",
                  }}
                >
                  {m.user_id.slice(0, 8)} · {m.role}
                </span>
              ))}
            </div>
          </div>

          {/* Invite */}
          <div>
            {!showInvite ? (
              <button onClick={() => setShowInvite(true)} className="btn-secondary text-sm">
                Invite member
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
                {!inviteLink ? (
                  <form onSubmit={handleInvite} className="flex gap-2">
                    <input
                      autoFocus
                      type="email"
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="input flex-1 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={inviting}
                      className="btn-primary text-sm"
                      style={{ opacity: inviting ? 0.5 : 1 }}
                    >
                      {inviting ? "…" : "Send invite"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInvite(false)}
                      className="btn-ghost text-sm"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      Invite link ready
                    </p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={inviteLink}
                        className="input flex-1 text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                      <button onClick={copyInviteLink} className="btn-secondary text-xs">
                        {copiedInvite ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <button
                      onClick={() => { setInviteLink(null); setShowInvite(false); }}
                      className="text-xs"
                      style={{ color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" }}
                    >
                      Done
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Sessions */}
        {sessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12"
          >
            <p className="text-sm mb-5" style={{ color: "var(--text-tertiary)" }}>
              No shared sessions yet. Start a session while this circle is active.
            </p>
            <Link href="/enter" className="btn-primary">
              Start a session
            </Link>
          </motion.div>
        )}

        {/* Comments panel */}
        <AnimatePresence>
          {commentSessionId && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="fixed right-0 top-0 bottom-0 w-80 z-50 flex flex-col"
              style={{
                background: "var(--bg-surface)",
                borderLeft: "1px solid rgba(99,135,255,0.1)",
              }}
            >
              <div
                className="flex items-center justify-between p-4"
                style={{ borderBottom: "1px solid rgba(99,135,255,0.08)" }}
              >
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Comments
                </span>
                <button
                  onClick={closeComments}
                  className="text-sm transition-colors duration-150"
                  style={{ color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {comments.length === 0 && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    No comments yet.
                  </p>
                )}
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-md"
                    style={{ background: "rgba(99,135,255,0.04)", border: "1px solid rgba(99,135,255,0.08)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{c.body}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
                      {new Date(c.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>

              <form
                onSubmit={postComment}
                className="p-4"
                style={{ borderTop: "1px solid rgba(99,135,255,0.08)" }}
              >
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Add a comment…"
                  rows={3}
                  className="textarea resize-none mb-2"
                  onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) postComment(e); }}
                />
                <button
                  type="submit"
                  disabled={postingComment || !commentBody.trim()}
                  className="btn-primary w-full text-sm"
                  style={{ opacity: postingComment || !commentBody.trim() ? 0.5 : 1 }}
                >
                  {postingComment ? "Posting…" : "Post"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
