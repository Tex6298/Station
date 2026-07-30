-- ============================================================
-- PR535B institution principal, team, and public identity
-- Source-only in this lane. Service-owned lifecycle and reads.
-- ============================================================

begin;

select pg_advisory_xact_lock(
  hashtextextended('station.pr535b.institution_principal_team_public_identity.092', 0)
);

lock table public.profiles in share row exclusive mode;

do $pr535b_preflight$
declare
  relation_fingerprint jsonb;
  policy_fingerprint jsonb;
  grant_fingerprint jsonb;
begin
  if pg_catalog.to_regclass('public.profiles') is null
    or (
      select count(*)
      from pg_catalog.pg_policies policy_row
      where policy_row.schemaname = 'public'
        and policy_row.tablename = 'profiles'
    ) <> 1
    or not exists (
      select 1
      from pg_catalog.pg_policies policy_row
      where policy_row.schemaname = 'public'
        and policy_row.tablename = 'profiles'
        and policy_row.policyname = 'profiles_select_own_authority'
        and policy_row.cmd = 'SELECT'
        and policy_row.roles @> array['anon'::name, 'authenticated'::name]
        and policy_row.roles <@ array['anon'::name, 'authenticated'::name]
        and md5(coalesce(policy_row.qual, '') || '|' || coalesce(policy_row.with_check, '')) =
          'cc00666ac5d81806b4129769e28761f3'
    )
  then
    raise exception 'PR535B requires the accepted migration 091 profile boundary';
  end if;

  if (
    select count(*)
    from information_schema.role_table_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name = 'profiles'
      and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
  ) <> 7 or exists (
    select 1
    from information_schema.role_table_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name = 'profiles'
      and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
      and (
        grant_row.grantee <> 'service_role'
        or grant_row.privilege_type not in (
          'DELETE', 'INSERT', 'REFERENCES', 'SELECT', 'TRIGGER', 'TRUNCATE', 'UPDATE'
        )
      )
  ) or (
    select count(*)
    from information_schema.role_column_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name = 'profiles'
      and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
  ) <> 70 or (
    select count(*)
    from information_schema.role_column_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name = 'profiles'
      and grant_row.grantee in ('anon', 'authenticated')
      and grant_row.privilege_type = 'SELECT'
      and grant_row.column_name in ('id', 'tier', 'is_admin')
  ) <> 6 or (
    select count(*)
    from information_schema.role_column_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name = 'profiles'
      and grant_row.grantee = 'service_role'
      and grant_row.privilege_type in ('INSERT', 'REFERENCES', 'SELECT', 'UPDATE')
      and grant_row.column_name in (
        'id', 'username', 'display_name', 'bio', 'avatar_url', 'tier',
        'stripe_customer_id', 'stripe_subscription_id', 'subscription_status',
        'byok_openai_key', 'byok_anthropic_key', 'byok_deepseek_key', 'ai_mode',
        'is_admin', 'created_at', 'updated_at'
      )
  ) <> 64 or exists (
    select 1
    from information_schema.role_column_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name = 'profiles'
      and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
      and not (
        (
          grant_row.grantee in ('anon', 'authenticated')
          and grant_row.privilege_type = 'SELECT'
          and grant_row.column_name in ('id', 'tier', 'is_admin')
        )
        or (
          grant_row.grantee = 'service_role'
          and grant_row.privilege_type in ('INSERT', 'REFERENCES', 'SELECT', 'UPDATE')
          and grant_row.column_name in (
            'id', 'username', 'display_name', 'bio', 'avatar_url', 'tier',
            'stripe_customer_id', 'stripe_subscription_id', 'subscription_status',
            'byok_openai_key', 'byok_anthropic_key', 'byok_deepseek_key', 'ai_mode',
            'is_admin', 'created_at', 'updated_at'
          )
        )
      )
  ) then
    raise exception 'PR535B requires the exact direct migration 091 profile ACL';
  end if;

  if exists (
    select 1
    from unnest(array['anon', 'authenticated']::text[]) browser_role(role_name)
    cross join unnest(array[
      'DELETE', 'INSERT', 'REFERENCES', 'SELECT', 'TRIGGER', 'TRUNCATE', 'UPDATE'
    ]::text[]) profile_privilege(privilege_name)
    where pg_catalog.has_table_privilege(
      browser_role.role_name,
      'public.profiles',
      profile_privilege.privilege_name
    )
  ) or exists (
    select 1
    from unnest(array['anon', 'authenticated']::text[]) browser_role(role_name)
    cross join unnest(array[
      'id', 'username', 'display_name', 'bio', 'avatar_url', 'tier',
      'stripe_customer_id', 'stripe_subscription_id', 'subscription_status',
      'byok_openai_key', 'byok_anthropic_key', 'byok_deepseek_key', 'ai_mode',
      'is_admin', 'created_at', 'updated_at'
    ]::text[]) profile_column(column_name)
    cross join unnest(array['INSERT', 'REFERENCES', 'SELECT', 'UPDATE']::text[])
      profile_privilege(privilege_name)
    where pg_catalog.has_column_privilege(
      browser_role.role_name,
      'public.profiles',
      profile_column.column_name,
      profile_privilege.privilege_name
    ) is distinct from (
      profile_privilege.privilege_name = 'SELECT'
      and profile_column.column_name in ('id', 'tier', 'is_admin')
    )
  ) then
    raise exception 'PR535B effective browser profile ACL differs from migration 091';
  end if;

  if exists (
    select 1
    from unnest(array[
      'DELETE', 'INSERT', 'REFERENCES', 'SELECT', 'TRIGGER', 'TRUNCATE', 'UPDATE'
    ]::text[]) profile_privilege(privilege_name)
    where not pg_catalog.has_table_privilege(
      'service_role',
      'public.profiles',
      profile_privilege.privilege_name
    )
  ) or exists (
    select 1
    from unnest(array[
      'id', 'username', 'display_name', 'bio', 'avatar_url', 'tier',
      'stripe_customer_id', 'stripe_subscription_id', 'subscription_status',
      'byok_openai_key', 'byok_anthropic_key', 'byok_deepseek_key', 'ai_mode',
      'is_admin', 'created_at', 'updated_at'
    ]::text[]) profile_column(column_name)
    cross join unnest(array['INSERT', 'REFERENCES', 'SELECT', 'UPDATE']::text[])
      profile_privilege(privilege_name)
    where not pg_catalog.has_column_privilege(
      'service_role',
      'public.profiles',
      profile_column.column_name,
      profile_privilege.privilege_name
    )
  ) then
    raise exception 'PR535B effective trusted service profile ACL differs from migration 091';
  end if;

  if pg_catalog.to_regclass('public.institutions') is not null
    or pg_catalog.to_regclass('public.institution_members') is not null
    or pg_catalog.to_regclass('public.institution_audit_events') is not null
  then
    raise exception 'PR535B institution tables already exist';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_proc procedure_row
    join pg_catalog.pg_namespace namespace_row
      on namespace_row.oid = procedure_row.pronamespace
    where namespace_row.nspname = 'public'
      and procedure_row.proname in (
        'set_institution_updated_at_v1',
        'prevent_institution_identity_change_v1',
        'enforce_institution_member_identity_v1',
        'prevent_institution_audit_mutation_v1',
        'provision_institution_v1',
        'transition_institution_verification_v1',
        'transition_institution_publication_v1',
        'invite_institution_member_v1',
        'respond_institution_invitation_v1',
        'revoke_institution_member_v1'
      )
  ) then
    raise exception 'PR535B institution transition RPCs already exist';
  end if;

  if exists (
    select 1
    from information_schema.columns column_row
    where column_row.table_schema = 'public'
      and column_row.column_name = 'institution_id'
  ) then
    raise exception 'PR535B does not inherit or attach any existing resource';
  end if;

  select jsonb_agg(
    jsonb_build_array(
      relation_row.relname,
      relation_row.relkind,
      relation_row.relrowsecurity,
      relation_row.relforcerowsecurity,
      coalesce((
        select jsonb_agg(
          jsonb_build_array(
            attribute_row.attnum,
            attribute_row.attname,
            attribute_row.atttypid,
            attribute_row.attnotnull
          )
          order by attribute_row.attnum
        )
        from pg_catalog.pg_attribute attribute_row
        where attribute_row.attrelid = relation_row.oid
          and attribute_row.attnum > 0
          and not attribute_row.attisdropped
      ), '[]'::jsonb)
    )
    order by relation_row.relname
  )
  into relation_fingerprint
  from pg_catalog.pg_class relation_row
  join pg_catalog.pg_namespace namespace_row
    on namespace_row.oid = relation_row.relnamespace
  where namespace_row.nspname = 'public'
    and relation_row.relkind in ('r', 'p')
    and relation_row.relname not in (
      'institutions',
      'institution_members',
      'institution_audit_events'
    );

  select coalesce(jsonb_agg(
    jsonb_build_array(
      policy_row.tablename,
      policy_row.policyname,
      policy_row.permissive,
      policy_row.roles,
      policy_row.cmd,
      policy_row.qual,
      policy_row.with_check
    )
    order by policy_row.tablename, policy_row.policyname
  ), '[]'::jsonb)
  into policy_fingerprint
  from pg_catalog.pg_policies policy_row
  where policy_row.schemaname = 'public'
    and policy_row.tablename not in (
      'institutions',
      'institution_members',
      'institution_audit_events'
    );

  select coalesce(jsonb_agg(
    jsonb_build_array(
      grant_row.table_name,
      grant_row.grantee,
      grant_row.privilege_type
    )
    order by grant_row.table_name, grant_row.grantee, grant_row.privilege_type
  ), '[]'::jsonb)
  into grant_fingerprint
  from information_schema.role_table_grants grant_row
  where grant_row.table_schema = 'public'
    and grant_row.table_name not in (
      'institutions',
      'institution_members',
      'institution_audit_events'
    )
    and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role');

  perform pg_catalog.set_config(
    'station.pr535b_relation_fingerprint',
    coalesce(relation_fingerprint, '[]'::jsonb)::text,
    true
  );
  perform pg_catalog.set_config(
    'station.pr535b_policy_fingerprint',
    policy_fingerprint::text,
    true
  );
  perform pg_catalog.set_config(
    'station.pr535b_grant_fingerprint',
    grant_fingerprint::text,
    true
  );
