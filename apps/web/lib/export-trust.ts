export type ExportPackageTone = "info" | "good" | "warning" | "danger";

export interface ArchiveExportPackageLike {
  status: string;
  format?: string | null;
  includedSections?: string[];
  contentSummary?: Record<string, unknown>;
  errorMessage?: string | null;
  requestedAt?: string | null;
  completedAt?: string | null;
  createdAt?: string | null;
}

const SUMMARY_LABELS: Array<[string, string]> = [
  ["memory", "memory"],
  ["canon", "canon"],
  ["archiveFiles", "files"],
  ["archiveImports", "imports"],
  ["integritySessions", "integrity"],
  ["continuityRecords", "continuity"],
  ["publishedDocuments", "published"],
  ["discussionRefs", "discussions"],
  ["moderationReports", "reports"],
];

export function exportPackageTone(status: string): ExportPackageTone {
  if (status === "completed") return "good";
  if (status === "failed") return "danger";
  if (status === "requested" || status === "processing") return "warning";
  return "info";
}

export function exportPackageStatusLabel(status: string) {
  if (status === "completed") return "Completed";
  if (status === "failed") return "Failed";
  if (status === "processing") return "Processing";
  if (status === "requested") return "Requested";
  return status.replace(/_/g, " ");
}

export function exportPackageFormatLabel(format?: string | null) {
  if (format === "json_markdown") return "JSON / Markdown";
  if (!format) return "Manifest";
  return format.replace(/_/g, " / ");
}

export function exportPackageTrustCopy(exportPackage: ArchiveExportPackageLike) {
  if (exportPackage.status === "failed") {
    return {
      body: exportPackage.errorMessage || "This export failed before Station could finish the manifest.",
      nextAction: "Private archive material remains safe. Review the error and create a new manifest when ready.",
    };
  }

  if (exportPackage.status === "completed") {
    return {
      body: "This owner-only manifest is complete and preserves the persona archive state that Station could include.",
      nextAction: "Use manifest or portable bundle readback to inspect what was preserved before carrying it elsewhere.",
    };
  }

  return {
    body: "Station is preparing an owner-only persona manifest from the current archive state.",
    nextAction: "Wait for the status to complete before relying on manifest readback.",
  };
}

export function exportPackageSummaryLine(summary: Record<string, unknown> = {}) {
  const parts = SUMMARY_LABELS.flatMap(([key, label]) => {
    const value = summary[key];
    return typeof value === "number" ? [`${value} ${label}`] : [];
  });

  return parts.length > 0 ? parts.join(" / ") : "Manifest summary has not been recorded yet.";
}

export function exportPackageSectionLine(includedSections: string[] = []) {
  if (includedSections.length === 0) return "No sections recorded yet.";
  return includedSections.map((section) => section.replace(/_/g, " ")).join(" / ");
}

export function exportPackageTrustSummary(exportPackages: ArchiveExportPackageLike[]) {
  return {
    total: exportPackages.length,
    completed: exportPackages.filter((exportPackage) => exportPackage.status === "completed").length,
    failed: exportPackages.filter((exportPackage) => exportPackage.status === "failed").length,
    inProgress: exportPackages.filter((exportPackage) => exportPackage.status === "requested" || exportPackage.status === "processing").length,
  };
}
