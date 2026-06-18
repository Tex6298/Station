-- Native document version history alpha.
--
-- Current public/document reads continue to use public.documents. Prior
-- versions are owner-only history rows for Studio authoring, private export
-- readback, and future repository replacement work.

alter table public.documents
  add column if not exists version integer not null default 1;

alter table public.documents
  drop constraint if exists documents_version_check;

alter table public.documents
  add constraint documents_version_check check (version > 0);

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  title text not null,
  slug text not null,
  body text,
  summary text,
  document_type text not null
    check (document_type in ('essay', 'codex', 'manifesto', 'field_log', 'research', 'archive_note', 'transcript')),
  status text not null
    check (status in ('draft', 'published', 'archived')),
  visibility text not null
    check (visibility in ('private', 'unlisted', 'community', 'public', 'members')),
  comments_enabled boolean not null default true,
  space_id uuid references public.spaces(id) on delete set null,
  persona_id uuid references public.personas(id) on delete set null,
  published_at timestamptz,
  provenance_type text not null default 'user_authored'
    check (provenance_type in ('user_authored', 'ai_assisted', 'archive_import', 'integrity_session', 'persona_derived')),
  source_type text,
  source_id uuid,
  source_label text,
  source_persona_id uuid references public.personas(id) on delete set null,
  discussion_thread_id uuid references public.threads(id) on delete set null,
  document_created_at timestamptz,
  document_updated_at timestamptz,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (document_id, version_number)
);

create index if not exists idx_document_versions_owner_document_version
  on public.document_versions (owner_user_id, document_id, version_number desc);

create index if not exists idx_document_versions_document_captured
  on public.document_versions (document_id, captured_at desc);

alter table public.document_versions enable row level security;

drop policy if exists "document_versions_all_owner" on public.document_versions;
create policy "document_versions_all_owner" on public.document_versions
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

comment on table public.document_versions is
  'Owner-only snapshots of prior Station document versions. Public reads stay on public.documents current rows.';

comment on column public.documents.version is
  'Current Station document version. Incremented when versioned authoring, publication, visibility, or provenance fields change.';

comment on column public.document_versions.version_number is
  'The prior public.documents.version value captured before the current document row was updated.';
