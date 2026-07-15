"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  MemoryGraph,
  Persona,
  PersonaHandoff,
  PersonaLayerKey,
  PersonaLayerProfile,
  PersonaLifecycleEvent,
} from "@station/types/persona";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import {
  handoffFreshnessCopy,
  handoffStatusLabel,
  handoffSummaryPreview,
  lifecycleEventReadback,
  memoryGraphNodeReadback,
  memoryGraphReadback,
  memoryGraphRelationshipReadbacks,
  memoryGraphRelationshipStateCopy,
} from "@/lib/persona-lifecycle-ui";

interface IntegrityHistorySession {
  id: string;
  session_type: string;
  status: string;
  clusters_covered: string[];
  started_at: string;
  completed_at: string | null;
  integrity_session_outputs?: Array<{ id: string; output_type: string; content: string; status: string }>;
}

interface PersonaContinuitySummary {
  memoryCount?: number;
  canonCount?: number;
  archiveFileCount?: number;
  archivedChatCount?: number;
  continuityCandidateCount?: number;
  continuityRecordCount?: number;
  integritySessionCount?: number;
}

interface ArchitectureResponse {
  profile: PersonaLayerProfile;
  lifecycleEvents: PersonaLifecycleEvent[];
  handoffs: PersonaHandoff[];
}

type ReadState<T> =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "ready"; data: T };

type Notice = { tone: "success" | "error" | "warning"; text: string } | null;

const layerKeys: PersonaLayerKey[] = ["soul", "body", "faculty", "skill", "evolution"];

