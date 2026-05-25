"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  PersonaWorkspaceHeader,
  type PersonaWithContinuity,
} from "@/components/studio/persona-workspace";

interface CalibrationPrompt {
  key: string;
  prompt: string;
  hint?: string;
}

interface IntegritySession {
  id: string;
  personaId: string | null;
  sessionTitle: string | null;
  transcript: string;
  extractedStyleNotes: string | null;
  extractedPublicRules: string | null;
  extractedPrivateRules: string | null;
  extractedUncertaintyRules: string | null;
  saveTarget: "persona" | "global" | "public_mode" | "other";
  createdAt: string;
  updatedAt: string;
}

export default function PersonaCalibrationPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [persona, setPersona] = useState<PersonaWithContinuity | null>(null);
  const [sessions, setSessions] = useState<IntegritySession[]>([]);
  const [prompts, setPrompts] = useState<CalibrationPrompt[]>([]);
  const [active, setActive] = useState<IntegritySession | null>(null);
  const [nextPrompt, setNextPrompt] = useState<CalibrationPrompt | null>(null);
  const [answer, setAnswer] = useState("");
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
        setToken(session.access_token);
        const [personaData, sessionData] = await Promise.all([
          apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token),
          apiGet<{ sessions: IntegritySession[]; prompts: CalibrationPrompt[] }>(`/calibration/persona/${personaId}`, session.access_token),
        ]);
        if (cancelled) return;
        setPersona(personaData.persona);
        setSessions(sessionData.sessions ?? []);
        setPrompts(sessionData.prompts ?? []);
        const latest = sessionData.sessions?.[0] ?? null;
        setActive(latest);
        setNextPrompt(latest ? pickNextPrompt(latest.transcript, sessionData.prompts ?? []) : (sessionData.prompts?.[0] ?? null));
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

  const extracted = useMemo(() => {
    if (!active) return [];
    return [
      ["Style", active.extractedStyleNotes],
      ["Public mode", active.extractedPublicRules],
      ["Private mode", active.extractedPrivateRules],
      ["Uncertainty", active.extractedUncertaintyRules],
    ].filter(([, value]) => Boolean(value));
  }, [active]);

  async function startSession() {
    if (!token || !persona) return;
    setSaving(true);
    setError(null);
    try {
      const response = await apiPost<{ session: IntegritySession; prompts: CalibrationPrompt[]; nextPrompt: CalibrationPrompt }>(
        "/calibration/start",
        { personaId: persona.id, sessionTitle: `${persona.name} integrity session` },
        token
      );
      setSessions((current) => [response.session, ...current]);
      setPrompts(response.prompts ?? prompts);
      setActive(response.session);
      setNextPrompt(response.nextPrompt ?? response.prompts?.[0] ?? null);
      setAnswer("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start session.");
    } finally {
      setSaving(false);
    }
  }

  async function answerPrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !active || !answer.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const response = await apiPost<{ session: IntegritySession; nextPrompt: CalibrationPrompt }>(
        `/calibration/${active.id}/message`,
        { content: answer },
        token
      );
      setActive(response.session);
      setNextPrompt(response.nextPrompt);
      setSessions((current) => [response.session, ...current.filter((session) => session.id !== response.session.id)]);
      setAnswer("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save answer.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSession(saveTarget: IntegritySession["saveTarget"]) {
    if (!token || !active) return;
    setSaving(true);
    setError(null);
    try {
      const response = await apiPost<{ session: IntegritySession; saved: boolean }>(
        `/calibration/${active.id}/save`,
        { saveTarget },
        token
      );
      setActive(response.session);
      setSessions((current) => [response.session, ...current.filter((session) => session.id !== response.session.id)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save session.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <StudioMessage>Loading Integrity Sessions...</StudioMessage>;
  if (error && !persona) return <StudioMessage tone="error">{error}</StudioMessage>;
  if (!persona) return <StudioMessage tone="error">Persona not found.</StudioMessage>;

  return (
    <main className="container studio-workspace">
      <PersonaWorkspaceHeader persona={persona} />
      {error && <div className="space-form-error">{error}</div>}

      <section className="studio-two-column">
        <form className="studio-editor-panel" onSubmit={answerPrompt}>
          <div className="studio-section-heading">
            <div className="section-label">Integrity Session</div>
            <h2>{active?.sessionTitle || "No active session"}</h2>
          </div>

          {!active ? (
            <button className="button primary" type="button" onClick={startSession} disabled={saving}>
              {saving ? "Starting..." : "Start Integrity Session"}
            </button>
          ) : (
            <>
              <div className="studio-prompt-box">
                <strong>{nextPrompt?.prompt ?? prompts[0]?.prompt ?? "Describe how this persona should stay coherent."}</strong>
                {nextPrompt?.hint && <p>{nextPrompt.hint}</p>}
              </div>
              <textarea className="textarea" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer in the owner's private voice." style={{ minHeight: 180 }} required />
              <button className="button primary" type="submit" disabled={saving || !answer.trim()}>
                {saving ? "Saving..." : "Save Answer"}
              </button>
              <div className="studio-session-actions">
                <button className="button" type="button" onClick={() => saveSession("persona")} disabled={saving}>Apply to Persona</button>
                <button className="button" type="button" onClick={() => saveSession("public_mode")} disabled={saving}>Save Public Rules</button>
              </div>
            </>
          )}
        </form>

        <section className="studio-list-panel">
          <div className="studio-section-heading">
            <div className="section-label">Extracted Continuity</div>
            <h2>{sessions.length} sessions</h2>
          </div>

          {active && (
            <div className="studio-item-card">
              <div>
                <span>Active / {active.saveTarget}</span>
                <time>{formatDate(active.updatedAt)}</time>
              </div>
              <h3>{active.sessionTitle || "Integrity session"}</h3>
              <p>{active.transcript || "Answer prompts to build the transcript."}</p>
            </div>
          )}

          <div className="studio-item-list">
            {extracted.length === 0 && <div className="studio-empty">No extracted rules yet.</div>}
            {extracted.map(([label, value]) => (
              <article key={label} className="studio-item-card">
                <div><span>{label}</span></div>
                <p>{value}</p>
              </article>
            ))}
            {sessions.filter((session) => session.id !== active?.id).map((session) => (
              <button key={session.id} type="button" className="studio-session-row" onClick={() => {
                setActive(session);
                setNextPrompt(pickNextPrompt(session.transcript, prompts));
              }}>
                <strong>{session.sessionTitle || "Integrity session"}</strong>
                <span>{formatDate(session.updatedAt)}</span>
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
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

function pickNextPrompt(transcript: string, prompts: CalibrationPrompt[]) {
  if (prompts.length === 0) return null;
  const answered = (transcript.match(/Q:/g) || []).length;
  return prompts[answered % prompts.length];
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
