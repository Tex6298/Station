"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { ArchiveExportPackage } from "@station/types/export";
import type { PersonaSummary } from "@station/types/persona";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import { companionHomeContextRail } from "@/lib/companion-home-context";
import {
  personaConversationTarget,
  type PersonaConversationSummary,
} from "@/lib/persona-conversations";
import { personaEncounterContractCanRenderForOwner } from "@/lib/persona-encounter-contract";
import {
  STUDIO_CONVERSATION_QUERY,
  studioPersonaCompanionShortcuts,
  studioPersonaConversationHref,
} from "@/lib/studio-navigation";
import { ArchiveExportStatus } from "@/components/studio/archive-export-status";
import { PersonaCompanionSidebar } from "@/components/studio/persona-companion-sidebar";
import { PersonaChat } from "@/components/studio/persona-chat";
import { RuntimeContextPreview } from "@/components/studio/runtime-context-preview";
import {
  ContinuityCards,
  CrossOwnerDisposablePreviewPanel,
  PersonaEncounterContractPanel,
  PersonaEncounterReadinessGate,
  PersonaEncounterRuntimePreview,
  PublicInteractionReadback,
  VoiceAvatarReadinessGate,
  type PersonaWithContinuity,
} from "@/components/studio/persona-workspace";

export default function PersonaPage() {
  return (
    <Suspense fallback={<StudioMessage>Opening private companion workspace...</StudioMessage>}>
      <PersonaPageInner />
    </Suspense>
  );
}

