import { getSupabaseAdmin } from "../lib/supabase";
import { env } from "../lib/env";
import { OPERATIONAL_CACHE_TTLS, operationalCacheKey } from "./operational-cache.service";

export const IMPORT_JOB_SELECT =
  "id, persona_id, owner_user_id, kind, status, source_name, file_id, error_message, created_at, updated_at";

export const LEGACY_IMPORT_JOB_SELECT =
  "id, persona_id, owner_user_id, kind, status, source_name, error_message, created_at, updated_at";

export type ImportJobStatus = "queued" | "processing" | "completed" | "failed";

export type BackgroundJobStatus = "queued" | "processing" | "completed" | "failed";

export type BackgroundJobKind =
  | "archive_extraction"
  | "embedding_backfill"
  | "memory_consolidation"
  | "export_assembly"
  | "replay_seed_setup"
  | "developer_space_import_batch";

export type BackgroundJobScope = {
  ownerUserId: string;
  personaId?: string | null;
  developerSpaceId?: string | null;
  resourceId?: string | null;
  operation?: string | null;
};

export type BackgroundJobRetryMetadata = {
  attemptCount: number;
  retryable: boolean;
  lastSafeErrorSummary: string | null;
};

export type BackgroundJobSummary = {
  id: string;
  kind: BackgroundJobKind;
  status: BackgroundJobStatus;
  ownerUserId: string;
  personaId: string | null;
  developerSpaceId: string | null;
  resourceId: string | null;
  sourceLabel: string | null;
  errorMessage: string | null;
};

export type ExportPackageJobRow = {
  id: string;
  owner_user_id: string;
  persona_id?: string | null;
  developer_space_id?: string | null;
  status: "requested" | "processing" | "completed" | "failed";
  package_kind?: string | null;
  error_message?: string | null;
};

