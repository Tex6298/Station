-- ============================================================
-- PR500A Social connector credential storage contract
-- ============================================================

create table if not exists public.social_connector_credentials (
  id                      uuid primary key default gen_random_uuid(),
  owner_user_id           uuid not null references public.profiles (id) on delete cascade,
  provider                text not null check (provider in ('bluesky')),
  purpose                 text not null default 'social_connector' check (purpose = 'social_connector'),
  credential_category     text not null default 'manual_credential' check (credential_category = 'manual_credential'),
  encrypted_credential    jsonb not null,
  credential_fingerprint  text not null,
  status                  text not null default 'active' check (status in ('active', 'revoked')),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  rotated_at              timestamptz,
  revoked_at              timestamptz
);

create unique index if not exists social_connector_credentials_owner_provider_active_idx
  on public.social_connector_credentials (owner_user_id, provider, purpose)
  where status = 'active';

create index if not exists social_connector_credentials_owner_provider_status_idx
  on public.social_connector_credentials (owner_user_id, provider, purpose, status, created_at desc);

drop trigger if exists trg_social_connector_credentials_updated_at
  on public.social_connector_credentials;
create trigger trg_social_connector_credentials_updated_at
  before update on public.social_connector_credentials
  for each row execute function public.handle_updated_at();

alter table public.social_connector_credentials enable row level security;

create policy "social_connector_credentials_all_owner"
  on public.social_connector_credentials
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

comment on table public.social_connector_credentials is
  'Owner-scoped encrypted social connector credentials. Separate from legacy social publishing tables; raw credential material stays inside encrypted_credential.';

comment on column public.social_connector_credentials.encrypted_credential is
  'AES-256-GCM envelope for social connector credential material using SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY.';
