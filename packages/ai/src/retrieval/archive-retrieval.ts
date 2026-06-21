import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ArchiveRetrievalSkipReason,
  ArchiveRetrievalCitation,
  ArchiveRetrievalResult,
  ArchiveSourceType,
} from "@station/types";
import { activeEmbeddingRpcArgs, generateEmbedding } from "./embeddings";

const ARCHIVE_SOURCE_TYPES: ArchiveSourceType[] = [
  "import_job",
  "persona_file",
  "archived_chat_transcript",
];

const DEFAULT_SOURCE_CAPS: Record<ArchiveSourceType, number> = {
  import_job: 2,
  persona_file: 2,
  archived_chat_transcript: 2,
};

const DEFAULT_MAX_CHUNKS = 5;
const HARD_MAX_CHUNKS = 8;
const DEFAULT_MAX_CHARACTERS = 2400;
const HARD_MAX_CHARACTERS = 4000;
const MAX_CHUNK_CHARACTERS = 700;
const MIN_FINAL_EXCERPT_CHARACTERS = 80;
const KEYWORD_CANDIDATE_POOL = 200;

type ArchiveChunkRow = {
  id: string;
  persona_id: string;
  owner_user_id: string;
  title: string | null;
  content: string;
  summary: string | null;
  source_type: string;
  relevance_weight: number;
  archive_source_type: string | null;
  archive_source_id: string | null;
  archive_source_name: string | null;
  chunk_index: number | null;
  chunk_count: number | null;
  created_at: string | null;
  similarity?: number | null;
};

type RankedArchiveChunk = ArchiveChunkRow & {
  score: number;
};

type AuthoritativeRankedArchiveChunk = RankedArchiveChunk & {
  archive_source_type: ArchiveSourceType;
  archive_source_id: string;
};

type ValidatedArchiveChunk = RankedArchiveChunk & {
  citation: ArchiveRetrievalCitation;
};

type ArchiveLifecycleRow = {
  memory_item_id?: string | null;
  status?: string | null;
  expires_at?: string | null;
  superseded_by_memory_item_id?: string | null;
};

