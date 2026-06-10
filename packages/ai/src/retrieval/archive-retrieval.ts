import type { SupabaseClient } from "@supabase/supabase-js";
import type {
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

type ValidatedArchiveChunk = RankedArchiveChunk & {
  citation: ArchiveRetrievalCitation;
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

  if (hasValue(input.embeddingApiKey) && query.length > 0) {
    const vectorCandidates = await vectorArchiveSearch({
      ...input,
      query,
      limit: maxChunks * 3,
      embeddingApiKey: input.embeddingApiKey!,
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
  };
}

async function vectorArchiveSearch(input: {
  supabase: SupabaseClient;
  ownerUserId: string;
  personaId: string;
  query: string;
  limit: number;
  embeddingApiKey: string;
}): Promise<RankedArchiveChunk[]> {
  try {
    const embedding = await generateEmbedding(input.query, input.embeddingApiKey, { useCase: "query" });
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
    .limit(input.limit);

  const tokens = tokenize(input.query);
  return ((data ?? []) as ArchiveChunkRow[])
    .filter(hasAuthoritativeArchiveSource)
    .map((row) => ({
      ...row,
      score: keywordScore(row, tokens),
    }))
    .filter((row) => tokens.length === 0 || row.score > 0)
    .sort((a, b) => b.score - a.score || b.relevance_weight - a.relevance_weight || compareCreatedAt(b, a))
    .slice(0, input.limit);
}

async function validateArchiveSources(input: {
  supabase: SupabaseClient;
  ownerUserId: string;
  personaId: string;
  rows: RankedArchiveChunk[];
}): Promise<{ valid: ValidatedArchiveChunk[]; skipped: number }> {
  const valid: ValidatedArchiveChunk[] = [];
  let skipped = 0;

  for (const row of input.rows) {
    const citation = await loadCitationForRow(input.supabase, row, input.ownerUserId, input.personaId);
    if (!citation) {
      skipped += 1;
      continue;
    }
    valid.push({ ...row, citation });
  }

  return { valid, skipped };
}

async function loadCitationForRow(
  supabase: SupabaseClient,
  row: ArchiveChunkRow,
  ownerUserId: string,
  personaId: string
): Promise<ArchiveRetrievalCitation | null> {
  if (!hasAuthoritativeArchiveSource(row)) return null;
  const sourceType = row.archive_source_type;
  const sourceId = row.archive_source_id;

  if (sourceType === "import_job") {
    const { data, error } = await supabase
      .from("import_jobs")
      .select("id, status, source_name, created_at, updated_at")
      .eq("id", sourceId)
      .eq("owner_user_id", ownerUserId)
      .eq("persona_id", personaId)
      .single();
    if (error || !data || data.status !== "completed") return null;
    return citation(row, {
      sourceType,
      sourceId,
      title: data.source_name ?? row.archive_source_name,
      createdAt: data.updated_at ?? data.created_at,
      reason: "Matched a completed private archive import chunk.",
    });
  }

  if (sourceType === "persona_file") {
    const { data, error } = await supabase
      .from("persona_files")
      .select("id, file_name, processed, created_at")
      .eq("id", sourceId)
      .eq("owner_user_id", ownerUserId)
      .eq("persona_id", personaId)
      .single();
    if (error || !data || data.processed !== true) return null;
    return citation(row, {
      sourceType,
      sourceId,
      title: data.file_name ?? row.archive_source_name,
      createdAt: data.created_at,
      reason: "Matched a processed private archive file chunk.",
    });
  }

  if (sourceType === "archived_chat_transcript") {
    const { data, error } = await supabase
      .from("archived_chat_transcripts")
      .select("id, title, created_at, updated_at")
      .eq("id", sourceId)
      .eq("owner_user_id", ownerUserId)
      .eq("persona_id", personaId)
      .single();
    if (error || !data) return null;
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
  if (tokens.length === 0) return row.relevance_weight;
  const haystack = `${row.archive_source_name ?? ""} ${row.title ?? ""} ${row.summary ?? ""} ${row.content}`.toLowerCase();
  const matches = tokens.filter((token) => haystack.includes(token)).length;
  return matches / tokens.length + row.relevance_weight / 100;
}

function tokenize(query: string) {
  return query.toLowerCase().split(/\s+/).map((token) => token.trim()).filter(Boolean);
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

function compareCreatedAt(a: ArchiveChunkRow, b: ArchiveChunkRow) {
  return (a.created_at ?? "").localeCompare(b.created_at ?? "");
}
