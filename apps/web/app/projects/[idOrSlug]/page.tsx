"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type {
  InstitutionProjectDetailResponse,
  ProjectEvidenceItem,
  ProjectViewerMember,
  SharedProjectDetailResponse,
} from "@station/types";
import { ApiRequestError, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { ProjectExportPanel } from "@/components/projects/project-export-panel";
import {
  projectEvidenceCountLabel,
  projectEvidenceDate,
  projectEvidenceEmptyCopy,
  projectEvidenceRoleLabel,
  projectEvidenceRouteLabel,
} from "@/lib/project-evidence";
import {
  isValidProjectUsername,
  loadProjectThenOwnerResources,
  normaliseProjectUsername,
  projectCollaborationDate,
  projectInvitationPath,
  projectMemberRevokePath,
  projectMembersPath,
  projectViewerMemberAction,
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

interface AttachedDeveloperSpaceSummary {
  id: string;
  projectName: string;
  slug: string;
  description: string | null;
  visibility: "private" | "unlisted" | "community" | "public";
  visualisationType: "node_field" | "timeline" | "world_map" | "constellation";
  createdAt: string;
  updatedAt: string;
}

interface OwnerProjectDetailResponse {
  access: {
    role: "owner";
    readOnly: false;
  };
  project: ProjectSummary;
  developerSpaces: AttachedDeveloperSpaceSummary[];
  evidence?: ProjectEvidenceItem[];
  activity?: Partial<ProjectActivity>;
}

type ProjectDetailResponse = OwnerProjectDetailResponse | SharedProjectDetailResponse | InstitutionProjectDetailResponse;

function isViewerProjectDetail(detail: ProjectDetailResponse): detail is SharedProjectDetailResponse {
  return detail.access.role === "viewer";
}

function isOwnerProjectDetail(detail: ProjectDetailResponse): detail is OwnerProjectDetailResponse {
  return detail.access.role === "owner";
}

function isInstitutionProjectDetail(detail: ProjectDetailResponse): detail is InstitutionProjectDetailResponse {
  return detail.access.role === "institution_owner" || detail.access.role === "institution_member";
}

type OwnerDeveloperSpace = AttachedDeveloperSpaceSummary & {
  apiKeyLastFour?: string | null;
  apiKeyCreatedAt?: string | null;
  projectId?: string | null;
  assignedProjectName?: string | null;
  assignedProjectSlug?: string | null;
};

interface ProjectActivity {
  developerSpaces: number;
  nodes: number;
  events: number;
  snapshots: number;
  storageBytes: number;
  publicReads: number;
  exports: number;
}

interface OwnerProjectResources {
  spaces: OwnerDeveloperSpace[];
  members: ProjectViewerMember[];
  spacesError: string | null;
  membersError: string | null;
}

const CONNECTION_LABELS: Record<ProjectConnectionTier, string> = {
  tier_1_showcase: "Showcase",
  tier_2_hosted: "Tier 2 stored value",
  tier_3_lab: "Tier 3 stored value",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function visualisationLabel(value: AttachedDeveloperSpaceSummary["visualisationType"]) {
  return value.replace("_", " ");
}

function normaliseActivity(activity?: Partial<ProjectActivity>): ProjectActivity {
  return {
    developerSpaces: Number(activity?.developerSpaces ?? 0),
    nodes: Number(activity?.nodes ?? 0),
    events: Number(activity?.events ?? 0),
    snapshots: Number(activity?.snapshots ?? 0),
    storageBytes: Number(activity?.storageBytes ?? 0),
    publicReads: Number(activity?.publicReads ?? 0),
    exports: Number(activity?.exports ?? 0),
  };
}

function formatCounter(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function SharedProjectView({ detail }: { detail: SharedProjectDetailResponse }) {
  const { project, owner, developerSpaces, evidence } = detail;
  return (
    <main className="station-page project-collaboration-page">
      <div className="station-page-inner station-grid">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Read-only viewer</div>
            <h1 className="station-page-title project-collaboration-wrap">{project.name}</h1>
            <p className="station-page-lede">{project.description || "No description yet."}</p>
          </div>
          <Link href="/projects" className="station-muted-button">All Projects</Link>
        </header>

        <section className="station-panel project-collaboration-summary" aria-label="Shared Project access">
          <div className="project-collaboration-heading">
            <div>
              <h2>Shared by @{owner.username}</h2>
              <p>{owner.displayName || "Station member"}</p>
            </div>
            <span className="station-status-pill">Read-only</span>
          </div>
          <dl className="fact-grid compact">
            <div><dt>Visibility</dt><dd>{project.visibility}</dd></div>
            <div><dt>Updated</dt><dd>{projectCollaborationDate(project.updatedAt)}</dd></div>
            <div><dt>Access</dt><dd>Viewer</dd></div>
          </dl>
          {project.publicHref ? (
            <div className="station-action-row">
              <Link className="station-muted-button" href={project.publicHref}>Open public page</Link>
            </div>
          ) : null}
        </section>

        <section className="project-collaboration-section" aria-labelledby="shared-project-spaces-heading">
          <div className="project-collaboration-heading">
            <div>
              <h2 id="shared-project-spaces-heading">Developer Spaces</h2>
              <p>Bounded metadata shared through this Project.</p>
            </div>
            <span className="station-status-pill">{developerSpaces.length}</span>
          </div>
          {developerSpaces.length === 0 ? (
            <div className="project-collaboration-empty">No Developer Spaces are attached.</div>
          ) : (
            <div className="project-collaboration-list">
              {developerSpaces.map((space) => (
                <article key={`${space.slug}:${space.updatedAt}`} className="station-card project-collaboration-card">
                  <div className="project-collaboration-card-copy">
                    <div className="kicker">{space.visibility} / {visualisationLabel(space.visualisationType)}</div>
                    <h3>{space.projectName}</h3>
                    <p>{space.description || "No description yet."}</p>
                    <small>Updated {projectCollaborationDate(space.updatedAt)}</small>
                  </div>
                  {space.publicHref ? (
                    <div className="station-action-row">
                      <Link className="station-muted-button" href={space.publicHref}>Open public observatory</Link>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="project-collaboration-section" aria-labelledby="shared-project-evidence-heading">
          <div className="project-collaboration-heading">
            <div>
              <h2 id="shared-project-evidence-heading">Project evidence</h2>
              <p>Read-only evidence metadata selected by the Project owner.</p>
            </div>
            <span className="station-status-pill">{evidence.length}</span>
          </div>
          {evidence.length === 0 ? (
            <div className="project-collaboration-empty">No evidence is attached.</div>
          ) : (
            <div className="project-collaboration-list">
              {evidence.map((item) => (
                <article
                  key={`${item.developerSpace.slug}:${item.document.title}:${item.document.updatedAt}`}
                  className="station-card project-collaboration-card"
                >
                  <div className="project-collaboration-card-copy">
                    <div className="kicker">{item.developerSpace.projectName} / {projectEvidenceRoleLabel(item.role)}</div>
                    <h3>{item.document.title}</h3>
                    <p>{item.document.documentType.replace("_", " ")}</p>
                    <small>Updated {projectCollaborationDate(item.document.updatedAt)}</small>
                  </div>
                  {item.publicHref ? (
                    <div className="station-action-row">
                      <Link className="station-muted-button" href={item.publicHref}>Open public observatory</Link>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function InstitutionProjectView({
  detail,
  pending,
  actionError,
  actionMessage,
  onVisibility,
}: {
  detail: InstitutionProjectDetailResponse;
  pending: boolean;
  actionError: string | null;
  actionMessage: string | null;
  onVisibility: (visibility: ProjectVisibility) => void;
}) {
  const ownerAccess = detail.access.role === "institution_owner";
  return (
    <main className="station-page project-collaboration-page">
      <div className="station-page-inner station-grid">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Institution Project</div>
            <h1 className="station-page-title project-collaboration-wrap">{detail.project.name}</h1>
            <p className="station-page-lede">{detail.project.description || "No description yet."}</p>
          </div>
          <Link href="/projects" className="station-muted-button">All Projects</Link>
        </header>
        {actionError ? <div className="station-notice" data-tone="error">{actionError}</div> : null}
        {actionMessage ? <div className="station-notice" data-tone="success">{actionMessage}</div> : null}
        <section className="station-panel project-collaboration-summary" aria-label="Institution Project access">
          <div className="project-collaboration-heading">
            <div>
              <h2>Owned by {detail.institution.name}</h2>
              <p>This Institution is the Project principal.</p>
            </div>
            <span className="station-status-pill">
              {ownerAccess ? "Institution owner" : "Institution member / read-only"}
            </span>
          </div>
          <dl className="fact-grid compact">
            <div><dt>Visibility</dt><dd>{detail.project.visibility}</dd></div>
            <div><dt>Updated</dt><dd>{projectCollaborationDate(detail.project.updatedAt)}</dd></div>
            <div><dt>Access</dt><dd>{ownerAccess ? "Manage" : "Read-only"}</dd></div>
          </dl>
          <div className="station-action-row">
            {detail.institution.href ? (
              <Link className="station-muted-button" href={detail.institution.href}>Institution identity</Link>
            ) : (
              <Link className="station-muted-button" href={`/institutions/${encodeURIComponent(detail.institution.slug)}/team`}>Institution team</Link>
            )}
            {detail.project.publicHref ? <Link className="station-muted-button" href={detail.project.publicHref}>Public page</Link> : null}
          </div>
          {ownerAccess ? (
            <label className="institution-field">
              <span>Project visibility</span>
              <select
                className="input"
                value={detail.project.visibility}
                disabled={pending}
                onChange={(event) => onVisibility(event.target.value as ProjectVisibility)}
              >
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
                <option value="community">Community</option>
                <option value="public">Public</option>
              </select>
            </label>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ idOrSlug: string }>();
  const idOrSlug = decodeURIComponent(String(params.idOrSlug ?? ""));
  const [detail, setDetail] = useState<ProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ownerSpaces, setOwnerSpaces] = useState<OwnerDeveloperSpace[]>([]);
  const [members, setMembers] = useState<ProjectViewerMember[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [ownerSpacesError, setOwnerSpacesError] = useState<string | null>(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [pendingMemberAction, setPendingMemberAction] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getSession().then(async (session) => {
      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setToken(session.access_token);

      try {
        const loaded = await loadProjectThenOwnerResources(
          () => apiGet<ProjectDetailResponse>(`/projects/${encodeURIComponent(idOrSlug)}`, session.access_token),
          async (): Promise<OwnerProjectResources> => {
            const [spacesResult, membersResult] = await Promise.allSettled([
              apiGet<{ spaces: OwnerDeveloperSpace[] }>("/developer-spaces", session.access_token),
              apiGet<{ members: ProjectViewerMember[] }>(projectMembersPath(idOrSlug), session.access_token),
            ]);
            return {
              spaces: spacesResult.status === "fulfilled" ? spacesResult.value.spaces ?? [] : [],
              members: membersResult.status === "fulfilled" ? membersResult.value.members ?? [] : [],
              spacesError: spacesResult.status === "rejected"
                ? spacesResult.reason instanceof Error ? spacesResult.reason.message : "Could not load owner Developer Spaces."
                : null,
              membersError: membersResult.status === "rejected"
                ? membersResult.reason instanceof Error ? membersResult.reason.message : "Could not load collaborators."
                : null,
            };
          }
        );
        if (!cancelled) {
          setDetail(loaded.detail);
          if (loaded.ownerResources) {
            setOwnerSpaces(loaded.ownerResources.spaces);
            setMembers(loaded.ownerResources.members);
            setOwnerSpacesError(loaded.ownerResources.spacesError);
            setMembersError(loaded.ownerResources.membersError);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load Project.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [idOrSlug]);

  async function refreshProjectState(sessionToken: string) {
    const projectData = await apiGet<ProjectDetailResponse>(
      `/projects/${encodeURIComponent(idOrSlug)}`,
      sessionToken
    );
    setDetail(projectData);
    if (isOwnerProjectDetail(projectData)) {
      const spacesData = await apiGet<{ spaces: OwnerDeveloperSpace[] }>("/developer-spaces", sessionToken);
      setOwnerSpaces(spacesData.spaces ?? []);
      setOwnerSpacesError(null);
    }
  }

  async function refreshMembers(sessionToken: string) {
    const memberData = await apiGet<{ members: ProjectViewerMember[] }>(
      projectMembersPath(idOrSlug),
      sessionToken
    );
    setMembers(memberData.members ?? []);
    setMembersError(null);
  }

  async function handleInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !isValidProjectUsername(inviteUsername)) return;
    setPendingMemberAction("invite");
    setActionError(null);
    setActionMessage(null);
    let invitationCreated = false;
    try {
      await apiPost(
        projectInvitationPath(idOrSlug),
        { username: normaliseProjectUsername(inviteUsername) },
        token
      );
      invitationCreated = true;
      setInviteUsername("");
      await refreshMembers(token);
      setActionMessage("Viewer invitation created.");
    } catch (e) {
      setActionError(
        invitationCreated
          ? "The invitation was created, but the collaborator list could not be refreshed."
          : e instanceof Error ? e.message : "Could not invite this viewer."
      );
    } finally {
      setPendingMemberAction(null);
    }
  }

  async function handleRevoke(member: ProjectViewerMember) {
    if (!token) return;
    const actionKey = `revoke:${member.username}`;
    setPendingMemberAction(actionKey);
    setActionError(null);
    setActionMessage(null);
    let memberUpdated = false;
    try {
      await apiPost(projectMemberRevokePath(idOrSlug), { username: member.username }, token);
      memberUpdated = true;
      await refreshMembers(token);
      setActionMessage(member.status === "invited" ? "Invitation cancelled." : "Viewer access revoked.");
    } catch (e) {
      if (!memberUpdated && e instanceof ApiRequestError && e.status === 404) {
        try {
          await refreshMembers(token);
          setActionError(e.message);
        } catch {
          setActionError("Viewer state changed, but the collaborator list could not be refreshed.");
        }
      } else {
        setActionError(
          memberUpdated
            ? "Viewer access changed, but the collaborator list could not be refreshed."
            : e instanceof Error ? e.message : "Could not update this viewer."
        );
      }
    } finally {
      setPendingMemberAction(null);
    }
  }

  async function handleAttach(spaceId: string) {
    if (!token || !detail || !isOwnerProjectDetail(detail)) return;
    setPendingAction(`attach:${spaceId}`);
    setActionError(null);
    try {
      await apiPatch(`/developer-spaces/${spaceId}/project`, { projectId: detail.project.id }, token);
      await refreshProjectState(token);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not attach Developer Space.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDetach(spaceId: string) {
    if (!token || !detail || !isOwnerProjectDetail(detail)) return;
    setPendingAction(`detach:${spaceId}`);
    setActionError(null);
    try {
      await apiPatch(`/developer-spaces/${spaceId}/project`, { projectId: null }, token);
      await refreshProjectState(token);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not detach Developer Space.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleInstitutionVisibility(visibility: ProjectVisibility) {
    if (!token || !detail || !isInstitutionProjectDetail(detail) || detail.access.readOnly) return;
    setPendingAction("visibility");
    setActionError(null);
    setActionMessage(null);
    try {
      await apiPatch(`/projects/${encodeURIComponent(idOrSlug)}`, { visibility }, token);
      setDetail(await apiGet<ProjectDetailResponse>(`/projects/${encodeURIComponent(idOrSlug)}`, token));
      setActionMessage("Project visibility updated.");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not update Project visibility.");
    } finally {
      setPendingAction(null);
    }
  }

  if (loading) {
    return (
      <main className="station-page">
        <div className="station-page-inner">
          <div className="station-panel" style={{ textAlign: "center", padding: "3rem", color: "#687078" }}>
            Loading Project...
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
            <div className="station-eyebrow">Private Project</div>
            <h1 className="station-page-title" style={{ margin: 0 }}>Sign in to view this Project</h1>
            <p className="station-page-lede">
              Project detail pages use authenticated owner or read-only viewer access.
            </p>
            <Link href={`/login?redirect=${encodeURIComponent(`/projects/${idOrSlug}`)}`} className="station-link-button" style={{ width: "fit-content" }}>
              Sign in
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="station-page">
        <div className="station-page-inner station-page-inner-narrow">
          <div className="station-notice" data-tone="error">
            {error ?? "Project not found."}
          </div>
          <Link href="/projects" className="station-muted-button" style={{ marginTop: "1rem" }}>
            Back to Projects
          </Link>
        </div>
      </main>
    );
  }

  if (isViewerProjectDetail(detail)) {
    return <SharedProjectView detail={detail} />;
  }

  if (isInstitutionProjectDetail(detail)) {
    return (
      <InstitutionProjectView
        detail={detail}
        pending={pendingAction === "visibility"}
        actionError={actionError}
        actionMessage={actionMessage}
        onVisibility={handleInstitutionVisibility}
      />
    );
  }

  const { project, developerSpaces } = detail;
  const evidence = detail.evidence ?? [];
  const activity = normaliseActivity(detail.activity);
  const attachedIds = new Set(developerSpaces.map((space) => space.id));
  const attachCandidates = ownerSpaces.filter((space) => !attachedIds.has(space.id));
  const activityItems = [
    ["Attached spaces", activity.developerSpaces],
    ["Nodes", activity.nodes],
    ["Events", activity.events],
    ["Snapshots", activity.snapshots],
    ["Storage bytes", activity.storageBytes],
    ["Public reads", activity.publicReads],
    ["Exports", activity.exports],
  ] as const;

  return (
    <main className="station-page">
      <div className="station-page-inner station-grid">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Private Project</div>
            <h1 className="station-page-title" style={{ overflowWrap: "anywhere" }}>{project.name}</h1>
            <p className="station-page-lede">
              {project.description || "No description yet."}
            </p>
          </div>
          <Link href="/projects" className="station-muted-button">
            All Projects
          </Link>
        </header>

        <section className="station-grid station-grid-2">
          <div className="station-panel" style={{ display: "grid", gap: "0.9rem" }}>
            <div className="station-action-row">
              <span className="station-status-pill" style={{ textTransform: "capitalize" }}>{project.visibility}</span>
              <span className="station-status-pill">{CONNECTION_LABELS[project.connectionTier]}</span>
            </div>
            <dl className="fact-grid compact" style={{ margin: 0 }}>
              <div>
                <dt>Slug</dt>
                <dd>{project.slug}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(project.createdAt)}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{formatDate(project.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="station-panel" style={{ display: "grid", gap: "0.65rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Attached Developer Spaces</h2>
            <p style={{ margin: 0, color: "#687078", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Attach existing owner Developer Spaces to this private Project, or detach them when they no longer belong here. A Developer Space can belong to one Project at a time.
            </p>
            <Link href="/developer-spaces" className="station-muted-button" style={{ width: "fit-content" }}>
              Open Developer Spaces
            </Link>
          </div>
        </section>

        {actionError && <div className="station-notice" data-tone="error">{actionError}</div>}
        {actionMessage && <div className="station-notice" data-tone="success">{actionMessage}</div>}
        {ownerSpacesError && <div className="station-notice" data-tone="error">{ownerSpacesError}</div>}

        <section className="station-panel project-collaboration-summary" aria-labelledby="project-collaborators-heading">
          <div className="project-collaboration-heading">
            <div>
              <h2 id="project-collaborators-heading">Collaborators</h2>
              <p>Invite one existing Station username for read-only Project access.</p>
            </div>
            <span className="station-status-pill">{membersError ? "Unavailable" : members.length}</span>
          </div>

          <form className="project-collaboration-invite" onSubmit={handleInvite}>
            <label htmlFor="project-viewer-username">Exact Station username</label>
            <div className="project-collaboration-invite-row">
              <input
                id="project-viewer-username"
                className="input"
                value={inviteUsername}
                onChange={(event) => setInviteUsername(event.target.value)}
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z0-9_-]+"
                autoComplete="off"
                aria-describedby="project-viewer-disclosure"
                disabled={Boolean(pendingMemberAction)}
                required
              />
              <button
                className="station-link-button"
                type="submit"
                disabled={Boolean(pendingMemberAction) || !isValidProjectUsername(inviteUsername)}
              >
                {pendingMemberAction === "invite" ? "Inviting..." : "Invite viewer"}
              </button>
            </div>
            <small id="project-viewer-disclosure">
              Viewers receive read-only Project, attached Developer Space, and evidence metadata. Private owner tools, usage, keys, and exports stay unavailable.
            </small>
          </form>

          {membersError ? (
            <div className="station-notice" data-tone="error">{membersError}</div>
          ) : members.length === 0 ? (
            <div className="project-collaboration-empty">No current viewers or pending invitations.</div>
          ) : (
            <div className="project-collaboration-member-list">
              {members.map((member) => (
                <div key={`${member.username}:${member.status}`} className="project-collaboration-member">
                  <div>
                    <strong className="project-collaboration-wrap">@{member.username}</strong>
                    <span>{member.displayName || "Station member"}</span>
                    <small>
                      {member.status === "invited" && member.expiresAt
                        ? `Pending until ${projectCollaborationDate(member.expiresAt)}`
                        : member.respondedAt
                          ? `Active since ${projectCollaborationDate(member.respondedAt)}`
                          : "Active viewer"}
                    </small>
                  </div>
                  <button
                    className="station-muted-button"
                    type="button"
                    disabled={Boolean(pendingMemberAction)}
                    onClick={() => handleRevoke(member)}
                  >
                    {pendingMemberAction === `revoke:${member.username}`
                      ? "Updating..."
                      : projectViewerMemberAction(member)}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="station-panel" style={{ display: "grid", gap: "0.85rem" }} aria-label="Observed Project activity">
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Observed activity</h2>
            <p style={{ margin: "0.3rem 0 0", color: "#687078", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Read-only counters from attached Developer Spaces.
            </p>
          </div>
          <dl className="fact-grid" style={{ margin: 0, gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))" }}>
            {activityItems.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{formatCounter(value)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section style={{ display: "grid", gap: "0.75rem" }} aria-label="Project evidence">
          <div>
            <div className="station-action-row" style={{ alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Project evidence</h2>
              <span className="station-status-pill">{projectEvidenceCountLabel(evidence.length)}</span>
            </div>
            <p style={{ margin: "0.3rem 0 0", color: "#687078", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Owner-only metadata from attached Developer Spaces.
            </p>
          </div>

          {evidence.length === 0 ? (
            <div className="station-panel" style={{ textAlign: "center", padding: "2rem 1.5rem", color: "#687078" }}>
              {projectEvidenceEmptyCopy()}
            </div>
          ) : evidence.map((item) => {
            const routeLabel = projectEvidenceRouteLabel(item);
            const evidenceKey = [
              item.developerSpace.id,
              item.document.id,
              item.role,
              item.linkedAt,
            ].join(":");
            return (
              <article key={evidenceKey} className="station-card" style={{ display: "grid", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="kicker" style={{ marginBottom: "0.35rem" }}>{item.developerSpace.projectName}</div>
                    <h3 style={{ margin: "0 0 0.25rem", fontSize: "1rem", overflowWrap: "anywhere" }}>{item.document.title}</h3>
                    {item.document.sourceLabel ? (
                      <p style={{ margin: 0, color: "#687078", fontSize: "0.84rem", lineHeight: 1.5 }}>
                        {item.document.sourceLabel}
                      </p>
                    ) : null}
                  </div>
                  <span className="pill">{projectEvidenceRoleLabel(item.role)}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", color: "#687078", fontSize: "0.8rem" }}>
                  <span>{item.document.documentType.replace("_", " ")}</span>
                  <span>/</span>
                  <span style={{ textTransform: "capitalize" }}>{item.document.status}</span>
                  <span>/</span>
                  <span style={{ textTransform: "capitalize" }}>{item.document.visibility}</span>
                  <span>/</span>
                  <span>{item.linkVisibility === "public" ? "public link" : "owner link"}</span>
                  <span>/</span>
                  <span>{formatDate(projectEvidenceDate(item))}</span>
                </div>
                {item.routeHref && routeLabel ? (
                  <div className="station-action-row">
                    <Link className="station-muted-button" href={item.routeHref}>{routeLabel}</Link>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>

        <ProjectExportPanel idOrSlug={idOrSlug} token={token} />

        <section style={{ display: "grid", gap: "0.75rem" }}>
          {developerSpaces.length === 0 ? (
            <div className="station-panel" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
              <div className="kicker" style={{ justifyContent: "center", marginBottom: "0.75rem" }}>No attachments</div>
              <h2 style={{ margin: "0 0 0.4rem" }}>No Developer Spaces attached</h2>
              <p style={{ margin: 0, color: "#687078" }}>
                Choose an owner Developer Space below to show it in this Project.
              </p>
            </div>
          ) : developerSpaces.map((space) => (
            <article key={space.id} className="station-card" style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.1rem", overflowWrap: "anywhere" }}>{space.projectName}</h2>
                  <p style={{ margin: 0, color: "#687078", fontSize: "0.88rem", lineHeight: 1.5 }}>
                    {space.description || "No description yet."}
                  </p>
                </div>
                <span className="pill" style={{ textTransform: "capitalize" }}>{space.visibility}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", color: "#687078", fontSize: "0.8rem" }}>
                <span>{visualisationLabel(space.visualisationType)}</span>
                <span>/</span>
                <span>updated {formatDate(space.updatedAt)}</span>
              </div>
              <div className="station-action-row">
                <Link className="station-muted-button" href={`/developer-spaces/${space.slug}`}>View observatory</Link>
                <Link className="station-muted-button" href={`/developer-spaces/${space.slug}/manage`}>Manage</Link>
                <button
                  className="station-muted-button"
                  type="button"
                  disabled={Boolean(pendingAction)}
                  onClick={() => handleDetach(space.id)}
                >
                  {pendingAction === `detach:${space.id}` ? "Detaching..." : "Detach"}
                </button>
              </div>
            </article>
          ))}
        </section>

        <section style={{ display: "grid", gap: "0.75rem" }}>
          <div>
            <h2 style={{ margin: "0 0 0.3rem", fontSize: "1.2rem" }}>Available Developer Spaces</h2>
            <p style={{ margin: 0, color: "#687078", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Owner spaces not currently shown in this Project. Some may already belong to another Project.
            </p>
          </div>

          {ownerSpacesError ? (
            <div className="station-panel" style={{ textAlign: "center", padding: "2rem 1.5rem", color: "#687078" }}>
              Available owner Developer Spaces could not be determined.
            </div>
          ) : attachCandidates.length === 0 ? (
            <div className="station-panel" style={{ textAlign: "center", padding: "2rem 1.5rem", color: "#687078" }}>
              No available owner Developer Spaces.
            </div>
          ) : attachCandidates.map((space) => (
            <article key={space.id} className="station-card" style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 0.25rem", fontSize: "1rem", overflowWrap: "anywhere" }}>{space.projectName}</h3>
                  <p style={{ margin: 0, color: "#687078", fontSize: "0.86rem", lineHeight: 1.5 }}>
                    {space.description || "No description yet."}
                  </p>
                </div>
                <span className="pill" style={{ textTransform: "capitalize" }}>{space.visibility}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", color: "#687078", fontSize: "0.8rem" }}>
                <span>{visualisationLabel(space.visualisationType)}</span>
                <span>/</span>
                <span>updated {formatDate(space.updatedAt)}</span>
              </div>
              <div className="station-notice" style={{ color: "#687078", fontSize: "0.84rem", lineHeight: 1.5 }}>
                {space.projectId
                  ? `Assigned to ${space.assignedProjectName ?? "another owner Project"}. Attaching moves it here.`
                  : "Not attached to a Project."}
              </div>
              <div className="station-action-row">
                <button
                  className="station-link-button"
                  type="button"
                  disabled={Boolean(pendingAction)}
                  onClick={() => handleAttach(space.id)}
                >
                  {pendingAction === `attach:${space.id}` ? "Attaching..." : "Attach to this Project"}
                </button>
                <Link className="station-muted-button" href={`/developer-spaces/${space.slug}/manage`}>Manage</Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
