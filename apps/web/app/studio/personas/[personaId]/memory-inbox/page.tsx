"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ContinuityCandidate } from "@station/types/persona";
import { getSession } from "@/lib/auth";
import { apiGet } from "@/lib/api-client";
import { continuityCandidateInboxPath } from "@/lib/import-review";
import { ImportReviewInbox } from "@/components/studio/import-review-inbox";

const MEMORY_INBOX_COPY = {
  eyebrow: "Memory Inbox",
  title: "Memory and Canon suggestions",
  description:
    "Review suggestions from archived conversations and imports before they become Memory or Canon. Accept writes edited text; reject keeps the private source preserved.",
  emptyState:
    "No Memory or Canon suggestions are waiting. New suggestions can arrive from imports or archived conversations.",
};

export default function PersonaMemoryInboxPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<ContinuityCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCandidates = useCallback(async () => {
    if (!personaId) return;

    setLoading(true);
    setError(null);
    try {
      const session = await getSession();
      if (!session) {
        setToken(null);
        setCandidates([]);
        return;
      }

      setToken(session.access_token);
      const data = await apiGet<{ candidates: ContinuityCandidate[] }>(
        continuityCandidateInboxPath(personaId),
        session.access_token,
      );
      setCandidates(data.candidates ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load Memory inbox.");
    } finally {
      setLoading(false);
    }
  }, [personaId]);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  async function handleCandidateUpdated(candidate: ContinuityCandidate) {
    setCandidates((current) => current.filter((item) => item.id !== candidate.id));
  }

  if (loading) {
    return <StudioMessage>Loading Memory inbox...</StudioMessage>;
  }

  if (!token) {
    return <StudioMessage tone="error">Sign in to review owner-only Memory and Canon candidates.</StudioMessage>;
  }

  if (error) {
    return <StudioMessage tone="error">{error}</StudioMessage>;
  }

  return (
    <main className="container studio-workspace">
      <div className="studio-breadcrumb">
        <Link href="/studio">Studio</Link>
        <span>/</span>
        <Link href={`/studio/personas/${personaId}`}>Persona home</Link>
        <span>/</span>
        <span>Memory Inbox</span>
      </div>

      <section className="studio-runtime-preview">
        <div className="studio-section-heading">
          <div className="section-label">Owner Review</div>
          <h2>Memory inbox</h2>
          <p>Private suggestions stay pending until you accept edited text into Memory or Canon.</p>
        </div>
        <nav className="studio-companion-shortcuts" aria-label="Memory inbox workspace links">
          <Link href={`/studio/personas/${personaId}`} className="studio-companion-shortcut">
            <span>Home</span>
            <small>Companion chat</small>
          </Link>
          <Link href={`/studio/personas/${personaId}/memory`} className="studio-companion-shortcut">
            <span>Memory</span>
            <small>Saved context</small>
          </Link>
          <Link href={`/studio/personas/${personaId}/continuity`} className="studio-companion-shortcut">
            <span>Timeline</span>
            <small>Continuity records</small>
          </Link>
          <Link href={`/studio/personas/${personaId}/calibration`} className="studio-companion-shortcut">
            <span>Integrity</span>
            <small>Guided checks</small>
          </Link>
        </nav>
      </section>

      <ImportReviewInbox
        candidates={candidates}
        token={token}
        sourceCount={candidates.length}
        onCandidateUpdated={handleCandidateUpdated}
        copy={MEMORY_INBOX_COPY}
        scope="continuity"
      />
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
