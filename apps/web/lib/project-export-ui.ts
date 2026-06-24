export type ProjectExportStatus = "requested" | "processing" | "completed" | "failed" | string;

export interface ProjectExportPackage {
  id: string;
  ownerUserId?: string;
  projectId?: string | null;
  personaId?: string | null;
  developerSpaceId?: string | null;
  packageKind: "project_manifest" | string;
  status: ProjectExportStatus;
  format: "json_markdown" | string;
  includedSections: string[];
  contentSummary: Record<string, unknown>;
  errorMessage?: string | null;
  requestedAt: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectExportBundleFile {
  path: string;
  mediaType: string;
  bytes: number;
  sha256: string;
  content: string;
}

export interface ProjectExportBundle {
  schema: "station.export.bundle.v1";
  generatedAt: string;
  package: {
    id: string;
    packageKind: string;
    format: string;
    status: string;
  };
  privacy: Record<string, unknown>;
  integrity: {
    algorithm: "sha256";
    fileCount: number;
    files: Record<string, string>;
  };
  files: ProjectExportBundleFile[];
}

export type ProjectExportTone = "info" | "good" | "warning" | "danger";

export function projectExportTone(status: ProjectExportStatus): ProjectExportTone {
  if (status === "completed") return "good";
  if (status === "failed") return "danger";
  if (status === "requested" || status === "processing") return "warning";
  return "info";
}

export function projectExportStatusLabel(status: ProjectExportStatus) {
  if (status === "completed") return "Completed";
  if (status === "failed") return "Failed";
  if (status === "processing") return "Processing";
  if (status === "requested") return "Requested";
  return status.replace(/_/g, " ");
}

export function projectExportFormatLabel(format?: string | null) {
  if (format === "json_markdown") return "JSON / Markdown";
  if (!format) return "Manifest";
  return format.replace(/_/g, " / ");
}

export function projectExportActions(exportPackage: Pick<ProjectExportPackage, "status">) {
  const ready = exportPackage.status === "completed";
  return {
    canCreate: true,
    canReadManifest: ready,
    canReadBundle: ready,
  };
}

export function projectExportCopy(exportPackage: Pick<ProjectExportPackage, "status">) {
  if (exportPackage.status === "completed") {
    return {
      body: "This owner-only Project manifest is complete.",
      nextAction: "Inspect the stored manifest readback or the portable bundle file list.",
    };
  }

  if (exportPackage.status === "failed") {
    return {
      body: "This Project manifest did not complete.",
      nextAction: "Create a fresh manifest when the Project is ready.",
    };
  }

  if (exportPackage.status === "requested" || exportPackage.status === "processing") {
    return {
      body: "Station is preparing an owner-only Project manifest.",
      nextAction: "Wait for completion before opening manifest or bundle readback.",
    };
  }

  return {
    body: "This Project manifest is not ready for readback.",
    nextAction: "Create a fresh manifest if this state does not resolve.",
  };
}

export function projectExportSummaryLine(summary: Record<string, unknown> = {}) {
  const labels: Array<[string, string]> = [
    ["attachedDeveloperSpaces", "spaces"],
    ["ownerProjectEvidenceRefs", "owner refs"],
    ["publicProjectEvidenceRefs", "public refs"],
  ];
  const parts = labels.flatMap(([key, label]) => {
    const value = summary[key];
    return typeof value === "number" ? [`${value} ${label}`] : [];
  });

  return parts.length > 0 ? parts.join(" / ") : "Manifest summary has not been recorded yet.";
}

export function projectExportSectionLine(includedSections: string[] = []) {
  if (includedSections.length === 0) return "No sections recorded yet.";
  return includedSections.map((section) => section.replace(/_/g, " ")).join(" / ");
}

export function projectExportSummary(exportPackages: Array<Pick<ProjectExportPackage, "status">>) {
  return {
    total: exportPackages.length,
    completed: exportPackages.filter((exportPackage) => exportPackage.status === "completed").length,
    failed: exportPackages.filter((exportPackage) => exportPackage.status === "failed").length,
    inProgress: exportPackages.filter((exportPackage) => exportPackage.status === "requested" || exportPackage.status === "processing").length,
  };
}
