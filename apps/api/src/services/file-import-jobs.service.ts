import { processUploadedFile } from "./archive.service";
import {
  countPersonaFileArchiveRows,
  loadOwnedImportJob,
  markImportJobCompleted,
  markImportJobProcessing,
  serializeImportJob,
} from "./background-jobs.service";

export type FileImportJobPointer = {
  jobId: string;
  personaId: string;
  ownerUserId: string;
  fileId: string;
  fileName: string;
  fileType: string | null;
  storagePath: string;
};

export async function runFileImportJobInline(input: FileImportJobPointer) {
  const job = await loadOwnedImportJob(input.jobId, input.ownerUserId);
  if (!job) throw new Error("Import job not found.");
  if (job.kind !== "file") throw new Error("Only file import jobs can use the file import runner.");
  if (job.persona_id !== input.personaId) throw new Error("Import job persona mismatch.");
  if (job.source_name !== input.fileName) throw new Error("Import job source mismatch.");

  const existingRows = await countPersonaFileArchiveRows({
    fileId: input.fileId,
    ownerUserId: input.ownerUserId,
    personaId: input.personaId,
  });

  if (job.status === "completed") {
    return {
      job: serializeImportJob(job),
      chunksCreated: existingRows,
      idempotent: true,
      execution: inlineExecution("already_completed"),
    };
  }

  if (existingRows > 0) {
    const completed = await markImportJobCompleted(job.id, input.ownerUserId);
    return {
      job: serializeImportJob(completed),
      chunksCreated: existingRows,
      idempotent: true,
      execution: inlineExecution("archive_rows_already_exist"),
    };
  }

  await markImportJobProcessing(job.id, input.ownerUserId);
  const result = await processUploadedFile({
    personaId: input.personaId,
    ownerUserId: input.ownerUserId,
    fileId: input.fileId,
    fileName: input.fileName,
    fileType: input.fileType,
    storagePath: input.storagePath,
    jobId: input.jobId,
  });
  const completedJob = await loadOwnedImportJob(input.jobId, input.ownerUserId);

  return {
    job: completedJob ? serializeImportJob(completedJob) : serializeImportJob({ ...job, status: "completed", error_message: null }),
    chunksCreated: result.chunksCreated,
    idempotent: false,
    execution: inlineExecution("processed"),
  };
}

export function inlineExecution(reason: string) {
  return {
    mode: "inline_fallback" as const,
    workerQueue: false,
    reason,
  };
}
