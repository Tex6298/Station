export type CloudflareRetrievalDisabledReason =
  | "not_enabled"
  | "missing_config"
  | "remote_adapter_pending";

export type CloudflareRetrievalStatus = {
  enabled: boolean;
  kind: "disabled" | "worker_vectorize_pending";
  disabledReason?: CloudflareRetrievalDisabledReason;
  indexName?: string | null;
};

export type CloudflareRetrievalConfig = {
  enabled?: boolean;
  workerUrl?: string | null;
  apiToken?: string | null;
  indexName?: string | null;
};

export type CloudflareRetrievalCandidate = {
  id: string;
  recordType: "memory_item";
  score?: number | null;
  metadata?: Record<string, string | number | boolean | null>;
};

export type CloudflareCandidateSearchInput = {
  query: string;
  ownerUserId: string;
  personaId?: string | null;
  limit?: number;
};

export type CloudflareCandidateSearchResult = {
  status: CloudflareRetrievalStatus;
  candidates: CloudflareRetrievalCandidate[];
};

export type CloudflareRetrievalAdapter = {
  status(): CloudflareRetrievalStatus;
  searchCandidateIds(input: CloudflareCandidateSearchInput): Promise<CloudflareCandidateSearchResult>;
};

export type CloudflareMemoryMirrorInput = {
  id: string;
  owner_user_id: string;
  persona_id: string | null;
  source_type: string | null;
  archive_source_type?: string | null;
  embedding_provider?: string | null;
  embedding_model?: string | null;
  embedding_dimension?: number | null;
  embedding_index_name?: string | null;
  embedding_backfill_version?: number | null;
  updated_at?: string | null;
};

export type CloudflareMemoryMirrorPayload = {
  id: string;
  recordType: "memory_item";
  ownerUserId: string;
  personaId: string | null;
  sourceType: string | null;
  archiveSourceType: string | null;
  embedding: {
    provider: string | null;
    model: string | null;
    dimension: number | null;
    indexName: string | null;
    backfillVersion: number | null;
  };
  updatedAt: string | null;
};

export type CloudflareMemoryCandidateAuthorization = {
  supabase: {
    from(table: string): any;
  };
  ownerUserId: string;
  personaId: string;
  candidates: CloudflareRetrievalCandidate[];
  limit?: number;
};

export function createCloudflareRetrievalAdapter(config: CloudflareRetrievalConfig = {}): CloudflareRetrievalAdapter {
  return new DisabledCloudflareRetrievalAdapter(cloudflareRetrievalStatus(config));
}

export function cloudflareRetrievalStatus(config: CloudflareRetrievalConfig = {}): CloudflareRetrievalStatus {
  if (config.enabled !== true) {
    return {
      enabled: false,
      kind: "disabled",
      disabledReason: "not_enabled",
      indexName: clean(config.indexName),
    };
  }

  if (!clean(config.workerUrl) || !clean(config.apiToken) || !clean(config.indexName)) {
    return {
      enabled: false,
      kind: "disabled",
      disabledReason: "missing_config",
      indexName: clean(config.indexName),
    };
  }

  return {
    enabled: false,
    kind: "worker_vectorize_pending",
    disabledReason: "remote_adapter_pending",
    indexName: clean(config.indexName),
  };
}

export function cloudflareRetrievalConfigFromEnv(env: Record<string, string | undefined> = process.env) {
  return {
    enabled: env.CLOUDFLARE_RETRIEVAL_ENABLED === "true",
    workerUrl: env.CLOUDFLARE_RETRIEVAL_WORKER_URL,
    apiToken: env.CLOUDFLARE_RETRIEVAL_API_TOKEN,
    indexName: env.CLOUDFLARE_VECTORIZE_INDEX,
  } satisfies CloudflareRetrievalConfig;
}

export function buildCloudflareMemoryMirrorPayload(row: CloudflareMemoryMirrorInput): CloudflareMemoryMirrorPayload {
  return {
    id: row.id,
    recordType: "memory_item",
    ownerUserId: row.owner_user_id,
    personaId: row.persona_id,
    sourceType: row.source_type,
    archiveSourceType: row.archive_source_type ?? null,
    embedding: {
      provider: row.embedding_provider ?? null,
      model: row.embedding_model ?? null,
      dimension: row.embedding_dimension ?? null,
      indexName: row.embedding_index_name ?? null,
      backfillVersion: row.embedding_backfill_version ?? null,
    },
    updatedAt: row.updated_at ?? null,
  };
}

export async function authorizeCloudflareMemoryCandidates(input: CloudflareMemoryCandidateAuthorization) {
  const limitedCandidates = uniqueMemoryCandidates(input.candidates).slice(0, input.limit ?? 10);
  if (limitedCandidates.length === 0) {
    return { authorized: [], rejected: [] };
  }

  const ids = limitedCandidates.map((candidate) => candidate.id);
  const { data, error } = await input.supabase
    .from("memory_items")
    .select("id, owner_user_id, persona_id, title, content, summary, source_type, relevance_weight, archive_source_type, archive_source_id, archive_source_name, created_at, updated_at, memory_item_lifecycle(*)")
    .in("id", ids)
    .eq("owner_user_id", input.ownerUserId)
    .eq("persona_id", input.personaId);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<Record<string, any>>;
  const rowsById = new Map<string, Record<string, any>>(rows.map((row) => [String(row.id), row]));
  const authorized = [];
  const rejected = [];

  for (const candidate of limitedCandidates) {
    const row = rowsById.get(candidate.id);
    if (
      !row
      || row.owner_user_id !== input.ownerUserId
      || row.persona_id !== input.personaId
      || !isLifecycleInjectable(extractLifecycle(row))
    ) {
      rejected.push({ id: candidate.id, reason: "not_found_or_not_authorized" as const });
      continue;
    }

    authorized.push({
      candidate: {
        id: candidate.id,
        recordType: candidate.recordType,
        score: candidate.score ?? null,
      },
      record: stripAuthorizationJoin(row),
    });
  }

  return { authorized, rejected };
}

class DisabledCloudflareRetrievalAdapter implements CloudflareRetrievalAdapter {
  constructor(private readonly currentStatus: CloudflareRetrievalStatus) {}

  status() {
    return this.currentStatus;
  }

  async searchCandidateIds(): Promise<CloudflareCandidateSearchResult> {
    return {
      status: this.currentStatus,
      candidates: [],
    };
  }
}

function uniqueMemoryCandidates(candidates: CloudflareRetrievalCandidate[]) {
  const seen = new Set<string>();
  const result: CloudflareRetrievalCandidate[] = [];
  for (const candidate of candidates) {
    if (candidate.recordType !== "memory_item" || seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    result.push(candidate);
  }
  return result;
}

function extractLifecycle(row: Record<string, any>) {
  const joined = row.memory_item_lifecycle;
  return Array.isArray(joined) ? joined[0] ?? null : joined ?? null;
}

function isLifecycleInjectable(lifecycle: any) {
  if (!lifecycle) return true;
  if ((lifecycle.status ?? "active") !== "active") return false;
  if (lifecycle.superseded_by_memory_item_id) return false;
  if (!lifecycle.expires_at) return true;

  const expiresAt = Date.parse(lifecycle.expires_at);
  return Number.isNaN(expiresAt) || expiresAt > Date.now();
}

function stripAuthorizationJoin(row: Record<string, any>) {
  const { memory_item_lifecycle, ...record } = row;
  return record;
}

function clean(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
