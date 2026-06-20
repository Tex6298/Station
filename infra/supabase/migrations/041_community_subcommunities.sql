-- ============================================================
-- Community subcommunity foundation
-- ============================================================
-- Durable owner/tier-bound community areas linked to existing forum categories.
-- Existing seeded categories remain ordinary forum categories.

create table if not exists public.community_subcommunities (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null unique references public.forum_categories(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  subcommunity_type text not null check (subcommunity_type in ('general', 'canon', 'developer')),
  visibility text not null default 'public' check (visibility in ('public', 'community', 'unlisted', 'private')),
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  linked_space_id uuid references public.spaces(id) on delete set null,
  linked_developer_space_id uuid references public.developer_spaces(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_community_subcommunities_visible
  on public.community_subcommunities (visibility, status, created_at desc);

create index if not exists idx_community_subcommunities_owner
  on public.community_subcommunities (owner_user_id, created_at desc);

drop trigger if exists trg_community_subcommunities_updated_at on public.community_subcommunities;
create trigger trg_community_subcommunities_updated_at
  before update on public.community_subcommunities
  for each row execute function public.handle_updated_at();

alter table public.community_subcommunities enable row level security;

drop policy if exists "community_subcommunities_select_public_safe" on public.community_subcommunities;
create policy "community_subcommunities_select_public_safe"
  on public.community_subcommunities
  for select
  using (
    status = 'active'
    and visibility in ('public', 'community')
  );

drop policy if exists "community_subcommunities_owner_select" on public.community_subcommunities;
create policy "community_subcommunities_owner_select"
  on public.community_subcommunities
  for select
  using (auth.uid() = owner_user_id);

drop policy if exists "community_subcommunities_admin_all" on public.community_subcommunities;
create policy "community_subcommunities_admin_all"
  on public.community_subcommunities
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_admin = true
    )
  );

comment on table public.community_subcommunities is
  'Owner/tier-bound Community Beta areas linked to forum categories. API serializers must keep private/unlisted and owner fields out of public reads.';

comment on column public.community_subcommunities.linked_developer_space_id is
  'Optional verified Developer Space link only; this does not expand Developer Space product behavior.';
