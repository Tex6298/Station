-- ============================================================
-- PR513A cross-owner runtime attempt audit ledger
-- ============================================================

create table if not exists public.persona_encounter_cross_owner_runtime_attempts (
  id uuid primary key default gen_random_uuid(),
  consent_id uuid not null references public.persona_encounter_cross_owner_consents(id) on delete cascade,
  actor_role text not null,
  initiator_role text not null,
  responder_role text not null,
  consent_status text not null,
  requested_scope_version integer not null,
  requested_scope text not null,
  readiness_code text not null,
  lifecycle_status text not null,
  provenance_schema text not null default 'station.persona_encounter.cross_owner_runtime_attempt.v1',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint persona_encounter_cross_owner_runtime_attempt_roles_check
    check (
      actor_role in ('requester', 'counterparty')
      and initiator_role in ('requester', 'counterparty')
      and responder_role in ('requester', 'counterparty')
      and initiator_role <> responder_role
    ),
  constraint persona_encounter_cross_owner_runtime_attempt_consent_status_check
    check (consent_status in (
      'pending',
      'approved',
      'rejected',
      'cancelled',
      'revoked',
      'expired',
      'superseded',
      'blocked_by_deletion',
      'moderation_locked'
    )),
  constraint persona_encounter_cross_owner_runtime_attempt_scope_version_check
    check (requested_scope_version > 0),
  constraint persona_encounter_cross_owner_runtime_attempt_scope_check
    check (requested_scope in (
      'run_cross_owner_encounter',
      'save_private_cross_owner_artifact',
      'share_participant_metadata_between_owners',
      'publish_metadata_only_public_exhibit',
      'publish_generated_words_excerpt',
      'publish_transcript',
      'publish_generated_summary'
    )),
  constraint persona_encounter_cross_owner_runtime_attempt_readiness_code_check
    check (readiness_code ~ '^[a-z0-9_]{1,80}$'),
  constraint persona_encounter_cross_owner_runtime_attempt_lifecycle_status_check
    check (lifecycle_status in (
      'blocked_before_provider',
      'provider_succeeded',
      'provider_failed',
      'provider_empty',
      'quota_exceeded',
      'rate_limited',
      'provider_unavailable'
    )),
  constraint persona_encounter_cross_owner_runtime_attempt_schema_check
    check (provenance_schema = 'station.persona_encounter.cross_owner_runtime_attempt.v1')
);

create index if not exists idx_persona_encounter_cross_owner_runtime_attempts_consent
  on public.persona_encounter_cross_owner_runtime_attempts (consent_id, created_at desc);

create or replace function public.record_persona_encounter_cross_owner_runtime_attempt(
  p_consent_id uuid,
  p_actor_role text,
  p_initiator_role text,
  p_responder_role text,
  p_consent_status text,
  p_requested_scope_version integer,
  p_requested_scope text,
  p_readiness_code text,
  p_lifecycle_status text,
  p_completed_at timestamptz default null
)
returns public.persona_encounter_cross_owner_runtime_attempts
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_attempt public.persona_encounter_cross_owner_runtime_attempts%rowtype;
begin
  insert into public.persona_encounter_cross_owner_runtime_attempts (
    consent_id,
    actor_role,
    initiator_role,
    responder_role,
    consent_status,
    requested_scope_version,
    requested_scope,
    readiness_code,
    lifecycle_status,
    completed_at
  )
  values (
    p_consent_id,
    p_actor_role,
    p_initiator_role,
    p_responder_role,
    p_consent_status,
    p_requested_scope_version,
    p_requested_scope,
    p_readiness_code,
    p_lifecycle_status,
    p_completed_at
  )
  returning * into v_attempt;

  return v_attempt;
end;
$$;

create or replace function public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'cross-owner runtime attempts are append-only';
end;
$$;

drop trigger if exists trg_persona_encounter_cross_owner_runtime_attempts_append_only_update
  on public.persona_encounter_cross_owner_runtime_attempts;
create trigger trg_persona_encounter_cross_owner_runtime_attempts_append_only_update
  before update on public.persona_encounter_cross_owner_runtime_attempts
  for each row execute function public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation();

drop trigger if exists trg_persona_encounter_cross_owner_runtime_attempts_append_only_delete
  on public.persona_encounter_cross_owner_runtime_attempts;
create trigger trg_persona_encounter_cross_owner_runtime_attempts_append_only_delete
  before delete on public.persona_encounter_cross_owner_runtime_attempts
  for each row execute function public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation();

alter table public.persona_encounter_cross_owner_runtime_attempts enable row level security;

drop policy if exists "persona_encounter_cross_owner_runtime_attempts_select_participants"
  on public.persona_encounter_cross_owner_runtime_attempts;
create policy "persona_encounter_cross_owner_runtime_attempts_select_participants"
  on public.persona_encounter_cross_owner_runtime_attempts
  for select
  using (
    exists (
      select 1
      from public.persona_encounter_cross_owner_consents consent
      where consent.id = consent_id
        and (
          auth.uid() = consent.requester_owner_user_id
          or auth.uid() = consent.counterparty_owner_user_id
        )
    )
  );

drop policy if exists "persona_encounter_cross_owner_runtime_attempts_insert_participants"
  on public.persona_encounter_cross_owner_runtime_attempts;
-- No direct participant insert policy is created. Runtime attempts are
-- server-mediated API writes so future provider lifecycle events cannot drift
-- into best-effort audit behavior.

drop policy if exists "persona_encounter_cross_owner_runtime_attempts_update_participants"
  on public.persona_encounter_cross_owner_runtime_attempts;
drop policy if exists "persona_encounter_cross_owner_runtime_attempts_delete_participants"
  on public.persona_encounter_cross_owner_runtime_attempts;
-- No direct participant update/delete policies are created here. Attempt audit
-- rows are append-only and bounded to consent id, participant roles, status,
-- scope/version, readiness code, lifecycle status, and timestamps.

comment on table public.persona_encounter_cross_owner_runtime_attempts is
  'Append-only participant-readable cross-owner runtime attempt audit metadata. Stores consent id, participant roles, consent status, requested scope/version, readiness code, lifecycle status, and timestamps only. No prompts, generated output, provider payloads, provider keys, model config, token values, private context, raw owner ids, raw persona ids, traces, SQL details, env values, cookies, bearer values, source bodies, or secret-shaped strings.';

comment on function public.record_persona_encounter_cross_owner_runtime_attempt is
  'Server-side helper shape for future before-provider and after-provider cross-owner attempt records. It writes bounded metadata only and does not call providers, assemble prompts, record tokens, create private sessions, create public exhibits, write reports, or surface public rows.';
