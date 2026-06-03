"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Persona } from "@station/types/persona";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

const topologyOptions = [
  {
    name: "Integrative",
    shape: "Radial",
    detail: "Builds connections across domains with warmer relational continuity.",
  },
  {
    name: "Investigative",
    shape: "Branching",
    detail: "Follows threads deeply and keeps a more challenging analytical edge.",
  },
  {
    name: "Structural",
    shape: "Lattice",
    detail: "Maps patterns and structures before taking a relational stance.",
  },
];

const memoryRows = [
  { title: "Founding tone", meta: "memory candidate", priority: "high" },
  { title: "Private mode rule", meta: "canon item", priority: "stable" },
  { title: "Archive continuity", meta: "source reference", priority: "medium" },
];

const archiveRows = [
  { title: "station-notes.txt", type: "document", source: "upload" },
  { title: "old-chat-export.json", type: "conversation", source: "import" },
  { title: "Station tone pass", type: "integrity", source: "calibration" },
];

interface IntegrityHistorySession {
  id: string;
  session_type: string;
  status: string;
  clusters_covered: string[];
  started_at: string;
  completed_at: string | null;
  integrity_session_outputs?: Array<{ id: string; output_type: string; content: string; status: string }>;
}

export function PersonaManagement({ persona, personaId }: { persona: Persona; personaId: string }) {
  const [integrityHistory, setIntegrityHistory] = useState<IntegrityHistorySession[]>([]);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;
      const data = await apiGet<{ sessions: IntegrityHistorySession[] }>(`/integrity/history/${personaId}`, session.accessToken ?? session.access_token).catch(() => ({ sessions: [] }));
      setIntegrityHistory(data.sessions ?? []);
    });
  }, [personaId]);

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
            <button type="button" style={primaryButton}>Save changes</button>
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
                <div>
                  <div style={{ ...fieldLabel, marginBottom: 8 }}>Topology configuration</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
                    {topologyOptions.map((option, index) => (
                      <button key={option.name} type="button" style={{ ...optionCard, borderColor: index === 0 ? "#2563eb" : "#263244" }}>
                        <span style={{ color: "#f8fafc", fontWeight: 800 }}>{option.name}</span>
                        <span style={{ color: "#93c5fd", fontSize: 12 }}>{option.shape}</span>
                        <span style={{ color: "#8ea0b8", fontSize: 12, lineHeight: 1.45 }}>{option.detail}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  <label style={fieldLabel}>
                    Visibility
                    <select value={persona.visibility} disabled style={input}>
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </label>
                  <label style={fieldLabel}>
                    Avatar colour
                    <input value="#2563eb" readOnly style={input} />
                  </label>
                </div>
              </div>
            </section>

            <section style={panel}>
              <SectionTitle title="Memory and Canon" action="Open memory" href={`/studio/personas/${personaId}/memory`} />
              <div style={{ display: "grid", gap: 10 }}>
                {memoryRows.map((row) => (
                  <article key={row.title} style={listRow}>
                    <span style={pinBox}>M</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 800 }}>{row.title}</div>
                      <div style={muted}>{row.meta} - {row.priority}</div>
                    </div>
                    <button type="button" style={miniButton}>Edit</button>
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
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {["Chats", "Documents", "Images", "Imports"].map((item) => <span key={item} style={pill}>{item}</span>)}
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {archiveRows.map((row) => (
                  <article key={row.title} style={listRow}>
                    <span style={pinBox}>A</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 800 }}>{row.title}</div>
                      <div style={muted}>{row.type} - {row.source}</div>
                    </div>
                    <button type="button" style={miniButton}>Attach</button>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside style={{ display: "grid", gap: 18 }}>
            <section style={panel}>
              <SectionTitle title="Integrity History" action="Start new" href={`/studio/personas/${personaId}/calibration`} />
              <div style={{ display: "grid", gap: 10 }}>
                {integrityHistory.length === 0 ? (
                  <div style={muted}>No sessions yet. Your first Integrity Session will appear here once complete.</div>
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
                Public interaction limit
                <input value="5 messages for visitors" readOnly style={input} />
              </label>
              <label style={fieldLabel}>
                Public description
                <textarea value={persona.shortDescription ?? ""} readOnly style={{ ...input, minHeight: 92 }} />
              </label>
            </section>

            <section style={panel}>
              <SectionTitle title="Active Chat Threads" />
              {["Current thread", "Migration notes", "Public boundary pass"].map((thread) => (
                <div key={thread} style={{ ...listRow, marginBottom: 10 }}>
                  <span style={pinBox}>T</span>
                  <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 700 }}>{thread}</div>
                </div>
              ))}
            </section>

            <section style={{ ...panel, borderColor: "#5f2424", background: "#1e1114" }}>
              <SectionTitle title="Danger Zone" />
              <p style={{ margin: "0 0 12px", color: "#d9a2a2", fontSize: 13, lineHeight: 1.55 }}>
                Delete persona will require a confirmation flow before it performs any destructive action.
              </p>
              <button type="button" style={{ ...secondaryButton, borderColor: "#7d2e2e", color: "#fecaca" }}>Delete persona</button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <h2 style={{ margin: 0, color: "#f8fafc", fontSize: 16 }}>{title}</h2>
      {action && href ? <Link href={href} style={{ marginLeft: "auto", color: "#93c5fd", fontSize: 12, textDecoration: "none" }}>{action}</Link> : null}
    </div>
  );
}

function acceptedCount(session: IntegrityHistorySession) {
  return (session.integrity_session_outputs ?? [])
    .filter((output) => output.status === "accepted" || output.status === "edited")
    .length;
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
  cursor: "pointer",
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

const pill = {
  border: "1px solid #334155",
  borderRadius: 999,
  background: "#0d1420",
  color: "#cbd5e1",
  padding: "5px 8px",
  fontSize: 11,
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

const miniButton = {
  marginLeft: "auto",
  border: "1px solid #334155",
  borderRadius: 7,
  background: "#111827",
  color: "#dbeafe",
  padding: "6px 9px",
  fontSize: 12,
  cursor: "pointer",
};

const toggleRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#d1d5db",
  fontSize: 13,
  marginBottom: 12,
};
