"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { ArchiveExportPackage } from "@station/types/export";
import type { ContinuityCandidate } from "@station/types/persona";
import { getSession } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  ARCHIVE_FILE_IMPORT_ACCEPT,
  archiveFileImportErrorMessage,
  archiveFileImportSelection,
  archiveFileTypeReadback,
  archiveFileTrustCopy,
  archiveImportJobReadback,
  archiveJobStatusLabel,
  archiveJobTone,
  documentMigratorHandoffReadback,
  archiveTrustScopeRows,
  archiveTrustStateRows,
  archiveTrustSummary,
  supportedImportFormatRows,
  type DocumentMigratorHandoffReadback,
  type DocumentMigratorHandoffRow,
  type ArchiveTrustScopeRow,
  type ArchiveTrustStateRow,
  type SupportedImportFormatRow,
} from "@/lib/archive-trust";
import { ArchiveExportStatus } from "@/components/studio/archive-export-status";
import { ArchiveConnectorOwnerPanel } from "@/components/studio/archive-connector-owner-panel";
import { ImportReviewInbox } from "@/components/studio/import-review-inbox";
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
import {
  importPreviewCanConfirm,
  importPreviewFailureCopy,
  importPreviewInputKey,
  importPreviewNoWriteCopy,
  importPreviewStatusCopy,
  type ImportPreviewReadback,
} from "@/lib/import-preview";

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

interface ArchiveState {
  persona: PersonaWithContinuity;
  files: PersonaFile[];
  jobs: ImportJob[];
  candidates: ContinuityCandidate[];
  exports?: ArchiveExportPackage[];
}

interface UploadUrlResponse {
  uploadUrl: string;
  storagePath: string;
  token: string;
}

interface ImportPreviewResponse {
  preview: ImportPreviewReadback;
}

