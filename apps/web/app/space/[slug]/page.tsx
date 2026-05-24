"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";

interface SpacePage { id: string; slug: string; title: string; page_type: string; body: string | null; sort_order: number; }
interface Document  { id: string; title: string; slug: string; document_type: string; published_at: string | null; }
interface Persona   { id: string; name: string; short_description: string | null; visibility: string; }
interface Owner     { username: string; display_name: string | null; avatar_url: string | null; bio: string | null; }
interface Space     { id: string; slug: string; title: string; short_description: string | null; long_description: string | null; is_public: boolean; owner_user_id: string; }

interface SpaceData { space: Space; pages: SpacePage[]; documents: Document[]; personas: Persona[]; owner: Owner | null; }

const DOC_TYPE_LABELS: Record<string, string> = { post: "Post", essay: "Essay", manifesto: "Manifesto", constitution: "Constitution", update: "Update", other: "Other" };

export default function PublicSpacePage() {
  const { slug }    = useParams<{ slug: string }>();
  const [data, setData]         = useState<SpaceData | null>(null);
  const [activePage, setActive] = useState<string>("home");
  const [loading, setLoading]   = useState(true);
  const [isOwner, setIsOwner]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      apiGet<SpaceData>(`/spaces/${slug}`),
      getSession(),
    ]).then(([spaceData, session]) => {
      setData(spaceData);
      if (session && spaceData.space.owner_user_id) {
        // We detect ownership via the space owner - a simpler check uses profile
        // For now, mark owner if session exists and we can compare later
      }
      const firstPage = spaceData.pages[0]?.slug ?? "home";
      setActive(firstPage);
      setLoading(false);
    }).catch((e) => {
      setError(e instanceof Error ? e.message : "Space not found.");
      setLoading(false);
    });

    getSession().then((session) => {
      if (session) {
        apiGet<{ personas: Persona[] }>("/personas", session.access_token)
          .then(() => setIsOwner(true)) // rough proxy - owner can hit /personas
          .catch(() => {});
      }
    });
  }, [slug]);

  if (loading) return <main className="container"><div className="card" style={{ textAlign: "center", padding: "3rem", color: "#555" }}>Loading...</div></main>;
  if (error || !data) return <main className="container"><div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>{error ?? "Space not found."}</div></main>;

  const { space, pages, documents, personas, owner } = data;
  const currentPage = pages.find((p) => p.slug === activePage);

  return (
    <main className="container" style={{ maxWidth: 1100 }}>
      {/* Space header */}
      <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #1e2535" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.3rem", fontSize: "1.8rem" }}>{space.title}</h1>
            {space.short_description && <p style={{ margin: 0, color: "#888", fontSize: "0.95rem" }}>{space.short_description}</p>}
            {owner && (
              <p style={{ margin: "0.4rem 0 0", fontSize: "0.8rem", color: "#555" }}>
                by {owner.display_name ?? owner.username}
              </p>
            )}
          </div>
          {isOwner && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link href={`/space/${slug}/documents/new`} className="button primary" style={{ fontSize: "0.8rem", textDecoration: "none" }}>
                + New post
              </Link>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "1.5rem" }}>
        {/* Left sidebar nav */}
        <nav>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {pages.map((p) => (
              <button
                key={p.slug}
                onClick={() => setActive(p.slug)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.5rem 0.75rem",
                  borderRadius: 8,
                  border: "none",
                  background: activePage === p.slug ? "#1a1535" : "transparent",
                  color: activePage === p.slug ? "#c4b5fd" : "#888",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  transition: "all 0.15s",
                }}
              >
                {p.title}
              </button>
            ))}
          </div>

          {owner?.bio && (
            <div style={{ marginTop: "1.5rem", padding: "0.75rem", background: "#0f1218", borderRadius: 8, border: "1px solid #1e2535" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#666", lineHeight: 1.6 }}>{owner.bio}</p>
            </div>
          )}
        </nav>

        {/* Main content */}
        <div>
          {currentPage?.page_type === "documents" || activePage === "posts" ? (
            <DocumentsList documents={documents} spaceSlug={slug} />
          ) : currentPage?.page_type === "personas" ? (
            <PersonasList personas={personas} />
          ) : (
            <PageBody page={currentPage ?? null} />
          )}
        </div>
      </div>
    </main>
  );
}

function PageBody({ page }: { page: SpacePage | null }) {
  if (!page) return <div className="card" style={{ color: "#555" }}>Page not found.</div>;
  return (
    <div className="card">
      <h2 style={{ margin: "0 0 1rem" }}>{page.title}</h2>
      {page.body ? (
        <div style={{ lineHeight: 1.75, color: "#ccc", whiteSpace: "pre-wrap" }}>{page.body}</div>
      ) : (
        <p style={{ color: "#555", fontStyle: "italic" }}>Nothing here yet.</p>
      )}
    </div>
  );
}

function DocumentsList({ documents, spaceSlug }: { documents: Document[]; spaceSlug: string }) {
  if (documents.length === 0) {
    return <div className="card" style={{ color: "#555", fontStyle: "italic" }}>No posts published yet.</div>;
  }
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {documents.map((doc) => (
        <Link key={doc.id} href={`/space/${spaceSlug}/documents/${doc.id}`} style={{ textDecoration: "none" }}>
          <div className="card" style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.7rem", color: "#555", background: "#111827", border: "1px solid #1f2937", borderRadius: 999, padding: "0.1rem 0.4rem" }}>
                {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
              </span>
              {doc.published_at && (
                <span style={{ fontSize: "0.72rem", color: "#555" }}>
                  {new Date(doc.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{doc.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

function PersonasList({ personas }: { personas: Persona[] }) {
  if (personas.length === 0) {
    return <div className="card" style={{ color: "#555", fontStyle: "italic" }}>No public personas yet.</div>;
  }
  return (
    <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
      {personas.map((p) => (
        <div key={p.id} className="card">
          <strong style={{ fontSize: "0.95rem" }}>{p.name}</strong>
          {p.short_description && <p style={{ margin: "0.35rem 0 0", color: "#666", fontSize: "0.825rem" }}>{p.short_description}</p>}
        </div>
      ))}
    </div>
  );
}
