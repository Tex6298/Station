-- ============================================================
-- PR496A Owner workspace export manifest package
-- ============================================================

alter table public.export_packages
  drop constraint if exists export_packages_kind_check;

alter table public.export_packages
  add constraint export_packages_kind_check
  check (package_kind in ('persona_archive', 'developer_space_archive', 'project_manifest', 'workspace_manifest'));

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
    or (
      package_kind = 'workspace_manifest'
      and persona_id is null
      and developer_space_id is null
      and project_id is null
    )
  );

create index if not exists idx_export_packages_owner_workspace_manifest
  on public.export_packages (owner_user_id, package_kind, created_at desc)
  where package_kind = 'workspace_manifest'
    and persona_id is null
    and developer_space_id is null
    and project_id is null;

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
      or (
        package_kind = 'workspace_manifest'
        and persona_id is null
        and developer_space_id is null
        and project_id is null
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
      or (
        package_kind = 'workspace_manifest'
        and persona_id is null
        and developer_space_id is null
        and project_id is null
      )
    )
  );

comment on constraint export_packages_kind_check on public.export_packages is
  'Allows PR496A owner-only workspace_manifest packages in addition to scoped persona, Developer Space, and Project packages.';

comment on constraint export_packages_target_check on public.export_packages is
  'workspace_manifest rows are owner-level package records and must have null persona_id, developer_space_id, and project_id targets.';
