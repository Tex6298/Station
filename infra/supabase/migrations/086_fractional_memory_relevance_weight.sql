begin;

select pg_advisory_xact_lock(hashtextextended('station.pr528b5.fractional_memory_relevance_weight.086', 0));

do $$
declare
  current_type text;
begin
  if to_regclass('public.memory_items') is null then
    raise exception 'PR528B5 expected public.memory_items to exist before migration 086';
  end if;

  select pg_catalog.format_type(a.atttypid, a.atttypmod)
  into current_type
  from pg_catalog.pg_attribute a
  where a.attrelid = 'public.memory_items'::regclass
    and a.attname = 'relevance_weight'
    and a.attnum > 0
    and not a.attisdropped;

  if current_type is null then
    raise exception 'PR528B5 expected public.memory_items.relevance_weight to exist before migration 086';
  end if;

  if current_type not in ('integer', 'numeric') then
    raise exception 'PR528B5 expected relevance_weight integer or numeric, found %', current_type;
  end if;

  if to_regprocedure('public.match_memory_items(uuid,vector,integer,text,text,text)') is null then
    raise exception 'PR528B5 expected the current six-argument match_memory_items RPC';
  end if;

  if to_regprocedure('public.match_private_archive_chunks(uuid,uuid,vector,integer,text,text,text)') is null then
    raise exception 'PR528B5 expected the current seven-argument match_private_archive_chunks RPC';
  end if;
end;
$$;

alter table public.memory_items
  alter column relevance_weight type numeric
    using relevance_weight::numeric,
  alter column relevance_weight set default 1,
  alter column relevance_weight set not null;

comment on column public.memory_items.relevance_weight is
  'Finite non-negative relevance weight. Owner routes accept 0.1 through 5; trusted internal paths may use broader numeric values.';

drop function if exists public.match_memory_items(uuid, vector, int, text, text, text);

create function public.match_memory_items(
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
  relevance_weight numeric,
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

drop function if exists public.match_private_archive_chunks(uuid, uuid, vector, int, text, text, text);

create function public.match_private_archive_chunks(
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
  relevance_weight numeric,
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

create or replace function public.memory_relevance_weight_contract()
returns table (
  memory_column_type text,
  memory_rpc_relevance_type text,
  archive_rpc_relevance_type text,
  ready boolean
)
language sql
stable
set search_path = pg_catalog, public
as $$
  with memory_column as (
    select pg_catalog.format_type(a.atttypid, a.atttypmod) as column_type
    from pg_catalog.pg_attribute a
    where a.attrelid = 'public.memory_items'::regclass
      and a.attname = 'relevance_weight'
      and a.attnum > 0
      and not a.attisdropped
  ),
  function_outputs as (
    select
      target.function_key,
      pg_catalog.format_type(proc.proallargtypes[subscript.ordinal], null) as relevance_type
    from (
      values
        (
          'memory',
          pg_catalog.to_regprocedure('public.match_memory_items(uuid,vector,integer,text,text,text)')
        ),
        (
          'archive',
          pg_catalog.to_regprocedure('public.match_private_archive_chunks(uuid,uuid,vector,integer,text,text,text)')
        )
    ) as target(function_key, function_oid)
    join pg_catalog.pg_proc proc on proc.oid = target.function_oid
    cross join lateral pg_catalog.generate_subscripts(proc.proallargtypes, 1) as subscript(ordinal)
    where proc.proargmodes[subscript.ordinal] = 't'
      and proc.proargnames[subscript.ordinal] = 'relevance_weight'
  ),
  contract as (
    select
      (select column_type from memory_column) as memory_column_type,
      (select relevance_type from function_outputs where function_key = 'memory') as memory_rpc_relevance_type,
      (select relevance_type from function_outputs where function_key = 'archive') as archive_rpc_relevance_type
  )
  select
    contract.memory_column_type,
    contract.memory_rpc_relevance_type,
    contract.archive_rpc_relevance_type,
    contract.memory_column_type = 'numeric'
      and contract.memory_rpc_relevance_type = 'numeric'
      and contract.archive_rpc_relevance_type = 'numeric' as ready
  from contract;
$$;

revoke all on function public.memory_relevance_weight_contract() from public, anon, authenticated;
grant execute on function public.memory_relevance_weight_contract() to service_role;

comment on function public.memory_relevance_weight_contract() is
  'Service-role readiness proof for the numeric Memory column and both numeric retrieval RPC return contracts.';

notify pgrst, 'reload schema';

commit;
