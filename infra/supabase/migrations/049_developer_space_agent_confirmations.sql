-- ============================================================
-- Developer Space agent confirmation envelopes
-- ============================================================

create table if not exists public.developer_space_agent_confirmations (
  id                  uuid primary key default gen_random_uuid(),
  developer_space_id  uuid not null references public.developer_spaces (id) on delete cascade,
  owner_user_id       uuid not null references public.profiles (id) on delete cascade,
  action              text not null check (action in (
    'publish_to_page',
    'update_layout',
    'read_logs',
    'push_to_repo',
    'run_job',
    'update_observatory',
    'request_capability',
    'rotate_ingestion_key',
    'create_webhook_signing_secret'
  )),
  status              text not null default 'pending' check (status in ('pending', 'approved', 'cancelled', 'expired')),
  summary             text not null,
  preview_hash        text not null,
  sanitized_payload   jsonb not null default '{}',
  requested_at        timestamptz not null default now(),
  expires_at          timestamptz not null,
  approved_at         timestamptz,
  cancelled_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists developer_space_agent_confirmations_space_status_idx
  on public.developer_space_agent_confirmations (developer_space_id, status, requested_at desc);

create index if not exists developer_space_agent_confirmations_owner_idx
  on public.developer_space_agent_confirmations (owner_user_id, requested_at desc);

drop trigger if exists trg_developer_space_agent_confirmations_updated_at
  on public.developer_space_agent_confirmations;
create trigger trg_developer_space_agent_confirmations_updated_at
  before update on public.developer_space_agent_confirmations
  for each row execute function public.handle_updated_at();

alter table public.developer_space_agent_confirmations enable row level security;

create policy "developer_space_agent_confirmations_all_owner"
  on public.developer_space_agent_confirmations
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

comment on table public.developer_space_agent_confirmations is
  'Owner-scoped confirmation envelopes for future Developer Space agent actions. Approved records capture owner intent only; this table does not execute or mutate actions.';

comment on column public.developer_space_agent_confirmations.sanitized_payload is
  'Sanitized route-generated labels/status/facts for audit. Do not store prompts, raw response bodies, metrics blobs, event payloads, source refs, document bodies, keys, signing material, provider payloads, logs, cookies, tokens, or environment values.';