export function PersonaManagement({
  persona,
  personaId,
  accessToken,
}: {
  persona: Persona;
  personaId: string;
  accessToken: string;
}) {
  const [currentPersona, setCurrentPersona] = useState(persona);
  const [architecture, setArchitecture] = useState<ReadState<ArchitectureResponse>>({ status: "loading" });
  const [memoryGraph, setMemoryGraph] = useState<ReadState<MemoryGraph>>({ status: "loading" });
  const [integrityHistory, setIntegrityHistory] = useState<ReadState<IntegrityHistorySession[]>>({ status: "loading" });
  const [handoffSummary, setHandoffSummary] = useState("");
  const [creatingHandoff, setCreatingHandoff] = useState(false);
  const [handoffNotice, setHandoffNotice] = useState<Notice>(null);
  const [avatarNotice, setAvatarNotice] = useState<Notice>(null);
  const [anonymousNotice, setAnonymousNotice] = useState<Notice>(null);
  const [avatarUrlInput, setAvatarUrlInput] = useState(persona.avatarUrl ?? "");
  const [savedAvatarUrl, setSavedAvatarUrl] = useState(persona.avatarUrl ?? null);
  const [savingAvatarUrl, setSavingAvatarUrl] = useState(false);
  const [anonymousChatEnabled, setAnonymousChatEnabled] = useState(Boolean(persona.publicAnonymousChatEnabled));
  const [savingAnonymousChat, setSavingAnonymousChat] = useState(false);

  const continuity = (currentPersona as Persona & { continuity?: PersonaContinuitySummary }).continuity;
  const publicChatEnabled = Boolean(currentPersona.publicChatEnabled);
  const publicPersona = currentPersona.visibility === "public";

  useEffect(() => {
    let mounted = true;
    setArchitecture({ status: "loading" });
    setMemoryGraph({ status: "loading" });
    setIntegrityHistory({ status: "loading" });

    apiGet<ArchitectureResponse>(`/personas/${personaId}/architecture`, accessToken)
      .then((data) => {
        if (mounted) setArchitecture({ status: "ready", data });
      })
      .catch(() => {
        if (mounted) setArchitecture({ status: "unavailable" });
      });

    apiGet<{ graph: MemoryGraph }>(`/memory/persona/${personaId}/graph`, accessToken)
      .then((data) => {
        if (mounted) setMemoryGraph({ status: "ready", data: data.graph });
      })
      .catch(() => {
        if (mounted) setMemoryGraph({ status: "unavailable" });
      });

    apiGet<{ sessions: IntegrityHistorySession[] }>(`/integrity/history/${personaId}`, accessToken)
      .then((data) => {
        if (mounted) setIntegrityHistory({ status: "ready", data: data.sessions ?? [] });
      })
      .catch(() => {
        if (mounted) setIntegrityHistory({ status: "unavailable" });
      });

    return () => {
      mounted = false;
    };
  }, [accessToken, personaId]);

  const layerEntries = useMemo(() => {
    if (architecture.status !== "ready") return [];
    return layerKeys.map((key) => ({ key, value: architecture.data.profile[key] }));
  }, [architecture]);

  const memoryRelationships = useMemo(
    () => memoryGraph.status === "ready" ? memoryGraphRelationshipReadbacks(memoryGraph.data, 5) : [],
    [memoryGraph],
  );

  async function createHandoff() {
    if (creatingHandoff) return;
    setCreatingHandoff(true);
    setHandoffNotice(null);

    try {
      const response = await apiPost<{ handoff: PersonaHandoff }>(
        `/personas/${personaId}/handoffs`,
        { summary: handoffSummary.trim() || undefined },
        accessToken,
      );
      setHandoffSummary("");
      setArchitecture((current) => addHandoffToArchitecture(current, response.handoff));

      try {
        const refreshed = await apiGet<ArchitectureResponse>(`/personas/${personaId}/architecture`, accessToken);
        setArchitecture({ status: "ready", data: refreshed });
        setHandoffNotice({ tone: "success", text: "Handoff saved. Recent history refreshed." });
      } catch {
        setHandoffNotice({ tone: "warning", text: "Handoff saved. Recent history could not be refreshed." });
      }
    } catch {
      setHandoffNotice({ tone: "error", text: "Handoff was not saved. Review the summary and try again." });
    } finally {
      setCreatingHandoff(false);
    }
  }

  async function saveAvatarUrl(nextValue: string | null = avatarUrlInput) {
    if (savingAvatarUrl) return;
    setSavingAvatarUrl(true);
    setAvatarNotice(null);

    try {
      const response = await apiPatch<{ persona: Persona }>(
        `/personas/${personaId}`,
        { avatarUrl: nextValue },
        accessToken,
      );
      setCurrentPersona(response.persona);
      const nextAvatarUrl = response.persona.avatarUrl ?? null;
      setSavedAvatarUrl(nextAvatarUrl);
      setAvatarUrlInput(nextAvatarUrl ?? "");
      setAvatarNotice({
        tone: "success",
        text: nextAvatarUrl ? "Avatar URL saved." : "Avatar URL cleared.",
      });
    } catch {
      setAvatarNotice({ tone: "error", text: "Avatar URL was not saved. Check the URL and try again." });
    } finally {
      setSavingAvatarUrl(false);
    }
  }

  async function saveAnonymousChatEnabled(nextEnabled: boolean) {
    if (savingAnonymousChat) return;
    setSavingAnonymousChat(true);
    setAnonymousNotice(null);

    try {
      const response = await apiPatch<{ persona: Persona }>(
        `/personas/${personaId}`,
        { publicAnonymousChatEnabled: nextEnabled },
        accessToken,
      );
      setCurrentPersona(response.persona);
      const enabled = Boolean(response.persona.publicAnonymousChatEnabled);
      setAnonymousChatEnabled(enabled);
      setAnonymousNotice({
        tone: "success",
        text: enabled ? "Anonymous public chat alpha enabled." : "Anonymous public chat alpha disabled.",
      });
    } catch {
      setAnonymousNotice({
        tone: "error",
        text: "Anonymous public chat was not changed. Refresh the profile before trying again.",
      });
    } finally {
      setSavingAnonymousChat(false);
    }
  }

  return (
    <main className="persona-profile-page">
      <div className="persona-profile-shell">
        <header className="persona-profile-header">
          <div className="persona-profile-heading">
            <p className="persona-profile-eyebrow">Persona profile</p>
            <h1>{currentPersona.name}</h1>
            <p>
              Review this persona&apos;s profile and continuity. On this page you can update the
              avatar URL, change anonymous public chat when eligible, and save a context handoff.
            </p>
          </div>
          <nav className="persona-profile-actions" aria-label="Persona profile destinations">
            <Link className="persona-profile-button persona-profile-button-secondary" href={`/studio/personas/${personaId}`}>
              Back to chat
            </Link>
            <Link className="persona-profile-button" href={`/studio/personas/${personaId}/calibration`}>
              Open Integrity
            </Link>
          </nav>
        </header>

        <div className="persona-profile-grid">
          <div className="persona-profile-column">
            <section className="persona-profile-panel">
              <SectionTitle
                title="Profile facts"
                support="Name, descriptions, provider, visibility, and public chat are read-only on this page."
              />
              <dl className="persona-profile-facts">
                <Fact label="Name" value={currentPersona.name} />
                <Fact label="Short description" value={currentPersona.shortDescription} />
                <Fact label="Long description" value={currentPersona.longDescription} />
                <Fact label="Provider" value={currentPersona.provider} />
                <Fact label="Visibility" value={labelize(currentPersona.visibility)} />
                <Fact label="Public chat" value={publicChatEnabled ? "Enabled" : "Disabled"} />
              </dl>
            </section>

            <section className="persona-profile-panel">
              <SectionTitle title="Avatar URL" support="Use a public HTTPS image URL. Unsafe values are rejected." />
              <label className="persona-profile-field">
                <span>Avatar URL</span>
                <input
                  value={avatarUrlInput}
                  onChange={(event) => setAvatarUrlInput(event.target.value)}
                  placeholder="https://example.com/avatar.png"
                />
              </label>
              <div className="persona-profile-control-row">
                <button type="button" onClick={() => saveAvatarUrl()} disabled={savingAvatarUrl}>
                  {savingAvatarUrl ? "Saving..." : "Save avatar URL"}
                </button>
                <button
                  type="button"
                  className="persona-profile-button-secondary"
                  onClick={() => saveAvatarUrl(null)}
                  disabled={savingAvatarUrl || (!savedAvatarUrl && !avatarUrlInput.trim())}
                >
                  Clear avatar URL
                </button>
              </div>
              <NoticeBlock notice={avatarNotice} />
            </section>

            <section className="persona-profile-panel">
              <SectionTitle title="Layer architecture" support="Read-only layer summary." />
              {architecture.status === "loading" ? <ReadStateMessage text="Loading layer architecture..." /> : null}
              {architecture.status === "unavailable" ? (
                <ReadStateMessage text="Layer architecture unavailable. Reload the page to try again." tone="warning" />
              ) : null}
              {architecture.status === "ready" ? (
                <div className="persona-profile-layer-list">
                  {layerEntries.map((layer) => (
                    <div className="persona-profile-layer-row" key={layer.key}>
                      <span>{labelize(layer.key)}</span>
                      <p>{summarizeObject(layer.value)}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="persona-profile-panel">
              <SectionTitle title="Memory graph" />
              {memoryGraph.status === "loading" ? <ReadStateMessage text="Loading memory graph..." /> : null}
              {memoryGraph.status === "unavailable" ? (
                <ReadStateMessage text="Memory graph unavailable. Reload the page to try again." tone="warning" />
              ) : null}
              {memoryGraph.status === "ready" ? (
                <>
                  <div className="persona-profile-metrics">
                    <Metric label="Memory nodes" value={memoryGraph.data.nodes.length} />
                    <Metric label="Graph edges" value={memoryGraph.data.edges.length} />
                    <Metric label="Canon items" value={continuity?.canonCount ?? 0} />
                  </div>
                  <p className="persona-profile-muted">
                    {memoryGraphReadback(memoryGraph.data.nodes.length, memoryGraph.data.edges.length)}
                  </p>
                  <div className="persona-profile-list">
                    {memoryGraph.data.nodes.length === 0 ? (
                      <ReadStateMessage text="No memory nodes yet." />
                    ) : memoryGraph.data.nodes.slice(0, 5).map((node) => {
                      const readback = memoryGraphNodeReadback(node);
                      return (
                        <div className="persona-profile-list-row" key={node.id}>
                          <span className="persona-profile-mark">M</span>
                          <div>
                            <strong>{readback.title}</strong>
                            <p>{readback.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="persona-profile-relationships">
                    <strong>Relationships</strong>
                    <p>
                      {memoryGraphRelationshipStateCopy(
                        memoryGraph.data.nodes.length,
                        memoryGraph.data.edges.length,
                        memoryRelationships.length,
                      )}
                    </p>
                    {memoryRelationships.map((relationship) => (
                      <div className="persona-profile-relationship-row" key={relationship.key}>
                        <span>{relationship.sourceLabel}</span>
                        <span>{relationship.relationshipLabel}</span>
                        <span>{relationship.targetLabel}</span>
                        <span>{relationship.confidenceLabel}</span>
                        {relationship.note ? <p>{relationship.note}</p> : null}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </section>

            <section className="persona-profile-panel">
              <SectionTitle title="Archive and continuity" />
              <div className="persona-profile-metrics">
                <Metric label="Files" value={continuity?.archiveFileCount ?? 0} />
                <Metric label="Chats" value={continuity?.archivedChatCount ?? 0} />
                <Metric label="Continuity records" value={continuity?.continuityRecordCount ?? 0} />
              </div>
              <div className="persona-profile-link-row">
                <Link href={`/studio/personas/${personaId}/memory`}>Open Memory</Link>
                <Link href={`/studio/personas/${personaId}/canon`}>Open Canon</Link>
                <Link href={`/studio/personas/${personaId}/files`}>Open Archive</Link>
                <Link href={`/studio/personas/${personaId}/continuity`}>Open Continuity</Link>
              </div>
            </section>
          </div>

          <aside className="persona-profile-column">
            <section className="persona-profile-panel">
              <SectionTitle title="Public access" />
              <dl className="persona-profile-facts">
                <Fact label="Public description" value={currentPersona.shortDescription} />
              </dl>
              <label className="persona-profile-toggle">
                <input
                  type="checkbox"
                  checked={anonymousChatEnabled}
                  disabled={!publicPersona || !publicChatEnabled || savingAnonymousChat}
                  onChange={(event) => saveAnonymousChatEnabled(event.currentTarget.checked)}
                />
                <span>Anonymous public chat alpha</span>
              </label>
              <p className="persona-profile-muted">
                Available only when this persona is Public, public chat is enabled, and the
                owner account and public route are eligible.
              </p>
              <NoticeBlock notice={anonymousNotice} />
            </section>

            <section className="persona-profile-panel">
              <SectionTitle title="Context handoff" />
              <label className="persona-profile-field">
                <span>Context handoff</span>
                <textarea
                  value={handoffSummary}
                  onChange={(event) => setHandoffSummary(event.target.value)}
                  placeholder="Summarize current context."
                />
              </label>
              <button type="button" onClick={createHandoff} disabled={creatingHandoff}>
                {creatingHandoff ? "Saving..." : "Save context handoff"}
              </button>
              <NoticeBlock notice={handoffNotice} />
              <h3>Recent handoffs</h3>
              <ArchitectureHandoffs state={architecture} />
            </section>

            <section className="persona-profile-panel">
              <SectionTitle title="Lifecycle history" />
              <LifecycleHistory state={architecture} />
            </section>

            <section className="persona-profile-panel">
              <SectionTitle title="Integrity history" />
              {integrityHistory.status === "loading" ? <ReadStateMessage text="Loading Integrity history..." /> : null}
              {integrityHistory.status === "unavailable" ? (
                <ReadStateMessage text="Integrity history unavailable. Reload the page to try again." tone="warning" />
              ) : null}
              {integrityHistory.status === "ready" ? (
                <div className="persona-profile-list">
                  {integrityHistory.data.length === 0 ? (
                    <ReadStateMessage text="No Integrity sessions yet." />
                  ) : integrityHistory.data.slice(0, 5).map((session) => (
                    <div className="persona-profile-list-row" key={session.id}>
                      <span className="persona-profile-mark">I</span>
                      <div>
                        <strong>{session.session_type}</strong>
                        <p>
                          {session.status} - {(session.clusters_covered ?? []).join(", ") || "in progress"} - {acceptedCount(session)} accepted
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="persona-profile-link-row">
                <Link href={`/studio/personas/${personaId}/calibration`}>Open Integrity</Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ title, support }: { title: string; support?: string }) {
  return (
    <div className="persona-profile-section-title">
      <h2>{title}</h2>
      {support ? <p>{support}</p> : null}
    </div>
  );
}

function Fact({ label, value }: { label: string; value?: string | null | boolean }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{formatFact(value)}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="persona-profile-metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ArchitectureHandoffs({ state }: { state: ReadState<ArchitectureResponse> }) {
  if (state.status === "loading") return <ReadStateMessage text="Loading handoff history..." />;
  if (state.status === "unavailable") {
    return <ReadStateMessage text="Handoff history unavailable. Reload the page to try again." tone="warning" />;
  }
  if (state.data.handoffs.length === 0) return <ReadStateMessage text="No handoffs yet." />;
  return (
    <div className="persona-profile-list">
      {state.data.handoffs.slice(0, 4).map((handoff) => (
        <div className="persona-profile-list-row" key={handoff.id}>
          <span className="persona-profile-mark">H</span>
          <div>
            <strong>{handoffStatusLabel(handoff.status)}</strong>
            <p>{handoffSummaryPreview(handoff, 140)}</p>
            <p>{formatDate(handoff.createdAt)}</p>
          </div>
        </div>
      ))}
      <p className="persona-profile-muted">{handoffFreshnessCopy(state.data.handoffs.length)}</p>
    </div>
  );
}

function LifecycleHistory({ state }: { state: ReadState<ArchitectureResponse> }) {
  if (state.status === "loading") return <ReadStateMessage text="Loading lifecycle history..." />;
  if (state.status === "unavailable") {
    return <ReadStateMessage text="Lifecycle history unavailable. Reload the page to try again." tone="warning" />;
  }
  if (state.data.lifecycleEvents.length === 0) return <ReadStateMessage text="No lifecycle events yet." />;
  return (
    <div className="persona-profile-list">
      {state.data.lifecycleEvents.slice(0, 6).map((event) => {
        const readback = lifecycleEventReadback(event);
        return (
          <div className="persona-profile-list-row" key={event.id}>
            <span className="persona-profile-mark">L</span>
            <div>
              <strong>{readback.label}</strong>
              <p>{readback.detail}</p>
              <p>{formatDate(event.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReadStateMessage({ text, tone = "neutral" }: { text: string; tone?: "neutral" | "warning" }) {
  return <p className={`persona-profile-state persona-profile-state-${tone}`}>{text}</p>;
}

function NoticeBlock({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return <p className={`persona-profile-notice persona-profile-notice-${notice.tone}`}>{notice.text}</p>;
}

function addHandoffToArchitecture(
  current: ReadState<ArchitectureResponse>,
  handoff: PersonaHandoff,
): ReadState<ArchitectureResponse> {
  if (current.status !== "ready") {
    return {
      status: "ready",
      data: {
        profile: emptyLayerProfile(handoff.toPersonaId, handoff.ownerUserId),
        lifecycleEvents: [],
        handoffs: [handoff],
      },
    };
  }
  return {
    status: "ready",
    data: {
      ...current.data,
      handoffs: [handoff, ...current.data.handoffs],
    },
  };
}

function emptyLayerProfile(personaId: string, ownerUserId: string): PersonaLayerProfile {
  const now = new Date().toISOString();
  return {
    personaId,
    ownerUserId,
    soul: {},
    body: {},
    faculty: {},
    skill: {},
    evolution: {},
    createdAt: now,
    updatedAt: now,
  };
}

function acceptedCount(session: IntegrityHistorySession) {
  return (session.integrity_session_outputs ?? [])
    .filter((output) => output.status === "accepted" || output.status === "edited")
    .length;
}

function summarizeObject(value: Record<string, unknown>) {
  const entries = Object.entries(value);
  if (entries.length === 0) return "No fields configured yet.";
  return entries.slice(0, 3)
    .map(([key, entry]) => `${labelize(key)}: ${formatValue(entry)}`)
    .join(" / ");
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "unset";
  if (Array.isArray(value)) return value.length === 0 ? "none" : `${value.length} entries`;
  if (typeof value === "object") return `${Object.keys(value as Record<string, unknown>).length} fields`;
  return String(value).slice(0, 80);
}

function formatFact(value?: string | null | boolean) {
  if (typeof value === "boolean") return value ? "Enabled" : "Disabled";
  const text = String(value ?? "").trim();
  return text || "Not set";
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
