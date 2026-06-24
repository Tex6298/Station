"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  type ProjectExportBundle,
  type ProjectExportPackage,
  projectExportActions,
  projectExportCopy,
  projectExportFormatLabel,
  projectExportSectionLine,
  projectExportStatusLabel,
  projectExportSummary,
  projectExportSummaryLine,
} from "@/lib/project-export-ui";

export function ProjectExportPanel({
  idOrSlug,
  token,
}: {
  idOrSlug: string;
  token: string;
}) {
  const [exportPackages, setExportPackages] = useState<ProjectExportPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [manifest, setManifest] = useState<{ packageId: string; text: string } | null>(null);
  const [bundle, setBundle] = useState<ProjectExportBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const summary = projectExportSummary(exportPackages);
  const encodedProject = encodeURIComponent(idOrSlug);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet<{ exports: ProjectExportPackage[] }>(`/exports/projects/${encodedProject}`, token);
      setExportPackages(response.exports ?? []);
    } catch {
      setError("Could not load Project export packages.");
    } finally {
      setLoading(false);
    }
  }, [encodedProject, token]);

  useEffect(() => {
    void loadPackages();
  }, [loadPackages]);

  async function createManifest() {
    setCreating(true);
    setError(null);
    setManifest(null);
    setBundle(null);
    try {
      const response = await apiPost<{
        exportPackage: ProjectExportPackage;
        manifestMarkdown?: string | null;
      }>(`/exports/projects/${encodedProject}`, {}, token);
      setExportPackages((current) => [response.exportPackage, ...current.filter((item) => item.id !== response.exportPackage.id)]);
      setManifest({
        packageId: response.exportPackage.id,
        text: response.manifestMarkdown || "Manifest readback is not available for this package yet.",
      });
      await loadPackages();
    } catch {
      await loadPackages();
      setError("Could not create Project export manifest.");
    } finally {
      setCreating(false);
    }
  }

  async function loadManifest(packageId: string) {
    setError(null);
    setBundle(null);
    try {
      const response = await apiGet<{
        exportPackage: ProjectExportPackage;
        manifestMarkdown?: string | null;
      }>(`/exports/${packageId}`, token);
      if (response.exportPackage.packageKind !== "project_manifest") {
        setError("This package is not a Project manifest.");
        return;
      }
      setManifest({
        packageId,
        text: response.manifestMarkdown || "Manifest readback is not available for this package yet.",
      });
    } catch {
      setError("Could not load Project manifest readback.");
    }
  }

  async function loadBundle(packageId: string) {
    setError(null);
    setManifest(null);
    try {
      const response = await apiGet<{ bundle: ProjectExportBundle }>(`/exports/${packageId}/bundle`, token);
      setBundle(response.bundle);
    } catch {
      setError("Project bundle readback is not available for this package.");
    }
  }

  return (
    <section className="station-panel" style={{ display: "grid", gap: "0.9rem" }} aria-label="Project export">
      <div className="station-action-row" style={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div className="station-eyebrow">Owner Export</div>
          <h2 style={{ margin: "0.2rem 0 0", fontSize: "1.15rem" }}>Project export</h2>
          <p style={{ margin: "0.35rem 0 0", color: "#687078", fontSize: "0.9rem", lineHeight: 1.5 }}>
            Create and inspect owner-only Project manifests from stored API readback.
          </p>
        </div>
        <button className="station-link-button" type="button" onClick={createManifest} disabled={creating}>
          {creating ? "Creating..." : "Create manifest"}
        </button>
      </div>

      <dl className="fact-grid compact" style={{ margin: 0, gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
        <div>
          <dt>Packages</dt>
          <dd>{summary.total}</dd>
        </div>
        <div>
          <dt>Completed</dt>
          <dd>{summary.completed}</dd>
        </div>
        <div>
          <dt>Failed</dt>
          <dd>{summary.failed}</dd>
        </div>
        <div>
          <dt>In progress</dt>
          <dd>{summary.inProgress}</dd>
        </div>
      </dl>

      {error ? <div className="station-notice" data-tone="error">{error}</div> : null}

      {loading ? (
        <div className="station-notice" style={{ color: "#687078" }}>Loading Project exports...</div>
      ) : exportPackages.length === 0 ? (
        <div className="station-notice" style={{ color: "#687078" }}>
          No Project export manifests yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {exportPackages.map((exportPackage) => (
            <ProjectExportPackageCard
              key={exportPackage.id}
              exportPackage={exportPackage}
              manifestOpen={manifest?.packageId === exportPackage.id}
              bundleOpen={bundle?.package.id === exportPackage.id}
              onLoadManifest={() => loadManifest(exportPackage.id)}
              onLoadBundle={() => loadBundle(exportPackage.id)}
            />
          ))}
        </div>
      )}

      {manifest ? (
        <details className="station-notice" open>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Manifest readback</summary>
          <pre style={preStyle}>{manifest.text}</pre>
        </details>
      ) : null}

      {bundle ? <ProjectBundleReadback bundle={bundle} /> : null}
    </section>
  );
}

function ProjectExportPackageCard({
  exportPackage,
  manifestOpen,
  bundleOpen,
  onLoadManifest,
  onLoadBundle,
}: {
  exportPackage: ProjectExportPackage;
  manifestOpen: boolean;
  bundleOpen: boolean;
  onLoadManifest: () => void;
  onLoadBundle: () => void;
}) {
  const copy = projectExportCopy(exportPackage);
  const actions = projectExportActions(exportPackage);

  return (
    <article className="station-card" style={{ display: "grid", gap: "0.7rem" }}>
      <div className="station-action-row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <strong>{formatDate(exportPackage.createdAt)}</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.35rem" }}>
            <span className="station-status-pill">{projectExportStatusLabel(exportPackage.status)}</span>
            <span className="station-status-pill">{projectExportFormatLabel(exportPackage.format)}</span>
          </div>
        </div>
        {exportPackage.completedAt ? (
          <span style={{ color: "#687078", fontSize: "0.8rem" }}>Completed {formatDate(exportPackage.completedAt)}</span>
        ) : null}
      </div>
      <p style={{ margin: 0, color: "#687078", fontSize: "0.9rem", lineHeight: 1.5 }}>{copy.body}</p>
      <div style={{ color: "#8ea0b8", fontSize: "0.84rem", lineHeight: 1.5 }}>{copy.nextAction}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", color: "#687078", fontSize: "0.8rem" }}>
        <span>{projectExportSummaryLine(exportPackage.contentSummary)}</span>
        <span>/</span>
        <span>{projectExportSectionLine(exportPackage.includedSections)}</span>
      </div>
      {actions.canReadManifest || actions.canReadBundle ? (
        <div className="station-action-row">
          <button className="station-muted-button" type="button" onClick={onLoadManifest} disabled={manifestOpen}>
            {manifestOpen ? "Manifest open" : "View manifest"}
          </button>
          <button className="station-muted-button" type="button" onClick={onLoadBundle} disabled={bundleOpen}>
            {bundleOpen ? "Bundle open" : "View bundle files"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

function ProjectBundleReadback({ bundle }: { bundle: ProjectExportBundle }) {
  const readme = bundle.files.find((file) => file.path === "README.md")?.content;

  return (
    <details className="station-notice" open>
      <summary style={{ cursor: "pointer", fontWeight: 700 }}>Bundle file list</summary>
      <div style={{ display: "grid", gap: "0.55rem", marginTop: "0.75rem" }}>
        {bundle.files.map((file) => (
          <div key={file.path} style={{ display: "grid", gap: "0.2rem" }}>
            <strong>{file.path}</strong>
            <span style={{ color: "#687078", fontSize: "0.78rem" }}>
              {file.mediaType} / {file.bytes.toLocaleString()} bytes / sha256 {file.sha256.slice(0, 12)}...
            </span>
          </div>
        ))}
      </div>
      {readme ? <pre style={preStyle}>{readme}</pre> : null}
    </details>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const preStyle = {
  margin: "0.8rem 0 0",
  whiteSpace: "pre-wrap",
  overflowX: "auto",
  fontSize: "0.78rem",
  lineHeight: 1.5,
} as const;
