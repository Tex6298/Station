-- ============================================================
-- PR504A Station Press owner publication package contract
-- ============================================================

alter table public.export_packages
  add column if not exists document_id uuid references public.documents(id) on delete cascade;

alter table public.export_packages
  drop constraint if exists export_packages_kind_check;

alter table public.export_packages
  add constraint export_packages_kind_check
  check (package_kind in ('persona_archive', 'developer_space_archive', 'project_manifest', 'workspace_manifest', 'station_press_publication'));

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
      and document_id is null
    )
    or (
      package_kind = 'developer_space_archive'
      and persona_id is null
      and developer_space_id is not null
      and project_id is null
      and document_id is null
    )
    or (
      package_kind = 'project_manifest'
      and persona_id is null
      and developer_space_id is null
      and project_id is not null
      and document_id is null
    )
    or (
      package_kind = 'workspace_manifest'
      and persona_id is null
      and developer_space_id is null
      and project_id is null
      and document_id is null
    )
    or (
      package_kind = 'station_press_publication'
      and persona_id is null
      and developer_space_id is null
      and project_id is null
      and document_id is not null
    )
  );

create index if not exists idx_export_packages_owner_station_press_document
  on public.export_packages (owner_user_id, document_id, created_at desc)
  where package_kind = 'station_press_publication'
    and document_id is not null
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
        and document_id is null
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
        and document_id is null
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
        and document_id is null
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
        and document_id is null
      )
      or (
        package_kind = 'station_press_publication'
        and persona_id is null
        and developer_space_id is null
        and project_id is null
        and document_id is not null
        and exists (
          select 1
          from public.documents d
          where d.id = document_id
          and d.author_user_id = auth.uid()
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
        and document_id is null
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
        and document_id is null
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
        and document_id is null
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
        and document_id is null
      )
      or (
        package_kind = 'station_press_publication'
        and persona_id is null
        and developer_space_id is null
        and project_id is null
        and document_id is not null
        and exists (
          select 1
          from public.documents d
          where d.id = document_id
          and d.author_user_id = auth.uid()
        )
      )
    )
  );

comment on column public.export_packages.document_id is
  'Station Press publication package target. Existing package kinds must keep this null.';

comment on constraint export_packages_kind_check on public.export_packages is
  'Allows owner-only station_press_publication packages in addition to scoped persona, Developer Space, Project, and workspace packages.';

comment on constraint export_packages_target_check on public.export_packages is
  'station_press_publication rows target one owner document; existing package kinds must keep document_id null.';
