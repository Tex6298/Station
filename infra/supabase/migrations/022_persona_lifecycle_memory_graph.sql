-- ============================================================
-- Persona lifecycle, layer architecture, and memory graph edges
-- ============================================================

create table if not exists public.persona_layer_profiles (
  persona_id uuid primary key references public.personas(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  soul jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  faculty jsonb not null default '{}'::jsonb,
  skill jsonb not null default '{}'::jsonb,
  evolution jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.persona_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid not null references public.personas(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check (event_type in ('created', 'wake', 'handoff_in', 'handoff_out', 'forked', 'integrity_check', 'layer_update', 'memory_graph_update')),
  event_label text,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.persona_handoffs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  from_persona_id uuid references public.personas(id) on delete set null,
  to_persona_id uuid not null references public.personas(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  summary text not null,
  pending_tasks jsonb not null default '[]'::jsonb,
  emotional_context jsonb not null default '{}'::jsonb,
  continuity_refs jsonb not null default '[]'::jsonb,
  status text not null default 'ready' check (status in ('ready', 'consumed', 'archived')),
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

create table if not exists public.memory_item_edges (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  persona_id uuid not null references public.personas(id) on delete cascade,
  from_memory_item_id uuid not null references public.memory_items(id) on delete cascade,
  to_memory_item_id uuid not null references public.memory_items(id) on delete cascade,
  edge_type text not null check (edge_type in ('related_to', 'supports', 'contradicts', 'supersedes', 'extends', 'references')),
  confidence numeric not null default 1 check (confidence >= 0 and confidence <= 1),
  note text,
  created_at timestamptz not null default now(),
  unique (owner_user_id, from_memory_item_id, to_memory_item_id, edge_type)
);

create index if not exists idx_persona_lifecycle_events_persona_created
  on public.persona_lifecycle_events (persona_id, created_at desc);

create index if not exists idx_persona_handoffs_to_persona_created
  on public.persona_handoffs (to_persona_id, created_at desc);

create index if not exists idx_memory_item_edges_persona
  on public.memory_item_edges (persona_id, created_at desc);

drop trigger if exists trg_persona_layer_profiles_updated_at
  on public.persona_layer_profiles;

create trigger trg_persona_layer_profiles_updated_at
  before update on public.persona_layer_profiles
  for each row execute function public.handle_updated_at();

alter table public.persona_layer_profiles enable row level security;
alter table public.persona_lifecycle_events enable row level security;
alter table public.persona_handoffs enable row level security;
alter table public.memory_item_edges enable row level security;

drop policy if exists "persona_layer_profiles_all_owner" on public.persona_layer_profiles;
create policy "persona_layer_profiles_all_owner"
  on public.persona_layer_profiles
  for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "persona_lifecycle_events_all_owner" on public.persona_lifecycle_events;
create policy "persona_lifecycle_events_all_owner"
  on public.persona_lifecycle_events
  for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "persona_handoffs_all_owner" on public.persona_handoffs;
create policy "persona_handoffs_all_owner"
  on public.persona_handoffs
  for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "memory_item_edges_all_owner" on public.memory_item_edges;
create policy "memory_item_edges_all_owner"
  on public.memory_item_edges
  for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

insert into public.persona_layer_profiles (persona_id, owner_user_id, soul, body, faculty, skill, evolution)
select
  id,
  owner_user_id,
  jsonb_build_object(
    'identity', jsonb_build_object('name', name, 'bio', coalesce(short_description, ''), 'longDescription', coalesce(long_description, '')),
    'character', jsonb_build_object('styleNotes', coalesce(style_notes, ''), 'awakeningPrompt', coalesce(awakening_prompt, ''))
  ),
  jsonb_build_object('runtime', jsonb_build_object('provider', provider, 'visibility', visibility)),
  jsonb_build_object('memory', jsonb_build_object('enabled', true, 'maxMemories', 500, 'summaryThreshold', 50)),
  jsonb_build_object('installed', '[]'::jsonb),
  jsonb_build_object('enabled', false, 'immutableTraits', '[]'::jsonb)
from public.personas
on conflict (persona_id) do nothing;

comment on table public.persona_layer_profiles is
  'OpenPersona-inspired Station-native four-layer persona profile: Soul, Body, Faculty, Skill, plus evolution guardrails.';

comment on table public.persona_handoffs is
  'Context handoff packets for switching between personas while preserving summary, pending tasks, emotional context, and continuity refs.';

comment on table public.memory_item_edges is
  'Memora/GroundMemory-inspired typed graph edges between persona memory items for archive graph views and conflict/supersession tracking.';
