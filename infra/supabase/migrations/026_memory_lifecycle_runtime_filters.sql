-- ============================================================
-- MEMORY LIFECYCLE RUNTIME FILTERS
-- ============================================================

create or replace function public.match_memory_items(
  p_persona_id uuid,
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id uuid,
  persona_id uuid,
  title text,
  content text,
  summary text,
  source_type text,
  relevance_weight integer,
  similarity double precision
)
language sql
stable
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
  left join public.memory_item_lifecycle ml
    on ml.memory_item_id = m.id
    and ml.owner_user_id = m.owner_user_id
  where m.persona_id = p_persona_id
    and m.embedding is not null
    and m.archive_source_type is null
    and coalesce(ml.status, 'active') = 'active'
    and ml.superseded_by_memory_item_id is null
    and (ml.expires_at is null or ml.expires_at > now())
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_memory_items to authenticated;
