-- ============================================================
-- Developer Spaces — live observatory + data ingestion
-- Run after 005_social_publishing.sql
-- ============================================================

create table public.developer_spaces (
  id                    uuid primary key default gen_random_uuid(),
  owner_user_id         uuid not null references public.profiles (id) on delete cascade,
  project_name          text not null,
  slug                  text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description           text,
  visibility            text not null default 'private'
                          check (visibility in ('private', 'unlisted', 'community', 'public')),
  visualisation_type    text not null default 'node_field'
                          check (visualisation_type in ('node_field', 'timeline', 'world_map', 'constellation')),
  visualisation_config  jsonb not null default '{}',
  api_key_hash          text,
  api_key_last_four     text,
  api_key_created_at    timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table public.developer_space_nodes (
  id                     uuid primary key default gen_random_uuid(),
  developer_space_id     uuid not null references public.developer_spaces (id) on delete cascade,
  external_id            text not null,
  node_name              text not null,
  topology_type          text not null default 'custom'
                           check (topology_type in ('radial', 'branching', 'lattice', 'custom')),
  fragment_count         integer not null default 0,
  self_similarity_score  numeric,
  dimensionality         integer,
  metrics                jsonb not null default '{}',
  last_event_at          timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (developer_space_id, external_id)
);

create table public.developer_space_events (
  id                    uuid primary key default gen_random_uuid(),
  developer_space_id    uuid not null references public.developer_spaces (id) on delete cascade,
  node_id               uuid references public.developer_space_nodes (id) on delete set null,
  external_node_id      text,
  event_type            text not null,
  event_label           text,
  event_data            jsonb not null default '{}',
  similarity_score      numeric,
  source_refs           jsonb not null default '[]',
  provenance            text not null default 'api'
                          check (provenance in ('api', 'imported', 'user', 'system', 'ai_generated')),
  visibility            text not null default 'public'
                          check (visibility in ('private', 'community', 'public')),
  occurred_at           timestamptz not null default now(),
  created_at            timestamptz not null default now()
);

create table public.developer_space_snapshots (
  id                    uuid primary key default gen_random_uuid(),
  developer_space_id    uuid not null references public.developer_spaces (id) on delete cascade,
  snapshot_data         jsonb not null,
  source_refs           jsonb not null default '[]',
  provenance            text not null default 'api'
                          check (provenance in ('api', 'imported', 'user', 'system', 'ai_generated')),
  visibility            text not null default 'public'
                          check (visibility in ('private', 'community', 'public')),
  occurred_at           timestamptz not null default now(),
  created_at            timestamptz not null default now()
);

create index developer_spaces_owner_idx on public.developer_spaces (owner_user_id, created_at desc);
create index developer_spaces_slug_idx on public.developer_spaces (slug);
create index developer_space_nodes_space_idx on public.developer_space_nodes (developer_space_id, updated_at desc);
create index developer_space_events_space_time_idx on public.developer_space_events (developer_space_id, occurred_at desc);
create index developer_space_events_type_idx on public.developer_space_events (event_type);
create index developer_space_snapshots_space_time_idx on public.developer_space_snapshots (developer_space_id, occurred_at desc);

create trigger trg_developer_spaces_updated_at
  before update on public.developer_spaces
  for each row execute function public.handle_updated_at();

create trigger trg_developer_space_nodes_updated_at
  before update on public.developer_space_nodes
  for each row execute function public.handle_updated_at();

alter table public.developer_spaces enable row level security;
alter table public.developer_space_nodes enable row level security;
alter table public.developer_space_events enable row level security;
alter table public.developer_space_snapshots enable row level security;

-- Owners can manage the full research interface.
create policy "developer_spaces_all_owner" on public.developer_spaces
  for all using (auth.uid() = owner_user_id);

create policy "developer_space_nodes_all_owner" on public.developer_space_nodes
  for all using (
    exists (
      select 1 from public.developer_spaces s
      where s.id = developer_space_id
      and s.owner_user_id = auth.uid()
    )
  );

create policy "developer_space_events_all_owner" on public.developer_space_events
  for all using (
    exists (
      select 1 from public.developer_spaces s
      where s.id = developer_space_id
      and s.owner_user_id = auth.uid()
    )
  );

create policy "developer_space_snapshots_all_owner" on public.developer_space_snapshots
  for all using (
    exists (
      select 1 from public.developer_spaces s
      where s.id = developer_space_id
      and s.owner_user_id = auth.uid()
    )
  );

-- Public/community observatory reads are served through the Express API,
-- which uses the service-role client and serializes only safe fields.
-- Do not add broad direct SELECT policies here: developer_spaces contains
-- hashed ingestion key material that should never be exposed to browser clients.
