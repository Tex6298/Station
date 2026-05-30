-- ============================================================
-- PR-02 Schema baseline alignment
-- Core persistence foundation for auth, repository, and continuity work.
-- ============================================================

-- This migration is intentionally schema/types groundwork only. It does not
-- change API behavior, wire auth, or move routes off local/test doubles.

-- ============================================================
-- MODERATION REPORTS
-- Align the persistent report table with the existing report-route payload.
-- ============================================================
alter table public.moderation_reports
  add column if not exists notes text,
  add column if not exists reviewed_at timestamptz;

alter table public.moderation_reports
  drop constraint if exists moderation_reports_target_type_check;

alter table public.moderation_reports
  add constraint moderation_reports_target_type_check
  check (target_type in ('user', 'space', 'document', 'thread', 'comment', 'persona'));

alter table public.moderation_reports
  drop constraint if exists moderation_reports_status_check;

update public.moderation_reports
set status = 'resolved'
where status in ('reviewed', 'actioned');

alter table public.moderation_reports
  add constraint moderation_reports_status_check
  check (status in ('open', 'reviewing', 'resolved', 'dismissed'));

create index if not exists idx_moderation_reports_reporter_status
  on public.moderation_reports (reporter_id, status, created_at desc);

-- ============================================================
-- CONTINUITY RECORDS
-- Canonical owner-scoped continuity timeline/source ledger.
-- Existing specialized tables remain canonical for their records; this table
-- gives PR-05/PR-07 a stable persistence seam for cross-source continuity views.
-- ============================================================
create table if not exists public.continuity_records (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  persona_id uuid references public.personas (id) on delete cascade,
  record_type text not null check (
    record_type in (
      'memory',
      'canon',
      'integrity',
      'archive_file',
      'archive_import',
      'archived_chat',
      'candidate',
      'publication',
      'timeline'
    )
  ),
  title text,
  body text,
  summary text,
  source_table text,
  source_id uuid,
  source_label text,
  visibility text not null default 'private'
    check (visibility in ('private', 'community', 'public')),
  version integer not null default 1 check (version > 0),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_continuity_records_owner_persona_time
  on public.continuity_records (owner_user_id, persona_id, created_at desc);

create index if not exists idx_continuity_records_type_time
  on public.continuity_records (record_type, created_at desc);

drop trigger if exists trg_continuity_records_updated_at on public.continuity_records;
create trigger trg_continuity_records_updated_at
  before update on public.continuity_records
  for each row execute function public.handle_updated_at();

alter table public.continuity_records enable row level security;

drop policy if exists "continuity_records_all_owner" on public.continuity_records;
create policy "continuity_records_all_owner" on public.continuity_records
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

-- RLS intention: public/community continuity views should be exposed through
-- API serializers or future SQL views that omit private source material.

-- ============================================================
-- DEVELOPER SPACE INGESTION KEYS
-- Dedicated key table for future rotation/revocation while retaining the
-- current single-key columns on developer_spaces for existing routes.
-- ============================================================
create table if not exists public.developer_space_ingestion_keys (
  id uuid primary key default gen_random_uuid(),
  developer_space_id uuid not null references public.developer_spaces (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  key_hash text not null unique,
  key_last_four text not null,
  label text,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists idx_developer_space_ingestion_keys_space_status
  on public.developer_space_ingestion_keys (developer_space_id, status, created_at desc);

create index if not exists idx_developer_space_ingestion_keys_owner
  on public.developer_space_ingestion_keys (owner_user_id, created_at desc);

create unique index if not exists idx_developer_spaces_api_key_hash
  on public.developer_spaces (api_key_hash)
  where api_key_hash is not null;

drop trigger if exists trg_developer_space_ingestion_keys_updated_at on public.developer_space_ingestion_keys;
create trigger trg_developer_space_ingestion_keys_updated_at
  before update on public.developer_space_ingestion_keys
  for each row execute function public.handle_updated_at();

alter table public.developer_space_ingestion_keys enable row level security;

drop policy if exists "developer_space_ingestion_keys_all_owner" on public.developer_space_ingestion_keys;
create policy "developer_space_ingestion_keys_all_owner" on public.developer_space_ingestion_keys
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

-- RLS intention: key hashes stay owner/server-only. Ingestion should continue
-- through the Express API, which authenticates keys and serializes safe data.

-- ============================================================
-- CORE ACCESS INDEXES
-- These indexes support the repository replacement work without changing route
-- behavior now.
-- ============================================================
create index if not exists idx_personas_owner_created
  on public.personas (owner_user_id, created_at desc);

create index if not exists idx_conversations_owner_persona_status
  on public.conversations (owner_user_id, persona_id, status, updated_at desc);

create index if not exists idx_conversation_messages_conversation_time
  on public.conversation_messages (conversation_id, created_at asc);

create index if not exists idx_memory_items_owner_persona_time
  on public.memory_items (owner_user_id, persona_id, created_at desc);

create index if not exists idx_canon_items_owner_persona_priority
  on public.canon_items (owner_user_id, persona_id, priority desc, created_at desc);

create index if not exists idx_persona_files_owner_persona_time
  on public.persona_files (owner_user_id, persona_id, created_at desc);

create index if not exists idx_import_jobs_owner_persona_status
  on public.import_jobs (owner_user_id, persona_id, status, created_at desc);

create index if not exists idx_calibration_sessions_owner_persona_time
  on public.calibration_sessions (owner_user_id, persona_id, updated_at desc);

create index if not exists idx_spaces_owner_created
  on public.spaces (owner_user_id, created_at desc);

create index if not exists idx_space_pages_space_sort
  on public.space_pages (space_id, sort_order asc);

create index if not exists idx_documents_author_status_time
  on public.documents (author_user_id, status, updated_at desc);

create index if not exists idx_documents_space_visibility_time
  on public.documents (space_id, visibility, published_at desc);

create index if not exists idx_threads_category_visibility_time
  on public.threads (category_id, visibility, created_at desc);

create index if not exists idx_comments_parent_time
  on public.comments (parent_type, parent_id, created_at asc);

create index if not exists idx_discover_feed_item
  on public.discover_feed (item_type, item_id);

create index if not exists idx_social_posts_user_created
  on public.social_posts (user_id, created_at desc);

comment on table public.continuity_records is
  'Owner-scoped continuity ledger for cross-source timelines and future repository-backed continuity views.';

comment on table public.developer_space_ingestion_keys is
  'Server/owner-only Developer Space ingestion key hashes for future rotation and revocation.';
