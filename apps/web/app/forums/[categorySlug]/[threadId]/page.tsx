"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

interface Author { username: string; display_name: string | null; avatar_url: string | null; }
interface Thread {
  id: string; title: string; body: string; status: string;
  visibility?: string; is_pinned?: boolean; linked_document_id?: string | null;
  score: number; vote_count?: number; viewer_vote?: number; comment_count: number; created_at: string;
  author_user_id: string; author: Author | null;
  category: { id: string; slug: string; title: string } | null;
  document?: { id: string; title: string; space: { slug: string } | null } | null;
}
interface Comment {
  id: string; body: string; status: string; score: number;
  vote_count?: number; viewer_vote?: number;
  is_pinned?: boolean; is_hidden?: boolean; reported_count?: number;
  created_at: string; author_user_id: string; author: Author | null;
}
interface ModerationAction {
  id: string;
  actionType: string;
  reason?: string | null;
  createdAt: string;
}

export default function ThreadPage() {
  const { categorySlug, threadId } = useParams<{ categorySlug: string; threadId: string }>();
  const [thread, setThread]       = useState<Thread | null>(null);
  const [comments, setComments]   = useState<Comment[]>([]);
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [session, setSession]     = useState<{ access_token: string; user: { id: string } } | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState<{ tone: "error" | "success"; message: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!threadId) return;
    getSession().then(async (sess) => {
      const data = await apiGet<{ thread: Thread; comments: Comment[]; moderationActions?: ModerationAction[] }>(
        `/threads/${threadId}`,
        sess?.access_token
      );
      setThread(data.thread);
      setComments(data.comments);
      setModerationActions(data.moderationActions ?? []);
      if (sess) setSession(sess as typeof session);
    }).catch((e) => {
      setError(e instanceof Error ? e.message : "Thread not found.");
    }).finally(() => setLoading(false));
  }, [threadId]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !session) return;
    setSubmitting(true);
    setCommentFeedback(null);
    try {
      const data = await apiPost<{ comment: Comment }>(
        "/comments",
        { parentType: "thread", parentId: threadId, body: newComment.trim() },
        session.access_token
      );
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      setCommentFeedback({ tone: "error", message: e instanceof Error ? e.message : "Could not post comment." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!session) return;
    try {
      await apiDelete(`/comments/${commentId}`, session.access_token);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch { /* silent */ }
  }

  async function voteThread(value: -1 | 1) {
    if (!session || !thread) return;
    setCommentFeedback(null);
    try {
      const response = await apiPost<{ thread: { id: string; score: number; vote_count?: number } }>(
        `/threads/${thread.id}/vote`,
        { value },
        session.access_token
      );
      setThread({ ...thread, score: response.thread.score, vote_count: response.thread.vote_count, viewer_vote: value });
    } catch (e) {
      setCommentFeedback({ tone: "error", message: e instanceof Error ? e.message : "Could not vote." });
    }
  }

  async function voteComment(commentId: string, value: -1 | 1) {
    if (!session) return;
    setCommentFeedback(null);
    try {
      const response = await apiPost<{ comment: { id: string; score: number; vote_count?: number } }>(
        `/comments/${commentId}/vote`,
        { value },
        session.access_token
      );
      setComments((current) => current.map((comment) => comment.id === commentId
        ? { ...comment, score: response.comment.score, vote_count: response.comment.vote_count, viewer_vote: value }
        : comment));
    } catch (e) {
      setCommentFeedback({ tone: "error", message: e instanceof Error ? e.message : "Could not vote." });
    }
  }

  async function report(targetType: "thread" | "comment", targetId: string) {
    if (!session) return;
    setCommentFeedback(null);
    try {
      await apiPost("/reports", { targetType, targetId, reason: "community_review" }, session.access_token);
      setCommentFeedback({ tone: "success", message: "Report sent for moderation review." });
    } catch (e) {
      setCommentFeedback({ tone: "error", message: e instanceof Error ? e.message : "Could not report." });
    }
  }

  if (loading) return <main className="container"><div className="card" style={{ textAlign: "center", padding: "3rem", color: "#555" }}>Loading...</div></main>;
  if (error || !thread) return <main className="container"><div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>{error ?? "Not found."}</div></main>;

  const isLocked   = thread.status === "locked";
  const canComment = !!session && !isLocked;

  return (
    <main className="container" style={{ maxWidth: 780 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: "0.78rem", color: "#555", marginBottom: "1.5rem" }}>
        <Link href="/forums" style={{ color: "#666" }}>Forums</Link>
        {" / "}
        <Link href={`/forums/${categorySlug}`} style={{ color: "#666" }}>
          {thread.category?.title ?? categorySlug}
        </Link>
        {" / "}
        <span style={{ color: "#aaa" }}>{thread.title}</span>
      </div>

      {/* Thread body */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          {isLocked && (
            <span style={{ fontSize: "0.72rem", padding: "0.1rem 0.45rem", borderRadius: 999, background: "#1a1535", border: "1px solid #2a2050", color: "#7c6af7" }}>
              locked
            </span>
          )}
          {thread.visibility && (
            <span style={{ fontSize: "0.72rem", padding: "0.1rem 0.45rem", borderRadius: 999, background: "#111827", border: "1px solid #1f2937", color: "#9ca3af" }}>
              {thread.visibility}
            </span>
          )}
          {thread.linked_document_id && (
            <span style={{ fontSize: "0.72rem", padding: "0.1rem 0.45rem", borderRadius: 999, background: "#10251a", border: "1px solid #22583a", color: "#86efac" }}>
              document discussion
            </span>
          )}
          <span style={{ fontSize: "0.72rem", color: "#555" }}>
            {new Date(thread.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
        <h1 style={{ margin: "0 0 0.75rem", fontSize: "1.5rem", lineHeight: 1.25 }}>{thread.title}</h1>
        {thread.author && (
          <div style={{ fontSize: "0.78rem", color: "#555", marginBottom: "1rem" }}>
            posted by {thread.author.display_name ?? thread.author.username}
          </div>
        )}
        <div style={{ lineHeight: 1.8, color: "#d1d5db", whiteSpace: "pre-wrap", fontSize: "0.975rem" }}>
          {thread.body}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", marginTop: "1rem", color: "#777", fontSize: "0.78rem" }}>
          <strong style={{ color: "#d1d5db" }}>{thread.score} votes</strong>
          {session && (
            <>
              {session.user.id !== thread.author_user_id ? (
                <>
                  <button type="button" onClick={() => voteThread(1)} style={voteButton(thread.viewer_vote === 1)}>Up</button>
                  <button type="button" onClick={() => voteThread(-1)} style={voteButton(thread.viewer_vote === -1)}>Down</button>
                </>
              ) : (
                <span style={{ color: "#777" }}>Own post</span>
              )}
              <button type="button" onClick={() => report("thread", thread.id)} style={utilityButton}>Report</button>
            </>
          )}
        </div>
        {thread.document?.space && (
          <div style={{ marginTop: "1rem" }}>
            <Link
              href={`/space/${thread.document.space.slug}/documents/${thread.document.id}`}
              style={{ color: "#86efac", fontSize: "0.82rem", textDecoration: "none" }}
            >
              Read source document: {thread.document.title}
            </Link>
          </div>
        )}
      </div>

      {moderationActions.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem", borderColor: "#2a2050" }}>
          <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Moderation log
          </div>
          <div style={{ display: "grid", gap: "0.45rem" }}>
            {moderationActions.map((action) => (
              <div key={action.id} style={{ color: "#999", fontSize: "0.8rem" }}>
                {action.actionType} - {new Date(action.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                {action.reason ? ` - ${action.reason}` : ""}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.78rem", color: "#555", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </div>

        {comments.length === 0 && (
          <div className="card" style={{ color: "#555", fontStyle: "italic" }}>No replies yet.</div>
        )}

        <div style={{ display: "grid", gap: "0.65rem" }}>
          {comments.map((c) => (
            <div key={c.id} className="card" style={{ padding: "0.875rem 1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#555" }}>
                  {c.author?.display_name ?? c.author?.username ?? "unknown"}
                  {" / "}
                  {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {session?.user.id === c.author_user_id && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "0.72rem", padding: "0.1rem 0.3rem" }}
                    title="Delete"
                  >
                    x
                  </button>
                )}
                {session && session.user.id !== c.author_user_id && (
                  <button
                    onClick={() => report("comment", c.id)}
                    style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "0.72rem", padding: "0.1rem 0.3rem" }}
                    title="Report"
                  >
                    report
                  </button>
                )}
              </div>
              <div style={{ lineHeight: 1.7, color: "#ccc", whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
                {c.body}
              </div>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginTop: "0.65rem", color: "#666", fontSize: "0.75rem" }}>
                <span>{c.score} votes</span>
                {session && session.user.id !== c.author_user_id && (
                  <>
                    <button type="button" onClick={() => voteComment(c.id, 1)} style={voteButton(c.viewer_vote === 1)}>Up</button>
                    <button type="button" onClick={() => voteComment(c.id, -1)} style={voteButton(c.viewer_vote === -1)}>Down</button>
                  </>
                )}
                {session && session.user.id === c.author_user_id && (
                  <span style={{ color: "#777" }}>Own comment</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Reply form */}
      {canComment && (
        <div className="card">
          <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Leave a reply
          </div>
          {commentFeedback && (
            <div style={{
              background: commentFeedback.tone === "success" ? "#10251a" : "#2d1515",
              border: `1px solid ${commentFeedback.tone === "success" ? "#22583a" : "#7d2e2e"}`,
              color: commentFeedback.tone === "success" ? "#86efac" : "#eb5757",
              borderRadius: 6,
              padding: "0.5rem 0.75rem",
              marginBottom: "0.75rem",
              fontSize: "0.85rem",
            }}>
              {commentFeedback.message}
            </div>
          )}
          <form onSubmit={handleComment} style={{ display: "grid", gap: "0.75rem" }}>
            <textarea
              className="textarea"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleComment(e as unknown as React.FormEvent); }}
              placeholder="Write your reply... (Ctrl+Enter to submit)"
              style={{ minHeight: 100, fontSize: "0.9rem", lineHeight: 1.65 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                style={{ padding: "0.5rem 1.25rem", background: "#7c6af7", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}
              >
                {submitting ? "Posting..." : "Post reply"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!session && (
        <div className="card" style={{ textAlign: "center", padding: "1.5rem", color: "#666" }}>
          <Link href="/login" style={{ color: "#7c6af7" }}>Sign in</Link> to join the discussion.
        </div>
      )}

      {isLocked && (
        <div className="card" style={{ textAlign: "center", padding: "1rem", color: "#555", fontStyle: "italic" }}>
          This thread is locked.
        </div>
      )}
    </main>
  );
}

function voteButton(active: boolean) {
  return {
    border: "1px solid #2a2050",
    borderRadius: 6,
    background: active ? "#2a2050" : "#101010",
    color: active ? "#d8d3ff" : "#777",
    fontSize: "0.72rem",
    padding: "0.15rem 0.45rem",
    cursor: "pointer",
  };
}

const utilityButton = {
  border: "1px solid #333",
  borderRadius: 6,
  background: "#111",
  color: "#777",
  fontSize: "0.72rem",
  padding: "0.15rem 0.45rem",
  cursor: "pointer",
};
