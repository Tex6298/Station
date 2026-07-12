-- ============================================================
-- PR522 cross-owner private generated artifacts and approvals
-- ============================================================

create table if not exists public.persona_encounter_cross_owner_generated_artifacts (
  id uuid primary key default gen_random_uuid(),
  consent_id uuid not null references public.persona_encounter_cross_owner_consents(id) on delete cascade,
  requester_owner_user_id uuid not null references public.profiles(id) on delete cascade,
  requester_persona_id uuid not null references public.personas(id) on delete cascade,
  requester_persona_name_snapshot text not null,
  counterparty_owner_user_id uuid not null references public.profiles(id) on delete cascade,
  counterparty_persona_id uuid not null references public.personas(id) on delete cascade,
  counterparty_persona_name_snapshot text not null,
  artifact_slug text not null unique,
  private_title text not null,
  private_body text not null,
  private_excerpt text,
  generated_content_digest text not null,
  lifecycle_status text not null default 'active',
  contract_version integer not null default 1,
  provenance_schema text not null default 'station.persona_encounter.cross_owner_private_generated_artifact.v1',
  retracted_at timestamptz,
  revoked_at timestamptz,
  deleted_at timestamptz,
  moderation_blocked_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pe_co_generated_artifacts_distinct_owners_check
    check (requester_owner_user_id <> counterparty_owner_user_id),
  constraint pe_co_generated_artifacts_distinct_personas_check
    check (requester_persona_id <> counterparty_persona_id),
  constraint pe_co_generated_artifacts_slug_check
    check (artifact_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]{8}$'),
  constraint pe_co_generated_artifacts_title_length_check
    check (char_length(btrim(private_title)) between 1 and 140),
  constraint pe_co_generated_artifacts_body_length_check
    check (char_length(btrim(private_body)) between 1 and 8000),
  constraint pe_co_generated_artifacts_excerpt_length_check
    check (private_excerpt is null or char_length(btrim(private_excerpt)) between 1 and 1000),
  constraint pe_co_generated_artifacts_digest_check
    check (generated_content_digest ~ '^[a-f0-9]{64}$'),
  constraint pe_co_generated_artifacts_lifecycle_check
    check (lifecycle_status in ('active', 'retracted', 'revoked', 'deleted', 'moderation_blocked')),
  constraint pe_co_generated_artifacts_contract_version_check
    check (contract_version = 1),
  constraint pe_co_generated_artifacts_schema_check
    check (provenance_schema = 'station.persona_encounter.cross_owner_private_generated_artifact.v1')
);

create table if not exists public.persona_encounter_cross_owner_generated_revisions (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.persona_encounter_cross_owner_generated_artifacts(id) on delete cascade,
  consent_id uuid not null references public.persona_encounter_cross_owner_consents(id) on delete cascade,
  revision_slug text not null unique,
  final_title text not null,
  final_body text not null,
  final_excerpt text,
  text_digest text not null,
  source_artifact_digest text not null,
  requester_persona_name_snapshot text not null,
  counterparty_persona_name_snapshot text not null,
  consent_requested_scope_version integer not null,
  consent_requested_scopes text[] not null default '{}'::text[],
  status text not null default 'proposed',
  contract_version integer not null default 1,
  approval_contract_version integer not null default 1,
  provenance_schema text not null default 'station.persona_encounter.cross_owner_generated_revision.v1',
  proposed_at timestamptz not null default now(),
  approved_at timestamptz,
  retracted_at timestamptz,
  revoked_at timestamptz,
  deleted_at timestamptz,
  moderation_blocked_at timestamptz,
  invalidated_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pe_co_generated_revisions_slug_check
    check (revision_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]{8}$'),
  constraint pe_co_generated_revisions_title_length_check
    check (char_length(btrim(final_title)) between 1 and 140),
  constraint pe_co_generated_revisions_body_length_check
    check (char_length(btrim(final_body)) between 1 and 8000),
  constraint pe_co_generated_revisions_excerpt_length_check
    check (final_excerpt is null or char_length(btrim(final_excerpt)) between 1 and 1000),
  constraint pe_co_generated_revisions_text_digest_check
    check (text_digest ~ '^[a-f0-9]{64}$'),
  constraint pe_co_generated_revisions_source_digest_check
    check (source_artifact_digest ~ '^[a-f0-9]{64}$'),
  constraint pe_co_generated_revisions_status_check
    check (status in ('proposed', 'approved', 'retracted', 'revoked', 'deleted', 'moderation_blocked', 'invalidated')),
  constraint pe_co_generated_revisions_contract_version_check
    check (contract_version = 1 and approval_contract_version = 1),
  constraint pe_co_generated_revisions_schema_check
    check (provenance_schema = 'station.persona_encounter.cross_owner_generated_revision.v1')
);

