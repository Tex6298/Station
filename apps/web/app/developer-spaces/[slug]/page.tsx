"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import type {
  DeveloperSpaceDetail,
  DeveloperSpaceEvent,
  DeveloperSpaceNode,
  DeveloperSpaceSnapshot,
  DeveloperSpaceVisualisationType,
} from "@station/types/developer-space";

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

function similarityPercent(node: DeveloperSpaceNode | { selfSimilarityScore?: number | null }) {
  if (node.selfSimilarityScore === null || node.selfSimilarityScore === undefined) return null;
  return Math.round(node.selfSimilarityScore * 100);
}

function metricEntries(node: DeveloperSpaceNode) {
  return Object.entries(node.metrics ?? {}).filter(([, value]) => typeof value !== "object").slice(0, 4);
}

function humaniseKey(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not recorded";
  if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.slice(0, 4).map(formatValue).join(", ");
  if (typeof value === "object") return "Structured record";
  return String(value);
}

function publicEntries(record: Record<string, unknown> | null | undefined, limit = 4) {
  return Object.entries(record ?? {})
    .filter(([, value]) => value !== null && value !== undefined && typeof value !== "object")
    .slice(0, limit);
}

function visualisationLabel(type: DeveloperSpaceVisualisationType) {
  const labels: Record<DeveloperSpaceVisualisationType, string> = {
    node_field: "Node field",
    timeline: "Timeline",
    world_map: "World map",
    constellation: "Constellation",
  };
  return labels[type] ?? "Observatory";
}

function EmptyVisualisation() {
  return (
    <div className="card observatory-empty">
      <div>
        <div style={{ fontSize: "1.6rem", marginBottom: "0.75rem", color: "#c4b5fd" }}>Station signal</div>
        <strong style={{ color: "#f8fafc" }}>Waiting for first live signal</strong>
        <p style={{ margin: "0.4rem 0 0" }}>The observatory will light up when the project runtime sends node, event, or snapshot data.</p>
      </div>
    </div>
  );
}

