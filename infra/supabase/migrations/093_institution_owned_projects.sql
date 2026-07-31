-- PR538 institution-owned Project principal and bounded create transition
begin;

select pg_advisory_xact_lock(hashtextextended('station.pr538.institution_owned_projects.093', 0));
lock table public.projects in share row exclusive mode;
lock table public.project_members in share row exclusive mode;
lock table public.institutions in share mode;
lock table public.institution_members in share mode;

do $preflight$
begin
  if to_regclass('public.projects') is null
    or to_regclass('public.project_members') is null
    or to_regclass('public.institutions') is null
    or to_regclass('public.institution_members') is null
  then
    raise exception 'PR538 prerequisite relation missing';
  end if;
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='projects' and column_name='institution_id') then
    raise exception 'PR538 institution principal already exists';
  end if;
  if exists(select 1 from public.projects where owner_user_id is null) then
    raise exception 'PR538 personal Project owner drift';
  end if;
  if exists(
    select 1 from public.projects p
    where (select count(*) from public.project_members pm where pm.project_id=p.id and pm.role='owner' and pm.status='active') <> 1
       or not exists(select 1 from public.project_members pm where pm.project_id=p.id and pm.role='owner' and pm.status='active' and pm.user_id=p.owner_user_id)
  ) then
    raise exception 'PR538 personal owner membership drift';
  end if;
end;
$preflight$;

alter table public.projects alter column owner_user_id drop not null;
alter table public.projects add column institution_id uuid references public.institutions(id) on delete restrict;
alter table public.projects add constraint projects_exactly_one_principal_check
  check ((owner_user_id is not null)::int + (institution_id is not null)::int = 1) not valid;
alter table public.projects validate constraint projects_exactly_one_principal_check;
create index projects_institution_created_idx on public.projects(institution_id, created_at desc) where institution_id is not null;

create or replace function public.assert_project_owner_membership_v1()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $invariant$
declare
  checked_project_id uuid;
  checked_project_ids uuid[];
  authoritative_owner_id uuid;
  institution_principal_id uuid;
  matching_owner_count integer;
  active_owner_count integer;
begin
  if tg_table_name = 'projects' then
    checked_project_ids := array[case when tg_op='DELETE' then old.id else new.id end];
  elsif tg_op='UPDATE' and old.project_id is distinct from new.project_id then
    checked_project_ids := array[old.project_id,new.project_id];
  else
    checked_project_ids := array[case when tg_op='DELETE' then old.project_id else new.project_id end];
  end if;
  foreach checked_project_id in array checked_project_ids loop
    select p.owner_user_id,p.institution_id into authoritative_owner_id,institution_principal_id
    from public.projects p where p.id=checked_project_id;
    if found then
      select count(*) filter(where pm.user_id=authoritative_owner_id),count(*)
        into matching_owner_count,active_owner_count
      from public.project_members pm
      where pm.project_id=checked_project_id and pm.role='owner' and pm.status='active';
      if authoritative_owner_id is not null and (matching_owner_count<>1 or active_owner_count<>1) then
        raise exception 'personal Project must have one matching active owner membership';
      end if;
      if institution_principal_id is not null and active_owner_count<>0 then
        raise exception 'Institution Project cannot have a Project owner membership';
      end if;
    end if;
  end loop;
  return null;
end;
$invariant$;

create or replace function public.prevent_project_owner_change_v1()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $guard$
begin
  if new.owner_user_id is distinct from old.owner_user_id
    or new.institution_id is distinct from old.institution_id
  then
    raise exception 'Project principal is immutable';
  end if;
  return new;
end;
$guard$;

drop trigger if exists trg_projects_prevent_owner_change on public.projects;
create trigger trg_projects_prevent_owner_change
  before update of owner_user_id,institution_id on public.projects
  for each row execute function public.prevent_project_owner_change_v1();

create or replace function public.create_institution_project_v1(
  p_institution_id uuid,
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
as $create$
declare
  institution_row public.institutions;
  created_project public.projects;
begin
  select * into institution_row from public.institutions where id=p_institution_id for update;
  if institution_row.id is null or institution_row.owner_user_id<>p_actor_user_id then
    return null;
  end if;
  if p_name is null or length(btrim(p_name))<1 or length(p_name)>120
    or (p_description is not null and length(p_description)>4000)
    or p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug) not between 3 and 80
    or p_visibility not in ('private','unlisted','community','public')
    or p_connection_tier not in ('tier_1_showcase','tier_2_hosted','tier_3_lab')
  then
    return null;
  end if;
  insert into public.projects(owner_user_id,institution_id,name,slug,description,visibility,connection_tier)
  values(null,institution_row.id,btrim(p_name),p_slug,case when p_description is null then null else btrim(p_description) end,p_visibility,p_connection_tier)
  returning * into created_project;
  return created_project;
end;
$create$;

alter function public.create_institution_project_v1(uuid,uuid,text,text,text,text,text) owner to postgres;
revoke all on function public.create_institution_project_v1(uuid,uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.create_institution_project_v1(uuid,uuid,text,text,text,text,text) to service_role;

comment on column public.projects.institution_id is 'Sole Institution principal when owner_user_id is null; exactly one principal is required.';

do $postassert$
begin
  if exists(select 1 from public.projects where (owner_user_id is null)=(institution_id is null)) then
    raise exception 'PR538 exact-one-principal postassert failed';
  end if;
  if exists(select 1 from public.projects p where p.owner_user_id is not null and not exists(select 1 from public.project_members pm where pm.project_id=p.id and pm.user_id=p.owner_user_id and pm.role='owner' and pm.status='active')) then
    raise exception 'PR538 personal owner invariant postassert failed';
  end if;
  if exists(select 1 from public.projects p join public.project_members pm on pm.project_id=p.id where p.institution_id is not null and pm.role='owner' and pm.status='active') then
    raise exception 'PR538 Institution owner-row postassert failed';
  end if;
  if has_function_privilege('anon','public.create_institution_project_v1(uuid,uuid,text,text,text,text,text)','execute')
    or has_function_privilege('authenticated','public.create_institution_project_v1(uuid,uuid,text,text,text,text,text)','execute')
    or not has_function_privilege('service_role','public.create_institution_project_v1(uuid,uuid,text,text,text,text,text)','execute')
  then
    raise exception 'PR538 RPC privilege postassert failed';
  end if;
end;
$postassert$;

notify pgrst, 'reload schema';
commit;
