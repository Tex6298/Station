"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { documentReadRoute, shouldFallbackToPublicDocumentRead } from "@/lib/document-read-route";
import {
  documentEditHref,
  documentProvenanceLabel,
  documentPublicVersionLabel,
  documentTrustReadback,
  documentVersionSummaryLabel,
  type PublishingDocumentVersion,
  type PublishingTrustRow,
} from "@/lib/publishing";
import { publicDocumentDiscussionEntrypointCopy } from "@/lib/public-story-polish";

interface Document {
  id: string; title: string; slug: string; body: string | null;
  document_type: string; status: string; visibility: string;
  published_at: string | null; updated_at?: string | null; created_at?: string | null;
  author_user_id: string; version?: number | null;
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
  essay: "Essay",
  codex: "Codex",
  manifesto: "Manifesto",
  field_log: "Field Log",
  research: "Research Document",
  archive_note: "Archive Note",
  transcript: "Transcript",
  // Legacy alpha values may remain until migration 032 has run everywhere.
  post: "Essay",
  constitution: "Codex",
  update: "Field Log",
  other: "Archive Note",
};

function discussionVisibilityForDocument(doc: Document) {
  if (doc.visibility === "community" || doc.visibility === "members") return "community";
  if (doc.visibility === "unlisted") return "unlisted";
  return "public";
}

function discussionFallbackFromDocument(doc: Document): Discussion | null {
  if (!doc.discussion_thread_id) return null;
  return {
    id: doc.discussion_thread_id,
    title: `Discuss: ${doc.title}`,
    status: "active",
    visibility: discussionVisibilityForDocument(doc),
    comment_count: 0,
    linked_document_id: doc.id,
    category: { id: "documents-and-codexes", slug: "documents-and-codexes", title: "Documents & Codexes" },
  };
}