end;
$pr535b_preflight$;

create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (id) on delete restrict,
  name text not null,
  slug text not null unique,
  summary text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'verified', 'revoked')),
  public_status text not null default 'private'
    check (public_status in ('private', 'public')),
  verified_at timestamptz,
  verified_by_user_id uuid references public.profiles (id) on delete restrict,
  verification_revoked_at timestamptz,
  verification_revoked_by_user_id uuid references public.profiles (id) on delete restrict,
  published_at timestamptz,
  unpublished_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint institutions_identity_shape_check check (
    name = btrim(name)
    and length(name) between 1 and 120
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and length(slug) between 3 and 80
    and (summary is null or (summary = btrim(summary) and length(summary) between 1 and 1000))
  ),
  constraint institutions_verification_shape_check check (
    (
      verification_status = 'unverified'
      and verified_at is null
      and verified_by_user_id is null
      and verification_revoked_at is null
      and verification_revoked_by_user_id is null
    )
    or (
      verification_status = 'verified'
      and verified_at is not null
      and verified_by_user_id is not null
      and verification_revoked_at is null
      and verification_revoked_by_user_id is null
    )
    or (
      verification_status = 'revoked'
      and verified_at is not null
      and verified_by_user_id is not null
      and verification_revoked_at is not null
      and verification_revoked_by_user_id is not null
    )
  ),
  constraint institutions_publication_shape_check check (
    (
      public_status = 'public'
      and verification_status = 'verified'
      and published_at is not null
      and unpublished_at is null
    )
    or (
      public_status = 'private'
      and (
        (published_at is null and unpublished_at is null)
        or (published_at is not null and unpublished_at is not null)
      )
    )
  )
);

