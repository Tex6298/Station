export type ArchiveJobTone = "info" | "good" | "warning" | "danger";

export interface ArchiveImportJobLike {
  kind?: string | null;
  status: string;
  source_name?: string | null;
  error_message?: string | null;
}

export interface ArchiveFileLike {
  processed: boolean;
}

export interface ArchiveTrustStateRow {
  id: "private-sources" | "ready" | "needs-review" | "processing";
  label: string;
  value: string;
  tone: ArchiveJobTone;
  body: string;
  nextAction: string;
}

export interface SupportedImportFormatRow {
  id: "paste" | "text-markdown" | "chatgpt" | "claude" | "reddit" | "discord" | "legacy-json";
  label: string;
  input: string;
  result: string;
  review: string;
  boundary: string;
}

export interface ArchiveImportJobReadback {
  sourceLabel: string;
  kindLabel: string;
  formatLabel: string;
  body: string;
  nextAction: string;
  boundary: string;
}

export const ARCHIVE_FILE_IMPORT_ACCEPT = ".txt,.text,.md,.markdown,.json";

const ARCHIVE_FILE_IMPORT_EXTENSIONS = new Set(["txt", "text", "md", "markdown", "json"]);

export function archiveJobTone(status: string): ArchiveJobTone {
  if (status === "completed") return "good";
  if (status === "failed") return "danger";
  if (status === "queued" || status === "processing") return "warning";
  return "info";
}

export function archiveJobStatusLabel(status: string) {
  if (status === "completed") return "Completed";
  if (status === "failed") return "Failed";
  if (status === "processing") return "Processing";
  if (status === "queued") return "Queued";
  return status.replace(/_/g, " ");
}

export function archiveJobTrustCopy(job: ArchiveImportJobLike) {
  if (job.status === "failed") {
    return {
      body: job.error_message || "This import failed before Station could create archive memory from the source.",
      nextAction: "Existing archive material remains safe. Review the source text and import again when ready.",
    };
  }

  if (job.status === "completed") {
    return {
      body: "Imported text was preserved as private archive material and chunked for this persona's memory retrieval.",
      nextAction: "You can link this import into continuity when it is useful.",
    };
  }

  return {
    body: "Station is preparing this source as private archive material for this persona.",
    nextAction: "Wait for the job to complete before linking it into continuity.",
  };
}

export function supportedImportFormatRows(): SupportedImportFormatRow[] {
  return [
    {
      id: "paste",
      label: "Pasted source material",
      input: "Paste notes, chat logs, letters, or research into Archive Import.",
      result: "Creates a private chat import job and archive chunks for this persona.",
      review: "No automatic Memory/Canon candidates are created from pasted text today.",
      boundary: "No live provider pull, OAuth connection, or public exposure is implied.",
    },
    {
      id: "text-markdown",
      label: "Text and Markdown files",
      input: ".txt, .text, .md, or .markdown files from the stored file path.",
      result: "Preserves the file as private archive chunks after file processing.",
      review: "No automatic Memory/Canon candidates are created for plain text files today.",
      boundary: "File import uses the owner-scoped uploaded file pointer; it is not a crawler.",
    },
    {
      id: "chatgpt",
      label: "ChatGPT JSON export",
      input: "ChatGPT conversation JSON with mapping/message structure.",
      result: "Parses role-labelled turns into private archive chunks.",
      review: "Memory and Canon candidates stay pending for owner review.",
      boundary: "Station reads an uploaded export only; it does not connect to ChatGPT.",
    },
    {
      id: "claude",
      label: "Claude JSON export",
      input: "Claude conversation JSON with chat_messages.",
      result: "Parses chronological turns into private archive chunks.",
      review: "Memory and Canon candidates stay pending for owner review.",
      boundary: "Station reads an uploaded export only; it does not connect to Claude.",
    },
    {
      id: "reddit",
      label: "Reddit JSON archive",
      input: "Saved Reddit listing or thread-like JSON.",
      result: "Parses posts and comments into private archive chunks.",
      review: "Memory and Canon candidates stay pending for owner review.",
      boundary: "This is file import support, not Reddit OAuth or live subreddit pulling.",
    },
    {
      id: "discord",
      label: "Discord JSON archive",
      input: "Saved Discord channel or exporter-style message JSON.",
      result: "Parses channel messages into private archive chunks.",
      review: "Memory and Canon candidates stay pending for owner review.",
      boundary: "This is file import support, not a Discord bot or live API connector.",
    },
    {
      id: "legacy-json",
      label: "Legacy role/content JSON",
      input: "JSON arrays of messages with role and content fields.",
      result: "Parses known role/content arrays into private archive chunks.",
      review: "No automatic Memory/Canon candidates are created for legacy arrays today.",
      boundary: "Unknown JSON fails safely instead of being stringified into archive memory.",
    },
  ];
}

