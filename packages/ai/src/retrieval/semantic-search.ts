import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVE_EMBEDDING_DIMENSION,
  ACTIVE_EMBEDDING_INDEX_NAME,
  ACTIVE_EMBEDDING_MODEL,
  ACTIVE_EMBEDDING_PROFILE_CODE,
  ACTIVE_EMBEDDING_PROVIDER,
  activeEmbeddingRpcArgs,
  generateEmbedding,
} from "./embeddings";

export interface MemorySearchResult {
  id: string;
  personaId: string;
  title: string | null;
  content: string;
  summary: string | null;
  sourceType: string;
  relevanceWeight: number;
  similarity: number;
  lifecycleStatus?: string | null;
}

export type MemoryRetrievalMode = "vector" | "keyword";
export type MemoryRetrievalFallback = "none" | "no_embedding_key" | "empty_query_embedding" | "vector_error";
export type MemorySkipReason = "archive_source" | "rejected" | "quarantined" | "expired" | "superseded" | "other_owner_or_missing";

export interface MemoryRetrievalTrace {
  mode: MemoryRetrievalMode;
  fallbackMode: MemoryRetrievalFallback;
  searched: number;
  selected: Array<{
    id: string;
    title: string | null;
    reason: string;
    score: number;
    sourceType: string;
  }>;
  skipped: Record<MemorySkipReason, number>;
  embedding: {
    profileCode: string;
    provider: string;
    model: string;
    dimension: number;
    indexName: string;
  };
}

export interface MemorySearchWithTrace {
  results: MemorySearchResult[];
  trace: MemoryRetrievalTrace;
}

export interface CanonResult {
  id: string;
  personaId: string;
  title: string | null;
  content: string;
  priority: number;
}

const KEYWORD_MEMORY_CANDIDATE_POOL = 200;

/**
 * Semantic search over a persona's memory_items using pgvector cosine similarity.
 * Falls back to keyword-ranked search when no embedding API key is available.
 */
export async function searchMemory(options: {
  supabase: SupabaseClient;
  personaId: string;
  query: string;
  limit?: number;
  embeddingApiKey?: string;
  queryEmbedding?: number[] | null;
  ownerUserId?: string;
}): Promise<MemorySearchResult[]> {
  const { results } = await searchMemoryWithTrace(options);
  return results;
}

export async function searchMemoryWithTrace(options: {
  supabase: SupabaseClient;
  personaId: string;
  query: string;
  limit?: number;
  embeddingApiKey?: string;
  queryEmbedding?: number[] | null;
  ownerUserId?: string;
}): Promise<MemorySearchWithTrace> {
  const { supabase, personaId, query, limit = 6, embeddingApiKey, ownerUserId } = options;
  const hasPrecomputedEmbedding = hasOwn(options, "queryEmbedding");

  if (!hasValue(embeddingApiKey) && !hasPrecomputedEmbedding) {
    return keywordFallbackSearch(supabase, personaId, query, limit, ownerUserId, "no_embedding_key");
  }

  try {
    const embedding = hasPrecomputedEmbedding
      ? options.queryEmbedding
      : await generateEmbedding(query, embeddingApiKey, { useCase: "query" });
    if (!embedding) return keywordFallbackSearch(supabase, personaId, query, limit, ownerUserId, "empty_query_embedding");

    // pgvector RPC - defined below in 003_rag_functions.sql
    const { data, error } = await supabase.rpc("match_memory_items", {
      p_persona_id: personaId,
      query_embedding: embedding,
      match_count: limit,
      ...activeEmbeddingRpcArgs(),
    });

    if (error) throw error;

    const rows = (data ?? []).map(
      (row: {
        id: string;
        persona_id: string;
        title: string | null;
        content: string;
        summary: string | null;
        source_type: string;
        relevance_weight: number;
        similarity: number;
      }) => ({
        id: row.id,
        personaId: row.persona_id,
        title: row.title,
        content: row.content,
        summary: row.summary,
        sourceType: row.source_type,
        relevanceWeight: row.relevance_weight,
        similarity: row.similarity,
      })
    );

    const filtered = await filterInjectableMemoryResults({
      supabase,
      personaId,
      ownerUserId,
      rows,
    });

    const supplementalResults = await keywordSupplementalSearch({
      supabase,
      personaId,
      query,
      limit,
      ownerUserId,
      excludeIds: new Set(filtered.results.map((row) => row.id)),
    });
    const supplementedResults = blendMemorySelections(filtered.results, supplementalResults, limit);

    return {
      results: supplementedResults,
      trace: buildMemoryTrace({
        mode: "vector",
        fallbackMode: "none",
        searched: rows.length,
        selected: supplementedResults,
        skipped: filtered.skipped,
      }),
    };
  } catch {
    return keywordFallbackSearch(supabase, personaId, query, limit, ownerUserId, "vector_error");
  }
}

