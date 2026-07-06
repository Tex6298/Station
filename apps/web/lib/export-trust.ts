export type ExportPackageTone = "info" | "good" | "warning" | "danger";
export type ExportBackupSurfaceState = "live" | "preview" | "future";
export type ExportPackageTrustScope = "persona" | "developer_space" | "workspace";
export type WorkspaceExportScopeState = "live" | "future" | "excluded" | "decision_needed";

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

export interface WorkspaceExportScopeRow {
  id: string;
  label: string;
  state: WorkspaceExportScopeState;
  detail: string;
}

export interface WorkspaceExportLiveClass extends WorkspaceExportScopeRow {
  state: "live";
  packageKind: "persona_archive" | "developer_space_archive" | "project_manifest" | "workspace_manifest";
  format: "JSON / Markdown";
  includedSections: string[];
  href?: string;
}

export interface WorkspaceExportScopeReadback {
  heading: string;
  summary: string;
  livePackageClasses: WorkspaceExportLiveClass[];
  currentBundleFormat: string;
  futureUnavailable: WorkspaceExportScopeRow[];
  excludedMaterial: WorkspaceExportScopeRow[];
  decisionsNeeded: WorkspaceExportScopeRow[];
  nextActions: string[];
  boundary: string;
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
  workspace: [
    ["personas", "personas"],
    ["spaces", "Spaces"],
    ["developerSpaces", "Developer Spaces"],
    ["projects", "Projects"],
    ["publicPublishedDocumentRefs", "public refs"],
    ["exportPackages", "package rows"],
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
      title: "Workspace manifest package",
      state: "live",
      packageKind: "workspace_manifest",
      href: "/studio/export",
      actionLabel: "Create manifest",
      readback: "Owner-only high-level workspace inventory manifest and JSON/Markdown bundle readback from this page.",
      boundary: "Includes bounded counts and inventory for personas, Spaces, Developer Spaces, Projects, public published document refs, and export package classes.",
      limitation: "Does not package private bodies, original files, storage objects, PDFs, backups, restore jobs, share links, or signed URLs.",
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

export function workspaceExportScopeReadback(
  surfaces: ExportBackupSurface[] = exportBackupTrustSurfaces(),
): WorkspaceExportScopeReadback {
  const livePackageClasses = surfaces.flatMap((surface): WorkspaceExportLiveClass[] => {
    if (surface.state !== "live" || !isWorkspaceLivePackageKind(surface.packageKind)) return [];

    return [{
      id: surface.id,
      label: surface.title,
      state: "live",
      packageKind: surface.packageKind,
      format: "JSON / Markdown",
      includedSections: workspaceIncludedSections(surface.packageKind),
      detail: surface.readback,
      href: surface.href,
    }];
  });

  return {
    heading: "Workspace export scope readback",
    summary: "This owner-only Studio surface maps the scoped export classes Station can read back today, including the workspace manifest package. It is not a private archive bundle, original-file package, PDF generator, backup service, restore workflow, or public download surface.",
    livePackageClasses,
    currentBundleFormat: "Owner-only JSON/Markdown manifests and portable bundle readback.",
    futureUnavailable: [
      {
        id: "full-workspace-bundle",
        label: "Full workspace archive bundle",
        state: "future",
        detail: "No current route creates a raw cross-Studio archive across private bodies, archive files, original uploads, and documents.",
      },
      {
        id: "original-files",
        label: "Original file packaging",
        state: "future",
        detail: "Original uploads need a file-manifest, redaction, storage, and owner review contract before inclusion.",
      },
      {
        id: "pdf-binary-station-press",
        label: "PDF, binary archive, and Station Press",
        state: "future",
        detail: "PDF/print output, binary archives, print readiness, and Station Press packaging need separate privacy, cost, storage, and provider decisions.",
      },
      {
        id: "backup-redundancy-restore",
        label: "Managed backup, redundancy, and restore drills",
        state: "future",
        detail: "Export readback is not a production backup system, redundant storage plan, restore drill, retention policy, or expiry policy.",
      },
      {
        id: "shareable-private-urls",
        label: "Shareable/private package URLs",
        state: "future",
        detail: "No anonymous download link, signed URL, shareable private package URL, or package URL creation is part of this scope.",
      },
    ],
    excludedMaterial: [
      {
        id: "raw-private-source-bodies",
        label: "Raw private source bodies",
        state: "excluded",
        detail: "Private source bodies, archive snippets, document bodies, and private evidence remain outside this readback.",
      },
      {
        id: "storage-and-download-internals",
        label: "Storage and download internals",
        state: "excluded",
        detail: "Storage paths, signed URLs, package IDs, table names, SQL details, hosted logs, and stack traces are not shown.",
      },
      {
        id: "credential-provider-material",
        label: "Credential and provider material",
        state: "excluded",
        detail: "Credentials, tokens, cookies, prompts, provider payloads, and secret-shaped values are excluded from visible copy.",
      },
    ],
    decisionsNeeded: [
      {
        id: "workspace-product-shape",
        label: "Workspace package product shape",
        state: "decision_needed",
        detail: "MIMIR still needs to choose whether a future workspace package is a manifest, archive, print/PDF output, backup workflow, or something else.",
      },
      {
        id: "file-policy",
        label: "Original-file and expiry policy",
        state: "decision_needed",
        detail: "Original-file inclusion, file redaction, retention, expiry, restore rehearsal, and private sharing policy remain undecided.",
      },
    ],
    nextActions: [
      "Open personas for current persona archive package readback.",
      "Open Developer Spaces for current Developer Space package readback.",
      "Open Projects for current Project manifest readback.",
      "Create an owner-only workspace manifest here for high-level inventory readback.",
    ],
    boundary: "Owner-only manifest readback: no original-file packaging, generated PDF, binary archive, background job, worker, queue, Redis, Cloudflare, billing, Stripe, provider/model call, public export access, signed URL, shareable private package URL, storage architecture, backup/redundancy claim, or restore drill is added.",
  };
}

export function exportBackupSurfaceStateLabel(state: ExportBackupSurfaceState) {
  if (state === "live") return "Live scoped package";
  if (state === "preview") return "Preview only";
  return "Future lane";
}

function isWorkspaceLivePackageKind(value: string | undefined): value is WorkspaceExportLiveClass["packageKind"] {
  return value === "persona_archive" || value === "developer_space_archive" || value === "project_manifest" || value === "workspace_manifest";
}

function workspaceIncludedSections(packageKind: WorkspaceExportLiveClass["packageKind"]) {
  if (packageKind === "persona_archive") {
    return ["persona metadata", "memory/canon", "continuity", "integrity notes", "published refs", "discussion refs"];
  }

  if (packageKind === "developer_space_archive") {
    return ["space summary", "nodes", "events", "snapshots", "linked public documents", "usage"];
  }

  if (packageKind === "workspace_manifest") {
    return ["workspace counts", "public refs", "package classes", "trust notes", "excluded material"];
  }

  return ["project summary", "attached Developer Space", "owner evidence reference", "public evidence reference", "trust metadata"];
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

  if (scope === "workspace") {
    if (exportPackage.status === "failed") {
      return {
        body: "This workspace manifest did not complete.",
        nextAction: "Private source material remains owner-only. Create a fresh workspace manifest when ready.",
      };
    }

    if (exportPackage.status === "completed") {
      return {
        body: "This owner-only workspace manifest is complete.",
        nextAction: "Use bundle readback to inspect the high-level JSON/Markdown inventory.",
      };
    }

    return {
      body: "Station is preparing an owner-only workspace manifest from high-level inventory.",
      nextAction: "Wait for completion before relying on bundle readback.",
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