export function archiveImportSourceLabel(sourceName?: string | null, kind?: string | null) {
  const trimmed = sourceName?.trim() ?? "";
  const normalized = trimmed.toLowerCase();
  const normalizedKind = kind?.trim().toLowerCase();

  if (!trimmed) {
    if (normalizedKind === "file") return "Uploaded file";
    if (normalizedKind === "chat") return "Pasted source";
    return "Imported source";
  }

  if (normalized === "pasted-archive") return "Pasted source";
  if (normalized === "pasted-chat") return "Pasted chat";
  return trimmed;
}

export function archiveImportJobReadback(job: ArchiveImportJobLike): ArchiveImportJobReadback {
  const copy = archiveJobTrustCopy(job);
  const kindLabel = archiveImportKindLabel(job.kind);
  const formatLabel = archiveImportFormatLabel(job.source_name, job.kind);
  const boundary = archiveImportBoundaryCopy(job);

  return {
    sourceLabel: archiveImportSourceLabel(job.source_name, job.kind),
    kindLabel,
    formatLabel,
    body: copy.body,
    nextAction: copy.nextAction,
    boundary,
  };
}

export function archiveFileTrustCopy(file: ArchiveFileLike) {
  if (file.processed) {
    return "This file is preserved as private archive material and is ready to link into continuity.";
  }

  return "This file is still queued for processing. Existing archive material remains safe.";
}

export function archiveFileTypeReadback(fileType?: string | null) {
  const trimmed = fileType?.trim() ?? "";
  if (!trimmed) return "Private archive file";

  const redacted = trimmed
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[redacted-id]")
    .replace(/\s+/g, " ")
    .slice(0, 80);

  if (/https?:|bearer|token|authorization|cookie|secret|password|storage(?: path|_path|-path|Path)|upload(?: url|_url|-url|Url)|signed(?: url|_url|-url|Url)|\/.+\//i.test(redacted)) {
    return "Private archive file";
  }

  return redacted;
}

export function archiveFileImportSelection(file: Pick<File, "name" | "size"> | null | undefined) {
  if (!file) {
    return { ok: false as const, message: "Choose one .txt, .md, .markdown, .text, or .json file to import." };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ARCHIVE_FILE_IMPORT_EXTENSIONS.has(extension)) {
    return { ok: false as const, message: "Station file imports accept .txt, .text, .md, .markdown, or .json files." };
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false as const, message: "The selected file is empty or unavailable. Existing archive material remains safe." };
  }

  return { ok: true as const, extension };
}

