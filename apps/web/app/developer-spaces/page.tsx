"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import type { DeveloperSpaceRecord, DeveloperSpaceVisibility, DeveloperSpaceVisualisationType } from "@station/types/developer-space";

const VISIBILITY_OPTIONS: Array<{ value: DeveloperSpaceVisibility; label: string; help: string }> = [
  { value: "private", label: "Private", help: "Only you can see it while you wire things up." },
  { value: "unlisted", label: "Unlisted", help: "Shareable by link, hidden from public discovery." },
  { value: "community", label: "Community", help: "Visible to signed-in Station members." },
  { value: "public", label: "Public", help: "Open observatory for visitors and search." },
];

const VISUALISATION_OPTIONS: Array<{ value: DeveloperSpaceVisualisationType; label: string }> = [
  { value: "node_field", label: "Node field" },
  { value: "timeline", label: "Timeline" },
  { value: "world_map", label: "World map" },
  { value: "constellation", label: "Constellation" },
];

export default function DeveloperSpacesPage() {
  const [spaces, setSpaces] = useState<DeveloperSpaceRecord[]>([]);
  const [publicSpaces, setPublicSpaces] = useState<DeveloperSpaceRecord[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdMessage, setCreatedMessage] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<DeveloperSpaceVisibility>("private");
  const [visualisationType, setVisualisationType] = useState<DeveloperSpaceVisualisationType>("node_field");

  async function loadSpaces(sessionToken: string) {
    const data = await apiGet<{ spaces: DeveloperSpaceRecord[] }>("/developer-spaces", sessionToken);
    setSpaces(data.spaces ?? []);
  }

  async function loadPublicSpaces() {
    const data = await apiGet<{ spaces: DeveloperSpaceRecord[] }>("/developer-spaces/public");
    setPublicSpaces(data.spaces ?? []);
  }

  useEffect(() => {
    getSession().then(async (session) => {
      try {
        await loadPublicSpaces();
        if (!session) {
          setLoading(false);
          return;
        }
        setToken(session.access_token);
        await loadSpaces(session.access_token);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load Developer Spaces.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError(null);
    setCreatedMessage(null);
    try {
      const data = await apiPost<{ space: DeveloperSpaceRecord }>(
        "/developer-spaces",
        {
          projectName,
          description: description || undefined,
          visibility,
          visualisationType,
        },
        token
      );
      setSpaces((current) => [data.space, ...current]);
      setProjectName("");
      setDescription("");
      setVisibility("private");
      setVisualisationType("node_field");
      setCreatedMessage(`Created ${data.space.projectName}. Open Manage to create an ingestion key.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create Developer Space.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <main className="station-page">
        <div className="station-page-inner">
        <div className="station-panel" style={{ textAlign: "center", padding: "3rem", color: "#687078" }}>
          Loading Developer Spaces...
        </div>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="station-page">
        <div className="station-page-inner station-grid" style={{ maxWidth: 1040 }}>
        <section className="station-panel" style={{ padding: "2rem" }}>
          <p className="station-status-pill" style={{ margin: 0, color: "#534ab7" }}>Developer Spaces</p>
          <h1 className="station-page-title">Live homes for experiments, worlds, and research systems.</h1>
          <p className="station-page-lede">
            Browse public observatories, or sign in to create one, generate a private ingestion key, and stream project nodes, events, and snapshots into Station.
          </p>
          <Link href="/login" className="station-link-button" style={{ marginTop: "1rem" }}>Sign in to create one</Link>
        </section>
        {publicSpaces.length > 0 ? (
          <section style={{ display: "grid", gap: "0.75rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Public observatories</h2>
            <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {publicSpaces.map((space) => (
                <Link key={space.id} href={`/developer-spaces/${space.slug}`} className="station-card" style={{ display: "grid", gap: "0.5rem", textDecoration: "none" }}>
                  <strong>{space.projectName}</strong>
                  <span style={{ color: "#687078", fontSize: "0.86rem", lineHeight: 1.5 }}>{space.description || "Live Station project observatory."}</span>
                  <span className="pill" style={{ width: "fit-content", textTransform: "capitalize" }}>{space.visualisationType.replace("_", " ")}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="station-page">
      <div className="station-page-inner station-grid">
      <section style={{ display: "grid", gap: "0.35rem" }}>
        <p className="station-status-pill" style={{ color: "#534ab7" }}>Developer Spaces</p>
        <h1 className="station-page-title">Project observatories</h1>
        <p className="station-page-lede" style={{ maxWidth: 900 }}>
          Give running AI projects a public home that visitors can understand: live signals, provenance, research notes, and a clear boundary between the observatory and the private builder console.
        </p>
      </section>

      {error && (
        <div className="station-notice" data-tone="error">
          {error}
        </div>
      )}
      {createdMessage && (
        <div className="station-notice" data-tone="success">
          {createdMessage}
        </div>
      )}

      <section className="grid grid-2" style={{ alignItems: "start" }}>
        <form className="station-panel" onSubmit={handleCreate} style={{ display: "grid", gap: "0.9rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Create a Developer Space</h2>
            <p style={{ margin: "0.3rem 0 0", color: "#687078", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Canon / Developer tier and above. Start private, then make it public when your feed is ready.
            </p>
          </div>

          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", color: "#1f2529" }}>
            Project name
            <input className="input" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Animus V3 observatory" required />
          </label>

          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", color: "#1f2529" }}>
            Public description
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What should visitors understand before watching this project?" />
          </label>

          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", color: "#1f2529" }}>
            Visualisation
            <select className="select" value={visualisationType} onChange={(e) => setVisualisationType(e.target.value as DeveloperSpaceVisualisationType)}>
              {VISUALISATION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", color: "#1f2529" }}>
            Visibility
            <select className="select" value={visibility} onChange={(e) => setVisibility(e.target.value as DeveloperSpaceVisibility)}>
              {VISIBILITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label} - {option.help}</option>)}
            </select>
          </label>

          <button className="button primary" disabled={creating || !projectName.trim()} type="submit">
            {creating ? "Creating..." : "Create observatory"}
          </button>
        </form>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {spaces.length === 0 ? (
            <div className="station-panel" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "#687078" }}>
              <div className="kicker" style={{ justifyContent: "center", marginBottom: "0.75rem" }}>Ready for a signal</div>
              <h2 style={{ margin: "0 0 0.4rem", color: "#1f2529" }}>No observatories yet</h2>
              <p style={{ margin: 0 }}>Create one, rotate an ingestion key, then stream nodes and events from your existing runtime.</p>
            </div>
          ) : spaces.map((space) => (
            <article key={space.id} className="station-card" style={{ display: "grid", gap: "0.7rem" }}>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.1rem" }}>{space.projectName}</h2>
                  <p style={{ margin: 0, color: "#687078", fontSize: "0.88rem", lineHeight: 1.5 }}>
                    {space.description || "No description yet."}
                  </p>
                </div>
                <span className="pill" style={{ textTransform: "capitalize" }}>{space.visibility}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", color: "#687078", fontSize: "0.8rem" }}>
                <span>{space.visualisationType.replace("_", " ")}</span>
                <span>/</span>
                <span>{space.apiKeyLastFour ? `key ****${space.apiKeyLastFour}` : "no ingestion key yet"}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <Link className="station-muted-button" href={`/developer-spaces/${space.slug}`}>View observatory</Link>
                <Link className="station-muted-button" href={`/developer-spaces/${space.slug}/manage`}>Manage</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {publicSpaces.length > 0 && (
        <section style={{ display: "grid", gap: "0.75rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Public observatories</h2>
          <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {publicSpaces.map((space) => (
              <Link key={space.id} href={`/developer-spaces/${space.slug}`} className="station-card" style={{ display: "grid", gap: "0.5rem", textDecoration: "none" }}>
                <strong>{space.projectName}</strong>
                <span style={{ color: "#687078", fontSize: "0.86rem", lineHeight: 1.5 }}>{space.description || "Live Station project observatory."}</span>
                <span className="pill" style={{ width: "fit-content", textTransform: "capitalize" }}>{space.visualisationType.replace("_", " ")}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>
    </main>
  );
}