create table if not exists public.persona_encounter_cross_owner_generated_revision_approvals (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.persona_encounter_cross_owner_generated_revisions(id) on delete cascade,
  artifact_id uuid not null references public.persona_encounter_cross_owner_generated_artifacts(id) on delete cascade,
  consent_id uuid not null references public.persona_encounter_cross_owner_consents(id) on delete cascade,
  participant_role text not null,
  approver_owner_user_id uuid not null references public.profiles(id) on delete cascade,
  revision_digest text not null,
  approval_contract_version integer not null default 1,
  approved_at timestamptz not null default now(),
  constraint pe_co_generated_approvals_role_check
    check (participant_role in ('requester', 'counterparty')),
  constraint pe_co_generated_approvals_digest_check
    check (revision_digest ~ '^[a-f0-9]{64}$'),
  constraint pe_co_generated_approvals_contract_version_check
    check (approval_contract_version = 1)
);

create unique index if not exists idx_pe_co_generated_approvals_exact_role
  on public.persona_encounter_cross_owner_generated_revision_approvals
  (revision_id, participant_role, revision_digest);

create index if not exists idx_pe_co_generated_artifacts_consent_created
  on public.persona_encounter_cross_owner_generated_artifacts (consent_id, created_at desc);

create index if not exists idx_pe_co_generated_artifacts_requester
  on public.persona_encounter_cross_owner_generated_artifacts (requester_owner_user_id, created_at desc);

create index if not exists idx_pe_co_generated_artifacts_counterparty
  on public.persona_encounter_cross_owner_generated_artifacts (counterparty_owner_user_id, created_at desc);

create index if not exists idx_pe_co_generated_revisions_artifact_created
  on public.persona_encounter_cross_owner_generated_revisions (artifact_id, created_at desc);

create or replace function public.validate_persona_encounter_cross_owner_generated_artifact()
returns trigger
language plpgsql
as $$
declare
  v_consent public.persona_encounter_cross_owner_consents%rowtype;
begin
  select *
  into v_consent
  from public.persona_encounter_cross_owner_consents
  where id = new.consent_id;

  if not found then
    raise exception 'cross-owner generated artifact consent not found';
  end if;

  if v_consent.status <> 'approved'
    or v_consent.requested_scope_version <> 1
    or not ('save_private_cross_owner_artifact' = any(v_consent.requested_scopes))
  then
    raise exception 'cross-owner private generated artifact requires active approved private artifact consent';
  end if;

  if new.requester_owner_user_id <> v_consent.requester_owner_user_id
    or new.requester_persona_id <> v_consent.requester_persona_id
    or new.counterparty_owner_user_id <> v_consent.counterparty_owner_user_id
    or new.counterparty_persona_id <> v_consent.counterparty_persona_id
  then
    raise exception 'cross-owner generated artifact participants must match consent';
  end if;

  if new.requester_persona_name_snapshot <> v_consent.requester_persona_name_snapshot
    or new.counterparty_persona_name_snapshot <> v_consent.counterparty_persona_name_snapshot
  then
    raise exception 'cross-owner generated artifact display snapshots must match consent';
  end if;

  return new;
end;
$$;

drop trigger if exists pe_co_generated_artifacts_validate
  on public.persona_encounter_cross_owner_generated_artifacts;
create trigger pe_co_generated_artifacts_validate
  before insert or update on public.persona_encounter_cross_owner_generated_artifacts
  for each row execute function public.validate_persona_encounter_cross_owner_generated_artifact();

drop trigger if exists pe_co_generated_artifacts_updated_at
  on public.persona_encounter_cross_owner_generated_artifacts;
create trigger pe_co_generated_artifacts_updated_at
  before update on public.persona_encounter_cross_owner_generated_artifacts
  for each row execute function public.handle_updated_at();

drop trigger if exists pe_co_generated_revisions_updated_at
  on public.persona_encounter_cross_owner_generated_revisions;
create trigger pe_co_generated_revisions_updated_at
  before update on public.persona_encounter_cross_owner_generated_revisions
  for each row execute function public.handle_updated_at();

create or replace function public.prevent_persona_encounter_cross_owner_generated_approval_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'cross-owner generated revision approvals are append-only';
end;
$$;

drop trigger if exists pe_co_generated_approvals_no_update
  on public.persona_encounter_cross_owner_generated_revision_approvals;
create trigger pe_co_generated_approvals_no_update
  before update on public.persona_encounter_cross_owner_generated_revision_approvals
  for each row execute function public.prevent_persona_encounter_cross_owner_generated_approval_mutation();

drop trigger if exists pe_co_generated_approvals_no_delete
  on public.persona_encounter_cross_owner_generated_revision_approvals;
create trigger pe_co_generated_approvals_no_delete
  before delete on public.persona_encounter_cross_owner_generated_revision_approvals
  for each row execute function public.prevent_persona_encounter_cross_owner_generated_approval_mutation();

