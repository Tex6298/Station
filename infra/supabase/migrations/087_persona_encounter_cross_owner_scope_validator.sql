-- ============================================================
-- PR530A cross-owner generated scope validator repair
-- ============================================================

begin;

select pg_advisory_xact_lock(
  hashtextextended('station.pr530.cross_owner_generated_scope_validator.087', 0)
);

do $pr530a_preflight$
declare
  validator_oid oid := pg_catalog.to_regprocedure(
    'public.persona_encounter_cross_owner_consent_scopes_valid(text[])'
  );
  consent_table_oid oid := pg_catalog.to_regclass(
    'public.persona_encounter_cross_owner_consents'
  );
  audit_table_oid oid := pg_catalog.to_regclass(
    'public.persona_encounter_cross_owner_consent_audit_events'
  );
begin
  if validator_oid is null then
    raise exception 'PR530A expected the cross-owner consent scope validator before migration 087';
  end if;

  if consent_table_oid is null or not exists (
    select 1
    from pg_catalog.pg_class relation
    where relation.oid = consent_table_oid
      and relation.relkind in ('r', 'p')
  ) then
    raise exception 'PR530A expected the cross-owner consent table before migration 087';
  end if;

  if audit_table_oid is null or not exists (
    select 1
    from pg_catalog.pg_class relation
    where relation.oid = audit_table_oid
      and relation.relkind in ('r', 'p')
  ) then
    raise exception 'PR530A expected the cross-owner consent audit table before migration 087';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = consent_table_oid
      and constraint_row.conname = 'persona_encounter_cross_owner_consents_scopes_check'
      and constraint_row.contype = 'c'
      and constraint_row.convalidated
      and exists (
        select 1
        from pg_catalog.pg_depend dependency
        where dependency.classid = 'pg_catalog.pg_constraint'::regclass
          and dependency.objid = constraint_row.oid
          and dependency.refclassid = 'pg_catalog.pg_proc'::regclass
          and dependency.refobjid = validator_oid
      )
  ) then
    raise exception 'PR530A expected the validated consent scope CHECK to call the existing validator';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = audit_table_oid
      and constraint_row.conname = 'persona_encounter_cross_owner_consent_audit_scopes_check'
      and constraint_row.contype = 'c'
      and constraint_row.convalidated
      and exists (
        select 1
        from pg_catalog.pg_depend dependency
        where dependency.classid = 'pg_catalog.pg_constraint'::regclass
          and dependency.objid = constraint_row.oid
          and dependency.refclassid = 'pg_catalog.pg_proc'::regclass
          and dependency.refobjid = validator_oid
      )
  ) then
    raise exception 'PR530A expected the validated consent audit scope CHECK to call the existing validator';
  end if;
end;
$pr530a_preflight$;

create or replace function public.persona_encounter_cross_owner_consent_scopes_valid(scopes text[])
returns boolean
language sql
immutable
as $validator$
  select scopes is not null
    and cardinality(scopes) between 1 and 8
    and not exists (
      select 1
      from unnest(scopes) as scope
      where scope is null
        or scope not in (
          'run_cross_owner_encounter',
          'save_private_cross_owner_artifact',
          'share_participant_metadata_between_owners',
          'publish_metadata_only_public_exhibit',
          'publish_exact_generated_revision',
          'publish_generated_words_excerpt',
          'publish_transcript',
          'publish_generated_summary'
        )
    );
$validator$;

do $pr530a_postassert$
declare
  validator_oid oid := pg_catalog.to_regprocedure(
    'public.persona_encounter_cross_owner_consent_scopes_valid(text[])'
  );
  consent_table_oid oid := pg_catalog.to_regclass(
    'public.persona_encounter_cross_owner_consents'
  );
  audit_table_oid oid := pg_catalog.to_regclass(
    'public.persona_encounter_cross_owner_consent_audit_events'
  );
begin
  if not exists (
    select 1
    from pg_catalog.pg_proc procedure_row
    join pg_catalog.pg_language language_row
      on language_row.oid = procedure_row.prolang
    where procedure_row.oid = validator_oid
      and procedure_row.prorettype = 'boolean'::regtype
      and procedure_row.provolatile = 'i'
      and language_row.lanname = 'sql'
  ) then
    raise exception 'PR530A scope validator must remain an immutable SQL boolean function';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = consent_table_oid
      and constraint_row.conname = 'persona_encounter_cross_owner_consents_scopes_check'
      and constraint_row.contype = 'c'
      and constraint_row.convalidated
      and exists (
        select 1
        from pg_catalog.pg_depend dependency
        where dependency.classid = 'pg_catalog.pg_constraint'::regclass
          and dependency.objid = constraint_row.oid
          and dependency.refclassid = 'pg_catalog.pg_proc'::regclass
          and dependency.refobjid = validator_oid
      )
  ) then
    raise exception 'PR530A consent scope CHECK no longer calls the validated scope validator';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = audit_table_oid
      and constraint_row.conname = 'persona_encounter_cross_owner_consent_audit_scopes_check'
      and constraint_row.contype = 'c'
      and constraint_row.convalidated
      and exists (
        select 1
        from pg_catalog.pg_depend dependency
        where dependency.classid = 'pg_catalog.pg_constraint'::regclass
          and dependency.objid = constraint_row.oid
          and dependency.refclassid = 'pg_catalog.pg_proc'::regclass
          and dependency.refobjid = validator_oid
      )
  ) then
    raise exception 'PR530A consent audit scope CHECK no longer calls the validated scope validator';
  end if;

  if exists (
    select 1
    from public.persona_encounter_cross_owner_consents consent
    where public.persona_encounter_cross_owner_consent_scopes_valid(consent.requested_scopes) is not true
  ) then
    raise exception 'PR530A found a cross-owner consent row outside the repaired scope contract';
  end if;

  if exists (
    select 1
    from public.persona_encounter_cross_owner_consent_audit_events audit_event
    where public.persona_encounter_cross_owner_consent_scopes_valid(audit_event.requested_scopes) is not true
  ) then
    raise exception 'PR530A found a cross-owner consent audit row outside the repaired scope contract';
  end if;
end;
$pr530a_postassert$;

notify pgrst, 'reload schema';

commit;
