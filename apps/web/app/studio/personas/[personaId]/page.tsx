"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ArchiveExportPackage } from "@station/types/export";
import type { PersonaSummary } from "@station/types/persona";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import { companionHomeContextRail } from "@/lib/companion-home-context";
import { personaEncounterContractCanRenderForOwner } from "@/lib/persona-encounter-contract";
import { studioPersonaCompanionShortcuts } from "@/lib/studio-navigation";
import { ArchiveExportStatus } from "@/components/studio/archive-export-status";
import { PersonaChat } from "@/components/studio/persona-chat";
import { RuntimeContextPreview } from "@/components/studio/runtime-context-preview";
import {
  ContinuityCards,
  CrossOwnerDisposablePreviewPanel,
  PersonaEncounterContractPanel,
  PersonaEncounterReadinessGate,
  PersonaEncounterRuntimePreview,
  PersonaWorkspaceHeader,
  PublicInteractionReadback,
  VoiceAvatarReadinessGate,
  type PersonaWithContinuity,
} from "@/components/studio/persona-workspace";

export default function PersonaPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [persona, setPersona] = useState<PersonaWithContinuity | null>(null);
  const [ownedPersonas, setOwnedPersonas] = useState<PersonaSummary[]>([]);
  const [documents, setDocuments] = useState<PublishedContinuityDocument[]>([]);
  const [exportPackages, setExportPackages] = useState<ArchiveExportPackage[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [viewerUserId, setViewerUserId] = useState<string | null>(null);
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
        setViewerUserId(session.user.id);

        const [personaData, personaListData, documentData, exportData] = await Promise.all([
          apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token),
          apiGet<{ personas: PersonaSummary[] }>("/personas", session.access_token).catch(() => ({ personas: [] })),
          apiGet<{ documents: PublishedContinuityDocument[] }>(`/documents?personaId=${personaId}`, session.access_token).catch(() => ({ documents: [] })),
          apiGet<{ exports: ArchiveExportPackage[] }>(`/exports/persona/${personaId}`, session.access_token).catch(() => ({ exports: [] })),
        ]);
        if (!cancelled) {
          setPersona(personaData.persona);
          setOwnedPersonas(personaListData.personas ?? []);
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

      <section className="studio-home-grid">
        <div className="studio-home-main">
          <div className="studio-section-heading studio-home-heading">
            <div className="section-label">Companion Home</div>
            <h2>Talk with {persona.name}</h2>
            <p>Private conversation, memory review, and continuity care stay close together here.</p>
          </div>
          <CompanionShortcutStrip personaId={persona.id} />
          <PersonaChat personaId={persona.id} personaName={persona.name} />
        </div>

        <CompanionHomeContextRail persona={persona} />
      </section>

      <ContinuityCards persona={persona} />
      <PublicInteractionReadback persona={persona} />
      <VoiceAvatarReadinessGate />
      <PersonaEncounterReadinessGate />
      {personaEncounterContractCanRenderForOwner(persona, viewerUserId) && <PersonaEncounterContractPanel />}
      {personaEncounterContractCanRenderForOwner(persona, viewerUserId) && (
        <>
          <CrossOwnerDisposablePreviewPanel persona={persona} token={token} />
          <PersonaEncounterRuntimePreview persona={persona} personas={ownedPersonas} token={token} />
        </>
      )}
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

function CompanionShortcutStrip({ personaId }: { personaId: string }) {
  const shortcuts = studioPersonaCompanionShortcuts(personaId);

  return (
    <nav className="studio-companion-shortcuts" aria-label="Companion next actions">
      {shortcuts.map((shortcut) => (
        <Link key={shortcut.href} href={shortcut.href} className="studio-companion-shortcut">
          <span>{shortcut.label}</span>
          <small>{shortcut.detail}</small>
        </Link>
      ))}
    </nav>
  );
}

function CompanionHomeContextRail({ persona }: { persona: PersonaWithContinuity }) {
  const rail = companionHomeContextRail({
    personaId: persona.id,
    personaName: persona.name,
    longDescription: persona.longDescription,
    awakeningPrompt: persona.awakeningPrompt,
    styleNotes: persona.styleNotes,
    continuity: persona.continuity,
  });

  return (
    <aside className="studio-companion-context-rail" aria-label="Companion context rail">
      <div className="studio-companion-context-brief">
        <div className="section-label">Companion Continuity</div>
        <h3>{rail.title}</h3>
        <p>{rail.brief}</p>
        {rail.styleNotes && (
          <div className="studio-companion-context-note">
            <span>Style notes</span>
            <p>{rail.styleNotes}</p>
          </div>
        )}
      </div>

      <nav className="studio-companion-context-map" aria-label="Owner context stops">
        {rail.stops.map((stop) => (
          <Link
            key={stop.href}
            href={stop.href}
            className={stop.emphasis ? "studio-companion-context-stop is-emphasized" : "studio-companion-context-stop"}
          >
            <span className="studio-companion-context-stop-label">{stop.label}</span>
            <strong>{stop.countLabel}</strong>
            <small>{stop.detail}</small>
          </Link>
        ))}
      </nav>

      <p className="studio-companion-context-boundary">{rail.boundaryCopy}</p>
    </aside>
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
