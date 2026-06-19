"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet, apiPatch } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

type ProjectVisibility = "private" | "unlisted" | "community" | "public";
type ProjectConnectionTier = "tier_1_showcase" | "tier_2_hosted" | "tier_3_lab";

interface ProjectSummary {
  id: string;
  ownerUserId: string;
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

interface ProjectDetailResponse {
  project: ProjectSummary;
  developerSpaces: AttachedDeveloperSpaceSummary[];
  activity?: Partial<ProjectActivity>;
}

type OwnerDeveloperSpace = AttachedDeveloperSpaceSummary & {
  apiKeyLastFour?: string | null;
  apiKeyCreatedAt?: string | null;
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

export default function ProjectDetailPage() {
  const params = useParams<{ idOrSlug: string }>();
  const idOrSlug = decodeURIComponent(String(params.idOrSlug ?? ""));
  const [detail, setDetail] = useState<ProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ownerSpaces, setOwnerSpaces] = useState<OwnerDeveloperSpace[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getSession().then(async (session) => {
      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setToken(session.access_token);

      try {
        const [projectData, spacesData] = await Promise.all([
          apiGet<ProjectDetailResponse>(`/projects/${encodeURIComponent(idOrSlug)}`, session.access_token),
          apiGet<{ spaces: OwnerDeveloperSpace[] }>("/developer-spaces", session.access_token),
        ]);
        if (!cancelled) {
          setDetail(projectData);
          setOwnerSpaces(spacesData.spaces ?? []);
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
    const [projectData, spacesData] = await Promise.all([
      apiGet<ProjectDetailResponse>(`/projects/${encodeURIComponent(idOrSlug)}`, sessionToken),
      apiGet<{ spaces: OwnerDeveloperSpace[] }>("/developer-spaces", sessionToken),
    ]);
    setDetail(projectData);
    setOwnerSpaces(spacesData.spaces ?? []);
  }

  async function handleAttach(spaceId: string) {
    if (!token || !detail) return;
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
    if (!token) return;
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
              Project detail pages use authenticated owner APIs only.
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

  const { project, developerSpaces } = detail;
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
            <h2 style={{ margin: "0 0 0.3rem", fontSize: "1.2rem" }}>Other Owner Developer Spaces</h2>
            <p style={{ margin: 0, color: "#687078", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Owner spaces not currently shown in this Project. Attaching one moves it to this Project.
            </p>
          </div>

          {attachCandidates.length === 0 ? (
            <div className="station-panel" style={{ textAlign: "center", padding: "2rem 1.5rem", color: "#687078" }}>
              No other owner Developer Spaces.
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
