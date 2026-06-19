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
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  handoffFreshnessCopy,
  handoffStatusLabel,
  handoffSummaryPreview,
  lifecycleEventReadback,
  memoryGraphReadback,
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

export function PersonaManagement({ persona, personaId }: { persona: Persona; personaId: string }) {
  const [token, setToken] = useState<string | undefined>();
  const [integrityHistory, setIntegrityHistory] = useState<IntegrityHistorySession[]>([]);
  const [architecture, setArchitecture] = useState<ArchitectureResponse | null>(null);
  const [memoryGraph, setMemoryGraph] = useState<MemoryGraph>({ nodes: [], edges: [] });
  const [handoffSummary, setHandoffSummary] = useState("");
  const [creatingHandoff, setCreatingHandoff] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const continuity = (persona as Persona & { continuity?: PersonaContinuitySummary }).continuity;

  useEffect(() => {
    let mounted = true;
    getSession().then(async (session) => {
      if (!session || !mounted) return;
      const accessToken = session.accessToken ?? session.access_token;
      setToken(accessToken);

      const [historyData, architectureData, graphData] = await Promise.all([
        apiGet<{ sessions: IntegrityHistorySession[] }>(`/integrity/history/${personaId}`, accessToken).catch(() => ({ sessions: [] })),
        loadArchitecture(personaId, accessToken),
        apiGet<{ graph: MemoryGraph }>(`/memory/persona/${personaId}/graph`, accessToken).catch(() => ({ graph: { nodes: [], edges: [] } })),
      ]);

      if (!mounted) return;
      setIntegrityHistory(historyData.sessions ?? []);
      setArchitecture(architectureData);
      setMemoryGraph(graphData.graph);
    });

    return () => {
      mounted = false;
    };
  }, [personaId]);

  const layerEntries = useMemo(() => {
    if (!architecture?.profile) return [];
    const keys: PersonaLayerKey[] = ["soul", "body", "faculty", "skill", "evolution"];
    return keys.map((key) => ({ key, value: architecture.profile[key] }));
  }, [architecture]);

  async function createHandoff() {
    if (!token || creatingHandoff) return;
    setCreatingHandoff(true);
    setNotice(null);

    try {
      const response = await apiPost<{ handoff: PersonaHandoff }>(
        `/personas/${personaId}/handoffs`,
        { summary: handoffSummary.trim() || undefined },
        token,
      );
      const refreshed = await loadArchitecture(personaId, token);
      setArchitecture((current) => refreshed ?? (current ? {
        ...current,
        handoffs: [response.handoff, ...current.handoffs],
      } : current));
      setHandoffSummary("");
      setNotice(refreshed ? "Handoff saved. Lifecycle readback refreshed." : "Handoff saved. Lifecycle refresh will appear after reload.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not save handoff.");
    } finally {
      setCreatingHandoff(false);
    }
  }

  return (
    <main style={{ minHeight: "calc(100vh - 52px)", background: "#0b0e14" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(16px, 4vw, 32px) 48px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#93c5fd", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
              Persona Management
            </div>
            <h1 style={{ margin: "8px 0 6px", color: "#f8fafc", fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.05 }}>
              {persona.name}
            </h1>
            <p style={{ margin: 0, color: "#a9b0bd", fontSize: 15, lineHeight: 1.6, maxWidth: 680 }}>
              Manage identity, continuity, archive materials, public visibility, and integrity history for this persona.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link href={`/studio/personas/${personaId}`} style={secondaryButton}>Back to chat</Link>
            <Link href={`/studio/personas/${personaId}/calibration`} style={primaryButton}>Run integrity</Link>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(280px, 0.85fr)", gap: 18, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
            <section style={panel}>
              <SectionTitle title="Identity" />
              <div style={{ display: "grid", gap: 12 }}>
                <label style={fieldLabel}>
                  Persona name
                  <input value={persona.name} readOnly style={input} />
                </label>
                <label style={fieldLabel}>
                  Description
                  <textarea value={persona.longDescription ?? persona.shortDescription ?? ""} readOnly style={{ ...input, minHeight: 118, resize: "vertical" }} />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  <label style={fieldLabel}>
                    Visibility
                    <select value={persona.visibility} disabled style={input}>
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </label>
                  <label style={fieldLabel}>
                    Provider
                    <input value={persona.provider} readOnly style={input} />
                  </label>
                </div>
              </div>
            </section>

            <section style={panel}>
              <SectionTitle title="Layer Architecture" />
              {layerEntries.length === 0 ? (
                <EmptyState text="Layer profile will appear after the architecture endpoint finishes loading." />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
                  {layerEntries.map((layer) => (
                    <article key={layer.key} style={optionCard}>
                      <span style={{ color: "#f8fafc", fontWeight: 800, textTransform: "capitalize" }}>{layer.key}</span>
                      <span style={{ color: "#8ea0b8", fontSize: 12, lineHeight: 1.45 }}>{summarizeObject(layer.value)}</span>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section style={panel}>
              <SectionTitle title="Memory Graph" action="Open memory" href={`/studio/personas/${personaId}/memory`} />
              <div style={metricGrid}>
                <Metric label="Memory nodes" value={memoryGraph.nodes.length} />
                <Metric label="Graph edges" value={memoryGraph.edges.length} />
                <Metric label="Canon items" value={continuity?.canonCount ?? 0} />
              </div>
              <p style={{ ...muted, margin: "10px 0 0" }}>
                {memoryGraphReadback(memoryGraph.nodes.length, memoryGraph.edges.length)}
              </p>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {memoryGraph.nodes.length === 0 ? (
                  <EmptyState text="No memory nodes yet. Add memory items to start building the graph." />
                ) : memoryGraph.nodes.slice(0, 5).map((node) => (
                  <article key={node.id} style={listRow}>
                    <span style={pinBox}>M</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 800 }}>{node.title ?? "Untitled memory"}</div>
                      <div style={muted}>{node.sourceType} - {node.summary || "No summary yet"}</div>
                    </div>
                  </article>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                <Link href={`/studio/personas/${personaId}/memory`} style={secondaryButton}>Add memory item</Link>
                <Link href={`/studio/personas/${personaId}/canon`} style={secondaryButton}>Add canon item</Link>
              </div>
            </section>

            <section style={panel}>
              <SectionTitle title="Persona Archive" action="Open files" href={`/studio/personas/${personaId}/files`} />
              <div style={metricGrid}>
                <Metric label="Files" value={continuity?.archiveFileCount ?? 0} />
                <Metric label="Chats" value={continuity?.archivedChatCount ?? 0} />
                <Metric label="Continuity records" value={continuity?.continuityRecordCount ?? 0} />
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {archiveStatusRows(continuity).map((row) => (
                  <article key={row.label} style={listRow}>
                    <span style={pinBox}>A</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 800 }}>{row.label}</div>
                      <div style={muted}>{row.detail}</div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside style={{ display: "grid", gap: 18 }}>
            <section style={panel}>
              <SectionTitle title="Context Handoffs" />
              <p style={{ ...muted, margin: "0 0 10px" }}>
                {handoffFreshnessCopy(architecture?.handoffs.length ?? 0)}
              </p>
              <textarea
                value={handoffSummary}
                onChange={(event) => setHandoffSummary(event.target.value)}
                placeholder="Summarize current context, pending tasks, emotional tone, or continuity anchors."
                style={{ ...input, minHeight: 96, resize: "vertical", marginTop: 0 }}
              />
              <button type="button" onClick={createHandoff} disabled={!token || creatingHandoff} style={{ ...primaryButton, width: "100%", marginTop: 10 }}>
                {creatingHandoff ? "Saving..." : "Save handoff"}
              </button>
              {notice ? <div style={{ ...muted, marginTop: 8 }}>{notice}</div> : null}
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {(architecture?.handoffs ?? []).length === 0 ? (
                  <EmptyState text="No handoffs yet." />
                ) : architecture!.handoffs.slice(0, 4).map((handoff) => (
                  <article key={handoff.id} style={listRow}>
                    <span style={pinBox}>H</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 800 }}>{handoffStatusLabel(handoff.status)}</div>
                      <div style={muted}>{handoffSummaryPreview(handoff, 140)}</div>
                      <div style={{ ...muted, marginTop: 4 }}>{formatDate(handoff.createdAt)}</div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section style={panel}>
              <SectionTitle title="Lifecycle" />
              <div style={{ display: "grid", gap: 10 }}>
                {(architecture?.lifecycleEvents ?? []).length === 0 ? (
                  <EmptyState text="Lifecycle events will appear as the persona changes." />
                ) : architecture!.lifecycleEvents.slice(0, 6).map((event) => {
                  const readback = lifecycleEventReadback(event);

                  return (
                    <article key={event.id} style={listRow}>
                      <span style={pinBox}>L</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 800 }}>{readback.label}</div>
                        <div style={muted}>{readback.detail}</div>
                        <div style={{ ...muted, marginTop: 4 }}>{formatDate(event.createdAt)}</div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section style={panel}>
              <SectionTitle title="Integrity History" action="Start new" href={`/studio/personas/${personaId}/calibration`} />
              <div style={{ display: "grid", gap: 10 }}>
                {integrityHistory.length === 0 ? (
                  <EmptyState text="No sessions yet. Your first Integrity Session will appear here once complete." />
                ) : integrityHistory.slice(0, 5).map((session) => (
                  <article key={session.id} style={listRow}>
                    <span style={{ ...pinBox, color: "#facc15", borderColor: "#6b4e0c", background: "#2d2108" }}>I</span>
                    <div>
                      <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 800 }}>{session.session_type}</div>
                      <div style={muted}>
                        {session.status} - {(session.clusters_covered ?? []).join(", ") || "in progress"} - {acceptedCount(session)} accepted
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section style={panel}>
              <SectionTitle title="Public Persona" />
              <label style={toggleRow}>
                <input type="checkbox" checked={persona.visibility === "public"} readOnly />
                Enable public interaction
              </label>
              <label style={fieldLabel}>
                Public description
                <textarea value={persona.shortDescription ?? ""} readOnly style={{ ...input, minHeight: 92 }} />
              </label>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function loadArchitecture(personaId: string, accessToken: string) {
  return apiGet<ArchitectureResponse>(`/personas/${personaId}/architecture`, accessToken).catch(() => null);
}

function SectionTitle({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <h2 style={{ margin: 0, color: "#f8fafc", fontSize: 16 }}>{title}</h2>
      {action && href ? <Link href={href} style={{ marginLeft: "auto", color: "#93c5fd", fontSize: 12, textDecoration: "none" }}>{action}</Link> : null}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div style={{ ...muted, border: "1px solid #202938", borderRadius: 8, padding: 11, background: "#0d1420" }}>{text}</div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: "1px solid #202938", borderRadius: 8, background: "#0d1420", padding: 11 }}>
      <div style={{ color: "#f8fafc", fontSize: 20, fontWeight: 900 }}>{value}</div>
      <div style={muted}>{label}</div>
    </div>
  );
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
  return String(value).slice(0, 48);
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function archiveStatusRows(continuity?: PersonaContinuitySummary) {
  return [
    { label: "Memory", detail: `${continuity?.memoryCount ?? 0} memory items available for retrieval.` },
    { label: "Continuity candidates", detail: `${continuity?.continuityCandidateCount ?? 0} candidates waiting for review.` },
    { label: "Integrity sessions", detail: `${continuity?.integritySessionCount ?? 0} sessions linked to this persona.` },
  ];
}

const panel = {
  border: "1px solid #263244",
  background: "#101622",
  borderRadius: 8,
  padding: 16,
};

const input = {
  width: "100%",
  border: "1px solid #334155",
  borderRadius: 8,
  background: "#0d1420",
  color: "#f8fafc",
  padding: "10px 11px",
  marginTop: 7,
};

const fieldLabel = {
  display: "block",
  color: "#9ca3af",
  fontSize: 12,
  fontWeight: 700,
};

const optionCard = {
  display: "grid",
  gap: 6,
  textAlign: "left" as const,
  border: "1px solid #263244",
  borderRadius: 8,
  background: "#0d1420",
  padding: 12,
};

const listRow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  border: "1px solid #202938",
  borderRadius: 8,
  background: "#0d1420",
  padding: 11,
};

const muted = {
  color: "#8ea0b8",
  fontSize: 12,
  lineHeight: 1.4,
};

const pinBox = {
  width: 26,
  height: 26,
  borderRadius: 7,
  border: "1px solid #334155",
  background: "#101827",
  color: "#bfdbfe",
  display: "grid",
  placeItems: "center",
  fontSize: 11,
  fontWeight: 800,
  flex: "0 0 auto",
};

const metricGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: 10,
};

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  border: "1px solid #2563eb",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  padding: "0 14px",
  fontSize: 14,
  fontWeight: 800,
  textDecoration: "none",
  cursor: "pointer",
};

const secondaryButton = {
  ...primaryButton,
  background: "#111827",
  borderColor: "#334155",
  color: "#d1d5db",
};

const toggleRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#d1d5db",
  fontSize: 13,
  marginBottom: 12,
};
