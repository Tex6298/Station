-- ============================================================
-- PR50 Project Alpha schema skeleton
-- Additive only: no route/auth/billing/UI behavior change.
-- ============================================================

create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  owner_user_id     uuid not null references public.profiles(id) on delete cascade,
  name              text not null check (length(trim(name)) > 0),
  slug              text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description       text,
  visibility        text not null default 'private'
                      check (visibility in ('private', 'unlisted', 'community', 'public')),
  connection_tier   text not null default 'tier_1_showcase'
                      check (connection_tier in ('tier_1_showcase', 'tier_2_hosted', 'tier_3_lab')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.project_members (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role        text not null default 'owner'
                check (role in ('owner', 'admin', 'editor', 'viewer', 'billing')),
  status      text not null default 'active'
                check (status in ('invited', 'active', 'removed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index if not exists projects_slug_idx
  on public.projects (slug);

create index if not exists projects_owner_idx
  on public.projects (owner_user_id, created_at desc);

create index if not exists project_members_project_idx
  on public.project_members (project_id, status, role);

create index if not exists project_members_user_idx
  on public.project_members (user_id, status, created_at desc);

create unique index if not exists project_members_active_user_idx
  on public.project_members (project_id, user_id)
  where status <> 'removed';

drop trigger if exists trg_projects_updated_at
  on public.projects;

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_project_members_updated_at
  on public.project_members;

create trigger trg_project_members_updated_at
  before update on public.project_members
  for each row execute function public.handle_updated_at();

alter table public.developer_spaces
  add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table public.developer_space_usage
  add column if not exists project_id uuid references public.projects(id) on delete set null;

create index if not exists developer_spaces_project_idx
  on public.developer_spaces (project_id, created_at desc)
  where project_id is not null;

create index if not exists developer_space_usage_project_idx
  on public.developer_space_usage (project_id, updated_at desc)
  where project_id is not null;

alter table public.projects enable row level security;
alter table public.project_members enable row level security;

drop policy if exists "projects_all_owner"
  on public.projects;

create policy "projects_all_owner"
  on public.projects
  for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "project_members_all_project_owner"
  on public.project_members;

create policy "project_members_all_project_owner"
  on public.project_members
  for all
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
      and p.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
      and p.owner_user_id = auth.uid()
    )
  );

comment on table public.projects is
  'PR50 additive Project skeleton for future Phase 2B ownership. No route behavior consumes this yet.';

comment on table public.project_members is
  'PR50 additive Project membership skeleton. Route authorization remains owner_user_id based until a later lane.';

comment on column public.developer_spaces.project_id is
  'Nullable PR50 Project link. Null preserves current single-owner Developer Space behavior.';

comment on column public.developer_space_usage.project_id is
  'Nullable PR50 Project link for future project-level usage. Null preserves current owner-profile quota behavior.';
