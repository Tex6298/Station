"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import {
  PersonaWorkspaceHeader,
  type PersonaWithContinuity,
} from "@/components/studio/persona-workspace";

type SessionType = "initial" | "periodic" | "migration" | "pre_publication" | "manual";
type NextType = "followup" | "summary" | "anchor" | "end";
type OutputStatus = "pending" | "accepted" | "rejected" | "edited";

const CLUSTERS = [
  { id: "identity", label: "Identity", description: "How this companion came to exist" },
  { id: "relationship", label: "Relationship", description: "What role this companion plays" },
  { id: "tone", label: "Tone", description: "How the companion speaks and feels" },
  { id: "continuity", label: "Continuity", description: "Memory and persistence across time" },
  { id: "boundaries", label: "Boundaries", description: "What should and should not happen" },
  { id: "themes", label: "Themes", description: "Recurring subjects and frameworks" },
] as const;

interface ActivePrompt {
  sessionId: string;
  turnId?: string;
  cluster?: string;
  question?: string;
  summary?: string;
  nextType: NextType;
  clustersPlanned?: string[];
  clusterIndex?: number;
}

interface IntegrityOutput {
  id: string;
  output_type: "memory_candidate" | "canon_candidate" | "preference" | "boundary" | "theme";
  content: string;
  edited_content: string | null;
  status: OutputStatus;
  written_to: string | null;
}

interface HistorySession {
  id: string;
  session_type: string;
  status: string;
  clusters_covered: string[];
  completed_at: string | null;
  started_at: string;
  integrity_session_outputs?: IntegrityOutput[];
}

