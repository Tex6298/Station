import type { SupabaseClient } from "@supabase/supabase-js";
import { activeEmbeddingRpcArgs, generateEmbedding } from "./embeddings";

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

export interface CanonResult {
  id: string;
  personaId: string;
  title: string | null;
  content: string;
  priority: number;
}

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
  ownerUserId?: string;
}): Promise<MemorySearchResult[]> {
  const { supabase, personaId, query, limit = 6, embeddingApiKey, ownerUserId } = options;

  if (!hasValue(embeddingApiKey)) {
    return keywordFallbackSearch(supabase, personaId, query, limit, ownerUserId);
  }

  try {
    const embedding = await generateEmbedding(query, embeddingApiKey, { useCase: "query" });

    // pgvector RPC - defined below in 003_rag_functions.sql
    const { data, error } = await supabase.rpc("match_memory_items", {
      p_persona_id: personaId,
      query_embedding: embedding,
      match_count: limit,
      ...activeEmbeddingRpcArgs(),
    });

    if (error) throw error;

    return (data ?? []).map(
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
  } catch {
    // Fallback: keyword search
    return keywordFallbackSearch(supabase, personaId, query, limit, ownerUserId);
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
  ownerUserId?: string
): Promise<MemorySearchResult[]> {
  const memoryQuery = supabase
    .from("memory_items")
    .select("id, persona_id, title, content, summary, source_type, relevance_weight, archive_source_type")
    .eq("persona_id", personaId)
    .order("relevance_weight", { ascending: false })
    .limit(limit * 3);

  if (ownerUserId) memoryQuery.eq("owner_user_id", ownerUserId);

  const { data } = await memoryQuery;

  if (!data) return [];
  const lifecycleByMemoryId = await loadMemoryLifecycleMap(supabase, personaId, ownerUserId);

  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);

  return data
    .filter((row) => row.archive_source_type == null)
    .filter((row) => isLifecycleInjectable(lifecycleByMemoryId.get(row.id)))
    .map((row) => {
      const haystack = `${row.title ?? ""} ${row.content} ${row.summary ?? ""}`.toLowerCase();
      const score = tokens.filter((t) => haystack.includes(t)).length;
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

function isLifecycleInjectable(
  lifecycle?: { status?: string | null; expires_at?: string | null; superseded_by_memory_item_id?: string | null }
) {
  if (!lifecycle) return true;
  if ((lifecycle.status ?? "active") !== "active") return false;
  if (lifecycle.superseded_by_memory_item_id) return false;
  if (!lifecycle.expires_at) return true;

  const expiresAt = Date.parse(lifecycle.expires_at);
  return Number.isNaN(expiresAt) || expiresAt > Date.now();
}

function hasValue(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}
