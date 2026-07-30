"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { ProjectInvitation, SharedProjectSummary } from "@station/types";
import { ApiRequestError, apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  projectCollaborationDate,
  projectInvitationActionPath,
} from "@/lib/project-collaboration";

type ProjectVisibility = "private" | "unlisted" | "community" | "public";
type ProjectConnectionTier = "tier_1_showcase" | "tier_2_hosted" | "tier_3_lab";

interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: ProjectVisibility;
  connectionTier: ProjectConnectionTier;
  createdAt: string;
  updatedAt: string;
}

const VISIBILITY_OPTIONS: Array<{ value: ProjectVisibility; label: string }> = [
  { value: "private", label: "Private" },
  { value: "unlisted", label: "Unlisted" },
  { value: "community", label: "Community" },
  { value: "public", label: "Public" },
];

const CONNECTION_LABELS: Record<ProjectConnectionTier, string> = {
  tier_1_showcase: "Showcase",
  tier_2_hosted: "Tier 2 stored value",
  tier_3_lab: "Tier 3 stored value",
};

function suggestSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function connectionLabel(value: ProjectConnectionTier) {
  return CONNECTION_LABELS[value] ?? "Stored connection value";
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [sharedProjects, setSharedProjects] = useState<SharedProjectSummary[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [pendingInvitationAction, setPendingInvitationAction] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [invitationLoadError, setInvitationLoadError] = useState<string | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [createdMessage, setCreatedMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ProjectVisibility>("private");

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) {
        setLoading(false);
        return;
      }

      setToken(session.access_token);
      const [projectsResult, invitationsResult] = await Promise.allSettled([
        apiGet<{ projects: ProjectSummary[]; sharedProjects: SharedProjectSummary[] }>("/projects", session.access_token),
        apiGet<{ invitations: ProjectInvitation[] }>("/projects/invitations", session.access_token),
      ]);

      if (projectsResult.status === "fulfilled") {
        setProjects(projectsResult.value.projects ?? []);
        setSharedProjects(projectsResult.value.sharedProjects ?? []);
      } else {
        setProjectsError(
          projectsResult.reason instanceof Error ? projectsResult.reason.message : "Could not load Projects."
        );
      }

      if (invitationsResult.status === "fulfilled") {
        setInvitations(invitationsResult.value.invitations ?? []);
      } else {
        setInvitationLoadError(
          invitationsResult.reason instanceof Error
            ? invitationsResult.reason.message
            : "Could not load Project invitations."
        );
      }
      setLoading(false);
    });
  }, []);

  async function refreshCollaboration(sessionToken: string) {
    const [projectData, invitationData] = await Promise.all([
      apiGet<{ projects: ProjectSummary[]; sharedProjects: SharedProjectSummary[] }>("/projects", sessionToken),
      apiGet<{ invitations: ProjectInvitation[] }>("/projects/invitations", sessionToken),
    ]);
    setProjects(projectData.projects ?? []);
    setSharedProjects(projectData.sharedProjects ?? []);
    setInvitations(invitationData.invitations ?? []);
    setProjectsError(null);
    setInvitationLoadError(null);
  }

  async function handleInvitationAction(invitation: ProjectInvitation, action: "accept" | "decline") {
    if (!token) return;
    const actionKey = `${invitation.project.slug}:${action}`;
    setPendingInvitationAction(actionKey);
    setInvitationError(null);
    setCreatedMessage(null);
    let actionCompleted = false;
    try {
      await apiPost(projectInvitationActionPath(invitation.project.slug, action), {}, token);
      actionCompleted = true;
      await refreshCollaboration(token);
      setCreatedMessage(action === "accept" ? "Project invitation accepted." : "Project invitation declined.");
    } catch (e) {
      if (!actionCompleted && e instanceof ApiRequestError && (e.status === 404 || e.status === 410)) {
        try {
          await refreshCollaboration(token);
          setInvitationError(e.message);
        } catch {
          setInvitationError(
            "This invitation is no longer current, and the latest Project lists could not be loaded."
          );
        }
      } else {
        setInvitationError(
          actionCompleted
            ? "The invitation changed, but the latest Project lists could not be loaded. Refresh to see current access."
            : e instanceof Error ? e.message : "Could not update this Project invitation."
        );
      }
    } finally {
      setPendingInvitationAction(null);
    }
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(suggestSlug(value));
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    setCreating(true);
    setError(null);
    setCreatedMessage(null);

    try {
      const data = await apiPost<{ project: ProjectSummary }>(
        "/projects",
        {
          name,
          slug,
          description: description.trim() ? description : null,
          visibility,
          connectionTier: "tier_1_showcase",
        },
        token
      );

      setProjects((current) => [data.project, ...current]);
      setName("");
      setSlug("");
      setSlugEdited(false);
      setDescription("");
      setVisibility("private");
      setCreatedMessage(`Created ${data.project.name}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create Project.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <main className="station-page">
        <div className="station-page-inner">
          <div className="station-panel" style={{ textAlign: "center", padding: "3rem", color: "#687078" }}>
            Loading Projects...
          </div>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="station-page">
        <div className="station-page-inner station-page-inner-narrow">
          <section className="station-panel" style={{ display: "grid", gap: "0.85rem", padding: "2rem" }}>
            <div className="station-eyebrow">Private Projects</div>
            <h1 className="station-page-title" style={{ margin: 0 }}>Sign in to manage Projects</h1>
            <p className="station-page-lede">
              Projects are private owner workspaces for grouping existing Station surfaces.
            </p>
            <Link href="/login?redirect=%2Fprojects" className="station-link-button" style={{ width: "fit-content" }}>
              Sign in
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="station-page">
      <div className="station-page-inner station-grid">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Project workspaces</div>
            <h1 className="station-page-title">Projects</h1>
            <p className="station-page-lede">
              Manage Projects you own, respond to invitations, and open Projects shared with you read-only.
            </p>
          </div>
        </header>

        {projectsError && <div className="station-notice" data-tone="error">{projectsError}</div>}
        {error && <div className="station-notice" data-tone="error">{error}</div>}
        {invitationLoadError && <div className="station-notice" data-tone="error">{invitationLoadError}</div>}
        {invitationError && <div className="station-notice" data-tone="error">{invitationError}</div>}
        {createdMessage && <div className="station-notice" data-tone="success">{createdMessage}</div>}

        <section className="project-collaboration-section" aria-labelledby="project-invitations-heading">
          <div className="project-collaboration-heading">
            <div>
              <h2 id="project-invitations-heading">Pending invitations</h2>
              <p>Invitations to view a Project read-only.</p>
            </div>
            <span className="station-status-pill">{invitationLoadError ? "Unavailable" : invitations.length}</span>
          </div>
          {invitationLoadError ? (
            <div className="project-collaboration-empty">Pending invitations are unavailable.</div>
          ) : invitations.length === 0 ? (
            <div className="project-collaboration-empty">No pending Project invitations.</div>
          ) : (
            <div className="project-collaboration-list">
              {invitations.map((invitation) => (
                <article
                  key={`${invitation.project.slug}:${invitation.invitedAt}`}
                  className="station-card project-collaboration-card"
                >
                  <div className="project-collaboration-card-copy">
                    <div className="kicker">From @{invitation.owner.username}</div>
                    <h3>{invitation.project.name}</h3>
                    <p>{invitation.project.description || "No description yet."}</p>
                    <small>Expires {projectCollaborationDate(invitation.expiresAt)}</small>
                  </div>
                  <div className="station-action-row">
                    <button
                      className="station-link-button"
                      type="button"
                      disabled={Boolean(pendingInvitationAction)}
                      onClick={() => handleInvitationAction(invitation, "accept")}
                    >
                      {pendingInvitationAction === `${invitation.project.slug}:accept` ? "Accepting..." : "Accept"}
                    </button>
                    <button
                      className="station-muted-button"
                      type="button"
                      disabled={Boolean(pendingInvitationAction)}
                      onClick={() => handleInvitationAction(invitation, "decline")}
                    >
                      {pendingInvitationAction === `${invitation.project.slug}:decline` ? "Declining..." : "Decline"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="project-collaboration-section" aria-labelledby="shared-projects-heading">
          <div className="project-collaboration-heading">
            <div>
              <h2 id="shared-projects-heading">Shared with you</h2>
              <p>Projects where you have active read-only viewer access.</p>
            </div>
            <span className="station-status-pill">{projectsError ? "Unavailable" : sharedProjects.length}</span>
          </div>
          {projectsError ? (
            <div className="project-collaboration-empty">Shared Projects are unavailable.</div>
          ) : sharedProjects.length === 0 ? (
            <div className="project-collaboration-empty">No Projects are currently shared with you.</div>
          ) : (
            <div className="project-collaboration-list">
              {sharedProjects.map((project) => (
                <article key={project.slug} className="station-card project-collaboration-card">
                  <div className="project-collaboration-card-copy">
                    <div className="kicker">Read-only / @{project.owner.username}</div>
                    <h3>{project.name}</h3>
                    <p>{project.description || "No description yet."}</p>
                    <small>Updated {projectCollaborationDate(project.updatedAt)}</small>
                  </div>
                  <div className="station-action-row">
                    <Link className="station-muted-button" href={`/projects/${encodeURIComponent(project.slug)}`}>
                      Open shared Project
                    </Link>
                    {project.publicHref ? (
                      <Link className="station-muted-button" href={project.publicHref}>Public page</Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="station-grid station-grid-2">
          <form className="station-panel" onSubmit={handleCreate} style={{ display: "grid", gap: "0.9rem" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Create Project</h2>
              <p style={{ margin: "0.3rem 0 0", color: "#687078", fontSize: "0.9rem", lineHeight: 1.5 }}>
                This creates a Showcase Project. Viewer invitations remain read-only and use exact Station usernames.
              </p>
            </div>

            <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem" }}>
              Name
              <input className="input" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
            </label>

            <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem" }}>
              Slug
              <input
                className="input"
                value={slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(suggestSlug(e.target.value));
                }}
                minLength={3}
                maxLength={80}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                required
              />
            </label>

            <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem" }}>
              Description
              <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>

            <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem" }}>
              Visibility
              <select className="select" value={visibility} onChange={(e) => setVisibility(e.target.value as ProjectVisibility)}>
                {VISIBILITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>

            <div className="station-notice" style={{ color: "#687078", fontSize: "0.88rem", lineHeight: 1.5 }}>
              New Projects use Showcase. Hosted runtime and lab runtime are not available in this UI.
            </div>

            <button className="button primary" type="submit" disabled={creating || !name.trim() || !slug.trim()}>
              {creating ? "Creating..." : "Create Project"}
            </button>
          </form>

          <div style={{ display: "grid", gap: "0.75rem" }}>
            {projectsError ? (
              <div className="station-panel" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
                <h2 style={{ margin: "0 0 0.4rem" }}>Owner Projects are unavailable</h2>
                <p style={{ margin: 0, color: "#687078" }}>Refresh before relying on the owner Project list.</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="station-panel" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
                <div className="kicker" style={{ justifyContent: "center", marginBottom: "0.75rem" }}>No Projects</div>
                <h2 style={{ margin: "0 0 0.4rem" }}>Create the first owner Project</h2>
                <p style={{ margin: 0, color: "#687078" }}>Projects appear here after the private API creates them.</p>
              </div>
            ) : projects.map((project) => (
              <article key={project.id} className="station-card" style={{ display: "grid", gap: "0.7rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.1rem", overflowWrap: "anywhere" }}>{project.name}</h2>
                    <p style={{ margin: 0, color: "#687078", fontSize: "0.88rem", lineHeight: 1.5 }}>
                      {project.description || "No description yet."}
                    </p>
                  </div>
                  <span className="pill" style={{ textTransform: "capitalize" }}>{project.visibility}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", color: "#687078", fontSize: "0.8rem" }}>
                  <span>{project.slug}</span>
                  <span>/</span>
                  <span>{connectionLabel(project.connectionTier)}</span>
                </div>
                <div className="station-action-row">
                  <Link className="station-muted-button" href={`/projects/${project.slug}`}>Open</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
