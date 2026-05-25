"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { PostComposer } from "@/components/social/post-composer";

interface Document {
  id: string; title: string; slug: string; body: string | null;
  document_type: string; status: string; visibility: string;
  published_at: string | null; author_user_id: string;
  persona_id: string | null; space_id: string | null;
  provenance_type?: string | null;
  source_type?: string | null;
  source_label?: string | null;
  comments_enabled?: boolean;
  discussion_thread_id?: string | null;
}

interface Discussion {
  id: string;
  title: string;
  status: string;
  visibility: string;
  comment_count: number;
  linked_document_id: string | null;
  category: { id: string; slug: string; title: string } | null;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  post: "Post", essay: "Essay", manifesto: "Manifesto",
  constitution: "Constitution", update: "Update", other: "Other",
};

const PROVENANCE_LABELS: Record<string, string> = {
  user_authored: "User-authored",
  ai_assisted: "AI-assisted",
  archive_import: "Archive import",
  integrity_session: "Integrity Session",
  persona_derived: "Persona-derived",
};

export default function DocumentPage() {
  const { slug, documentId } = useParams<{ slug: string; documentId: string }>();
  const [doc, setDoc]               = useState<Document | null>(null);
  const [loading, setLoading]       = useState(true);
  const [isOwner, setIsOwner]       = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [discussionEligible, setDiscussionEligible] = useState(false);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [startingDiscussion, setStartingDiscussion] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [discussionError, setDiscussionError] = useState<string | null>(null);
  const [token, setToken]           = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;
    getSession().then(async (session) => {
      if (session) setToken(session.access_token);
      try {
        const data = await apiGet<{ document: Document; access?: "owner" | "reader" }>(
          `/documents/${documentId}`,
          session?.access_token
        );
        setDoc(data.document);
        setIsOwner(data.access === "owner");
        void loadDiscussionForDocument(data.document.id, session?.access_token);
      } catch {
        try {
          const data = await apiGet<{ document: Document }>(`/documents/public/${documentId}`);
          setDoc(data.document);
          void loadDiscussionForDocument(data.document.id, session?.access_token);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Document not found.");
        }
      }
      setLoading(false);
    });
  }, [documentId]);

  async function loadDiscussionForDocument(id: string, accessToken?: string) {
    setDiscussionLoading(true);
    setDiscussionError(null);
    try {
      const data = await apiGet<{ eligible: boolean; discussion: Discussion | null }>(
        `/documents/${id}/discussion`,
        accessToken
      );
      setDiscussionEligible(data.eligible);
      setDiscussion(data.discussion);
    } catch (e) {
      setDiscussionEligible(false);
      setDiscussion(null);
      setDiscussionError(e instanceof Error ? e.message : "Discussion is unavailable.");
    } finally {
      setDiscussionLoading(false);
    }
  }

  async function handlePublish() {
    if (!token || !doc) return;
    setPublishing(true);
    try {
      const data = await apiPost<{ document: Document; discussion?: Discussion | null }>(`/documents/${doc.id}/publish`, {}, token);
      setDoc(data.document);
      setDiscussionEligible(Boolean(data.discussion));
      if (data.discussion) setDiscussion(data.discussion);
    } catch { /* silent */ }
    finally { setPublishing(false); }
  }

  async function handleStartDiscussion() {
    if (!token || !doc) return;
    setStartingDiscussion(true);
    setDiscussionError(null);
    try {
      const data = await apiPost<{ discussion: Discussion }>(`/documents/${doc.id}/discussion`, {}, token);
      setDiscussion(data.discussion);
      setDiscussionEligible(true);
    } catch (e) {
      setDiscussionError(e instanceof Error ? e.message : "Could not start discussion.");
    } finally {
      setStartingDiscussion(false);
    }
  }

  if (loading) return <main className="container"><div className="card" style={{ textAlign: "center", padding: "3rem", color: "#555" }}>Loading...</div></main>;
  if (error || !doc) return <main className="container"><div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>{error ?? "Not found."}</div></main>;

  return (
    <main className="container" style={{ maxWidth: 720 }}>
      <div style={{ fontSize: "0.78rem", color: "#555", marginBottom: "1.5rem" }}>
        <Link href="/space" style={{ color: "#666" }}>Spaces</Link>{" / "}
        <Link href={"/space/" + slug} style={{ color: "#666" }}>{slug}</Link>{" / "}
        <span style={{ color: "#aaa" }}>{doc.title}</span>
      </div>

      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.65rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.72rem", color: "#555", background: "#111827", border: "1px solid #1f2937", borderRadius: 999, padding: "0.1rem 0.45rem" }}>
            {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
          </span>
          <span style={{
            fontSize: "0.72rem", padding: "0.1rem 0.45rem", borderRadius: 999,
            background: doc.status === "published" ? "#0f2d1a" : "#1a1a2e",
            border: "1px solid " + (doc.status === "published" ? "#2e7d4f" : "#2a2a5a"),
            color: doc.status === "published" ? "#6fcf97" : "#7c6af7",
          }}>
            {doc.status}
          </span>
          {doc.provenance_type && (
            <span style={{ fontSize: "0.72rem", color: "#7dd3fc", background: "#0c2536", border: "1px solid #1d4f68", borderRadius: 999, padding: "0.1rem 0.45rem" }}>
              {PROVENANCE_LABELS[doc.provenance_type] ?? doc.provenance_type}
            </span>
          )}
          {doc.published_at && (
            <span style={{ fontSize: "0.72rem", color: "#555" }}>
              {new Date(doc.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>

        <h1 style={{ margin: "0 0 0.75rem", fontSize: "1.9rem", lineHeight: 1.2 }}>{doc.title}</h1>

        {isOwner && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {doc.status !== "published" && (
              <button onClick={handlePublish} disabled={publishing}
                style={{ padding: "0.4rem 0.9rem", background: "#7c6af7", border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: "0.82rem" }}>
                {publishing ? "Publishing..." : "Publish"}
              </button>
            )}
            <button
              onClick={() => setShowComposer((v) => !v)}
              style={{ padding: "0.4rem 0.9rem", background: "transparent", border: "1px solid #334155", borderRadius: 7, color: "#aaa", cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              Signal Share to socials
            </button>
          </div>
        )}
        {doc.source_label && (
          <div style={{ marginTop: "0.9rem", color: "#7f8aa0", fontSize: "0.82rem" }}>
            Source: {doc.source_label}
          </div>
        )}
      </div>

      {/* Social composer panel */}
      {showComposer && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.72rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.85rem" }}>
            Share to social media
          </div>
          <PostComposer
            documentId={doc.id}
            documentTitle={doc.title}
            onClose={() => setShowComposer(false)}
          />
        </div>
      )}

      {doc.status === "published" && (
        <section className="card" style={{ marginBottom: "1.5rem", padding: "1rem 1.1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#7f8aa0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>
                Discussion
              </div>
              <div style={{ color: "#cbd5e1", fontWeight: 650 }}>
                {discussion
                  ? "Community thread attached"
                  : discussionEligible && isOwner
                    ? "Open a thread for this work"
                    : discussionEligible
                      ? "Discussion has not been opened yet"
                      : "Discussion unavailable"}
              </div>
              <div style={{ color: "#7f8aa0", fontSize: "0.82rem", marginTop: "0.25rem" }}>
                {discussionLoading
                  ? "Checking discussion state..."
                  : discussion
                    ? `${discussion.comment_count ?? 0} ${(discussion.comment_count ?? 0) === 1 ? "reply" : "replies"} / ${discussion.visibility}`
                    : discussionEligible
                      ? "The public copy can be discussed without exposing the private source."
                      : "This document is not currently discussable."}
              </div>
              {discussionError && <div style={{ color: "#eb5757", fontSize: "0.8rem", marginTop: "0.4rem" }}>{discussionError}</div>}
            </div>
            {discussion ? (
              <Link
                className="button primary"
                href={`/forums/${discussion.category?.slug ?? "documents-and-constitutions"}/${discussion.id}`}
                style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}
              >
                Open discussion
              </Link>
            ) : discussionEligible && token && isOwner ? (
              <button
                onClick={handleStartDiscussion}
                disabled={startingDiscussion}
                style={{ padding: "0.45rem 0.9rem", background: "#7c6af7", border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: "0.82rem" }}
              >
                {startingDiscussion ? "Starting..." : "Start discussion"}
              </button>
            ) : null}
          </div>
        </section>
      )}

      <div style={{ lineHeight: 1.85, fontSize: "1rem", color: "#d1d5db", whiteSpace: "pre-wrap" }}>
        {doc.body ?? <span style={{ color: "#555", fontStyle: "italic" }}>No content yet.</span>}
      </div>
    </main>
  );
}