function PersonaPageInner() {
  const { personaId } = useParams<{ personaId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationParam = searchParams.get(STUDIO_CONVERSATION_QUERY);
  const [persona, setPersona] = useState<PersonaWithContinuity | null>(null);
  const [ownedPersonas, setOwnedPersonas] = useState<PersonaSummary[]>([]);
  const [conversations, setConversations] = useState<PersonaConversationSummary[]>([]);
  const [documents, setDocuments] = useState<PublishedContinuityDocument[]>([]);
  const [exportPackages, setExportPackages] = useState<ArchiveExportPackage[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [viewerUserId, setViewerUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedLoaded, setAdvancedLoaded] = useState(false);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const [advancedError, setAdvancedError] = useState<string | null>(null);

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

        const [personaData, personaListData, conversationData] = await Promise.all([
          apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token),
          apiGet<{ personas: PersonaSummary[] }>("/personas", session.access_token).catch(() => ({ personas: [] })),
          apiGet<{ conversations: PersonaConversationSummary[] }>(`/conversations/persona/${personaId}`, session.access_token).catch(() => ({ conversations: [] })),
        ]);
        if (!cancelled) {
          setPersona(personaData.persona);
          setOwnedPersonas(personaListData.personas ?? []);
          setConversations(conversationData.conversations ?? []);
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

  const refreshConversations = useCallback(async () => {
    if (!token || !personaId) return;
    try {
      const data = await apiGet<{ conversations: PersonaConversationSummary[] }>(
        `/conversations/persona/${personaId}`,
        token,
      );
      setConversations(data.conversations ?? []);
    } catch {
      // The active chat remains usable if the navigation list cannot refresh.
    }
  }, [personaId, token]);

  const loadAdvanced = useCallback(async () => {
    if (!token || !personaId || advancedLoaded || advancedLoading) return;
    setAdvancedLoading(true);
    setAdvancedError(null);
    try {
      const [documentResult, exportResult] = await Promise.all([
        apiGet<{ documents: PublishedContinuityDocument[] }>(`/documents?personaId=${personaId}`, token)
          .then((data) => ({ data, failed: false }))
          .catch(() => ({ data: { documents: [] }, failed: true })),
        apiGet<{ exports: ArchiveExportPackage[] }>(`/exports/persona/${personaId}`, token)
          .then((data) => ({ data, failed: false }))
          .catch(() => ({ data: { exports: [] }, failed: true })),
      ]);
      setDocuments(documentResult.data.documents ?? []);
      setExportPackages(exportResult.data.exports ?? []);
      setAdvancedLoaded(true);
      if (documentResult.failed || exportResult.failed) {
        setAdvancedError("Some publishing or export history is temporarily unavailable. The other Advanced Studio tools remain ready.");
      }
    } catch (caught) {
      setAdvancedError(caught instanceof Error ? caught.message : "Could not load Advanced Studio.");
    } finally {
      setAdvancedLoading(false);
    }
  }, [advancedLoaded, advancedLoading, personaId, token]);

  if (loading) {
    return <StudioMessage>Loading persona workspace...</StudioMessage>;
  }

  if (error || !persona) {
    return <StudioMessage tone="error">{error ?? "Persona not found."}</StudioMessage>;
  }

  const activePersonaId = persona.id;
  const target = personaConversationTarget(conversationParam, conversations);

  function startNewChat() {
    router.push(studioPersonaConversationHref(activePersonaId, "new"));
  }

  function conversationCreated(conversationId: string) {
    router.replace(studioPersonaConversationHref(activePersonaId, conversationId));
    void refreshConversations();
  }

  function advancedToggled(event: React.SyntheticEvent<HTMLDetailsElement>) {
    const open = event.currentTarget.open;
    setAdvancedOpen(open);
    if (open) void loadAdvanced();
  }

  return (
    <div className="studio-companion-shell" data-studio-shell="companion">
      <PersonaCompanionSidebar
        persona={persona}
        personas={ownedPersonas}
        conversations={conversations}
        selectedConversationId={target.id}
      />

      <main className="studio-companion-page">
        <header className="studio-companion-header" data-companion-primary>
          <div>
            <div className="studio-kicker">Private companion</div>
            <h1>{persona.name}</h1>
            <p>{persona.shortDescription || "A private place to talk, remember, and shape what comes next."}</p>
          </div>
          <nav className="studio-companion-header-actions" aria-label="Companion workspace actions">
            <span>Owner-only</span>
            <Link href={`/studio/personas/${persona.id}/edit`}>Profile</Link>
            <Link href="/studio">Studio home</Link>
          </nav>
        </header>

        <CompanionShortcutStrip personaId={persona.id} />
        <PersonaChat
          personaId={persona.id}
          personaName={persona.name}
          selectedConversationId={target.id}
          onStartNewChat={startNewChat}
          onConversationCreated={conversationCreated}
          onConversationArchived={() => void refreshConversations()}
        />

        <details className="studio-companion-advanced" data-companion-secondary onToggle={advancedToggled}>
          <summary>
            <span>
              <strong>Advanced Studio</strong>
              <small>Continuity map, readiness, runtime, exports, and publishing history</small>
            </span>
            <span>{advancedOpen ? "Close" : "Open"}</span>
          </summary>

          {advancedOpen ? (
            <div className="studio-companion-advanced-content">
              {advancedLoading ? <div className="studio-empty">Loading publishing and export history...</div> : null}
              {advancedError ? <div className="studio-error-state" role="status">{advancedError}</div> : null}
              <CompanionHomeContextRail persona={persona} />
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
              {advancedLoaded ? (
                <>
                  <ArchiveExportStatus
                    personaId={persona.id}
                    token={token}
                    exportPackages={exportPackages}
                    onCreated={(exportPackage) => setExportPackages((current) => [exportPackage, ...current])}
                    onRefreshed={setExportPackages}
                  />
                  <PublishedContinuityHistory documents={documents} />
                </>
              ) : null}
            </div>
          ) : null}
        </details>
      </main>
    </div>
  );
}

function CompanionShortcutStrip({ personaId }: { personaId: string }) {
  const shortcuts = studioPersonaCompanionShortcuts(personaId);

  return (
    <nav className="studio-companion-shortcuts studio-companion-shortcuts-compact" aria-label="Companion next actions">
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
