import { getSupabaseAdmin } from "../../lib/supabase";
import { ingestTextIntoArchive } from "../archive.service";
import {
  countImportArchiveRows,
  markImportJobCompleted,
  markImportJobFailed,
  markImportJobProcessing,
  normalizeImportJobRow,
  type ImportJobRow,
} from "../background-jobs.service";
import { assertActiveImportJobQuota } from "../operational-quota.service";
import { StorageLimitError } from "../storage.service";
import {
  decryptArchiveConnectorSourceStagingRunBatchForImport,
  loadArchiveConnectorSourceStagingRunForImport,
  markArchiveConnectorSourceStagingRunImported,
  type ArchiveConnectorSourceStagingImportPreview,
  type ArchiveConnectorSourceStagingRunRow,
  type SourceStagingBatch,
} from "./source-staging";

export const ARCHIVE_CONNECTOR_IMPORT_SOURCE_NAME = "Reddit saved items";

export type ArchiveConnectorSourceStagingImportErrorCode =
  | "archive_connector_source_staging_import_job_load_failed"
  | "archive_connector_source_staging_import_job_create_failed"
  | "archive_connector_source_staging_import_job_update_failed"
  | "archive_connector_source_staging_import_failed";

export class ArchiveConnectorSourceStagingImportError extends Error {
  constructor(public readonly code: ArchiveConnectorSourceStagingImportErrorCode, message: string) {
    super(message);
    this.name = "ArchiveConnectorSourceStagingImportError";
  }
}

export type ArchiveConnectorSourceStagingImportJobReadback = {
  id: string;
  kind: "archive_connector";
  status: ImportJobRow["status"];
  sourceName: typeof ARCHIVE_CONNECTOR_IMPORT_SOURCE_NAME;
  createdAt: string;
  updatedAt: string;
};

export type ArchiveConnectorSourceStagingImportMetadata = {
  format: "reddit_saved_items";
  sourceFamily: "reddit_user_history";
  sourceKind: "saved_items";
  pageLimit: 10;
  itemCount: number;
  postCount: number;
  commentCount: number;
  skippedCount: number;
  truncated: boolean;
};

export type ArchiveConnectorSourceStagingImportResult =
  | {
      outcome: "completed";
      imported: true;
      duplicate: false;
      idempotent: false;
      runId: string;
      job: ArchiveConnectorSourceStagingImportJobReadback;
      chunksCreated: number;
      metadata: ArchiveConnectorSourceStagingImportMetadata;
    }
  | {
      outcome: "already_completed";
      imported: true;
      duplicate: true;
      idempotent: true;
      runId: string;
      job: ArchiveConnectorSourceStagingImportJobReadback;
      chunksCreated: number;
      metadata: ArchiveConnectorSourceStagingImportMetadata;
    }
  | {
      outcome: "processing";
      imported: false;
      duplicate: true;
      idempotent: true;
      pending: true;
      runId: string;
      job: ArchiveConnectorSourceStagingImportJobReadback;
      chunksCreated: 0;
      metadata: ArchiveConnectorSourceStagingImportMetadata;
    };

const CONNECTOR_IMPORT_JOB_SELECT =
  "id, persona_id, owner_user_id, kind, status, source_name, file_id, archive_connector_source_staging_run_id, error_message, created_at, updated_at";

