-- ============================================================
-- Station – RAG / pgvector helper functions
-- Run after 002_rls_policies.sql
-- ============================================================

-- Semantic search over memory_items for a given persona
-- Returns top-K items by cosine similarity to the query embedding
create or replace function public.match_memory_items(
  p_persona_id   uuid,
  query_embedding vector(1536),
  match_count    int default 6
)
returns table (
  id               uuid,
  persona_id       uuid,
  title            text,
  content          text,
  summary          text,
  source_type      text,
  relevance_weight int,
  similarity       float
)
language sql stable
as $$
  select
    m.id,
    m.persona_id,
    m.title,
    m.content,
    m.summary,
    m.source_type,
    m.relevance_weight,
    1 - (m.embedding <=> query_embedding) as similarity
  from public.memory_items m
  where
    m.persona_id = p_persona_id
    and m.embedding is not null
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

-- Grant execute to authenticated users (RLS on the table still applies)
grant execute on function public.match_memory_items to authenticated;
