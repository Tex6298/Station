-- ============================================================
-- PR534 Project collaboration viewer membership
-- Service-owned lifecycle; no direct browser table access.
-- ============================================================

alter table public.project_members
  add column if not exists invite_expires_at timestamptz,
  add column if not exists responded_at timestamptz,
  add column if not exists removed_at timestamptz;

do $$
begin
  if exists (
    select 1
    from public.project_members pm
    join public.projects p on p.id = pm.project_id
    where pm.role = 'owner'
      and (pm.status <> 'active' or pm.user_id <> p.owner_user_id)
  ) then
    raise exception 'project owner membership contradicts authoritative ownership';
  end if;

  if exists (
    select 1
    from public.project_members pm
    join public.projects p on p.id = pm.project_id
    where pm.user_id = p.owner_user_id
      and pm.status <> 'removed'
      and (pm.role <> 'owner' or pm.status <> 'active')
  ) then
    raise exception 'authoritative project owner has a contradictory current membership';
  end if;
end;
$$;

-- Viewer rows predate an accepted viewer contract. Retire them rather than
-- inferring invitation or acceptance from a dormant role label.
update public.project_members
set status = 'removed',
    invite_expires_at = null,
    responded_at = null,
    removed_at = coalesce(removed_at, statement_timestamp()),
    updated_at = statement_timestamp()
where role = 'viewer'
  and status <> 'removed';

update public.project_members
set invite_expires_at = null,
    responded_at = null,
    removed_at = null
where role <> 'viewer';

update public.project_members
set removed_at = coalesce(removed_at, statement_timestamp())
where role = 'viewer'
  and status = 'removed';

insert into public.project_members (project_id, user_id, role, status)
select p.id, p.owner_user_id, 'owner', 'active'
from public.projects p
where not exists (
  select 1
  from public.project_members pm
  where pm.project_id = p.id
    and pm.user_id = p.owner_user_id
    and pm.status <> 'removed'
);

alter table public.project_members
  drop constraint if exists project_members_viewer_lifecycle_check;

alter table public.project_members
  add constraint project_members_viewer_lifecycle_check
  check (
    (
      role = 'viewer'
      and (
        (status = 'invited' and invite_expires_at is not null and responded_at is null and removed_at is null)
        or (status = 'active' and invite_expires_at is not null and responded_at is not null and removed_at is null)
        or (status = 'removed' and removed_at is not null)
      )
    )
    or (
      role <> 'viewer'
      and invite_expires_at is null
      and responded_at is null
      and removed_at is null
    )
  ) not valid;

alter table public.project_members
  validate constraint project_members_viewer_lifecycle_check;

alter table public.project_members
  drop constraint if exists project_members_owner_shape_check;

alter table public.project_members
  add constraint project_members_owner_shape_check
  check (role <> 'owner' or status = 'active') not valid;

alter table public.project_members
  validate constraint project_members_owner_shape_check;

create unique index if not exists project_members_active_owner_project_idx
  on public.project_members (project_id)
  where role = 'owner' and status = 'active';

create index if not exists project_members_pending_viewer_user_idx
  on public.project_members (user_id, role, status, invite_expires_at)
  where role = 'viewer' and status = 'invited';

create or replace function public.assert_project_owner_membership_v1()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
declare
  checked_project_id uuid;
  checked_project_ids uuid[];
  authoritative_owner_id uuid;
  matching_owner_count integer;
  active_owner_count integer;
begin
  if tg_table_name = 'projects' then
    checked_project_ids := array[case when tg_op = 'DELETE' then old.id else new.id end];
  elsif tg_op = 'UPDATE' and old.project_id is distinct from new.project_id then
    checked_project_ids := array[old.project_id, new.project_id];
  else
    checked_project_ids := array[case when tg_op = 'DELETE' then old.project_id else new.project_id end];
  end if;

  foreach checked_project_id in array checked_project_ids loop
    select p.owner_user_id
    into authoritative_owner_id
    from public.projects p
    where p.id = checked_project_id;

    if authoritative_owner_id is not null then
      select
        count(*) filter (where pm.user_id = authoritative_owner_id),
        count(*)
      into matching_owner_count, active_owner_count
      from public.project_members pm
      where pm.project_id = checked_project_id
        and pm.role = 'owner'
        and pm.status = 'active';

      if matching_owner_count <> 1 or active_owner_count <> 1 then
        raise exception 'project must have one matching active owner membership';
      end if;
    end if;
  end loop;

  return null;
end;
$$;

