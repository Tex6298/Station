-- ============================================================
-- Archive connector encrypted private source staging runs
-- ============================================================

create table if not exists public.archive_connector_source_staging_runs (
  id                           uuid primary key default gen_random_uuid(),
  owner_user_id                uuid not null references public.profiles (id) on delete cascade,
  persona_id                   uuid not null references public.personas (id) on delete cascade,
  import_intent_id             uuid not null references public.archive_connector_import_intents (id) on delete cascade,
  provider                     text not null check (provider = 'reddit'),
  purpose                      text not null default 'archive_connector' check (purpose = 'archive_connector'),
  source_family                text not null check (source_family = 'reddit_user_history'),
  source_kind                  text not null check (source_kind = 'saved_items'),
  source_key                   text not null check (source_key ~ '^[a-f0-9]{24}$'),
  source_label                 text not null check (
    char_length(source_label) between 1 and 100
    and source_label !~ '[[:cntrl:]]'
  ),
  status                       text not null default 'staged' check (status in ('staged', 'superseded', 'revoked')),
  page_limit                   integer not null check (page_limit = 10),
  item_count                   integer not null check (item_count between 0 and 10),
  post_count                   integer not null check (post_count between 0 and 10),
  comment_count                integer not null check (comment_count between 0 and 10),
  skipped_count                integer not null check (skipped_count between 0 and 10),
  truncated                    boolean not null,
  source_snapshot_fingerprint  text not null,
  encrypted_source_batch       jsonb not null,
  source_read_at               timestamptz not null,
  expires_at                   timestamptz not null,
  superseded_at                timestamptz,
  revoked_at                   timestamptz,
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now()
);

create unique index if not exists archive_connector_source_staging_runs_snapshot_idx
  on public.archive_connector_source_staging_runs (owner_user_id, import_intent_id, source_snapshot_fingerprint)
  where status = 'staged';

create index if not exists archive_connector_source_staging_runs_owner_intent_status_idx
  on public.archive_connector_source_staging_runs (owner_user_id, import_intent_id, status, expires_at desc);

create index if not exists archive_connector_source_staging_runs_owner_provider_idx
  on public.archive_connector_source_staging_runs (owner_user_id, provider, purpose, created_at desc);

drop trigger if exists trg_archive_connector_source_staging_runs_updated_at
  on public.archive_connector_source_staging_runs;
create trigger trg_archive_connector_source_staging_runs_updated_at
  before update on public.archive_connector_source_staging_runs
  for each row execute function public.handle_updated_at();

alter table public.archive_connector_source_staging_runs enable row level security;

create policy "archive_connector_source_staging_runs_all_owner"
  on public.archive_connector_source_staging_runs
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

comment on table public.archive_connector_source_staging_runs is
  'Owner-scoped encrypted ephemeral archive connector source staging runs. Private source data is stored only inside encrypted_source_batch. This is not archive source storage, import execution, queue work, or public document creation.';

comment on column public.archive_connector_source_staging_runs.encrypted_source_batch is
  'AES-GCM encrypted source staging batch envelope. Must not contain raw provider payloads, raw ids, URLs, authors, subreddit names, provider headers, tokens, SQL details, stack traces, or plaintext public readback.';

comment on column public.archive_connector_source_staging_runs.source_snapshot_fingerprint is
  'Station-generated keyed digest for duplicate owner staging clicks. It is not a raw hash over source text or raw provider identifiers.';

comment on column public.archive_connector_source_staging_runs.expires_at is
  'Expiry for ephemeral private source staging. Expired rows are not eligible for idempotent reuse or future import consumption.';