/**
 * Loads canon items for a persona, ordered by priority descending.
 */
export async function loadCanon(
  supabase: SupabaseClient,
  personaId: string,
  limit = 5,
  ownerUserId?: string
): Promise<CanonResult[]> {
  const query = supabase
    .from("canon_items")
    .select("id, persona_id, title, content, priority")
    .eq("persona_id", personaId)
    .order("priority", { ascending: false })
    .limit(limit);

  if (ownerUserId) query.eq("owner_user_id", ownerUserId);

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    personaId: row.persona_id,
    title: row.title,
    content: row.content,
    priority: row.priority,
  }));
}

/** Keyword fallback when pgvector / embedding is unavailable */
async function keywordFallbackSearch(
  supabase: SupabaseClient,
  personaId: string,
  query: string,
  limit: number,
  ownerUserId?: string,
  fallbackMode: MemoryRetrievalFallback = "none"
): Promise<MemorySearchWithTrace> {
  const memoryQuery = supabase
    .from("memory_items")
    .select("id, persona_id, title, content, summary, source_type, relevance_weight, archive_source_type")
    .eq("persona_id", personaId)
    .order("relevance_weight", { ascending: false })
    .limit(Math.max(limit * 3, KEYWORD_MEMORY_CANDIDATE_POOL));

  if (ownerUserId) memoryQuery.eq("owner_user_id", ownerUserId);

  const { data } = await memoryQuery;

  if (!data) {
    return {
      results: [],
      trace: buildMemoryTrace({
        mode: "keyword",
        fallbackMode,
        searched: 0,
        selected: [],
        skipped: emptySkippedCounts(),
      }),
    };
  }
  const lifecycleByMemoryId = await loadMemoryLifecycleMap(supabase, personaId, ownerUserId);

  const tokens = tokenize(query);

  const skipped = emptySkippedCounts();
  const results = data
    .filter((row) => {
      const reason = classifyMemorySkip(row, lifecycleByMemoryId.get(row.id));
      if (reason) skipped[reason] += 1;
      return !reason;
    })
    .map((row) => {
      const score = keywordMemoryScore(row, tokens, query);
      return {
        id: row.id,
        personaId: row.persona_id,
        title: row.title,
        content: row.content,
        summary: row.summary,
        sourceType: row.source_type,
        relevanceWeight: row.relevance_weight,
        similarity: score / Math.max(tokens.length, 1),
        lifecycleStatus: lifecycleByMemoryId.get(row.id)?.status ?? "active",
      };
    })
    .sort((a, b) => b.similarity - a.similarity || b.relevanceWeight - a.relevanceWeight)
    .slice(0, limit);

  return {
    results,
    trace: buildMemoryTrace({
      mode: "keyword",
      fallbackMode,
      searched: data.length,
      selected: results,
      skipped,
    }),
  };
}

