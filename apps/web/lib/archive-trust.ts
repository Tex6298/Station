export type ArchiveJobTone = "info" | "good" | "warning" | "danger";

export interface ArchiveImportJobLike {
  status: string;
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

export function archiveFileTrustCopy(file: ArchiveFileLike) {
  if (file.processed) {
    return "This file is preserved as private archive material and is ready to link into continuity.";
  }

  return "This file is still queued for processing. Existing archive material remains safe.";
}

export function archiveTrustSummary(files: ArchiveFileLike[], jobs: ArchiveImportJobLike[]) {
  return {
    totalSources: files.length + jobs.length,
    completedImports: jobs.filter((job) => job.status === "completed").length,
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
