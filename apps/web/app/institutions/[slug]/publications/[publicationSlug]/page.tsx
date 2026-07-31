"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { InstitutionPublicationDetail, InstitutionPublicationDocumentType } from "@station/types";
import { ApiRequestError, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { institutionPublicationWorkPath, institutionTeamPath } from "@/lib/institutions";

export default function InstitutionPublicationWorkspacePage() {
  const params = useParams<{ slug: string; publicationSlug: string }>();
  const institutionSlug = decodeURIComponent(String(params.slug ?? ""));
  const publicationSlug = decodeURIComponent(String(params.publicationSlug ?? ""));
  const [publication, setPublication] = useState<InstitutionPublicationDetail | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [documentType, setDocumentType] = useState<InstitutionPublicationDocumentType>("article");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async (sessionToken: string) => {
    const response = await apiGet<{ publication: InstitutionPublicationDetail }>(institutionPublicationWorkPath(institutionSlug, publicationSlug), sessionToken);
    setPublication(response.publication);
    setTitle(response.publication.title);
    setSummary(response.publication.summary);
    setBody(response.publication.body);
    setDocumentType(response.publication.documentType);
  }, [institutionSlug, publicationSlug]);

  useEffect(() => {
    let cancelled = false;
    getSession().then(async (session) => {
      if (!session || cancelled) return;
      setToken(session.access_token);
      try { await load(session.access_token); }
      catch (loadError) { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Institution publication not found."); }
    });
    return () => { cancelled = true; };
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !publication) return;
    setPending("save"); setError(null); setMessage(null);
    try {
      await apiPatch(institutionPublicationWorkPath(institutionSlug, publicationSlug), { title, summary, body, documentType, expectedVersion: publication.version }, token);
      await load(token);
      setMessage("Draft saved.");
    } catch (actionError) {
      if (actionError instanceof ApiRequestError && actionError.status === 409) setError("This draft changed. Reload it before saving your edit.");
      else setError(actionError instanceof Error ? actionError.message : "Could not save this draft.");
    } finally { setPending(null); }
  }

  async function transition(action: "publish" | "retract") {
    if (!token || !publication) return;
    setPending(action); setError(null); setMessage(null);
    try {
      await apiPost(`${institutionPublicationWorkPath(institutionSlug, publicationSlug)}/${action}`, { expectedVersion: publication.version }, token);
      await load(token);
      setMessage(action === "publish" ? "Publication is now public." : "Publication returned to private draft.");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : `Could not ${action} this publication.`);
    } finally { setPending(null); }
  }

  return (
    <main className="station-page institution-page">
      <div className="station-page-inner station-page-inner-narrow institution-stack">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Institution publication</div>
            <h1 className="station-page-title institution-wrap">{publication?.title ?? "Publication workspace"}</h1>
            {publication ? <p className="station-page-lede">{publication.institution.name} / {publication.project.name}</p> : null}
          </div>
          <Link className="station-muted-button" href={institutionTeamPath(institutionSlug)}>Back to team</Link>
        </header>
        {error ? <div className="station-notice" data-tone="error">{error}</div> : null}
        {message ? <div className="station-notice" data-tone="success">{message}</div> : null}
        {!publication && !error ? <div className="station-notice">Loading publication...</div> : null}
        {publication ? (
          <form className="station-panel institution-stack" onSubmit={save}>
            <div className="institution-status-row">
              <span className="station-status-pill">{publication.status}</span>
              <span className="station-status-pill">Version {publication.version}</span>
              <span className="station-status-pill">{publication.access.role === "institution_owner" ? "Owner" : "Member"}</span>
            </div>
            <p>Created by {publication.creatorLabel}. Last edited by {publication.lastEditorLabel}.</p>
            <label className="institution-field"><span>Title</span><input className="input" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required /></label>
            <label className="institution-field"><span>Summary</span><textarea className="input" value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} maxLength={1000} required /></label>
            <label className="institution-field"><span>Document type</span><select className="input" value={documentType} onChange={(event) => setDocumentType(event.target.value as InstitutionPublicationDocumentType)}><option value="article">Article</option><option value="research">Research</option><option value="report">Report</option><option value="note">Note</option></select></label>
            <label className="institution-field"><span>Draft</span><textarea className="input" value={body} onChange={(event) => setBody(event.target.value)} rows={18} maxLength={100000} required /></label>
            <div className="station-action-row">
              <button className="station-link-button" type="submit" disabled={pending !== null || publication.status !== "draft"}>{pending === "save" ? "Saving..." : "Save draft"}</button>
              {publication.access.canPublish ? <button className="station-link-button" type="button" disabled={pending !== null} onClick={() => transition("publish")}>{pending === "publish" ? "Publishing..." : "Publish"}</button> : null}
              {publication.access.canRetract ? <button className="station-muted-button" type="button" disabled={pending !== null} onClick={() => transition("retract")}>{pending === "retract" ? "Retracting..." : "Retract"}</button> : null}
              {publication.publicHref ? <Link className="station-muted-button" href={publication.publicHref}>Open public page</Link> : null}
            </div>
          </form>
        ) : null}
      </div>
    </main>
  );
}
