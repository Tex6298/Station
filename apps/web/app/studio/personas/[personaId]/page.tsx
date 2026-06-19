"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ArchiveExportPackage } from "@station/types/export";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import { ArchiveExportStatus } from "@/components/studio/archive-export-status";
import { PersonaChat } from "@/components/studio/persona-chat";
import { RuntimeContextPreview } from "@/components/studio/runtime-context-preview";
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
        onRefreshed={setExportPackages}
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