export default function PersonaCalibrationPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [persona, setPersona] = useState<PersonaWithContinuity | null>(null);
  const [activePrompt, setActivePrompt] = useState<ActivePrompt | null>(null);
  const [answer, setAnswer] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>("periodic");
  const [manualClusters, setManualClusters] = useState<string[]>(["identity", "relationship", "tone", "continuity"]);
  const [outputs, setOutputs] = useState<IntegrityOutput[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const accessToken = session.accessToken ?? session.access_token;
        setToken(accessToken);
        const [personaData, historyData] = await Promise.all([
          apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, accessToken),
          apiGet<{ sessions: HistorySession[] }>(`/integrity/history/${personaId}`, accessToken).catch(() => ({ sessions: [] })),
        ]);
        if (cancelled) return;
        setPersona(personaData.persona);
        setHistory(historyData.sessions ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load Integrity Sessions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [personaId]);

  async function reloadHistory(accessToken = token) {
    if (!accessToken || !personaId) return;
    const data = await apiGet<{ sessions: HistorySession[] }>(`/integrity/history/${personaId}`, accessToken);
    setHistory(data.sessions ?? []);
  }

  async function startSession() {
    if (!token || !persona) return;
    setSaving(true);
    setError(null);
    try {
      const response = await apiPost<{
        sessionId: string;
        question: string;
        cluster: string;
        turnId: string;
        clustersPlanned: string[];
        clusterIndex: number;
      }>("/integrity/start", {
        personaId: persona.id,
        sessionType,
        ...(sessionType === "manual" ? { clusters: manualClusters } : {}),
      }, token);
      setActivePrompt({ ...response, nextType: "anchor" });
      setOutputs([]);
      setAnswer("");
      await reloadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start session.");
    } finally {
      setSaving(false);
    }
  }

  async function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !activePrompt?.sessionId || !activePrompt.turnId || !answer.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const response = await apiPost<ActivePrompt>("/integrity/answer", {
        sessionId: activePrompt.sessionId,
        turnId: activePrompt.turnId,
        answer,
      }, token);
      setActivePrompt({ ...response, sessionId: activePrompt.sessionId });
      setAnswer("");
      if (response.nextType === "end") await loadOutputs(activePrompt.sessionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save answer.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmSummary(confirmed: boolean) {
    if (!token || !activePrompt?.sessionId || !activePrompt.cluster) return;
    setSaving(true);
    setError(null);
    try {
      const response = await apiPost<ActivePrompt>("/integrity/confirm-summary", {
        sessionId: activePrompt.sessionId,
        cluster: activePrompt.cluster,
        confirmed,
        correction: confirmed ? undefined : answer,
      }, token);
      setActivePrompt({ ...response, sessionId: activePrompt.sessionId });
      setAnswer("");
      if (response.nextType === "end") await loadOutputs(activePrompt.sessionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not confirm summary.");
    } finally {
      setSaving(false);
    }
  }

  async function endEarly() {
    if (!token || !activePrompt?.sessionId) return;
    setSaving(true);
    setError(null);
    try {
      await apiPost("/integrity/end-early", { sessionId: activePrompt.sessionId }, token);
      setActivePrompt({ ...activePrompt, nextType: "end" });
      await loadOutputs(activePrompt.sessionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not end session.");
    } finally {
      setSaving(false);
    }
  }

  async function loadOutputs(sessionId: string) {
    if (!token) return;
    const data = await apiGet<{ outputs: IntegrityOutput[] }>(`/integrity/outputs/${sessionId}`, token);
    setOutputs(data.outputs ?? []);
    await reloadHistory();
  }

  async function reviewOutput(output: IntegrityOutput, action: "accept" | "reject" | "edit") {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const response = await apiPatch<{ output: IntegrityOutput }>(`/integrity/outputs/${output.id}`, {
        action,
        editedContent: action === "edit" ? editing[output.id] : undefined,
      }, token);
      setOutputs((current) => current.map((item) => item.id === output.id ? response.output : item));
      await reloadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not review output.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <StudioMessage>Loading Integrity Sessions...</StudioMessage>;
  if (error && !persona) return <StudioMessage tone="error">{error}</StudioMessage>;
  if (!persona) return <StudioMessage tone="error">Persona not found.</StudioMessage>;

  const pendingCount = outputs.filter((output) => output.status === "pending").length;

  return (
    <main className="container studio-workspace">
      <PersonaWorkspaceHeader persona={persona} />
      {error && <div className="space-form-error">{error}</div>}

      <section className="studio-two-column">
        <section className="studio-editor-panel">
          <div className="studio-section-heading">
            <div className="section-label">Integrity Session</div>
            <h2>{activePrompt ? labelForPrompt(activePrompt) : `Review what ${persona.name} will remember`}</h2>
          </div>

          {!activePrompt ? (
            <div style={{ display: "grid", gap: 12 }}>
              <label style={fieldLabel}>
                Session type
                <select value={sessionType} onChange={(e) => setSessionType(e.target.value as SessionType)} style={inputStyle}>
                  <option value="initial">Initial</option>
                  <option value="periodic">Periodic</option>
                  <option value="migration">Migration</option>
                  <option value="pre_publication">Pre-publication</option>
                  <option value="manual">Manual</option>
                </select>
              </label>
              {sessionType === "manual" ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {CLUSTERS.map((cluster) => (
                    <label key={cluster.id} style={clusterRow}>
                      <input
                        type="checkbox"
                        checked={manualClusters.includes(cluster.id)}
                        onChange={(e) => {
                          setManualClusters((current) => e.target.checked
                            ? [...current, cluster.id]
                            : current.filter((item) => item !== cluster.id));
                        }}
                      />
                      <span>
                        <strong>{cluster.label}</strong>
                        <small>{cluster.description}</small>
                      </span>
                    </label>
                  ))}
                </div>
              ) : null}
              <button className="button primary" type="button" onClick={startSession} disabled={saving}>
                {saving ? "Starting..." : "Start Integrity Session"}
              </button>
            </div>
          ) : activePrompt.nextType === "summary" ? (
            <div style={{ display: "grid", gap: 12 }}>
              <div className="studio-prompt-box"><strong>{activePrompt.summary}</strong></div>
              <textarea className="textarea" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Optional correction before moving on." style={{ minHeight: 130 }} />
              <div className="studio-session-actions">
                <button className="button primary" type="button" onClick={() => confirmSummary(true)} disabled={saving}>That feels right</button>
                <button className="button" type="button" onClick={() => confirmSummary(false)} disabled={saving || !answer.trim()}>Use correction</button>
              </div>
            </div>
          ) : activePrompt.nextType === "end" ? (
            <ReviewOutputs
              outputs={outputs}
              pendingCount={pendingCount}
              editing={editing}
              setEditing={setEditing}
              reviewOutput={reviewOutput}
              saving={saving}
              personaName={persona.name}
            />
          ) : (
            <form onSubmit={submitAnswer} style={{ display: "grid", gap: 12 }}>
              <div className="studio-prompt-box">
                <strong>{activePrompt.question}</strong>
                {activePrompt.cluster ? <p>{activePrompt.cluster}</p> : null}
              </div>
              <textarea className="textarea" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer in your private voice." style={{ minHeight: 180 }} required />
              <div className="studio-session-actions">
                <button className="button primary" type="submit" disabled={saving || !answer.trim()}>{saving ? "Saving..." : "Save answer"}</button>
                <button className="button" type="button" onClick={endEarly} disabled={saving}>End early</button>
              </div>
            </form>
          )}
        </section>

        <section className="studio-list-panel">
          <div className="studio-section-heading">
            <div className="section-label">Session Timeline</div>
            <h2>{history.length} sessions</h2>
          </div>
          <div className="studio-item-list">
            {history.length === 0 && <div className="studio-empty">No sessions yet. Your first Integrity Session will appear here once complete.</div>}
            {history.map((session) => (
              <article key={session.id} className="studio-item-card">
                <div>
                  <span>{session.session_type}</span>
                  <time>{formatDate(session.completed_at ?? session.started_at)}</time>
                </div>
                <h3>{session.status}</h3>
                <p>{(session.clusters_covered ?? []).join(", ") || "Session in progress"}</p>
                <small>{acceptedCount(session)} accepted outputs</small>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function ReviewOutputs({
  outputs,
  pendingCount,
  editing,
  setEditing,
  reviewOutput,
  saving,
  personaName,
}: {
  outputs: IntegrityOutput[];
  pendingCount: number;
  editing: Record<string, string>;
  setEditing: (value: Record<string, string>) => void;
  reviewOutput: (output: IntegrityOutput, action: "accept" | "reject" | "edit") => void;
  saving: boolean;
  personaName: string;
}) {
  if (outputs.length === 0) return <div className="studio-empty">No outputs were generated from this session.</div>;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p style={{ margin: 0, color: "#a9b0bd" }}>
        {outputs.length - pendingCount} of {outputs.length} reviewed. Accept, edit, or dismiss each item below.
      </p>
      {outputs.map((output) => (
        <article key={output.id} className="studio-item-card" style={{ opacity: output.status === "pending" ? 1 : 0.72 }}>
          <div><span>{labelForOutput(output.output_type)}</span><span>{output.status}</span></div>
          <textarea
            className="textarea"
            value={editing[output.id] ?? output.edited_content ?? output.content}
            onChange={(e) => setEditing({ ...editing, [output.id]: e.target.value })}
            style={{ minHeight: 96 }}
          />
          {output.written_to ? <small>Saved to: {output.written_to}</small> : null}
          <div className="studio-session-actions">
            <button className="button primary" type="button" disabled={saving || output.status !== "pending"} onClick={() => reviewOutput(output, "accept")}>Accept</button>
            <button className="button" type="button" disabled={saving || output.status !== "pending"} onClick={() => reviewOutput(output, "edit")}>Edit then accept</button>
            <button className="button" type="button" disabled={saving || output.status !== "pending"} onClick={() => reviewOutput(output, "reject")}>Dismiss</button>
          </div>
        </article>
      ))}
      {pendingCount === 0 ? <div className="studio-empty">Done. {personaName} now has updated continuity from this session.</div> : null}
    </div>
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

function labelForPrompt(prompt: ActivePrompt) {
  if (prompt.nextType === "summary") return "Confirm the summary";
  if (prompt.nextType === "end") return "Review generated continuity";
  return prompt.cluster ? `${prompt.cluster} cluster` : "Integrity Session";
}

function labelForOutput(type: IntegrityOutput["output_type"]) {
  const labels = {
    memory_candidate: "Memory",
    canon_candidate: "Canon",
    preference: "Tone",
    boundary: "Boundary",
    theme: "Theme",
  };
  return labels[type];
}

function acceptedCount(session: HistorySession) {
  return (session.integrity_session_outputs ?? []).filter((output) => output.status === "accepted" || output.status === "edited").length;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const fieldLabel = {
  display: "block",
  color: "#9ca3af",
  fontSize: 12,
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  border: "1px solid #334155",
  borderRadius: 8,
  background: "#0d1420",
  color: "#f8fafc",
  padding: "10px 11px",
  marginTop: 7,
};

const clusterRow = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  border: "1px solid #253044",
  borderRadius: 8,
  background: "#0c1320",
  padding: 10,
  color: "#d1d5db",
  fontSize: 13,
} as const;
