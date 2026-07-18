-- ============================================================
-- PR524A cross-owner generated material public detail contract
-- ============================================================

create table if not exists public.persona_encounter_cross_owner_generated_publications (
  id uuid primary key default gen_random_uuid(),
  consent_id uuid not null references public.persona_encounter_cross_owner_consents(id) on delete cascade,
  artifact_id uuid not null references public.persona_encounter_cross_owner_generated_artifacts(id) on delete cascade,
  revision_id uuid not null references public.persona_encounter_cross_owner_generated_revisions(id) on delete cascade,
  requester_owner_user_id uuid not null references public.profiles(id) on delete cascade,
  requester_persona_id uuid not null references public.personas(id) on delete cascade,
  requester_persona_name_snapshot text not null,
  counterparty_owner_user_id uuid not null references public.profiles(id) on delete cascade,
  counterparty_persona_id uuid not null references public.personas(id) on delete cascade,
  counterparty_persona_name_snapshot text not null,
  public_slug text not null unique,
  public_title text not null,
  public_body text not null,
  public_excerpt text,
  revision_digest text not null,
  source_artifact_digest text not null,
  status text not null default 'published',
  private_artifact_contract_version integer not null default 1,
  revision_contract_version integer not null default 1,
  approval_contract_version integer not null default 1,
  publication_contract_version integer not null default 1,
  provenance_schema text not null default 'station.persona_encounter.cross_owner_generated_publication.v1',
  reported_count integer not null default 0,
  published_at timestamptz not null default now(),
  retracted_at timestamptz,
  revoked_at timestamptz,
  source_invalidated_at timestamptz,
  removed_at timestamptz,
  removed_by uuid references public.profiles(id) on delete set null,
  restored_at timestamptz,
  restored_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pe_co_generated_publications_distinct_owners_check
    check (requester_owner_user_id <> counterparty_owner_user_id),
  constraint pe_co_generated_publications_distinct_personas_check
    check (requester_persona_id <> counterparty_persona_id),
  constraint pe_co_generated_publications_slug_check
    check (public_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]{8}$'),
  constraint pe_co_generated_publications_title_length_check
    check (char_length(btrim(public_title)) between 1 and 140),
  constraint pe_co_generated_publications_body_length_check
    check (char_length(btrim(public_body)) between 1 and 8000),
  constraint pe_co_generated_publications_excerpt_length_check
    check (public_excerpt is null or char_length(btrim(public_excerpt)) between 1 and 1000),
  constraint pe_co_generated_publications_revision_digest_check
    check (revision_digest ~ '^[a-f0-9]{64}$'),
  constraint pe_co_generated_publications_source_digest_check
    check (source_artifact_digest ~ '^[a-f0-9]{64}$'),
  constraint pe_co_generated_publications_status_check
    check (status in ('published', 'retracted', 'revoked', 'source_invalidated', 'removed', 'deleted')),
  constraint pe_co_generated_publications_versions_check
    check (
      private_artifact_contract_version = 1
      and revision_contract_version = 1
      and approval_contract_version = 1
      and publication_contract_version = 1
    ),
  constraint pe_co_generated_publications_schema_check
    check (provenance_schema = 'station.persona_encounter.cross_owner_generated_publication.v1')
);

