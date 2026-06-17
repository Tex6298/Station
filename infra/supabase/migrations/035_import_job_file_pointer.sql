-- PR16 - Durable uploaded-file import job pointer.
-- File import jobs can be claimed by job id without relying on route-local file state.

alter table public.import_jobs
  add column if not exists file_id uuid references public.persona_files (id) on delete set null;

create index if not exists idx_import_jobs_owner_persona_file
  on public.import_jobs (owner_user_id, persona_id, file_id)
  where kind = 'file';

create index if not exists idx_import_jobs_file_id
  on public.import_jobs (file_id)
  where file_id is not null;
