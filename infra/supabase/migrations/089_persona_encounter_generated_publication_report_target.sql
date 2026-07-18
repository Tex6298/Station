-- ============================================================
-- PR532B generated-publication moderation report target repair
-- ============================================================

begin;

select pg_advisory_xact_lock(
  hashtextextended('station.pr532b.generated_publication_report_target_constraint.089', 0)
);

do $pr532b_preflight$
declare
  moderation_table_oid oid := pg_catalog.to_regclass('public.moderation_reports');
  publication_table_oid oid := pg_catalog.to_regclass(
    'public.persona_encounter_cross_owner_generated_publications'
  );
  publication_audit_table_oid oid := pg_catalog.to_regclass(
    'public.persona_encounter_cross_owner_generated_publication_audits'
  );
  active_report_index_oid oid := pg_catalog.to_regclass(
    'public.idx_moderation_reports_active_unique'
  );
  constraint_definition text;
  actual_targets text[];
  expected_targets constant text[] := array[
    'comment',
    'document',
    'persona',
    'persona_encounter_cross_owner_public_exhibit',
    'persona_encounter_public_exhibit',
    'space',
    'thread',
    'user'
  ]::text[];
begin
  if moderation_table_oid is null or not exists (
    select 1
    from pg_catalog.pg_class relation
    where relation.oid = moderation_table_oid
      and relation.relkind in ('r', 'p')
  ) then
    raise exception 'PR532B expected public.moderation_reports before migration 089';
  end if;

  if publication_table_oid is null or not exists (
    select 1
    from pg_catalog.pg_class relation
    where relation.oid = publication_table_oid
      and relation.relkind in ('r', 'p')
  ) then
    raise exception 'PR532B expected the generated-publication table before migration 089';
  end if;

  if publication_audit_table_oid is null or not exists (
    select 1
    from pg_catalog.pg_class relation
    where relation.oid = publication_audit_table_oid
      and relation.relkind in ('r', 'p')
  ) then
    raise exception 'PR532B expected the generated-publication audit table before migration 089';
  end if;

  if active_report_index_oid is null or not exists (
    select 1
    from pg_catalog.pg_index index_row
    where index_row.indexrelid = active_report_index_oid
      and index_row.indrelid = moderation_table_oid
      and index_row.indisunique
      and index_row.indisvalid
  ) then
    raise exception 'PR532B expected the active moderation-report uniqueness index before migration 089';
  end if;

  select pg_catalog.pg_get_constraintdef(constraint_row.oid, true)
  into constraint_definition
  from pg_catalog.pg_constraint constraint_row
  where constraint_row.conrelid = moderation_table_oid
    and constraint_row.conname = 'moderation_reports_target_type_check'
    and constraint_row.contype = 'c'
    and constraint_row.convalidated;

  if constraint_definition is null then
    raise exception 'PR532B expected one validated moderation report target-type constraint';
  end if;

  select coalesce(
    array_agg(capture[1] order by capture[1]),
    array[]::text[]
  )
  into actual_targets
  from pg_catalog.regexp_matches(
    constraint_definition,
    $target$'([^']+)'$target$,
    'g'
  ) as capture;

  if actual_targets <> expected_targets then
    raise exception 'PR532B expected the exact eight-value pre-089 moderation target allow-list';
  end if;

  if 'persona_encounter_cross_owner_generated_publication' = any(actual_targets) then
    raise exception 'PR532B expected generated-publication reports to remain blocked before migration 089';
  end if;
end;
$pr532b_preflight$;

alter table public.moderation_reports
  drop constraint if exists moderation_reports_target_type_check;

alter table public.moderation_reports
  add constraint moderation_reports_target_type_check
  check (target_type in (
    'user',
    'space',
    'document',
    'thread',
    'comment',
    'persona',
    'persona_encounter_public_exhibit',
    'persona_encounter_cross_owner_public_exhibit',
    'persona_encounter_cross_owner_generated_publication'
  ));

do $pr532b_postassert$
declare
  moderation_table_oid oid := pg_catalog.to_regclass('public.moderation_reports');
  constraint_definition text;
  actual_targets text[];
  expected_targets constant text[] := array[
    'comment',
    'document',
    'persona',
    'persona_encounter_cross_owner_generated_publication',
    'persona_encounter_cross_owner_public_exhibit',
    'persona_encounter_public_exhibit',
    'space',
    'thread',
    'user'
  ]::text[];
begin
  select pg_catalog.pg_get_constraintdef(constraint_row.oid, true)
  into constraint_definition
  from pg_catalog.pg_constraint constraint_row
  where constraint_row.conrelid = moderation_table_oid
    and constraint_row.conname = 'moderation_reports_target_type_check'
    and constraint_row.contype = 'c'
    and constraint_row.convalidated;

  if constraint_definition is null then
    raise exception 'PR532B expected one validated repaired moderation target constraint';
  end if;

  select coalesce(
    array_agg(capture[1] order by capture[1]),
    array[]::text[]
  )
  into actual_targets
  from pg_catalog.regexp_matches(
    constraint_definition,
    $target$'([^']+)'$target$,
    'g'
  ) as capture;

  if actual_targets <> expected_targets then
    raise exception 'PR532B repaired moderation target allow-list must contain exactly nine values';
  end if;

  if constraint_definition ~* $unsafe$\m(like|similar)\M|~$unsafe$ then
    raise exception 'PR532B moderation target constraint must not use wildcard or regex matching';
  end if;

  if not ('persona_encounter_cross_owner_generated_publication' = any(actual_targets))
    or 'persona_encounter_unknown_target' = any(actual_targets)
  then
    raise exception 'PR532B generated-publication acceptance or unknown-target rejection is not exact';
  end if;
end;
$pr532b_postassert$;

notify pgrst, 'reload schema';

commit;
