-- ============================================================
-- Public persona aggregate interaction counters
-- ============================================================
--
-- PR213 deliberately stores owner/persona/day aggregate counts only. It must
-- not become a raw public interaction event log: no visitor ids, reporter ids,
-- message text, model responses, provider traces, IP addresses, user agents, or
-- device/location metadata belong here.

create table if not exists public.public_persona_interaction_counters (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  persona_id uuid not null references public.personas(id) on delete cascade,
  bucket_date date not null,
  chat_attempt_count bigint not null default 0 check (chat_attempt_count >= 0),
  chat_success_count bigint not null default 0 check (chat_success_count >= 0),
  chat_failure_count bigint not null default 0 check (chat_failure_count >= 0),
  report_created_count bigint not null default 0 check (report_created_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (persona_id, bucket_date)
);

create index if not exists idx_public_persona_interaction_counters_owner_date
  on public.public_persona_interaction_counters (owner_user_id, bucket_date desc);

create index if not exists idx_public_persona_interaction_counters_persona_date
  on public.public_persona_interaction_counters (persona_id, bucket_date desc);

drop trigger if exists trg_public_persona_interaction_counters_updated_at
  on public.public_persona_interaction_counters;

create trigger trg_public_persona_interaction_counters_updated_at
  before update on public.public_persona_interaction_counters
  for each row execute function public.handle_updated_at();

alter table public.public_persona_interaction_counters enable row level security;

drop policy if exists "public_persona_interaction_counters_all_owner"
  on public.public_persona_interaction_counters;

create policy "public_persona_interaction_counters_all_owner"
  on public.public_persona_interaction_counters
  for all
  using (
    auth.uid() = owner_user_id
    and exists (
      select 1
      from public.personas p
      where p.id = persona_id
      and p.owner_user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = owner_user_id
    and exists (
      select 1
      from public.personas p
      where p.id = persona_id
      and p.owner_user_id = auth.uid()
    )
  );

create or replace function public.increment_public_persona_interaction_counters(
  p_owner_user_id uuid,
  p_persona_id uuid,
  p_bucket_date date default null,
  p_chat_attempt_delta integer default 0,
  p_chat_success_delta integer default 0,
  p_chat_failure_delta integer default 0,
  p_report_created_delta integer default 0
)
returns public.public_persona_interaction_counters
language plpgsql
security definer
set search_path = public
as $$
declare
  counter_row public.public_persona_interaction_counters;
  safe_bucket_date date := coalesce(p_bucket_date, (now() at time zone 'utc')::date);
  safe_chat_attempt_delta bigint := greatest(0, coalesce(p_chat_attempt_delta, 0));
  safe_chat_success_delta bigint := greatest(0, coalesce(p_chat_success_delta, 0));
  safe_chat_failure_delta bigint := greatest(0, coalesce(p_chat_failure_delta, 0));
  safe_report_created_delta bigint := greatest(0, coalesce(p_report_created_delta, 0));
begin
  insert into public.public_persona_interaction_counters (
    owner_user_id,
    persona_id,
    bucket_date,
    chat_attempt_count,
    chat_success_count,
    chat_failure_count,
    report_created_count
  )
  values (
    p_owner_user_id,
    p_persona_id,
    safe_bucket_date,
    safe_chat_attempt_delta,
    safe_chat_success_delta,
    safe_chat_failure_delta,
    safe_report_created_delta
  )
  on conflict (persona_id, bucket_date) do update
  set chat_attempt_count = public.public_persona_interaction_counters.chat_attempt_count + excluded.chat_attempt_count,
      chat_success_count = public.public_persona_interaction_counters.chat_success_count + excluded.chat_success_count,
      chat_failure_count = public.public_persona_interaction_counters.chat_failure_count + excluded.chat_failure_count,
      report_created_count = public.public_persona_interaction_counters.report_created_count + excluded.report_created_count,
      updated_at = now()
  returning * into counter_row;

  return counter_row;
end;
$$;

revoke all on function public.increment_public_persona_interaction_counters(
  uuid,
  uuid,
  date,
  integer,
  integer,
  integer,
  integer
) from public;

grant execute on function public.increment_public_persona_interaction_counters(
  uuid,
  uuid,
  date,
  integer,
  integer,
  integer,
  integer
) to service_role;

comment on table public.public_persona_interaction_counters is
  'PR213 owner/persona/day aggregate public persona counters only. No raw public event log, visitor identity, reporter identity, transcript text, provider trace, IP, user-agent, device, or location data.';

comment on function public.increment_public_persona_interaction_counters(
  uuid,
  uuid,
  date,
  integer,
  integer,
  integer,
  integer
) is
  'Atomically increments PR213 aggregate public persona counters for one owner/persona/day bucket.';
