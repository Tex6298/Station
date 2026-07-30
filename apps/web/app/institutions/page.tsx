"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { InstitutionInvitation, InstitutionSummary } from "@station/types";
import { ApiRequestError, apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  institutionDate,
  institutionInvitationActionPath,
  institutionTeamPath,
} from "@/lib/institutions";

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<InstitutionSummary[]>([]);
  const [invitations, setInvitations] = useState<InstitutionInvitation[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSession().then(async (session) => {
      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) {
        setToken(session.access_token);
        setIsAdmin(session.user.isAdmin);
      }

      const [institutionResult, invitationResult] = await Promise.allSettled([
        apiGet<{ institutions: InstitutionSummary[] }>("/institutions", session.access_token),
        apiGet<{ invitations: InstitutionInvitation[] }>(
          "/institutions/invitations",
          session.access_token
        ),
      ]);

      if (cancelled) return;
      if (institutionResult.status === "fulfilled") {
        setInstitutions(institutionResult.value.institutions ?? []);
      } else {
        setLoadError(
          institutionResult.reason instanceof Error
            ? institutionResult.reason.message
            : "Could not load institutions."
        );
      }
      if (invitationResult.status === "fulfilled") {
        setInvitations(invitationResult.value.invitations ?? []);
      } else {
        setLoadError(
          invitationResult.reason instanceof Error
            ? invitationResult.reason.message
            : "Could not load institution invitations."
        );
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh(sessionToken: string) {
    const [institutionData, invitationData] = await Promise.all([
      apiGet<{ institutions: InstitutionSummary[] }>("/institutions", sessionToken),
      apiGet<{ invitations: InstitutionInvitation[] }>("/institutions/invitations", sessionToken),
    ]);
    setInstitutions(institutionData.institutions ?? []);
    setInvitations(invitationData.invitations ?? []);
    setLoadError(null);
  }

  async function handleInvitation(
    invitation: InstitutionInvitation,
    action: "accept" | "decline"
  ) {
    if (!token) return;
    const actionKey = `${invitation.institution.slug}:${action}`;
    setPendingAction(actionKey);
    setActionError(null);
    setActionMessage(null);
    let changed = false;

    try {
      await apiPost(
        institutionInvitationActionPath(invitation.institution.slug, action),
        {},
        token
      );
      changed = true;
      await refresh(token);
      setActionMessage(
        action === "accept" ? "Institution invitation accepted." : "Institution invitation declined."
      );
    } catch (error) {
      if (!changed && error instanceof ApiRequestError && (error.status === 404 || error.status === 410)) {
        try {
          await refresh(token);
        } catch {
          // Keep the bounded API error when refresh also fails.
        }
      }
      setActionError(
        changed
          ? "The invitation changed, but the current institution list could not be loaded."
          : error instanceof Error ? error.message : "Could not update the invitation."
      );
    } finally {
      setPendingAction(null);
    }
  }

  if (loading) {
    return (
      <main className="station-page institution-page">
        <div className="station-page-inner institution-loading">Loading institutions...</div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="station-page institution-page">
        <div className="station-page-inner station-page-inner-narrow">
          <section className="station-panel institution-stack">
            <div className="station-eyebrow">Institution access</div>
            <h1 className="station-page-title">Sign in to view institutions</h1>
            <Link href="/login?redirect=%2Finstitutions" className="station-link-button">
              Sign in
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="station-page institution-page">
      <div className="station-page-inner station-grid">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Institution identities</div>
            <h1 className="station-page-title">Institutions</h1>
            <p className="station-page-lede">Your institution identities and current team access.</p>
          </div>
          {isAdmin ? (
            <Link href="/institutions/admin" className="station-muted-button">
              Admin
            </Link>
          ) : null}
        </header>

        {loadError ? <div className="station-notice" data-tone="error">{loadError}</div> : null}
        {actionError ? <div className="station-notice" data-tone="error">{actionError}</div> : null}
        {actionMessage ? <div className="station-notice" data-tone="success">{actionMessage}</div> : null}

        <section className="institution-section" aria-labelledby="institution-invitations-heading">
          <div className="institution-section-heading">
            <div>
              <h2 id="institution-invitations-heading">Pending invitations</h2>
              <p>Institution team invitations awaiting your decision.</p>
            </div>
            <span className="station-status-pill">{invitations.length}</span>
          </div>

          {invitations.length === 0 ? (
            <div className="institution-empty">No pending institution invitations.</div>
          ) : (
            <div className="institution-card-grid">
              {invitations.map((invitation) => (
                <article
                  key={`${invitation.institution.slug}:${invitation.invitedAt}`}
                  className="station-card institution-card"
                >
                  <div className="institution-stack">
                    <div className="kicker">From @{invitation.owner.username}</div>
                    <h3>{invitation.institution.name}</h3>
                    <p>{invitation.institution.summary ?? "Private institution identity."}</p>
                    <small>Expires {institutionDate(invitation.expiresAt)}</small>
                  </div>
                  <div className="station-action-row">
                    <button
                      type="button"
                      className="station-link-button"
                      disabled={Boolean(pendingAction)}
                      onClick={() => handleInvitation(invitation, "accept")}
                    >
                      {pendingAction === `${invitation.institution.slug}:accept` ? "Accepting..." : "Accept"}
                    </button>
                    <button
                      type="button"
                      className="station-muted-button"
                      disabled={Boolean(pendingAction)}
                      onClick={() => handleInvitation(invitation, "decline")}
                    >
                      {pendingAction === `${invitation.institution.slug}:decline` ? "Declining..." : "Decline"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="institution-section" aria-labelledby="institution-access-heading">
          <div className="institution-section-heading">
            <div>
              <h2 id="institution-access-heading">Your institutions</h2>
              <p>Owner and active member access.</p>
            </div>
            <span className="station-status-pill">{institutions.length}</span>
          </div>

          {institutions.length === 0 ? (
            <div className="institution-empty">No current institution access.</div>
          ) : (
            <div className="institution-card-grid">
              {institutions.map((institution) => (
                <article key={`${institution.slug}:${institution.access.role}`} className="station-card institution-card">
                  <div className="institution-stack">
                    <div className="institution-status-row">
                      <span className="station-status-pill">
                        {institution.access.role === "owner" ? "Owner" : "Member"}
                      </span>
                      <span className="station-status-pill">{institution.verificationStatus}</span>
                      <span className="station-status-pill">{institution.publicStatus}</span>
                    </div>
                    <h3>{institution.name}</h3>
                    <p>{institution.summary ?? "Private institution identity."}</p>
                  </div>
                  <div className="station-action-row">
                    <Link className="station-muted-button" href={institutionTeamPath(institution.slug)}>
                      Open team
                    </Link>
                    {institution.publicHref ? (
                      <Link className="station-muted-button" href={institution.publicHref}>
                        Public page
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
