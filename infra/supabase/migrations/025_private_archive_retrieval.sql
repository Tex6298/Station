-- ============================================================
-- PRIVATE ARCHIVE RETRIEVAL PROVENANCE
-- ============================================================

alter table public.memory_items
  add column if not exists archive_source_type text,
  add column if not exists archive_source_id uuid,
  add column if not exists archive_source_name text,
  add column if not exists chunk_index integer,
  add column if not exists chunk_count integer;

alter table public.memory_items
  drop constraint if exists memory_items_archive_source_type_check;

alter table public.memory_items
  add constraint memory_items_archive_source_type_check
  check (
    archive_source_type is null
    or archive_source_type in ('import_job', 'persona_file', 'archived_chat_transcript')
  );

alter table public.memory_items
  drop constraint if exists memory_items_archive_chunk_bounds_check;

alter table public.memory_items
  add constraint memory_items_archive_chunk_bounds_check
  check (
    (chunk_index is null and chunk_count is null)
    or (
      chunk_index is not null
      and chunk_count is not null
      and chunk_index >= 0
      and chunk_count > 0
      and chunk_index < chunk_count
    )
  );

create index if not exists idx_memory_items_archive_source
  on public.memory_items (owner_user_id, persona_id, archive_source_type, archive_source_id, created_at desc)
  where archive_source_type is not null;

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
  where m.persona_id = p_persona_id
    and m.embedding is not null
    and m.archive_source_type is null
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_memory_items to authenticated;

create or replace function public.match_private_archive_chunks(
  p_persona_id uuid,
  p_owner_user_id uuid,
  query_embedding vector(1536),
  match_count int default 6
)
returns table (
  id uuid,
  persona_id uuid,
  owner_user_id uuid,
  title text,
  content text,
  summary text,
  source_type text,
  relevance_weight integer,
  archive_source_type text,
  archive_source_id uuid,
  archive_source_name text,
  chunk_index integer,
  chunk_count integer,
  created_at timestamptz,
  similarity double precision
)
language sql
stable
as $$
  select
    m.id,
    m.persona_id,
    m.owner_user_id,
    m.title,
    m.content,
    m.summary,
    m.source_type,
    m.relevance_weight,
    m.archive_source_type,
    m.archive_source_id,
    m.archive_source_name,
    m.chunk_index,
    m.chunk_count,
    m.created_at,
    1 - (m.embedding <=> query_embedding) as similarity
  from public.memory_items m
  where m.persona_id = p_persona_id
    and m.owner_user_id = p_owner_user_id
    and m.archive_source_type is not null
    and m.embedding is not null
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_private_archive_chunks to authenticated;
