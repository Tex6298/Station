"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { InstitutionPublicationSummary, InstitutionTeamMember, InstitutionTeamResponse } from "@station/types";
import { ApiRequestError, apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  institutionDate,
  institutionInvitationPath,
  institutionMemberRevokePath,
  institutionPublicationPath,
  institutionProjectsPath,
  institutionSpacePath,
  institutionPublicationsPath,
  institutionPublicationWorkPath,
  institutionTeamPath,
  isValidInstitutionUsername,
  normaliseInstitutionUsername,
  suggestInstitutionProjectSlug,
  suggestInstitutionPublicationSlug,
} from "@/lib/institutions";

function MemberInstitutionSummary({ team }: { team: InstitutionTeamResponse }) {
  return (
    <section className="station-panel institution-stack" aria-label="Member access">
      <div className="institution-section-heading">
        <div>
          <h2>Team access</h2>
          <p>Active member</p>
        </div>
        <span className="station-status-pill">Read-only</span>
      </div>
      <div className="institution-status-row">
        <span className="station-status-pill">{team.institution.verificationStatus}</span>
        <span className="station-status-pill">{team.institution.publicStatus}</span>
      </div>
    </section>
  );
}

function OwnerInstitutionControls({
  team,
  inviteUsername,
  pendingAction,
  onInviteUsername,
  onInvite,
  onRevoke,
  onPublication,
}: {
  team: InstitutionTeamResponse;
  inviteUsername: string;
  pendingAction: string | null;
  onInviteUsername: (value: string) => void;
  onInvite: (event: FormEvent<HTMLFormElement>) => void;
  onRevoke: (member: InstitutionTeamMember) => void;
  onPublication: (makePublic: boolean) => void;
}) {
  return (
    <section className="institution-owner-controls" aria-label="Institution owner controls">
      <form className="station-panel institution-stack" onSubmit={onInvite}>
        <div>
          <h2>Invite a member</h2>
          <p>Use the exact Station username.</p>
        </div>
        <div className="institution-invite-row">
          <label className="institution-field">
            <span>Username</span>
            <input
              className="input"
              value={inviteUsername}
              onChange={(event) => onInviteUsername(event.target.value)}
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9_-]+"
              autoComplete="off"
              required
            />
          </label>
          <button
            className="station-link-button"
            type="submit"
            disabled={pendingAction !== null || !isValidInstitutionUsername(inviteUsername)}
          >
            {pendingAction === "invite" ? "Inviting..." : "Invite"}
          </button>
        </div>
      </form>

      <section className="station-panel institution-stack" aria-labelledby="institution-owner-publication-heading">
        <div className="institution-section-heading">
          <div>
            <h2 id="institution-owner-publication-heading">Public identity</h2>
            <p>{team.institution.verificationStatus === "verified" ? "Verified by Station" : "Verification required"}</p>
          </div>
          <span className="station-status-pill">{team.institution.publicStatus}</span>
        </div>
        <div className="station-action-row">
          {team.institution.publicStatus === "public" ? (
            <button
              type="button"
              className="station-muted-button"
              disabled={pendingAction !== null}
              onClick={() => onPublication(false)}
            >
              {pendingAction === "unpublish" ? "Unpublishing..." : "Unpublish"}
            </button>
          ) : (
            <button
              type="button"
              className="station-link-button"
              disabled={pendingAction !== null || team.institution.verificationStatus !== "verified"}
              onClick={() => onPublication(true)}
            >
              {pendingAction === "publish" ? "Publishing..." : "Publish"}
            </button>
          )}
          {team.institution.publicHref ? (
            <Link className="station-muted-button" href={team.institution.publicHref}>Open public page</Link>
          ) : null}
        </div>
      </section>

      <section className="station-panel institution-stack" aria-labelledby="institution-owner-roster-actions-heading">
        <div>
          <h2 id="institution-owner-roster-actions-heading">Member access</h2>
          <p>Cancel a pending invitation or remove active access.</p>
        </div>
        <div className="institution-member-list">
          {team.members.length === 0 ? (
            <div className="institution-empty">No members to manage.</div>
          ) : team.members.map((member) => (
            <div key={`${member.username}:${member.status}`} className="institution-member-row">
              <div>
                <strong>{member.displayName ?? member.username}</strong>
                <span>@{member.username} / {member.status}</span>
              </div>
              <button
                type="button"
                className="station-muted-button"
                disabled={pendingAction !== null}
                onClick={() => onRevoke(member)}
              >
                {pendingAction === `revoke:${member.username}`
                  ? "Updating..."
                  : member.status === "invited" ? "Cancel invitation" : "Revoke"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default function InstitutionTeamPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(String(params.slug ?? ""));
  const [team, setTeam] = useState<InstitutionTeamResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectSlug, setProjectSlug] = useState("");
  const [projectVisibility, setProjectVisibility] = useState<"private" | "unlisted" | "community" | "public">("private");
  const [publications, setPublications] = useState<InstitutionPublicationSummary[]>([]);
  const [publicationTitle, setPublicationTitle] = useState("");
  const [publicationSlug, setPublicationSlug] = useState("");
  const [publicationSummary, setPublicationSummary] = useState("");
  const [publicationBody, setPublicationBody] = useState("");

  useEffect(() => {
    let cancelled = false;
    getSession().then(async (session) => {
      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }
      if (!cancelled) setToken(session.access_token);

      try {
        const data = await apiGet<InstitutionTeamResponse>(
          institutionTeamPath(slug),
          session.access_token
        );
        const publicationData = await apiGet<{ publications: InstitutionPublicationSummary[] }>(
          institutionPublicationsPath(slug),
          session.access_token
        );
        if (!cancelled) {
          setTeam(data);
          setPublications(publicationData.publications);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Institution not found.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function refresh(sessionToken: string) {
    const [data, publicationData] = await Promise.all([
      apiGet<InstitutionTeamResponse>(institutionTeamPath(slug), sessionToken),
      apiGet<{ publications: InstitutionPublicationSummary[] }>(institutionPublicationsPath(slug), sessionToken),
    ]);
    setTeam(data);
    setPublications(publicationData.publications);
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !isValidInstitutionUsername(inviteUsername)) return;
    setPendingAction("invite");
    setError(null);
    setMessage(null);
    let changed = false;

    try {
      await apiPost(
        institutionInvitationPath(slug),
        { username: normaliseInstitutionUsername(inviteUsername) },
        token
      );
      changed = true;
      setInviteUsername("");
      await refresh(token);
      setMessage("Member invitation created.");
    } catch (actionError) {
      setError(
        changed
          ? "The invitation was created, but the team could not be refreshed."
          : actionError instanceof Error ? actionError.message : "Could not invite this member."
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRevoke(member: InstitutionTeamMember) {
    if (!token) return;
    setPendingAction(`revoke:${member.username}`);
    setError(null);
    setMessage(null);
    let changed = false;

    try {
      await apiPost(institutionMemberRevokePath(slug), { username: member.username }, token);
      changed = true;
      await refresh(token);
      setMessage(member.status === "invited" ? "Invitation cancelled." : "Member access revoked.");
    } catch (actionError) {
      if (!changed && actionError instanceof ApiRequestError && actionError.status === 404) {
        try {
          await refresh(token);
        } catch {
          // Preserve the bounded route error when refresh also fails.
        }
      }
      setError(
        changed
          ? "Member access changed, but the team could not be refreshed."
          : actionError instanceof Error ? actionError.message : "Could not update this member."
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handlePublication(makePublic: boolean) {
    if (!token) return;
    setPendingAction(makePublic ? "publish" : "unpublish");
    setError(null);
    setMessage(null);
    let changed = false;

    try {
      await apiPost(institutionPublicationPath(slug), { public: makePublic }, token);
      changed = true;
      await refresh(token);
      setMessage(makePublic ? "Institution identity published." : "Institution identity unpublished.");
    } catch (actionError) {
      setError(
        changed
          ? "Publication changed, but the team could not be refreshed."
          : actionError instanceof Error ? actionError.message : "Could not update publication."
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleProjectCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || projectSlug.length < 3) return;
    setPendingAction("create-project");
    setError(null);
    setMessage(null);
    try {
      await apiPost(institutionProjectsPath(slug), {
        name: projectName,
        slug: projectSlug,
        visibility: projectVisibility,
        connectionTier: "tier_1_showcase",
      }, token);
      setProjectName("");
      setProjectSlug("");
      await refresh(token);
      setMessage("Institution Project created.");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not create this Project.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handlePublicationCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const retainedProject = team?.projects[0];
    if (!token || !retainedProject || publicationSlug.length < 3) return;
    setPendingAction("create-publication");
    setError(null);
    setMessage(null);
    try {
      await apiPost(institutionPublicationsPath(slug), {
        title: publicationTitle,
        slug: publicationSlug,
        summary: publicationSummary,
        body: publicationBody,
        documentType: "article",
        projectSlug: retainedProject.slug,
      }, token);
      setPublicationTitle("");
      setPublicationSlug("");
      setPublicationSummary("");
      setPublicationBody("");
      await refresh(token);
      setMessage("Institution publication draft created.");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not create this draft.");
    } finally {
      setPendingAction(null);
    }
  }

  if (loading) {
    return (
      <main className="station-page institution-page">
        <div className="station-page-inner institution-loading">Loading institution team...</div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="station-page institution-page">
        <div className="station-page-inner station-page-inner-narrow institution-stack">
          <div className="station-notice" data-tone="error">Institution not found.</div>
          <Link
            className="station-link-button"
            href={`/login?redirect=${encodeURIComponent(`/institutions/${slug}/team`)}`}
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (error && !team) {
    return (
      <main className="station-page institution-page">
        <div className="station-page-inner station-page-inner-narrow institution-stack">
          <div className="station-notice" data-tone="error">{error}</div>
          <Link className="station-muted-button" href="/institutions">Back to institutions</Link>
        </div>
      </main>
    );
  }

  if (!team) return null;

  return (
    <main className="station-page institution-page">
      <div className="station-page-inner station-grid">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Institution team</div>
            <h1 className="station-page-title institution-wrap">{team.institution.name}</h1>
            <p className="station-page-lede">{team.institution.summary ?? "Private institution identity."}</p>
          </div>
          <Link className="station-muted-button" href="/institutions">All institutions</Link>
        </header>

        {error ? <div className="station-notice" data-tone="error">{error}</div> : null}
        {message ? <div className="station-notice" data-tone="success">{message}</div> : null}

        <section className="institution-space-entry" aria-labelledby="institution-space-entry-heading">
          <div>
            <div className="station-eyebrow">Institutional Space</div>
            <h2 id="institution-space-entry-heading">Public institution home</h2>
            <p>Configure the bounded mark, authored introduction, and public Institution work.</p>
          </div>
          <Link className="station-link-button" href={institutionSpacePath(slug)}>
            {team.institution.access.role === "owner" ? "Open workspace" : "View configuration"}
          </Link>
        </section>

        {team.institution.access.role === "owner" ? (
          <OwnerInstitutionControls
            team={team}
            inviteUsername={inviteUsername}
            pendingAction={pendingAction}
            onInviteUsername={setInviteUsername}
            onInvite={handleInvite}
            onRevoke={handleRevoke}
            onPublication={handlePublication}
          />
        ) : (
          <MemberInstitutionSummary team={team} />
        )}

        <section className="station-panel institution-stack" aria-labelledby="institution-projects-heading">
          <div className="institution-section-heading">
            <div>
              <h2 id="institution-projects-heading">Projects</h2>
              <p>Projects owned by {team.institution.name}.</p>
            </div>
            <span className="station-status-pill">{team.projects.length}</span>
          </div>
          {team.institution.access.role === "owner" ? (
            <form className="institution-stack" onSubmit={handleProjectCreate}>
              <div className="institution-invite-row">
                <label className="institution-field">
                  <span>Project name</span>
                  <input
                    className="input"
                    value={projectName}
                    onChange={(event) => {
                      setProjectName(event.target.value);
                      setProjectSlug(suggestInstitutionProjectSlug(event.target.value));
                    }}
                    required
                  />
                </label>
                <label className="institution-field">
                  <span>Slug</span>
                  <input
                    className="input"
                    value={projectSlug}
                    onChange={(event) => setProjectSlug(suggestInstitutionProjectSlug(event.target.value))}
                    minLength={3}
                    maxLength={80}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    required
                  />
                </label>
              </div>
              <div className="station-action-row">
                <label className="institution-field">
                  <span>Visibility</span>
                  <select className="input" value={projectVisibility} onChange={(event) => setProjectVisibility(event.target.value as typeof projectVisibility)}>
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="community">Community</option>
                    <option value="public">Public</option>
                  </select>
                </label>
                <button className="station-link-button" type="submit" disabled={pendingAction !== null || projectSlug.length < 3}>
                  {pendingAction === "create-project" ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          ) : (
            <div className="station-notice">Institution member access is read-only.</div>
          )}
          <div className="institution-member-list">
            {team.projects.length === 0 ? (
              <div className="institution-empty">No Institution Projects yet.</div>
            ) : team.projects.map((project) => (
              <div key={project.slug} className="institution-member-row">
                <div>
                  <strong>{project.name}</strong>
                  <span>{project.visibility} / {project.access.readOnly ? "Institution member / read-only" : "Institution owner"}</span>
                </div>
                <Link className="station-muted-button" href={`/projects/${encodeURIComponent(project.slug)}`}>Open Project</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="station-panel institution-stack" aria-labelledby="institution-publications-heading">
          <div className="institution-section-heading">
            <div>
              <h2 id="institution-publications-heading">Publications</h2>
              <p>Collaborative Institution work attached to {team.projects[0]?.name ?? "an Institution Project"}.</p>
            </div>
            <span className="station-status-pill">{publications.length}</span>
          </div>
          {team.projects.length > 0 ? (
            <form className="institution-stack" onSubmit={handlePublicationCreate}>
              <div className="institution-invite-row">
                <label className="institution-field">
                  <span>Title</span>
                  <input
                    className="input"
                    value={publicationTitle}
                    onChange={(event) => {
                      setPublicationTitle(event.target.value);
                      setPublicationSlug(suggestInstitutionPublicationSlug(event.target.value));
                    }}
                    maxLength={200}
                    required
                  />
                </label>
                <label className="institution-field">
                  <span>Slug</span>
                  <input
                    className="input"
                    value={publicationSlug}
                    onChange={(event) => setPublicationSlug(suggestInstitutionPublicationSlug(event.target.value))}
                    minLength={3}
                    maxLength={80}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    required
                  />
                </label>
              </div>
              <label className="institution-field">
                <span>Summary</span>
                <input className="input" value={publicationSummary} onChange={(event) => setPublicationSummary(event.target.value)} maxLength={1000} required />
              </label>
              <label className="institution-field">
                <span>Draft</span>
                <textarea className="input" value={publicationBody} onChange={(event) => setPublicationBody(event.target.value)} rows={7} maxLength={100000} required />
              </label>
              <div className="station-action-row">
                <button className="station-link-button" type="submit" disabled={pendingAction !== null || publicationSlug.length < 3}>
                  {pendingAction === "create-publication" ? "Creating..." : "Create draft"}
                </button>
              </div>
            </form>
          ) : (
            <div className="station-notice">Create an Institution Project before starting a publication.</div>
          )}
          <div className="institution-member-list">
            {publications.length === 0 ? (
              <div className="institution-empty">No Institution publications yet.</div>
            ) : publications.map((publication) => (
              <div key={publication.slug} className="institution-member-row">
                <div>
                  <strong>{publication.title}</strong>
                  <span>{publication.status} / version {publication.version} / created by {publication.creatorLabel} / last edited by {publication.lastEditorLabel}</span>
                </div>
                <Link className="station-muted-button" href={institutionPublicationWorkPath(slug, publication.slug)}>Open draft</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="station-panel institution-stack" aria-labelledby="institution-team-roster-heading">
          <div className="institution-section-heading">
            <div>
              <h2 id="institution-team-roster-heading">Team</h2>
              <p>Current institution roster.</p>
            </div>
            <span className="station-status-pill">{team.members.filter((member) => member.status === "active").length + 1}</span>
          </div>
          <div className="institution-member-list">
            <div className="institution-member-row">
              <div>
                <strong>{team.owner.displayName ?? team.owner.username}</strong>
                <span>@{team.owner.username}</span>
              </div>
              <span className="station-status-pill">Owner</span>
            </div>
            {team.members.map((member) => (
              <div key={`${member.username}:${member.status}`} className="institution-member-row">
                <div>
                  <strong>{member.displayName ?? member.username}</strong>
                  <span>
                    @{member.username} / {member.status}
                    {member.status === "invited" && member.expiresAt
                      ? ` / expires ${institutionDate(member.expiresAt)}`
                      : ""}
                  </span>
                </div>
                <span className="station-status-pill">{member.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
