"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ContinuityTimeline } from "@/components/studio/continuity-timeline";
import {
  ContinuityCards,
  PersonaWorkspaceHeader,
  type PersonaWithContinuity,
} from "@/components/studio/persona-workspace";
import { RuntimeContextPreview } from "@/components/studio/runtime-context-preview";
import {
  buildRuntimeProvenanceReadback,
  continuityReviewTargetHref,
  type RuntimeContextPreviewLike,
} from "@/lib/continuity-ui";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

const RUNTIME_PROVENANCE_QUERY = "What should this persona keep steady right now?";

export default function PersonaContinuityPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [persona, setPersona] = useState<PersonaWithContinuity | null>(null);
  const [runtimeProvenance, setRuntimeProvenance] = useState<RuntimeContextPreviewLike | null>(null);
  const [runtimeProvenanceError, setRuntimeProvenanceError] = useState<string | null>(null);
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
        const [data, provenance] = await Promise.all([
          apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token),
          fetchRuntimeProvenance(session.access_token, personaId),
        ]);
        if (!cancelled) {
          setPersona(data.persona);
          setRuntimeProvenance(provenance.context);
          setRuntimeProvenanceError(provenance.error);
        }
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
    const [data, provenance] = await Promise.all([
      apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token),
      fetchRuntimeProvenance(session.access_token, personaId),
    ]);
    setPersona(data.persona);
    setRuntimeProvenance(provenance.context);
    setRuntimeProvenanceError(provenance.error);
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
      <RuntimeProvenanceReadback personaId={persona.id} preview={runtimeProvenance} error={runtimeProvenanceError} />
      <ContinuityTimeline personaId={persona.id} personaName={persona.name} onRecordCreated={refreshPersona} />
    </main>
  );
}

async function fetchRuntimeProvenance(sessionToken: string, personaId: string) {
  try {
    const data = await apiGet<{ context: RuntimeContextPreviewLike }>(
      `/conversations/persona/${personaId}/context-preview?query=${encodeURIComponent(RUNTIME_PROVENANCE_QUERY)}`,
      sessionToken,
    );
    return { context: data.context, error: null };
  } catch (e) {
    return {
      context: null,
      error: e instanceof Error ? e.message : "Could not load runtime provenance.",
    };
  }
}

function RuntimeProvenanceReadback({
  personaId,
  preview,
  error,
}: {
  personaId: string;
  preview: RuntimeContextPreviewLike | null;
  error: string | null;
}) {
  const groups = buildRuntimeProvenanceReadback(preview);
  const selectedTotal = groups.reduce((total, group) => total + group.count, 0);

  return (
    <section className="studio-list-panel" aria-label="Runtime provenance" style={{ marginBottom: "1rem" }}>
      <div className="studio-section-heading">
        <div className="section-label">Runtime provenance</div>
        <h2>Where selected context came from</h2>
      </div>
      <p className="studio-continuity-trust-body" style={{ margin: "0 0 1rem" }}>
        This owner-only readback shows source groups, sanitized reasons, and the surface to review next. Source bodies and compiled prompts stay hidden here.
      </p>
      {error ? <div className="space-form-error">{error}</div> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "0.75rem" }}>
        {groups.map((group) => (
          <article key={group.type} className="studio-item-card studio-continuity-trust-card" style={{ minHeight: 180 }}>
            <div>
              <span>{group.label}</span>
              <strong>{group.count}</strong>
            </div>
            <ReviewTargetLink personaId={personaId} label={group.reviewTarget} className="studio-continuity-trust-label" />
            <div style={{ display: "grid", gap: "0.55rem", marginTop: "0.75rem" }}>
              {group.rows.length === 0 ? (
                <p className="studio-continuity-trust-body" style={{ margin: 0 }}>{group.empty}</p>
              ) : (
                group.rows.slice(0, 3).map((row) => (
                  <div key={`${group.type}-${row.title}-${row.reason}`} className="studio-runtime-source">
                    <div>
                      <strong>{row.title}</strong>
                      <span>{row.sourceLabel} / {row.reason}</span>
                    </div>
                  </div>
                ))
              )}
              {group.rows.length > 3 ? (
                <p className="studio-continuity-trust-body" style={{ margin: 0 }}>{group.rows.length - 3} more selected sources in this group.</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      {selectedTotal === 0 && !error ? (
        <div className="studio-empty" style={{ marginTop: "0.75rem" }}>
          Runtime preview returned no selected provenance. Existing Continuity, Memory, and Archive material remains owner-only.
        </div>
      ) : null}
    </section>
  );
}

function ReviewTargetLink({ personaId, label, className }: { personaId: string; label: string; className?: string }) {
  const href = continuityReviewTargetHref(personaId, label);
  const style: CSSProperties = {
    display: "inline-flex",
    margin: "0.35rem 0 0",
    color: "#e0f2fe",
    fontWeight: 820,
    overflowWrap: "anywhere",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  };
  if (!href) return <p className={className} style={{ ...style, textDecoration: "none" }}>{label}</p>;

  return (
    <Link href={href} className={className} style={style}>
      {label}
    </Link>
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
