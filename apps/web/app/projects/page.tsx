"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api-client";
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

const VISIBILITY_OPTIONS: Array<{ value: ProjectVisibility; label: string }> = [
  { value: "private", label: "Private" },
  { value: "unlisted", label: "Unlisted" },
  { value: "community", label: "Community" },
  { value: "public", label: "Public" },
];

const CONNECTION_OPTIONS: Array<{ value: ProjectConnectionTier; label: string }> = [
  { value: "tier_1_showcase", label: "Tier 1 showcase" },
  { value: "tier_2_hosted", label: "Tier 2 hosted" },
  { value: "tier_3_lab", label: "Tier 3 lab" },
];

function suggestSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function connectionLabel(value: ProjectConnectionTier) {
  return CONNECTION_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdMessage, setCreatedMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ProjectVisibility>("private");
  const [connectionTier, setConnectionTier] = useState<ProjectConnectionTier>("tier_1_showcase");

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) {
        setLoading(false);
        return;
      }

      setToken(session.access_token);
      try {
        const data = await apiGet<{ projects: ProjectSummary[] }>("/projects", session.access_token);
        setProjects(data.projects ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load Projects.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

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
          connectionTier,
        },
        token
      );

      setProjects((current) => [data.project, ...current]);
      setName("");
      setSlug("");
      setSlugEdited(false);
      setDescription("");
      setVisibility("private");
      setConnectionTier("tier_1_showcase");
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
            <div className="station-eyebrow">Private Projects</div>
            <h1 className="station-page-title">Projects</h1>
            <p className="station-page-lede">
              Owner-only anchors for active work. Create a Project, then use attached Developer Spaces to see what already belongs to it.
            </p>
          </div>
        </header>

        {error && <div className="station-notice" data-tone="error">{error}</div>}
        {createdMessage && <div className="station-notice" data-tone="success">{createdMessage}</div>}

        <section className="station-grid station-grid-2">
          <form className="station-panel" onSubmit={handleCreate} style={{ display: "grid", gap: "0.9rem" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Create Project</h2>
              <p style={{ margin: "0.3rem 0 0", color: "#687078", fontSize: "0.9rem", lineHeight: 1.5 }}>
                This creates the private Project record only. Attachment and member workflows stay separate.
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

            <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem" }}>
              Connection tier
              <select className="select" value={connectionTier} onChange={(e) => setConnectionTier(e.target.value as ProjectConnectionTier)}>
                {CONNECTION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>

            <button className="button primary" type="submit" disabled={creating || !name.trim() || !slug.trim()}>
              {creating ? "Creating..." : "Create Project"}
            </button>
          </form>

          <div style={{ display: "grid", gap: "0.75rem" }}>
            {projects.length === 0 ? (
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
