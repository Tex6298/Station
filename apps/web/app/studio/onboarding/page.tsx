"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PersonaSummary } from "@station/types/persona";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { onboardingPathCards, onboardingPathStatusTone } from "@/lib/onboarding-paths";
import {
  StudioEmptyState,
  StudioErrorState,
  StudioFrame,
  StudioPanel,
  StudioStatusBadge,
} from "@/components/studio/studio-frame";

export default function StudioOnboardingPage() {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
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
        const data = await apiGet<{ personas: PersonaSummary[] }>("/personas", session.access_token);
        if (mounted) setPersonas(data.personas ?? []);
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

  const cards = onboardingPathCards(personas);

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
                <p style={truthCopy}>{card.truth}</p>
                <div style={routeList} aria-label={`${card.title} routes`}>
                  {card.supportingRoutes.map((route) => (
                    <code key={route} style={routeToken}>{route}</code>
                  ))}
                </div>
                <Link href={card.route} style={primaryButton}>{card.actionLabel}</Link>
              </article>
            ))}
          </section>

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

const heading = {
  margin: "0 0 8px",
  color: "#f8fafc",
};

const copy = {
  margin: 0,
  color: "#a9b0bd",
  fontSize: 14,
  lineHeight: 1.55,
};

const truthCopy = {
  ...copy,
  color: "#8ea0b8",
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
  color: "#687386",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const pathTitle = {
  margin: "8px 0 0",
  color: "#f8fafc",
  fontSize: 19,
  lineHeight: 1.2,
};

const routeList = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
};

const routeToken = {
  border: "1px solid #263244",
  borderRadius: 7,
  background: "#0d1420",
  color: "#bfdbfe",
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
