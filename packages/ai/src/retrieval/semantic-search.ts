import type { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "./embeddings";

export interface MemorySearchResult {
  id: string;
  personaId: string;
  title: string | null;
  content: string;
  summary: string | null;
  sourceType: string;
  relevanceWeight: number;
  similarity: number;
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
}): Promise<MemorySearchResult[]> {
  const { supabase, personaId, query, limit = 6, embeddingApiKey } = options;

  try {
    const embedding = await generateEmbedding(query, embeddingApiKey);

    // pgvector RPC - defined below in 003_rag_functions.sql
    const { data, error } = await supabase.rpc("match_memory_items", {
      p_persona_id: personaId,
      query_embedding: embedding,
      match_count: limit,
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
    return keywordFallbackSearch(supabase, personaId, query, limit);
  }
}

/**
 * Loads canon items for a persona, ordered by priority descending.
 */
export async function loadCanon(
  supabase: SupabaseClient,
  personaId: string,
  limit = 5
): Promise<CanonResult[]> {
  const { data, error } = await supabase
    .from("canon_items")
    .select("id, persona_id, title, content, priority")
    .eq("persona_id", personaId)
    .order("priority", { ascending: false })
    .limit(limit);

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
  limit: number
): Promise<MemorySearchResult[]> {
  const { data } = await supabase
    .from("memory_items")
    .select("id, persona_id, title, content, summary, source_type, relevance_weight")
    .eq("persona_id", personaId)
    .order("relevance_weight", { ascending: false })
    .limit(limit * 3);

  if (!data) return [];

  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);

  return data
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
      };
    })
    .sort((a, b) => b.similarity - a.similarity || b.relevanceWeight - a.relevanceWeight)
    .slice(0, limit);
}
