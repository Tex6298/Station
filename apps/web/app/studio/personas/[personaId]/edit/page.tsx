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
  | { status: "ready"; personaId: string; persona: Persona; accessToken: string };

export default function PersonaEditPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;
    if (!personaId) {
      setState({ status: "unavailable" });
      return;
    }
    setState({ status: "loading" });

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
          const data = await apiGet<{ persona?: unknown }>(`/personas/${personaId}`, accessToken);
          if (!mounted) return;
          if (!isOwnedPersonaForRoute(data.persona, personaId, userId)) {
            setState({ status: "unavailable" });
            return;
          }
          setState({ status: "ready", personaId, persona: data.persona, accessToken });
        } catch {
          if (mounted) setState({ status: "unavailable" });
        }
      })
      .catch(() => {
        if (mounted) setState({ status: "unavailable" });
      });

    return () => {
      mounted = false;
    };
  }, [personaId]);

  if (state.status === "loading" || (state.status === "ready" && state.personaId !== personaId)) {
    return (
      <main className="persona-profile-page">
        <div className="persona-profile-shell">
          <section className="persona-profile-unavailable" aria-busy="true" aria-live="polite" role="status">
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
          <section className="persona-profile-unavailable" role="alert">
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
      key={state.personaId}
      persona={state.persona}
      personaId={state.personaId}
      accessToken={state.accessToken}
    />
  );
}

function isOwnedPersonaForRoute(
  value: unknown,
  expectedPersonaId: string,
  expectedOwnerUserId: string,
): value is Persona {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return candidate.id === expectedPersonaId
    && candidate.ownerUserId === expectedOwnerUserId
    && typeof candidate.name === "string"
    && candidate.name.trim().length > 0
    && (candidate.visibility === "private" || candidate.visibility === "public")
    && ["platform", "openai", "anthropic", "deepseek", "gemini"].includes(String(candidate.provider))
    && nullableString(candidate.shortDescription)
    && nullableString(candidate.longDescription)
    && nullableString(candidate.avatarUrl)
    && typeof candidate.publicChatEnabled === "boolean"
    && typeof candidate.publicAnonymousChatEnabled === "boolean"
    && isContinuitySummary(candidate.continuity);
}

function isContinuitySummary(value: unknown) {
  if (!isRecord(value)) return false;
  return [
    "memoryCount",
    "canonCount",
    "archiveFileCount",
    "archivedChatCount",
    "continuityCandidateCount",
    "continuityRecordCount",
    "integritySessionCount",
  ].every((key) => isCount(value[key]));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nullableString(value: unknown) {
  return value === null || typeof value === "string";
}

function isCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
