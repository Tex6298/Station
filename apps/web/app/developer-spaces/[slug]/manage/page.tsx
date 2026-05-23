"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import type { DeveloperSpaceDetail } from "@station/types/developer-space";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function CodeBlock({ code }: { code: string }) {
  return (
    <pre style={{
      margin: 0,
      whiteSpace: "pre-wrap",
      overflowX: "auto",
      background: "#020617",
      border: "1px solid #1e293b",
      borderRadius: 12,
      padding: "0.9rem",
      color: "#cbd5e1",
      fontSize: "0.78rem",
      lineHeight: 1.55,
    }}>
      {code}
    </pre>
  );
}

export default function DeveloperSpaceManagePage() {
  const { slug } = useParams<{ slug: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [detail, setDetail] = useState<DeveloperSpaceDetail | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(sessionToken: string) {
    const data = await apiGet<DeveloperSpaceDetail>(`/developer-spaces/${slug}`, sessionToken);
    setDetail(data);
  }

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) {
        setLoading(false);
        return;
      }
      setToken(session.access_token);
      try {
        await load(session.access_token);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load Developer Space.");
      } finally {
        setLoading(false);
      }
    });
  }, [slug]);

  async function rotateKey() {
    if (!token || !detail) return;
    setRotating(true);
    setError(null);
    try {
      const data = await apiPost<{ apiKey: string; space: DeveloperSpaceDetail["space"] }>(
        `/developer-spaces/${detail.space.id}/api-key`,
        {},
        token
      );
      setApiKey(data.apiKey);
      setDetail({ ...detail, space: data.space });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not rotate API key.");
    } finally {
      setRotating(false);
    }
  }

  const nodeStateCurl = useMemo(() => {
    const key = apiKey ?? "$STATION_DEVELOPER_KEY";
    return `curl -X POST "${API_URL}/developer-spaces/ingest/nodes/animus-alpha/state" \\
  -H "X-Station-Developer-Key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nodeName": "Animus Alpha",
    "topologyType": "radial",
    "fragmentCount": 128,
    "selfSimilarityScore": 0.73,
    "dimensionality": 12,
    "metrics": {
      "interNodeDistance": 0.41,
      "crystallisations": 7
    },
    "sourceRefs": ["run-2026-05-23"],
    "provenance": "api"
  }'`;
  }, [apiKey]);

  const eventCurl = useMemo(() => {
    const key = apiKey ?? "$STATION_DEVELOPER_KEY";
    return `curl -X POST "${API_URL}/developer-spaces/ingest/events" \\
  -H "X-Station-Developer-Key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "eventType": "fragment_absorbed",
    "eventLabel": "Alpha absorbed a grief-domain fragment",
    "nodeId": "animus-alpha",
    "similarityScore": 0.73,
    "eventData": {
      "domain": "grief",
      "fragmentId": "frag_0042"
    },
    "sourceRefs": ["fragment-ledger:frag_0042"],
    "provenance": "api",
    "visibility": "public"
  }'`;
  }, [apiKey]);

  const snapshotCurl = useMemo(() => {
    const key = apiKey ?? "$STATION_DEVELOPER_KEY";
    return `curl -X POST "${API_URL}/developer-spaces/ingest/snapshots" \\
  -H "X-Station-Developer-Key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "snapshotData": {
      "summary": "Weekly manifold snapshot",
      "nodes": 3,
      "meanSelfSimilarity": 0.68
    },
    "sourceRefs": ["weekly-snapshot-18"],
    "provenance": "api"
  }'`;
  }, [apiKey]);

  if (loading) {
    return (
      <main className="container">
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading management console…</div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="container" style={{ maxWidth: 900 }}>
        <div className="card" style={{ padding: "2rem" }}>
          <h1 style={{ marginTop: 0 }}>Sign in required</h1>
          <p style={{ color: "#94a3b8" }}>You need to sign in to manage a Developer Space.</p>
          <Link href="/login" className="button primary" style={{ textDecoration: "none" }}>Sign in</Link>
        </div>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="container">
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#fca5a5" }}>
          {error ?? "Developer Space not found."}
        </div>
      </main>
    );
  }

  if (detail.access !== "owner") {
    return (
      <main className="container">
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#fca5a5" }}>
          Only the Developer Space owner can access this management console.
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ display: "grid", gap: "1.25rem", maxWidth: 1120 }}>
      <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
        <Link href="/developer-spaces" style={{ color: "#94a3b8" }}>Developer Spaces</Link>
        <span style={{ margin: "0 0.4rem" }}>›</span>
        <Link href={`/developer-spaces/${detail.space.slug}`} style={{ color: "#94a3b8" }}>{detail.space.projectName}</Link>
        <span style={{ margin: "0 0.4rem" }}>›</span>
        <span>Manage</span>
      </div>

      <section className="card" style={{ display: "grid", gap: "0.8rem", padding: "1.4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p className="pill" style={{ margin: "0 0 0.65rem", color: "#c4b5fd" }}>Researcher interface</p>
            <h1 style={{ margin: 0, fontSize: "1.9rem" }}>{detail.space.projectName}</h1>
            <p style={{ color: "#94a3b8", maxWidth: 760, lineHeight: 1.6 }}>
              Keep this page private. It manages API keys and shows raw ingestion instructions; the public observatory remains separate for visitors.
            </p>
          </div>
          <Link className="button" href={`/developer-spaces/${detail.space.slug}`} style={{ textDecoration: "none", height: "fit-content" }}>Open observatory</Link>
        </div>
      </section>

      {error && (
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "minmax(300px, 0.7fr) minmax(0, 1.3fr)", gap: "1rem", alignItems: "start" }}>
        <aside className="card" style={{ display: "grid", gap: "1rem" }}>
          <div>
            <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.05rem" }}>Ingestion key</h2>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.55 }}>
              Keys are shown once, hashed before storage, and can be rotated anytime. Put the key in your runtime environment, not in browser code.
            </p>
          </div>

          <div style={{ display: "grid", gap: "0.35rem", fontSize: "0.82rem", color: "#cbd5e1" }}>
            <span>Current key</span>
            <span className="pill" style={{ width: "fit-content" }}>
              {detail.space.apiKeyLastFour ? `•••• ${detail.space.apiKeyLastFour}` : "No key generated"}
            </span>
          </div>

          <button className="button primary" onClick={rotateKey} disabled={rotating}>
            {rotating ? "Rotating…" : detail.space.apiKeyLastFour ? "Rotate key" : "Generate key"}
          </button>

          {apiKey ? (
            <div style={{ display: "grid", gap: "0.45rem" }}>
              <strong style={{ color: "#86efac" }}>Copy this now</strong>
              <textarea className="textarea" value={apiKey} readOnly style={{ minHeight: 88, fontFamily: "monospace" }} />
              <p style={{ margin: 0, color: "#fbbf24", fontSize: "0.82rem", lineHeight: 1.45 }}>
                Station will not show this key again.
              </p>
            </div>
          ) : null}

          <hr />

          <div style={{ display: "grid", gap: "0.45rem", color: "#94a3b8", fontSize: "0.86rem", lineHeight: 1.5 }}>
            <span><strong style={{ color: "#f8fafc" }}>Nodes:</strong> {detail.nodes.length}</span>
            <span><strong style={{ color: "#f8fafc" }}>Recent events:</strong> {detail.events.length}</span>
            <span><strong style={{ color: "#f8fafc" }}>Visibility:</strong> {detail.space.visibility}</span>
          </div>
        </aside>

        <section style={{ display: "grid", gap: "1rem" }}>
          <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>1. Send node state updates</h2>
            <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
              Use stable external node IDs. Station upserts each node and emits a public state-update event for the observatory timeline.
            </p>
            <CodeBlock code={nodeStateCurl} />
          </div>

          <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>2. Stream events</h2>
            <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
              Events are the visitor-facing feed. Include provenance and sourceRefs so viewers can distinguish runtime output, imports, and AI-generated material.
            </p>
            <CodeBlock code={eventCurl} />
          </div>

          <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>3. Save periodic snapshots</h2>
            <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
              Snapshots support historical playback later. Send a compact full-state summary weekly or at the end of important runs.
            </p>
            <CodeBlock code={snapshotCurl} />
          </div>
        </section>
      </section>
    </main>
  );
}
