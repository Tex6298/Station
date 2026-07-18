-- ============================================================
-- PR532A append-only parent-cascade cleanup repair
-- ============================================================

begin;

select pg_advisory_xact_lock(
  hashtextextended('station.pr532a.append_only_parent_cascade_cleanup.088', 0)
);

do $pr532a_preflight$
declare
  edge record;
  child_oid oid;
  parent_oid oid;
begin
  if pg_catalog.to_regprocedure(
    'public.prevent_persona_encounter_cross_owner_consent_audit_mutation()'
  ) is null
    or pg_catalog.to_regprocedure(
      'public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation()'
    ) is null
    or pg_catalog.to_regprocedure(
      'public.prevent_persona_encounter_cross_owner_generated_approval_mutation()'
    ) is null
    or pg_catalog.to_regprocedure(
      'public.prevent_cross_owner_generated_publication_audit_mutation()'
    ) is null
  then
    raise exception 'PR532A expected all four append-only trigger functions before migration 088';
  end if;

  for edge in
    select *
    from (
      values
        ('persona_encounter_cross_owner_consent_audit_events', 'persona_encounter_cross_owner_consents'),
        ('persona_encounter_cross_owner_runtime_attempts', 'persona_encounter_cross_owner_consents'),
        ('persona_encounter_cross_owner_generated_revision_approvals', 'persona_encounter_cross_owner_generated_revisions'),
        ('persona_encounter_cross_owner_generated_revision_approvals', 'persona_encounter_cross_owner_generated_artifacts'),
        ('persona_encounter_cross_owner_generated_revision_approvals', 'persona_encounter_cross_owner_consents'),
        ('persona_encounter_cross_owner_generated_revision_approvals', 'profiles'),
        ('persona_encounter_cross_owner_generated_publication_audits', 'persona_encounter_cross_owner_generated_publications'),
        ('persona_encounter_cross_owner_generated_publication_audits', 'persona_encounter_cross_owner_consents'),
        ('persona_encounter_cross_owner_generated_publication_audits', 'persona_encounter_cross_owner_generated_artifacts'),
        ('persona_encounter_cross_owner_generated_publication_audits', 'persona_encounter_cross_owner_generated_revisions')
    ) as expected_edges(child_table, parent_table)
  loop
    child_oid := pg_catalog.to_regclass('public.' || edge.child_table);
    parent_oid := pg_catalog.to_regclass('public.' || edge.parent_table);

    if child_oid is null or parent_oid is null then
      raise exception 'PR532A expected cascade edge %.% -> %.%',
        'public', edge.child_table, 'public', edge.parent_table;
    end if;

    if not exists (
      select 1
      from pg_catalog.pg_constraint constraint_row
      where constraint_row.contype = 'f'
        and constraint_row.conrelid = child_oid
        and constraint_row.confrelid = parent_oid
        and constraint_row.confdeltype = 'c'
    ) then
      raise exception 'PR532A expected ON DELETE CASCADE from % to %',
        edge.child_table, edge.parent_table;
    end if;
  end loop;
end;
$pr532a_preflight$;

create or replace function public.prevent_persona_encounter_cross_owner_consent_audit_mutation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
set row_security = off
as $consent_audit_guard$
begin
  if tg_op = 'DELETE'
    and not exists (
      select 1
      from public.persona_encounter_cross_owner_consents consent
      where consent.id = old.consent_id
    )
  then
    return old;
  end if;

  raise exception 'cross-owner consent audit events are append-only';
end;
$consent_audit_guard$;

comment on function public.prevent_persona_encounter_cross_owner_consent_audit_mutation() is
  'Blocks direct update/delete of consent audit events. Allows DELETE only after the owning consent is absent during an FK parent cascade.';

create or replace function public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
set row_security = off
as $runtime_attempt_guard$
begin
  if tg_op = 'DELETE'
    and not exists (
      select 1
      from public.persona_encounter_cross_owner_consents consent
      where consent.id = old.consent_id
    )
  then
    return old;
  end if;

  raise exception 'cross-owner runtime attempts are append-only';
end;
$runtime_attempt_guard$;

comment on function public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation() is
  'Blocks direct update/delete of runtime attempt audit rows. Allows DELETE only after the owning consent is absent during an FK parent cascade.';

create or replace function public.prevent_persona_encounter_cross_owner_generated_approval_mutation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
set row_security = off
as $generated_approval_guard$
begin
  if tg_op = 'DELETE'
    and (
      not exists (
        select 1
        from public.persona_encounter_cross_owner_generated_revisions revision
        where revision.id = old.revision_id
      )
      or not exists (
        select 1
        from public.persona_encounter_cross_owner_generated_artifacts artifact
        where artifact.id = old.artifact_id
      )
      or not exists (
        select 1
        from public.persona_encounter_cross_owner_consents consent
        where consent.id = old.consent_id
      )
      or not exists (
        select 1
        from public.profiles approver
        where approver.id = old.approver_owner_user_id
      )
    )
  then
    return old;
  end if;

  raise exception 'cross-owner generated revision approvals are append-only';
end;
$generated_approval_guard$;

