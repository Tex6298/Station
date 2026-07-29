"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { useRecentConversations } from "@/lib/use-recent-conversations";
import type { RecentConversationEntry } from "@/lib/persona-conversations";
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
  recentConversations: RecentConversationEntry[];
  recentConversationsLoading: boolean;
  recentConversationsError: string | null;
}

type StudioWorkspaceLoadState = Omit<
  StudioWorkspaceState,
  "recentConversations" | "recentConversationsLoading" | "recentConversationsError"
>;

const StudioWorkspaceContext = createContext<StudioWorkspaceState | null>(null);

function useStudioWorkspaceLoad(): StudioWorkspaceLoadState {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [integrityDue, setIntegrityDue] = useState<IntegrityDuePersona[]>([]);
  const [integrityAvailable, setIntegrityAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      try {
        const session = await getSession();
        if (cancelled) return;
        if (!session) {
          setSignedIn(false);
          setAccessToken(null);
          return;
        }

        setSignedIn(true);
        setAccessToken(session.accessToken);
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
      } catch {
        if (!cancelled) setError("Could not load Studio. Try again in a moment.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadWorkspace();
    return () => {
      cancelled = true;
    };
  }, []);

  return { personas, integrityDue, integrityAvailable, loading, error, signedIn, accessToken };
}

export function StudioWorkspaceProvider({ children }: { children: ReactNode }) {
  const workspace = useStudioWorkspaceLoad();
  const recent = useRecentConversations(workspace.personas, workspace.accessToken, 6);
  const value = useMemo<StudioWorkspaceState>(() => ({
    ...workspace,
    recentConversations: recent.entries,
    recentConversationsLoading: recent.loading,
    recentConversationsError: recent.error,
  }), [workspace, recent.entries, recent.error, recent.loading]);

  return (
    <StudioWorkspaceContext.Provider value={value}>
      {children}
    </StudioWorkspaceContext.Provider>
  );
}

export function useStudioWorkspace(): StudioWorkspaceState {
  const workspace = useContext(StudioWorkspaceContext);
  if (!workspace) {
    throw new Error("useStudioWorkspace must be used within StudioWorkspaceProvider");
  }
  return workspace;
}
