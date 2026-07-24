"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import type { IntegrityDuePersona } from "@/lib/studio-navigation";
import type { PersonaSummary } from "@station/types/persona";

export interface StudioWorkspaceState {
  personas: PersonaSummary[];
  integrityDue: IntegrityDuePersona[];
  integrityAvailable: boolean;
  loading: boolean;
  error: string | null;
  signedIn: boolean;
  accessToken: string | null;
}

export function useStudioWorkspace(): StudioWorkspaceState {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [integrityDue, setIntegrityDue] = useState<IntegrityDuePersona[]>([]);
  const [integrityAvailable, setIntegrityAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getSession().then(async (session) => {
      if (cancelled) return;
      if (!session) {
        setSignedIn(false);
        setLoading(false);
        return;
      }

      setSignedIn(true);
      setAccessToken(session.accessToken);
      try {
        const [data, dueResult] = await Promise.all([
          apiGet<{ personas: PersonaSummary[] }>("/personas", session.accessToken),
          apiGet<{ personas: IntegrityDuePersona[] }>("/integrity/due", session.accessToken)
            .then((dueData) => ({ dueData, available: true }))
            .catch(() => ({ dueData: { personas: [] }, available: false })),
        ]);
        if (cancelled) return;
        setPersonas(data.personas ?? []);
        setIntegrityDue(dueResult.dueData.personas ?? []);
        setIntegrityAvailable(dueResult.available);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load Studio.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { personas, integrityDue, integrityAvailable, loading, error, signedIn, accessToken };
}
