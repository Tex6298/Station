-- ============================================================
-- Developer Space observed-runtime webhook signing secrets
-- ============================================================

create table if not exists public.developer_space_webhook_signing_secrets (
  id                  uuid primary key default gen_random_uuid(),
  developer_space_id  uuid not null references public.developer_spaces (id) on delete cascade,
  owner_user_id       uuid not null references public.profiles (id) on delete cascade,
  encrypted_secret    jsonb not null,
  secret_hash         text not null unique,
  secret_fingerprint  text not null,
  secret_last_four    text not null,
  status              text not null default 'active' check (status in ('active', 'revoked')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  last_used_at        timestamptz,
  revoked_at          timestamptz
);

create index if not exists developer_space_webhook_signing_secrets_space_status_idx
  on public.developer_space_webhook_signing_secrets (developer_space_id, status, created_at desc);

create index if not exists developer_space_webhook_signing_secrets_owner_idx
  on public.developer_space_webhook_signing_secrets (owner_user_id, created_at desc);

drop trigger if exists trg_developer_space_webhook_signing_secrets_updated_at
  on public.developer_space_webhook_signing_secrets;
create trigger trg_developer_space_webhook_signing_secrets_updated_at
  before update on public.developer_space_webhook_signing_secrets
  for each row execute function public.handle_updated_at();

alter table public.developer_space_webhook_signing_secrets enable row level security;

create policy "developer_space_webhook_signing_secrets_all_owner"
  on public.developer_space_webhook_signing_secrets
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

comment on table public.developer_space_webhook_signing_secrets is
  'Owner-scoped observed-runtime webhook signing secrets. Stores encrypted signing material plus hash/fingerprint metadata; plaintext secrets are returned only on create/rotate.';
