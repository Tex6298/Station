-- ============================================================
-- AI observability traces
-- ============================================================

create table if not exists public.ai_trace_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  persona_id uuid references public.personas(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  source text not null check (source in ('conversation', 'integrity_session', 'continuity', 'system', 'topup')),
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  total_input_tokens integer not null default 0 check (total_input_tokens >= 0),
  total_output_tokens integer not null default 0 check (total_output_tokens >= 0),
  total_estimated_cost_pence numeric(12, 4) not null default 0 check (total_estimated_cost_pence >= 0),
  error_message text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.ai_trace_events (
  id uuid primary key default gen_random_uuid(),
  trace_id uuid not null references public.ai_trace_sessions(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check (event_type in ('llm_call', 'tool_call', 'integrity_turn', 'quota_check', 'error', 'output_write')),
  label text not null,
  status text not null default 'completed' check (status in ('running', 'completed', 'failed', 'skipped')),
  provider text,
  model text,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  estimated_cost_pence numeric(12, 4) not null default 0 check (estimated_cost_pence >= 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_trace_sessions_owner_started
  on public.ai_trace_sessions (owner_user_id, started_at desc);

create index if not exists idx_ai_trace_sessions_owner_status
  on public.ai_trace_sessions (owner_user_id, status, started_at desc);

create index if not exists idx_ai_trace_events_trace_created
  on public.ai_trace_events (trace_id, created_at asc);

create index if not exists idx_ai_trace_events_owner_created
  on public.ai_trace_events (owner_user_id, created_at desc);

alter table public.ai_trace_sessions enable row level security;
alter table public.ai_trace_events enable row level security;

drop policy if exists "ai_trace_sessions_all_owner"
  on public.ai_trace_sessions;

create policy "ai_trace_sessions_all_owner"
  on public.ai_trace_sessions
  for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "ai_trace_events_all_owner"
  on public.ai_trace_events;

create policy "ai_trace_events_all_owner"
  on public.ai_trace_events
  for all
  using (
    auth.uid() = owner_user_id
    and exists (
      select 1
      from public.ai_trace_sessions s
      where s.id = trace_id
      and s.owner_user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = owner_user_id
    and exists (
      select 1
      from public.ai_trace_sessions s
      where s.id = trace_id
      and s.owner_user_id = auth.uid()
    )
  );

comment on table public.ai_trace_sessions is
  'Per-user AI operation traces for chat, integrity sessions, continuity work, token/cost inspection, and debugging.';

comment on table public.ai_trace_events is
  'Child events for AI traces, including LLM calls, tool calls, quota checks, generated outputs, latency, token counts, and cost estimates.';
