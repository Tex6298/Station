"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DeveloperSpaceRecord } from "@station/types/developer-space";
import type { PersonaSummary } from "@station/types/persona";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { firstSpacePublishingGuide, onboardingPathCards, onboardingPathStatusTone, type OnboardingPathState } from "@/lib/onboarding-paths";
import {
  StudioEmptyState,
  StudioErrorState,
  StudioFrame,
  StudioPanel,
  StudioStatusBadge,
} from "@/components/studio/studio-frame";

type PersonaFileRead = { id: string };
type ImportJobRead = { id: string };
type ImportCandidateRead = { id: string; status?: string | null };

export default function StudioOnboardingPage() {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [pathState, setPathState] = useState<OnboardingPathState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    getSession().then(async (session) => {
      if (!mounted) return;
      if (!session) {
        setSignedIn(false);
        setLoading(false);
        return;
      }

      setSignedIn(true);
      try {
        const [personaData, developerSpaceData] = await Promise.all([
          apiGet<{ personas: PersonaSummary[] }>("/personas", session.access_token),
          apiGet<{ spaces: DeveloperSpaceRecord[] }>("/developer-spaces", session.access_token).catch(() => ({ spaces: [] })),
        ]);
        const nextPersonas = personaData.personas ?? [];
        const nextPathState = await loadOnboardingPathState(nextPersonas, developerSpaceData.spaces ?? [], session.access_token);
        if (mounted) {
          setPersonas(nextPersonas);
          setPathState(nextPathState);
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Could not load onboarding paths.");
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const cards = onboardingPathCards(personas, pathState);
  const publishingGuide = firstSpacePublishingGuide();

  return (
    <StudioFrame
      eyebrow="Station Alpha"
      title="Choose an entry path"
      description="Fresh Start, Awakening, Document Migrator, and API Bridge are exposed here with their current alpha truth."
      actions={<Link href="/studio" style={secondaryButton}>Back to Studio</Link>}
    >
      {loading ? (
        <StudioPanel>
          <StudioEmptyState>Loading onboarding paths...</StudioEmptyState>
        </StudioPanel>
      ) : !signedIn ? (
        <StudioPanel className="studio-auth-panel">
          <h2 style={heading}>Sign in to choose a path</h2>
          <p style={copy}>These paths create or open owner-scoped Studio material.</p>
          <div style={actionRow}>
            <Link href="/login" style={primaryButton}>Sign In</Link>
            <Link href="/signup" style={secondaryButton}>Join Station</Link>
          </div>
        </StudioPanel>
      ) : error ? (
        <StudioErrorState>{error}</StudioErrorState>
      ) : (
        <>
          <section className="onboarding-path-grid" aria-label="Station onboarding paths">
            {cards.map((card) => (
              <article key={card.id} className="onboarding-path-panel">
                <div style={pathHeader}>
                  <StudioStatusBadge tone={onboardingPathStatusTone(card.status)}>
                    {card.statusLabel}
                  </StudioStatusBadge>
                  <span style={pathIndex}>{card.id.replace("-", " ")}</span>
                </div>
                <h2 style={pathTitle}>{card.title}</h2>
                <p style={copy}>{card.summary}</p>
                <div style={stepBox}>
                  <strong>First step</strong>
                  <span>{card.firstStep}</span>
                </div>
                <div style={stepBox}>
                  <strong>Private boundary</strong>
                  <span>{card.privacy}</span>
                </div>
                <p style={truthCopy}>{card.truth}</p>
                <div style={routeList} aria-label={`${card.title} routes`}>
                  {card.supportingRoutes.map((route) => (
                    <code key={route} style={routeToken}>{route}</code>
                  ))}
                </div>
                <div style={actionRow}>
                  <Link href={card.route} style={primaryButton}>{card.actionLabel}</Link>
                  <Link href={`/studio/assistant?prompt=${encodeURIComponent(card.assistantPrompt)}`} style={secondaryButton}>
                    {card.assistantActionLabel}
                  </Link>
                </div>
              </article>
            ))}
          </section>

          <StudioPanel>
            <div className="studio-section-heading">
              <div className="section-label">Public step</div>
              <h2>{publishingGuide.title}</h2>
            </div>
            <p style={{ ...copy, maxWidth: 760 }}>{publishingGuide.summary}</p>
            <div style={publishingStepGrid} aria-label="First Space and publishing routes">
              {publishingGuide.steps.map((step) => (
                <Link key={step.href} href={step.href} style={publishingStepLink}>
                  <strong>{step.label}</strong>
                  <span>{step.detail}</span>
                  <code style={routeToken}>{step.href}</code>
                </Link>
              ))}
            </div>
            <p style={truthCopy}>{publishingGuide.boundary}</p>
            <div style={actionRow}>
              <Link href={`/studio/assistant?prompt=${encodeURIComponent(publishingGuide.assistantPrompt)}`} style={secondaryButton}>
                {publishingGuide.assistantActionLabel}
              </Link>
            </div>
          </StudioPanel>

          <StudioPanel>
            <div className="studio-section-heading">
              <div className="section-label">Current alpha boundary</div>
              <h2>What is intentionally not live here</h2>
            </div>
            <div className="onboarding-boundary-grid">
              {[
                "No live Reddit or Discord OAuth pulls.",
                "No recurring sync or external social import API.",
                "No Cloudflare retrieval, Redis memory truth, or production worker lane.",
                "No Stripe expansion or provider marketplace setup.",
              ].map((item) => (
                <div key={item} className="onboarding-boundary-item">{item}</div>
              ))}
            </div>
          </StudioPanel>
        </>
      )}
    </StudioFrame>
  );
}

async function loadOnboardingPathState(
  personas: PersonaSummary[],
  developerSpaces: DeveloperSpaceRecord[],
  token: string,
): Promise<OnboardingPathState> {
  const firstPersona = personas[0] ?? null;
  let archiveSourceCount: number | null = null;
  let pendingImportReviewCount: number | null = null;

  if (firstPersona) {
    const [filesData, jobsData, candidatesData] = await Promise.all([
      apiGet<{ files: PersonaFileRead[] }>(`/persona-files/persona/${firstPersona.id}`, token).catch(() => null),
      apiGet<{ jobs: ImportJobRead[] }>(`/imports/persona/${firstPersona.id}`, token).catch(() => null),
      apiGet<{ candidates: ImportCandidateRead[] }>(
        `/conversations/persona/${firstPersona.id}/candidates?source=import&status=all`,
        token,
      ).catch(() => null),
    ]);

    if (filesData && jobsData) {
      archiveSourceCount = (filesData.files ?? []).length + (jobsData.jobs ?? []).length;
    }
    if (candidatesData) {
      pendingImportReviewCount = (candidatesData.candidates ?? [])
        .filter((candidate) => candidate.status === "pending")
        .length;
    }
  }

  return {
    archiveSourceCount,
    pendingImportReviewCount,
    developerSpaces: developerSpaces.map((space) => ({
      id: space.id,
      projectName: space.projectName,
      slug: space.slug,
      apiKeyLastFour: space.apiKeyLastFour ?? null,
    })),
  };
}

const heading = {
  margin: "0 0 8px",
  color: "var(--station-page-text, #f8fafc)",
};

const copy = {
  margin: 0,
  color: "var(--station-page-muted, #a9b0bd)",
  fontSize: 14,
  lineHeight: 1.55,
};

const truthCopy = {
  ...copy,
  color: "var(--station-page-muted, #8ea0b8)",
  fontSize: 13,
};

const actionRow = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
  marginTop: 18,
};

const pathHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};

const pathIndex = {
  color: "var(--station-page-muted, #687386)",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const pathTitle = {
  margin: "8px 0 0",
  color: "var(--station-page-text, #f8fafc)",
  fontSize: 19,
  lineHeight: 1.2,
};

const routeList = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
};

const publishingStepGrid = {
  display: "grid",
  gap: 10,
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
  marginTop: 16,
  marginBottom: 12,
};

const publishingStepLink = {
  display: "grid",
  gap: 7,
  border: "1px solid var(--station-page-border, #263244)",
  borderRadius: 8,
  background: "var(--station-page-soft-2, #0d1420)",
  color: "var(--station-page-text, #f8fafc)",
  padding: "12px",
  textDecoration: "none",
  fontSize: 13,
  lineHeight: 1.45,
};

const stepBox = {
  display: "grid",
  gap: 4,
  border: "1px solid var(--station-page-border, #263244)",
  borderRadius: 8,
  background: "var(--station-page-soft-2, #0d1420)",
  padding: "10px 12px",
  color: "var(--station-page-muted, #a9b0bd)",
  fontSize: 13,
  lineHeight: 1.5,
} as const;

const routeToken = {
  border: "1px solid var(--station-page-border, #263244)",
  borderRadius: 7,
  background: "var(--station-page-soft-2, #0d1420)",
  color: "var(--station-page-accent, #bfdbfe)",
  padding: "6px 8px",
  fontSize: 11,
  overflowWrap: "anywhere" as const,
};

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  border: "1px solid #2563eb",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  padding: "0 14px",
  fontSize: 14,
  fontWeight: 800,
  textDecoration: "none",
};

const secondaryButton = {
  ...primaryButton,
  background: "#111827",
  borderColor: "#334155",
  color: "#d1d5db",
};
