"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import {
  mergeRecentConversations,
  type PersonaConversationSummary,
  type RecentConversationEntry,
} from "@/lib/persona-conversations";
import type { PersonaSummary } from "@station/types/persona";

export function useRecentConversations(
  personas: Array<Pick<PersonaSummary, "id" | "name">>,
  accessToken: string | null | undefined,
  limit = 6,
) {
  const [entries, setEntries] = useState<RecentConversationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const personaKey = personas.map((persona) => persona.id).join(",");

  useEffect(() => {
    let cancelled = false;
    if (!accessToken || personas.length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      personas.map((persona) =>
        apiGet<{ conversations: PersonaConversationSummary[] }>(`/conversations/persona/${persona.id}`, accessToken)
          .then((data) => ({ persona, conversations: data.conversations ?? [] }))
          .catch(() => ({ persona, conversations: [] as PersonaConversationSummary[] })),
      ),
    ).then((groups) => {
      if (cancelled) return;
      setEntries(mergeRecentConversations(groups, limit));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaKey, accessToken, limit]);

  return { entries, loading };
}
