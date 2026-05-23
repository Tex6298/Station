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
      <main className="container">
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          Loading Developer Spaces…
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="container" style={{ display: "grid", gap: "1.25rem", maxWidth: 1040 }}>
        <section className="card" style={{ padding: "2rem" }}>
          <p className="pill" style={{ margin: 0, color: "#c4b5fd" }}>Developer Spaces</p>
          <h1 style={{ margin: "0.8rem 0 0.5rem", fontSize: "2rem" }}>Live homes for experiments, worlds, and research systems.</h1>
          <p style={{ color: "#94a3b8", lineHeight: 1.7, maxWidth: 760 }}>
            Browse public observatories, or sign in to create one, generate a private ingestion key, and stream project nodes, events, and snapshots into Station.
          </p>
          <Link href="/login" className="button primary" style={{ textDecoration: "none", marginTop: "1rem" }}>Sign in to create one</Link>
        </section>
        {publicSpaces.length > 0 ? (
          <section style={{ display: "grid", gap: "0.75rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Public observatories</h2>
            <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {publicSpaces.map((space) => (
                <Link key={space.id} href={`/developer-spaces/${space.slug}`} className="card" style={{ display: "grid", gap: "0.5rem", textDecoration: "none" }}>
                  <strong>{space.projectName}</strong>
                  <span style={{ color: "#94a3b8", fontSize: "0.86rem", lineHeight: 1.5 }}>{space.description || "Live Station project observatory."}</span>
                  <span className="pill" style={{ width: "fit-content", textTransform: "capitalize" }}>{space.visualisationType.replace("_", " ")}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    );
  }

  return (
    <main className="container" style={{ display: "grid", gap: "1.25rem" }}>
      <section style={{ display: "grid", gap: "0.35rem" }}>
        <p className="pill" style={{ width: "fit-content", color: "#c4b5fd" }}>Developer Spaces</p>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>Project observatories</h1>
        <p style={{ margin: 0, color: "#94a3b8", maxWidth: 900, lineHeight: 1.6 }}>
          Adapted from Intelhub’s observatory pattern: a builder-friendly public layer that keeps the live system, research notes, and community-facing evidence separate from the private researcher interface.
        </p>
      </section>

      {error && (
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#fca5a5" }}>
          {error}
        </div>
      )}
      {createdMessage && (
        <div className="card" style={{ background: "#102719", borderColor: "#1d6b38", color: "#86efac" }}>
          {createdMessage}
        </div>
      )}

      <section className="grid grid-2" style={{ alignItems: "start" }}>
        <form className="card" onSubmit={handleCreate} style={{ display: "grid", gap: "0.9rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Create a Developer Space</h2>
            <p style={{ margin: "0.3rem 0 0", color: "#64748b", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Canon tier and above. Start private, then make it public when your feed is ready.
            </p>
          </div>

          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", color: "#cbd5e1" }}>
            Project name
            <input className="input" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Animus V3 observatory" required />
          </label>

          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", color: "#cbd5e1" }}>
            Public description
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What should visitors understand before watching this project?" />
          </label>

          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", color: "#cbd5e1" }}>
            Visualisation
            <select className="select" value={visualisationType} onChange={(e) => setVisualisationType(e.target.value as DeveloperSpaceVisualisationType)}>
              {VISUALISATION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", color: "#cbd5e1" }}>
            Visibility
            <select className="select" value={visibility} onChange={(e) => setVisibility(e.target.value as DeveloperSpaceVisibility)}>
              {VISIBILITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label} — {option.help}</option>)}
            </select>
          </label>

          <button className="button primary" disabled={creating || !projectName.trim()} type="submit">
            {creating ? "Creating…" : "Create observatory"}
          </button>
        </form>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {spaces.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "#94a3b8" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✦</div>
              <h2 style={{ margin: "0 0 0.4rem", color: "#f8fafc" }}>No observatories yet</h2>
              <p style={{ margin: 0 }}>Create one, rotate an ingestion key, then stream nodes and events from your existing runtime.</p>
            </div>
          ) : spaces.map((space) => (
            <article key={space.id} className="card" style={{ display: "grid", gap: "0.7rem" }}>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.1rem" }}>{space.projectName}</h2>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.5 }}>
                    {space.description || "No description yet."}
                  </p>
                </div>
                <span className="pill" style={{ textTransform: "capitalize" }}>{space.visibility}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", color: "#64748b", fontSize: "0.8rem" }}>
                <span>{space.visualisationType.replace("_", " ")}</span>
                <span>·</span>
                <span>{space.apiKeyLastFour ? `key ••••${space.apiKeyLastFour}` : "no ingestion key yet"}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <Link className="button" href={`/developer-spaces/${space.slug}`} style={{ textDecoration: "none" }}>View observatory</Link>
                <Link className="button" href={`/developer-spaces/${space.slug}/manage`} style={{ textDecoration: "none" }}>Manage</Link>
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
              <Link key={space.id} href={`/developer-spaces/${space.slug}`} className="card" style={{ display: "grid", gap: "0.5rem", textDecoration: "none" }}>
                <strong>{space.projectName}</strong>
                <span style={{ color: "#94a3b8", fontSize: "0.86rem", lineHeight: 1.5 }}>{space.description || "Live Station project observatory."}</span>
                <span className="pill" style={{ width: "fit-content", textTransform: "capitalize" }}>{space.visualisationType.replace("_", " ")}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
