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
  const [showComposer, setShowComposer] = useState(false);
  const [error, setError]           = useState<string | null>(null);
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
      } catch {
        try {
          const data = await apiGet<{ document: Document }>(`/documents/public/${documentId}`);
          setDoc(data.document);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Document not found.");
        }
      }
      setLoading(false);
    });
  }, [documentId]);

  async function handlePublish() {
    if (!token || !doc) return;
    setPublishing(true);
    try {
      const data = await apiPost<{ document: Document }>(`/documents/${doc.id}/publish`, {}, token);
      setDoc(data.document);
    } catch { /* silent */ }
    finally { setPublishing(false); }
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

      <div style={{ lineHeight: 1.85, fontSize: "1rem", color: "#d1d5db", whiteSpace: "pre-wrap" }}>
        {doc.body ?? <span style={{ color: "#555", fontStyle: "italic" }}>No content yet.</span>}
      </div>
    </main>
  );
}
