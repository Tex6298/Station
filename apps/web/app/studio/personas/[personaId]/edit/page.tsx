"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PersonaManagement } from "@/components/studio/persona-management";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import type { Persona } from "@station/types/persona";

type LoadState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "ready"; persona: Persona; accessToken: string };

export default function PersonaEditPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;
    if (!personaId) {
      setState({ status: "unavailable" });
      return;
    }

    getSession()
      .then(async (session) => {
        if (!mounted) return;
        const accessToken = session?.accessToken ?? session?.access_token;
        const userId = session?.user?.id;
        if (!accessToken || !userId) {
          setState({ status: "unavailable" });
          return;
        }

        try {
          const data = await apiGet<{ persona?: Persona }>(`/personas/${personaId}`, accessToken);
          if (!data.persona?.ownerUserId || data.persona.ownerUserId !== userId) {
            setState({ status: "unavailable" });
            return;
          }
          setState({ status: "ready", persona: data.persona, accessToken });
        } catch {
          setState({ status: "unavailable" });
        }
      })
      .catch(() => {
        if (mounted) setState({ status: "unavailable" });
      });

    return () => {
      mounted = false;
    };
  }, [personaId]);

  if (state.status === "loading") {
    return (
      <main className="persona-profile-page">
        <div className="persona-profile-shell">
          <section className="persona-profile-unavailable" aria-busy="true">
            Loading Persona Profile...
          </section>
        </div>
      </main>
    );
  }

  if (state.status === "unavailable") {
    return (
      <main className="persona-profile-page">
        <div className="persona-profile-shell">
          <section className="persona-profile-unavailable">
            <h1>Persona Profile unavailable</h1>
            <p>Station could not load this owner-only profile. Return to Studio and try again.</p>
            <Link className="persona-profile-button persona-profile-button-secondary" href="/studio">
              Back to Studio
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <PersonaManagement
      persona={state.persona}
      personaId={personaId}
      accessToken={state.accessToken}
    />
  );
}
