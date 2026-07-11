"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { Persona, PersonaSummary } from "@station/types/persona";
import { ApiRequestError, apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import {
  activeStudioHref,
  studioPersonaWorkspacePrimaryActions,
  studioPersonaWorkspaceTabs,
} from "@/lib/studio-navigation";
import { personaEncounterContractGate } from "@/lib/persona-encounter-contract";
import { personaEncounterReadinessGate } from "@/lib/persona-encounter-readiness";
import {
  PERSONA_ENCOUNTER_PREVIEW_PATH,
  PERSONA_ENCOUNTER_PRIVATE_SESSIONS_PATH,
  personaEncounterPrivateSessionCurationPath,
  personaEncounterPrivateSessionCurationPayload,
  personaEncounterPrivateSessionPath,
  personaEncounterPrivateSessionReadback,
  personaEncounterPreviewAvailabilityCopy,
  personaEncounterPreviewErrorCopy,
  personaEncounterPreviewPayload,
  personaEncounterPreviewReadback,
  personaEncounterPreviewReadinessPath,
  personaEncounterPreviewReady,
  type PersonaEncounterPrivateSession,
  type PersonaEncounterPrivateSessionDeleteResponse,
  type PersonaEncounterPrivateSessionListResponse,
  type PersonaEncounterPrivateSessionResponse,
  type PersonaEncounterPreviewReadinessResponse,
  type PersonaEncounterPreviewResponse,
} from "@/lib/persona-encounter-runtime";
import { voiceAvatarReadinessGate } from "@/lib/voice-avatar-readiness";
import {
  publicInteractionActivityBoundaryCopy,
  publicInteractionActivitySummary,
  publicInteractionActivityValue,
  publicInteractionAnonymousEligibilityCopy,
  publicInteractionAnonymousEligibilityLabel,
  publicInteractionChatLabel,
  publicInteractionReportSummary,
  publicInteractionRouteLabel,
  publicInteractionTokenBoundaryCopy,
} from "@/lib/public-persona-interaction";
import { StudioPlaceStrip } from "@/components/studio/studio-frame";

export interface ContinuitySummary {
  memoryCount: number;
  canonCount: number;
  archiveFileCount: number;
  integritySessionCount: number;
  archivedChatCount?: number;
  continuityCandidateCount?: number;
  continuityRecordCount?: number;
}

export interface PersonaWithContinuity extends Persona {
  continuity?: ContinuitySummary | null;
}

const PROVIDER_LABELS: Record<string, string> = {
  platform: "Station AI",
  openai: "OpenAI",
  anthropic: "Anthropic",
  deepseek: "DeepSeek",
  gemini: "Gemini",
};

export function PersonaWorkspaceHeader({ persona }: { persona: PersonaWithContinuity }) {
  const pathname = usePathname();
  const tabs = studioPersonaWorkspaceTabs(persona.id);
  const actions = studioPersonaWorkspacePrimaryActions(persona.id);
  const activeTab = [...tabs]
    .sort((a, b) => b.href.length - a.href.length)
    .find((tab) => activeStudioHref(pathname, tab.href)) ?? tabs[0];

  return (
    <header className="studio-persona-header">
      <div>
        <div className="studio-kicker">Private Studio</div>
        <h1>{persona.name}</h1>
        <p>{persona.shortDescription || "No continuity brief has been written yet."}</p>
        <div className="studio-persona-meta">
          <span>{persona.visibility}</span>
          <span>{PROVIDER_LABELS[persona.provider] ?? persona.provider}</span>
        </div>
      </div>

      <StudioPlaceStrip
        label={`${persona.name} / ${activeTab.label}`}
        detail={activeTab.detail}
        privacy="Owner-only persona workspace"
        state={activeTab.state}
        action={(
          <div className="studio-place-actions">
            {actions.map((action) => (
              <Link key={action.href} href={action.href} className="studio-place-action">
                {action.label}
              </Link>
            ))}
          </div>
        )}
      />

      <nav className="studio-persona-tabs" aria-label="Persona workspace">
        {tabs.map((tab) => {
          const href = tab.href;
          const active = pathname === href;
          return (
            <Link key={tab.label} href={href} data-active={active}>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function ContinuityCards({ persona }: { persona: PersonaWithContinuity }) {
  const continuity = persona.continuity ?? {
    memoryCount: 0,
    canonCount: 0,
    archiveFileCount: 0,
    integritySessionCount: 0,
    archivedChatCount: 0,
    continuityCandidateCount: 0,
    continuityRecordCount: 0,
  };

  return (
    <section className="studio-continuity-grid" aria-label="Continuity summary">
      <ContinuityCard
        label="Continuity"
        value={continuity.continuityRecordCount ?? 0}
        href={`/studio/personas/${persona.id}/continuity`}
        body="Cross-source records linking memory, conversations, documents, and archive."
      />
      <ContinuityCard
        label="Memory"
        value={continuity.memoryCount}
        href={`/studio/personas/${persona.id}/memory`}
        body="Recallable fragments, saved chat turns, and imported context."
      />
      <ContinuityCard
        label="Canon"
        value={continuity.canonCount}
        href={`/studio/personas/${persona.id}/canon`}
        body="Stable rules and truths that should stay present."
      />
      <ContinuityCard
        label="Archive"
        value={(continuity.archiveFileCount ?? 0) + (continuity.archivedChatCount ?? 0)}
        href={`/studio/personas/${persona.id}/files`}
        body="Imported files, pasted histories, source material, and archived chats."
      />
      <ContinuityCard
        label="Integrity"
        value={continuity.integritySessionCount}
        href={`/studio/personas/${persona.id}/calibration`}
        body="Guided sessions for tone, boundaries, and continuity."
      />
    </section>
  );
}

export function PublicInteractionReadback({ persona }: { persona: PersonaWithContinuity }) {
  const readback = persona.publicInteraction ?? null;
  const routeHref = readback?.publicRoute.canOpen ? readback.publicRoute.href : null;
  const adminHref = readback?.moderation.adminQueueHref ?? null;

  return (
    <section className="studio-continuity-grid" aria-label="Public interaction readback">
      <InteractionCard
        label="Public route"
        value={routeHref ? "Live" : "Closed"}
        body={publicInteractionRouteLabel(readback)}
        href={routeHref ?? undefined}
      />
      <InteractionCard
        label="Public chat"
        value={publicInteractionAnonymousEligibilityLabel(readback)}
        body={`${publicInteractionChatLabel(readback)}. ${publicInteractionAnonymousEligibilityCopy(readback)} ${publicInteractionTokenBoundaryCopy(readback)}`}
      />
      <InteractionCard
        label="Persona reports"
        value={String(readback?.reports.total ?? 0)}
        body={publicInteractionReportSummary(readback)}
        href={adminHref ?? undefined}
      />
      <InteractionCard
        label="Aggregate activity"
        value={publicInteractionActivityValue(readback)}
        body={`${publicInteractionActivitySummary(readback)}. ${publicInteractionActivityBoundaryCopy(readback)}`}
      />
    </section>
  );
}

export function VoiceAvatarReadinessGate() {
  const gate = voiceAvatarReadinessGate();

  return <ReadinessGatePanel gate={gate} ariaLabel="Voice and avatar readiness" />;
}

export function PersonaEncounterReadinessGate() {
  const gate = personaEncounterReadinessGate();

  return <ReadinessGatePanel gate={gate} ariaLabel="Persona encounter readiness" />;
}

export function PersonaEncounterContractPanel() {
  const gate = personaEncounterContractGate();

  return <ReadinessGatePanel gate={gate} ariaLabel="Persona encounter consent and provenance contract" />;
}

export function PersonaEncounterRuntimePreview({
  persona,
  personas,
  token,
}: {
  persona: PersonaWithContinuity;
  personas: PersonaSummary[];
  token: string | null;
}) {
  const responderOptions = useMemo(
    () => personas.filter((candidate) => candidate.id !== persona.id),
    [persona.id, personas],
  );
  const [responderId, setResponderId] = useState("");
  const [setup, setSetup] = useState("");
  const [preview, setPreview] = useState<PersonaEncounterPreviewResponse | null>(null);
  const [readiness, setReadiness] = useState<PersonaEncounterPreviewReadinessResponse | null>(null);
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSessions, setSavedSessions] = useState<PersonaEncounterPrivateSession[]>([]);
  const [savedSessionsLoading, setSavedSessionsLoading] = useState(false);
  const [savedSessionBusy, setSavedSessionBusy] = useState(false);
  const [savedSessionError, setSavedSessionError] = useState<string | null>(null);
  const selectedResponderId = responderId || responderOptions[0]?.id || "";
  const selectedResponder = responderOptions.find((candidate) => candidate.id === selectedResponderId) ?? null;
  const ready = personaEncounterPreviewReady({
    initiatorPersonaId: persona.id,
    responderPersonaId: selectedResponderId,
    setup,
  });
  const readback = personaEncounterPreviewReadback(preview);
  const providerReady = readiness?.ready === true;
  const savedReadback = personaEncounterPrivateSessionReadback(savedSessions[0] ?? null);
  const availabilityCopy = responderOptions.length === 0
    ? "Create another persona first."
    : readinessLoading
    ? "Checking encounter preview provider setup."
    : personaEncounterPreviewAvailabilityCopy(readiness);
  const generationReady = Boolean(ready && token && providerReady && !readinessLoading);

  useEffect(() => {
    if (!token) {
      setSavedSessions([]);
      setSavedSessionsLoading(false);
      return;
    }

    let cancelled = false;
    setSavedSessionsLoading(true);
    setSavedSessionError(null);
    apiGet<PersonaEncounterPrivateSessionListResponse>(PERSONA_ENCOUNTER_PRIVATE_SESSIONS_PATH, token)
      .then((response) => {
        if (!cancelled) setSavedSessions(response.sessions);
      })
      .catch((caught) => {
        if (cancelled) return;
        if (caught instanceof ApiRequestError) {
          setSavedSessionError(personaEncounterPreviewErrorCopy(caught));
        } else {
          setSavedSessionError("Private encounter artifacts could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) setSavedSessionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    setPreview(null);
    setError(null);

    if (!token || !selectedResponderId || selectedResponderId === persona.id) {
      setReadiness(null);
      setReadinessLoading(false);
      return;
    }

    let cancelled = false;
    setReadiness(null);
    setReadinessLoading(true);
    apiGet<PersonaEncounterPreviewReadinessResponse>(
      personaEncounterPreviewReadinessPath({
        initiatorPersonaId: persona.id,
        responderPersonaId: selectedResponderId,
      }),
      token,
    ).then((response) => {
      if (!cancelled) setReadiness(response);
    }).catch((caught) => {
      if (cancelled) return;
      if (caught instanceof ApiRequestError) {
        setReadiness({
          ready: false,
          message: caught.message,
          code: encounterReadinessErrorCode(caught.code),
          classification: caught.classification,
        });
      } else {
        setReadiness({
          ready: false,
          message: "Encounter preview readiness could not be checked.",
        });
      }
    }).finally(() => {
      if (!cancelled) setReadinessLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [persona.id, selectedResponderId, token]);

  async function runPreview() {
    if (!token || !ready || !providerReady || readinessLoading || busy) return;
    setBusy(true);
    setError(null);
    setPreview(null);

    try {
      const response = await apiPost<PersonaEncounterPreviewResponse>(
        PERSONA_ENCOUNTER_PREVIEW_PATH,
        personaEncounterPreviewPayload({
          initiatorPersonaId: persona.id,
          responderPersonaId: selectedResponderId,
          setup,
        }),
        token,
      );
      setPreview(response);
    } catch (caught) {
      if (caught instanceof ApiRequestError) {
        setError(personaEncounterPreviewErrorCopy(caught));
      } else {
        setError("Encounter preview could not run.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function savePrivateSession() {
    if (!token || !ready || !providerReady || readinessLoading || busy || savedSessionBusy) return;
    setSavedSessionBusy(true);
    setSavedSessionError(null);

    try {
      const response = await apiPost<PersonaEncounterPrivateSessionResponse>(
        PERSONA_ENCOUNTER_PRIVATE_SESSIONS_PATH,
        personaEncounterPreviewPayload({
          initiatorPersonaId: persona.id,
          responderPersonaId: selectedResponderId,
          setup,
        }),
        token,
      );
      setSavedSessions((current) => [
        response.session,
        ...current.filter((session) => session.id !== response.session.id),
      ]);
    } catch (caught) {
      if (caught instanceof ApiRequestError) {
        setSavedSessionError(personaEncounterPreviewErrorCopy(caught));
      } else {
        setSavedSessionError("Private encounter artifact could not be saved.");
      }
    } finally {
      setSavedSessionBusy(false);
    }
  }

  async function deletePrivateSession(sessionId: string) {
    if (!token || savedSessionBusy) return;
    setSavedSessionBusy(true);
    setSavedSessionError(null);

    try {
      await apiDelete<PersonaEncounterPrivateSessionDeleteResponse>(
        personaEncounterPrivateSessionPath(sessionId),
        token,
      );
      setSavedSessions((current) => current.filter((session) => session.id !== sessionId));
    } catch (caught) {
      if (caught instanceof ApiRequestError) {
        setSavedSessionError(personaEncounterPreviewErrorCopy(caught));
      } else {
        setSavedSessionError("Private encounter artifact could not be deleted.");
      }
    } finally {
      setSavedSessionBusy(false);
    }
  }

  return (
    <section className="studio-runtime-preview" aria-label="Persona encounter runtime preview">
      <div className="studio-section-heading">
        <div className="section-label">Encounter Preview</div>
        <h2>One disposable responder reply</h2>
        <p>Owner-initiated, same-owner, not saved, not a transcript, not shareable.</p>
      </div>

      <div className="studio-runtime-query">
        <label>
          <span className="section-label">Responder</span>
          <select
            className="select"
            value={selectedResponderId}
            onChange={(event) => setResponderId(event.target.value)}
            disabled={busy || responderOptions.length === 0}
            style={{ margin: "0.35rem 0 0" }}
          >
            {responderOptions.length === 0 ? (
              <option value="">Create another persona first</option>
            ) : responderOptions.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button primary"
          type="button"
          onClick={runPreview}
          disabled={!generationReady || busy}
        >
          {busy ? "Generating..." : "Generate preview"}
        </button>
      </div>

      <label>
        <span className="section-label">Owner-authored setup</span>
        <textarea
          className="textarea"
          value={setup}
          onChange={(event) => setSetup(event.target.value)}
          maxLength={1600}
          disabled={busy}
          placeholder={selectedResponder ? `Set up one moment for ${persona.name} and ${selectedResponder.name}.` : "Create another persona before running an encounter preview."}
          style={{ margin: "0.35rem 0 0", minHeight: 110 }}
        />
      </label>

      <div className="studio-runtime-counts">
        <span>
          <strong>{availabilityCopy}</strong>
        </span>
        {readback.slice(0, 4).map((item) => (
          <span key={item}>
            <strong>{item}</strong>
          </span>
        ))}
      </div>

      {error && <div className="space-form-error">{error}</div>}

      {preview && (
        <article className="studio-context-panel">
          <div className="section-label">{preview.provenance.reply.label}</div>
          <p>{preview.preview.reply.content}</p>
          <div className="studio-runtime-counts">
            {readback.slice(4).map((item) => (
              <span key={item}>
                <strong>{item}</strong>
              </span>
            ))}
          </div>
        </article>
      )}

      <article className="studio-context-panel">
        <div className="section-label">Private encounter artifacts</div>
        <h3>Saved owner-only encounters</h3>
        <p>Creates a new private saved artifact from a server-generated responder reply. The disposable preview remains unsaved.</p>
        <div className="studio-runtime-query">
          <button
            className="button secondary"
            type="button"
            onClick={savePrivateSession}
            disabled={!generationReady || busy || savedSessionBusy}
          >
            {savedSessionBusy ? "Saving..." : "Save private artifact"}
          </button>
        </div>

        <div className="studio-encounter-artifact-tags">
          {savedReadback.slice(0, 6).map((item) => (
            <span key={item}>
              <strong>{item}</strong>
            </span>
          ))}
        </div>

        {savedSessionError && <div className="space-form-error">{savedSessionError}</div>}

        {savedSessionsLoading ? (
          <p>Loading private encounter artifacts.</p>
        ) : savedSessions.length === 0 ? (
          <p>No private encounter artifacts saved yet.</p>
        ) : (
          <div className="studio-stack">
            {savedSessions.slice(0, 5).map((session) => (
              <article className="studio-context-panel" key={session.id}>
                <div className="section-label">{session.provenance.artifact.label}</div>
                <h4>{session.personas.initiatorName} / {session.personas.responderName}</h4>
                <p>{session.setup.content}</p>
                <p>{session.reply.content}</p>
                <PrivateEncounterCurationControls
                  session={session}
                  token={token}
                  onSessionUpdate={(updated) => {
                    setSavedSessions((current) =>
                      current.map((candidate) => candidate.id === updated.id ? updated : candidate)
                    );
                  }}
                />
                <div className="studio-encounter-artifact-tags">
                  {personaEncounterPrivateSessionReadback(session).slice(5).map((item) => (
                    <span key={item}>
                      <strong>{item}</strong>
                    </span>
                  ))}
                </div>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => deletePrivateSession(session.id)}
                  disabled={savedSessionBusy}
                >
                  Discard
                </button>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

function PrivateEncounterCurationControls({
  session,
  token,
  onSessionUpdate,
}: {
  session: PersonaEncounterPrivateSession;
  token: string | null;
  onSessionUpdate: (session: PersonaEncounterPrivateSession) => void;
}) {
  const [title, setTitle] = useState(session.curation.title ?? "");
  const [summary, setSummary] = useState(session.curation.summary ?? "");
  const [tags, setTags] = useState(session.curation.tags.join(", "));
  const [publicationCandidate, setPublicationCandidate] = useState(session.curation.publicationCandidate);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(session.curation.title ?? "");
    setSummary(session.curation.summary ?? "");
    setTags(session.curation.tags.join(", "));
    setPublicationCandidate(session.curation.publicationCandidate);
    setError(null);
  }, [
    session.id,
    session.curation.title,
    session.curation.summary,
    session.curation.tags,
    session.curation.publicationCandidate,
  ]);

  async function saveCuration() {
    if (!token || busy) return;
    setBusy(true);
    setError(null);

    try {
      const response = await apiPatch<PersonaEncounterPrivateSessionResponse>(
        personaEncounterPrivateSessionCurationPath(session.id),
        personaEncounterPrivateSessionCurationPayload({
          title,
          summary,
          tags: tags.split(","),
          publicationCandidate,
        }),
        token,
      );
      onSessionUpdate(response.session);
    } catch (caught) {
      if (caught instanceof ApiRequestError) {
        setError(personaEncounterPreviewErrorCopy(caught));
      } else {
        setError("Private encounter curation could not be saved.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function clearCuration() {
    if (!token || busy) return;
    setBusy(true);
    setError(null);

    try {
      const response = await apiPatch<PersonaEncounterPrivateSessionResponse>(
        personaEncounterPrivateSessionCurationPath(session.id),
        personaEncounterPrivateSessionCurationPayload({
          title: null,
          summary: null,
          tags: [],
          publicationCandidate: false,
        }),
        token,
      );
      onSessionUpdate(response.session);
    } catch (caught) {
      if (caught instanceof ApiRequestError) {
        setError(personaEncounterPreviewErrorCopy(caught));
      } else {
        setError("Private encounter curation could not be cleared.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="studio-encounter-curation-form">
      <div className="section-label">{session.curation.label}</div>
      <p>{session.curation.note}</p>
      <label>
        <span className="section-label">Private title</span>
        <input
          className="input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          disabled={busy}
          placeholder="Owner title"
        />
      </label>
      <label>
        <span className="section-label">Private note</span>
        <textarea
          className="textarea"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          maxLength={800}
          disabled={busy}
          placeholder="Private owner note"
          style={{ minHeight: 84 }}
        />
      </label>
      <label>
        <span className="section-label">Private tags</span>
        <input
          className="input"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          maxLength={520}
          disabled={busy}
          placeholder="quiet, candidate"
        />
      </label>
      <label className="studio-encounter-candidate-toggle">
        <input
          type="checkbox"
          checked={publicationCandidate}
          onChange={(event) => setPublicationCandidate(event.target.checked)}
          disabled={busy}
        />
        <span>Private candidate/planning flag only; not publish, share, moderation, public exhibit, or cross-owner consent.</span>
      </label>
      {error && <div className="space-form-error">{error}</div>}
      <div className="studio-runtime-query">
        <button
          className="button secondary"
          type="button"
          onClick={saveCuration}
          disabled={busy}
        >
          {busy ? "Saving..." : "Save private curation"}
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={clearCuration}
          disabled={busy}
        >
          Clear private curation
        </button>
      </div>
    </div>
  );
}

function encounterReadinessErrorCode(code?: string) {
  if (code === "persona_encounter_persona_not_owned") return code;
  if (code === "persona_encounter_provider_unavailable") return code;
  return undefined;
}

function ReadinessGatePanel({
  gate,
  ariaLabel,
}: {
  gate: {
    eyebrow: string;
    title: string;
    summary: string;
    privacy: string;
    items: Array<{ key: string; label: string; status: string; body: string }>;
  };
  ariaLabel: string;
}) {
  return (
    <section className="studio-readiness-panel" aria-label={ariaLabel}>
      <div className="studio-section-heading">
        <div className="section-label">{gate.eyebrow}</div>
        <h2>{gate.title}</h2>
        <p>{gate.summary}</p>
      </div>
      <div className="studio-continuity-grid studio-readiness-grid">
        {gate.items.map((item) => (
          <div key={item.key} className="studio-continuity-card studio-readiness-card">
            <span>{item.label}</span>
            <strong>{item.status}</strong>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
      <p className="studio-readiness-privacy">{gate.privacy}</p>
    </section>
  );
}

function ContinuityCard({ label, value, body, href }: { label: string; value: number; body: string; href: string }) {
  return (
    <Link href={href} className="studio-continuity-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{body}</p>
    </Link>
  );
}

function InteractionCard({ label, value, body, href }: { label: string; value: string; body: string; href?: string }) {
  const content = (
    <>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{body}</p>
    </>
  );

  return href ? (
    <Link href={href} className="studio-continuity-card">
      {content}
    </Link>
  ) : (
    <div className="studio-continuity-card">
      {content}
    </div>
  );
}
