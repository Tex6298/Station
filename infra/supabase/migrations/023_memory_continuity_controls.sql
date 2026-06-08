-- ============================================================
-- Memory continuity controls: shared memory, trust, decay, cycle state
-- ============================================================

create table if not exists public.owner_memory_blocks (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  scope text not null default 'shared_user_profile'
    check (scope in ('shared_user_profile', 'working_style', 'preference', 'boundary', 'project_context')),
  trust_level text not null default 'user_stated'
    check (trust_level in ('user_stated', 'agreed_upon', 'model_suggested', 'llm_extracted')),
  status text not null default 'active'
    check (status in ('active', 'superseded', 'rejected', 'expired', 'quarantined')),
  confidence numeric not null default 1 check (confidence >= 0 and confidence <= 1),
  source_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_item_lifecycle (
  memory_item_id uuid primary key references public.memory_items(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  persona_id uuid not null references public.personas(id) on delete cascade,
  trust_level text not null default 'llm_extracted'
    check (trust_level in ('user_stated', 'agreed_upon', 'model_suggested', 'llm_extracted')),
  status text not null default 'active'
    check (status in ('active', 'superseded', 'rejected', 'expired', 'quarantined')),
  confidence numeric not null default 0.7 check (confidence >= 0 and confidence <= 1),
  decay_rate numeric not null default 0.04 check (decay_rate >= 0 and decay_rate <= 1),
  reinforcement_count integer not null default 0 check (reinforcement_count >= 0),
  last_reinforced_at timestamptz,
  expires_at timestamptz,
  superseded_by_memory_item_id uuid references public.memory_items(id) on delete set null,
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.persona_memory_cycle_states (
  persona_id uuid primary key references public.personas(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  last_consolidated_at timestamptz,
  next_threshold_pct integer not null default 75 check (next_threshold_pct in (50, 75, 95)),
  settings jsonb not null default jsonb_build_object(
    'enabled', true,
    'cooldownSeconds', 30,
    'thresholds', jsonb_build_array(50, 75, 95)
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_owner_memory_blocks_owner_status
  on public.owner_memory_blocks (owner_user_id, status, updated_at desc);

create index if not exists idx_memory_item_lifecycle_persona_status
  on public.memory_item_lifecycle (persona_id, status, updated_at desc);

create index if not exists idx_memory_item_lifecycle_expiry
  on public.memory_item_lifecycle (owner_user_id, expires_at)
  where expires_at is not null;

drop trigger if exists trg_owner_memory_blocks_updated_at on public.owner_memory_blocks;
create trigger trg_owner_memory_blocks_updated_at
  before update on public.owner_memory_blocks
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_memory_item_lifecycle_updated_at on public.memory_item_lifecycle;
create trigger trg_memory_item_lifecycle_updated_at
  before update on public.memory_item_lifecycle
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_persona_memory_cycle_states_updated_at on public.persona_memory_cycle_states;
create trigger trg_persona_memory_cycle_states_updated_at
  before update on public.persona_memory_cycle_states
  for each row execute function public.handle_updated_at();

alter table public.owner_memory_blocks enable row level security;
alter table public.memory_item_lifecycle enable row level security;
alter table public.persona_memory_cycle_states enable row level security;

drop policy if exists "owner_memory_blocks_all_owner" on public.owner_memory_blocks;
create policy "owner_memory_blocks_all_owner"
  on public.owner_memory_blocks
  for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "memory_item_lifecycle_all_owner" on public.memory_item_lifecycle;
create policy "memory_item_lifecycle_all_owner"
  on public.memory_item_lifecycle
  for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "persona_memory_cycle_states_all_owner" on public.persona_memory_cycle_states;
create policy "persona_memory_cycle_states_all_owner"
  on public.persona_memory_cycle_states
  for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

insert into public.memory_item_lifecycle (memory_item_id, owner_user_id, persona_id, trust_level, confidence)
select
  id,
  owner_user_id,
  persona_id,
  case
    when source_type = 'manual' then 'user_stated'
    when source_type in ('calibration', 'integrity_session') then 'agreed_upon'
    else 'llm_extracted'
  end,
  case
    when source_type = 'manual' then 1
    when source_type in ('calibration', 'integrity_session') then 0.9
    else 0.7
  end
from public.memory_items
on conflict (memory_item_id) do nothing;

insert into public.persona_memory_cycle_states (persona_id, owner_user_id)
select id, owner_user_id
from public.personas
on conflict (persona_id) do nothing;

comment on table public.owner_memory_blocks is
  'Letta-inspired shared owner memory blocks that can be injected across personas, separate from private persona memory.';

comment on table public.memory_item_lifecycle is
  'YesMem/Riverse-inspired trust, confidence, decay, expiry, quarantine, and supersession metadata for persona memory items.';

comment on table public.persona_memory_cycle_states is
  'PersonaUI/Riverse-inspired memory consolidation cycle state for threshold-based future background updates.';
