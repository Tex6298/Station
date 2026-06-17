import { getSupabaseAdmin } from "../lib/supabase";
import { env } from "../lib/env";

export const IMPORT_JOB_SELECT =
  "id, persona_id, owner_user_id, kind, status, source_name, file_id, error_message, created_at, updated_at";

export const LEGACY_IMPORT_JOB_SELECT =
  "id, persona_id, owner_user_id, kind, status, source_name, error_message, created_at, updated_at";

export type ImportJobStatus = "queued" | "processing" | "completed" | "failed";

export type ImportJobRow = {
  id: string;
  persona_id: string;
  owner_user_id: string;
  kind: "file" | "chat";
  status: ImportJobStatus;
  source_name: string;
  file_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export function serializeImportJob(row: ImportJobRow) {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    source_name: row.source_name,
    error_message: row.error_message ? sanitizeJobErrorMessage(row.error_message) : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function normalizeImportJobRow(row: Omit<ImportJobRow, "file_id"> & { file_id?: string | null }): ImportJobRow {
  return {
    ...row,
    file_id: row.file_id ?? null,
  };
}

export async function selectImportJobRowWithFileIdFallback(
  queryFactory: (select: string) => PromiseLike<{ data: any | null; error?: { message?: string } | null }>
) {
  const result = await queryFactory(IMPORT_JOB_SELECT);
  if (isMissingImportJobFileIdError(result.error)) {
    const legacy = await queryFactory(LEGACY_IMPORT_JOB_SELECT);
    return {
      data: legacy.data ? normalizeImportJobRow(legacy.data) : null,
      error: legacy.error ?? null,
    };
  }

  return {
    data: result.data ? normalizeImportJobRow(result.data) : null,
    error: result.error ?? null,
  };
}

export async function selectImportJobRowsWithFileIdFallback(
  queryFactory: (select: string) => PromiseLike<{ data: any[] | null; error?: { message?: string } | null }>
) {
  const result = await queryFactory(IMPORT_JOB_SELECT);
  if (isMissingImportJobFileIdError(result.error)) {
    const legacy = await queryFactory(LEGACY_IMPORT_JOB_SELECT);
    return {
      data: (legacy.data ?? []).map(normalizeImportJobRow),
      error: legacy.error ?? null,
    };
  }

  return {
    data: (result.data ?? []).map(normalizeImportJobRow),
    error: result.error ?? null,
  };
}

export function sanitizeJobErrorMessage(error: unknown, privateSnippets: Array<string | null | undefined> = []) {
  let message = error instanceof Error
    ? error.message
    : typeof error === "string"
      ? error
      : "Job failed.";

  for (const snippet of privateSnippets) {
    const value = snippet?.trim();
    if (!value || value.length < 8) continue;
    message = replaceAll(message, value, "[redacted private text]");
    const leadingExcerpt = value.slice(0, 120);
    if (leadingExcerpt.length >= 16) {
      message = replaceAll(message, leadingExcerpt, "[redacted private text]");
    }
  }

  message = message
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [redacted]")
    .replace(/\bsk-[A-Za-z0-9_-]+\b/g, "[redacted]")
    .replace(/\b(?:service[_-]?role|api[_-]?key|secret|token)\s*[:=]\s*\S+/gi, "[redacted]");

  const normalized = message.replace(/\s+/g, " ").trim() || "Job failed.";
  return normalized.length > 240 ? `${normalized.slice(0, 237)}...` : normalized;
}

export async function loadOwnedImportJob(jobId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await selectImportJobRowWithFileIdFallback((select) =>
    sb
      .from("import_jobs")
      .select(select)
      .eq("id", jobId)
      .eq("owner_user_id", ownerUserId)
      .single()
  );

  if (error || !data) return null;
  return data as ImportJobRow;
}

export async function markImportJobProcessing(jobId: string, ownerUserId: string) {
  return updateImportJob(jobId, ownerUserId, {
    status: "processing",
    error_message: null,
  });
}

export async function markImportJobCompleted(jobId: string, ownerUserId: string) {
  return updateImportJob(jobId, ownerUserId, {
    status: "completed",
    error_message: null,
  });
}

export async function markImportJobFailed(
  jobId: string,
  ownerUserId: string,
  error: unknown,
  privateSnippets: Array<string | null | undefined> = []
) {
  return updateImportJob(jobId, ownerUserId, {
    status: "failed",
    error_message: sanitizeJobErrorMessage(error, privateSnippets),
  });
}

export async function countImportArchiveRows(job: Pick<ImportJobRow, "id" | "owner_user_id" | "persona_id">) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("memory_items")
    .select("id")
    .eq("owner_user_id", job.owner_user_id)
    .eq("persona_id", job.persona_id)
    .eq("archive_source_type", "import_job")
    .eq("archive_source_id", job.id);

  if (error) throw new Error(error.message);
  return (data ?? []).length;
}

export async function countPersonaFileArchiveRows(input: {
  fileId: string;
  ownerUserId: string;
  personaId: string;
}) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("memory_items")
    .select("id")
    .eq("owner_user_id", input.ownerUserId)
    .eq("persona_id", input.personaId)
    .eq("archive_source_type", "persona_file")
    .eq("archive_source_id", input.fileId);

  if (error) throw new Error(error.message);
  return (data ?? []).length;
}

