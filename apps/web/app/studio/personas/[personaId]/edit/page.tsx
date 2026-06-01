"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PersonaManagement } from "@/components/studio/persona-management";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import type { Persona } from "@station/types/persona";

export default function PersonaEditPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!personaId) return;

    getSession().then(async (session) => {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiGet<{ persona: Persona }>(`/personas/${personaId}`, session.access_token);
        setPersona(data.persona);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load persona management.");
      } finally {
        setLoading(false);
      }
    });
  }, [personaId]);

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#555" }}>
          Loading persona management...
        </div>
      </main>
    );
  }

  if (error || !persona) {
    return (
      <main style={{ padding: 24 }}>
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>
          {error ?? "Persona not found."}
        </div>
      </main>
    );
  }

  return <PersonaManagement persona={persona} personaId={personaId} />;
}
