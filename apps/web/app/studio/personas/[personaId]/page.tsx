"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import { PersonaChat } from "@/components/studio/persona-chat";
import {
  ContinuityCards,
  PersonaWorkspaceHeader,
  type PersonaWithContinuity,
} from "@/components/studio/persona-workspace";

export default function PersonaPage() {
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

  if (loading) {
    return <StudioMessage>Loading persona workspace...</StudioMessage>;
  }

  if (error || !persona) {
    return <StudioMessage tone="error">{error ?? "Persona not found."}</StudioMessage>;
  }

  return (
    <main className="container studio-workspace">
      <div className="studio-breadcrumb">
        <Link href="/studio">Studio</Link>
        <span>/</span>
        <span>{persona.name}</span>
      </div>

      <PersonaWorkspaceHeader persona={persona} />
      <ContinuityCards persona={persona} />

      <section className="studio-home-grid">
        <div className="studio-home-main">
          <div className="studio-section-heading">
            <div className="section-label">Private Chat</div>
            <h2>Work with {persona.name}</h2>
          </div>
          <PersonaChat personaId={persona.id} personaName={persona.name} />
        </div>

        <aside className="studio-context-panel">
          <div className="section-label">Continuity Brief</div>
          <p>{persona.longDescription || persona.awakeningPrompt || "This persona does not have a long-form continuity brief yet."}</p>
          {persona.styleNotes && (
            <>
              <div className="section-label">Style Notes</div>
              <p>{persona.styleNotes}</p>
            </>
          )}
          <Link className="button" href={`/studio/personas/${persona.id}/calibration`}>
            Run Integrity Session
          </Link>
        </aside>
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
