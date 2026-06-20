-- ============================================================
-- Observed runtime webhook idempotency receipts
-- ============================================================

create table if not exists public.developer_space_observed_runtime_webhook_receipts (
  id                  uuid primary key default gen_random_uuid(),
  developer_space_id  uuid not null references public.developer_spaces (id) on delete cascade,
  webhook_id          text not null,
  payload_hash        text not null,
  response_body       jsonb not null default '{}',
  created_at          timestamptz not null default now(),
  unique (developer_space_id, webhook_id)
);

create index if not exists developer_space_observed_runtime_webhook_receipts_space_idx
  on public.developer_space_observed_runtime_webhook_receipts (developer_space_id, created_at desc);

alter table public.developer_space_observed_runtime_webhook_receipts enable row level security;

create policy "developer_space_observed_runtime_webhook_receipts_all_owner"
  on public.developer_space_observed_runtime_webhook_receipts
  for all using (
    exists (
      select 1 from public.developer_spaces s
      where s.id = developer_space_id
      and s.owner_user_id = auth.uid()
    )
  );

comment on table public.developer_space_observed_runtime_webhook_receipts is
  'Idempotency receipts for observed-runtime webhook alpha deliveries. Stores payload hashes and non-secret response summaries, not raw webhook bodies.';
