-- ============================================================
-- RETRIEVAL PROVIDER METADATA
-- ============================================================

alter table public.memory_items
  add column if not exists embedding_provider text,
  add column if not exists embedding_model text,
  add column if not exists embedding_dimension integer,
  add column if not exists embedding_index_name text,
  add column if not exists embedding_index_source text,
  add column if not exists embedding_backfill_version integer;

update public.memory_items
set
  embedding_provider = coalesce(embedding_provider, 'openai'),
  embedding_model = coalesce(embedding_model, 'text-embedding-3-small'),
  embedding_dimension = coalesce(embedding_dimension, vector_dims(embedding)),
  embedding_index_name = coalesce(embedding_index_name, 'memory_items_embedding_1536'),
  embedding_index_source = coalesce(embedding_index_source, 'supabase_pgvector'),
  embedding_backfill_version = coalesce(embedding_backfill_version, 1)
where embedding is not null;

alter table public.memory_items
  drop constraint if exists memory_items_embedding_metadata_check;

alter table public.memory_items
  add constraint memory_items_embedding_metadata_check
  check (
    (
      embedding is null
      and embedding_provider is null
      and embedding_model is null
      and embedding_dimension is null
      and embedding_index_name is null
      and embedding_index_source is null
      and embedding_backfill_version is null
    )
    or (
      embedding is not null
      and embedding_provider = 'openai'
      and embedding_model = 'text-embedding-3-small'
      and embedding_dimension = 1536
      and embedding_dimension = vector_dims(embedding)
      and embedding_index_name = 'memory_items_embedding_1536'
      and embedding_index_source = 'supabase_pgvector'
      and embedding_backfill_version >= 1
    )
  );

comment on column public.memory_items.embedding_provider is
  'BE-04 retrieval metadata. Current active provider is openai; this lane does not switch providers.';
comment on column public.memory_items.embedding_model is
  'BE-04 retrieval metadata. Current active model is text-embedding-3-small.';
comment on column public.memory_items.embedding_dimension is
  'BE-04 retrieval metadata. Must match vector_dims(embedding) and remain 1536 for the active pgvector index.';
comment on column public.memory_items.embedding_index_name is
  'BE-04 retrieval metadata. Current active index contract is memory_items_embedding_1536.';
comment on column public.memory_items.embedding_index_source is
  'BE-04 retrieval metadata. Current active index source is Supabase pgvector.';
comment on column public.memory_items.embedding_backfill_version is
  'BE-04 retrieval metadata. Increment only for an explicit future backfill/reindex lane.';

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
    and m.embedding_provider = 'openai'
    and m.embedding_model = 'text-embedding-3-small'
    and m.embedding_dimension = 1536
    and m.embedding_index_name = 'memory_items_embedding_1536'
    and m.embedding_index_source = 'supabase_pgvector'
    and m.archive_source_type is null
    and coalesce(ml.status, 'active') = 'active'
    and ml.superseded_by_memory_item_id is null
    and (ml.expires_at is null or ml.expires_at > now())
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
    and m.embedding_provider = 'openai'
    and m.embedding_model = 'text-embedding-3-small'
    and m.embedding_dimension = 1536
    and m.embedding_index_name = 'memory_items_embedding_1536'
    and m.embedding_index_source = 'supabase_pgvector'
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_private_archive_chunks to authenticated;