type ImportJobCitationRow = {
  id: string;
  status: string | null;
  source_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PersonaFileCitationRow = {
  id: string;
  file_name: string | null;
  processed: boolean | null;
  created_at: string | null;
};

type ArchivedChatTranscriptCitationRow = {
  id: string;
  title: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ArchiveCitationLookup = {
  import_job: Map<string, ImportJobCitationRow>;
  persona_file: Map<string, PersonaFileCitationRow>;
  archived_chat_transcript: Map<string, ArchivedChatTranscriptCitationRow>;
};

export async function retrievePrivateArchive(input: {
  supabase: SupabaseClient;
  ownerUserId: string;
  personaId: string;
  query: string;
  limit?: number;
  maxCharacters?: number;
  sourceCaps?: Partial<Record<ArchiveSourceType, number>>;
  embeddingApiKey?: string | null;
  queryEmbedding?: number[] | null;
  includeQuarantined?: boolean;
}): Promise<ArchiveRetrievalResult> {
  const maxChunks = clampInt(input.limit ?? DEFAULT_MAX_CHUNKS, 1, HARD_MAX_CHUNKS);
  const maxCharacters = clampInt(
    input.maxCharacters ?? DEFAULT_MAX_CHARACTERS,
    MIN_FINAL_EXCERPT_CHARACTERS,
    HARD_MAX_CHARACTERS
  );
  const sourceCaps = normalizeSourceCaps(input.sourceCaps);
  const query = input.query.trim();

  let mode: ArchiveRetrievalResult["mode"] = "keyword";
  let candidates: RankedArchiveChunk[] = [];
  const hasPrecomputedEmbedding = hasOwn(input, "queryEmbedding");

  if ((hasValue(input.embeddingApiKey) || hasPrecomputedEmbedding) && query.length > 0) {
    const vectorCandidates = await vectorArchiveSearch({
      ...input,
      query,
      limit: maxChunks * 3,
      embeddingApiKey: input.embeddingApiKey,
    });
    if (vectorCandidates.length > 0) {
      mode = "vector";
      candidates = vectorCandidates;
    }
  }

  if (candidates.length === 0) {
    mode = "keyword";
    candidates = await keywordArchiveSearch({
      supabase: input.supabase,
      ownerUserId: input.ownerUserId,
      personaId: input.personaId,
      query,
      limit: maxChunks * 6,
    });
  }

  const validated = await validateArchiveSources({
    supabase: input.supabase,
    ownerUserId: input.ownerUserId,
    personaId: input.personaId,
    rows: candidates,
    includeQuarantined: input.includeQuarantined ?? true,
  });

  const chunks = applyRetrievalLimits({
    rows: validated.valid,
    maxChunks,
    maxCharacters,
    sourceCaps,
  });

  return {
    mode,
    chunks,
    counts: {
      searched: candidates.length,
      returned: chunks.length,
      skippedUnauthoritative: validated.skipped,
    },
    limits: {
      maxChunks,
      maxCharacters,
      sourceCaps,
    },
    trace: {
      selected: chunks.map((chunk) => ({
        id: chunk.id,
        title: chunk.citation.title,
        sourceType: chunk.citation.sourceType,
        reason: chunk.citation.reason,
        score: chunk.score,
      })),
      skipped: validated.skippedReasons,
    },
  };
}

async function vectorArchiveSearch(input: {
  supabase: SupabaseClient;
  ownerUserId: string;
  personaId: string;
  query: string;
  limit: number;
  embeddingApiKey?: string | null;
  queryEmbedding?: number[] | null;
}): Promise<RankedArchiveChunk[]> {
  try {
    const hasPrecomputedEmbedding = hasOwn(input, "queryEmbedding");
    const embedding = hasPrecomputedEmbedding
      ? input.queryEmbedding
      : await generateEmbedding(input.query, input.embeddingApiKey!, { useCase: "query" });
    if (!embedding) return [];
    const { data, error } = await input.supabase.rpc("match_private_archive_chunks", {
      p_persona_id: input.personaId,
      p_owner_user_id: input.ownerUserId,
      query_embedding: embedding,
      match_count: input.limit,
      ...activeEmbeddingRpcArgs(),
    });

    if (error) throw error;
    return (data ?? [])
      .map((row: ArchiveChunkRow) => ({
        ...row,
        score: typeof row.similarity === "number" ? row.similarity : 0,
      }))
      .filter(hasAuthoritativeArchiveSource);
  } catch {
    return [];
  }
}

async function keywordArchiveSearch(input: {
  supabase: SupabaseClient;
  ownerUserId: string;
  personaId: string;
  query: string;
  limit: number;
}): Promise<RankedArchiveChunk[]> {
  const { data } = await input.supabase
    .from("memory_items")
    .select("id, persona_id, owner_user_id, title, content, summary, source_type, relevance_weight, archive_source_type, archive_source_id, archive_source_name, chunk_index, chunk_count, created_at")
    .eq("persona_id", input.personaId)
    .eq("owner_user_id", input.ownerUserId)
    .order("relevance_weight", { ascending: false })
    .limit(Math.max(input.limit, KEYWORD_CANDIDATE_POOL));

  const tokens = tokenize(input.query);
  return ((data ?? []) as ArchiveChunkRow[])
    .filter(hasAuthoritativeArchiveSource)
    .map((row) => ({
      ...row,
      score: keywordScore(row, tokens),
    }))
    .filter((row) => tokens.length === 0 || row.score > 0)
    .sort((a, b) =>
      b.score - a.score
      || boundedRelevanceWeight(b) - boundedRelevanceWeight(a)
      || compareCreatedAt(b, a)
      || compareChunkIndex(a, b)
      || a.id.localeCompare(b.id)
    )
    .slice(0, input.limit);
}

async function validateArchiveSources(input: {
  supabase: SupabaseClient;
  ownerUserId: string;
  personaId: string;
  rows: RankedArchiveChunk[];
  includeQuarantined: boolean;
}): Promise<{
  valid: ValidatedArchiveChunk[];
  skipped: number;
  skippedReasons: Record<ArchiveRetrievalSkipReason, number>;
}> {
  const valid: ValidatedArchiveChunk[] = [];
  const skippedReasons = emptyArchiveSkippedCounts();
  const authoritativeRows: AuthoritativeRankedArchiveChunk[] = [];
  for (const row of input.rows) {
    if (hasAuthoritativeArchiveSource(row)) {
      authoritativeRows.push(row);
      continue;
    }
    skippedReasons.unauthoritative += 1;
  }
  const lifecycleByMemoryId = input.includeQuarantined
    ? new Map<string, ArchiveLifecycleRow>()
    : await loadArchiveLifecycleMap(input.supabase, authoritativeRows, input.ownerUserId, input.personaId);
  const citationLookup = await loadArchiveCitationLookup(
    input.supabase,
    authoritativeRows,
    input.ownerUserId,
    input.personaId
  );

  for (const row of authoritativeRows) {
    const lifecycleReason = !input.includeQuarantined
      ? runtimeArchiveExclusionReason(row, lifecycleByMemoryId.get(row.id) ?? null)
      : null;
    if (lifecycleReason) {
      skippedReasons[lifecycleReason] += 1;
      continue;
    }

    const citation = citationFromLookup(row, citationLookup);
    if (!citation) {
      skippedReasons.source_not_ready += 1;
      continue;
    }
    valid.push({ ...row, citation });
  }

  const skipped = Object.values(skippedReasons).reduce((total, count) => total + count, 0);
  return { valid, skipped, skippedReasons };
}

async function loadArchiveLifecycleMap(
  supabase: SupabaseClient,
  rows: AuthoritativeRankedArchiveChunk[],
  ownerUserId: string,
  personaId: string
): Promise<Map<string, ArchiveLifecycleRow>> {
  const memoryIds = unique(rows.map((row) => row.id));
  if (memoryIds.length === 0) return new Map();

  const { data, error } = await (supabase as any)
    .from("memory_item_lifecycle")
    .select("memory_item_id, status, expires_at, superseded_by_memory_item_id")
    .eq("owner_user_id", ownerUserId)
    .eq("persona_id", personaId)
    .in("memory_item_id", memoryIds);

  if (error) return new Map();
  return new Map(
    ((data ?? []) as ArchiveLifecycleRow[])
      .filter((row) => typeof row.memory_item_id === "string")
      .map((row) => [row.memory_item_id!, row])
  );
}

function runtimeArchiveExclusionReason(
  row: ArchiveChunkRow,
  lifecycle: ArchiveLifecycleRow | null
): ArchiveRetrievalSkipReason | null {
  const reason = classifyArchiveLifecycleSkip(lifecycle);
  if (reason) return reason;
  if (row.source_type === "import" && lifecycle?.status !== "active") return "missing_lifecycle";
  return null;
}

async function loadArchiveCitationLookup(
  supabase: SupabaseClient,
  rows: AuthoritativeRankedArchiveChunk[],
  ownerUserId: string,
  personaId: string
): Promise<ArchiveCitationLookup> {
  const idsByType = {
    import_job: unique(rows.filter((row) => row.archive_source_type === "import_job").map((row) => row.archive_source_id)),
    persona_file: unique(rows.filter((row) => row.archive_source_type === "persona_file").map((row) => row.archive_source_id)),
    archived_chat_transcript: unique(rows.filter((row) => row.archive_source_type === "archived_chat_transcript").map((row) => row.archive_source_id)),
  };

  const [importJobs, personaFiles, archivedChatTranscripts] = await Promise.all([
    loadImportJobCitations(supabase, ownerUserId, personaId, idsByType.import_job),
    loadPersonaFileCitations(supabase, ownerUserId, personaId, idsByType.persona_file),
    loadArchivedChatTranscriptCitations(supabase, ownerUserId, personaId, idsByType.archived_chat_transcript),
  ]);

  return {
    import_job: importJobs,
    persona_file: personaFiles,
    archived_chat_transcript: archivedChatTranscripts,
  };
}

async function loadImportJobCitations(
  supabase: SupabaseClient,
  ownerUserId: string,
  personaId: string,
  ids: string[]
): Promise<Map<string, ImportJobCitationRow>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase
    .from("import_jobs")
    .select("id, status, source_name, created_at, updated_at")
    .eq("owner_user_id", ownerUserId)
    .eq("persona_id", personaId)
    .in("id", ids);
  if (error) return new Map();
  return new Map(((data ?? []) as ImportJobCitationRow[]).map((row) => [row.id, row]));
}

async function loadPersonaFileCitations(
  supabase: SupabaseClient,
  ownerUserId: string,
  personaId: string,
  ids: string[]
): Promise<Map<string, PersonaFileCitationRow>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase
    .from("persona_files")
    .select("id, file_name, processed, created_at")
    .eq("owner_user_id", ownerUserId)
    .eq("persona_id", personaId)
    .in("id", ids);
  if (error) return new Map();
  return new Map(((data ?? []) as PersonaFileCitationRow[]).map((row) => [row.id, row]));
}

