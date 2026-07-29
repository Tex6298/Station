"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import {
  mergeRecentConversations,
  personaConversationsPath,
  uniqueRecentConversationPersonas,
  type PersonaConversationSummary,
  type RecentConversationEntry,
} from "@/lib/persona-conversations";
import type { PersonaSummary } from "@station/types/persona";

export interface RecentConversationsState {
  entries: RecentConversationEntry[];
  loading: boolean;
  error: string | null;
}

export function useRecentConversations(
  personas: Array<Pick<PersonaSummary, "id" | "name">>,
  accessToken: string | null | undefined,
  limit = 6,
): RecentConversationsState {
  const [entries, setEntries] = useState<RecentConversationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const personaKey = personas.map((persona) => `${persona.id}:${persona.name}`).join(",");

  useEffect(() => {
    let cancelled = false;
    if (!accessToken || personas.length === 0) {
      setEntries([]);
      setLoading(false);
      setError(null);
      return;
    }

    const requestPersonas = uniqueRecentConversationPersonas(personas);
    setEntries([]);
    setLoading(true);
    setError(null);
    Promise.all(
      requestPersonas.map((persona) =>
        apiGet<{ conversations: PersonaConversationSummary[] }>(personaConversationsPath(persona.id), accessToken)
          .then((data) => ({ persona, conversations: data.conversations ?? [], failed: false }))
          .catch(() => ({ persona, conversations: [] as PersonaConversationSummary[], failed: true })),
      ),
    ).then((groups) => {
      if (cancelled) return;
      setEntries(mergeRecentConversations(groups, limit));
      const failedCount = groups.filter((group) => group.failed).length;
      setError(
        failedCount === groups.length
          ? "Recent conversations are temporarily unavailable."
          : failedCount > 0
            ? "Some recent conversations could not be loaded."
            : null,
      );
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaKey, accessToken, limit]);

  return { entries, loading, error };
}
