-- ============================================================
-- PR-07 Continuity Alpha data model alignment
-- Source/version metadata for the owner-scoped continuity ledger.
-- ============================================================

alter table public.continuity_records
  add column if not exists source_version integer not null default 1;

alter table public.continuity_records
  drop constraint if exists continuity_records_source_version_check;

alter table public.continuity_records
  add constraint continuity_records_source_version_check
  check (source_version > 0);

create index if not exists idx_continuity_records_owner_source
  on public.continuity_records (owner_user_id, source_table, source_id);

comment on table public.continuity_records is
  'Owner-scoped Continuity Alpha ledger for timeline items, source links, source versions, persona context, and future publication candidates.';

comment on column public.continuity_records.version is
  'Version of the continuity record snapshot.';

comment on column public.continuity_records.source_version is
  'Version of the linked source artifact when Station knows it.';
