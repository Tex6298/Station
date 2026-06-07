"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ArchiveExportPackage } from "@station/types/export";
import { getSession } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  archiveFileTrustCopy,
  archiveJobStatusLabel,
  archiveJobTone,
  archiveJobTrustCopy,
  archiveTrustSummary,
} from "@/lib/archive-trust";
import { ArchiveExportStatus } from "@/components/studio/archive-export-status";
import { PublishContinuityButton } from "@/components/studio/publish-continuity-button";
import { StorageUsagePanel } from "@/components/settings/storage-usage-panel";
import {
  StudioEmptyState,
  StudioPanel,
  StudioStatusBadge,
} from "@/components/studio/studio-frame";
import {
  PersonaWorkspaceHeader,
  type PersonaWithContinuity,
} from "@/components/studio/persona-workspace";

interface PersonaFile {
  id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string;
  source_type: string;
  processed: boolean;
  created_at: string;
}

interface ImportJob {
  id: string;
  kind: string;
  status: string;
  source_name: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export default function PersonaFilesPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [persona, setPersona] = useState<PersonaWithContinuity | null>(null);
  const [files, setFiles] = useState<PersonaFile[]>([]);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [exportPackages, setExportPackages] = useState<ArchiveExportPackage[]>([]);
  const [form, setForm] = useState({ sourceName: "", content: "", relevanceWeight: 1.5 });
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!personaId) return;
    let cancelled = false;

    async function load() {
      try {
        const session = await getSession();
        if (!session) {
          setLoading(false);
          return;
        }
        setToken(session.access_token);
        const [personaData, filesData, jobsData, exportData] = await Promise.all([
          apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token),
          apiGet<{ files: PersonaFile[] }>(`/persona-files/persona/${personaId}`, session.access_token),
          apiGet<{ jobs: ImportJob[] }>(`/imports/persona/${personaId}`, session.access_token),
          apiGet<{ exports: ArchiveExportPackage[] }>(`/exports/persona/${personaId}`, session.access_token).catch(() => ({ exports: [] })),
        ]);
        if (cancelled) return;
        setPersona(personaData.persona);
        setFiles(filesData.files ?? []);
        setJobs(jobsData.jobs ?? []);
        setExportPackages(exportData.exports ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load archive.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [personaId]);

  async function importText(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !persona || !form.content.trim()) return;
    setImporting(true);
    setError(null);
    try {
      const response = await apiPost<{ job: ImportJob; chunksCreated: number }>(
        "/imports/chat",
        {
          personaId: persona.id,
          sourceName: form.sourceName.trim() || "pasted-archive",
          content: form.content,
          relevanceWeight: form.relevanceWeight,
        },
        token
      );
      setJobs((current) => [{ ...response.job, status: "completed" }, ...current]);
      setForm({ sourceName: "", content: "", relevanceWeight: 1.5 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not import archive text.");
      try {
        const jobsData = await apiGet<{ jobs: ImportJob[] }>(`/imports/persona/${persona.id}`, token);
        setJobs(jobsData.jobs ?? []);
      } catch {
        // Keep the direct error visible if refreshing the stored failed job also fails.
      }
    } finally {
      setImporting(false);
    }
  }

  if (loading) return <StudioMessage>Loading archive...</StudioMessage>;
  if (error && !persona) return <StudioMessage tone="error">{error}</StudioMessage>;
  if (!persona) return <StudioMessage tone="error">Persona not found.</StudioMessage>;

  const summary = archiveTrustSummary(files, jobs);

  return (
    <main className="container studio-workspace">
      <PersonaWorkspaceHeader persona={persona} />
      {error && <div className="space-form-error">{error}</div>}

      <section className="archive-trust-grid" aria-label="Archive trust status">
        <StudioPanel>
          <div className="studio-section-heading">
            <div className="section-label">Archive Trust</div>
            <h2>Private source material for {persona.name}</h2>
          </div>
          <p className="archive-trust-copy">
            Imports and files on this page are owner-only archive sources. Completed imports can be linked into continuity; failed imports keep their error message here and do not remove existing archive material.
          </p>
          <div className="archive-trust-stats">
            <TrustMetric label="Sources" value={summary.totalSources} />
            <TrustMetric label="Completed imports" value={summary.completedImports} />
            <TrustMetric label="Needs review" value={summary.failedImports} tone={summary.failedImports > 0 ? "danger" : "info"} />
            <TrustMetric label="Processing" value={summary.processingImports} tone={summary.processingImports > 0 ? "warning" : "info"} />
          </div>
        </StudioPanel>

        <StudioPanel>
          <div className="studio-section-heading">
            <div className="section-label">Storage and Quota</div>
            <h2>Server-reported usage</h2>
          </div>
          <StorageUsagePanel />
        </StudioPanel>
      </section>

      <section className="studio-two-column">
        <form className="studio-editor-panel" onSubmit={importText}>
          <div className="studio-section-heading">
            <div className="section-label">Archive Import</div>
            <h2>Paste source material</h2>
          </div>
          <p className="archive-trust-copy">
            This creates a private import job for this persona. If import fails, Station keeps the error visible and leaves existing archive material untouched.
          </p>
          <input className="input" value={form.sourceName} onChange={(e) => setForm((f) => ({ ...f, sourceName: e.target.value }))} placeholder="Source name" maxLength={200} />
          <textarea className="textarea" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Paste chat logs, notes, letters, or research material." style={{ minHeight: 260 }} required />
          <label className="studio-range-field">
            <span>Default memory weight {form.relevanceWeight.toFixed(2)}</span>
            <input type="range" min={0.1} max={5} step={0.05} value={form.relevanceWeight} onChange={(e) => setForm((f) => ({ ...f, relevanceWeight: Number(e.target.value) }))} />
          </label>
          <button className="button primary" type="submit" disabled={importing}>
            {importing ? "Importing..." : "Import to Archive"}
          </button>
        </form>

        <section className="studio-list-panel">
          <div className="studio-section-heading">
            <div className="section-label">Archive Library</div>
            <h2>{files.length + jobs.length} sources</h2>
          </div>
          <div className="studio-item-list">
            {files.length === 0 && jobs.length === 0 && (
              <StudioEmptyState>No archive sources yet. Paste material to create the first private import job.</StudioEmptyState>
            )}
            {jobs.map((job) => (
              <ImportJobCard key={job.id} job={job} />
            ))}
            {files.map((file) => (
              <ArchiveFileCard key={file.id} file={file} />
            ))}
          </div>
        </section>
      </section>

      <ArchiveExportStatus
        personaId={persona.id}
        token={token}
        exportPackages={exportPackages}
        onCreated={(exportPackage) => setExportPackages((current) => [exportPackage, ...current])}
      />
    </main>
  );
}

function ImportJobCard({ job }: { job: ImportJob }) {
  const copy = archiveJobTrustCopy(job);
  const canPublish = job.status === "completed";

  return (
    <article className="studio-item-card archive-trust-source-card">
      <div>
        <span>{job.kind}</span>
        <div className="archive-trust-card-meta">
          <StudioStatusBadge tone={archiveJobTone(job.status)}>
            {archiveJobStatusLabel(job.status)}
          </StudioStatusBadge>
          <time>{formatDate(job.created_at)}</time>
        </div>
      </div>
      <h3>{job.source_name}</h3>
      <p>{copy.body}</p>
      {job.status === "failed" && job.error_message ? (
        <div className="archive-trust-error">{job.error_message}</div>
      ) : null}
      <div className="archive-trust-next-action">{copy.nextAction}</div>
      {canPublish ? (
        <PublishContinuityButton
          sourceType="archive_import"
          sourceId={job.id}
          defaultTitle={job.source_name}
        />
      ) : null}
    </article>
  );
}

function ArchiveFileCard({ file }: { file: PersonaFile }) {
  return (
    <article className="studio-item-card archive-trust-source-card">
      <div>
        <span>{file.source_type}</span>
        <div className="archive-trust-card-meta">
          <StudioStatusBadge tone={file.processed ? "good" : "warning"}>
            {file.processed ? "Processed" : "Queued"}
          </StudioStatusBadge>
          <time>{formatDate(file.created_at)}</time>
        </div>
      </div>
      <h3>{file.file_name}</h3>
      <p>{archiveFileTrustCopy(file)}</p>
      <div className="archive-trust-next-action">
        {file.file_type || file.storage_path}
        {typeof file.file_size === "number" ? ` / ${formatBytes(file.file_size)}` : ""}
      </div>
      {file.processed ? (
        <PublishContinuityButton
          sourceType="archive_file"
          sourceId={file.id}
          defaultTitle={file.file_name}
        />
      ) : null}
    </article>
  );
}

function TrustMetric({
  label,
  value,
  tone = "info",
}: {
  label: string;
  value: number;
  tone?: "info" | "warning" | "danger";
}) {
  return (
    <div className="archive-trust-metric" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StudioMessage({ children, tone = "normal" }: { children: React.ReactNode; tone?: "normal" | "error" }) {
  return (
    <main className="container">
      <div className={tone === "error" ? "space-form-error" : "card"} style={{ textAlign: "center", padding: "3rem" }}>
        {children}
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
