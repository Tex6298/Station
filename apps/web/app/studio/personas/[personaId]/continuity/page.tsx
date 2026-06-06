"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ContinuityTimeline } from "@/components/studio/continuity-timeline";
import {
  ContinuityCards,
  PersonaWorkspaceHeader,
  type PersonaWithContinuity,
} from "@/components/studio/persona-workspace";
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

  if (loading) return <StudioMessage>Loading continuity...</StudioMessage>;
  if (error && !persona) return <StudioMessage tone="error">{error}</StudioMessage>;
  if (!persona) return <StudioMessage tone="error">Persona not found.</StudioMessage>;

  return (
    <main className="container studio-workspace">
      <PersonaWorkspaceHeader persona={persona} />
      <ContinuityCards persona={persona} />
      <ContinuityTimeline personaId={persona.id} personaName={persona.name} />
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
