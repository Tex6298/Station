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
  score: number; comment_count: number; created_at: string;
  author_user_id: string; author: Author | null;
  category: { id: string; slug: string; title: string } | null;
  document?: { id: string; title: string; space: { slug: string } | null } | null;
}
interface Comment {
  id: string; body: string; status: string; score: number;
  is_pinned?: boolean; is_hidden?: boolean; reported_count?: number;
  created_at: string; author_user_id: string; author: Author | null;
}

export default function ThreadPage() {
  const { categorySlug, threadId } = useParams<{ categorySlug: string; threadId: string }>();
  const [thread, setThread]       = useState<Thread | null>(null);
  const [comments, setComments]   = useState<Comment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [session, setSession]     = useState<{ access_token: string; user: { id: string } } | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!threadId) return;
    getSession().then(async (sess) => {
      const data = await apiGet<{ thread: Thread; comments: Comment[] }>(
        `/threads/${threadId}`,
        sess?.access_token
      );
      setThread(data.thread);
      setComments(data.comments);
      if (sess) setSession(sess as typeof session);
    }).catch((e) => {
      setError(e instanceof Error ? e.message : "Thread not found.");
    }).finally(() => setLoading(false));
  }, [threadId]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !session) return;
    setSubmitting(true);
    setCommentError(null);
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
      setCommentError(e instanceof Error ? e.message : "Could not post comment.");
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
              </div>
              <div style={{ lineHeight: 1.7, color: "#ccc", whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
                {c.body}
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
          {commentError && (
            <div style={{ background: "#2d1515", border: "1px solid #7d2e2e", color: "#eb5757", borderRadius: 6, padding: "0.5rem 0.75rem", marginBottom: "0.75rem", fontSize: "0.85rem" }}>
              {commentError}
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