async function loadArchivedChatTranscriptCitations(
  supabase: SupabaseClient,
  ownerUserId: string,
  personaId: string,
  ids: string[]
): Promise<Map<string, ArchivedChatTranscriptCitationRow>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase
    .from("archived_chat_transcripts")
    .select("id, title, created_at, updated_at")
    .eq("owner_user_id", ownerUserId)
    .eq("persona_id", personaId)
    .in("id", ids);
  if (error) return new Map();
  return new Map(((data ?? []) as ArchivedChatTranscriptCitationRow[]).map((row) => [row.id, row]));
}

function citationFromLookup(
  row: AuthoritativeRankedArchiveChunk,
  lookup: ArchiveCitationLookup
): ArchiveRetrievalCitation | null {
  const sourceType = row.archive_source_type;
  const sourceId = row.archive_source_id;

  if (sourceType === "import_job") {
    const data = lookup.import_job.get(sourceId);
    if (!data || data.status !== "completed") return null;
    return citation(row, {
      sourceType,
      sourceId,
      title: data.source_name ?? row.archive_source_name,
      createdAt: data.updated_at ?? data.created_at,
      reason: "Matched a completed private archive import chunk.",
    });
  }

  if (sourceType === "persona_file") {
    const data = lookup.persona_file.get(sourceId);
    if (!data || data.processed !== true) return null;
    return citation(row, {
      sourceType,
      sourceId,
      title: data.file_name ?? row.archive_source_name,
      createdAt: data.created_at,
      reason: "Matched a processed private archive file chunk.",
    });
  }

  if (sourceType === "archived_chat_transcript") {
    const data = lookup.archived_chat_transcript.get(sourceId);
    if (!data) return null;
    return citation(row, {
      sourceType,
      sourceId,
      title: data.title ?? row.archive_source_name,
      createdAt: data.updated_at ?? data.created_at,
      reason: "Matched an archived private conversation transcript chunk.",
    });
  }

  return null;
}

