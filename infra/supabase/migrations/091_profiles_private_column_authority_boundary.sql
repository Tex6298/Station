-- ============================================================
-- PR535A profile authority and private-column boundary repair
-- ============================================================

begin;

select pg_advisory_xact_lock(
  hashtextextended('station.pr535a.profiles_private_column_authority_boundary.091', 0)
);

lock table public.profiles in share row exclusive mode;

do $pr535a_preflight$
declare
  profiles_oid oid := pg_catalog.to_regclass('public.profiles');
  actual_table_grants jsonb;
  expected_table_grants jsonb;
  actual_column_grants jsonb;
  expected_column_grants jsonb;
  actual_dependent_policies jsonb;
  expected_dependent_policies jsonb := '[
    ["comments", "comments_select_community_threads", "SELECT", "{public}", "5ee3592bf3116019f1b4f530f3c5a7c1"],
    ["community_moderation_actions", "community_moderation_actions_admin_insert", "INSERT", "{public}", "6763043a8f0689c0b710209ad8ef6981"],
    ["community_moderation_actions", "community_moderation_actions_select_admin", "SELECT", "{public}", "bacc12d3c4c1bb04c9a1062d355b1d3c"],
    ["community_subcommunities", "community_subcommunities_admin_all", "ALL", "{public}", "3769ea7fdc4ce5008d3d4d24f16d77a4"],
    ["community_subcommunity_moderators", "community_subcommunity_moderators_owner_admin_select", "SELECT", "{public}", "41e21f83d7b4f0f8b3ce6a62dd9d3a1a"],
    ["community_subcommunity_moderators", "community_subcommunity_moderators_owner_admin_write", "ALL", "{public}", "479e5e2d5fbc919a1748abdc7267d637"],
    ["community_user_profiles", "community_profiles_admin_insert", "INSERT", "{public}", "6763043a8f0689c0b710209ad8ef6981"],
    ["community_user_profiles", "community_profiles_admin_update", "UPDATE", "{public}", "3769ea7fdc4ce5008d3d4d24f16d77a4"],
    ["documents", "documents_select_community", "SELECT", "{public}", "bddb9c585a8b23739adc6bf3be95e45e"],
    ["moderation_reports", "reports_all_admin", "ALL", "{public}", "bacc12d3c4c1bb04c9a1062d355b1d3c"],
    ["threads", "threads_select_community", "SELECT", "{public}", "24c3461ab95960459b87740f77d3ec57"]
  ]'::jsonb;
