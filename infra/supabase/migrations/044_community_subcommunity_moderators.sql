-- ============================================================
-- Community subcommunity moderator role foundation
-- ============================================================
-- Durable bounded moderator assignments for subcommunity owners/admins.
-- Owners remain derived from community_subcommunities.owner_user_id and are not
-- duplicated as mutable moderator rows.

create table if not exists public.community_subcommunity_moderators (
  id uuid primary key default gen_random_uuid(),
  subcommunity_id uuid not null references public.community_subcommunities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'moderator' check (role = 'moderator'),
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subcommunity_id, user_id)
);

create index if not exists idx_community_subcommunity_moderators_active
  on public.community_subcommunity_moderators (subcommunity_id, user_id)
  where status = 'active';

create index if not exists idx_community_subcommunity_moderators_user
  on public.community_subcommunity_moderators (user_id, status, updated_at desc);

drop trigger if exists trg_community_subcommunity_moderators_updated_at on public.community_subcommunity_moderators;
create trigger trg_community_subcommunity_moderators_updated_at
  before update on public.community_subcommunity_moderators
  for each row execute function public.handle_updated_at();

alter table public.community_subcommunity_moderators enable row level security;

drop policy if exists "community_subcommunity_moderators_owner_admin_select" on public.community_subcommunity_moderators;
create policy "community_subcommunity_moderators_owner_admin_select"
  on public.community_subcommunity_moderators
  for select
  using (
    exists (
      select 1 from public.community_subcommunities s
      where s.id = subcommunity_id
        and s.owner_user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_admin = true
    )
  );

drop policy if exists "community_subcommunity_moderators_owner_admin_write" on public.community_subcommunity_moderators;
create policy "community_subcommunity_moderators_owner_admin_write"
  on public.community_subcommunity_moderators
  for all
  using (
    exists (
      select 1 from public.community_subcommunities s
      where s.id = subcommunity_id
        and s.owner_user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.community_subcommunities s
      where s.id = subcommunity_id
        and s.owner_user_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_admin = true
    )
  );

comment on table public.community_subcommunity_moderators is
  'Owner/admin managed moderator assignments for subcommunities. Public/community serializers must not expose moderator identities.';
