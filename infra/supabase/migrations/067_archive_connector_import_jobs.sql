-- PR484J-K - Archive connector source staging import execution.
-- Extends the existing owner-scoped import_jobs surface with a connector kind
-- and a unique pointer to one encrypted source staging run.

alter table public.import_jobs
  drop constraint if exists import_jobs_kind_check;

alter table public.import_jobs
  add constraint import_jobs_kind_check
  check (kind in ('file', 'chat', 'archive_connector'));

alter table public.import_jobs
  add column if not exists archive_connector_source_staging_run_id uuid
    references public.archive_connector_source_staging_runs (id) on delete set null;

create unique index if not exists idx_import_jobs_archive_connector_staging_run
  on public.import_jobs (archive_connector_source_staging_run_id)
  where archive_connector_source_staging_run_id is not null;

create index if not exists idx_import_jobs_owner_archive_connector_staging_run
  on public.import_jobs (owner_user_id, archive_connector_source_staging_run_id)
  where kind = 'archive_connector'
    and archive_connector_source_staging_run_id is not null;

alter table public.archive_connector_source_staging_runs
  add column if not exists imported_at timestamptz;

alter table public.archive_connector_source_staging_runs
  drop constraint if exists archive_connector_source_staging_runs_status_check;

alter table public.archive_connector_source_staging_runs
  add constraint archive_connector_source_staging_runs_status_check
  check (status in ('staged', 'superseded', 'revoked', 'imported'));

comment on column public.import_jobs.archive_connector_source_staging_run_id is
  'Owner-scoped pointer to the encrypted archive connector source staging run consumed by a connector import job. Responses must expose only safe generic connector metadata.';

comment on column public.archive_connector_source_staging_runs.imported_at is
  'Set only after a connector staging run has written private archive chunks through import_jobs.';
