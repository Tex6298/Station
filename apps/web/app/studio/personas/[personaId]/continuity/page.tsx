"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ContinuityTimeline } from "@/components/studio/continuity-timeline";
import {
  ContinuityCards,
  PersonaWorkspaceHeader,
  type PersonaWithContinuity,
} from "@/components/studio/persona-workspace";
import { RuntimeContextPreview } from "@/components/studio/runtime-context-preview";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

export default function PersonaContinuityPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [persona, setPersona] = useState<PersonaWithContinuity | null>(null);
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
        const data = await apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token);
        if (!cancelled) setPersona(data.persona);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load continuity.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [personaId]);

  async function refreshPersona() {
    const session = await getSession();
    if (!session) return;
    const data = await apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token);
    setPersona(data.persona);
  }

  if (loading) return <StudioMessage>Loading continuity...</StudioMessage>;
  if (error && !persona) return <StudioMessage tone="error">{error}</StudioMessage>;
  if (!persona) return <StudioMessage tone="error">Persona not found.</StudioMessage>;

  return (
    <main className="container studio-workspace">
      <PersonaWorkspaceHeader persona={persona} />
      <ContinuityCards persona={persona} />
      <ContinuityTrustOverview persona={persona} />
      <RuntimeContextPreview
        personaId={persona.id}
        subtitle="Runtime Continuity"
        title="Continuity records in runtime context"
        showCompiledPrompt={false}
        showSourceContent={false}
      />
      <ContinuityTimeline personaId={persona.id} personaName={persona.name} onRecordCreated={refreshPersona} />
    </main>
  );
}

function ContinuityTrustOverview({ persona }: { persona: PersonaWithContinuity }) {
  const continuity = persona.continuity ?? {
    memoryCount: 0,
    canonCount: 0,
    archiveFileCount: 0,
    archivedChatCount: 0,
    continuityCandidateCount: 0,
    continuityRecordCount: 0,
    integritySessionCount: 0,
  };
  const archiveTotal = (continuity.archiveFileCount ?? 0) + (continuity.archivedChatCount ?? 0);
  const rows = [
    { label: "Continuity records", value: continuity.continuityRecordCount ?? 0, body: "Owner-created markers available to runtime context." },
    { label: "Candidates", value: continuity.continuityCandidateCount ?? 0, body: "Conversation-derived material still waiting for review." },
    { label: "Integrity sessions", value: continuity.integritySessionCount ?? 0, body: "Structured checks that may feed continuity." },
    { label: "Memory", value: continuity.memoryCount ?? 0, body: "Recall material, separate from timeline records." },
    { label: "Canon", value: continuity.canonCount ?? 0, body: "Higher-priority facts and commitments." },
    { label: "Archive sources", value: archiveTotal, body: "Files and archived chats remain private source material." },
  ];

  return (
    <section className="studio-list-panel" style={{ marginBottom: "1rem" }}>
      <div className="studio-section-heading">
        <div className="section-label">Continuity Trust</div>
        <h2>What feeds persona continuity</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
        {rows.map((row) => (
          <article key={row.label} className="studio-item-card studio-continuity-trust-card" style={{ minHeight: 120 }}>
            <h3 className="studio-continuity-trust-value" style={{ marginBottom: "0.25rem" }}>{row.value}</h3>
            <p className="studio-continuity-trust-label" style={{ margin: 0 }}>{row.label}</p>
            <p className="studio-continuity-trust-body" style={{ margin: "0.35rem 0 0" }}>{row.body}</p>
          </article>
        ))}
      </div>
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
