"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { InstitutionAdminSummary } from "@station/types";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { institutionDate } from "@/lib/institutions";

function suggestSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function InstitutionAdminPage() {
  const [institutions, setInstitutions] = useState<InstitutionAdminSummary[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [authorised, setAuthorised] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [ownerUsername, setOwnerUsername] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSession().then(async (session) => {
      if (!session || !session.user.isAdmin) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) {
        setToken(session.access_token);
        setAuthorised(true);
      }
      try {
        const data = await apiGet<{ institutions: InstitutionAdminSummary[] }>(
          "/institutions/admin",
          session.access_token
        );
        if (!cancelled) setInstitutions(data.institutions ?? []);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load institutions.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh(sessionToken: string) {
    const data = await apiGet<{ institutions: InstitutionAdminSummary[] }>(
      "/institutions/admin",
      sessionToken
    );
    setInstitutions(data.institutions ?? []);
  }

  function handleName(value: string) {
    setName(value);
    if (!slugEdited) setSlug(suggestSlug(value));
  }

  async function handleProvision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setPendingAction("provision");
    setError(null);
    setMessage(null);
    let created = false;

    try {
      await apiPost(
        "/institutions/admin",
        {
          ownerUsername: ownerUsername.trim(),
          name,
          slug,
          summary: summary.trim() || null,
        },
        token
      );
      created = true;
      await refresh(token);
      setOwnerUsername("");
      setName("");
      setSlug("");
      setSummary("");
      setSlugEdited(false);
      setMessage("Private institution provisioned.");
    } catch (actionError) {
      setError(
        created
          ? "The institution was provisioned, but the admin list could not be refreshed."
          : actionError instanceof Error ? actionError.message : "Could not provision institution."
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleVerification(institution: InstitutionAdminSummary, verified: boolean) {
    if (!token) return;
    const actionKey = `${institution.slug}:${verified ? "verify" : "revoke"}`;
    setPendingAction(actionKey);
    setError(null);
    setMessage(null);
    let changed = false;

    try {
      await apiPost(
        `/institutions/admin/${encodeURIComponent(institution.slug)}/verification`,
        { verified },
        token
      );
      changed = true;
      await refresh(token);
      setMessage(verified ? "Institution verified." : "Institution verification revoked.");
    } catch (actionError) {
      setError(
        changed
          ? "Verification changed, but the admin list could not be refreshed."
          : actionError instanceof Error ? actionError.message : "Could not update verification."
      );
    } finally {
      setPendingAction(null);
    }
  }

  if (loading) {
    return (
      <main className="station-page institution-page">
        <div className="station-page-inner institution-loading">Loading institution administration...</div>
      </main>
    );
  }

  if (!authorised || !token) {
    return (
      <main className="station-page institution-page">
        <div className="station-page-inner station-page-inner-narrow institution-stack">
          <div className="station-notice" data-tone="error">Institution not found.</div>
          <Link className="station-muted-button" href="/institutions">Back to institutions</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="station-page institution-page">
      <div className="station-page-inner station-grid">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Station administration</div>
            <h1 className="station-page-title">Institution verification</h1>
            <p className="station-page-lede">Provision principals and manage Station verification state.</p>
          </div>
          <Link className="station-muted-button" href="/institutions">Institutions</Link>
        </header>

        {error ? <div className="station-notice" data-tone="error">{error}</div> : null}
        {message ? <div className="station-notice" data-tone="success">{message}</div> : null}

        <section className="institution-admin-layout">
          <form className="station-panel institution-stack institution-admin-form" onSubmit={handleProvision}>
            <div>
              <h2>Provision institution</h2>
              <p>Creates a private, unverified identity for one exact Station owner.</p>
            </div>
            <label className="institution-field">
              <span>Owner username</span>
              <input
                className="input"
                value={ownerUsername}
                onChange={(event) => setOwnerUsername(event.target.value)}
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z0-9_-]+"
                autoComplete="off"
                required
              />
            </label>
            <label className="institution-field">
              <span>Name</span>
              <input
                className="input"
                value={name}
                onChange={(event) => handleName(event.target.value)}
                maxLength={120}
                required
              />
            </label>
            <label className="institution-field">
              <span>Slug</span>
              <input
                className="input"
                value={slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  setSlug(suggestSlug(event.target.value));
                }}
                minLength={3}
                maxLength={80}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                required
              />
            </label>
            <label className="institution-field">
              <span>Summary</span>
              <textarea
                className="textarea"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                maxLength={1000}
              />
            </label>
            <button
              type="submit"
              className="station-link-button"
              disabled={pendingAction !== null || !ownerUsername.trim() || !name.trim() || !slug.trim()}
            >
              {pendingAction === "provision" ? "Provisioning..." : "Provision"}
            </button>
          </form>

          <section className="institution-section" aria-labelledby="institution-admin-list-heading">
            <div className="institution-section-heading">
              <div>
                <h2 id="institution-admin-list-heading">Institution identities</h2>
                <p>Verification and publication state.</p>
              </div>
              <span className="station-status-pill">{institutions.length}</span>
            </div>

            {institutions.length === 0 ? (
              <div className="institution-empty">No institutions provisioned.</div>
            ) : (
              <div className="institution-stack">
                {institutions.map((institution) => (
                  <article key={institution.slug} className="station-card institution-card institution-admin-card">
                    <div className="institution-stack">
                      <div className="institution-status-row">
                        <span className="station-status-pill">{institution.verificationStatus}</span>
                        <span className="station-status-pill">{institution.publicStatus}</span>
                      </div>
                      <h3>{institution.name}</h3>
                      <p>{institution.summary ?? "No summary."}</p>
                      <small>
                        Owner @{institution.owner.username} / created {institutionDate(institution.createdAt)}
                      </small>
                    </div>
                    <div className="station-action-row">
                      {institution.verificationStatus === "verified" ? (
                        <button
                          type="button"
                          className="station-muted-button"
                          disabled={pendingAction !== null}
                          onClick={() => handleVerification(institution, false)}
                        >
                          {pendingAction === `${institution.slug}:revoke` ? "Revoking..." : "Revoke verification"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="station-link-button"
                          disabled={pendingAction !== null}
                          onClick={() => handleVerification(institution, true)}
                        >
                          {pendingAction === `${institution.slug}:verify` ? "Verifying..." : "Verify"}
                        </button>
                      )}
                      {institution.publicHref ? (
                        <Link className="station-muted-button" href={institution.publicHref}>Public page</Link>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
