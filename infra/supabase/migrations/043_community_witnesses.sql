-- ============================================================
-- Community recognition / witness foundation
-- ============================================================

create table if not exists public.community_witnesses (
  id uuid primary key default gen_random_uuid(),
  witness_user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('thread', 'comment')),
  target_id uuid not null,
  witness_kind text not null check (witness_kind in ('helpful', 'grounded', 'careful')),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (witness_user_id, target_type, target_id, witness_kind)
);

create index if not exists idx_community_witnesses_target_active
  on public.community_witnesses (target_type, target_id, witness_kind)
  where revoked_at is null;

create index if not exists idx_community_witnesses_user_active
  on public.community_witnesses (witness_user_id, target_type, target_id)
  where revoked_at is null;

drop trigger if exists trg_community_witnesses_updated_at on public.community_witnesses;
create trigger trg_community_witnesses_updated_at
  before update on public.community_witnesses
  for each row execute function public.handle_updated_at();

alter table public.community_witnesses enable row level security;

drop policy if exists "community_witnesses_select_authenticated" on public.community_witnesses;
create policy "community_witnesses_select_authenticated"
  on public.community_witnesses
  for select
  using (auth.uid() is not null);

drop policy if exists "community_witnesses_all_actor" on public.community_witnesses;
create policy "community_witnesses_all_actor"
  on public.community_witnesses
  for all
  using (auth.uid() = witness_user_id)
  with check (auth.uid() = witness_user_id);

comment on table public.community_witnesses is
  'Current-user scoped recognition events for readable community thread/comment contributions. Public serializers expose aggregate counts only, not witnesser identities.';
