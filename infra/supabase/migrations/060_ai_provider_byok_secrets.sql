-- ============================================================
-- Owner AI provider BYOK encrypted secrets
-- ============================================================

create table if not exists public.ai_provider_byok_secrets (
  id                uuid primary key default gen_random_uuid(),
  owner_user_id     uuid not null references public.profiles (id) on delete cascade,
  provider          text not null check (provider in ('openai', 'anthropic', 'deepseek')),
  encrypted_key     jsonb not null,
  key_fingerprint   text not null,
  key_last_four     text not null,
  status            text not null default 'active' check (status in ('active', 'revoked')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  rotated_at        timestamptz,
  revoked_at        timestamptz
);

create unique index if not exists ai_provider_byok_secrets_owner_provider_active_idx
  on public.ai_provider_byok_secrets (owner_user_id, provider)
  where status = 'active';

create index if not exists ai_provider_byok_secrets_owner_provider_status_idx
  on public.ai_provider_byok_secrets (owner_user_id, provider, status, created_at desc);

drop trigger if exists trg_ai_provider_byok_secrets_updated_at
  on public.ai_provider_byok_secrets;
create trigger trg_ai_provider_byok_secrets_updated_at
  before update on public.ai_provider_byok_secrets
  for each row execute function public.handle_updated_at();

alter table public.ai_provider_byok_secrets enable row level security;

create policy "ai_provider_byok_secrets_all_owner"
  on public.ai_provider_byok_secrets
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

comment on table public.ai_provider_byok_secrets is
  'Owner-scoped encrypted BYOK AI provider keys for OpenAI, Anthropic, and DeepSeek. Raw keys are decrypted only server-side for owner BYOK runtime calls.';