begin
  if profiles_oid is null or not exists (
    select 1
    from pg_catalog.pg_class relation
    join pg_catalog.pg_namespace namespace
      on namespace.oid = relation.relnamespace
    where relation.oid = profiles_oid
      and namespace.nspname = 'public'
      and relation.relname = 'profiles'
      and relation.relkind in ('r', 'p')
  ) then
    raise exception 'PR535A expected public.profiles before migration 091';
  end if;

  if exists (
    with expected_columns(ordinal_position, column_name, type_oid, is_not_null) as (
      values
        (1, 'id', 'uuid'::regtype::oid, true),
        (2, 'username', 'text'::regtype::oid, true),
        (3, 'display_name', 'text'::regtype::oid, false),
        (4, 'bio', 'text'::regtype::oid, false),
        (5, 'avatar_url', 'text'::regtype::oid, false),
        (6, 'tier', 'text'::regtype::oid, true),
        (7, 'stripe_customer_id', 'text'::regtype::oid, false),
        (8, 'stripe_subscription_id', 'text'::regtype::oid, false),
        (9, 'subscription_status', 'text'::regtype::oid, false),
        (10, 'byok_openai_key', 'text'::regtype::oid, false),
        (11, 'byok_anthropic_key', 'text'::regtype::oid, false),
        (12, 'byok_deepseek_key', 'text'::regtype::oid, false),
        (13, 'ai_mode', 'text'::regtype::oid, true),
        (14, 'is_admin', 'boolean'::regtype::oid, true),
        (15, 'created_at', 'timestamptz'::regtype::oid, true),
        (16, 'updated_at', 'timestamptz'::regtype::oid, true)
    ),
    actual_columns as (
      select
        attribute.attnum::integer as ordinal_position,
        attribute.attname::text as column_name,
        attribute.atttypid as type_oid,
        attribute.attnotnull as is_not_null
      from pg_catalog.pg_attribute attribute
      where attribute.attrelid = profiles_oid
        and attribute.attnum > 0
        and not attribute.attisdropped
    )
    select 1
    from expected_columns expected
    full outer join actual_columns actual
      on actual.ordinal_position = expected.ordinal_position
      and actual.column_name = expected.column_name
      and actual.type_oid = expected.type_oid
      and actual.is_not_null = expected.is_not_null
    where expected.ordinal_position is null
      or actual.ordinal_position is null
  ) then
    raise exception 'PR535A profiles column contract differs from the expected sixteen-column baseline';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_class relation
    where relation.oid = profiles_oid
      and relation.relrowsecurity
      and not relation.relforcerowsecurity
  ) then
    raise exception 'PR535A expected enabled, non-forced profiles RLS';
  end if;

  if (
    select count(*)
    from pg_catalog.pg_policies policy_row
    where policy_row.schemaname = 'public'
      and policy_row.tablename = 'profiles'
  ) <> 2 then
    raise exception 'PR535A expected exactly two inherited profiles policies';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_policies policy_row
    where policy_row.schemaname = 'public'
      and policy_row.tablename = 'profiles'
      and policy_row.policyname = 'profiles_select_public'
      and policy_row.permissive = 'PERMISSIVE'
      and policy_row.roles = array['public'::name]
      and policy_row.cmd = 'SELECT'
      and md5(coalesce(policy_row.qual, '') || '|' || coalesce(policy_row.with_check, '')) =
        'eb28d87532d6edd9b635727493ef89f7'
  ) then
    raise exception 'PR535A inherited profiles SELECT policy differs from preflight';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_policies policy_row
    where policy_row.schemaname = 'public'
      and policy_row.tablename = 'profiles'
      and policy_row.policyname = 'profiles_update_own'
      and policy_row.permissive = 'PERMISSIVE'
      and policy_row.roles = array['public'::name]
      and policy_row.cmd = 'UPDATE'
      and md5(coalesce(policy_row.qual, '') || '|' || coalesce(policy_row.with_check, '')) =
        'cc00666ac5d81806b4129769e28761f3'
  ) then
    raise exception 'PR535A inherited profiles UPDATE policy differs from preflight';
  end if;

  select jsonb_agg(
    jsonb_build_array(grant_row.grantee, grant_row.privilege_type)
    order by grant_row.grantee, grant_row.privilege_type
  )
  into actual_table_grants
  from information_schema.role_table_grants grant_row
  where grant_row.table_schema = 'public'
    and grant_row.table_name = 'profiles'
    and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role');

  select jsonb_agg(
    jsonb_build_array(expected.role_name, expected.privilege_name)
    order by expected.role_name, expected.privilege_name
  )
  into expected_table_grants
  from unnest(array['anon', 'authenticated', 'service_role']::text[]) as expected_role(role_name)
  cross join unnest(
    array['DELETE', 'INSERT', 'REFERENCES', 'SELECT', 'TRIGGER', 'TRUNCATE', 'UPDATE']::text[]
  ) as expected_privilege(privilege_name)
  cross join lateral (
    select expected_role.role_name, expected_privilege.privilege_name
  ) expected;

  if actual_table_grants is distinct from expected_table_grants then
    raise exception 'PR535A profiles table grants differ from the expected browser/service baseline';
  end if;

  select jsonb_agg(
    jsonb_build_array(grant_row.grantee, grant_row.column_name, grant_row.privilege_type)
    order by grant_row.grantee, grant_row.column_name, grant_row.privilege_type
  )
  into actual_column_grants
  from information_schema.role_column_grants grant_row
  where grant_row.table_schema = 'public'
    and grant_row.table_name = 'profiles'
    and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role');

  select jsonb_agg(
    jsonb_build_array(expected.role_name, expected.column_name, expected.privilege_name)
    order by expected.role_name, expected.column_name, expected.privilege_name
  )
  into expected_column_grants
  from unnest(array['anon', 'authenticated', 'service_role']::text[]) as expected_role(role_name)
  cross join unnest(array[
    'id',
    'username',
    'display_name',
    'bio',
    'avatar_url',
    'tier',
    'stripe_customer_id',
    'stripe_subscription_id',
    'subscription_status',
    'byok_openai_key',
    'byok_anthropic_key',
    'byok_deepseek_key',
    'ai_mode',
    'is_admin',
    'created_at',
    'updated_at'
  ]::text[]) as expected_column(column_name)
  cross join unnest(array['INSERT', 'REFERENCES', 'SELECT', 'UPDATE']::text[])
    as expected_privilege(privilege_name)
  cross join lateral (
    select
      expected_role.role_name,
      expected_column.column_name,
      expected_privilege.privilege_name
  ) expected;

  if actual_column_grants is distinct from expected_column_grants then
    raise exception 'PR535A profiles column grants differ from the expected browser/service baseline';
  end if;

  select jsonb_agg(
    jsonb_build_array(
      policy_row.tablename,
      policy_row.policyname,
      policy_row.cmd,
      policy_row.roles::text,
      md5(coalesce(policy_row.qual, '') || '|' || coalesce(policy_row.with_check, ''))
    )
    order by policy_row.tablename, policy_row.policyname
  )
  into actual_dependent_policies
  from pg_catalog.pg_policies policy_row
  where policy_row.schemaname = 'public'
    and policy_row.tablename <> 'profiles'
    and (
      coalesce(policy_row.qual, '') like '%profiles%'
      or coalesce(policy_row.with_check, '') like '%profiles%'
    );

  if actual_dependent_policies is distinct from expected_dependent_policies then
    raise exception 'PR535A dependent profile-authority policies differ from the eleven-policy preflight';
  end if;
