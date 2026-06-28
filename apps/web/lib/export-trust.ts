export type ExportPackageTone = "info" | "good" | "warning" | "danger";
export type ExportBackupSurfaceState = "live" | "preview" | "future";
export type ExportPackageTrustScope = "persona" | "developer_space";

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

export interface ExportBackupSurface {
  id: string;
  title: string;
  state: ExportBackupSurfaceState;
  packageKind?: string;
  href?: string;
  actionLabel: string;
  readback: string;
  boundary: string;
  limitation: string;
}

const SUMMARY_LABELS: Record<ExportPackageTrustScope, Array<[string, string]>> = {
  persona: [
    ["memory", "memory"],
    ["canon", "canon"],
    ["archiveFiles", "files"],
    ["archiveImports", "imports"],
    ["integritySessions", "integrity"],
    ["continuityRecords", "continuity"],
    ["publishedDocuments", "published"],
    ["discussionRefs", "discussions"],
    ["moderationReports", "reports"],
  ],
  developer_space: [
    ["nodes", "nodes"],
    ["events", "events"],
    ["snapshots", "snapshots"],
    ["linkedPublicDocuments", "public docs"],
    ["usage", "usage"],
  ],
};

export function exportBackupTrustSurfaces(): ExportBackupSurface[] {
  return [
    {
      id: "persona-archive",
      title: "Persona archive manifest",
      state: "live",
      packageKind: "persona_archive",
      href: "/studio",
      actionLabel: "Open personas",
      readback: "Owner-only JSON/Markdown manifest and portable bundle readback from each persona workspace.",
      boundary: "Includes persona archive metadata, continuity, memory/canon, integrity notes, published refs, and discussion refs that the export API can safely package for the owner.",
      limitation: "Does not package original uploaded files, binary archives, PDF output, or a global workspace bundle.",
    },
    {
      id: "developer-space-archive",
      title: "Developer Space archive manifest",
      state: "live",
      packageKind: "developer_space_archive",
      href: "/developer-spaces",
      actionLabel: "Open Developer Spaces",
      readback: "Owner-only JSON/Markdown manifest and bundle readback from each Developer Space manage page.",
      boundary: "Includes bounded space, node, event, snapshot, linked public document, and usage readback through authenticated owner routes.",
      limitation: "Does not expose public download URLs, raw ingestion secrets, live runtime logs, provider payloads, or partner backup infrastructure.",
    },
    {
      id: "project-manifest",
      title: "Project manifest",
      state: "live",
      packageKind: "project_manifest",
      href: "/projects",
      actionLabel: "Open Projects",
      readback: "Owner-only Project manifest and stored bundle file readback from each Project page.",
      boundary: "Stores project, attached Developer Space, owner evidence reference, public evidence reference, and trust metadata without document bodies.",
      limitation: "Does not export linked source rows, private document bodies, collaborator roles, or a full institutional archive.",
    },
    {
      id: "workspace-export",
      title: "Full workspace export",
      state: "preview",
      actionLabel: "Not enabled",
      readback: "This screen is the current workspace export readback map; it does not start a global export job.",
      boundary: "Existing live packages stay scoped to their owner-controlled persona, Developer Space, or Project source.",
      limitation: "A cross-Studio workspace package still needs product shape, owner review, background job behavior, and storage policy.",
    },
    {
      id: "pdf-binary-originals",
      title: "PDF, binary, and original file packages",
      state: "future",
      actionLabel: "Future lane",
      readback: "No PDF, binary archive, original file bundle, or Station Press package is available from current export routes.",
      boundary: "Current readback is manifest and Markdown/JSON bundle content returned only to the authenticated owner.",
      limitation: "Original file packaging, print/PDF assembly, fulfilment, shipping, and checkout are out of scope.",
    },
    {
      id: "redundant-backup",
      title: "Backup and redundancy posture",
      state: "future",
      actionLabel: "Future lane",
      readback: "Export manifests help owners inspect portable state, but they are not a managed backup or restore drill.",
      boundary: "Station still treats Supabase records and owner-only export packages as the current source of truth.",
      limitation: "Retention, expiry, restore, redundant storage, queue retry policy, and backup infrastructure remain unimplemented.",
    },
  ];
}

export function exportBackupTrustSummary(surfaces: ExportBackupSurface[] = exportBackupTrustSurfaces()) {
  return {
    total: surfaces.length,
    live: surfaces.filter((surface) => surface.state === "live").length,
    preview: surfaces.filter((surface) => surface.state === "preview").length,
    future: surfaces.filter((surface) => surface.state === "future").length,
  };
}

export function exportBackupSurfaceStateLabel(state: ExportBackupSurfaceState) {
  if (state === "live") return "Live scoped package";
  if (state === "preview") return "Preview only";
  return "Future lane";
}

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

export function exportPackageTrustCopy(
  exportPackage: ArchiveExportPackageLike,
  scope: ExportPackageTrustScope = "persona",
) {
  if (scope === "developer_space") {
    if (exportPackage.status === "failed") {
      return {
        body: "This Developer Space export did not complete.",
        nextAction: "Private Developer Space material remains owner-only. Create a new JSON/Markdown package when ready.",
      };
    }

    if (exportPackage.status === "completed") {
      return {
        body: "This owner-only Developer Space manifest is complete.",
        nextAction: "Use manifest or portable bundle readback to inspect the JSON/Markdown package.",
      };
    }

    return {
      body: "Station is preparing an owner-only Developer Space manifest from the current space state.",
      nextAction: "Wait for the status to complete before relying on manifest or bundle readback.",
    };
  }

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

export function exportPackageSummaryLine(
  summary: Record<string, unknown> = {},
  scope: ExportPackageTrustScope = "persona",
) {
  const parts = SUMMARY_LABELS[scope].flatMap(([key, label]) => {
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
