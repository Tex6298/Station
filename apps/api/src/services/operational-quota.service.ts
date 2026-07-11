import { getSupabaseAdmin } from "../lib/supabase";

export const ACTIVE_IMPORT_JOB_LIMIT_PER_PERSONA = 5;
export const ACTIVE_EXPORT_LIMIT_PER_TARGET = 1;
export const EMBEDDING_ARCHIVE_CHUNK_LIMIT_PER_WRITE = 24;

export type OperationalQuotaResource =
  | "import_jobs"
  | "export_packages"
  | "developer_space_nodes"
  | "developer_space_events"
  | "developer_space_snapshots"
  | "developer_space_storage_bytes"
  | "developer_space_public_reads"
  | "developer_space_exports"
  | "archive_embeddings";

export class OperationalQuotaError extends Error {
  readonly code = "quota_exceeded";
  readonly status: number;
  readonly resource: OperationalQuotaResource;
  readonly limit: number;
  readonly used: number;
  readonly retryAfter?: number;

  constructor(input: {
    resource: OperationalQuotaResource;
    limit: number;
    used: number;
    message?: string;
    status?: number;
    retryAfter?: number;
  }) {
    super(input.message ?? "Operational quota exceeded.");
    this.name = "OperationalQuotaError";
    this.resource = input.resource;
    this.limit = input.limit;
    this.used = input.used;
    this.status = input.status ?? 429;
    this.retryAfter = input.retryAfter;
  }
}

export function quotaErrorResponse(error: unknown) {
  if (!(error instanceof OperationalQuotaError)) return null;
  return {
    status: error.status,
    body: {
      error: error.message,
      code: error.code,
      resource: error.resource,
      limit: error.limit,
      used: error.used,
      ...(error.retryAfter !== undefined ? { retryAfter: error.retryAfter } : {}),
    },
  };
}

export function assertQuotaAvailable(input: {
  resource: OperationalQuotaResource;
  limit: number;
  used: number;
  delta?: number;
  message?: string;
  status?: number;
  retryAfter?: number;
}) {
  const delta = Math.max(0, input.delta ?? 1);
  if (input.limit < 0) return;
  if (input.used + delta <= input.limit) return;
  throw new OperationalQuotaError({
    resource: input.resource,
    limit: input.limit,
    used: input.used,
    status: input.status,
    retryAfter: input.retryAfter,
    message: input.message ?? `Quota exceeded for ${input.resource}.`,
  });
}

export async function assertActiveImportJobQuota(input: {
  ownerUserId: string;
  personaId: string;
  limit?: number;
}) {
  const limit = input.limit ?? ACTIVE_IMPORT_JOB_LIMIT_PER_PERSONA;
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("import_jobs")
    .select("id, status")
    .eq("owner_user_id", input.ownerUserId)
    .eq("persona_id", input.personaId);

  if (error) throw new Error(error.message);
  const used = (data ?? []).filter((job: any) => job.status === "queued" || job.status === "processing").length;
  assertQuotaAvailable({
    resource: "import_jobs",
    limit,
    used,
    message: "Too many active import jobs for this persona.",
    retryAfter: 60,
  });
}

export async function assertNoInProgressExportPackage(input: {
  ownerUserId: string;
  packageKind: "persona_archive" | "developer_space_archive" | "project_manifest" | "workspace_manifest" | "station_press_publication";
  personaId?: string | null;
  developerSpaceId?: string | null;
  projectId?: string | null;
  documentId?: string | null;
}) {
  const sb = getSupabaseAdmin();
  let query = sb
    .from("export_packages")
    .select("id, status")
    .eq("owner_user_id", input.ownerUserId)
    .eq("package_kind", input.packageKind);

  if (input.personaId !== undefined) query = query.eq("persona_id", input.personaId);
  if (input.developerSpaceId !== undefined) query = query.eq("developer_space_id", input.developerSpaceId);
  if (input.projectId !== undefined) query = query.eq("project_id", input.projectId);
  if (input.documentId !== undefined) query = query.eq("document_id", input.documentId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const used = (data ?? []).filter((row: any) => row.status === "requested" || row.status === "processing").length;
  assertQuotaAvailable({
    resource: "export_packages",
    limit: ACTIVE_EXPORT_LIMIT_PER_TARGET,
    used,
    message: "An export package is already processing for this target.",
    retryAfter: 60,
  });
}

export function assertEmbeddingArchiveWriteQuota(input: {
  chunkCount: number;
  embeddingEnabled: boolean;
  limit?: number;
}) {
  if (!input.embeddingEnabled) return;
  const limit = input.limit ?? EMBEDDING_ARCHIVE_CHUNK_LIMIT_PER_WRITE;
  assertQuotaAvailable({
    resource: "archive_embeddings",
    limit,
    used: 0,
    delta: input.chunkCount,
    message: "Archive embedding write is too large for one request.",
  });
}
