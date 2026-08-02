"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { InstitutionActivityEntry, InstitutionActivityResponse } from "@station/types";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { institutionActivityPath, institutionDate, institutionDateTime, institutionTeamPath } from "@/lib/institutions";

export default function InstitutionActivityPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(String(params.slug ?? ""));
  const [data, setData] = useState<InstitutionActivityResponse | null>(null);
  const [timeline, setTimeline] = useState<InstitutionActivityEntry[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (sessionToken: string, cursor?: string) => {
    const query = cursor ? `?limit=25&cursor=${encodeURIComponent(cursor)}` : "?limit=25";
    return apiGet<InstitutionActivityResponse>(`${institutionActivityPath(slug)}${query}`, sessionToken);
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    getSession().then(async (session) => {
      if (!session || cancelled) { if (!cancelled) setLoading(false); return; }
      setToken(session.access_token);
      try {
        const response = await load(session.access_token);
        if (!cancelled) { setData(response); setTimeline(response.timeline); }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load Institution activity.");
      } finally { if (!cancelled) setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [load]);

  async function loadMore() {
    if (!token || !data?.nextCursor) return;
    setLoadingMore(true); setError(null);
    try {
      const response = await load(token, data.nextCursor);
      setTimeline((current) => [...current, ...response.timeline]);
      setData((current) => current ? { ...current, nextCursor: response.nextCursor } : response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load more activity.");
    } finally { setLoadingMore(false); }
  }

  if (loading) return <main className="station-page institution-page"><div className="station-page-inner institution-loading">Loading Institution activity...</div></main>;

  return <main className="station-page institution-page"><div className="station-page-inner station-page-inner-narrow institution-stack">
    <header className="station-page-header"><div><div className="station-eyebrow">Institution activity</div><h1 className="station-page-title institution-wrap">{data?.institution.name ?? "Operational history"}</h1><p className="station-page-lede">Bounded operational history across the Institution workspace.</p></div><Link className="station-muted-button" href={institutionTeamPath(slug)}>Back to team</Link></header>
    {error ? <div className="station-notice" data-tone="error">{error}</div> : null}
    {data ? <>
      <section className="institution-section" aria-labelledby="institution-activity-summary"><div className="institution-section-heading"><div><h2 id="institution-activity-summary">Current scope</h2><p>Operational counts, not billing, provider telemetry, or analytics.</p></div><span className="station-status-pill">{data.summary.totalEvents} events</span></div><div className="institution-status-row"><span className="station-status-pill">Team {data.summary.team}</span><span className="station-status-pill">Projects {data.summary.projects}</span><span className="station-status-pill">Publications {data.summary.publications}</span><span className="station-status-pill">Space {data.summary.spaces}</span><span className="station-status-pill">Community {data.summary.communities}</span></div></section>
      <section className="institution-section" aria-labelledby="institution-activity-timeline"><div className="institution-section-heading"><div><h2 id="institution-activity-timeline">Timeline</h2><p>Newest first{data.summary.latestEventAt ? ` / updated ${institutionDate(data.summary.latestEventAt)}` : ""}</p></div></div>{timeline.length === 0 ? <div className="institution-empty">No Institution activity yet.</div> : <div className="institution-member-list">{timeline.map((entry, index) => <article className="institution-member-row" key={`${entry.occurredAt}:${entry.eventType}:${index}`}><div><span className="station-eyebrow">{entry.domain}</span><strong>{entry.title}</strong><span>{entry.actor.label} / {entry.actor.relationship} / {institutionDateTime(entry.occurredAt)}</span>{entry.subject ? <span>{entry.subject.label} / {entry.subject.relationship}</span> : null}</div>{entry.resource ? entry.resource.href ? <Link href={entry.resource.href}>{entry.resource.label}</Link> : <span>{entry.resource.label}</span> : null}</article>)}</div>}</section>
      {data.nextCursor ? <button type="button" className="station-muted-button" disabled={loadingMore} onClick={loadMore}>{loadingMore ? "Loading..." : "Load older activity"}</button> : null}
    </> : null}
  </div></main>;
}
