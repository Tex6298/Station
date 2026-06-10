-- ============================================================
-- GEMINI EMBEDDING PROVIDER PREP
-- ============================================================
--
-- This migration prepares the schema for an explicit future embedding-provider
-- switch. It does not backfill existing OpenAI vectors and does not make Gemini
-- the default provider.

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
      and embedding_provider in ('openai', 'gemini')
      and embedding_model is not null
      and embedding_dimension = 1536
      and embedding_dimension = vector_dims(embedding)
      and embedding_index_name = 'memory_items_embedding_1536'
      and embedding_index_source = 'supabase_pgvector'
      and embedding_backfill_version >= 1
    )
  );

comment on column public.memory_items.embedding_provider is
  'Active embedding provider for this vector row. OpenAI remains the default; Gemini requires an explicit reindex/migration lane.';
comment on column public.memory_items.embedding_model is
  'Embedding model used for this vector row. Provider/model changes must not mix inside the same retrieval pass.';
comment on column public.memory_items.embedding_dimension is
  'Must match vector_dims(embedding) and remain 1536 while using memory_items_embedding_1536.';
comment on column public.memory_items.embedding_index_name is
  'Current index contract is memory_items_embedding_1536 for 1536-dimensional vectors.';
comment on column public.memory_items.embedding_index_source is
  'Current active index source is Supabase pgvector.';
comment on column public.memory_items.embedding_backfill_version is
  'Increment only for an explicit backfill/reindex lane.';

drop function if exists public.match_memory_items(uuid, vector, int);

create or replace function public.match_memory_items(
  p_persona_id uuid,
  query_embedding vector(1536),
  match_count int default 5,
  p_embedding_provider text default 'openai',
  p_embedding_model text default null,
  p_embedding_index_name text default 'memory_items_embedding_1536'
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
    and m.embedding_provider = p_embedding_provider
    and (p_embedding_model is null or m.embedding_model = p_embedding_model)
    and m.embedding_dimension = 1536
    and m.embedding_index_name = p_embedding_index_name
    and m.embedding_index_source = 'supabase_pgvector'
    and m.archive_source_type is null
    and coalesce(ml.status, 'active') = 'active'
    and ml.superseded_by_memory_item_id is null
    and (ml.expires_at is null or ml.expires_at > now())
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_memory_items(uuid, vector, int, text, text, text) to authenticated;

drop function if exists public.match_private_archive_chunks(uuid, uuid, vector, int);

create or replace function public.match_private_archive_chunks(
  p_persona_id uuid,
  p_owner_user_id uuid,
  query_embedding vector(1536),
  match_count int default 6,
  p_embedding_provider text default 'openai',
  p_embedding_model text default null,
  p_embedding_index_name text default 'memory_items_embedding_1536'
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
    and m.embedding_provider = p_embedding_provider
    and (p_embedding_model is null or m.embedding_model = p_embedding_model)
    and m.embedding_dimension = 1536
    and m.embedding_index_name = p_embedding_index_name
    and m.embedding_index_source = 'supabase_pgvector'
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_private_archive_chunks(uuid, uuid, vector, int, text, text, text) to authenticated;