comment on function public.prevent_persona_encounter_cross_owner_generated_approval_mutation() is
  'Blocks direct update/delete of generated revision approvals. Allows DELETE only when an ON DELETE CASCADE parent is already absent.';

create or replace function public.prevent_cross_owner_generated_publication_audit_mutation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
set row_security = off
as $publication_audit_guard$
begin
  if tg_op = 'DELETE'
    and (
      not exists (
        select 1
        from public.persona_encounter_cross_owner_generated_publications publication
        where publication.id = old.publication_id
      )
      or not exists (
        select 1
        from public.persona_encounter_cross_owner_consents consent
        where consent.id = old.consent_id
      )
      or not exists (
        select 1
        from public.persona_encounter_cross_owner_generated_artifacts artifact
        where artifact.id = old.artifact_id
      )
      or not exists (
        select 1
        from public.persona_encounter_cross_owner_generated_revisions revision
        where revision.id = old.revision_id
      )
    )
  then
    return old;
  end if;

  raise exception 'cross-owner generated publication audit events are append-only';
end;
$publication_audit_guard$;

comment on function public.prevent_cross_owner_generated_publication_audit_mutation() is
  'Blocks direct update/delete of generated publication audit events. Allows DELETE only when an ON DELETE CASCADE parent is already absent.';

do $pr532a_postassert$
declare
  protected_function_count integer;
  delete_guard_count integer;
  update_guard_count integer;
begin
  select count(*)::integer
  into protected_function_count
  from pg_catalog.pg_proc procedure_row
  where procedure_row.oid = any(array[
      pg_catalog.to_regprocedure('public.prevent_persona_encounter_cross_owner_consent_audit_mutation()'),
      pg_catalog.to_regprocedure('public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation()'),
      pg_catalog.to_regprocedure('public.prevent_persona_encounter_cross_owner_generated_approval_mutation()'),
      pg_catalog.to_regprocedure('public.prevent_cross_owner_generated_publication_audit_mutation()')
    ]::oid[])
    and procedure_row.prosecdef
    and array_to_string(procedure_row.proconfig, ',') like '%search_path=pg_catalog, public%'
    and array_to_string(procedure_row.proconfig, ',') like '%row_security=off%';

  if protected_function_count <> 4 then
    raise exception 'PR532A expected four RLS-independent append-only guards';
  end if;

  select count(*)::integer
  into delete_guard_count
  from pg_catalog.pg_trigger trigger_row
  join pg_catalog.pg_class relation on relation.oid = trigger_row.tgrelid
  where not trigger_row.tgisinternal
    and trigger_row.tgenabled = 'O'
    and (trigger_row.tgtype & 2) = 2
    and (trigger_row.tgtype & 8) = 8
    and (
      (relation.relname = 'persona_encounter_cross_owner_consent_audit_events'
        and trigger_row.tgfoid = pg_catalog.to_regprocedure('public.prevent_persona_encounter_cross_owner_consent_audit_mutation()'))
      or (relation.relname = 'persona_encounter_cross_owner_runtime_attempts'
        and trigger_row.tgfoid = pg_catalog.to_regprocedure('public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation()'))
      or (relation.relname = 'persona_encounter_cross_owner_generated_revision_approvals'
        and trigger_row.tgfoid = pg_catalog.to_regprocedure('public.prevent_persona_encounter_cross_owner_generated_approval_mutation()'))
      or (relation.relname = 'persona_encounter_cross_owner_generated_publication_audits'
        and trigger_row.tgfoid = pg_catalog.to_regprocedure('public.prevent_cross_owner_generated_publication_audit_mutation()'))
    );

  select count(*)::integer
  into update_guard_count
  from pg_catalog.pg_trigger trigger_row
  join pg_catalog.pg_class relation on relation.oid = trigger_row.tgrelid
  where not trigger_row.tgisinternal
    and trigger_row.tgenabled = 'O'
    and (trigger_row.tgtype & 2) = 2
    and (trigger_row.tgtype & 16) = 16
    and (
      (relation.relname = 'persona_encounter_cross_owner_consent_audit_events'
        and trigger_row.tgfoid = pg_catalog.to_regprocedure('public.prevent_persona_encounter_cross_owner_consent_audit_mutation()'))
      or (relation.relname = 'persona_encounter_cross_owner_runtime_attempts'
        and trigger_row.tgfoid = pg_catalog.to_regprocedure('public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation()'))
      or (relation.relname = 'persona_encounter_cross_owner_generated_revision_approvals'
        and trigger_row.tgfoid = pg_catalog.to_regprocedure('public.prevent_persona_encounter_cross_owner_generated_approval_mutation()'))
      or (relation.relname = 'persona_encounter_cross_owner_generated_publication_audits'
        and trigger_row.tgfoid = pg_catalog.to_regprocedure('public.prevent_cross_owner_generated_publication_audit_mutation()'))
    );

  if delete_guard_count <> 4 or update_guard_count <> 4 then
    raise exception 'PR532A expected all four enabled DELETE and UPDATE append-only guards';
  end if;
end;
$pr532a_postassert$;

notify pgrst, 'reload schema';

commit;