create table public.institution_members (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  role text not null default 'member' check (role = 'member'),
  status text not null default 'invited' check (status in ('invited', 'active', 'removed')),
  invite_expires_at timestamptz not null,
  responded_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint institution_members_lifecycle_shape_check check (
    (
      status = 'invited'
      and responded_at is null
      and removed_at is null
    )
    or (
      status = 'active'
      and responded_at is not null
      and removed_at is null
    )
    or (
      status = 'removed'
      and removed_at is not null
    )
  ),
  constraint institution_members_timestamp_order_check check (
    invite_expires_at > created_at
    and (responded_at is null or responded_at >= created_at)
    and (removed_at is null or removed_at >= created_at)
  )
);

create unique index institution_members_current_institution_user_idx
  on public.institution_members (institution_id, user_id)
  where status <> 'removed';

create index institution_members_pending_user_idx
  on public.institution_members (user_id, status, invite_expires_at)
  where status = 'invited';

create table public.institution_audit_events (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete cascade,
  actor_user_id uuid not null references public.profiles (id) on delete restrict,
  subject_user_id uuid not null references public.profiles (id) on delete restrict,
  action text not null check (action in (
    'provisioned',
    'verification_granted',
    'verification_revoked',
    'published',
    'unpublished',
    'member_invited',
    'invitation_accepted',
    'invitation_declined',
    'invitation_expired',
    'member_revoked'
  )),
  created_at timestamptz not null default statement_timestamp()
);

alter table public.institutions enable row level security;
alter table public.institution_members enable row level security;
alter table public.institution_audit_events enable row level security;

revoke all on table public.institutions from public, anon, authenticated;
revoke all on table public.institution_members from public, anon, authenticated;
revoke all on table public.institution_audit_events from public, anon, authenticated;

grant select, insert, update, delete on table public.institutions to service_role;
grant select, insert, update, delete on table public.institution_members to service_role;
grant select, insert, update, delete on table public.institution_audit_events to service_role;

create or replace function public.set_institution_updated_at_v1()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $institution_updated_at$
begin
  new.updated_at := statement_timestamp();
  return new;
end;
$institution_updated_at$;

create or replace function public.prevent_institution_identity_change_v1()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $institution_identity_guard$
begin
  if new.owner_user_id is distinct from old.owner_user_id
    or new.name is distinct from old.name
    or new.slug is distinct from old.slug
    or new.summary is distinct from old.summary
    or new.created_at is distinct from old.created_at
  then
    raise exception 'institution principal and identity are immutable';
  end if;
  return new;
end;
$institution_identity_guard$;

create or replace function public.enforce_institution_member_identity_v1()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
set row_security = off
as $institution_member_identity_guard$
declare
  owner_id uuid;
begin
  if tg_op = 'UPDATE' and (
    new.institution_id is distinct from old.institution_id
    or new.user_id is distinct from old.user_id
    or new.role is distinct from old.role
    or new.created_at is distinct from old.created_at
    or new.invite_expires_at is distinct from old.invite_expires_at
  ) then
    raise exception 'institution member identity is immutable';
  end if;

  select institution.owner_user_id
  into owner_id
  from public.institutions institution
  where institution.id = new.institution_id;

  if owner_id is null or new.user_id = owner_id then
    raise exception 'institution owner is not a membership row';
  end if;

  return new;
end;
$institution_member_identity_guard$;

create or replace function public.prevent_institution_audit_mutation_v1()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
set row_security = off
as $institution_audit_guard$
begin
  if tg_op = 'DELETE'
    and not exists (
      select 1
      from public.institutions institution
      where institution.id = old.institution_id
    )
  then
    return old;
  end if;

  raise exception 'institution audit events are append-only';
end;
$institution_audit_guard$;

create trigger trg_institutions_updated_at
  before update on public.institutions
  for each row execute function public.set_institution_updated_at_v1();

create trigger trg_institution_members_updated_at
  before update on public.institution_members
  for each row execute function public.set_institution_updated_at_v1();

create trigger trg_institutions_prevent_identity_change
  before update on public.institutions
  for each row execute function public.prevent_institution_identity_change_v1();

create trigger trg_institution_members_enforce_identity
  before insert or update on public.institution_members
  for each row execute function public.enforce_institution_member_identity_v1();

create trigger trg_institution_audit_events_append_only
  before update or delete on public.institution_audit_events
  for each row execute function public.prevent_institution_audit_mutation_v1();