drop trigger if exists trg_projects_owner_membership_invariant
  on public.projects;

create constraint trigger trg_projects_owner_membership_invariant
  after insert or update or delete on public.projects
  deferrable initially deferred
  for each row execute function public.assert_project_owner_membership_v1();

drop trigger if exists trg_project_members_owner_membership_invariant
  on public.project_members;

create constraint trigger trg_project_members_owner_membership_invariant
  after insert or update or delete on public.project_members
  deferrable initially deferred
  for each row execute function public.assert_project_owner_membership_v1();

create or replace function public.prevent_project_owner_change_v1()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.owner_user_id is distinct from old.owner_user_id then
    raise exception 'project owner is immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_projects_prevent_owner_change
  on public.projects;

create trigger trg_projects_prevent_owner_change
  before update of owner_user_id on public.projects
  for each row execute function public.prevent_project_owner_change_v1();

drop policy if exists "project_members_all_project_owner"
  on public.project_members;

revoke all on table public.project_members from public, anon, authenticated;

create or replace function public.create_project_with_owner_v1(
  p_actor_user_id uuid,
  p_name text,
  p_slug text,
  p_description text,
  p_visibility text,
  p_connection_tier text
)
returns public.projects
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created_project public.projects;
begin
  if p_actor_user_id is null
    or not exists (select 1 from public.profiles pr where pr.id = p_actor_user_id)
    or p_name is null
    or length(btrim(p_name)) < 1
    or length(p_name) > 120
    or (p_description is not null and length(p_description) > 4000)
    or p_slug is null
    or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    or length(p_slug) < 3
    or length(p_slug) > 80
    or p_visibility is null
    or p_visibility not in ('private', 'unlisted', 'community', 'public')
    or p_connection_tier is null
    or p_connection_tier not in ('tier_1_showcase', 'tier_2_hosted', 'tier_3_lab')
  then
    raise exception 'invalid project create request';
  end if;

  insert into public.projects (
    owner_user_id,
    name,
    slug,
    description,
    visibility,
    connection_tier
  ) values (
    p_actor_user_id,
    btrim(p_name),
    p_slug,
    nullif(btrim(p_description), ''),
    p_visibility,
    p_connection_tier
  )
  returning * into created_project;

  insert into public.project_members (project_id, user_id, role, status)
  values (created_project.id, p_actor_user_id, 'owner', 'active');

  return created_project;
end;
$$;