end;
$pr535a_preflight$;

drop policy profiles_select_public on public.profiles;
drop policy profiles_update_own on public.profiles;

revoke all privileges on table public.profiles from public, anon, authenticated;
revoke all privileges (
  id,
  username,
  display_name,
  bio,
  avatar_url,
  tier,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  byok_openai_key,
  byok_anthropic_key,
  byok_deepseek_key,
  ai_mode,
  is_admin,
  created_at,
  updated_at
) on table public.profiles from public, anon, authenticated;

create policy profiles_select_own_authority
  on public.profiles
  for select
  to anon, authenticated
  using (auth.uid() = id);

grant select (id, tier, is_admin)
  on table public.profiles
  to anon, authenticated;

grant select, insert, update, delete
  on table public.profiles
  to service_role;

do $pr535a_postassert$
declare
  profiles_oid oid := pg_catalog.to_regclass('public.profiles');
  actual_table_grants jsonb;
  expected_table_grants jsonb;
  actual_column_grants jsonb;
  expected_column_grants jsonb;
  actual_dependent_policies jsonb;
  expected_dependent_policies jsonb := '[
    ["comments", "comments_select_community_threads", "SELECT", "{public}", "5ee3592bf3116019f1b4f530f3c5a7c1"],
    ["community_moderation_actions", "community_moderation_actions_admin_insert", "INSERT", "{public}", "6763043a8f0689c0b710209ad8ef6981"],
    ["community_moderation_actions", "community_moderation_actions_select_admin", "SELECT", "{public}", "bacc12d3c4c1bb04c9a1062d355b1d3c"],
    ["community_subcommunities", "community_subcommunities_admin_all", "ALL", "{public}", "3769ea7fdc4ce5008d3d4d24f16d77a4"],
    ["community_subcommunity_moderators", "community_subcommunity_moderators_owner_admin_select", "SELECT", "{public}", "41e21f83d7b4f0f8b3ce6a62dd9d3a1a"],
    ["community_subcommunity_moderators", "community_subcommunity_moderators_owner_admin_write", "ALL", "{public}", "479e5e2d5fbc919a1748abdc7267d637"],
    ["community_user_profiles", "community_profiles_admin_insert", "INSERT", "{public}", "6763043a8f0689c0b710209ad8ef6981"],
    ["community_user_profiles", "community_profiles_admin_update", "UPDATE", "{public}", "3769ea7fdc4ce5008d3d4d24f16d77a4"],
    ["documents", "documents_select_community", "SELECT", "{public}", "bddb9c585a8b23739adc6bf3be95e45e"],
    ["moderation_reports", "reports_all_admin", "ALL", "{public}", "bacc12d3c4c1bb04c9a1062d355b1d3c"],
    ["threads", "threads_select_community", "SELECT", "{public}", "24c3461ab95960459b87740f77d3ec57"]
  ]'::jsonb;