async function keywordSupplementalSearch(input: {
  supabase: SupabaseClient;
  personaId: string;
  query: string;
  limit: number;
  ownerUserId?: string;
  excludeIds: Set<string>;
}): Promise<MemorySearchResult[]> {
  if (input.limit <= 0 || !input.ownerUserId) return [];

  const memoryQuery = input.supabase
    .from("memory_items")
    .select("id, persona_id, title, content, summary, source_type, relevance_weight, archive_source_type")
    .eq("persona_id", input.personaId)
    .order("relevance_weight", { ascending: false })
    .limit(KEYWORD_MEMORY_CANDIDATE_POOL);

  if (input.ownerUserId) memoryQuery.eq("owner_user_id", input.ownerUserId);

  const { data } = await memoryQuery;
  if (!data) return [];

  const lifecycleByMemoryId = await loadMemoryLifecycleMap(input.supabase, input.personaId, input.ownerUserId);
  const tokens = tokenize(input.query);

  return data
    .filter((row) => {
      if (input.excludeIds.has(row.id)) return false;
      if (classifyMemorySkip(row, lifecycleByMemoryId.get(row.id))) return false;
      return keywordMemoryLexicalScore(row, tokens, input.query) > 0;
    })
    .map((row) => {
      const lexicalScore = keywordMemoryLexicalScore(row, tokens, input.query);
      return {
        id: row.id,
        personaId: row.persona_id,
        title: row.title,
        content: row.content,
        summary: row.summary,
        sourceType: row.source_type,
        relevanceWeight: row.relevance_weight,
        similarity: lexicalScore / Math.max(tokens.length, 1) + Number(row.relevance_weight ?? 0) / 1000,
        lifecycleStatus: lifecycleByMemoryId.get(row.id)?.status ?? "active",
      };
    })
    .sort((a, b) => b.similarity - a.similarity || b.relevanceWeight - a.relevanceWeight)
    .slice(0, input.limit);
}

function blendMemorySelections(
  vectorResults: MemorySearchResult[],
  supplementalResults: MemorySearchResult[],
  limit: number
) {
  if (limit <= 0) return [];
  if (supplementalResults.length === 0) return vectorResults.slice(0, limit);

  return [...vectorResults, ...supplementalResults]
    .sort((a, b) => b.similarity - a.similarity || b.relevanceWeight - a.relevanceWeight)
    .slice(0, limit);
}

async function loadMemoryLifecycleMap(
  supabase: SupabaseClient,
  personaId: string,
  ownerUserId?: string
): Promise<Map<string, { status?: string | null; expires_at?: string | null; superseded_by_memory_item_id?: string | null }>> {
  const lifecycleQuery = supabase
    .from("memory_item_lifecycle")
    .select("memory_item_id, status, expires_at, superseded_by_memory_item_id")
    .eq("persona_id", personaId);

  if (ownerUserId) lifecycleQuery.eq("owner_user_id", ownerUserId);

  const { data, error } = await lifecycleQuery;
  if (error) return new Map();

  return new Map((data ?? []).map((row) => [row.memory_item_id, row]));
}

async function filterInjectableMemoryResults(input: {
  supabase: SupabaseClient;
  personaId: string;
  ownerUserId?: string;
  rows: MemorySearchResult[];
}): Promise<{ results: MemorySearchResult[]; skipped: Record<MemorySkipReason, number> }> {
  if (!input.ownerUserId || input.rows.length === 0) {
    return { results: input.rows, skipped: emptySkippedCounts() };
  }

  const ids = input.rows.map((row) => row.id);
  const { data, error } = await input.supabase
    .from("memory_items")
    .select("id, archive_source_type")
    .eq("persona_id", input.personaId)
    .eq("owner_user_id", input.ownerUserId)
    .in("id", ids);

  if (error || !data) throw error ?? new Error("Could not validate memory search results.");

  const lifecycleByMemoryId = await loadMemoryLifecycleMap(input.supabase, input.personaId, input.ownerUserId);
  const validationRowsById = new Map(data.map((row) => [row.id, row]));
  const skipped = emptySkippedCounts();
  const injectableIds = new Set<string>();

  for (const row of input.rows) {
    const validationRow = validationRowsById.get(row.id);
    if (!validationRow) {
      skipped.other_owner_or_missing += 1;
      continue;
    }

    const reason = classifyMemorySkip(validationRow, lifecycleByMemoryId.get(row.id));
    if (reason) {
      skipped[reason] += 1;
      continue;
    }

    injectableIds.add(row.id);
  }

  return {
    results: input.rows.filter((row) => injectableIds.has(row.id)),
    skipped,
  };
}

