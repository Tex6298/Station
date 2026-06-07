"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ArchiveExportPackage } from "@station/types/export";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import { ArchiveExportStatus } from "@/components/studio/archive-export-status";
import { PersonaChat } from "@/components/studio/persona-chat";
import {
  ContinuityCards,
  PersonaWorkspaceHeader,
  type PersonaWithContinuity,
} from "@/components/studio/persona-workspace";

export default function PersonaPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [persona, setPersona] = useState<PersonaWithContinuity | null>(null);
  const [documents, setDocuments] = useState<PublishedContinuityDocument[]>([]);
  const [exportPackages, setExportPackages] = useState<ArchiveExportPackage[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!personaId) return;
    let cancelled = false;

    async function load() {
      try {
        const session = await getSession();
        if (!session) {
          setLoading(false);
          return;
        }
        setToken(session.access_token);

        const [personaData, documentData, exportData] = await Promise.all([
          apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token),
          apiGet<{ documents: PublishedContinuityDocument[] }>(`/documents?personaId=${personaId}`, session.access_token).catch(() => ({ documents: [] })),
          apiGet<{ exports: ArchiveExportPackage[] }>(`/exports/persona/${personaId}`, session.access_token).catch(() => ({ exports: [] })),
        ]);
        if (!cancelled) {
          setPersona(personaData.persona);
          setDocuments(documentData.documents ?? []);
          setExportPackages(exportData.exports ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load persona.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [personaId]);

  if (loading) {
    return <StudioMessage>Loading persona workspace...</StudioMessage>;
  }

  if (error || !persona) {
    return <StudioMessage tone="error">{error ?? "Persona not found."}</StudioMessage>;
  }

  return (
    <main className="container studio-workspace">
      <div className="studio-breadcrumb">
        <Link href="/studio">Studio</Link>
        <span>/</span>
        <span>{persona.name}</span>
      </div>

      <PersonaWorkspaceHeader persona={persona} />
      <ContinuityCards persona={persona} />

      <section className="studio-home-grid">
        <div className="studio-home-main">
          <div className="studio-section-heading">
            <div className="section-label">Private Chat</div>
            <h2>Work with {persona.name}</h2>
          </div>
          <PersonaChat personaId={persona.id} personaName={persona.name} />
        </div>

        <aside className="studio-context-panel">
          <div className="section-label">Continuity Brief</div>
          <p>{persona.longDescription || persona.awakeningPrompt || "This persona does not have a long-form continuity brief yet."}</p>
          {persona.styleNotes && (
            <>
              <div className="section-label">Style Notes</div>
              <p>{persona.styleNotes}</p>
            </>
          )}
          <Link className="button" href={`/studio/personas/${persona.id}/calibration`}>
            Run Integrity Session
          </Link>
        </aside>
      </section>

      <RuntimeContextPreview personaId={persona.id} />
      <ArchiveExportStatus
        personaId={persona.id}
        token={token}
        exportPackages={exportPackages}
        onCreated={(exportPackage) => setExportPackages((current) => [exportPackage, ...current])}
      />
      <PublishedContinuityHistory documents={documents} />
    </main>
  );
}

interface PublishedContinuityDocument {
  id: string;
  title: string;
  status: string;
  visibility: string;
  published_at: string | null;
  created_at: string;
  space_id: string | null;
  provenance_type: string;
  source_type: string | null;
  source_label: string | null;
}

interface RuntimeContextSource {
  id: string;
  type: "canon" | "integrity" | "memory" | "archive";
  title: string | null;
  content: string;
  priority: number;
  reason: string;
  sourceType?: string | null;
  createdAt?: string | null;
}

interface RuntimeContextPreviewData {
  systemPrompt: string;
  counts: Record<RuntimeContextSource["type"], number>;
  sources: RuntimeContextSource[];
}

const CONTEXT_SECTIONS: Array<{ type: RuntimeContextSource["type"]; label: string }> = [
  { type: "canon", label: "Canon" },
  { type: "integrity", label: "Integrity" },
  { type: "memory", label: "Memory" },
  { type: "archive", label: "Archive" },
];
const DEFAULT_CONTEXT_QUERY = "What should this persona keep steady right now?";

const PROVENANCE_LABELS: Record<string, string> = {
  user_authored: "User-authored",
  ai_assisted: "AI-assisted",
  archive_import: "Archive import",
  integrity_session: "Integrity Session",
  persona_derived: "Persona-derived",
};

function PublishedContinuityHistory({ documents }: { documents: PublishedContinuityDocument[] }) {
  return (
    <section className="studio-published-history">
      <div className="studio-section-heading">
        <div className="section-label">Published Continuity</div>
        <h2>Documents created from Studio</h2>
      </div>

      {documents.length === 0 ? (
        <div className="studio-empty">No continuity artifacts have been copied into public documents yet.</div>
      ) : (
        <div className="studio-published-list">
          {documents.map((document) => (
            <article key={document.id} className="studio-published-row">
              <div>
                <strong>{document.title}</strong>
                <span>
                  {PROVENANCE_LABELS[document.provenance_type] ?? "Continuity"} / {document.visibility} / {document.status}
                </span>
              </div>
              {document.source_label && <p>{document.source_label}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function RuntimeContextPreview({ personaId }: { personaId: string }) {
  const [query, setQuery] = useState(DEFAULT_CONTEXT_QUERY);
  const [preview, setPreview] = useState<RuntimeContextPreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async (nextQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) {
        setPreview(null);
        setError("Sign in to preview runtime context.");
        return;
      }

      const data = await apiGet<{ context: RuntimeContextPreviewData }>(
        `/conversations/persona/${personaId}/context-preview?query=${encodeURIComponent(nextQuery)}`,
        session.access_token
      );
      setPreview(data.context);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not preview runtime context.");
    } finally {
      setLoading(false);
    }
  }, [personaId]);

  useEffect(() => {
    loadPreview(DEFAULT_CONTEXT_QUERY);
  }, [loadPreview]);

  return (
    <section className="studio-runtime-preview">
      <div className="studio-section-heading">
        <div className="section-label">Runtime Context</div>
        <h2>Continuity loaded for the next response</h2>
      </div>

      <form
        className="studio-runtime-query"
        onSubmit={(event) => {
          event.preventDefault();
          loadPreview(query);
        }}
      >
        <input
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Preview query"
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Loading..." : "Preview"}
        </button>
      </form>

      {error && <div className="space-form-error">{error}</div>}

      {preview && (
        <>
          <div className="studio-runtime-counts" aria-label="Runtime context counts">
            {CONTEXT_SECTIONS.map((section) => (
              <span key={section.type}>
                {section.label}
                <strong>{preview.counts[section.type] ?? 0}</strong>
              </span>
            ))}
          </div>

          <div className="studio-runtime-sources">
            {CONTEXT_SECTIONS.map((section) => {
              const sources = preview.sources.filter((source) => source.type === section.type);
              return (
                <div key={section.type} className="studio-runtime-source-group">
                  <h3>{section.label}</h3>
                  {sources.length === 0 ? (
                    <p>No {section.label.toLowerCase()} material selected.</p>
                  ) : (
                    sources.map((source) => (
                      <article key={`${source.type}-${source.id}`} className="studio-runtime-source">
                        <div>
                          <strong>{source.title || section.label}</strong>
                          <span>{source.reason}</span>
                        </div>
                        <p>{source.content}</p>
                      </article>
                    ))
                  )}
                </div>
              );
            })}
          </div>

          <details className="studio-runtime-prompt">
            <summary>Compiled system prompt</summary>
            <pre>{preview.systemPrompt}</pre>
          </details>
        </>
      )}
    </section>
  );
}

function StudioMessage({ children, tone = "normal" }: { children: React.ReactNode; tone?: "normal" | "error" }) {
  return (
    <main className="container">
      <div className={tone === "error" ? "space-form-error" : "card"} style={{ textAlign: "center", padding: "3rem" }}>
        {children}
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
