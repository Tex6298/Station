-- ============================================================
-- PR-14 Developer Space export packages and usage counters
-- ============================================================

alter table public.export_packages
  alter column persona_id drop not null;

alter table public.export_packages
  add column if not exists developer_space_id uuid references public.developer_spaces(id) on delete cascade;

alter table public.export_packages
  drop constraint if exists export_packages_kind_check;

alter table public.export_packages
  add constraint export_packages_kind_check
  check (package_kind in ('persona_archive', 'developer_space_archive'));

alter table public.export_packages
  drop constraint if exists export_packages_target_check;

alter table public.export_packages
  add constraint export_packages_target_check
  check (
    (
      package_kind = 'persona_archive'
      and persona_id is not null
      and developer_space_id is null
    )
    or (
      package_kind = 'developer_space_archive'
      and persona_id is null
      and developer_space_id is not null
    )
  );

create index if not exists idx_export_packages_owner_developer_space
  on public.export_packages (owner_user_id, developer_space_id, created_at desc)
  where developer_space_id is not null;

drop policy if exists "export_packages_all_owner"
  on public.export_packages;

create policy "export_packages_all_owner"
  on public.export_packages
  for all
  using (
    auth.uid() = owner_user_id
    and (
      (
        package_kind = 'persona_archive'
        and persona_id is not null
        and developer_space_id is null
        and exists (
          select 1
          from public.personas p
          where p.id = persona_id
          and p.owner_user_id = auth.uid()
        )
      )
      or (
        package_kind = 'developer_space_archive'
        and persona_id is null
        and developer_space_id is not null
        and exists (
          select 1
          from public.developer_spaces s
          where s.id = developer_space_id
          and s.owner_user_id = auth.uid()
        )
      )
    )
  )
  with check (
    auth.uid() = owner_user_id
    and (
      (
        package_kind = 'persona_archive'
        and persona_id is not null
        and developer_space_id is null
        and exists (
          select 1
          from public.personas p
          where p.id = persona_id
          and p.owner_user_id = auth.uid()
        )
      )
      or (
        package_kind = 'developer_space_archive'
        and persona_id is null
        and developer_space_id is not null
        and exists (
          select 1
          from public.developer_spaces s
          where s.id = developer_space_id
          and s.owner_user_id = auth.uid()
        )
      )
    )
  );

create table if not exists public.developer_space_usage (
  developer_space_id uuid primary key references public.developer_spaces(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  ingested_nodes_count bigint not null default 0 check (ingested_nodes_count >= 0),
  ingested_events_count bigint not null default 0 check (ingested_events_count >= 0),
  ingested_snapshots_count bigint not null default 0 check (ingested_snapshots_count >= 0),
  storage_bytes bigint not null default 0 check (storage_bytes >= 0),
  public_detail_reads_count bigint not null default 0 check (public_detail_reads_count >= 0),
  export_count bigint not null default 0 check (export_count >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists idx_developer_space_usage_owner
  on public.developer_space_usage (owner_user_id, updated_at desc);

drop trigger if exists trg_developer_space_usage_updated_at
  on public.developer_space_usage;

create trigger trg_developer_space_usage_updated_at
  before update on public.developer_space_usage
  for each row execute function public.handle_updated_at();

alter table public.developer_space_usage enable row level security;

drop policy if exists "developer_space_usage_all_owner"
  on public.developer_space_usage;

create policy "developer_space_usage_all_owner"
  on public.developer_space_usage
  for all
  using (
    auth.uid() = owner_user_id
    and exists (
      select 1
      from public.developer_spaces s
      where s.id = developer_space_id
      and s.owner_user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = owner_user_id
    and exists (
      select 1
      from public.developer_spaces s
      where s.id = developer_space_id
      and s.owner_user_id = auth.uid()
    )
  );

insert into public.developer_space_usage (developer_space_id, owner_user_id)
select id, owner_user_id
from public.developer_spaces
on conflict (developer_space_id) do nothing;

comment on table public.developer_space_usage is
  'Bounded PR-14 all-time counters for Developer Space ingestion, estimated storage, public reads, exports, and quota display.';

comment on column public.export_packages.developer_space_id is
  'Set for PR-14 Developer Space archive packages; persona_id remains set for persona archive packages.';
