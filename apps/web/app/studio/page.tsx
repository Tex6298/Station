"use client";

import { useEffect, useState } from "react";
import { StudioDashboard } from "@/components/studio/studio-dashboard";
import type { IntegrityDuePersona } from "@/components/studio/studio-dashboard";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import type { PersonaSummary } from "@station/types/persona";

export default function StudioPage() {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [integrityDue, setIntegrityDue] = useState<IntegrityDuePersona[]>([]);
  const [integrityAvailable, setIntegrityAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) {
        setSignedIn(false);
        setLoading(false);
        return;
      }

      setSignedIn(true);
      try {
        const [data, dueResult] = await Promise.all([
          apiGet<{ personas: PersonaSummary[] }>("/personas", session.access_token),
          apiGet<{ personas: IntegrityDuePersona[] }>("/integrity/due", session.access_token)
            .then((dueData) => ({ dueData, available: true }))
            .catch(() => ({ dueData: { personas: [] }, available: false })),
        ]);
        setPersonas(data.personas ?? []);
        setIntegrityDue(dueResult.dueData.personas ?? []);
        setIntegrityAvailable(dueResult.available);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load Studio.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  return (
    <StudioDashboard
      personas={personas}
      integrityDue={integrityDue}
      integrityAvailable={integrityAvailable}
      loading={loading}
      error={error}
      signedIn={signedIn}
    />
  );
}
