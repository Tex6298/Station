-- ============================================================
-- Observed runtime supporting context for Developer Spaces
-- ============================================================

create table if not exists public.developer_space_observed_runtime_context (
  id                    uuid primary key default gen_random_uuid(),
  developer_space_id    uuid not null references public.developer_spaces (id) on delete cascade,
  context_type          text not null check (context_type in ('zone', 'resource', 'edge', 'provenance')),
  external_id           text,
  source_ref            text,
  payload               jsonb not null default '{}',
  observed_runtime_classifications jsonb
    check (
      observed_runtime_classifications is null
      or jsonb_typeof(observed_runtime_classifications) = 'object'
    ),
  provenance            text not null default 'imported'
                          check (provenance in ('api', 'imported', 'user', 'system', 'ai_generated')),
  occurred_at           timestamptz not null default now(),
  created_at            timestamptz not null default now()
);

create index if not exists developer_space_observed_runtime_context_space_idx
  on public.developer_space_observed_runtime_context (developer_space_id, context_type, occurred_at desc);

alter table public.developer_space_observed_runtime_context enable row level security;

create policy "developer_space_observed_runtime_context_all_owner"
  on public.developer_space_observed_runtime_context
  for all using (
    exists (
      select 1 from public.developer_spaces s
      where s.id = developer_space_id
      and s.owner_user_id = auth.uid()
    )
  );

comment on table public.developer_space_observed_runtime_context is
  'Durable observed-runtime supporting context for zones, resources/economy, graph edges, and provenance. Served through the API with classification filtering.';