function classifyMemorySkip(
  row: { archive_source_type?: string | null },
  lifecycle?: { status?: string | null; expires_at?: string | null; superseded_by_memory_item_id?: string | null }
) {
  if (row.archive_source_type != null) return "archive_source";
  if (!lifecycle) return null;
  if (lifecycle.superseded_by_memory_item_id || lifecycle.status === "superseded") return "superseded";
  if (lifecycle.status === "rejected") return "rejected";
  if (lifecycle.status === "quarantined") return "quarantined";

  if (lifecycle.expires_at) {
    const expiresAt = Date.parse(lifecycle.expires_at);
    if (!Number.isNaN(expiresAt) && expiresAt <= Date.now()) return "expired";
  }

  if ((lifecycle.status ?? "active") !== "active") return "rejected";
  return null;
}

function emptySkippedCounts(): Record<MemorySkipReason, number> {
  return {
    archive_source: 0,
    rejected: 0,
    quarantined: 0,
    expired: 0,
    superseded: 0,
    other_owner_or_missing: 0,
  };
}

function buildMemoryTrace(input: {
  mode: MemoryRetrievalMode;
  fallbackMode: MemoryRetrievalFallback;
  searched: number;
  selected: MemorySearchResult[];
  skipped: Record<MemorySkipReason, number>;
}): MemoryRetrievalTrace {
  return {
    mode: input.mode,
    fallbackMode: input.fallbackMode,
    searched: input.searched,
    selected: input.selected.map((row) => ({
      id: row.id,
      title: row.title,
      reason: row.similarity > 0
        ? `Selected by query match (${row.similarity.toFixed(2)}) and relevance weight.`
        : "Selected by relevance weight fallback.",
      score: row.similarity,
      sourceType: row.sourceType,
    })),
    skipped: input.skipped,
    embedding: {
      profileCode: ACTIVE_EMBEDDING_PROFILE_CODE,
      provider: ACTIVE_EMBEDDING_PROVIDER,
      model: ACTIVE_EMBEDDING_MODEL,
      dimension: ACTIVE_EMBEDDING_DIMENSION,
      indexName: ACTIVE_EMBEDDING_INDEX_NAME,
    },
  };
}

function keywordMemoryScore(
  row: { title?: string | null; content: string; summary?: string | null; relevance_weight?: number | null },
  tokens: string[],
  query: string
) {
  if (tokens.length === 0) return Number(row.relevance_weight ?? 0) / 100;

  return keywordMemoryLexicalScore(row, tokens, query) / tokens.length + Number(row.relevance_weight ?? 0) / 1000;
}

function keywordMemoryLexicalScore(
  row: { title?: string | null; content: string; summary?: string | null },
  tokens: string[],
  query: string
) {
  if (tokens.length === 0) return 0;

  const title = normalizeText(row.title ?? "");
  const summary = normalizeText(row.summary ?? "");
  const content = normalizeText(row.content);
  const phrase = normalizeText(query);
  const haystack = `${title} ${summary} ${content}`.trim();
  let score = 0;

  for (const token of tokens) {
    if (title.includes(token)) score += 3;
    else if (summary.includes(token)) score += 2;
    else if (content.includes(token)) score += 1;
  }

  if (phrase && title.includes(phrase)) score += 4;
  else if (phrase && summary.includes(phrase)) score += 3;
  else if (phrase && haystack.includes(phrase)) score += 2;

  return score;
}

function tokenize(query: string) {
  return normalizeText(query).split(/\s+/).filter(Boolean);
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu, " ").replace(/\s+/g, " ").trim();
}

function hasValue(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasOwn(value: object, property: string) {
  return Object.prototype.hasOwnProperty.call(value, property);
}
