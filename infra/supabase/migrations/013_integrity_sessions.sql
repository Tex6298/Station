-- ============================================================
-- INTEGRITY SESSIONS AND PER-PERSONA PREFERENCES
-- ============================================================

create table if not exists public.integrity_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  persona_id uuid not null references public.personas (id) on delete cascade,
  session_type text not null
    check (session_type in ('initial', 'periodic', 'migration', 'pre_publication', 'manual')),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'abandoned')),
  clusters_covered text[] not null default '{}'::text[],
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integrity_session_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.integrity_sessions (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  persona_id uuid not null references public.personas (id) on delete cascade,
  cluster text not null,
  question text not null,
  answer text,
  turn_type text not null
    check (turn_type in ('anchor', 'follow_up', 'summary', 'confirmation')),
  created_at timestamptz not null default now()
);

create table if not exists public.integrity_session_outputs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.integrity_sessions (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  persona_id uuid not null references public.personas (id) on delete cascade,
  output_type text not null
    check (output_type in ('memory_candidate', 'canon_candidate', 'preference', 'boundary', 'theme')),
  content text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'edited')),
  edited_content text,
  written_to text
    check (written_to is null or written_to in ('memory', 'canon', 'preference_profile')),
  written_target_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.persona_preferences (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  persona_id uuid not null references public.personas (id) on delete cascade,
  warmth_level text not null default 'high'
    check (warmth_level in ('high', 'moderate', 'neutral')),
  playfulness text not null default 'moderate'
    check (playfulness in ('high', 'moderate', 'low')),
  register_preference text not null default 'balanced'
    check (register_preference in ('mystical', 'balanced', 'grounded')),
  depth_preference text not null default 'expansive'
    check (depth_preference in ('expansive', 'balanced', 'concise')),
  challenge_preference text not null default 'balanced'
    check (challenge_preference in ('challenge', 'balanced', 'support')),
  disclaimer_sensitivity text not null default 'low'
    check (disclaimer_sensitivity in ('high', 'neutral', 'low')),
  relationship_tone text not null default 'companion',
  recurring_topics text[] not null default '{}'::text[],
  updated_at timestamptz not null default now(),
  unique (owner_user_id, persona_id)
);

create index if not exists idx_integrity_sessions_owner_persona
  on public.integrity_sessions (owner_user_id, persona_id, started_at desc);

create index if not exists idx_integrity_turns_session_time
  on public.integrity_session_turns (session_id, created_at);

create index if not exists idx_integrity_outputs_owner_persona_status
  on public.integrity_session_outputs (owner_user_id, persona_id, status, created_at desc);

create index if not exists idx_persona_preferences_owner_persona
  on public.persona_preferences (owner_user_id, persona_id);

drop trigger if exists trg_integrity_sessions_updated_at on public.integrity_sessions;
create trigger trg_integrity_sessions_updated_at
  before update on public.integrity_sessions
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_integrity_session_outputs_updated_at on public.integrity_session_outputs;
create trigger trg_integrity_session_outputs_updated_at
  before update on public.integrity_session_outputs
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_persona_preferences_updated_at on public.persona_preferences;
create trigger trg_persona_preferences_updated_at
  before update on public.persona_preferences
  for each row execute function public.handle_updated_at();

alter table public.integrity_sessions enable row level security;
alter table public.integrity_session_turns enable row level security;
alter table public.integrity_session_outputs enable row level security;
alter table public.persona_preferences enable row level security;

drop policy if exists "integrity_sessions_all_owner" on public.integrity_sessions;
create policy "integrity_sessions_all_owner" on public.integrity_sessions
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "integrity_turns_all_owner" on public.integrity_session_turns;
create policy "integrity_turns_all_owner" on public.integrity_session_turns
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "integrity_outputs_all_owner" on public.integrity_session_outputs;
create policy "integrity_outputs_all_owner" on public.integrity_session_outputs
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "persona_preferences_all_owner" on public.persona_preferences;
create policy "persona_preferences_all_owner" on public.persona_preferences
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);