create or replace function public.provision_institution_v1(
  p_actor_user_id uuid,
  p_owner_user_id uuid,
  p_name text,
  p_slug text,
  p_summary text
)
returns table (outcome text, institution_id uuid)
language plpgsql
security definer
set search_path = pg_catalog, public
as $provision_institution$
declare
  created_institution public.institutions;
begin
  if p_actor_user_id is null
    or p_owner_user_id is null
    or p_name is null
    or btrim(p_name) = ''
    or length(btrim(p_name)) > 120
    or p_slug is null
    or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    or length(p_slug) < 3
    or length(p_slug) > 80
    or (p_summary is not null and length(btrim(p_summary)) > 1000)
    or not exists (
      select 1
      from public.profiles actor_profile
      where actor_profile.id = p_actor_user_id
        and actor_profile.is_admin
    )
    or not exists (
      select 1
      from public.profiles owner_profile
      where owner_profile.id = p_owner_user_id
    )
  then
    return query select 'unavailable'::text, null::uuid;
    return;
  end if;

  begin
    insert into public.institutions (
      owner_user_id,
      name,
      slug,
      summary
    ) values (
      p_owner_user_id,
      btrim(p_name),
      p_slug,
      nullif(btrim(p_summary), '')
    )
    returning * into created_institution;
  exception
    when unique_violation then
      return query select 'conflict'::text, null::uuid;
      return;
  end;

  insert into public.institution_audit_events (
    institution_id,
    actor_user_id,
    subject_user_id,
    action
  ) values (
    created_institution.id,
    p_actor_user_id,
    p_owner_user_id,
    'provisioned'
  );

  return query select 'created'::text, created_institution.id;
end;
$provision_institution$;