create table if not exists public.persona_encounter_cross_owner_generated_publication_audits (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.persona_encounter_cross_owner_generated_publications(id) on delete cascade,
  consent_id uuid not null references public.persona_encounter_cross_owner_consents(id) on delete cascade,
  artifact_id uuid not null references public.persona_encounter_cross_owner_generated_artifacts(id) on delete cascade,
  revision_id uuid not null references public.persona_encounter_cross_owner_generated_revisions(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_role text not null,
  event_type text not null,
  previous_status text,
  next_status text,
  revision_digest text not null,
  source_artifact_digest text not null,
  publication_contract_version integer not null default 1,
  created_at timestamptz not null default now(),
  constraint pe_co_generated_publication_audit_actor_role_check
    check (actor_role in ('requester', 'counterparty', 'admin', 'system', 'public')),
  constraint pe_co_generated_publication_audit_event_type_check
    check (event_type in (
      'published',
      'retracted',
      'revoked',
      'source_invalidated',
      'moderation_removed',
      'moderation_restored',
      'deleted',
      'blocked_public_read'
    )),
  constraint pe_co_generated_publication_audit_revision_digest_check
    check (revision_digest ~ '^[a-f0-9]{64}$'),
  constraint pe_co_generated_publication_audit_source_digest_check
    check (source_artifact_digest ~ '^[a-f0-9]{64}$'),
  constraint pe_co_generated_publication_audit_contract_version_check
    check (publication_contract_version = 1)
);

create unique index if not exists idx_pe_co_generated_publications_revision_active
  on public.persona_encounter_cross_owner_generated_publications (revision_id)
  where status in ('published', 'removed');

create index if not exists idx_pe_co_generated_publications_public_slug
  on public.persona_encounter_cross_owner_generated_publications (public_slug)
  where status = 'published' and removed_at is null and retracted_at is null and deleted_at is null;

create index if not exists idx_pe_co_generated_publications_requester
  on public.persona_encounter_cross_owner_generated_publications (requester_owner_user_id, created_at desc);

create index if not exists idx_pe_co_generated_publications_counterparty
  on public.persona_encounter_cross_owner_generated_publications (counterparty_owner_user_id, created_at desc);

create index if not exists idx_pe_co_generated_publications_consent
  on public.persona_encounter_cross_owner_generated_publications (consent_id, created_at desc);

create index if not exists idx_pe_co_generated_publications_artifact
  on public.persona_encounter_cross_owner_generated_publications (artifact_id, created_at desc);

create index if not exists idx_pe_co_generated_publications_revision
  on public.persona_encounter_cross_owner_generated_publications (revision_id, created_at desc);

create index if not exists idx_pe_co_generated_publications_moderation
  on public.persona_encounter_cross_owner_generated_publications (status, reported_count, created_at desc);

create index if not exists idx_pe_co_generated_publication_audit_publication
  on public.persona_encounter_cross_owner_generated_publication_audits (publication_id, created_at desc);

create or replace function public.prevent_cross_owner_generated_publication_audit_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'cross-owner generated publication audit events are append-only';
end;
$$;

drop trigger if exists pe_co_generated_publication_audit_no_update
  on public.persona_encounter_cross_owner_generated_publication_audits;
create trigger pe_co_generated_publication_audit_no_update
  before update on public.persona_encounter_cross_owner_generated_publication_audits
  for each row execute function public.prevent_cross_owner_generated_publication_audit_mutation();

drop trigger if exists pe_co_generated_publication_audit_no_delete
  on public.persona_encounter_cross_owner_generated_publication_audits;
create trigger pe_co_generated_publication_audit_no_delete
  before delete on public.persona_encounter_cross_owner_generated_publication_audits
  for each row execute function public.prevent_cross_owner_generated_publication_audit_mutation();

drop trigger if exists pe_co_generated_publications_updated_at
  on public.persona_encounter_cross_owner_generated_publications;
create trigger pe_co_generated_publications_updated_at
  before update on public.persona_encounter_cross_owner_generated_publications
  for each row execute function public.handle_updated_at();

create or replace function public.revoke_generated_publications_on_consent_inactive()
returns trigger
language plpgsql
as $$
declare
  v_publication public.persona_encounter_cross_owner_generated_publications%rowtype;
begin
  if old.status = 'approved' and new.status <> 'approved' then
    for v_publication in
      select *
      from public.persona_encounter_cross_owner_generated_publications
      where consent_id = new.id
        and status in ('published', 'removed')
    loop
      update public.persona_encounter_cross_owner_generated_publications
      set
        status = 'revoked',
        revoked_at = coalesce(revoked_at, now()),
        updated_at = now()
      where id = v_publication.id;

      insert into public.persona_encounter_cross_owner_generated_publication_audits (
        publication_id,
        consent_id,
        artifact_id,
        revision_id,
        actor_user_id,
        actor_role,
        event_type,
        previous_status,
        next_status,
        revision_digest,
        source_artifact_digest,
        publication_contract_version
      ) values (
        v_publication.id,
        v_publication.consent_id,
        v_publication.artifact_id,
        v_publication.revision_id,
        null,
        'system',
        'revoked',
        v_publication.status,
        'revoked',
        v_publication.revision_digest,
        v_publication.source_artifact_digest,
        v_publication.publication_contract_version
      );
    end loop;
  end if;

  return new;
end;
$$;

drop trigger if exists pe_co_generated_publications_revoke_on_consent
  on public.persona_encounter_cross_owner_consents;
create trigger pe_co_generated_publications_revoke_on_consent
  after update of status on public.persona_encounter_cross_owner_consents
  for each row execute function public.revoke_generated_publications_on_consent_inactive();

create or replace function public.invalidate_generated_publications_on_source_artifact()
returns trigger
language plpgsql
as $$
declare
  v_publication public.persona_encounter_cross_owner_generated_publications%rowtype;
begin
  if new.lifecycle_status <> 'active' then
    for v_publication in
      select *
      from public.persona_encounter_cross_owner_generated_publications
      where artifact_id = new.id
        and status in ('published', 'removed')
    loop
      update public.persona_encounter_cross_owner_generated_publications
      set
        status = 'source_invalidated',
        source_invalidated_at = coalesce(source_invalidated_at, now()),
        updated_at = now()
      where id = v_publication.id;

      insert into public.persona_encounter_cross_owner_generated_publication_audits (
        publication_id,
        consent_id,
        artifact_id,
        revision_id,
        actor_user_id,
        actor_role,
        event_type,
        previous_status,
        next_status,
        revision_digest,
        source_artifact_digest,
        publication_contract_version
      ) values (
        v_publication.id,
        v_publication.consent_id,
        v_publication.artifact_id,
        v_publication.revision_id,
        null,
        'system',
        'source_invalidated',
        v_publication.status,
        'source_invalidated',
        v_publication.revision_digest,
        v_publication.source_artifact_digest,
        v_publication.publication_contract_version
      );
    end loop;
  end if;

  return new;
end;
$$;

drop trigger if exists pe_co_generated_publications_invalidate_on_artifact
  on public.persona_encounter_cross_owner_generated_artifacts;
create trigger pe_co_generated_publications_invalidate_on_artifact
  after update of lifecycle_status on public.persona_encounter_cross_owner_generated_artifacts
  for each row execute function public.invalidate_generated_publications_on_source_artifact();

create or replace function public.invalidate_generated_publications_on_revision()
returns trigger
language plpgsql
as $$
declare
  v_publication public.persona_encounter_cross_owner_generated_publications%rowtype;
begin
  if new.status <> 'approved' then
    for v_publication in
      select *
      from public.persona_encounter_cross_owner_generated_publications
      where revision_id = new.id
        and status in ('published', 'removed')
    loop
      update public.persona_encounter_cross_owner_generated_publications
      set
        status = 'source_invalidated',
        source_invalidated_at = coalesce(source_invalidated_at, now()),
        updated_at = now()
      where id = v_publication.id;

      insert into public.persona_encounter_cross_owner_generated_publication_audits (
        publication_id,
        consent_id,
        artifact_id,
        revision_id,
        actor_user_id,
        actor_role,
        event_type,
        previous_status,
        next_status,
        revision_digest,
        source_artifact_digest,
        publication_contract_version
      ) values (
        v_publication.id,
        v_publication.consent_id,
        v_publication.artifact_id,
        v_publication.revision_id,
        null,
        'system',
        'source_invalidated',
        v_publication.status,
        'source_invalidated',
        v_publication.revision_digest,
        v_publication.source_artifact_digest,
        v_publication.publication_contract_version
      );
    end loop;
  end if;

  return new;
end;
$$;

drop trigger if exists pe_co_generated_publications_invalidate_on_revision
  on public.persona_encounter_cross_owner_generated_revisions;
create trigger pe_co_generated_publications_invalidate_on_revision
  after update of status on public.persona_encounter_cross_owner_generated_revisions
  for each row execute function public.invalidate_generated_publications_on_revision();

alter table public.persona_encounter_cross_owner_generated_publications enable row level security;
alter table public.persona_encounter_cross_owner_generated_publication_audits enable row level security;

drop policy if exists "pe_co_generated_publications_select_public"
  on public.persona_encounter_cross_owner_generated_publications;
create policy "pe_co_generated_publications_select_public"
  on public.persona_encounter_cross_owner_generated_publications
  for select
  using (
    status = 'published'
    and removed_at is null
    and retracted_at is null
    and deleted_at is null
    and exists (
      select 1
      from public.persona_encounter_cross_owner_consents consent
      where consent.id = persona_encounter_cross_owner_generated_publications.consent_id
        and consent.status = 'approved'
        and consent.requested_scope_version = 1
        and 'save_private_cross_owner_artifact' = any(consent.requested_scopes)
        and 'publish_exact_generated_revision' = any(consent.requested_scopes)
        and consent.requester_owner_user_id = persona_encounter_cross_owner_generated_publications.requester_owner_user_id
        and consent.requester_persona_id = persona_encounter_cross_owner_generated_publications.requester_persona_id
        and consent.counterparty_owner_user_id = persona_encounter_cross_owner_generated_publications.counterparty_owner_user_id
        and consent.counterparty_persona_id = persona_encounter_cross_owner_generated_publications.counterparty_persona_id
        and consent.requester_persona_name_snapshot = persona_encounter_cross_owner_generated_publications.requester_persona_name_snapshot
        and consent.counterparty_persona_name_snapshot = persona_encounter_cross_owner_generated_publications.counterparty_persona_name_snapshot
    )
    and exists (
      select 1
      from public.persona_encounter_cross_owner_generated_artifacts artifact
      where artifact.id = persona_encounter_cross_owner_generated_publications.artifact_id
        and artifact.consent_id = persona_encounter_cross_owner_generated_publications.consent_id
        and artifact.lifecycle_status = 'active'
        and artifact.generated_content_digest = persona_encounter_cross_owner_generated_publications.source_artifact_digest
        and artifact.contract_version = persona_encounter_cross_owner_generated_publications.private_artifact_contract_version
        and artifact.provenance_schema = 'station.persona_encounter.cross_owner_private_generated_artifact.v1'
        and artifact.requester_owner_user_id = persona_encounter_cross_owner_generated_publications.requester_owner_user_id
        and artifact.requester_persona_id = persona_encounter_cross_owner_generated_publications.requester_persona_id
        and artifact.counterparty_owner_user_id = persona_encounter_cross_owner_generated_publications.counterparty_owner_user_id
        and artifact.counterparty_persona_id = persona_encounter_cross_owner_generated_publications.counterparty_persona_id
        and artifact.requester_persona_name_snapshot = persona_encounter_cross_owner_generated_publications.requester_persona_name_snapshot
        and artifact.counterparty_persona_name_snapshot = persona_encounter_cross_owner_generated_publications.counterparty_persona_name_snapshot
    )
    and exists (
      select 1
      from public.persona_encounter_cross_owner_generated_revisions revision
      where revision.id = persona_encounter_cross_owner_generated_publications.revision_id
        and revision.artifact_id = persona_encounter_cross_owner_generated_publications.artifact_id
        and revision.consent_id = persona_encounter_cross_owner_generated_publications.consent_id
        and revision.status = 'approved'
        and revision.text_digest = persona_encounter_cross_owner_generated_publications.revision_digest
        and revision.source_artifact_digest = persona_encounter_cross_owner_generated_publications.source_artifact_digest
        and revision.final_title = persona_encounter_cross_owner_generated_publications.public_title
        and revision.final_body = persona_encounter_cross_owner_generated_publications.public_body
        and revision.final_excerpt is not distinct from persona_encounter_cross_owner_generated_publications.public_excerpt
        and revision.consent_requested_scope_version = 1
        and 'save_private_cross_owner_artifact' = any(revision.consent_requested_scopes)
        and 'publish_exact_generated_revision' = any(revision.consent_requested_scopes)
        and revision.contract_version = persona_encounter_cross_owner_generated_publications.revision_contract_version
        and revision.approval_contract_version = persona_encounter_cross_owner_generated_publications.approval_contract_version
        and revision.provenance_schema = 'station.persona_encounter.cross_owner_generated_revision.v1'
        and revision.requester_persona_name_snapshot = persona_encounter_cross_owner_generated_publications.requester_persona_name_snapshot
        and revision.counterparty_persona_name_snapshot = persona_encounter_cross_owner_generated_publications.counterparty_persona_name_snapshot
    )
    and exists (
      select 1
      from public.persona_encounter_cross_owner_generated_revision_approvals requester_approval
      where requester_approval.revision_id = persona_encounter_cross_owner_generated_publications.revision_id
        and requester_approval.artifact_id = persona_encounter_cross_owner_generated_publications.artifact_id
        and requester_approval.consent_id = persona_encounter_cross_owner_generated_publications.consent_id
        and requester_approval.participant_role = 'requester'
        and requester_approval.approver_owner_user_id = persona_encounter_cross_owner_generated_publications.requester_owner_user_id
        and requester_approval.revision_digest = persona_encounter_cross_owner_generated_publications.revision_digest
        and requester_approval.approval_contract_version = persona_encounter_cross_owner_generated_publications.approval_contract_version
    )
    and exists (
      select 1
      from public.persona_encounter_cross_owner_generated_revision_approvals counterparty_approval
      where counterparty_approval.revision_id = persona_encounter_cross_owner_generated_publications.revision_id
        and counterparty_approval.artifact_id = persona_encounter_cross_owner_generated_publications.artifact_id
        and counterparty_approval.consent_id = persona_encounter_cross_owner_generated_publications.consent_id
        and counterparty_approval.participant_role = 'counterparty'
        and counterparty_approval.approver_owner_user_id = persona_encounter_cross_owner_generated_publications.counterparty_owner_user_id
        and counterparty_approval.revision_digest = persona_encounter_cross_owner_generated_publications.revision_digest
        and counterparty_approval.approval_contract_version = persona_encounter_cross_owner_generated_publications.approval_contract_version
    )
  );

drop policy if exists "pe_co_generated_publications_select_participants"
  on public.persona_encounter_cross_owner_generated_publications;

drop policy if exists "pe_co_generated_publication_audit_select_participants"
  on public.persona_encounter_cross_owner_generated_publication_audits;
create policy "pe_co_generated_publication_audit_select_participants"
  on public.persona_encounter_cross_owner_generated_publication_audits
  for select
  using (
    exists (
      select 1
      from public.persona_encounter_cross_owner_generated_publications publication
      where publication.id = publication_id
        and publication.status = 'published'
        and (
          auth.uid() = publication.requester_owner_user_id
          or auth.uid() = publication.counterparty_owner_user_id
        )
    )
  );

drop policy if exists "pe_co_generated_publications_insert_participants"
  on public.persona_encounter_cross_owner_generated_publications;
drop policy if exists "pe_co_generated_publications_update_participants"
  on public.persona_encounter_cross_owner_generated_publications;
drop policy if exists "pe_co_generated_publications_delete_participants"
  on public.persona_encounter_cross_owner_generated_publications;
drop policy if exists "pe_co_generated_publication_audit_insert_participants"
  on public.persona_encounter_cross_owner_generated_publication_audits;
drop policy if exists "pe_co_generated_publication_audit_update_participants"
  on public.persona_encounter_cross_owner_generated_publication_audits;
drop policy if exists "pe_co_generated_publication_audit_delete_participants"
  on public.persona_encounter_cross_owner_generated_publication_audits;
-- Writes and participant controls are server-mediated. Direct public reads are
-- limited to currently published rows; inactive public rows and audit events do
-- not expose body text.

comment on table public.persona_encounter_cross_owner_generated_publications is
  'Dedicated PR524A detail-only public generated material table. Public body text is copied server-side only from an active PR522 exact approved revision with bilateral approval. No list, Discover, Space, forum, writing, homepage, public persona linkback, PR516 direct publication, provider payload, retrieval body, prompt, token fact, raw owner id, raw persona id, env value, cookie, bearer value, or secret-shaped value is exposed.';

comment on table public.persona_encounter_cross_owner_generated_publication_audits is
  'Append-only PR524A audit ledger for generated publication publish, retract, revoke cascade, source invalidation, moderation remove/restore, delete, and blocked public read events. It stores digests and lifecycle metadata only, not generated body text.';