export type ExportPackageJobReadbackRow = ExportPackageJobRow & {
  requested_at?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type OwnerBackgroundJobReadback = {
  id: string;
  kind: BackgroundJobKind;
  status: BackgroundJobStatus;
  statusStore: "import_jobs" | "export_packages";
  label: string;
  errorSummary: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type InactiveBackgroundJobReadback = {
  kind: BackgroundJobKind;
  status: "inactive";
  statusStore: "route_followup";
  ownerScoped: boolean;
  reason: string;
};

export const BACKGROUND_JOB_KINDS: Record<BackgroundJobKind, {
  statusStore: "import_jobs" | "export_packages" | "route_followup";
  ownerScoped: boolean;
  readback: "existing_owner_route" | "route_followup";
}> = {
  archive_extraction: {
    statusStore: "import_jobs",
    ownerScoped: true,
    readback: "existing_owner_route",
  },
  embedding_backfill: {
    statusStore: "route_followup",
    ownerScoped: true,
    readback: "route_followup",
  },
  memory_consolidation: {
    statusStore: "route_followup",
    ownerScoped: true,
    readback: "route_followup",
  },
  export_assembly: {
    statusStore: "export_packages",
    ownerScoped: true,
    readback: "existing_owner_route",
  },
  replay_seed_setup: {
    statusStore: "route_followup",
    ownerScoped: false,
    readback: "route_followup",
  },
  developer_space_import_batch: {
    statusStore: "route_followup",
    ownerScoped: true,
    readback: "route_followup",
  },
};

const BACKGROUND_JOB_STATUS_TRANSITIONS: Record<BackgroundJobStatus, BackgroundJobStatus[]> = {
  queued: ["processing", "completed", "failed"],
  processing: ["completed", "failed"],
  completed: ["completed"],
  failed: ["queued", "processing", "completed", "failed"],
};

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

export function normalizeBackgroundJobStatus(status: ImportJobStatus | ExportPackageJobRow["status"]): BackgroundJobStatus {
  return status === "requested" ? "queued" : status;
}

export function canTransitionBackgroundJobStatus(from: BackgroundJobStatus, to: BackgroundJobStatus) {
  return BACKGROUND_JOB_STATUS_TRANSITIONS[from].includes(to);
}

export function assertBackgroundJobStatusTransition(from: BackgroundJobStatus, to: BackgroundJobStatus) {
  if (!canTransitionBackgroundJobStatus(from, to)) {
    throw new Error(`Invalid background job transition: ${from} -> ${to}.`);
  }
}

export function backgroundJobIdempotencyKey(kind: BackgroundJobKind, scope: BackgroundJobScope, envName?: string) {
  return operationalCacheKey({
    purpose: "idempotency",
    envName,
    scope: {
      ownerUserId: scope.ownerUserId,
      personaId: scope.personaId ?? null,
      developerSpaceId: scope.developerSpaceId ?? null,
      resourceId: scope.resourceId ?? null,
      operation: scope.operation ?? kind,
    },
    parts: ["background-job", kind],
  });
}

export function backgroundJobIdempotencyTtlSeconds() {
  return OPERATIONAL_CACHE_TTLS.idempotency;
}

export function buildBackgroundJobRetryMetadata(input: {
  previousAttemptCount?: number | null;
  error?: unknown;
  privateSnippets?: Array<string | null | undefined>;
  retryable?: boolean;
}): BackgroundJobRetryMetadata {
  const previous = Number.isFinite(input.previousAttemptCount ?? Number.NaN)
    ? Math.max(0, Math.floor(input.previousAttemptCount as number))
    : 0;

  return {
    attemptCount: previous + 1,
    retryable: input.retryable ?? true,
    lastSafeErrorSummary: input.error === undefined
      ? null
      : sanitizeJobErrorMessage(input.error, input.privateSnippets ?? []),
  };
}

export function summarizeImportBackgroundJob(row: ImportJobRow): BackgroundJobSummary {
  return {
    id: row.id,
    kind: "archive_extraction",
    status: row.status,
    ownerUserId: row.owner_user_id,
    personaId: row.persona_id,
    developerSpaceId: null,
    resourceId: row.file_id ?? row.id,
    sourceLabel: row.source_name,
    errorMessage: row.error_message ? sanitizeJobErrorMessage(row.error_message, [row.source_name]) : null,
  };
}

export function summarizeExportBackgroundJob(row: ExportPackageJobRow): BackgroundJobSummary {
  return {
    id: row.id,
    kind: "export_assembly",
    status: normalizeBackgroundJobStatus(row.status),
    ownerUserId: row.owner_user_id,
    personaId: row.persona_id ?? null,
    developerSpaceId: row.developer_space_id ?? null,
    resourceId: row.developer_space_id ?? row.persona_id ?? row.id,
    sourceLabel: row.package_kind ?? "export_package",
    errorMessage: row.error_message ? sanitizeJobErrorMessage(row.error_message) : null,
  };
}

export function serializeOwnerBackgroundJobReadback(
  summary: BackgroundJobSummary,
  timestamps: { createdAt?: string | null; updatedAt?: string | null } = {}
): OwnerBackgroundJobReadback {
  const statusStore = BACKGROUND_JOB_KINDS[summary.kind].statusStore;
  if (statusStore !== "import_jobs" && statusStore !== "export_packages") {
    throw new Error(`Background job kind ${summary.kind} does not have durable owner readback.`);
  }

  return {
    id: summary.id,
    kind: summary.kind,
    status: summary.status,
    statusStore,
    label: sanitizeJobDisplayLabel(summary.sourceLabel, fallbackJobLabel(summary.kind)),
    errorSummary: summary.errorMessage ? sanitizeJobErrorMessage(summary.errorMessage) : null,
    createdAt: timestamps.createdAt ?? null,
    updatedAt: timestamps.updatedAt ?? timestamps.createdAt ?? null,
  };
}

export function serializeImportBackgroundJobReadback(row: ImportJobRow): OwnerBackgroundJobReadback {
  return serializeOwnerBackgroundJobReadback(summarizeImportBackgroundJob(row), {
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function serializeExportBackgroundJobReadback(row: ExportPackageJobReadbackRow): OwnerBackgroundJobReadback {
  return serializeOwnerBackgroundJobReadback(summarizeExportBackgroundJob(row), {
    createdAt: row.created_at ?? row.requested_at ?? null,
    updatedAt: row.updated_at ?? row.completed_at ?? row.requested_at ?? row.created_at ?? null,
  });
}

export function inactiveRouteFollowupBackgroundJobs(): InactiveBackgroundJobReadback[] {
  return (Object.entries(BACKGROUND_JOB_KINDS) as Array<[BackgroundJobKind, typeof BACKGROUND_JOB_KINDS[BackgroundJobKind]]>)
    .filter(([, definition]) => definition.statusStore === "route_followup")
    .map(([kind, definition]) => ({
      kind,
      status: "inactive",
      statusStore: "route_followup",
      ownerScoped: definition.ownerScoped,
      reason: routeFollowupInactiveReason(kind),
    }));
}

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
    .replace(/\b(?:postgres(?:ql)?|redis|mysql):\/\/\S+/gi, "[redacted-url]")
    .replace(/\bhttps?:\/\/\S+/gi, "[redacted-url]")
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [redacted]")
    .replace(/\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+\b/gi, "[redacted]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[id]")
    .replace(/\b(?:owner|user|persona|developer[_-]?space|space|memory|trace|event|source|resource)[_-]?id\s*[:=]\s*\S+/gi, "[redacted-id]")
    .replace(/\b(?:authorization|cookie|token|api[_-]?key|x-api-key|service[_-]?role|secret|password|webhook[_-]?secret|db[_-]?url)\s*[:=]\s*\S+/gi, "[redacted]")
    .replace(/\b(?:prompt|completion|provider[_-]?payload|private[_-]?text|raw[_-]?body|archive[_-]?excerpt)\s*[:=]\s*[^.;]+/gi, "[redacted private text]");

  const normalized = message.replace(/\s+/g, " ").trim() || "Job failed.";
  return normalized.length > 240 ? `${normalized.slice(0, 237)}...` : normalized;
}

export function sanitizeJobDisplayLabel(
  label: string | null | undefined,
  fallback = "background job"
) {
  const normalized = typeof label === "string" && label.trim()
    ? sanitizeJobErrorMessage(label)
    : fallback;
  return normalized.length > 80 ? `${normalized.slice(0, 77)}...` : normalized;
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

function fallbackJobLabel(kind: BackgroundJobKind) {
  switch (kind) {
    case "archive_extraction":
      return "archive import";
    case "export_assembly":
      return "export package";
    default:
      return "background job";
  }
}

function routeFollowupInactiveReason(kind: BackgroundJobKind) {
  switch (kind) {
    case "embedding_backfill":
      return "No embedding backfill owner job route exists yet.";
    case "memory_consolidation":
      return "No memory consolidation owner job route exists yet.";
    case "replay_seed_setup":
      return "Replay seed setup remains a readiness/manual lane until a job route exists.";
    case "developer_space_import_batch":
      return "Developer Space batch import remains on current ingestion routes until a batch job route exists.";
    default:
      return "No owner job route exists yet.";
  }
}

function replaceAll(input: string, search: string, replacement: string) {
  return input.split(search).join(replacement);
}
