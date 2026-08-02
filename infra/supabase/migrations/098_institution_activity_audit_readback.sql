-- PR542 Institution activity and Project audit completion
begin;

select pg_advisory_xact_lock(hashtextextended('station.pr542.institution_activity.098', 0));
lock table public.projects in share row exclusive mode;
lock table public.institutions in share mode;
lock table public.institution_audit_events in share row exclusive mode;

do $preflight$
begin
  if to_regclass('public.projects') is null
    or to_regclass('public.institutions') is null
    or to_regclass('public.institution_audit_events') is null
  then
    raise exception 'PR542 prerequisite relation missing';
  end if;
  if exists(
    select 1 from public.projects
    where (owner_user_id is null)::int + (institution_id is null)::int <> 1
  ) then
    raise exception 'PR542 ambiguous Project principal';
  end if;
end;
$preflight$;

create temporary table pr542_preflight on commit drop as
select
  (select count(*) from public.projects) project_count,
  (select md5(coalesce(string_agg(md5(row(id,owner_user_id,name,slug,description,visibility,connection_tier,created_at,updated_at)::text),',' order by id),'')) from public.projects where owner_user_id is not null) personal_project_fingerprint,
  (select count(*) from public.institution_audit_events where action<>'project_created') prior_audit_count,
  (select md5(coalesce(string_agg(md5(row(id,institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at)::text),',' order by id),'')) from public.institution_audit_events where action<>'project_created') prior_audit_fingerprint,
  (select count(*) from public.projects where institution_id is not null) institution_project_count;

alter table public.institution_audit_events
  drop constraint institution_audit_events_action_check,
  add constraint institution_audit_events_action_check check(action in(
    'provisioned','verification_granted','verification_revoked','published','unpublished',
    'member_invited','invitation_accepted','invitation_declined','invitation_expired','member_revoked',
    'publication_created','publication_edited','publication_published','publication_retracted',
    'space_created','space_edited','space_published','space_unpublished','community_created','project_created'
  )),
  drop constraint institution_audit_events_resource_pair_check,
  add constraint institution_audit_events_resource_pair_check check(
    (resource_kind is null and resource_id is null)
    or (resource_kind in('institution_publication','institution_space','institution_subcommunity','institution_project') and resource_id is not null)
  );

create unique index if not exists institution_audit_project_created_unique_idx
  on public.institution_audit_events(institution_id,resource_id)
  where action='project_created' and resource_kind='institution_project';
create index if not exists institution_audit_owner_timeline_idx
  on public.institution_audit_events(institution_id,created_at desc,id desc);

create or replace function public.create_institution_project_v1(
  p_institution_id uuid,p_actor_user_id uuid,p_name text,p_slug text,
  p_description text,p_visibility text,p_connection_tier text
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
  if institution_row.id is null or institution_row.owner_user_id<>p_actor_user_id then return null; end if;
  if p_name is null or length(btrim(p_name))<1 or length(p_name)>120
    or (p_description is not null and length(p_description)>4000)
    or p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug) not between 3 and 80
    or p_visibility not in ('private','unlisted','community','public')
    or p_connection_tier not in ('tier_1_showcase','tier_2_hosted','tier_3_lab')
  then return null; end if;
  insert into public.projects(owner_user_id,institution_id,name,slug,description,visibility,connection_tier)
  values(null,institution_row.id,btrim(p_name),p_slug,case when p_description is null then null else btrim(p_description) end,p_visibility,p_connection_tier)
  returning * into created_project;
  insert into public.institution_audit_events(
    institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at
  ) values(
    institution_row.id,p_actor_user_id,p_actor_user_id,'project_created','institution_project',created_project.id,created_project.created_at
  );
  return created_project;
end;
$create$;

alter function public.create_institution_project_v1(uuid,uuid,text,text,text,text,text) owner to postgres;
revoke all on function public.create_institution_project_v1(uuid,uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.create_institution_project_v1(uuid,uuid,text,text,text,text,text) to service_role;

insert into public.institution_audit_events(
  institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at
)
select p.institution_id,i.owner_user_id,i.owner_user_id,'project_created','institution_project',p.id,p.created_at
from public.projects p
join public.institutions i on i.id=p.institution_id
where p.institution_id is not null
  and not exists(
    select 1 from public.institution_audit_events e
    where e.institution_id=p.institution_id and e.action='project_created'
      and e.resource_kind='institution_project' and e.resource_id=p.id
  );

do $postassert$
declare before_row record;
begin
  select * into before_row from pr542_preflight;
  if (select count(*) from public.projects)<>before_row.project_count
    or (select md5(coalesce(string_agg(md5(row(id,owner_user_id,name,slug,description,visibility,connection_tier,created_at,updated_at)::text),',' order by id),'')) from public.projects where owner_user_id is not null) is distinct from before_row.personal_project_fingerprint
  then raise exception 'PR542 Project drift'; end if;
  if (select count(*) from public.institution_audit_events where action<>'project_created')<>before_row.prior_audit_count
    or (select md5(coalesce(string_agg(md5(row(id,institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at)::text),',' order by id),'')) from public.institution_audit_events where action<>'project_created') is distinct from before_row.prior_audit_fingerprint
  then raise exception 'PR542 prior audit drift'; end if;
  if (select count(*) from public.institution_audit_events where action='project_created')<>before_row.institution_project_count
    or exists(
      select 1 from public.projects p where p.institution_id is not null and
        (select count(*) from public.institution_audit_events e where e.institution_id=p.institution_id and e.action='project_created' and e.resource_kind='institution_project' and e.resource_id=p.id)<>1
    )
  then raise exception 'PR542 Project audit cardinality failed'; end if;
  if has_table_privilege('anon','public.institution_audit_events','select,insert,update,delete')
    or has_table_privilege('authenticated','public.institution_audit_events','select,insert,update,delete')
    or not has_table_privilege('service_role','public.institution_audit_events','select,insert')
    or has_function_privilege('anon','public.create_institution_project_v1(uuid,uuid,text,text,text,text,text)','execute')
    or has_function_privilege('authenticated','public.create_institution_project_v1(uuid,uuid,text,text,text,text,text)','execute')
    or not has_function_privilege('service_role','public.create_institution_project_v1(uuid,uuid,text,text,text,text,text)','execute')
  then raise exception 'PR542 ACL postassert failed'; end if;
  if not exists(
    select 1 from pg_trigger
    where tgrelid='public.institution_audit_events'::regclass
      and tgname='trg_institution_audit_events_append_only'
      and not tgisinternal and tgenabled in('O','A')
  ) then raise exception 'PR542 append-only trigger missing or disabled'; end if;
end;
$postassert$;

notify pgrst, 'reload schema';
commit;
