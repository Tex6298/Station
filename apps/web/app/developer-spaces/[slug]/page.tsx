"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import type { DeveloperSpaceDetail, DeveloperSpaceEvent, DeveloperSpaceNode } from "@station/types/developer-space";

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function nodePosition(index: number, total: number) {
  if (total <= 1) return { left: "50%", top: "50%" };
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const radius = 35;
  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius}%`,
  };
}

function similarityPercent(node: DeveloperSpaceNode) {
  if (node.selfSimilarityScore === null || node.selfSimilarityScore === undefined) return null;
  return Math.round(node.selfSimilarityScore * 100);
}

function metricEntries(node: DeveloperSpaceNode) {
  return Object.entries(node.metrics ?? {}).filter(([, value]) => typeof value !== "object").slice(0, 4);
}

function EventTimeline({ events }: { events: DeveloperSpaceEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="card" style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
        No public events have been ingested yet.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {events.map((event) => (
        <article key={event.id} className="card" style={{ display: "grid", gap: "0.45rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                <strong>{event.eventLabel || event.eventType.replaceAll("_", " ")}</strong>
                <span className="pill" style={{ fontSize: "0.68rem", textTransform: "capitalize" }}>{event.provenance.replace("_", " ")}</span>
                {event.externalNodeId ? <span className="pill" style={{ fontSize: "0.68rem" }}>{event.externalNodeId}</span> : null}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: "0.2rem" }}>
                {formatDate(event.occurredAt)} · {event.eventType}
              </div>
            </div>
            {event.similarityScore !== null && event.similarityScore !== undefined ? (
              <span className="pill" style={{ color: "#93c5fd" }}>{Math.round(event.similarityScore * 100)}% similarity</span>
            ) : null}
          </div>
          {Object.keys(event.eventData ?? {}).length > 0 ? (
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", overflowX: "auto", color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.5 }}>
              {JSON.stringify(event.eventData, null, 2)}
            </pre>
          ) : null}
          {event.sourceRefs.length > 0 ? (
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {event.sourceRefs.map((ref) => <span className="pill" key={ref} style={{ fontSize: "0.68rem", color: "#c4b5fd" }}>{ref}</span>)}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function NodeField({ nodes }: { nodes: DeveloperSpaceNode[] }) {
  const sortedNodes = useMemo(
    () => [...nodes].sort((a, b) => b.fragmentCount - a.fragmentCount),
    [nodes]
  );

  if (nodes.length === 0) {
    return (
      <div className="card" style={{ minHeight: 320, display: "grid", placeItems: "center", color: "#94a3b8", textAlign: "center" }}>
        <div>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>◎</div>
          <strong style={{ color: "#f8fafc" }}>Waiting for first node</strong>
          <p style={{ margin: "0.4rem 0 0" }}>The visualisation will light up as soon as the project runtime sends a node state update.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ minHeight: 420, position: "relative", overflow: "hidden", background: "radial-gradient(circle at center, #172033 0, #111827 45%, #0b0e14 100%)" }}>
      <div style={{ position: "absolute", inset: 24, border: "1px solid #1e293b", borderRadius: "50%", opacity: 0.9 }} />
      <div style={{ position: "absolute", inset: 72, border: "1px dashed #1e293b", borderRadius: "50%", opacity: 0.7 }} />
      {sortedNodes.map((node, index) => {
        const position = nodePosition(index, sortedNodes.length);
        const size = Math.max(56, Math.min(132, 52 + Math.sqrt(node.fragmentCount || 1) * 4));
        const similarity = similarityPercent(node);
        return (
          <div
            key={node.id}
            title={node.nodeName}
            style={{
              position: "absolute",
              left: position.left,
              top: position.top,
              width: size,
              minHeight: size,
              transform: "translate(-50%, -50%)",
              borderRadius: 999,
              border: "1px solid #334155",
              background: "rgba(15, 23, 42, 0.92)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: "0.7rem",
            }}
          >
            <div>
              <strong style={{ display: "block", fontSize: "0.82rem" }}>{node.nodeName}</strong>
              <span style={{ display: "block", color: "#94a3b8", fontSize: "0.68rem", textTransform: "capitalize" }}>{node.topologyType}</span>
              <span style={{ display: "block", color: "#64748b", fontSize: "0.68rem" }}>{node.fragmentCount} fragments</span>
              {similarity !== null ? <span style={{ display: "block", color: "#93c5fd", fontSize: "0.68rem" }}>{similarity}%</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DeveloperSpacePublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [detail, setDetail] = useState<DeveloperSpaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function load() {
      if (!slug) return;
      try {
        const session = await getSession();
        const data = await apiGet<DeveloperSpaceDetail>(`/developer-spaces/${slug}`, session?.access_token);
        if (!cancelled) {
          setDetail(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load Developer Space.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    timer = setInterval(load, 15000);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="container">
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Opening observatory…</div>
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

  const latestEvent = detail.events[0];
  const mostActiveNode = detail.nodes[0];

  return (
    <main className="container" style={{ display: "grid", gap: "1.25rem" }}>
      <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.9rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginBottom: "0.7rem" }}>
              <span className="pill" style={{ color: "#c4b5fd" }}>Live observatory</span>
              <span className="pill" style={{ textTransform: "capitalize" }}>{detail.space.visibility}</span>
              <span className="pill" style={{ textTransform: "capitalize" }}>{detail.space.visualisationType.replace("_", " ")}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: "2rem" }}>{detail.space.projectName}</h1>
            <p style={{ margin: "0.5rem 0 0", color: "#94a3b8", lineHeight: 1.7, maxWidth: 900 }}>
              {detail.space.description || "This Developer Space is ready for a public project description."}
            </p>
          </div>
          {detail.access === "owner" ? (
            <Link className="button" href={`/developer-spaces/${detail.space.slug}/manage`} style={{ textDecoration: "none", height: "fit-content" }}>Manage</Link>
          ) : null}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "0.75rem" }}>
        {[
          ["Nodes", detail.nodes.length],
          ["Events", detail.events.length],
          ["Latest event", latestEvent ? formatDate(latestEvent.occurredAt) : "None"],
          ["Most active", mostActiveNode ? mostActiveNode.nodeName : "None"],
        ].map(([label, value]) => (
          <div key={String(label)} className="card">
            <div style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "0.35rem" }}>{value}</div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.65fr)", gap: "1rem", alignItems: "start" }}>
        <div style={{ display: "grid", gap: "1rem" }}>
          <div>
            <h2 style={{ margin: "0 0 0.6rem", fontSize: "1.2rem" }}>Node field</h2>
            <NodeField nodes={detail.nodes} />
          </div>
          <div>
            <h2 style={{ margin: "0 0 0.6rem", fontSize: "1.2rem" }}>Event stream</h2>
            <EventTimeline events={detail.events} />
          </div>
        </div>

        <aside style={{ display: "grid", gap: "0.75rem" }}>
          <div className="card">
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Current nodes</h2>
            <div style={{ display: "grid", gap: "0.7rem" }}>
              {detail.nodes.length === 0 ? <p style={{ margin: 0, color: "#94a3b8" }}>No nodes yet.</p> : detail.nodes.map((node) => {
                const similarity = similarityPercent(node);
                return (
                  <div key={node.id} style={{ borderTop: "1px solid #1e293b", paddingTop: "0.65rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
                      <strong>{node.nodeName}</strong>
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>{formatDate(node.lastEventAt)}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.45rem" }}>
                      <span className="pill" style={{ fontSize: "0.68rem", textTransform: "capitalize" }}>{node.topologyType}</span>
                      <span className="pill" style={{ fontSize: "0.68rem" }}>{node.fragmentCount} fragments</span>
                      {similarity !== null ? <span className="pill" style={{ fontSize: "0.68rem" }}>{similarity}% similarity</span> : null}
                    </div>
                    {metricEntries(node).length > 0 ? (
                      <div style={{ display: "grid", gap: "0.2rem", marginTop: "0.45rem", color: "#94a3b8", fontSize: "0.78rem" }}>
                        {metricEntries(node).map(([key, value]) => <span key={key}>{key}: {String(value)}</span>)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Latest snapshot</h2>
            {detail.latestSnapshot ? (
              <>
                <p style={{ margin: "0 0 0.5rem", color: "#94a3b8", fontSize: "0.85rem" }}>{formatDate(detail.latestSnapshot.occurredAt)}</p>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", overflowX: "auto", color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>
                  {JSON.stringify(detail.latestSnapshot.snapshotData, null, 2)}
                </pre>
              </>
            ) : (
              <p style={{ margin: 0, color: "#94a3b8" }}>No snapshots yet.</p>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