create or replace function public.revoke_cross_owner_generated_artifacts_on_consent_inactive()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'approved' and new.status <> 'approved' then
    update public.persona_encounter_cross_owner_generated_artifacts
    set
      lifecycle_status = 'revoked',
      revoked_at = coalesce(revoked_at, now()),
      updated_at = now()
    where consent_id = new.id
      and lifecycle_status in ('active', 'retracted');

    update public.persona_encounter_cross_owner_generated_revisions
    set
      status = 'revoked',
      revoked_at = coalesce(revoked_at, now()),
      updated_at = now()
    where consent_id = new.id
      and status in ('proposed', 'approved');
  end if;

  return new;
end;
$$;

drop trigger if exists pe_co_generated_artifacts_revoke_on_consent
  on public.persona_encounter_cross_owner_consents;
create trigger pe_co_generated_artifacts_revoke_on_consent
  after update of status on public.persona_encounter_cross_owner_consents
  for each row execute function public.revoke_cross_owner_generated_artifacts_on_consent_inactive();

alter table public.persona_encounter_cross_owner_generated_artifacts enable row level security;
alter table public.persona_encounter_cross_owner_generated_revisions enable row level security;
alter table public.persona_encounter_cross_owner_generated_revision_approvals enable row level security;

drop policy if exists "pe_co_generated_artifacts_select_participants"
  on public.persona_encounter_cross_owner_generated_artifacts;
create policy "pe_co_generated_artifacts_select_participants"
  on public.persona_encounter_cross_owner_generated_artifacts
  for select
  using (
    auth.uid() = requester_owner_user_id
    or auth.uid() = counterparty_owner_user_id
  );

drop policy if exists "pe_co_generated_revisions_select_participants"
  on public.persona_encounter_cross_owner_generated_revisions;
create policy "pe_co_generated_revisions_select_participants"
  on public.persona_encounter_cross_owner_generated_revisions
  for select
  using (
    exists (
      select 1
      from public.persona_encounter_cross_owner_generated_artifacts artifact
      where artifact.id = artifact_id
        and (
          auth.uid() = artifact.requester_owner_user_id
          or auth.uid() = artifact.counterparty_owner_user_id
        )
    )
  );

drop policy if exists "pe_co_generated_approvals_select_participants"
  on public.persona_encounter_cross_owner_generated_revision_approvals;
create policy "pe_co_generated_approvals_select_participants"
  on public.persona_encounter_cross_owner_generated_revision_approvals
  for select
  using (
    exists (
      select 1
      from public.persona_encounter_cross_owner_generated_artifacts artifact
      where artifact.id = artifact_id
        and (
          auth.uid() = artifact.requester_owner_user_id
          or auth.uid() = artifact.counterparty_owner_user_id
        )
    )
  );

drop policy if exists "pe_co_generated_artifacts_insert_participants"
  on public.persona_encounter_cross_owner_generated_artifacts;
drop policy if exists "pe_co_generated_artifacts_update_participants"
  on public.persona_encounter_cross_owner_generated_artifacts;
drop policy if exists "pe_co_generated_artifacts_delete_participants"
  on public.persona_encounter_cross_owner_generated_artifacts;
drop policy if exists "pe_co_generated_revisions_insert_participants"
  on public.persona_encounter_cross_owner_generated_revisions;
drop policy if exists "pe_co_generated_revisions_update_participants"
  on public.persona_encounter_cross_owner_generated_revisions;
drop policy if exists "pe_co_generated_revisions_delete_participants"
  on public.persona_encounter_cross_owner_generated_revisions;
drop policy if exists "pe_co_generated_approvals_insert_participants"
  on public.persona_encounter_cross_owner_generated_revision_approvals;
drop policy if exists "pe_co_generated_approvals_update_participants"
  on public.persona_encounter_cross_owner_generated_revision_approvals;
drop policy if exists "pe_co_generated_approvals_delete_participants"
  on public.persona_encounter_cross_owner_generated_revision_approvals;
-- No direct participant insert/update/delete policy is created. Private
-- generated artifacts, exact-text revisions, and approval rows are
-- server-mediated so participant identity, lifecycle, exact digest approval,
-- and consent scope/version stay coupled.

comment on table public.persona_encounter_cross_owner_generated_artifacts is
  'Participant-only private generated cross-owner encounter artifacts. No public select policy, public generated-material route, PR516 automatic reuse, prompts, provider payloads, retrieval bodies, token facts, raw owner ids in public output, raw persona ids in public output, SQL details, env values, cookies, bearer values, or secret-shaped values are exposed.';

comment on table public.persona_encounter_cross_owner_generated_revisions is
  'Private exact final-text proposals for future generated cross-owner publication. Bilateral approval is keyed to immutable text_digest and source_artifact_digest; approval resets when text, source artifact, participant snapshots, consent scope/version, or lifecycle changes.';

comment on table public.persona_encounter_cross_owner_generated_revision_approvals is
  'Append-only participant approval ledger for exact private generated revisions. This table is not a public publication surface and contains no generated public route, transcript, prompt, provider payload, retrieval body, token fact, or public generated body text.';
