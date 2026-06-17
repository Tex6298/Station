import { getSupabaseAdmin } from "../lib/supabase";
import { processUploadedFile } from "./archive.service";
import {
  countPersonaFileArchiveRows,
  loadOwnedImportJob,
  markImportJobCompleted,
  markImportJobFailed,
  markImportJobProcessing,
  sanitizeJobErrorMessage,
  serializeImportJob,
  type ImportJobRow,
} from "./background-jobs.service";

type PersonaFileRow = {
  id: string;
  persona_id: string;
  owner_user_id: string;
  file_name: string;
  file_type: string | null;
  storage_path: string;
};

export async function runFileImportJobById(input: { jobId: string; ownerUserId: string }) {
  const job = await loadOwnedImportJob(input.jobId, input.ownerUserId);
  if (!job) throw new Error("Import job not found.");
  if (job.kind !== "file") throw new Error("Only file import jobs can use the file import runner.");

  await markImportJobProcessing(job.id, input.ownerUserId);

  try {
    const file = await loadAndValidatePersonaFileForJob(job);
    const existingRows = await countPersonaFileArchiveRows({
      fileId: file.id,
      ownerUserId: input.ownerUserId,
      personaId: job.persona_id,
    });

    if (job.status === "completed" || existingRows > 0) {
      const completed = await markImportJobCompleted(job.id, input.ownerUserId);
      return {
        job: serializeImportJob(completed),
        chunksCreated: existingRows,
        idempotent: true,
        execution: inlineExecution(job.status === "completed" ? "already_completed" : "archive_rows_already_exist"),
      };
    }

    const result = await processUploadedFile({
      personaId: job.persona_id,
      ownerUserId: input.ownerUserId,
      fileId: file.id,
      fileName: file.file_name,
      fileType: file.file_type,
      storagePath: file.storage_path,
      jobId: job.id,
    });
    const completedJob = await loadOwnedImportJob(job.id, input.ownerUserId);

    return {
      job: completedJob ? serializeImportJob(completedJob) : serializeImportJob({ ...job, status: "completed", error_message: null }),
      chunksCreated: result.chunksCreated,
      idempotent: false,
      execution: inlineExecution("processed"),
    };
  } catch (error) {
    const failed = await markImportJobFailed(job.id, input.ownerUserId, error, [job.source_name]).catch(() => null);
    const message = sanitizeJobErrorMessage(error, [job.source_name]);
    if (failed) throw new Error(failed.error_message ?? message);
    throw new Error(message);
  }
}

export function inlineExecution(reason: string) {
  return {
    mode: "inline_fallback" as const,
    workerQueue: false,
    reason,
  };
}

async function loadAndValidatePersonaFileForJob(job: ImportJobRow): Promise<PersonaFileRow> {
  if (!job.file_id) {
    throw new Error("File import job is missing a durable file pointer.");
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("persona_files")
    .select("id, persona_id, owner_user_id, file_name, file_type, storage_path")
    .eq("id", job.file_id)
    .single();

  if (error || !data) throw new Error("Persona file not found for import job.");
  const file = data as PersonaFileRow;

  if (file.owner_user_id !== job.owner_user_id) throw new Error("Import job file owner mismatch.");
  if (file.persona_id !== job.persona_id) throw new Error("Import job file persona mismatch.");
  if (file.file_name !== job.source_name) throw new Error("Import job source mismatch.");

  return file;
}
