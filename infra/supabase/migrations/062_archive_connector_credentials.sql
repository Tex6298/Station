-- ============================================================
-- Owner archive connector credentials and OAuth state
-- ============================================================

create table if not exists public.archive_connector_credentials (
  id                            uuid primary key default gen_random_uuid(),
  owner_user_id                 uuid not null references public.profiles (id) on delete cascade,
  provider                      text not null check (provider in ('reddit', 'discord')),
  purpose                       text not null default 'archive_connector' check (purpose = 'archive_connector'),
  encrypted_credential          jsonb not null,
  credential_fingerprint        text not null,
  external_account_fingerprint  text,
  account_label                 text,
  status                        text not null default 'active' check (status in ('active', 'revoked')),
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),
  rotated_at                    timestamptz,
  revoked_at                    timestamptz
);

create unique index if not exists archive_connector_credentials_owner_provider_active_idx
  on public.archive_connector_credentials (owner_user_id, provider, purpose)
  where status = 'active';

create index if not exists archive_connector_credentials_owner_provider_status_idx
  on public.archive_connector_credentials (owner_user_id, provider, purpose, status, created_at desc);

drop trigger if exists trg_archive_connector_credentials_updated_at
  on public.archive_connector_credentials;
create trigger trg_archive_connector_credentials_updated_at
  before update on public.archive_connector_credentials
  for each row execute function public.handle_updated_at();

alter table public.archive_connector_credentials enable row level security;

create policy "archive_connector_credentials_all_owner"
  on public.archive_connector_credentials
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

comment on table public.archive_connector_credentials is
  'Owner-scoped encrypted archive connector credentials for Reddit and Discord. Raw credential material is never stored outside encrypted_credential.';

create table if not exists public.archive_connector_oauth_states (
  id                   uuid primary key default gen_random_uuid(),
  owner_user_id        uuid not null references public.profiles (id) on delete cascade,
  session_id_hash      text not null,
  provider             text not null check (provider in ('reddit', 'discord')),
  purpose              text not null default 'archive_connector' check (purpose = 'archive_connector'),
  nonce_hash           text not null unique,
  csrf_hash            text not null,
  local_redirect_path  text,
  expires_at           timestamptz not null,
  consumed_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  check (
    local_redirect_path is null
    or (
      left(local_redirect_path, 1) = '/'
      and left(local_redirect_path, 2) <> '//'
    )
  )
);

create index if not exists archive_connector_oauth_states_owner_provider_idx
  on public.archive_connector_oauth_states (owner_user_id, provider, purpose, expires_at desc);

create index if not exists archive_connector_oauth_states_nonce_status_idx
  on public.archive_connector_oauth_states (nonce_hash, consumed_at, expires_at);

drop trigger if exists trg_archive_connector_oauth_states_updated_at
  on public.archive_connector_oauth_states;
create trigger trg_archive_connector_oauth_states_updated_at
  before update on public.archive_connector_oauth_states
  for each row execute function public.handle_updated_at();

alter table public.archive_connector_oauth_states enable row level security;

create policy "archive_connector_oauth_states_all_owner"
  on public.archive_connector_oauth_states
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

comment on table public.archive_connector_oauth_states is
  'Owner/session-bound one-time OAuth state records for future archive connector OAuth. Stores session, nonce, and csrf hashes plus local redirect paths only, never callback codes or tokens.';
