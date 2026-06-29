"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { Persona, PersonaSummary } from "@station/types/persona";
import { ApiRequestError, apiGet, apiPost } from "@/lib/api-client";
import {
  activeStudioHref,
  studioPersonaWorkspacePrimaryActions,
  studioPersonaWorkspaceTabs,
} from "@/lib/studio-navigation";
import { personaEncounterContractGate } from "@/lib/persona-encounter-contract";
import { personaEncounterReadinessGate } from "@/lib/persona-encounter-readiness";
import {
  PERSONA_ENCOUNTER_PREVIEW_PATH,
  personaEncounterPreviewAvailabilityCopy,
  personaEncounterPreviewErrorCopy,
  personaEncounterPreviewPayload,
  personaEncounterPreviewReadback,
  personaEncounterPreviewReadinessPath,
  personaEncounterPreviewReady,
  type PersonaEncounterPreviewReadinessResponse,
  type PersonaEncounterPreviewResponse,
} from "@/lib/persona-encounter-runtime";
import { voiceAvatarReadinessGate } from "@/lib/voice-avatar-readiness";
import {
  publicInteractionActivityBoundaryCopy,
  publicInteractionActivitySummary,
  publicInteractionActivityValue,
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
        value={readback?.publicChat.enabled ? "On" : "Off"}
        body={`${publicInteractionChatLabel(readback)}. ${publicInteractionTokenBoundaryCopy(readback)}`}
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
  const selectedResponderId = responderId || responderOptions[0]?.id || "";
  const selectedResponder = responderOptions.find((candidate) => candidate.id === selectedResponderId) ?? null;
  const ready = personaEncounterPreviewReady({
    initiatorPersonaId: persona.id,
    responderPersonaId: selectedResponderId,
    setup,
  });
  const readback = personaEncounterPreviewReadback(preview);
  const providerReady = readiness?.ready === true;
  const availabilityCopy = responderOptions.length === 0
    ? "Create another persona first."
    : readinessLoading
    ? "Checking encounter preview provider setup."
    : personaEncounterPreviewAvailabilityCopy(readiness);
  const generationReady = Boolean(ready && token && providerReady && !readinessLoading);

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
    </section>
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