export default function PersonaFilesPage() {
  const { personaId } = useParams<{ personaId: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [persona, setPersona] = useState<PersonaWithContinuity | null>(null);
  const [files, setFiles] = useState<PersonaFile[]>([]);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [importCandidates, setImportCandidates] = useState<ContinuityCandidate[]>([]);
  const [exportPackages, setExportPackages] = useState<ArchiveExportPackage[]>([]);
  const [form, setForm] = useState({ sourceName: "", content: "", relevanceWeight: 1.5 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [previewingText, setPreviewingText] = useState(false);
  const [textPreview, setTextPreview] = useState<ImportPreviewReadback | null>(null);
  const [textPreviewKey, setTextPreviewKey] = useState<string | null>(null);
  const [textPreviewError, setTextPreviewError] = useState<string | null>(null);
  const [fileImporting, setFileImporting] = useState(false);
  const [previewingFile, setPreviewingFile] = useState(false);
  const [filePreview, setFilePreview] = useState<ImportPreviewReadback | null>(null);
  const [filePreviewKey, setFilePreviewKey] = useState<string | null>(null);
  const [filePreviewError, setFilePreviewError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileImportNotice, setFileImportNotice] = useState<string | null>(null);

  const fetchArchiveState = useCallback(async (sessionToken: string, options: { includeExports?: boolean } = {}): Promise<ArchiveState> => {
    const includeExports = options.includeExports !== false;
    const [personaData, filesData, jobsData, candidatesData, exportData] = await Promise.all([
      apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, sessionToken),
      apiGet<{ files: PersonaFile[] }>(`/persona-files/persona/${personaId}`, sessionToken),
      apiGet<{ jobs: ImportJob[] }>(`/imports/persona/${personaId}`, sessionToken),
      apiGet<{ candidates: ContinuityCandidate[] }>(`/conversations/persona/${personaId}/candidates?source=import&status=all`, sessionToken),
      includeExports
        ? apiGet<{ exports: ArchiveExportPackage[] }>(`/exports/persona/${personaId}`, sessionToken).catch(() => ({ exports: [] }))
        : Promise.resolve(undefined),
    ]);

    return {
      persona: personaData.persona,
      files: filesData.files ?? [],
      jobs: jobsData.jobs ?? [],
      candidates: candidatesData.candidates ?? [],
      exports: exportData?.exports,
    };
  }, [personaId]);

  const applyArchiveState = useCallback((state: ArchiveState) => {
    setPersona(state.persona);
    setFiles(state.files);
    setJobs(state.jobs);
    setImportCandidates(state.candidates);
    if (state.exports) setExportPackages(state.exports);
  }, []);

  const refreshArchiveState = useCallback(async (sessionToken: string, options: { includeExports?: boolean } = {}) => {
    applyArchiveState(await fetchArchiveState(sessionToken, options));
  }, [applyArchiveState, fetchArchiveState]);

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
        const state = await fetchArchiveState(session.access_token);
        if (cancelled) return;
        applyArchiveState(state);
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
  }, [applyArchiveState, fetchArchiveState, personaId]);

  async function previewText() {
    if (!token || !persona || !form.content.trim()) return;
    setPreviewingText(true);
    setTextPreviewError(null);
    setError(null);
    setFileImportNotice(null);
    const previewKey = textImportPreviewKey(form);

    try {
      const response = await apiPost<ImportPreviewResponse>(
        "/imports/preview",
        {
          personaId: persona.id,
          sourceKind: "paste",
          sourceName: form.sourceName.trim() || "pasted-archive",
          fileType: "text/plain",
          content: form.content,
        },
        token
      );
      setTextPreview(response.preview);
      setTextPreviewKey(previewKey);
    } catch (e) {
      setTextPreview(null);
      setTextPreviewKey(null);
      setTextPreviewError(importPreviewFailureCopy(e));
    } finally {
      setPreviewingText(false);
    }
  }

  async function importText(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !persona || !form.content.trim()) return;
    if (!importPreviewCanConfirm(textPreview, textPreviewKey, textImportPreviewKey(form))) {
      setError("Preview this exact pasted source before confirming import.");
      return;
    }
    setImporting(true);
    setError(null);
    setFileImportNotice(null);
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
      setTextPreview(null);
      setTextPreviewKey(null);
      setTextPreviewError(null);
      await refreshArchiveState(token, { includeExports: false });
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

  async function previewFile() {
    if (!token || !persona) return;

    const selection = archiveFileImportSelection(selectedFile);
    if (!selection.ok) {
      setFilePreviewError(selection.message);
      setFilePreview(null);
      setFilePreviewKey(null);
      return;
    }

    const file = selectedFile!;
    setPreviewingFile(true);
    setFilePreviewError(null);
    setError(null);
    setFileImportNotice(null);

    try {
      const content = await file.text();
      const response = await apiPost<ImportPreviewResponse>(
        "/imports/preview",
        {
          personaId: persona.id,
          sourceKind: "file",
          sourceName: file.name,
          fileType: file.type || "application/octet-stream",
          content,
        },
        token
      );
      setFilePreview(response.preview);
      setFilePreviewKey(fileImportPreviewKey(file));
    } catch (e) {
      setFilePreview(null);
      setFilePreviewKey(null);
      setFilePreviewError(importPreviewFailureCopy(e));
    } finally {
      setPreviewingFile(false);
    }
  }

  async function importFile(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !persona) return;

    const selection = archiveFileImportSelection(selectedFile);
    if (!selection.ok) {
      setError(selection.message);
      return;
    }

    const file = selectedFile!;
    if (!importPreviewCanConfirm(filePreview, filePreviewKey, fileImportPreviewKey(file))) {
      setError("Preview this exact file before confirming upload.");
      return;
    }

    setFileImporting(true);
    setError(null);
    setFileImportNotice(null);

    try {
      const uploadData = await apiGet<UploadUrlResponse>(
        `/persona-files/persona/${persona.id}/upload-url?fileName=${encodeURIComponent(file.name)}&fileSize=${file.size}`,
        token,
      );

      const { error: uploadError } = await createBrowserStorageClient()
        .storage
        .from("persona-files")
        .uploadToSignedUrl(uploadData.storagePath, uploadData.token, file, {
          contentType: file.type || "application/octet-stream",
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Private storage upload failed.");
      }

      await apiPost(
        `/persona-files/persona/${persona.id}/register`,
        {
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          storagePath: uploadData.storagePath,
          sourceType: "import",
          processImmediately: true,
        },
        token,
      );

      setSelectedFile(null);
      setFilePreview(null);
      setFilePreviewKey(null);
      setFilePreviewError(null);
      setFileInputKey((current) => current + 1);
      setFileImportNotice("File import queued for private archive processing.");
      await refreshArchiveState(token, { includeExports: false });
    } catch (e) {
      setError(archiveFileImportErrorMessage(e));
      try {
        await refreshArchiveState(token, { includeExports: false });
      } catch {
        // Keep the sanitized upload/register error visible if the follow-up refresh fails.
      }
    } finally {
      setFileImporting(false);
    }
  }

  async function handleCandidateUpdated(candidate: ContinuityCandidate) {
    setImportCandidates((current) => current.map((item) => item.id === candidate.id ? candidate : item));
    if (!token) return;
    try {
      await refreshArchiveState(token, { includeExports: false });
    } catch {
      // Keep the reviewed candidate visible even if the cheap follow-up refresh fails.
    }
  }

  if (loading) return <StudioMessage>Loading archive...</StudioMessage>;
  if (error && !persona) return <StudioMessage tone="error">{error}</StudioMessage>;
  if (!persona) return <StudioMessage tone="error">Persona not found.</StudioMessage>;

  const summary = archiveTrustSummary(files, jobs);
  const migratorHandoff = documentMigratorHandoffReadback(files, jobs, importCandidates);
  const scopeRows = archiveTrustScopeRows(files, jobs, persona.continuity);
  const stateRows = archiveTrustStateRows(files, jobs);
  const supportedImportRows = supportedImportFormatRows();
  const currentTextPreviewKey = textImportPreviewKey(form);
  const canConfirmTextImport = importPreviewCanConfirm(textPreview, textPreviewKey, currentTextPreviewKey);
  const currentFilePreviewKey = fileImportPreviewKey(selectedFile);
  const canConfirmFileImport = importPreviewCanConfirm(filePreview, filePreviewKey, currentFilePreviewKey);

  return (
    <main className="container studio-workspace">
      <PersonaWorkspaceHeader persona={persona} />
      {error && <div className="space-form-error">{error}</div>}
      {fileImportNotice && <div className="station-notice" data-tone="success">{fileImportNotice}</div>}

      <DocumentMigratorHandoffPanel readback={migratorHandoff} personaId={persona.id} />

      <section className="archive-trust-grid" aria-label="Archive trust status">
        <StudioPanel>
          <div className="studio-section-heading">
            <div className="section-label">Archive Trust</div>
            <h2>Private source material for {persona.name}</h2>
          </div>
          <p className="archive-trust-copy">
            This page tracks owner-only pasted and file import sources. Archived chats are counted separately in runtime context and storage usage, so a zero here does not mean the persona has no archive material.
          </p>
          <div className="archive-trust-stats">
            <TrustMetric label="Import sources" value={summary.totalSources} />
            <TrustMetric label="Completed imports" value={summary.completedImports} />
            <TrustMetric label="Needs review" value={summary.failedImports} tone={summary.failedImports > 0 ? "danger" : "info"} />
            <TrustMetric label="Processing" value={summary.processingImports} tone={summary.processingImports > 0 ? "warning" : "info"} />
          </div>
          <ArchiveTrustScopeReadback rows={scopeRows} />
          <ArchiveTrustStateReadback rows={stateRows} />
        </StudioPanel>

        <StudioPanel>
          <div className="studio-section-heading">
            <div className="section-label">Storage and Quota</div>
            <h2>Server-reported usage</h2>
          </div>
          <StorageUsagePanel />
        </StudioPanel>
      </section>

      <ImportPipelineReadback rows={supportedImportRows} />

      <ArchiveConnectorOwnerPanel
        token={token}
        personaId={persona.id}
        onArchiveImported={() => token ? refreshArchiveState(token, { includeExports: false }) : undefined}
      />

      <section id="document-migrator-import-review" aria-label="Document Migrator Import Review handoff">
        <ImportReviewInbox
          candidates={importCandidates}
          token={token}
          sourceCount={files.length + jobs.length}
          onCandidateUpdated={handleCandidateUpdated}
        />
      </section>

      <section className="studio-two-column">
        <div style={{ display: "grid", gap: "1rem" }}>
          <form id="document-migrator-paste-source" className="studio-editor-panel" onSubmit={importText}>
            <div className="studio-section-heading">
              <div className="section-label">Archive Import</div>
              <h2>Paste source material</h2>
            </div>
            <p className="archive-trust-copy">
              Preview the pasted source first. Confirming import remains a separate owner action that creates the private import job.
            </p>
            <input className="input" value={form.sourceName} onChange={(e) => setForm((f) => ({ ...f, sourceName: e.target.value }))} placeholder="Source name" maxLength={200} />
            <textarea className="textarea" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Paste chat logs, notes, letters, or research material." style={{ minHeight: 260 }} required />
            <ImportPreviewCard preview={textPreview} error={textPreviewError} currentSourceReady={canConfirmTextImport} />
            <label className="studio-range-field">
              <span>Default memory weight {form.relevanceWeight.toFixed(2)}</span>
              <input type="range" min={0.1} max={5} step={0.05} value={form.relevanceWeight} onChange={(e) => setForm((f) => ({ ...f, relevanceWeight: Number(e.target.value) }))} />
            </label>
            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              <button className="button" type="button" disabled={previewingText || !form.content.trim()} onClick={previewText}>
                {previewingText ? "Previewing..." : "Preview pasted source"}
              </button>
              <button className="button primary" type="submit" disabled={importing || !canConfirmTextImport}>
                {importing ? "Importing..." : "Confirm import pasted source"}
              </button>
            </div>
            <div className="archive-trust-next-action">{importPreviewNoWriteCopy(canConfirmTextImport ? textPreview : null)}</div>
          </form>

          <form id="document-migrator-file-import" className="studio-editor-panel" onSubmit={importFile}>
            <div className="studio-section-heading">
              <div className="section-label">Archive File Import</div>
              <h2>Upload a private source file</h2>
            </div>
            <p className="archive-trust-copy">
              Preview one .txt, .md, .markdown, .text, or .json file before upload. ChatGPT, Claude, Reddit, and Discord exports are owner-only file imports here; this is not a live provider, OAuth, bot, or API pull.
            </p>
            <input
              key={fileInputKey}
              className="input"
              type="file"
              accept={ARCHIVE_FILE_IMPORT_ACCEPT}
              onChange={(event) => {
                setSelectedFile(event.currentTarget.files?.[0] ?? null);
                setFilePreview(null);
                setFilePreviewKey(null);
                setFilePreviewError(null);
              }}
              disabled={fileImporting}
            />
            <div className="archive-trust-next-action">
              The signed upload URL is used only for this browser upload and is never shown in the page.
              {selectedFile ? ` Selected local file / ${formatBytes(selectedFile.size)}` : ""}
            </div>
            <ImportPreviewCard preview={filePreview} error={filePreviewError} currentSourceReady={canConfirmFileImport} />
            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              <button className="button" type="button" disabled={previewingFile || !selectedFile} onClick={previewFile}>
                {previewingFile ? "Previewing..." : "Preview selected file"}
              </button>
              <button className="button primary" type="submit" disabled={fileImporting || !canConfirmFileImport}>
                {fileImporting ? "Uploading..." : "Confirm upload file import"}
              </button>
            </div>
            <div className="archive-trust-next-action">{importPreviewNoWriteCopy(canConfirmFileImport ? filePreview : null)}</div>
          </form>
        </div>

        <section id="document-migrator-archive-library" className="studio-list-panel">
          <div className="studio-section-heading">
            <div className="section-label">Archive Import Library</div>
            <h2>{formatImportSourceCount(files.length + jobs.length)}</h2>
          </div>
          <div className="studio-item-list">
            {files.length === 0 && jobs.length === 0 && (
              <StudioEmptyState>No pasted or file archive sources yet. Archived chats can still appear in runtime context and storage usage.</StudioEmptyState>
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
        onRefreshed={setExportPackages}
      />
    </main>
  );
}

function DocumentMigratorHandoffPanel({
  readback,
  personaId,
}: {
  readback: DocumentMigratorHandoffReadback;
  personaId: string;
}) {
  const links = [
    {
      label: "Preview pasted source",
      href: "#document-migrator-paste-source",
      detail: "No-write preview before a separate owner confirmation.",
    },
    {
      label: "Preview export file",
      href: "#document-migrator-file-import",
      detail: "Text, Markdown, and known JSON exports only.",
    },
    {
      label: "Review import candidates",
      href: "#document-migrator-import-review",
      detail: "Explicit owner review before Memory or Canon.",
    },
    {
      label: "Open Memory inbox",
      href: `/studio/personas/${personaId}/memory-inbox`,
      detail: "Import-backed candidate review stays separate from Archive intake.",
    },
    {
      label: "Open Global Archive",
      href: "/studio/archive",
      detail: "Owner-wide Archive search; persona Archive remains source intake.",
    },
    {
      label: "Review storage usage",
      href: "/settings",
      detail: "Server-reported usage, not invented source counts.",
    },
  ];

  return (
    <section aria-label="Document Migrator handoff">
      <StudioPanel>
        <div className="studio-section-heading">
          <div className="section-label">Document Migrator</div>
          <h2>{readback.title}</h2>
        </div>
        <p className="archive-trust-copy">{readback.body}</p>
        <div className="archive-format-grid">
          {readback.rows.map((row) => (
            <DocumentMigratorHandoffCard key={row.id} row={row} />
          ))}
        </div>
        <div className="archive-trust-next-action">{readback.boundary}</div>
        <div className="studio-action-row" aria-label="Document Migrator handoff links">
          {links.map((link) => (
            <a key={link.href} className="button" href={link.href} title={link.detail}>
              {link.label}
            </a>
          ))}
        </div>
      </StudioPanel>
    </section>
  );
}

function DocumentMigratorHandoffCard({ row }: { row: DocumentMigratorHandoffRow }) {
  const content = (
    <>
      <div className="archive-format-row-header">
        <span>{row.label}</span>
        <StudioStatusBadge tone={row.tone}>{row.value}</StudioStatusBadge>
      </div>
      <p>{row.body}</p>
      <div className="archive-format-detail">{row.nextAction}</div>
    </>
  );

  if (!row.target) {
    return <article className="archive-format-row">{content}</article>;
  }

  return (
    <a className="archive-format-row" href={`#${row.target}`}>
      {content}
    </a>
  );
}

function ImportPreviewCard({
  preview,
  error,
  currentSourceReady,
}: {
  preview: ImportPreviewReadback | null;
  error: string | null;
  currentSourceReady: boolean;
}) {
  if (error) {
    return <div className="archive-trust-error">{error}</div>;
  }

  if (!preview) {
    return (
      <div className="archive-trust-next-action">
        Preview returns format and count readback only. It does not create archive sources, import jobs, storage uploads, Memory, or Canon.
      </div>
    );
  }

  return (
    <article className="studio-item-card archive-trust-source-card">
      <div>
        <span>{preview.sourceLabel}</span>
        <div className="archive-trust-card-meta">
          <StudioStatusBadge tone={currentSourceReady ? "good" : "warning"}>
            {currentSourceReady ? "Preview current" : "Preview stale"}
          </StudioStatusBadge>
          <StudioStatusBadge tone="info">{preview.formatLabel}</StudioStatusBadge>
        </div>
      </div>
      <p>{importPreviewStatusCopy(preview)}</p>
      <div className="archive-trust-next-action">
        No write performed: storage, import jobs, archive chunks, import review candidates, provider calls, Memory, and Canon are unchanged.
      </div>
    </article>
  );
}

function ArchiveTrustScopeReadback({ rows }: { rows: ArchiveTrustScopeRow[] }) {
  return (
    <div className="studio-item-list" style={{ marginTop: "1rem" }} aria-label="Archive scope readback">
      {rows.map((row) => (
        <article key={row.id} className="studio-item-card archive-trust-source-card">
          <div>
            <span>{row.label}</span>
            <div className="archive-trust-card-meta">
              <StudioStatusBadge tone={row.tone}>{row.value}</StudioStatusBadge>
            </div>
          </div>
          <p>{row.body}</p>
          <div className="archive-trust-next-action">{row.nextAction}</div>
        </article>
      ))}
    </div>
  );
}

function ImportJobCard({ job }: { job: ImportJob }) {
  const copy = archiveImportJobReadback(job);
  const canPublish = job.status === "completed";

  return (
    <article className="studio-item-card archive-trust-source-card">
      <div>
        <span>{copy.kindLabel}</span>
        <div className="archive-trust-card-meta">
          <StudioStatusBadge tone="info">
            {copy.formatLabel}
          </StudioStatusBadge>
          <StudioStatusBadge tone={archiveJobTone(job.status)}>
            {archiveJobStatusLabel(job.status)}
          </StudioStatusBadge>
          <time>{formatDate(job.created_at)}</time>
        </div>
      </div>
      <h3>{copy.sourceLabel}</h3>
      <p>{copy.body}</p>
      {job.status === "failed" && job.error_message ? (
        <div className="archive-trust-error">{job.error_message}</div>
      ) : null}
      <div className="archive-trust-next-action">{copy.nextAction}</div>
      <div className="archive-trust-next-action">{copy.boundary}</div>
      {canPublish ? (
        <PublishContinuityButton
          sourceType="archive_import"
          sourceId={job.id}
          defaultTitle={copy.sourceLabel}
        />
      ) : null}
    </article>
  );
}

function ImportPipelineReadback({ rows }: { rows: SupportedImportFormatRow[] }) {
  return (
    <section aria-label="Import pipeline readback">
      <StudioPanel>
        <div className="studio-section-heading">
          <div className="section-label">Import Pipeline</div>
          <h2>Supported owner imports</h2>
        </div>
        <p className="archive-trust-copy">
          Station currently accepts pasted source material on this page and stored uploaded files through the file import path. Parsed provider exports become private archive material first; Memory and Canon candidates stay pending for owner review.
        </p>
        <div className="archive-format-grid">
          {rows.map((row) => (
            <article key={row.id} className="archive-format-row">
              <div className="archive-format-row-header">
                <span>{row.label}</span>
                <StudioStatusBadge tone="info">Owner-only</StudioStatusBadge>
              </div>
              <p>{row.input}</p>
              <div className="archive-format-detail">{row.result}</div>
              <div className="archive-format-detail">{row.review}</div>
              <div className="archive-format-detail">{row.boundary}</div>
            </article>
          ))}
        </div>
      </StudioPanel>
    </section>
  );
}

function ArchiveTrustStateReadback({ rows }: { rows: ArchiveTrustStateRow[] }) {
  return (
    <div className="studio-item-list" style={{ marginTop: "1rem" }} aria-label="Archive state readback">
      {rows.map((row) => (
        <article key={row.id} className="studio-item-card archive-trust-source-card">
          <div>
            <span>{row.label}</span>
            <div className="archive-trust-card-meta">
              <StudioStatusBadge tone={row.tone}>{row.value}</StudioStatusBadge>
            </div>
          </div>
          <p>{row.body}</p>
          <div className="archive-trust-next-action">{row.nextAction}</div>
        </article>
      ))}
    </div>
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
        {archiveFileTypeReadback(file.file_type)}
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

function createBrowserStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Private storage upload is not configured.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function textImportPreviewKey(input: { sourceName: string; content: string }) {
  return importPreviewInputKey({
    sourceKind: "paste",
    sourceName: input.sourceName.trim() || "pasted-archive",
    fileType: "text/plain",
    content: input.content,
  });
}

function fileImportPreviewKey(file: File | null) {
  if (!file) return "";

  return importPreviewInputKey({
    sourceKind: "file",
    sourceName: file.name,
    fileType: file.type || "application/octet-stream",
    size: file.size,
    lastModified: file.lastModified,
    content: "",
  });
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

function formatImportSourceCount(count: number) {
  return `${count} import ${count === 1 ? "source" : "sources"}`;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