export async function importArchiveConnectorSourceStagingRun(input: {
  ownerUserId: string;
  runId: string;
}): Promise<ArchiveConnectorSourceStagingImportResult> {
  const existingJob = await loadConnectorImportJobByRunId(input);
  const existingRun = existingJob
    ? await loadSourceStagingRunForSafeReadback(input)
    : null;

  if (existingJob && existingRun) {
    const existing = await existingConnectorImportResult({
      ownerUserId: input.ownerUserId,
      runId: input.runId,
      job: existingJob,
      run: existingRun,
    });
    if (existing) return existing;
  }

  const { run } = await loadArchiveConnectorSourceStagingRunForImport(input);

  await assertActiveImportJobQuota({
    ownerUserId: input.ownerUserId,
    personaId: run.persona_id,
  });

  const { batch, preview } = decryptArchiveConnectorSourceStagingRunBatchForImport(run);
  const archiveText = archiveTextFromSourceStagingBatch(batch);
  let job: ImportJobRow;
  if (existingJob) {
    job = await markExistingConnectorJobProcessing(existingJob, input.ownerUserId);
  } else {
    const created = await createConnectorImportJob({
        ownerUserId: input.ownerUserId,
        personaId: run.persona_id,
        runId: run.id,
      });
    if (!created.created) {
      const raceResult = await existingConnectorImportResult({
        ownerUserId: input.ownerUserId,
        runId: input.runId,
        job: created.job,
        run,
      });
      if (raceResult) return raceResult;
      job = await markExistingConnectorJobProcessing(created.job, input.ownerUserId);
    } else {
      job = created.job;
    }
  }

  try {
    const chunksCreated = await ingestTextIntoArchive({
      personaId: run.persona_id,
      ownerUserId: input.ownerUserId,
      text: archiveText,
      sourceName: ARCHIVE_CONNECTOR_IMPORT_SOURCE_NAME,
      sourceType: "import",
      relevanceWeight: 1.5,
      archiveSource: {
        type: "import_job",
        id: job.id,
        name: ARCHIVE_CONNECTOR_IMPORT_SOURCE_NAME,
      },
    });

    const completedJob = await markImportJobCompleted(job.id, input.ownerUserId);
    await markArchiveConnectorSourceStagingRunImported({
      ownerUserId: input.ownerUserId,
      runId: run.id,
    });

    return {
      outcome: "completed",
      imported: true,
      duplicate: false,
      idempotent: false,
      runId: run.id,
      job: connectorJobReadback(completedJob),
      chunksCreated,
      metadata: metadataFromPreview(preview),
    };
  } catch (error) {
    const rows = await countImportArchiveRows(job).catch(() => 0);
    if (rows > 0) {
      const completedJob = await markImportJobCompleted(job.id, input.ownerUserId);
      await markArchiveConnectorSourceStagingRunImported({
        ownerUserId: input.ownerUserId,
        runId: run.id,
      }).catch(() => undefined);
      return {
        outcome: "already_completed",
        imported: true,
        duplicate: true,
        idempotent: true,
        runId: run.id,
        job: connectorJobReadback(completedJob),
        chunksCreated: rows,
        metadata: metadataFromPreview(preview),
      };
    }

    await markImportJobFailed(
      job.id,
      input.ownerUserId,
      "Archive connector source staging import failed."
    ).catch(() => undefined);
    if (error instanceof StorageLimitError) throw error;
    throw new ArchiveConnectorSourceStagingImportError(
      "archive_connector_source_staging_import_failed",
      "Archive connector source staging import failed."
    );
  }
}

async function existingConnectorImportResult(input: {
  ownerUserId: string;
  runId: string;
  job: ImportJobRow;
  run: ArchiveConnectorSourceStagingRunRow;
}): Promise<ArchiveConnectorSourceStagingImportResult | null> {
  const chunksCreated = await countImportArchiveRows(input.job);
  const metadata = metadataFromRun(input.run);

  if (input.job.status === "completed" && chunksCreated > 0) {
    await markArchiveConnectorSourceStagingRunImported({
      ownerUserId: input.ownerUserId,
      runId: input.runId,
    }).catch(() => undefined);
    return {
      outcome: "already_completed",
      imported: true,
      duplicate: true,
      idempotent: true,
      runId: input.runId,
      job: connectorJobReadback(input.job),
      chunksCreated,
      metadata,
    };
  }

  if (input.job.status === "queued" || input.job.status === "processing") {
    return {
      outcome: "processing",
      imported: false,
      duplicate: true,
      idempotent: true,
      pending: true,
      runId: input.runId,
      job: connectorJobReadback(input.job),
      chunksCreated: 0,
      metadata,
    };
  }

  if (chunksCreated > 0) {
    const completedJob = await markImportJobCompleted(input.job.id, input.ownerUserId);
    await markArchiveConnectorSourceStagingRunImported({
      ownerUserId: input.ownerUserId,
      runId: input.runId,
    }).catch(() => undefined);
    return {
      outcome: "already_completed",
      imported: true,
      duplicate: true,
      idempotent: true,
      runId: input.runId,
      job: connectorJobReadback(completedJob),
      chunksCreated,
      metadata,
    };
  }

  return null;
}

async function loadConnectorImportJobByRunId(input: {
  ownerUserId: string;
  runId: string;
}) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("import_jobs")
    .select(CONNECTOR_IMPORT_JOB_SELECT)
    .eq("owner_user_id", input.ownerUserId)
    .eq("kind", "archive_connector")
    .eq("archive_connector_source_staging_run_id", input.runId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new ArchiveConnectorSourceStagingImportError(
      "archive_connector_source_staging_import_job_load_failed",
      "Could not load archive connector import job."
    );
  }

  const row = (data ?? [])[0] ?? null;
  return row ? normalizeConnectorImportJobRow(row) : null;
}