create or replace function public.transition_institution_verification_v1(
  p_institution_id uuid,
  p_actor_user_id uuid,
  p_verified boolean
)
returns table (outcome text, verification_status text, public_status text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $transition_institution_verification$
declare
  institution_row public.institutions;
  clock_time timestamptz := statement_timestamp();
begin
  select institution.*
  into institution_row
  from public.institutions institution
  where institution.id = p_institution_id
  for update;

  if institution_row.id is null
    or p_verified is null
    or not exists (
      select 1
      from public.profiles actor_profile
      where actor_profile.id = p_actor_user_id
        and actor_profile.is_admin
    )
  then
    return query select 'unavailable'::text, null::text, null::text;
    return;
  end if;

  if p_verified then
    if institution_row.verification_status = 'verified' then
      return query select 'unchanged'::text, institution_row.verification_status, institution_row.public_status;
      return;
    end if;

    update public.institutions institution
    set verification_status = 'verified',
        verified_at = clock_time,
        verified_by_user_id = p_actor_user_id,
        verification_revoked_at = null,
        verification_revoked_by_user_id = null
    where institution.id = institution_row.id;

    insert into public.institution_audit_events (
      institution_id, actor_user_id, subject_user_id, action, created_at
    ) values (
      institution_row.id, p_actor_user_id, institution_row.owner_user_id,
      'verification_granted', clock_time
    );

    return query select 'verified'::text, 'verified'::text, institution_row.public_status;
    return;
  end if;

  if institution_row.verification_status <> 'verified' then
    return query select 'unchanged'::text, institution_row.verification_status, institution_row.public_status;
    return;
  end if;

  update public.institutions institution
  set verification_status = 'revoked',
      public_status = 'private',
      verification_revoked_at = clock_time,
      verification_revoked_by_user_id = p_actor_user_id,
      unpublished_at = case
        when institution.public_status = 'public' then clock_time
        else institution.unpublished_at
      end
  where institution.id = institution_row.id;

  insert into public.institution_audit_events (
    institution_id, actor_user_id, subject_user_id, action, created_at
  ) values (
    institution_row.id, p_actor_user_id, institution_row.owner_user_id,
    'verification_revoked', clock_time
  );

  return query select 'revoked'::text, 'revoked'::text, 'private'::text;
end;
$transition_institution_verification$;

create or replace function public.transition_institution_publication_v1(
  p_institution_id uuid,
  p_actor_user_id uuid,
  p_public boolean
)
returns table (outcome text, public_status text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $transition_institution_publication$
declare
  institution_row public.institutions;
  clock_time timestamptz := statement_timestamp();
begin
  select institution.*
  into institution_row
  from public.institutions institution
  where institution.id = p_institution_id
  for update;

  if institution_row.id is null
    or p_public is null
    or institution_row.owner_user_id <> p_actor_user_id
    or not exists (
      select 1 from public.profiles actor_profile
      where actor_profile.id = p_actor_user_id
    )
  then
    return query select 'unavailable'::text, null::text;
    return;
  end if;

  if p_public then
    if institution_row.verification_status <> 'verified' then
      return query select 'not_verified'::text, institution_row.public_status;
      return;
    end if;
    if institution_row.public_status = 'public' then
      return query select 'unchanged'::text, 'public'::text;
      return;
    end if;

    update public.institutions institution
    set public_status = 'public',
        published_at = clock_time,
        unpublished_at = null
    where institution.id = institution_row.id;

    insert into public.institution_audit_events (
      institution_id, actor_user_id, subject_user_id, action, created_at
    ) values (
      institution_row.id, p_actor_user_id, p_actor_user_id, 'published', clock_time
    );

    return query select 'published'::text, 'public'::text;
    return;
  end if;

  if institution_row.public_status = 'private' then
    return query select 'unchanged'::text, 'private'::text;
    return;
  end if;

  update public.institutions institution
  set public_status = 'private',
      unpublished_at = clock_time
  where institution.id = institution_row.id;

  insert into public.institution_audit_events (
    institution_id, actor_user_id, subject_user_id, action, created_at
  ) values (
    institution_row.id, p_actor_user_id, p_actor_user_id, 'unpublished', clock_time
  );

  return query select 'unpublished'::text, 'private'::text;
end;
$transition_institution_publication$;

create or replace function public.invite_institution_member_v1(
  p_institution_id uuid,
  p_actor_user_id uuid,
  p_target_user_id uuid
)
returns table (outcome text, invited_at timestamptz, expires_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public
as $invite_institution_member$
declare
  institution_row public.institutions;
  member_row public.institution_members;
  clock_time timestamptz := statement_timestamp();
begin
  select institution.*
  into institution_row
  from public.institutions institution
  where institution.id = p_institution_id
  for update;

  if institution_row.id is null
    or institution_row.owner_user_id <> p_actor_user_id
    or p_target_user_id is null
    or p_target_user_id = p_actor_user_id
    or not exists (
      select 1 from public.profiles actor_profile
      where actor_profile.id = p_actor_user_id
    )
    or not exists (
      select 1 from public.profiles target_profile
      where target_profile.id = p_target_user_id
    )
  then
    return query select 'unavailable'::text, null::timestamptz, null::timestamptz;
    return;
  end if;

  select member.*
  into member_row
  from public.institution_members member
  where member.institution_id = institution_row.id
    and member.user_id = p_target_user_id
    and member.status <> 'removed'
  for update;

  if member_row.id is not null then
    if member_row.status = 'invited' and member_row.invite_expires_at <= clock_time then
      update public.institution_members member
      set status = 'removed',
          removed_at = clock_time
      where member.id = member_row.id;

      insert into public.institution_audit_events (
        institution_id, actor_user_id, subject_user_id, action, created_at
      ) values (
        institution_row.id, p_actor_user_id, p_target_user_id,
        'invitation_expired', clock_time
      );
    elsif member_row.status = 'invited' then
      return query select 'already_invited'::text, null::timestamptz, null::timestamptz;
      return;
    elsif member_row.status = 'active' then
      return query select 'already_active'::text, null::timestamptz, null::timestamptz;
      return;
    else
      return query select 'unavailable'::text, null::timestamptz, null::timestamptz;
      return;
    end if;
  end if;

  insert into public.institution_members (
    institution_id,
    user_id,
    role,
    status,
    invite_expires_at,
    created_at,
    updated_at
  ) values (
    institution_row.id,
    p_target_user_id,
    'member',
    'invited',
    clock_time + interval '14 days',
    clock_time,
    clock_time
  )
  returning created_at, invite_expires_at into invited_at, expires_at;

  insert into public.institution_audit_events (
    institution_id, actor_user_id, subject_user_id, action, created_at
  ) values (
    institution_row.id, p_actor_user_id, p_target_user_id, 'member_invited', clock_time
  );

  outcome := 'invited';
  return next;
end;
$invite_institution_member$;

create or replace function public.respond_institution_invitation_v1(
  p_institution_id uuid,
  p_actor_user_id uuid,
  p_action text
)
returns table (outcome text, responded_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public
as $respond_institution_invitation$
declare
  institution_row public.institutions;
  member_row public.institution_members;
  clock_time timestamptz := statement_timestamp();
begin
  select institution.*
  into institution_row
  from public.institutions institution
  where institution.id = p_institution_id
  for update;

  if institution_row.id is null
    or p_action is null
    or p_action not in ('accept', 'decline')
    or not exists (
      select 1 from public.profiles actor_profile
      where actor_profile.id = p_actor_user_id
    )
  then
    return query select 'unavailable'::text, null::timestamptz;
    return;
  end if;

  select member.*
  into member_row
  from public.institution_members member
  where member.institution_id = institution_row.id
    and member.user_id = p_actor_user_id
    and member.role = 'member'
    and member.status = 'invited'
  for update;

  if member_row.id is null then
    return query select 'unavailable'::text, null::timestamptz;
    return;
  end if;

  if member_row.invite_expires_at <= clock_time then
    update public.institution_members member
    set status = 'removed',
        removed_at = clock_time
    where member.id = member_row.id;

    insert into public.institution_audit_events (
      institution_id, actor_user_id, subject_user_id, action, created_at
    ) values (
      institution_row.id, p_actor_user_id, p_actor_user_id,
      'invitation_expired', clock_time
    );

    return query select 'stale'::text, null::timestamptz;
    return;
  end if;

  if p_action = 'accept' then
    update public.institution_members member
    set status = 'active',
        responded_at = clock_time
    where member.id = member_row.id;

    insert into public.institution_audit_events (
      institution_id, actor_user_id, subject_user_id, action, created_at
    ) values (
      institution_row.id, p_actor_user_id, p_actor_user_id,
      'invitation_accepted', clock_time
    );

    return query select 'accepted'::text, clock_time;
    return;
  end if;

  update public.institution_members member
  set status = 'removed',
      responded_at = clock_time,
      removed_at = clock_time
  where member.id = member_row.id;

  insert into public.institution_audit_events (
    institution_id, actor_user_id, subject_user_id, action, created_at
  ) values (
    institution_row.id, p_actor_user_id, p_actor_user_id,
    'invitation_declined', clock_time
  );

  return query select 'declined'::text, clock_time;
end;
$respond_institution_invitation$;

create or replace function public.revoke_institution_member_v1(
  p_institution_id uuid,
  p_actor_user_id uuid,
  p_target_user_id uuid
)
returns table (outcome text, removed_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public
as $revoke_institution_member$
declare
  institution_row public.institutions;
  member_row public.institution_members;
  clock_time timestamptz := statement_timestamp();
begin
  select institution.*
  into institution_row
  from public.institutions institution
  where institution.id = p_institution_id
  for update;

  if institution_row.id is null
    or institution_row.owner_user_id <> p_actor_user_id
    or p_target_user_id is null
    or p_target_user_id = p_actor_user_id
    or not exists (
      select 1 from public.profiles actor_profile
      where actor_profile.id = p_actor_user_id
    )
    or not exists (
      select 1 from public.profiles target_profile
      where target_profile.id = p_target_user_id
    )
  then
    return query select 'unavailable'::text, null::timestamptz;
    return;
  end if;

  select member.*
  into member_row
  from public.institution_members member
  where member.institution_id = institution_row.id
    and member.user_id = p_target_user_id
    and member.role = 'member'
    and member.status in ('invited', 'active')
  for update;

  if member_row.id is null then
    return query select 'unavailable'::text, null::timestamptz;
    return;
  end if;

  update public.institution_members member
  set status = 'removed',
      removed_at = clock_time
  where member.id = member_row.id;

  insert into public.institution_audit_events (
    institution_id, actor_user_id, subject_user_id, action, created_at
  ) values (
    institution_row.id, p_actor_user_id, p_target_user_id, 'member_revoked', clock_time
  );

  return query select 'revoked'::text, clock_time;
end;
$revoke_institution_member$;

alter function public.set_institution_updated_at_v1() owner to postgres;
alter function public.prevent_institution_identity_change_v1() owner to postgres;
alter function public.enforce_institution_member_identity_v1() owner to postgres;
alter function public.prevent_institution_audit_mutation_v1() owner to postgres;
alter function public.provision_institution_v1(uuid, uuid, text, text, text) owner to postgres;
alter function public.transition_institution_verification_v1(uuid, uuid, boolean) owner to postgres;
alter function public.transition_institution_publication_v1(uuid, uuid, boolean) owner to postgres;
alter function public.invite_institution_member_v1(uuid, uuid, uuid) owner to postgres;
alter function public.respond_institution_invitation_v1(uuid, uuid, text) owner to postgres;
alter function public.revoke_institution_member_v1(uuid, uuid, uuid) owner to postgres;

revoke all on function public.set_institution_updated_at_v1()
  from public, anon, authenticated;
revoke all on function public.prevent_institution_identity_change_v1()
  from public, anon, authenticated;
revoke all on function public.enforce_institution_member_identity_v1()
  from public, anon, authenticated;
revoke all on function public.prevent_institution_audit_mutation_v1()
  from public, anon, authenticated;
revoke all on function public.provision_institution_v1(uuid, uuid, text, text, text)
  from public, anon, authenticated;
revoke all on function public.transition_institution_verification_v1(uuid, uuid, boolean)
  from public, anon, authenticated;
revoke all on function public.transition_institution_publication_v1(uuid, uuid, boolean)
  from public, anon, authenticated;
revoke all on function public.invite_institution_member_v1(uuid, uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.respond_institution_invitation_v1(uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.revoke_institution_member_v1(uuid, uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.provision_institution_v1(uuid, uuid, text, text, text)
  to service_role;
grant execute on function public.transition_institution_verification_v1(uuid, uuid, boolean)
  to service_role;
grant execute on function public.transition_institution_publication_v1(uuid, uuid, boolean)
  to service_role;
grant execute on function public.invite_institution_member_v1(uuid, uuid, uuid)
  to service_role;
grant execute on function public.respond_institution_invitation_v1(uuid, uuid, text)
  to service_role;
grant execute on function public.revoke_institution_member_v1(uuid, uuid, uuid)
  to service_role;

comment on table public.institutions is
  'Institution principal and public identity. Existing Station resources remain personal.';
comment on column public.institutions.owner_user_id is
  'Sole immutable institution owner authority; never inferred from a membership row.';
comment on table public.institution_members is
  'Private read-only institution team membership; grants no ownership or resource access.';
comment on column public.institution_members.invite_expires_at is
  'Database-clock fourteen-day invitation expiry; never a browser authorization claim.';
comment on table public.institution_audit_events is
  'Typed append-only institution lifecycle evidence without free-form payload.';

do $pr535b_postassert$
declare
  relation_fingerprint jsonb;
  policy_fingerprint jsonb;
  grant_fingerprint jsonb;
  transition_function_count integer;
begin
  if (
    select count(*)
    from information_schema.role_table_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name = 'profiles'
      and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
  ) <> 7 or exists (
    select 1
    from information_schema.role_table_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name = 'profiles'
      and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
      and (
        grant_row.grantee <> 'service_role'
        or grant_row.privilege_type not in (
          'DELETE', 'INSERT', 'REFERENCES', 'SELECT', 'TRIGGER', 'TRUNCATE', 'UPDATE'
        )
      )
  ) or (
    select count(*)
    from information_schema.role_column_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name = 'profiles'
      and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
  ) <> 70 or (
    select count(*)
    from information_schema.role_column_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name = 'profiles'
      and grant_row.grantee in ('anon', 'authenticated')
      and grant_row.privilege_type = 'SELECT'
      and grant_row.column_name in ('id', 'tier', 'is_admin')
  ) <> 6 or (
    select count(*)
    from information_schema.role_column_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name = 'profiles'
      and grant_row.grantee = 'service_role'
      and grant_row.privilege_type in ('INSERT', 'REFERENCES', 'SELECT', 'UPDATE')
      and grant_row.column_name in (
        'id', 'username', 'display_name', 'bio', 'avatar_url', 'tier',
        'stripe_customer_id', 'stripe_subscription_id', 'subscription_status',
        'byok_openai_key', 'byok_anthropic_key', 'byok_deepseek_key', 'ai_mode',
        'is_admin', 'created_at', 'updated_at'
      )
  ) <> 64 or exists (
    select 1
    from information_schema.role_column_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name = 'profiles'
      and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
      and not (
        (
          grant_row.grantee in ('anon', 'authenticated')
          and grant_row.privilege_type = 'SELECT'
          and grant_row.column_name in ('id', 'tier', 'is_admin')
        )
        or (
          grant_row.grantee = 'service_role'
          and grant_row.privilege_type in ('INSERT', 'REFERENCES', 'SELECT', 'UPDATE')
          and grant_row.column_name in (
            'id', 'username', 'display_name', 'bio', 'avatar_url', 'tier',
            'stripe_customer_id', 'stripe_subscription_id', 'subscription_status',
            'byok_openai_key', 'byok_anthropic_key', 'byok_deepseek_key', 'ai_mode',
            'is_admin', 'created_at', 'updated_at'
          )
        )
      )
  ) then
    raise exception 'PR535B postassert direct profile ACL differs from migration 091';
  end if;

  if exists (
    select 1
    from unnest(array['anon', 'authenticated']::text[]) browser_role(role_name)
    cross join unnest(array[
      'DELETE', 'INSERT', 'REFERENCES', 'SELECT', 'TRIGGER', 'TRUNCATE', 'UPDATE'
    ]::text[]) profile_privilege(privilege_name)
    where pg_catalog.has_table_privilege(
      browser_role.role_name,
      'public.profiles',
      profile_privilege.privilege_name
    )
  ) or exists (
    select 1
    from unnest(array['anon', 'authenticated']::text[]) browser_role(role_name)
    cross join unnest(array[
      'id', 'username', 'display_name', 'bio', 'avatar_url', 'tier',
      'stripe_customer_id', 'stripe_subscription_id', 'subscription_status',
      'byok_openai_key', 'byok_anthropic_key', 'byok_deepseek_key', 'ai_mode',
      'is_admin', 'created_at', 'updated_at'
    ]::text[]) profile_column(column_name)
    cross join unnest(array['INSERT', 'REFERENCES', 'SELECT', 'UPDATE']::text[])
      profile_privilege(privilege_name)
    where pg_catalog.has_column_privilege(
      browser_role.role_name,
      'public.profiles',
      profile_column.column_name,
      profile_privilege.privilege_name
    ) is distinct from (
      profile_privilege.privilege_name = 'SELECT'
      and profile_column.column_name in ('id', 'tier', 'is_admin')
    )
  ) then
    raise exception 'PR535B postassert effective browser profile ACL differs from migration 091';
  end if;

  if exists (
    select 1
    from unnest(array[
      'DELETE', 'INSERT', 'REFERENCES', 'SELECT', 'TRIGGER', 'TRUNCATE', 'UPDATE'
    ]::text[]) profile_privilege(privilege_name)
    where not pg_catalog.has_table_privilege(
      'service_role',
      'public.profiles',
      profile_privilege.privilege_name
    )
  ) or exists (
    select 1
    from unnest(array[
      'id', 'username', 'display_name', 'bio', 'avatar_url', 'tier',
      'stripe_customer_id', 'stripe_subscription_id', 'subscription_status',
      'byok_openai_key', 'byok_anthropic_key', 'byok_deepseek_key', 'ai_mode',
      'is_admin', 'created_at', 'updated_at'
    ]::text[]) profile_column(column_name)
    cross join unnest(array['INSERT', 'REFERENCES', 'SELECT', 'UPDATE']::text[])
      profile_privilege(privilege_name)
    where not pg_catalog.has_column_privilege(
      'service_role',
      'public.profiles',
      profile_column.column_name,
      profile_privilege.privilege_name
    )
  ) then
    raise exception 'PR535B postassert trusted service profile ACL differs from migration 091';
  end if;

  if exists (
    select 1
    from information_schema.columns column_row
    where column_row.table_schema = 'public'
      and column_row.column_name = 'institution_id'
      and column_row.table_name not in ('institution_members', 'institution_audit_events')
  ) then
    raise exception 'PR535B attached an existing resource to an institution';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_policies policy_row
    where policy_row.schemaname = 'public'
      and policy_row.tablename in (
        'institutions',
        'institution_members',
        'institution_audit_events'
      )
  ) then
    raise exception 'PR535B institution tables must have zero browser policies';
  end if;

  if (
    select count(*)
    from pg_catalog.pg_class relation_row
    join pg_catalog.pg_namespace namespace_row
      on namespace_row.oid = relation_row.relnamespace
    where namespace_row.nspname = 'public'
      and relation_row.relname in (
        'institutions',
        'institution_members',
        'institution_audit_events'
      )
      and relation_row.relkind in ('r', 'p')
      and relation_row.relrowsecurity
      and not relation_row.relforcerowsecurity
  ) <> 3 then
    raise exception 'PR535B expected three enabled, non-forced RLS tables';
  end if;

  if exists (
    select 1
    from information_schema.role_table_grants grant_row
    where grant_row.table_schema = 'public'
      and grant_row.table_name in (
        'institutions',
        'institution_members',
        'institution_audit_events'
      )
      and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated')
  ) then
    raise exception 'PR535B left a direct browser institution table privilege';
  end if;

  if exists (
    select 1
    from unnest(array['anon', 'authenticated']::text[]) browser_role(role_name)
    cross join unnest(array[
      'public.institutions',
      'public.institution_members',
      'public.institution_audit_events'
    ]::text[]) protected_table(table_name)
    cross join unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']::text[])
      protected_privilege(privilege_name)
    where has_table_privilege(
      browser_role.role_name,
      protected_table.table_name,
      protected_privilege.privilege_name
    )
  ) then
    raise exception 'PR535B left an effective browser institution table privilege';
  end if;

  if exists (
    select 1
    from unnest(array[
      'public.institutions',
      'public.institution_members',
      'public.institution_audit_events'
    ]::text[]) protected_table(table_name)
    cross join unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']::text[])
      protected_privilege(privilege_name)
    where not has_table_privilege(
      'service_role',
      protected_table.table_name,
      protected_privilege.privilege_name
    )
  ) then
    raise exception 'PR535B service institution table privileges are incomplete';
  end if;

  select count(*)::integer
  into transition_function_count
  from pg_catalog.pg_proc procedure_row
  where procedure_row.oid = any(array[
      pg_catalog.to_regprocedure('public.provision_institution_v1(uuid,uuid,text,text,text)'),
      pg_catalog.to_regprocedure('public.transition_institution_verification_v1(uuid,uuid,boolean)'),
      pg_catalog.to_regprocedure('public.transition_institution_publication_v1(uuid,uuid,boolean)'),
      pg_catalog.to_regprocedure('public.invite_institution_member_v1(uuid,uuid,uuid)'),
      pg_catalog.to_regprocedure('public.respond_institution_invitation_v1(uuid,uuid,text)'),
      pg_catalog.to_regprocedure('public.revoke_institution_member_v1(uuid,uuid,uuid)')
    ]::oid[])
    and procedure_row.prosecdef
    and array_to_string(procedure_row.proconfig, ',') like '%search_path=pg_catalog, public%';

  if transition_function_count <> 6 then
    raise exception 'PR535B expected six fixed-search-path SECURITY DEFINER transitions';
  end if;

  if exists (
    select 1
    from (
      values
        ('public.provision_institution_v1(uuid,uuid,text,text,text)'),
        ('public.transition_institution_verification_v1(uuid,uuid,boolean)'),
        ('public.transition_institution_publication_v1(uuid,uuid,boolean)'),
        ('public.invite_institution_member_v1(uuid,uuid,uuid)'),
        ('public.respond_institution_invitation_v1(uuid,uuid,text)'),
        ('public.revoke_institution_member_v1(uuid,uuid,uuid)')
    ) expected(signature)
    where has_function_privilege('anon', expected.signature, 'EXECUTE')
      or has_function_privilege('authenticated', expected.signature, 'EXECUTE')
      or not has_function_privilege('service_role', expected.signature, 'EXECUTE')
  ) then
    raise exception 'PR535B transition execute grants are not service-only';
  end if;

  select jsonb_agg(
    jsonb_build_array(
      relation_row.relname,
      relation_row.relkind,
      relation_row.relrowsecurity,
      relation_row.relforcerowsecurity,
      coalesce((
        select jsonb_agg(
          jsonb_build_array(
            attribute_row.attnum,
            attribute_row.attname,
            attribute_row.atttypid,
            attribute_row.attnotnull
          )
          order by attribute_row.attnum
        )
        from pg_catalog.pg_attribute attribute_row
        where attribute_row.attrelid = relation_row.oid
          and attribute_row.attnum > 0
          and not attribute_row.attisdropped
      ), '[]'::jsonb)
    )
    order by relation_row.relname
  )
  into relation_fingerprint
  from pg_catalog.pg_class relation_row
  join pg_catalog.pg_namespace namespace_row
    on namespace_row.oid = relation_row.relnamespace
  where namespace_row.nspname = 'public'
    and relation_row.relkind in ('r', 'p')
    and relation_row.relname not in (
      'institutions',
      'institution_members',
      'institution_audit_events'
    );

  select coalesce(jsonb_agg(
    jsonb_build_array(
      policy_row.tablename,
      policy_row.policyname,
      policy_row.permissive,
      policy_row.roles,
      policy_row.cmd,
      policy_row.qual,
      policy_row.with_check
    )
    order by policy_row.tablename, policy_row.policyname
  ), '[]'::jsonb)
  into policy_fingerprint
  from pg_catalog.pg_policies policy_row
  where policy_row.schemaname = 'public'
    and policy_row.tablename not in (
      'institutions',
      'institution_members',
      'institution_audit_events'
    );

  select coalesce(jsonb_agg(
    jsonb_build_array(
      grant_row.table_name,
      grant_row.grantee,
      grant_row.privilege_type
    )
    order by grant_row.table_name, grant_row.grantee, grant_row.privilege_type
  ), '[]'::jsonb)
  into grant_fingerprint
  from information_schema.role_table_grants grant_row
  where grant_row.table_schema = 'public'
    and grant_row.table_name not in (
      'institutions',
      'institution_members',
      'institution_audit_events'
    )
    and grant_row.grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role');

  if relation_fingerprint is distinct from
      pg_catalog.current_setting('station.pr535b_relation_fingerprint', true)::jsonb
    or policy_fingerprint is distinct from
      pg_catalog.current_setting('station.pr535b_policy_fingerprint', true)::jsonb
    or grant_fingerprint is distinct from
      pg_catalog.current_setting('station.pr535b_grant_fingerprint', true)::jsonb
  then
    raise exception 'PR535B changed an existing relation, policy, or table grant';
  end if;
end;
$pr535b_postassert$;

notify pgrst, 'reload schema';

commit;