function unique(values: string[]) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function applyRetrievalLimits(input: {
  rows: ValidatedArchiveChunk[];
  maxChunks: number;
  maxCharacters: number;
  sourceCaps: Record<ArchiveSourceType, number>;
}): ArchiveRetrievalResult["chunks"] {
  const chunks: ArchiveRetrievalResult["chunks"] = [];
  const sourceCounts: Record<ArchiveSourceType, number> = {
    import_job: 0,
    persona_file: 0,
    archived_chat_transcript: 0,
  };
  let usedCharacters = 0;

  for (const row of input.rows) {
    if (chunks.length >= input.maxChunks) break;
    const sourceType = row.citation.sourceType;
    if (sourceCounts[sourceType] >= input.sourceCaps[sourceType]) continue;

    const remainingCharacters = input.maxCharacters - usedCharacters;
    if (remainingCharacters < MIN_FINAL_EXCERPT_CHARACTERS) break;

    const excerpt = trimExcerpt(row.content, Math.min(MAX_CHUNK_CHARACTERS, remainingCharacters));
    if (!excerpt) continue;

    chunks.push({
      id: row.id,
      personaId: row.persona_id,
      excerpt,
      score: row.score,
      citation: row.citation,
      createdAt: row.created_at,
    });
    sourceCounts[sourceType] += 1;
    usedCharacters += excerpt.length;
  }

  return chunks;
}

function citation(
  row: ArchiveChunkRow,
  input: {
    sourceType: ArchiveSourceType;
    sourceId: string;
    title: string | null;
    reason: string;
    createdAt?: string | null;
  }
): ArchiveRetrievalCitation {
  return {
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    title: input.title,
    reason: input.reason,
    createdAt: input.createdAt ?? row.created_at,
    chunkIndex: row.chunk_index,
    chunkCount: row.chunk_count,
  };
}

