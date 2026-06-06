"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet, apiPost, apiUrl } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { formatDate, humaniseKey } from "@/lib/developer-space-observatory";
import type {
  DeveloperSpaceDetail,
  DeveloperSpaceDocumentRole,
  DeveloperSpaceLinkedDocument,
  DeveloperSpaceLiveUpdate,
  DeveloperSpaceUsage,
} from "@station/types/developer-space";
import type { ArchiveExportPackage } from "@station/types/export";

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

function linkedDocumentRoleLabel(role: DeveloperSpaceLinkedDocument["role"]) {
  if (role === "field_log") return "Field log";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

export default function DeveloperSpaceManagePage() {
  const { slug } = useParams<{ slug: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [detail, setDetail] = useState<DeveloperSpaceDetail | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<"connecting" | "live" | "reconnecting">("connecting");
  const [lastLiveAt, setLastLiveAt] = useState<string | null>(null);
  const [documentRole, setDocumentRole] = useState<DeveloperSpaceDocumentRole>("methodology");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentBody, setDocumentBody] = useState("");
  const [publishDocument, setPublishDocument] = useState(false);
  const [savingDocument, setSavingDocument] = useState(false);
  const [usage, setUsage] = useState<DeveloperSpaceUsage | null>(null);
  const [exportsList, setExportsList] = useState<ArchiveExportPackage[]>([]);
  const [exporting, setExporting] = useState(false);

  async function load(sessionToken: string) {
    const data = await apiGet<DeveloperSpaceDetail>(`/developer-spaces/${slug}`, sessionToken);
    setDetail(data);
    const [usageData, exportsData] = await Promise.all([
      apiGet<{ usage: DeveloperSpaceUsage }>(`/developer-spaces/${data.space.id}/usage`, sessionToken),
      apiGet<{ exports: ArchiveExportPackage[] }>(`/exports/developer-spaces/${data.space.id}`, sessionToken),
    ]);
    setUsage(usageData.usage);
    setExportsList(exportsData.exports);
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

  useEffect(() => {
    if (!slug || !token) return;
    const streamUrl = new URL(apiUrl(`/developer-spaces/${slug}/stream`));
    streamUrl.searchParams.set("access_token", token);
    const stream = new EventSource(streamUrl.toString());

    stream.onopen = () => setLiveStatus("live");
    stream.onerror = () => setLiveStatus("reconnecting");
    stream.addEventListener("developer_space.update", (event) => {
      const update = JSON.parse((event as MessageEvent).data) as DeveloperSpaceLiveUpdate;
      setDetail(update.detail);
      setLastLiveAt(update.freshness.emittedAt);
      setLiveStatus("live");
    });

    return () => stream.close();
  }, [slug, token]);

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
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading management console...</div>
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

  async function createLinkedDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !detail) return;
    setSavingDocument(true);
    setError(null);
    try {
      const data = await apiPost<{
        linkedDocuments: DeveloperSpaceLinkedDocument[];
      }>(
        `/developer-spaces/${detail.space.id}/documents/template`,
        {
          role: documentRole,
          title: documentTitle.trim() || undefined,
          body: documentBody.trim() || undefined,
          linkVisibility: publishDocument ? "public" : "owner",
        },
        token
      );
      setDetail({ ...detail, linkedDocuments: data.linkedDocuments });
      setDocumentTitle("");
      setDocumentBody("");
      setPublishDocument(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create linked document.");
    } finally {
      setSavingDocument(false);
    }
  }

  async function createExportPackage() {
    if (!token || !detail) return;
    setExporting(true);
    setError(null);
    try {
      const data = await apiPost<{
        exportPackage: ArchiveExportPackage;
      }>(`/exports/developer-spaces/${detail.space.id}`, {}, token);
      setExportsList([data.exportPackage, ...exportsList]);
      const usageData = await apiGet<{ usage: DeveloperSpaceUsage }>(`/developer-spaces/${detail.space.id}/usage`, token);
      setUsage(usageData.usage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create export package.");
    } finally {
      setExporting(false);
    }
  }

  const liveLabel = liveStatus === "live"
    ? lastLiveAt ? `Live ${formatDate(lastLiveAt)}` : "Live"
    : liveStatus === "connecting"
      ? "Connecting"
      : "Reconnecting";
  const ingestionEvents = detail.events.slice(0, 5);

  return (
    <main className="container" style={{ display: "grid", gap: "1.25rem", maxWidth: 1120 }}>
      <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
        <Link href="/developer-spaces" style={{ color: "#94a3b8" }}>Developer Spaces</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <Link href={`/developer-spaces/${detail.space.slug}`} style={{ color: "#94a3b8" }}>{detail.space.projectName}</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
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
              {detail.space.apiKeyLastFour ? `**** ${detail.space.apiKeyLastFour}` : "No key generated"}
            </span>
          </div>

          <button className="button primary" onClick={rotateKey} disabled={rotating}>
            {rotating ? "Rotating..." : detail.space.apiKeyLastFour ? "Rotate key" : "Generate key"}
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
            <span><strong style={{ color: "#f8fafc" }}>Notes:</strong> {detail.linkedDocuments?.length ?? 0}</span>
            <span><strong style={{ color: "#f8fafc" }}>Exports:</strong> {usage?.counters.exports ?? exportsList.length}</span>
            <span><strong style={{ color: "#f8fafc" }}>Visibility:</strong> {detail.space.visibility}</span>
          </div>

          <hr />

          <div style={{ display: "grid", gap: "0.45rem", color: "#94a3b8", fontSize: "0.84rem", lineHeight: 1.5 }}>
            <h2 style={{ margin: 0, fontSize: "1rem" }}>Usage</h2>
            {!usage ? (
              <span>Loading usage...</span>
            ) : (
              <>
                <span><strong style={{ color: "#f8fafc" }}>Ingested:</strong> {usage.counters.events} events / {usage.counters.snapshots} snapshots</span>
                <span><strong style={{ color: "#f8fafc" }}>Storage:</strong> {formatBytes(usage.counters.storageBytes)} of {usage.limits.storageBytes < 0 ? "unlimited" : formatBytes(usage.limits.storageBytes)}</span>
                <span><strong style={{ color: "#f8fafc" }}>Public reads:</strong> {usage.counters.publicReads}</span>
                <span className="pill" style={{ color: usage.warningLevel === "ok" ? "#86efac" : "#fbbf24", width: "fit-content", textTransform: "capitalize" }}>{usage.warningLevel}</span>
              </>
            )}
          </div>

          <hr />

          <div style={{ display: "grid", gap: "0.6rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
              <h2 style={{ margin: 0, fontSize: "1rem" }}>Live ingestion</h2>
              <span className="pill" style={{ color: liveStatus === "live" ? "#86efac" : "#fbbf24" }}>{liveLabel}</span>
            </div>
            {ingestionEvents.length === 0 ? (
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.84rem" }}>No ingested events yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.45rem" }}>
                {ingestionEvents.map((event) => (
                  <div key={event.id} style={{ borderTop: "1px solid #1e293b", paddingTop: "0.45rem" }}>
                    <strong style={{ display: "block", fontSize: "0.82rem" }}>{event.eventLabel || humaniseKey(event.eventType)}</strong>
                    <span style={{ color: "#64748b", fontSize: "0.74rem" }}>{formatDate(event.occurredAt)} / {event.visibility}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section style={{ display: "grid", gap: "1rem" }}>
          <div className="card" style={{ display: "grid", gap: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem" }}>Exports</h2>
                <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                  Owner-only JSON/Markdown packages include nodes, events, snapshots, usage, and public-safe linked document refs.
                </p>
              </div>
              <button className="button primary" onClick={createExportPackage} disabled={exporting}>
                {exporting ? "Exporting..." : "Create export"}
              </button>
            </div>
            {exportsList.length === 0 ? (
              <p style={{ margin: 0, color: "#94a3b8" }}>No export packages yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {exportsList.slice(0, 5).map((item) => (
                  <div key={item.id} style={{ borderTop: "1px solid #1e293b", paddingTop: "0.55rem", display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ display: "block" }}>{item.packageKind.replaceAll("_", " ")}</strong>
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>{formatDate(item.completedAt ?? item.requestedAt)}</span>
                    </div>
                    <span className="pill" style={{ textTransform: "capitalize" }}>{item.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ display: "grid", gap: "0.9rem" }}>
            <div>
              <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.05rem" }}>Project notes</h2>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                Keep methodology and field logs beside the live observatory. Drafts stay owner-only; public notes are published into the visitor view.
              </p>
            </div>

            <form onSubmit={createLinkedDocument} style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(150px, 0.45fr) minmax(0, 1fr)", gap: "0.75rem" }}>
                <label style={{ display: "grid", gap: "0.35rem", color: "#cbd5e1", fontSize: "0.82rem" }}>
                  Type
                  <select className="input" value={documentRole} onChange={(event) => setDocumentRole(event.target.value as DeveloperSpaceDocumentRole)}>
                    <option value="methodology">Methodology</option>
                    <option value="finding">Finding</option>
                    <option value="field_log">Field log</option>
                    <option value="note">Note</option>
                  </select>
                </label>
                <label style={{ display: "grid", gap: "0.35rem", color: "#cbd5e1", fontSize: "0.82rem" }}>
                  Title
                  <input className="input" value={documentTitle} onChange={(event) => setDocumentTitle(event.target.value)} placeholder="Use default title" />
                </label>
              </div>
              <label style={{ display: "grid", gap: "0.35rem", color: "#cbd5e1", fontSize: "0.82rem" }}>
                Body
                <textarea className="textarea" value={documentBody} onChange={(event) => setDocumentBody(event.target.value)} placeholder="Draft notes, method, finding, or field log" />
              </label>
              <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "#cbd5e1", fontSize: "0.86rem" }}>
                <input type="checkbox" checked={publishDocument} onChange={(event) => setPublishDocument(event.target.checked)} />
                Publish publicly on the observatory
              </label>
              <button className="button primary" type="submit" disabled={savingDocument}>
                {savingDocument ? "Saving..." : "Save note"}
              </button>
            </form>

            {(detail.linkedDocuments ?? []).length === 0 ? (
              <p style={{ margin: 0, color: "#94a3b8" }}>No linked notes yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.65rem" }}>
                {(detail.linkedDocuments ?? []).map((link) => (
                  <article key={link.id} style={{ borderTop: "1px solid #1e293b", paddingTop: "0.65rem" }}>
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                      <span className="pill" style={{ fontSize: "0.68rem" }}>{linkedDocumentRoleLabel(link.role)}</span>
                      <span className="pill" style={{ fontSize: "0.68rem", textTransform: "capitalize" }}>{link.document.status}</span>
                      <span className="pill" style={{ fontSize: "0.68rem", textTransform: "capitalize" }}>{link.linkVisibility}</span>
                    </div>
                    <strong style={{ display: "block" }}>{link.document.title}</strong>
                    {link.document.excerpt ? (
                      <p style={{ margin: "0.35rem 0 0", color: "#94a3b8", lineHeight: 1.55 }}>{link.document.excerpt}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>

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
