-- ============================================================
-- PR-13 Developer Space linked documents
-- Bounded relation for methodology, findings, field logs, and notes.
-- ============================================================

create table if not exists public.developer_space_documents (
  id uuid primary key default gen_random_uuid(),
  developer_space_id uuid not null references public.developer_spaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  document_role text not null default 'note',
  link_visibility text not null default 'owner',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (developer_space_id, document_id),
  constraint developer_space_documents_role_check
    check (document_role in ('methodology', 'finding', 'field_log', 'note')),
  constraint developer_space_documents_visibility_check
    check (link_visibility in ('owner', 'public'))
);

create index if not exists idx_developer_space_documents_space
  on public.developer_space_documents (developer_space_id, sort_order, created_at);

create index if not exists idx_developer_space_documents_owner
  on public.developer_space_documents (owner_user_id, created_at desc);

create index if not exists idx_developer_space_documents_document
  on public.developer_space_documents (document_id);

drop trigger if exists trg_developer_space_documents_updated_at
  on public.developer_space_documents;

create trigger trg_developer_space_documents_updated_at
  before update on public.developer_space_documents
  for each row execute function public.handle_updated_at();

comment on table public.developer_space_documents is
  'Bounded PR-13 relation from Developer Spaces to Station documents for methodology, findings, field logs, and owner/public notes.';

comment on column public.developer_space_documents.link_visibility is
  'owner links appear only to the Developer Space owner/admin; public links still require the linked document to be published and public before visitor serialization.';