function EventTimeline({ events, showRaw }: { events: DeveloperSpaceEvent[]; showRaw: boolean }) {
  if (events.length === 0) {
    return <div className="card" style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>No public events have been ingested yet.</div>;
  }

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {events.map((event) => {
        const details = publicEntries(event.eventData, 4);
        return (
          <article key={event.id} className="card event-card">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                  <strong>{event.eventLabel || humaniseKey(event.eventType)}</strong>
                  <span className="pill" style={{ fontSize: "0.68rem", textTransform: "capitalize" }}>{event.provenance.replace("_", " ")}</span>
                  {event.externalNodeId ? <span className="pill" style={{ fontSize: "0.68rem" }}>{event.externalNodeId}</span> : null}
                </div>
                <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: "0.2rem" }}>
                  {formatDate(event.occurredAt)} / {humaniseKey(event.eventType)}
                </div>
              </div>
              {event.similarityScore !== null && event.similarityScore !== undefined ? (
                <span className="pill" style={{ color: "#93c5fd" }}>{Math.round(event.similarityScore * 100)}% similarity</span>
              ) : null}
            </div>

            {details.length > 0 ? (
              <dl className="fact-grid" style={{ margin: 0 }}>
                {details.map(([key, value]) => (
                  <div key={key}>
                    <dt>{humaniseKey(key)}</dt>
                    <dd>{formatValue(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {event.sourceRefs.length > 0 ? (
              <div style={{ display: "grid", gap: "0.35rem" }}>
                <span className="section-label" style={{ margin: 0 }}>Sources</span>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {event.sourceRefs.map((ref) => <span className="pill" key={ref} style={{ fontSize: "0.68rem", color: "#c4b5fd" }}>{ref}</span>)}
                </div>
              </div>
            ) : null}

            {showRaw && Object.keys(event.eventData ?? {}).length > 0 ? (
              <details style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                <summary style={{ cursor: "pointer" }}>Raw event data</summary>
                <pre className="raw-json">{JSON.stringify(event.eventData, null, 2)}</pre>
              </details>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function NodeField({ nodes }: { nodes: DeveloperSpaceNode[] }) {
  const sortedNodes = useMemo(() => [...nodes].sort((a, b) => b.fragmentCount - a.fragmentCount), [nodes]);
  if (nodes.length === 0) return <EmptyVisualisation />;

  return (
    <div className="card node-field-panel">
      <div style={{ position: "absolute", inset: 24, border: "1px solid #1e293b", borderRadius: "50%", opacity: 0.9 }} />
      <div style={{ position: "absolute", inset: 72, border: "1px dashed #1e293b", borderRadius: "50%", opacity: 0.7 }} />
      {sortedNodes.map((node, index) => {
        const position = nodePosition(index, sortedNodes.length);
        const size = Math.max(56, Math.min(132, 52 + Math.sqrt(node.fragmentCount || 1) * 4));
        const similarity = similarityPercent(node);
        return (
          <div key={node.id} title={node.nodeName} className="node-bubble" style={{ left: position.left, top: position.top, width: size, minHeight: size }}>
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

function TimelineVisualisation({ nodes, events }: { nodes: DeveloperSpaceNode[]; events: DeveloperSpaceEvent[] }) {
  if (nodes.length === 0 && events.length === 0) return <EmptyVisualisation />;
  const recentEvents = [...events].slice(0, 8).reverse();
  const maxFragments = Math.max(1, ...nodes.map((node) => node.fragmentCount));

  return (
    <div className="card" style={{ display: "grid", gap: "1rem", minHeight: 420 }}>
      <div>
        <div className="section-label">Current trajectory</div>
        <div style={{ display: "grid", gap: "0.7rem" }}>
          {nodes.slice(0, 8).map((node) => {
            const width = Math.max(6, Math.round((node.fragmentCount / maxFragments) * 100));
            return (
              <div key={node.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", fontSize: "0.82rem", marginBottom: "0.25rem" }}>
                  <strong>{node.nodeName}</strong>
                  <span style={{ color: "#94a3b8" }}>{node.fragmentCount} fragments</span>
                </div>
                <div className="meter"><span style={{ width: `${width}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div className="section-label">Recent moments</div>
        <div className="timeline-strip">
          {recentEvents.length === 0 ? <span style={{ color: "#94a3b8" }}>No public event markers yet.</span> : recentEvents.map((event) => (
            <div key={event.id}>
              <span />
              <strong>{event.eventLabel || humaniseKey(event.eventType)}</strong>
              <small>{formatDate(event.occurredAt)}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorldMapVisualisation({ events }: { events: DeveloperSpaceEvent[] }) {
  const zones = new Map<string, DeveloperSpaceEvent[]>();
  for (const event of events) {
    const zone = String(event.eventData?.zone ?? event.eventData?.location ?? event.eventData?.room ?? "Project core");
    const list = zones.get(zone) ?? [];
    list.push(event);
    zones.set(zone, list);
  }
  if (events.length === 0) return <EmptyVisualisation />;

  return (
    <div className="card world-map-panel">
      {Array.from(zones.entries()).slice(0, 9).map(([zone, zoneEvents], index) => (
        <article key={zone} className="zone-card" style={{ transform: `translateY(${index % 2 === 0 ? 0 : 18}px)` }}>
          <div className="section-label">Zone</div>
          <strong>{zone}</strong>
          <p>{zoneEvents.length} recent public {zoneEvents.length === 1 ? "event" : "events"}</p>
          <small>{zoneEvents[0]?.eventLabel || humaniseKey(zoneEvents[0]?.eventType ?? "activity")}</small>
        </article>
      ))}
    </div>
  );
}

function ConstellationVisualisation({ nodes, events }: { nodes: DeveloperSpaceNode[]; events: DeveloperSpaceEvent[] }) {
  if (nodes.length === 0) return <EmptyVisualisation />;
  const sortedNodes = [...nodes].sort((a, b) => b.fragmentCount - a.fragmentCount).slice(0, 12);

  return (
    <div className="card constellation-panel">
      {sortedNodes.map((node, index) => {
        const similarity = similarityPercent(node);
        const nodeEvents = events.filter((event) => event.externalNodeId === node.externalId || event.nodeId === node.id).length;
        return (
          <article key={node.id} className="constellation-node" style={{ gridColumn: `${(index % 3) + 1} / span 1` }}>
            <span className="constellation-dot" />
            <strong>{node.nodeName}</strong>
            <small>{nodeEvents} events / {node.fragmentCount} fragments</small>
            {similarity !== null ? <small>{similarity}% self-similarity</small> : null}
          </article>
        );
      })}
    </div>
  );
}

function ObservatoryVisualisation({ detail }: { detail: DeveloperSpaceDetail }) {
  switch (detail.space.visualisationType) {
    case "timeline":
      return <TimelineVisualisation nodes={detail.nodes} events={detail.events} />;
    case "world_map":
      return <WorldMapVisualisation events={detail.events} />;
    case "constellation":
      return <ConstellationVisualisation nodes={detail.nodes} events={detail.events} />;
    case "node_field":
    default:
      return <NodeField nodes={detail.nodes} />;
  }
}

function SnapshotCard({ snapshot, showRaw }: { snapshot?: DeveloperSpaceSnapshot | null; showRaw: boolean }) {
  if (!snapshot) return <p style={{ margin: 0, color: "#94a3b8" }}>No snapshots yet.</p>;
  const entries = publicEntries(snapshot.snapshotData, 6);

  return (
    <div style={{ display: "grid", gap: "0.7rem" }}>
      <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>{formatDate(snapshot.occurredAt)}</p>
      {entries.length > 0 ? (
        <dl className="fact-grid" style={{ margin: 0 }}>
          {entries.map(([key, value]) => (
            <div key={key}>
              <dt>{humaniseKey(key)}</dt>
              <dd>{formatValue(value)}</dd>
            </div>
          ))}
        </dl>
      ) : <p style={{ margin: 0, color: "#94a3b8" }}>Snapshot received. Add summary fields to make this readable to visitors.</p>}
      {snapshot.sourceRefs.length > 0 ? (
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {snapshot.sourceRefs.map((ref) => <span className="pill" key={ref} style={{ fontSize: "0.68rem", color: "#c4b5fd" }}>{ref}</span>)}
        </div>
      ) : null}
      {showRaw ? (
        <details style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
          <summary style={{ cursor: "pointer" }}>Raw snapshot data</summary>
          <pre className="raw-json">{JSON.stringify(snapshot.snapshotData, null, 2)}</pre>
        </details>
      ) : null}
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
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Opening observatory...</div>
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
  const showRaw = detail.access === "owner";

  return (
    <main className="container observatory-shell">
      <section className="hero-card observatory-hero">
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginBottom: "0.7rem" }}>
              <span className="pill" style={{ color: "#c4b5fd" }}>Live observatory</span>
              <span className="pill" style={{ textTransform: "capitalize" }}>{detail.space.visibility}</span>
              <span className="pill" style={{ textTransform: "capitalize" }}>{visualisationLabel(detail.space.visualisationType)}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.7rem)", maxWidth: 980 }}>{detail.space.projectName}</h1>
            <p style={{ margin: "0.8rem 0 0", color: "#b7c1d6", lineHeight: 1.75, maxWidth: 880 }}>
              {detail.space.description || "This Developer Space is ready for a public project description that explains what visitors are watching and why it matters."}
            </p>
          </div>
          {detail.access === "owner" ? <Link className="button" href={`/developer-spaces/${detail.space.slug}/manage`} style={{ height: "fit-content" }}>Manage</Link> : null}
        </div>
      </section>

      <section className="metric-grid">
        {[
          ["Nodes", detail.nodes.length],
          ["Events", detail.events.length],
          ["Latest event", latestEvent ? formatDate(latestEvent.occurredAt) : "None"],
          ["Most active", mostActiveNode ? mostActiveNode.nodeName : "None"],
        ].map(([label, value]) => (
          <div key={String(label)} className="card metric-card">
            <div className="section-label">{label}</div>
            <div>{value}</div>
          </div>
        ))}
      </section>

      <section className="observatory-grid">
        <div style={{ display: "grid", gap: "1rem" }}>
          <div>
            <h2 style={{ margin: "0 0 0.6rem", fontSize: "1.2rem" }}>{visualisationLabel(detail.space.visualisationType)}</h2>
            <ObservatoryVisualisation detail={detail} />
          </div>
          <div>
            <h2 style={{ margin: "0 0 0.6rem", fontSize: "1.2rem" }}>Event stream</h2>
            <EventTimeline events={detail.events} showRaw={showRaw} />
          </div>
        </div>

        <aside style={{ display: "grid", gap: "0.75rem" }}>
          <div className="card">
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>How to read this</h2>
            <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.65, fontSize: "0.88rem" }}>
              This is the public layer of a running project. Nodes are entities or systems being tracked. Events are live signals from the runtime. Snapshots are curated state summaries for the archive.
            </p>
          </div>

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
                      <dl className="fact-grid compact" style={{ marginTop: "0.55rem" }}>
                        {metricEntries(node).map(([key, value]) => (
                          <div key={key}>
                            <dt>{humaniseKey(key)}</dt>
                            <dd>{formatValue(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Latest snapshot</h2>
            <SnapshotCard snapshot={detail.latestSnapshot} showRaw={showRaw} />
          </div>
        </aside>
      </section>
    </main>
  );
}
