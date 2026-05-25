"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api-client";
import { PublishContinuityButton } from "@/components/studio/publish-continuity-button";
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
        const [personaData, filesData, jobsData] = await Promise.all([
          apiGet<{ persona: PersonaWithContinuity }>(`/personas/${personaId}`, session.access_token),
          apiGet<{ files: PersonaFile[] }>(`/persona-files/persona/${personaId}`, session.access_token),
          apiGet<{ jobs: ImportJob[] }>(`/imports/persona/${personaId}`, session.access_token),
        ]);
        if (cancelled) return;
        setPersona(personaData.persona);
        setFiles(filesData.files ?? []);
        setJobs(jobsData.jobs ?? []);
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
          sourceName: form.sourceName || "pasted-archive",
          content: form.content,
          relevanceWeight: form.relevanceWeight,
        },
        token
      );
      setJobs((current) => [{ ...response.job, status: "completed" }, ...current]);
      setForm({ sourceName: "", content: "", relevanceWeight: 1.5 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not import archive text.");
    } finally {
      setImporting(false);
    }
  }

  if (loading) return <StudioMessage>Loading archive...</StudioMessage>;
  if (error && !persona) return <StudioMessage tone="error">{error}</StudioMessage>;
  if (!persona) return <StudioMessage tone="error">Persona not found.</StudioMessage>;

  return (
    <main className="container studio-workspace">
      <PersonaWorkspaceHeader persona={persona} />
      {error && <div className="space-form-error">{error}</div>}

      <section className="studio-two-column">
        <form className="studio-editor-panel" onSubmit={importText}>
          <div className="studio-section-heading">
            <div className="section-label">Archive Import</div>
            <h2>Paste source material</h2>
          </div>
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
            {files.length === 0 && jobs.length === 0 && <div className="studio-empty">No archive sources yet.</div>}
            {jobs.map((job) => (
              <article key={job.id} className="studio-item-card">
                <div>
                  <span>{job.kind} / {job.status}</span>
                  <time>{formatDate(job.created_at)}</time>
                </div>
                <h3>{job.source_name}</h3>
                <p>{job.error_message || "Imported text is chunked into private memory items for retrieval."}</p>
                <PublishContinuityButton
                  sourceType="archive_import"
                  sourceId={job.id}
                  defaultTitle={job.source_name}
                />
              </article>
            ))}
            {files.map((file) => (
              <article key={file.id} className="studio-item-card">
                <div>
                  <span>{file.source_type} / {file.processed ? "processed" : "queued"}</span>
                  <time>{formatDate(file.created_at)}</time>
                </div>
                <h3>{file.file_name}</h3>
                <p>{file.file_type || file.storage_path}</p>
                <PublishContinuityButton
                  sourceType="archive_file"
                  sourceId={file.id}
                  defaultTitle={file.file_name}
                />
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
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