export function archiveFileImportErrorMessage(error: unknown) {
  const fallback = "File import failed. Existing archive material remains safe.";
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  const redacted = trimmed
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(/\b(?:bearer)\s+\S+/gi, "bearer [redacted]")
    .replace(/\b(token|authorization|cookie|secret|password|storage(?:[_\s-]?path|Path)|upload(?:[_\s-]?url|Url)|signed(?:[_\s-]?url|Url))\b\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[redacted-id]")
    .replace(/\s+/g, " ")
    .slice(0, 180);

  if (/sql|postgres|pgrst|stack|trace|signed|storage path|storage_path|storagePath|upload url|upload_url|uploadUrl|authorization|cookie|secret|password|token/i.test(redacted)) {
    return fallback;
  }

  const sentence = /[.!?]$/.test(redacted) ? redacted : `${redacted}.`;
  return `${sentence} Existing archive material remains safe.`;
}

export function archiveTrustSummary(files: ArchiveFileLike[], jobs: ArchiveImportJobLike[]) {
  const pastedImportJobs = jobs.filter((job) => job.kind !== "file");

  return {
    totalSources: files.length + pastedImportJobs.length,
    completedImports: pastedImportJobs.filter((job) => job.status === "completed").length,
    failedImports: jobs.filter((job) => job.status === "failed").length,
    processingImports: jobs.filter((job) => job.status === "queued" || job.status === "processing").length,
    processedFiles: files.filter((file) => file.processed).length,
  };
}

export function archiveTrustStateRows(
  files: ArchiveFileLike[],
  jobs: ArchiveImportJobLike[],
): ArchiveTrustStateRow[] {
  const summary = archiveTrustSummary(files, jobs);
  const readySources = summary.completedImports + summary.processedFiles;
  const empty = summary.totalSources === 0;

  return [
    {
      id: "private-sources",
      label: "Owner-only sources",
      value: summary.totalSources.toString(),
      tone: empty ? "info" : "good",
      body: empty
        ? "No pasted or file archive sources are attached to this persona yet. Archived chats can still appear in runtime context separately."
        : "Pasted imports and uploaded files on this page remain private source material for this owner.",
      nextAction: empty
        ? "Paste source material when there is something worth preserving for this persona."
        : "Review the status rows below before linking material into Continuity.",
    },
    {
      id: "ready",
      label: "Ready for continuity",
      value: readySources.toString(),
      tone: readySources > 0 ? "good" : "info",
      body: readySources > 0
        ? "Completed imports and processed files can be linked into Continuity when useful."
        : "No completed pasted imports or processed files are ready to link yet.",
      nextAction: readySources > 0
        ? "Use the source cards to publish a Continuity marker from ready material."
        : "Wait for processing or add a new source before linking into Continuity.",
    },
    {
      id: "needs-review",
      label: "Needs review",
      value: summary.failedImports.toString(),
      tone: summary.failedImports > 0 ? "danger" : "info",
      body: summary.failedImports > 0
        ? "One or more imports failed before Station could preserve archive memory from that source."
        : "No failed pasted imports are waiting for review.",
      nextAction: summary.failedImports > 0
        ? "Open the failed source card, read the exact error, then retry or replace the source text."
        : "Existing archive material remains safe if a future import fails.",
    },
    {
      id: "processing",
      label: "Queued or processing",
      value: summary.processingImports.toString(),
      tone: summary.processingImports > 0 ? "warning" : "info",
      body: summary.processingImports > 0
        ? "Station is still preparing one or more pasted sources as private archive material."
        : "No pasted imports are currently queued or processing.",
      nextAction: summary.processingImports > 0
        ? "Wait for processing to finish before relying on the source in Continuity."
        : "New imports will appear here while Station prepares them.",
    },
  ];
}

export function archiveSourceNarrative() {
  return {
    sourceMaterial: "Archive sources can include pasted text, uploaded files, archived chats, continuity records, documents, memory, canon-adjacent notes, and Integrity Sessions.",
    processing: "Completed imports become private archive material for retrieval. Failed imports keep the error visible and leave existing archive material untouched.",
    visibility: "Private source material stays owner-only in Studio unless you deliberately publish a separate document or public Space item.",
  };
}

function archiveImportKindLabel(kind?: string | null) {
  const normalized = kind?.trim().toLowerCase();
  if (normalized === "file") return "File import";
  if (normalized === "chat") return "Pasted import";
  if (!normalized) return "Import";
  return normalized.replace(/[_-]+/g, " ");
}

function archiveImportFormatLabel(sourceName?: string | null, kind?: string | null) {
  const normalized = sourceName?.trim().toLowerCase() ?? "";
  const normalizedKind = kind?.trim().toLowerCase();

  if (normalizedKind === "chat") return "Pasted text/chat";
  if (normalized.includes("chatgpt")) return "ChatGPT JSON";
  if (normalized.includes("claude")) return "Claude JSON";
  if (normalized.includes("reddit")) return "Reddit JSON";
  if (normalized.includes("discord")) return "Discord JSON";
  if (normalized.endsWith(".md") || normalized.endsWith(".markdown")) return "Markdown file";
  if (normalized.endsWith(".txt") || normalized.endsWith(".text")) return "Text file";
  if (normalized.endsWith(".json")) return "Known JSON import";
  if (normalizedKind === "file") return "Uploaded file";
  return "Archive import";
}

function archiveImportBoundaryCopy(job: ArchiveImportJobLike) {
  const kind = job.kind?.trim().toLowerCase();

  if (job.status === "failed") {
    if (kind === "chat") {
      return "Failed pasted imports can be retried only when the owner supplies source content again.";
    }

    if (kind === "file") {
      return "Failed file imports depend on the stored owner file pointer; no live provider retry runs here.";
    }

    return "Failed imports do not publish material or activate Memory/Canon automatically.";
  }

  if (job.status === "completed") {
    return "Completed imports remain owner-only archive material; parser candidates require explicit review before Memory/Canon use.";
  }

  return "Queued and processing imports have no public output while Station prepares private archive material.";
}
