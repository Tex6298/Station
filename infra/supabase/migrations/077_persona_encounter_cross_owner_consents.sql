-- ============================================================
-- PR511A cross-owner encounter consent ledger
-- ============================================================

create or replace function public.persona_encounter_cross_owner_consent_scopes_valid(scopes text[])
returns boolean
language sql
immutable
as $$
  select scopes is not null
    and cardinality(scopes) between 1 and 7
    and not exists (
      select 1
      from unnest(scopes) as scope
      where scope is null
        or scope not in (
          'run_cross_owner_encounter',
          'save_private_cross_owner_artifact',
          'share_participant_metadata_between_owners',
          'publish_metadata_only_public_exhibit',
          'publish_generated_words_excerpt',
          'publish_transcript',
          'publish_generated_summary'
        )
    );
$$;

create table if not exists public.persona_encounter_cross_owner_consents (
  id uuid primary key default gen_random_uuid(),
  requester_owner_user_id uuid not null references public.profiles(id) on delete cascade,
  requester_persona_id uuid not null references public.personas(id) on delete cascade,
  requester_persona_name_snapshot text not null,
  counterparty_owner_user_id uuid not null references public.profiles(id) on delete cascade,
  counterparty_persona_id uuid not null references public.personas(id) on delete cascade,
  counterparty_persona_name_snapshot text not null,
  status text not null default 'pending',
  requested_scopes text[] not null default array['run_cross_owner_encounter']::text[],
  requested_scope_version integer not null default 1,
  requester_approved_at timestamptz,
  counterparty_approved_at timestamptz,
  rejected_at timestamptz,
  rejected_by uuid references public.profiles(id) on delete set null,
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles(id) on delete set null,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete set null,
  expired_at timestamptz,
  superseded_at timestamptz,
  blocked_by_deletion_at timestamptz,
  moderation_locked_at timestamptz,
  reason_code text,
  provenance_schema text not null default 'station.persona_encounter.cross_owner_consent.v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint persona_encounter_cross_owner_consents_distinct_owners_check
    check (requester_owner_user_id <> counterparty_owner_user_id),
  constraint persona_encounter_cross_owner_consents_distinct_personas_check
    check (requester_persona_id <> counterparty_persona_id),
  constraint persona_encounter_cross_owner_consents_status_check
    check (status in (
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
  constraint persona_encounter_cross_owner_consents_scopes_check
    check (public.persona_encounter_cross_owner_consent_scopes_valid(requested_scopes)),
  constraint persona_encounter_cross_owner_consents_scope_version_check
    check (requested_scope_version > 0),
  constraint persona_encounter_cross_owner_consents_reason_code_check
    check (
      reason_code is null
      or reason_code in (
        'not_aligned',
        'owner_request',
        'persona_deleted',
        'account_deleted',
        'moderation_safety',
        'scope_changed',
        'expired',
        'other'
      )
    ),
  constraint persona_encounter_cross_owner_consents_schema_check
    check (provenance_schema = 'station.persona_encounter.cross_owner_consent.v1')
);

create index if not exists idx_persona_encounter_cross_owner_consents_requester
  on public.persona_encounter_cross_owner_consents (requester_owner_user_id, created_at desc);

create index if not exists idx_persona_encounter_cross_owner_consents_counterparty
  on public.persona_encounter_cross_owner_consents (counterparty_owner_user_id, created_at desc);

create index if not exists idx_persona_encounter_cross_owner_consents_pair
  on public.persona_encounter_cross_owner_consents (
    requester_persona_id,
    counterparty_persona_id,
    requested_scope_version,
    created_at desc
  );

create or replace function public.validate_persona_encounter_cross_owner_consent_participants()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.personas requester
    where requester.id = new.requester_persona_id
      and requester.owner_user_id = new.requester_owner_user_id
  ) then
    raise exception 'requester persona must belong to requester owner';
  end if;

  if not exists (
    select 1
    from public.personas counterparty
    where counterparty.id = new.counterparty_persona_id
      and counterparty.owner_user_id = new.counterparty_owner_user_id
  ) then
    raise exception 'counterparty persona must belong to counterparty owner';
  end if;

  if new.requester_owner_user_id = new.counterparty_owner_user_id then
    raise exception 'cross-owner consent requires different owners';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_persona_encounter_cross_owner_consents_validate_participants
  on public.persona_encounter_cross_owner_consents;
create trigger trg_persona_encounter_cross_owner_consents_validate_participants
  before insert or update on public.persona_encounter_cross_owner_consents
  for each row execute function public.validate_persona_encounter_cross_owner_consent_participants();

drop trigger if exists trg_persona_encounter_cross_owner_consents_updated_at
  on public.persona_encounter_cross_owner_consents;
create trigger trg_persona_encounter_cross_owner_consents_updated_at
  before update on public.persona_encounter_cross_owner_consents
  for each row execute function public.handle_updated_at();

create table if not exists public.persona_encounter_cross_owner_consent_audit_events (
  id uuid primary key default gen_random_uuid(),
  consent_id uuid not null references public.persona_encounter_cross_owner_consents(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_role text not null,
  event_type text not null,
  previous_status text,
  next_status text not null,
  requested_scopes text[] not null default array['run_cross_owner_encounter']::text[],
  reason_code text,
  created_at timestamptz not null default now(),
  constraint persona_encounter_cross_owner_consent_audit_actor_role_check
    check (actor_role in ('requester', 'counterparty', 'admin', 'system')),
  constraint persona_encounter_cross_owner_consent_audit_event_type_check
    check (event_type in (
      'invitation_created',
      'requester_approved',
      'requester_cancelled',
      'counterparty_approved',
      'counterparty_rejected',
      'participant_revoked',
      'invitation_expired',
      'scope_version_superseded',
      'persona_or_account_deletion_blocked',
      'moderation_lock_applied',
      'moderation_lock_cleared'
    )),
  constraint persona_encounter_cross_owner_consent_audit_previous_status_check
    check (
      previous_status is null
      or previous_status in (
        'pending',
        'approved',
        'rejected',
        'cancelled',
        'revoked',
        'expired',
        'superseded',
        'blocked_by_deletion',
        'moderation_locked'
      )
    ),
  constraint persona_encounter_cross_owner_consent_audit_next_status_check
    check (next_status in (
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
  constraint persona_encounter_cross_owner_consent_audit_scopes_check
    check (public.persona_encounter_cross_owner_consent_scopes_valid(requested_scopes)),
  constraint persona_encounter_cross_owner_consent_audit_reason_code_check
    check (
      reason_code is null
      or reason_code in (
        'not_aligned',
        'owner_request',
        'persona_deleted',
        'account_deleted',
        'moderation_safety',
        'scope_changed',
        'expired',
        'other'
      )
    )
);

create index if not exists idx_persona_encounter_cross_owner_consent_audit_consent
  on public.persona_encounter_cross_owner_consent_audit_events (consent_id, created_at asc);

create or replace function public.create_persona_encounter_cross_owner_consent(
  p_requester_owner_user_id uuid,
  p_requester_persona_id uuid,
  p_requester_persona_name_snapshot text,
  p_counterparty_owner_user_id uuid,
  p_counterparty_persona_id uuid,
  p_counterparty_persona_name_snapshot text,
  p_requested_scopes text[],
  p_actor_user_id uuid
)
returns public.persona_encounter_cross_owner_consents
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_consent public.persona_encounter_cross_owner_consents%rowtype;
  v_now timestamptz := now();
begin
  insert into public.persona_encounter_cross_owner_consents (
    requester_owner_user_id,
    requester_persona_id,
    requester_persona_name_snapshot,
    counterparty_owner_user_id,
    counterparty_persona_id,
    counterparty_persona_name_snapshot,
    status,
    requested_scopes,
    requested_scope_version,
    requester_approved_at,
    provenance_schema
  )
  values (
    p_requester_owner_user_id,
    p_requester_persona_id,
    p_requester_persona_name_snapshot,
    p_counterparty_owner_user_id,
    p_counterparty_persona_id,
    p_counterparty_persona_name_snapshot,
    'pending',
    coalesce(p_requested_scopes, array['run_cross_owner_encounter']::text[]),
    1,
    v_now,
    'station.persona_encounter.cross_owner_consent.v1'
  )
  returning * into v_consent;

  insert into public.persona_encounter_cross_owner_consent_audit_events (
    consent_id,
    actor_user_id,
    actor_role,
    event_type,
    previous_status,
    next_status,
    requested_scopes
  )
  values
    (
      v_consent.id,
      p_actor_user_id,
      'requester',
      'invitation_created',
      null,
      'pending',
      v_consent.requested_scopes
    ),
    (
      v_consent.id,
      p_actor_user_id,
      'requester',
      'requester_approved',
      'pending',
      'pending',
      v_consent.requested_scopes
    );

  return v_consent;
end;
$$;

create or replace function public.transition_persona_encounter_cross_owner_consent(
  p_consent_id uuid,
  p_expected_status text,
  p_next_status text,
  p_actor_user_id uuid,
  p_actor_role text,
  p_event_type text,
  p_reason_code text default null
)
returns public.persona_encounter_cross_owner_consents
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_consent public.persona_encounter_cross_owner_consents%rowtype;
  v_now timestamptz := now();
begin
  update public.persona_encounter_cross_owner_consents
  set
    status = p_next_status,
    counterparty_approved_at = case
      when p_next_status = 'approved' then v_now
      else counterparty_approved_at
    end,
    rejected_at = case
      when p_next_status = 'rejected' then v_now
      else rejected_at
    end,
    rejected_by = case
      when p_next_status = 'rejected' then p_actor_user_id
      else rejected_by
    end,
    cancelled_at = case
      when p_next_status = 'cancelled' then v_now
      else cancelled_at
    end,
    cancelled_by = case
      when p_next_status = 'cancelled' then p_actor_user_id
      else cancelled_by
    end,
    revoked_at = case
      when p_next_status = 'revoked' then v_now
      else revoked_at
    end,
    revoked_by = case
      when p_next_status = 'revoked' then p_actor_user_id
      else revoked_by
    end,
    reason_code = case
      when p_next_status in ('rejected', 'cancelled', 'revoked') then p_reason_code
      else reason_code
    end
  where id = p_consent_id
    and status = p_expected_status
  returning * into v_consent;

  if not found then
    raise exception 'cross-owner consent transition target not found';
  end if;

  insert into public.persona_encounter_cross_owner_consent_audit_events (
    consent_id,
    actor_user_id,
    actor_role,
    event_type,
    previous_status,
    next_status,
    requested_scopes,
    reason_code
  )
  values (
    v_consent.id,
    p_actor_user_id,
    p_actor_role,
    p_event_type,
    p_expected_status,
    p_next_status,
    v_consent.requested_scopes,
    p_reason_code
  );

  return v_consent;
end;
$$;

create or replace function public.prevent_persona_encounter_cross_owner_consent_audit_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'cross-owner consent audit events are append-only';
end;
$$;

drop trigger if exists trg_persona_encounter_cross_owner_consent_audit_append_only_update
  on public.persona_encounter_cross_owner_consent_audit_events;
create trigger trg_persona_encounter_cross_owner_consent_audit_append_only_update
  before update on public.persona_encounter_cross_owner_consent_audit_events
  for each row execute function public.prevent_persona_encounter_cross_owner_consent_audit_mutation();

drop trigger if exists trg_persona_encounter_cross_owner_consent_audit_append_only_delete
  on public.persona_encounter_cross_owner_consent_audit_events;
create trigger trg_persona_encounter_cross_owner_consent_audit_append_only_delete
  before delete on public.persona_encounter_cross_owner_consent_audit_events
  for each row execute function public.prevent_persona_encounter_cross_owner_consent_audit_mutation();

alter table public.persona_encounter_cross_owner_consents enable row level security;
alter table public.persona_encounter_cross_owner_consent_audit_events enable row level security;

drop policy if exists "persona_encounter_cross_owner_consents_select_participants"
  on public.persona_encounter_cross_owner_consents;
create policy "persona_encounter_cross_owner_consents_select_participants"
  on public.persona_encounter_cross_owner_consents
  for select
  using (
    auth.uid() = requester_owner_user_id
    or auth.uid() = counterparty_owner_user_id
  );

drop policy if exists "persona_encounter_cross_owner_consents_insert_requester"
  on public.persona_encounter_cross_owner_consents;
create policy "persona_encounter_cross_owner_consents_insert_requester"
  on public.persona_encounter_cross_owner_consents
  for insert
  with check (
    auth.uid() = requester_owner_user_id
    and requester_owner_user_id <> counterparty_owner_user_id
    and exists (
      select 1
      from public.personas requester
      where requester.id = requester_persona_id
        and requester.owner_user_id = auth.uid()
    )
    and exists (
      select 1
      from public.personas counterparty
      where counterparty.id = counterparty_persona_id
        and counterparty.owner_user_id = counterparty_owner_user_id
        and counterparty.owner_user_id <> auth.uid()
    )
  );

drop policy if exists "persona_encounter_cross_owner_consents_update_participants"
  on public.persona_encounter_cross_owner_consents;
-- No direct participant update/delete policy is created here. Consent state
-- transitions are mediated by the authenticated API route so each transition
-- can enforce actor role, prior status, and audit insertion together.

drop policy if exists "persona_encounter_cross_owner_consent_audit_select_participants"
  on public.persona_encounter_cross_owner_consent_audit_events;
create policy "persona_encounter_cross_owner_consent_audit_select_participants"
  on public.persona_encounter_cross_owner_consent_audit_events
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

drop policy if exists "persona_encounter_cross_owner_consent_audit_insert_participants"
  on public.persona_encounter_cross_owner_consent_audit_events;
-- No direct participant audit insert policy is created. Audit events are
-- server-owned API writes so actor identity, actor role, event type, and
-- status transition stay bounded and coupled to the consent mutation.

comment on table public.persona_encounter_cross_owner_consents is
  'Owner-scoped cross-owner persona encounter consent ledger. Approval records future requested scopes only; it does not run encounters, save artifacts, publish metadata, publish generated words, expose transcripts, expose summaries, or surface anything publicly.';

comment on table public.persona_encounter_cross_owner_consent_audit_events is
  'Append-only bounded audit events for cross-owner encounter consent ledger state changes. Events store actor role, bounded event type, status transition, scopes, and reason code only.';

comment on column public.persona_encounter_cross_owner_consents.requested_scopes is
  'Bounded requested future scope labels. In PR511A every scope remains non-executable and cannot be consumed as runtime, artifact, publication, excerpt, transcript, summary, or public-surfacing permission.';
