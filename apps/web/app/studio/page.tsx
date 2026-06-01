"use client";

import { useEffect, useState } from "react";
import { StudioDashboard } from "@/components/studio/studio-dashboard";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import type { PersonaSummary } from "@station/types/persona";

export default function StudioPage() {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
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
        const data = await apiGet<{ personas: PersonaSummary[] }>("/personas", session.access_token);
        setPersonas(data.personas ?? []);
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
      loading={loading}
      error={error}
      signedIn={signedIn}
    />
  );
}