export default function DocumentPage() {
  const { slug, documentId } = useParams<{ slug: string; documentId: string }>();
  const [doc, setDoc]               = useState<Document | null>(null);
  const [loading, setLoading]       = useState(true);
  const [isOwner, setIsOwner]       = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [versions, setVersions] = useState<PublishingDocumentVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [discussionEligible, setDiscussionEligible] = useState(false);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [startingDiscussion, setStartingDiscussion] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [discussionError, setDiscussionError] = useState<string | null>(null);
  const [token, setToken]           = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;
    getSession().then(async (session) => {
      if (session) setToken(session.access_token);
      const hasSession = Boolean(session?.access_token);
      setVersions([]);
      setVersionError(null);
      try {
        const data = await apiGet<{ document: Document; access?: "owner" | "reader" }>(
          documentReadRoute(documentId, hasSession),
          session?.access_token
        );
        const ownerAccess = data.access === "owner";
        setDoc(data.document);
        setIsOwner(ownerAccess);
        const fallbackDiscussion = discussionFallbackFromDocument(data.document);
        if (fallbackDiscussion) setDiscussion(fallbackDiscussion);
        void loadDiscussionForDocument(data.document.id, session?.access_token, fallbackDiscussion);
        if (ownerAccess && session?.access_token) {
          void loadVersionHistoryForDocument(data.document.id, session.access_token);
        }
      } catch {
        if (!shouldFallbackToPublicDocumentRead(hasSession)) {
          setError("Document not found.");
          setLoading(false);
          return;
        }
        try {
          const data = await apiGet<{ document: Document }>(`/documents/public/${documentId}`);
          setDoc(data.document);
          setIsOwner(false);
          setVersions([]);
          const fallbackDiscussion = discussionFallbackFromDocument(data.document);
          if (fallbackDiscussion) setDiscussion(fallbackDiscussion);
          void loadDiscussionForDocument(data.document.id, session?.access_token, fallbackDiscussion);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Document not found.");
        }
      }
      setLoading(false);
    });
  }, [documentId]);

  async function loadVersionHistoryForDocument(id: string, accessToken: string) {
    setVersionsLoading(true);
    setVersionError(null);
    try {
      const data = await apiGet<{ currentVersion: number; versions: PublishingDocumentVersion[] }>(
        `/documents/${id}/versions`,
        accessToken
      );
      setVersions(data.versions ?? []);
      setDoc((current) =>
        current && current.id === id
          ? { ...current, version: data.currentVersion ?? current.version }
          : current
      );
    } catch (e) {
      setVersionError(e instanceof Error ? e.message : "Version history is unavailable.");
    } finally {
      setVersionsLoading(false);
    }
  }

  async function loadDiscussionForDocument(id: string, accessToken?: string, fallbackDiscussion?: Discussion | null) {
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
      if (fallbackDiscussion) {
        setDiscussionEligible(true);
        setDiscussion(fallbackDiscussion);
        setDiscussionError(null);
      } else {
        setDiscussionEligible(false);
        setDiscussion(null);
        setDiscussionError(e instanceof Error ? e.message : "Discussion is unavailable.");
      }
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

  if (loading) return <main className="container"><div className="card" style={{ textAlign: "center", padding: "3rem", color: "#687078" }}>Loading...</div></main>;
  if (error || !doc) return <main className="container"><div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>{error ?? "Not found."}</div></main>;

  const discussionHref = discussion
    ? `/forums/${discussion.category?.slug ?? "documents-and-codexes"}/${discussion.id}`
    : null;
  const discussionCopy = publicDocumentDiscussionEntrypointCopy({
    hasDiscussion: Boolean(discussion),
    loading: discussionLoading,
    eligible: discussionEligible,
    isOwner,
  });
  const discussionBody = discussion
    ? `${discussion.comment_count ?? 0} ${(discussion.comment_count ?? 0) === 1 ? "reply" : "replies"} / ${discussion.visibility}. ${discussionCopy.body}`
    : discussionCopy.body;
  const currentVersion = doc.version && doc.version > 0 ? doc.version : 1;
  const editHref = documentEditHref(doc.id);
  const trustRows = documentTrustReadback({
    document: doc,
    isOwner,
    hasDiscussion: Boolean(discussion),
    discussionEligible,
    discussionLoading,
  });

  return (
    <main className="container" style={{ maxWidth: 720 }}>
      <div style={{ fontSize: "0.78rem", color: "#8b8f92", marginBottom: "1.5rem" }}>
        <Link href="/space" style={{ color: "#687078" }}>Spaces</Link>{" / "}
        <Link href={"/space/" + slug} style={{ color: "#687078" }}>{slug}</Link>{" / "}
        <span style={{ color: "#534ab7" }}>{doc.title}</span>
      </div>

      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.65rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.72rem", color: "#687078", background: "#f8f7f4", border: "1px solid #d8d3c8", borderRadius: 999, padding: "0.1rem 0.45rem" }}>
            {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
          </span>
          <span style={{
            fontSize: "0.72rem", padding: "0.1rem 0.45rem", borderRadius: 999,
            background: doc.status === "published" ? "#e9f5ee" : "#eeedfe",
            border: "1px solid " + (doc.status === "published" ? "rgba(59, 143, 99, 0.35)" : "#d8d3c8"),
            color: doc.status === "published" ? "#25633f" : "#534ab7",
          }}>
            {doc.status}
          </span>
          {doc.provenance_type && (
            <span style={{ fontSize: "0.72rem", color: "#174b70", background: "#e7f0f6", border: "1px solid rgba(40, 120, 185, 0.35)", borderRadius: 999, padding: "0.1rem 0.45rem" }}>
              {documentProvenanceLabel(doc.provenance_type)}
            </span>
          )}
          {doc.published_at && (
            <span style={{ fontSize: "0.72rem", color: "#8b8f92" }}>
              {new Date(doc.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
          {currentVersion > 1 && (
            <span style={{ fontSize: "0.72rem", color: "#4f5a63", background: "#f1f4f6", border: "1px solid #d8d3c8", borderRadius: 999, padding: "0.1rem 0.45rem" }}>
              Version v{currentVersion}
            </span>
          )}
        </div>

        <h1 style={{ margin: "0 0 0.75rem", fontSize: "1.9rem", lineHeight: 1.2 }}>{doc.title}</h1>

        {discussionHref && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap", margin: "0.35rem 0 0.85rem" }}>
            <Link className="button primary" href={discussionHref} style={{ fontSize: "0.82rem" }}>
              {discussionCopy.actionLabel}
            </Link>
            <span style={{ color: "#687078", fontSize: "0.82rem" }}>
              Public forum thread attached to this document.
            </span>
          </div>
        )}

        {isOwner && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {doc.status !== "published" && (
              <button onClick={handlePublish} disabled={publishing}
                style={{ padding: "0.4rem 0.9rem", background: "#1f2529", border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: "0.82rem" }}>
                {publishing ? "Publishing..." : "Publish"}
              </button>
            )}
            <Link
              className="button"
              href={editHref}
              style={{ padding: "0.4rem 0.9rem", background: "transparent", border: "1px solid #d8d3c8", borderRadius: 7, color: "#1f2529", fontSize: "0.82rem" }}
            >
              Continue editing
            </Link>
            <span style={{ padding: "0.4rem 0.9rem", background: "#f8f7f4", border: "1px solid #d8d3c8", borderRadius: 7, color: "#687078", fontSize: "0.82rem" }}>
              Social connector readiness paused
            </span>
          </div>
        )}
      </div>

      <DocumentTrustReadback rows={trustRows} />

      {(isOwner || currentVersion > 1) && (
        <section className="card" style={{ marginBottom: "1.5rem", padding: "1rem 1.1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.9rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 260px" }}>
              <div style={{ fontSize: "0.72rem", color: "#687078", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>
                Version readback
              </div>
              <div style={{ color: "#1f2529", fontWeight: 650 }}>
                {isOwner
                  ? documentVersionSummaryLabel(currentVersion, versions)
                  : documentPublicVersionLabel(currentVersion)}
              </div>
              <div style={{ color: "#687078", fontSize: "0.82rem", marginTop: "0.25rem" }}>
                {isOwner
                  ? "Prior versions are private owner history. Public readers only see the current published copy and its discussion thread."
                  : "Public readers are seeing the current published copy. Prior drafts and owner version history stay private."}
              </div>
              {isOwner && versionsLoading && (
                <div style={{ color: "#8b8f92", fontSize: "0.8rem", marginTop: "0.55rem" }}>Loading version history...</div>
              )}
              {isOwner && versionError && (
                <div style={{ color: "#eb5757", fontSize: "0.8rem", marginTop: "0.55rem" }}>{versionError}</div>
              )}
              {isOwner && versions.length > 0 && (
                <div style={{ marginTop: "0.7rem", display: "grid", gap: "0.45rem" }}>
                  {versions.slice(0, 3).map((version) => (
                    <div key={version.id} style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", borderTop: "1px solid #eee9df", paddingTop: "0.45rem", color: "#687078", fontSize: "0.8rem" }}>
                      <span>v{version.versionNumber} / {version.title}</span>
                      <span style={{ whiteSpace: "nowrap" }}>
                        {version.capturedAt
                          ? new Date(version.capturedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : version.visibility}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {isOwner && (
              <Link
                className="button primary"
                href={editHref}
                style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}
              >
                Continue editing
              </Link>
            )}
          </div>
        </section>
      )}

      {doc.status === "published" && (
        <section className="card" style={{ marginBottom: "1.5rem", padding: "1rem 1.1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#687078", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>
                Discussion
              </div>
              <div style={{ color: "#1f2529", fontWeight: 650 }}>
                {discussionCopy.title}
              </div>
              <div style={{ color: "#687078", fontSize: "0.82rem", marginTop: "0.25rem" }}>
                {discussionBody}
              </div>
              {discussionError && <div style={{ color: "#eb5757", fontSize: "0.8rem", marginTop: "0.4rem" }}>{discussionError}</div>}
            </div>
            {discussionHref ? (
              <Link
                className="button primary"
                href={discussionHref}
                style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}
              >
                {discussionCopy.actionLabel}
              </Link>
            ) : discussionEligible && token && isOwner ? (
              <button
                onClick={handleStartDiscussion}
                disabled={startingDiscussion}
                style={{ padding: "0.45rem 0.9rem", background: "#1f2529", border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: "0.82rem" }}
              >
                {startingDiscussion ? "Starting..." : discussionCopy.actionLabel}
              </button>
            ) : null}
          </div>
        </section>
      )}

      <div style={{ lineHeight: 1.85, fontSize: "1rem", color: "#1f2529", whiteSpace: "pre-wrap" }}>
        {doc.body ?? <span style={{ color: "#687078", fontStyle: "italic" }}>No content yet.</span>}
      </div>
    </main>
  );
}

function DocumentTrustReadback({ rows }: { rows: PublishingTrustRow[] }) {
  return (
    <section className="card" style={{ marginBottom: "1.5rem", padding: "1rem 1.1rem" }}>
      <div style={{ fontSize: "0.72rem", color: "var(--station-page-accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>
        Document trust
      </div>
      <div style={{ color: "var(--station-page-text)", fontWeight: 650, marginBottom: "0.35rem" }}>
        Provenance, visibility, and discussion readback
      </div>
      <div style={{ color: "var(--station-page-muted)", fontSize: "0.82rem", marginBottom: "0.75rem", lineHeight: 1.55 }}>
        This panel explains the public copy without exposing private Studio source rows.
      </div>
      <div style={{ display: "grid", gap: "0.55rem" }}>
        {rows.map((row) => (
          <div key={row.id} style={trustRowStyle(row.tone)}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-start" }}>
              <span style={{ color: "var(--station-page-accent)", fontSize: "0.72rem", fontWeight: 760, textTransform: "uppercase" }}>
                {row.label}
              </span>
              <strong style={{ color: "var(--station-page-text)", fontSize: "0.82rem" }}>{row.value}</strong>
            </div>
            <p style={{ margin: "0.35rem 0 0", color: "var(--station-page-muted)", fontSize: "0.82rem", lineHeight: 1.55 }}>
              {row.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function trustRowStyle(tone: PublishingTrustRow["tone"]) {
  const toneStyles = {
    info: { background: "var(--station-page-soft-2)", borderColor: "var(--station-page-border)" },
    good: { background: "var(--station-page-success-bg)", borderColor: "var(--station-page-success-border)" },
    warning: { background: "var(--station-page-warning-bg)", borderColor: "var(--station-page-warning-border)" },
  }[tone];

  return {
    border: `1px solid ${toneStyles.borderColor}`,
    borderRadius: 8,
    background: toneStyles.background,
    padding: "0.75rem",
  };
}
