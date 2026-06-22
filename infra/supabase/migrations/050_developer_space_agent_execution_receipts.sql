-- ============================================================
-- Developer Space agent execution receipt harness
-- ============================================================

create table if not exists public.developer_space_agent_execution_receipts (
  id                  uuid primary key default gen_random_uuid(),
  developer_space_id  uuid not null references public.developer_spaces (id) on delete cascade,
  owner_user_id       uuid not null references public.profiles (id) on delete cascade,
  confirmation_id     uuid not null references public.developer_space_agent_confirmations (id) on delete cascade,
  action              text not null default 'request_capability'
                        check (action = 'request_capability'),
  status              text not null default 'recorded'
                        check (status = 'recorded'),
  summary             text not null,
  receipt_payload     jsonb not null default '{}',
  dispatched_at       timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint developer_space_agent_execution_receipts_confirmation_unique
    unique (confirmation_id)
);

create index if not exists developer_space_agent_execution_receipts_space_idx
  on public.developer_space_agent_execution_receipts (developer_space_id, dispatched_at desc);

create index if not exists developer_space_agent_execution_receipts_owner_idx
  on public.developer_space_agent_execution_receipts (owner_user_id, dispatched_at desc);

drop trigger if exists trg_developer_space_agent_execution_receipts_updated_at
  on public.developer_space_agent_execution_receipts;
create trigger trg_developer_space_agent_execution_receipts_updated_at
  before update on public.developer_space_agent_execution_receipts
  for each row execute function public.handle_updated_at();

alter table public.developer_space_agent_execution_receipts enable row level security;

create policy "developer_space_agent_execution_receipts_all_owner"
  on public.developer_space_agent_execution_receipts
  for all using (
    auth.uid() = owner_user_id
    and exists (
      select 1 from public.developer_spaces s
      where s.id = developer_space_id
      and s.owner_user_id = auth.uid()
    )
    and exists (
      select 1 from public.developer_space_agent_confirmations c
      where c.id = confirmation_id
      and c.developer_space_id = developer_space_id
      and c.owner_user_id = owner_user_id
      and c.action = 'request_capability'
      and c.status = 'approved'
    )
  )
  with check (
    auth.uid() = owner_user_id
    and exists (
      select 1 from public.developer_spaces s
      where s.id = developer_space_id
      and s.owner_user_id = auth.uid()
    )
    and exists (
      select 1 from public.developer_space_agent_confirmations c
      where c.id = confirmation_id
      and c.developer_space_id = developer_space_id
      and c.owner_user_id = owner_user_id
      and c.action = 'request_capability'
      and c.status = 'approved'
    )
  );

comment on table public.developer_space_agent_execution_receipts is
  'Owner-scoped inert Developer Agent receipts. PR169 records approved request_capability intent only; receipts do not execute tools or mutate external targets.';

comment on column public.developer_space_agent_execution_receipts.receipt_payload is
  'Sanitized route-generated receipt facts. Do not store prompts, raw payloads, ids for display, provider data, keys, signing material, logs, cookies, tokens, environment values, or private owner content.';
