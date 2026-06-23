"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { SpacePresentationConfig } from "@station/config/space-presentation";
import { SPACE_LAYOUT_OPTIONS, SPACE_THEME_OPTIONS } from "@station/config/space-presentation";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import { publicPersonaEmptyCopy, publicSpaceHomeCopy, spaceStoryStats } from "@/lib/public-story-polish";

interface SpacePage {
  id: string;
  slug: string;
  title: string;
  page_type: string;
  body: string | null;
  sort_order: number;
}

interface Document {
  id: string;
  title: string;
  slug: string;
  document_type: string;
  body: string | null;
  published_at: string | null;
  created_at: string | null;
  visibility?: string | null;
  provenance_type?: string | null;
  source_label?: string | null;
  discussion_thread_id?: string | null;
}

interface Persona {
  name: string;
  shortDescription: string | null;
  visibility: string;
  avatarUrl?: string | null;
}

interface Owner {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface Space {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  long_description: string | null;
  is_public: boolean;
  owner_user_id: string;
  presentation: SpacePresentationConfig;
}

interface SpaceData {
  access: "owner" | "public";
  space: Space;
  pages: SpacePage[];
  documents: Document[];
  personas: Persona[];
  owner: Owner | null;
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

const PROVENANCE_LABELS: Record<string, string> = {
  user_authored: "User-authored",
  ai_assisted: "AI-assisted",
  archive_import: "Archive import",
  integrity_session: "Integrity Session",
  persona_derived: "Persona-derived",
};

export default function PublicSpacePage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function loadSpace() {
      setLoading(true);
      setError(null);
      try {
        const session = await getSession();
        const spaceData = await apiGet<SpaceData>(`/spaces/${slug}`, session?.access_token);
        if (!cancelled) setData(spaceData);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Space not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSpace();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const authoredPages = useMemo(
    () => (data?.pages ?? []).filter((page) => !["documents", "personas"].includes(page.page_type)),
    [data?.pages]
  );

  if (loading) {
    return (
      <main className="container">
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#7f8aa0" }}>Loading...</div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="container">
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>
          {error ?? "Space not found."}
        </div>
      </main>
    );
  }

  const { space, documents, personas, owner, access } = data;
  const presentation = space.presentation;
  const themeOption = SPACE_THEME_OPTIONS.find((theme) => theme.id === presentation.theme);
  const layoutOption = SPACE_LAYOUT_OPTIONS.find((layout) => layout.id === presentation.layout);
  const tagline = presentation.tagline || space.short_description || "A public Station Space.";
  const ownerLabel = owner?.display_name ?? owner?.username ?? "Station member";
  const featuredDocuments = documents.slice(0, presentation.layout === "archive" ? 6 : 3);
  const statPages = authoredPages.length;
  const openDiscussionCount = documents.filter((document) => document.discussion_thread_id).length;
  const stats = spaceStoryStats({
    authoredPageCount: statPages,
    documentCount: documents.length,
    personaCount: personas.length,
    discussionCount: openDiscussionCount,
  });

  return (
    <main className={`space-site space-theme-${presentation.theme} space-layout-${presentation.layout}`}>
      <section className="space-hero-shell">
        <div className="space-hero-copy">
          <div className="space-kicker">{layoutOption?.label ?? "Public"} Space</div>
          <h1>{space.title}</h1>
          <p className="space-tagline">{tagline}</p>
          <div className="space-owner-row">
            <IdentityMark owner={owner} title={space.title} />
            <div>
              <div>{ownerLabel}</div>
              <span>{themeOption?.label ?? "Atlas"} presentation</span>
            </div>
          </div>
          {access === "owner" && (
            <div className="space-owner-actions">
              <Link className="button primary" href={`/space/${space.slug}/manage`}>Edit Space</Link>
              <Link className="button" href={`/space/${space.slug}/documents/new`}>New Post</Link>
            </div>
          )}
        </div>

        <aside className="space-hero-panel">
          <div className="space-panel-label">Public surface</div>
          <div className="space-stat-grid">
            {stats.map((stat) => (
              <SpaceStat key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
          {owner?.bio && <p>{owner.bio}</p>}
        </aside>
      </section>

      <nav className="space-section-nav" aria-label="Space sections">
        {authoredPages.map((page) => (
          <a key={page.id} href={`#${page.slug}`}>{page.title}</a>
        ))}
        <a href="#works">Works</a>
        <a href="#personas">Personas</a>
        <a href="#library">Library</a>
      </nav>

      <div className="space-content-shell">
        <section className="space-authored-stack" aria-label="Authored sections">
          {authoredPages.length > 0 ? authoredPages.map((page, index) => (
            <AuthoredSection key={page.id} page={page} fallback={index === 0 ? space.long_description : null} />
          )) : (
            <section className="space-authored-section">
              <div className="space-section-label">Home</div>
              <h2>{space.title}</h2>
              <p>{publicSpaceHomeCopy({ longDescription: space.long_description, shortDescription: space.short_description, hasDocuments: documents.length > 0 })}</p>
            </section>
          )}
        </section>

        <section id="works" className="space-featured-section">
          <div>
            <div className="space-section-label">Featured Works</div>
            <h2>Published from this Space</h2>
          </div>
          <FeaturedDocuments documents={featuredDocuments} spaceSlug={space.slug} />
        </section>

        <section id="personas" className="space-featured-section">
          <div>
            <div className="space-section-label">Personas</div>
            <h2>Public characters and collaborators</h2>
          </div>
          <PersonaGrid personas={personas} hasDocuments={documents.length > 0} />
        </section>

        <section id="library" className="space-library-section">
          <div>
            <div className="space-section-label">Public Library</div>
            <h2>Archive preview</h2>
          </div>
          <LibraryList documents={documents} spaceSlug={space.slug} />
        </section>
      </div>
    </main>
  );
}

function AuthoredSection({ page, fallback }: { page: SpacePage; fallback: string | null }) {
  const body = page.body || fallback;
  return (
    <section id={page.slug} className="space-authored-section">
      <div className="space-section-label">{page.page_type === "home" ? "Home" : page.page_type}</div>
      <h2>{page.title}</h2>
      {body ? <p>{body}</p> : <p>This section is waiting for its first note.</p>}
    </section>
  );
}

function FeaturedDocuments({ documents, spaceSlug }: { documents: Document[]; spaceSlug: string }) {
  if (documents.length === 0) {
    return <div className="space-empty-state">No public works have been published yet.</div>;
  }

  return (
    <div className="space-featured-grid">
      {documents.map((doc) => (
        <Link key={doc.id} href={`/space/${spaceSlug}/documents/${doc.id}`} className="space-document-card">
          <span>{DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}</span>
          <h3>{doc.title}</h3>
          {doc.provenance_type && (
            <small>{PROVENANCE_LABELS[doc.provenance_type] ?? doc.provenance_type}</small>
          )}
          {doc.discussion_thread_id && (
            <small style={{ color: "#86efac" }}>Discussion open</small>
          )}
          {doc.body && <p>{excerpt(doc.body, 150)}</p>}
        </Link>
      ))}
    </div>
  );
}

function PersonaGrid({ personas, hasDocuments }: { personas: Persona[]; hasDocuments: boolean }) {
  if (personas.length === 0) {
    return <div className="space-empty-state">{publicPersonaEmptyCopy(hasDocuments)}</div>;
  }

  return (
    <div className="space-persona-grid">
      {personas.map((persona, index) => (
        <article key={`${persona.name}-${index}`} className="space-persona-card">
          <IdentityMark title={persona.name} imageUrl={persona.avatarUrl ?? null} />
          <div>
            <h3>{persona.name}</h3>
            {persona.shortDescription && <p>{persona.shortDescription}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

function LibraryList({ documents, spaceSlug }: { documents: Document[]; spaceSlug: string }) {
  if (documents.length === 0) {
    return <div className="space-empty-state">The public library is empty for now.</div>;
  }

  return (
    <div className="space-library-list">
      {documents.map((doc) => (
        <Link key={doc.id} href={`/space/${spaceSlug}/documents/${doc.id}`}>
          <span>{DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}</span>
          <strong>{doc.title}</strong>
          {doc.provenance_type && <em>{PROVENANCE_LABELS[doc.provenance_type] ?? doc.provenance_type}</em>}
          {doc.discussion_thread_id && <em>Discussion open</em>}
          <time>{formatDate(doc.published_at ?? doc.created_at)}</time>
        </Link>
      ))}
    </div>
  );
}

function SpaceStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function IdentityMark({ owner, title, imageUrl }: { owner?: Owner | null; title: string; imageUrl?: string | null }) {
  const src = imageUrl ?? owner?.avatar_url ?? null;
  const label = title.slice(0, 2).toUpperCase();
  if (src) {
    return <img className="space-identity-mark" src={src} alt="" />;
  }
  return <div className="space-identity-mark" aria-hidden="true">{label}</div>;
}

function excerpt(value: string, length: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length).trim()}...` : clean;
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
