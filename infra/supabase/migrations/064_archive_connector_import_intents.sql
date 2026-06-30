-- ============================================================
-- Archive connector import intent receipts
-- ============================================================

create table if not exists public.archive_connector_import_intents (
  id                       uuid primary key default gen_random_uuid(),
  owner_user_id            uuid not null references public.profiles (id) on delete cascade,
  persona_id               uuid not null references public.personas (id) on delete cascade,
  provider                 text not null check (provider in ('reddit', 'discord')),
  purpose                  text not null default 'archive_connector' check (purpose = 'archive_connector'),
  source_family            text not null check (source_family in ('reddit_subreddit_memberships', 'reddit_user_history', 'discord_guilds')),
  source_kind              text not null check (source_kind ~ '^[a-z0-9_-]{1,80}$'),
  source_key               text not null check (source_key ~ '^[a-f0-9]{24}$'),
  source_label             text not null check (
    char_length(source_label) between 1 and 100
    and source_label !~ '[[:cntrl:]]'
  ),
  status                   text not null default 'pending' check (status in ('pending', 'cancelled')),
  idempotency_fingerprint  text not null,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create unique index if not exists archive_connector_import_intents_fingerprint_idx
  on public.archive_connector_import_intents (idempotency_fingerprint);

create index if not exists archive_connector_import_intents_owner_provider_status_idx
  on public.archive_connector_import_intents (owner_user_id, provider, purpose, status, created_at desc);

create index if not exists archive_connector_import_intents_owner_persona_source_idx
  on public.archive_connector_import_intents (owner_user_id, persona_id, provider, source_key, status);

drop trigger if exists trg_archive_connector_import_intents_updated_at
  on public.archive_connector_import_intents;
create trigger trg_archive_connector_import_intents_updated_at
  before update on public.archive_connector_import_intents
  for each row execute function public.handle_updated_at();

alter table public.archive_connector_import_intents enable row level security;

create policy "archive_connector_import_intents_all_owner"
  on public.archive_connector_import_intents
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

comment on table public.archive_connector_import_intents is
  'Owner-scoped archive connector import confirmation receipts. Stores only safe source inventory metadata; it does not enqueue or execute imports.';

comment on column public.archive_connector_import_intents.idempotency_fingerprint is
  'Station-generated duplicate-click guard over owner, provider, persona, source key, source family, source kind, and safe source label.';