create or replace function public.invite_project_viewer_v1(
  p_project_id uuid,
  p_actor_user_id uuid,
  p_target_user_id uuid
)
returns table (outcome text, invited_at timestamptz, expires_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  project_row public.projects;
  membership_row public.project_members;
  clock_time timestamptz := statement_timestamp();
begin
  select p.*
  into project_row
  from public.projects p
  where p.id = p_project_id
  for update;

  if project_row.id is null
    or project_row.owner_user_id <> p_actor_user_id
    or p_target_user_id is null
    or p_target_user_id = p_actor_user_id
    or not exists (
      select 1
      from public.project_members pm
      where pm.project_id = project_row.id
        and pm.user_id = p_actor_user_id
        and pm.role = 'owner'
        and pm.status = 'active'
    )
    or not exists (select 1 from public.profiles pr where pr.id = p_target_user_id)
  then
    return query select 'unavailable'::text, null::timestamptz, null::timestamptz;
    return;
  end if;

  select pm.*
  into membership_row
  from public.project_members pm
  where pm.project_id = project_row.id
    and pm.user_id = p_target_user_id
    and pm.status <> 'removed'
  for update;

  if membership_row.id is not null then
    if membership_row.role = 'viewer'
      and membership_row.status = 'invited'
      and membership_row.invite_expires_at <= clock_time
    then
      update public.project_members pm
      set status = 'removed',
          removed_at = clock_time,
          updated_at = clock_time
      where pm.id = membership_row.id;
    elsif membership_row.role = 'viewer' and membership_row.status = 'invited' then
      return query select 'already_invited'::text, null::timestamptz, null::timestamptz;
      return;
    elsif membership_row.role = 'viewer' and membership_row.status = 'active' then
      return query select 'already_active'::text, null::timestamptz, null::timestamptz;
      return;
    else
      return query select 'unavailable'::text, null::timestamptz, null::timestamptz;
      return;
    end if;
  end if;

  insert into public.project_members (
    project_id,
    user_id,
    role,
    status,
    invite_expires_at
  ) values (
    project_row.id,
    p_target_user_id,
    'viewer',
    'invited',
    clock_time + interval '14 days'
  )
  returning created_at, invite_expires_at into invited_at, expires_at;

  outcome := 'invited';
  return next;
end;
$$;

create or replace function public.respond_project_viewer_invitation_v1(
  p_project_id uuid,
  p_actor_user_id uuid,
  p_action text
)
returns table (outcome text, responded_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  membership_row public.project_members;
  clock_time timestamptz := statement_timestamp();
begin
  if p_action not in ('accept', 'decline')
    or not exists (select 1 from public.projects p where p.id = p_project_id)
  then
    return query select 'unavailable'::text, null::timestamptz;
    return;
  end if;

  select pm.*
  into membership_row
  from public.project_members pm
  where pm.project_id = p_project_id
    and pm.user_id = p_actor_user_id
    and pm.role = 'viewer'
    and pm.status = 'invited'
  for update;

  if membership_row.id is null then
    return query select 'unavailable'::text, null::timestamptz;
    return;
  end if;

  if membership_row.invite_expires_at <= clock_time then
    update public.project_members pm
    set status = 'removed',
        removed_at = clock_time,
        updated_at = clock_time
    where pm.id = membership_row.id;

    return query select 'stale'::text, null::timestamptz;
    return;
  end if;

  if p_action = 'accept' then
    update public.project_members pm
    set status = 'active',
        responded_at = clock_time,
        updated_at = clock_time
    where pm.id = membership_row.id;

    return query select 'accepted'::text, clock_time;
    return;
  end if;

  update public.project_members pm
  set status = 'removed',
      removed_at = clock_time,
      updated_at = clock_time
  where pm.id = membership_row.id;

  return query select 'declined'::text, clock_time;
end;
$$;

create or replace function public.revoke_project_viewer_v1(
  p_project_id uuid,
  p_actor_user_id uuid,
  p_target_user_id uuid
)
returns table (outcome text, removed_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  project_row public.projects;
  membership_row public.project_members;
  clock_time timestamptz := statement_timestamp();
begin
  select p.*
  into project_row
  from public.projects p
  where p.id = p_project_id
  for update;

  if project_row.id is null
    or project_row.owner_user_id <> p_actor_user_id
    or p_target_user_id is null
    or p_target_user_id = p_actor_user_id
    or not exists (
      select 1
      from public.project_members pm
      where pm.project_id = project_row.id
        and pm.user_id = p_actor_user_id
        and pm.role = 'owner'
        and pm.status = 'active'
    )
  then
    return query select 'unavailable'::text, null::timestamptz;
    return;
  end if;

  select pm.*
  into membership_row
  from public.project_members pm
  where pm.project_id = project_row.id
    and pm.user_id = p_target_user_id
    and pm.role = 'viewer'
    and pm.status in ('invited', 'active')
  for update;

  if membership_row.id is null then
    return query select 'unavailable'::text, null::timestamptz;
    return;
  end if;

  update public.project_members pm
  set status = 'removed',
      removed_at = clock_time,
      updated_at = clock_time
  where pm.id = membership_row.id;

  return query select 'revoked'::text, clock_time;
end;
$$;

alter function public.assert_project_owner_membership_v1() owner to postgres;
alter function public.prevent_project_owner_change_v1() owner to postgres;
alter function public.create_project_with_owner_v1(uuid, text, text, text, text, text) owner to postgres;
alter function public.invite_project_viewer_v1(uuid, uuid, uuid) owner to postgres;
alter function public.respond_project_viewer_invitation_v1(uuid, uuid, text) owner to postgres;
alter function public.revoke_project_viewer_v1(uuid, uuid, uuid) owner to postgres;

revoke all on function public.create_project_with_owner_v1(uuid, text, text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.invite_project_viewer_v1(uuid, uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.respond_project_viewer_invitation_v1(uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.revoke_project_viewer_v1(uuid, uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.create_project_with_owner_v1(uuid, text, text, text, text, text)
  to service_role;
grant execute on function public.invite_project_viewer_v1(uuid, uuid, uuid)
  to service_role;
grant execute on function public.respond_project_viewer_invitation_v1(uuid, uuid, text)
  to service_role;
grant execute on function public.revoke_project_viewer_v1(uuid, uuid, uuid)
  to service_role;

comment on column public.project_members.invite_expires_at is
  'Database-clock expiry for a viewer invitation; never a browser authorization claim.';

comment on function public.invite_project_viewer_v1(uuid, uuid, uuid) is
  'Service-only exact-target viewer invitation transition with bounded outcomes.';