export type QueueProviderStatus = {
  provider: "redis_tcp" | "valkey_tcp" | "upstash_rest_cache_only" | "not_configured";
  queueConfigured: boolean;
  workerQueueReady: boolean;
  cacheConfigured: boolean;
  upstashRestConfigured: boolean;
  inlineFallback: boolean;
  detail: string;
};

export function queueProviderStatus(): QueueProviderStatus {
  const redisTcp = hasValue(env.REDIS_URL) || hasValue(env.REDIS_PRIVATE_URL);
  const valkeyTcp = hasValue(env.VALKEY_URL);
  const upstashRest = hasValue(env.UPSTASH_REDIS_REST_URL) && hasValue(env.UPSTASH_REDIS_REST_TOKEN);

  if (redisTcp || valkeyTcp) {
    return {
      provider: valkeyTcp && !redisTcp ? "valkey_tcp" : "redis_tcp",
      queueConfigured: true,
      workerQueueReady: true,
      cacheConfigured: upstashRest,
      upstashRestConfigured: upstashRest,
      inlineFallback: true,
      detail: "TCP Redis/Valkey queue configuration is present; protected-alpha inline fallback remains available.",
    };
  }

  if (upstashRest) {
    return {
      provider: "upstash_rest_cache_only",
      queueConfigured: false,
      workerQueueReady: false,
      cacheConfigured: true,
      upstashRestConfigured: true,
      inlineFallback: true,
      detail: "Upstash REST cache is configured, but no BullMQ-compatible TCP queue provider is configured.",
    };
  }

  return {
    provider: "not_configured",
    queueConfigured: false,
    workerQueueReady: false,
    cacheConfigured: false,
    upstashRestConfigured: false,
    inlineFallback: true,
    detail: "No queue provider is configured; protected-alpha inline fallback is required.",
  };
}

async function updateImportJob(jobId: string, ownerUserId: string, patch: Partial<ImportJobRow>) {
  const sb = getSupabaseAdmin();
  const { data, error } = await selectImportJobRowWithFileIdFallback((select) =>
    sb
      .from("import_jobs")
      .update(patch)
      .eq("id", jobId)
      .eq("owner_user_id", ownerUserId)
      .select(select)
      .single()
  );

  if (error || !data) throw new Error(error?.message ?? "Import job update failed.");
  return data as ImportJobRow;
}

function isMissingImportJobFileIdError(error: { message?: string } | null | undefined) {
  const message = error?.message ?? "";
  return /import_jobs\.file_id|file_id/i.test(message) && /does not exist|schema cache|column/i.test(message);
}

function hasValue(value: string | undefined | null) {
  return typeof value === "string" && value.trim().length > 0;
}

function replaceAll(input: string, search: string, replacement: string) {
  return input.split(search).join(replacement);
}
