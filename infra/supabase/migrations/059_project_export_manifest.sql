-- ============================================================
-- PR249 Project export manifest target
-- ============================================================

alter table public.export_packages
  add column if not exists project_id uuid references public.projects(id) on delete cascade;

alter table public.export_packages
  drop constraint if exists export_packages_kind_check;

alter table public.export_packages
  add constraint export_packages_kind_check
  check (package_kind in ('persona_archive', 'developer_space_archive', 'project_manifest'));

alter table public.export_packages
  drop constraint if exists export_packages_target_check;

alter table public.export_packages
  add constraint export_packages_target_check
  check (
    (
      package_kind = 'persona_archive'
      and persona_id is not null
      and developer_space_id is null
      and project_id is null
    )
    or (
      package_kind = 'developer_space_archive'
      and persona_id is null
      and developer_space_id is not null
      and project_id is null
    )
    or (
      package_kind = 'project_manifest'
      and persona_id is null
      and developer_space_id is null
      and project_id is not null
    )
  );

create index if not exists idx_export_packages_owner_project
  on public.export_packages (owner_user_id, project_id, created_at desc)
  where project_id is not null;

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
        and project_id is null
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
        and project_id is null
        and exists (
          select 1
          from public.developer_spaces s
          where s.id = developer_space_id
          and s.owner_user_id = auth.uid()
        )
      )
      or (
        package_kind = 'project_manifest'
        and persona_id is null
        and developer_space_id is null
        and project_id is not null
        and exists (
          select 1
          from public.projects p
          where p.id = project_id
          and p.owner_user_id = auth.uid()
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
        and project_id is null
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
        and project_id is null
        and exists (
          select 1
          from public.developer_spaces s
          where s.id = developer_space_id
          and s.owner_user_id = auth.uid()
        )
      )
      or (
        package_kind = 'project_manifest'
        and persona_id is null
        and developer_space_id is null
        and project_id is not null
        and exists (
          select 1
          from public.projects p
          where p.id = project_id
          and p.owner_user_id = auth.uid()
        )
      )
    )
  );

comment on column public.export_packages.project_id is
  'Set for PR249 owner-only Project manifest packages; persona_id and developer_space_id remain null for project_manifest rows.';