begin
  if not exists (
    select 1
    from pg_catalog.pg_class relation
    where relation.oid = profiles_oid
      and relation.relrowsecurity
      and not relation.relforcerowsecurity
  ) then
    raise exception 'PR535A profiles RLS state changed during migration 091';
  end if;

  if (
    select count(*)
    from pg_catalog.pg_policies policy_row
    where policy_row.schemaname = 'public'
      and policy_row.tablename = 'profiles'
  ) <> 1 then
    raise exception 'PR535A expected exactly one profiles policy after repair';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_policies policy_row
    where policy_row.schemaname = 'public'
      and policy_row.tablename = 'profiles'
      and policy_row.policyname = 'profiles_select_own_authority'
      and policy_row.permissive = 'PERMISSIVE'
      and policy_row.roles @> array['anon'::name, 'authenticated'::name]
      and policy_row.roles <@ array['anon'::name, 'authenticated'::name]
      and policy_row.cmd = 'SELECT'
      and md5(coalesce(policy_row.qual, '') || '|' || coalesce(policy_row.with_check, '')) =
        'cc00666ac5d81806b4129769e28761f3'
  ) then
    raise exception 'PR535A own-row authority SELECT policy was not installed exactly';
  end if;

  select jsonb_agg(
    jsonb_build_array(grant_row.grantee, grant_row.privilege_type)
    order by grant_row.grantee, grant_row.privilege_type
  )
  into actual_table_grants
  from information_schema.role_table_grants grant_row
  where grant_row.table_schema = 'public'
    and grant_row.table_name = 'profiles'
    and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role');

  select jsonb_agg(
    jsonb_build_array('service_role', expected_privilege.privilege_name)
    order by expected_privilege.privilege_name
  )
  into expected_table_grants
  from unnest(
    array['DELETE', 'INSERT', 'REFERENCES', 'SELECT', 'TRIGGER', 'TRUNCATE', 'UPDATE']::text[]
  ) as expected_privilege(privilege_name);

  if actual_table_grants is distinct from expected_table_grants then
    raise exception 'PR535A browser table privilege remains or trusted service privilege drifted';
  end if;

  select jsonb_agg(
    jsonb_build_array(grant_row.grantee, grant_row.column_name, grant_row.privilege_type)
    order by grant_row.grantee, grant_row.column_name, grant_row.privilege_type
  )
  into actual_column_grants
  from information_schema.role_column_grants grant_row
  where grant_row.table_schema = 'public'
    and grant_row.table_name = 'profiles'
    and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role');

  select jsonb_agg(
    jsonb_build_array(expected.grantee, expected.column_name, expected.privilege_type)
    order by expected.grantee, expected.column_name, expected.privilege_type
  )
  into expected_column_grants
  from (
    select
      browser_role.role_name as grantee,
      browser_column.column_name,
      'SELECT'::text as privilege_type
    from unnest(array['anon', 'authenticated']::text[]) as browser_role(role_name)
    cross join unnest(array['id', 'tier', 'is_admin']::text[]) as browser_column(column_name)

    union all

    select
      'service_role'::text as grantee,
      service_column.column_name,
      service_privilege.privilege_name as privilege_type
    from unnest(array[
      'id',
      'username',
      'display_name',
      'bio',
      'avatar_url',
      'tier',
      'stripe_customer_id',
      'stripe_subscription_id',
      'subscription_status',
      'byok_openai_key',
      'byok_anthropic_key',
      'byok_deepseek_key',
      'ai_mode',
      'is_admin',
      'created_at',
      'updated_at'
    ]::text[]) as service_column(column_name)
    cross join unnest(array['INSERT', 'REFERENCES', 'SELECT', 'UPDATE']::text[])
      as service_privilege(privilege_name)
  ) expected;

  if actual_column_grants is distinct from expected_column_grants then
    raise exception 'PR535A browser profile projection or mutation boundary is not exact';
  end if;

  select jsonb_agg(
    jsonb_build_array(
      policy_row.tablename,
      policy_row.policyname,
      policy_row.cmd,
      policy_row.roles::text,
      md5(coalesce(policy_row.qual, '') || '|' || coalesce(policy_row.with_check, ''))
    )
    order by policy_row.tablename, policy_row.policyname
  )
  into actual_dependent_policies
  from pg_catalog.pg_policies policy_row
  where policy_row.schemaname = 'public'
    and policy_row.tablename <> 'profiles'
    and (
      coalesce(policy_row.qual, '') like '%profiles%'
      or coalesce(policy_row.with_check, '') like '%profiles%'
    );

  if actual_dependent_policies is distinct from expected_dependent_policies then
    raise exception 'PR535A changed a dependent profile-authority policy';
  end if;
end;
$pr535a_postassert$;

notify pgrst, 'reload schema';

commit;