function hasAuthoritativeArchiveSource(row: ArchiveChunkRow): row is ArchiveChunkRow & {
  archive_source_type: ArchiveSourceType;
  archive_source_id: string;
} {
  return Boolean(
    row.archive_source_id
    && row.archive_source_type
    && ARCHIVE_SOURCE_TYPES.includes(row.archive_source_type as ArchiveSourceType)
  );
}

function keywordScore(row: ArchiveChunkRow, tokens: string[]) {
  if (tokens.length === 0) return boundedRelevanceWeight(row);

  const sourceName = normalizeText(row.archive_source_name ?? "");
  const title = normalizeText(row.title ?? "");
  const summary = normalizeText(row.summary ?? "");
  const content = normalizeText(row.content);
  const phrase = tokens.join(" ");
  let lexicalScore = 0;

  for (const token of tokens) {
    if (title.includes(token) || sourceName.includes(token)) lexicalScore += 4;
    else if (summary.includes(token)) lexicalScore += 2;
    else if (content.includes(token)) lexicalScore += 1;
  }

  const combinedSource = `${sourceName} ${title}`.trim();
  const combinedEvidence = `${summary} ${content}`.trim();
  if (phrase && combinedSource.includes(phrase)) lexicalScore += 6;
  else if (phrase && combinedEvidence.includes(phrase)) lexicalScore += 3;

  if (lexicalScore === 0) return 0;
  return lexicalScore / tokens.length + boundedRelevanceWeight(row) / 100;
}

function tokenize(query: string) {
  return [...new Set(
    normalizeText(query)
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 1 && !STOPWORDS.has(token))
  )];
}

function trimExcerpt(value: string, maxCharacters: number) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxCharacters) return compact;
  return `${compact.slice(0, Math.max(0, maxCharacters - 3)).trim()}...`;
}

function normalizeSourceCaps(input?: Partial<Record<ArchiveSourceType, number>>) {
  const caps = { ...DEFAULT_SOURCE_CAPS };
  for (const sourceType of ARCHIVE_SOURCE_TYPES) {
    const value = input?.[sourceType];
    if (typeof value === "number" && Number.isFinite(value)) {
      caps[sourceType] = clampInt(value, 0, HARD_MAX_CHUNKS);
    }
  }
  return caps;
}

function clampInt(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function hasValue(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasOwn(value: object, property: string) {
  return Object.prototype.hasOwnProperty.call(value, property);
}

function compareCreatedAt(a: ArchiveChunkRow, b: ArchiveChunkRow) {
  return (a.created_at ?? "").localeCompare(b.created_at ?? "");
}

function compareChunkIndex(a: ArchiveChunkRow, b: ArchiveChunkRow) {
  return (a.chunk_index ?? Number.MAX_SAFE_INTEGER) - (b.chunk_index ?? Number.MAX_SAFE_INTEGER);
}

function boundedRelevanceWeight(row: Pick<ArchiveChunkRow, "relevance_weight">) {
  const value = Number(row.relevance_weight ?? 0);
  if (!Number.isFinite(value)) return 0;
  return Math.min(10, Math.max(0, value));
}

function classifyArchiveLifecycleSkip(lifecycle: ArchiveLifecycleRow | null | undefined): ArchiveRetrievalSkipReason | null {
  if (!lifecycle) return null;
  if (lifecycle.superseded_by_memory_item_id || lifecycle.status === "superseded") return "superseded";
  if (lifecycle.status === "rejected") return "rejected";
  if (lifecycle.status === "quarantined") return "quarantined";

  if (lifecycle.expires_at) {
    const expiresAt = Date.parse(lifecycle.expires_at);
    if (!Number.isNaN(expiresAt) && expiresAt <= Date.now()) return "expired";
  }

  return null;
}

function emptyArchiveSkippedCounts(): Record<ArchiveRetrievalSkipReason, number> {
  return {
    unauthoritative: 0,
    source_not_ready: 0,
    missing_lifecycle: 0,
    rejected: 0,
    quarantined: 0,
    expired: 0,
    superseded: 0,
  };
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu, " ").replace(/\s+/g, " ").trim();
}

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "for",
  "from",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);
