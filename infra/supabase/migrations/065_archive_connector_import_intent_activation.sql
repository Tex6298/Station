-- ============================================================
-- Archive connector import intent activation receipts
-- ============================================================

alter table public.archive_connector_import_intents
  add column if not exists activated_at timestamptz;

alter table public.archive_connector_import_intents
  drop constraint if exists archive_connector_import_intents_status_check;

alter table public.archive_connector_import_intents
  add constraint archive_connector_import_intents_status_check
  check (status in ('pending', 'cancelled', 'activated'));

create index if not exists archive_connector_import_intents_owner_activated_idx
  on public.archive_connector_import_intents (owner_user_id, provider, purpose, activated_at desc)
  where status = 'activated';

comment on column public.archive_connector_import_intents.activated_at is
  'Timestamp for owner-confirmed activation receipts. Activation does not imply source-body reads, archive source writes, import job writes, queue work, or import execution.';
