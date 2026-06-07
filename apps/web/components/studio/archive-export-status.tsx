"use client";

import { useState } from "react";
import type { ArchiveExportPackage } from "@station/types/export";
import { apiGet, apiPost } from "@/lib/api-client";
import {
  exportPackageFormatLabel,
  exportPackageSectionLine,
  exportPackageStatusLabel,
  exportPackageSummaryLine,
  exportPackageTone,
  exportPackageTrustCopy,
  exportPackageTrustSummary,
} from "@/lib/export-trust";
import {
  StudioEmptyState,
  StudioErrorState,
  StudioPanel,
  StudioStatusBadge,
} from "@/components/studio/studio-frame";

export function ArchiveExportStatus({
  personaId,
  token,
  exportPackages,
  onCreated,
}: {
  personaId: string;
  token: string | null;
  exportPackages: ArchiveExportPackage[];
  onCreated: (exportPackage: ArchiveExportPackage) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [manifest, setManifest] = useState<{ packageId: string; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const summary = exportPackageTrustSummary(exportPackages);

  async function createExportPackage() {
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      const response = await apiPost<{
        exportPackage: ArchiveExportPackage;
        manifestMarkdown?: string | null;
      }>(`/exports/persona/${personaId}`, {}, token);
      onCreated(response.exportPackage);
      setManifest({
        packageId: response.exportPackage.id,
        text: response.manifestMarkdown || "Manifest readback is not available for this package yet.",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create export manifest.");
    } finally {
      setCreating(false);
    }
  }

  async function loadManifest(packageId: string) {
    if (!token) return;
    setError(null);
    try {
      const response = await apiGet<{ manifestMarkdown?: string | null }>(`/exports/${packageId}`, token);
      setManifest({
        packageId,
        text: response.manifestMarkdown || "Manifest readback is not available for this package yet.",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load export manifest.");
    }
  }

  return (
    <StudioPanel className="archive-export-status">
      <div className="studio-section-heading">
        <div className="section-label">Export Trust</div>
        <h2>Persona export status</h2>
      </div>

      <div className="archive-export-intro">
        <p>
          Owner-only JSON/Markdown manifests preserve persona profile, archive metadata, continuity, integrity notes, and published document references.
        </p>
        <button className="button primary" type="button" onClick={createExportPackage} disabled={creating || !token}>
          {creating ? "Creating..." : "Create JSON/Markdown manifest"}
        </button>
      </div>

      <div className="archive-trust-stats archive-export-stats">
        <ExportMetric label="Packages" value={summary.total} />
        <ExportMetric label="Completed" value={summary.completed} />
        <ExportMetric label="Failed" value={summary.failed} tone={summary.failed > 0 ? "danger" : "info"} />
        <ExportMetric label="In progress" value={summary.inProgress} tone={summary.inProgress > 0 ? "warning" : "info"} />
      </div>

      {error ? <StudioErrorState>{error}</StudioErrorState> : null}

      {exportPackages.length === 0 ? (
        <StudioEmptyState>No export manifests have been created yet.</StudioEmptyState>
      ) : (
        <div className="archive-export-list">
          {exportPackages.map((exportPackage) => (
            <ExportPackageCard
              key={exportPackage.id}
              exportPackage={exportPackage}
              manifestOpen={manifest?.packageId === exportPackage.id}
              onLoadManifest={() => loadManifest(exportPackage.id)}
            />
          ))}
        </div>
      )}

      {manifest ? (
        <details className="studio-runtime-prompt archive-export-manifest" open>
          <summary>Manifest readback</summary>
          <pre>{manifest.text}</pre>
        </details>
      ) : null}
    </StudioPanel>
  );
}

function ExportPackageCard({
  exportPackage,
  manifestOpen,
  onLoadManifest,
}: {
  exportPackage: ArchiveExportPackage;
  manifestOpen: boolean;
  onLoadManifest: () => void;
}) {
  const copy = exportPackageTrustCopy(exportPackage);
  const canReadManifest = exportPackage.status === "completed";

  return (
    <article className="studio-published-row archive-export-row">
      <div>
        <strong>{formatDate(exportPackage.createdAt)}</strong>
        <div className="archive-export-meta">
          <StudioStatusBadge tone={exportPackageTone(exportPackage.status)}>
            {exportPackageStatusLabel(exportPackage.status)}
          </StudioStatusBadge>
          <span>{exportPackageFormatLabel(exportPackage.format)}</span>
        </div>
      </div>
      <p>{copy.body}</p>
      {exportPackage.status === "failed" && exportPackage.errorMessage ? (
        <div className="archive-trust-error">{exportPackage.errorMessage}</div>
      ) : null}
      <div className="archive-trust-next-action">{copy.nextAction}</div>
      <div className="archive-export-summary">
        <span>{exportPackageSummaryLine(exportPackage.contentSummary)}</span>
        <span>{exportPackageSectionLine(exportPackage.includedSections)}</span>
        {exportPackage.completedAt ? <span>Completed {formatDate(exportPackage.completedAt)}</span> : null}
      </div>
      {canReadManifest ? (
        <button className="button" type="button" onClick={onLoadManifest} disabled={manifestOpen}>
          {manifestOpen ? "Manifest open" : "View manifest"}
        </button>
      ) : null}
    </article>
  );
}

function ExportMetric({
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
