export type ArchiveJobTone = "info" | "good" | "warning" | "danger";

export interface ArchiveImportJobLike {
  status: string;
  error_message?: string | null;
}

export interface ArchiveFileLike {
  processed: boolean;
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

export function archiveSourceNarrative() {
  return {
    sourceMaterial: "Archive sources can include pasted text, uploaded files, archived chats, continuity records, documents, memory, canon-adjacent notes, and Integrity Sessions.",
    processing: "Completed imports become private archive material for retrieval. Failed imports keep the error visible and leave existing archive material untouched.",
    visibility: "Private source material stays owner-only in Studio unless you deliberately publish a separate document or public Space item.",
  };
}