async function loadSourceStagingRunForSafeReadback(input: {
  ownerUserId: string;
  runId: string;
}) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("archive_connector_source_staging_runs")
    .select("*")
    .eq("id", input.runId)
    .eq("owner_user_id", input.ownerUserId)
    .eq("purpose", "archive_connector")
    .eq("provider", "reddit")
    .eq("source_family", "reddit_user_history")
    .eq("source_kind", "saved_items");

  if (error) {
    throw new ArchiveConnectorSourceStagingImportError(
      "archive_connector_source_staging_import_job_load_failed",
      "Could not load archive connector source staging import metadata."
    );
  }

  return ((data ?? []) as ArchiveConnectorSourceStagingRunRow[])[0] ?? null;
}

async function createConnectorImportJob(input: {
  ownerUserId: string;
  personaId: string;
  runId: string;
}): Promise<{ job: ImportJobRow; created: boolean }> {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("import_jobs")
    .insert({
      persona_id: input.personaId,
      owner_user_id: input.ownerUserId,
      kind: "archive_connector",
      status: "processing",
      source_name: ARCHIVE_CONNECTOR_IMPORT_SOURCE_NAME,
      archive_connector_source_staging_run_id: input.runId,
    })
    .select(CONNECTOR_IMPORT_JOB_SELECT)
    .single();

  if (error || !data) {
    const existing = await loadConnectorImportJobByRunId({
      ownerUserId: input.ownerUserId,
      runId: input.runId,
    });
    if (existing) return { job: existing, created: false };

    throw new ArchiveConnectorSourceStagingImportError(
      "archive_connector_source_staging_import_job_create_failed",
      "Could not create archive connector import job."
    );
  }

  return { job: normalizeConnectorImportJobRow(data), created: true };
}

async function markExistingConnectorJobProcessing(job: ImportJobRow, ownerUserId: string) {
  if (job.status !== "failed") return job;
  try {
    return await markImportJobProcessing(job.id, ownerUserId);
  } catch {
    throw new ArchiveConnectorSourceStagingImportError(
      "archive_connector_source_staging_import_job_update_failed",
      "Could not update archive connector import job."
    );
  }
}

function normalizeConnectorImportJobRow(row: any): ImportJobRow {
  const normalized = normalizeImportJobRow(row);
  if (
    normalized.kind !== "archive_connector" ||
    normalized.archive_connector_source_staging_run_id == null
  ) {
    throw new ArchiveConnectorSourceStagingImportError(
      "archive_connector_source_staging_import_job_load_failed",
      "Archive connector import job metadata is invalid."
    );
  }
  return normalized;
}

function connectorJobReadback(job: ImportJobRow): ArchiveConnectorSourceStagingImportJobReadback {
  return {
    id: job.id,
    kind: "archive_connector",
    status: job.status,
    sourceName: ARCHIVE_CONNECTOR_IMPORT_SOURCE_NAME,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  };
}

function metadataFromPreview(
  preview: ArchiveConnectorSourceStagingImportPreview,
): ArchiveConnectorSourceStagingImportMetadata {
  return {
    format: "reddit_saved_items",
    sourceFamily: "reddit_user_history",
    sourceKind: "saved_items",
    pageLimit: preview.pageLimit,
    itemCount: preview.itemCount,
    postCount: preview.postCount,
    commentCount: preview.commentCount,
    skippedCount: preview.skippedCount,
    truncated: preview.truncated,
  };
}

function metadataFromRun(
  run: ArchiveConnectorSourceStagingRunRow,
): ArchiveConnectorSourceStagingImportMetadata {
  return {
    format: "reddit_saved_items",
    sourceFamily: "reddit_user_history",
    sourceKind: "saved_items",
    pageLimit: 10,
    itemCount: run.item_count,
    postCount: run.post_count,
    commentCount: run.comment_count,
    skippedCount: run.skipped_count,
    truncated: run.truncated,
  };
}

function archiveTextFromSourceStagingBatch(batch: SourceStagingBatch) {
  return batch.items
    .map((item, index) =>
      [
        `Reddit saved item ${index + 1}`,
        `Kind: ${item.kind}`,
        item.normalizedText,
      ].join("\n")
    )
    .join("\n\n");
}
