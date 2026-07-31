-- PR539 collaborative Institution publishing
begin;

select pg_advisory_xact_lock(hashtextextended('station.pr539.institution_publications.094', 0));
lock table public.institutions in share mode;
lock table public.institution_members in share mode;
lock table public.projects in share mode;
lock table public.institution_audit_events in share row exclusive mode;

do $preflight$
begin
  if to_regclass('public.institutions') is null or to_regclass('public.projects') is null
    or to_regclass('public.institution_audit_events') is null then
    raise exception 'PR539 prerequisite relation missing';
  end if;
  if to_regclass('public.institution_publications') is not null then
    raise exception 'PR539 publication relation already exists';
  end if;
end;
$preflight$;

alter table public.institution_audit_events
  drop constraint institution_audit_events_actor_user_id_fkey,
  drop constraint institution_audit_events_subject_user_id_fkey,
  alter column actor_user_id drop not null,
  alter column subject_user_id drop not null,
  add constraint institution_audit_events_actor_user_id_fkey foreign key(actor_user_id) references public.profiles(id) on delete set null,
  add constraint institution_audit_events_subject_user_id_fkey foreign key(subject_user_id) references public.profiles(id) on delete set null,
  drop constraint institution_audit_events_action_check,
  add constraint institution_audit_events_action_check check(action in(
    'provisioned','verification_granted','verification_revoked','published','unpublished',
    'member_invited','invitation_accepted','invitation_declined','invitation_expired','member_revoked',
    'publication_created','publication_edited','publication_published','publication_retracted'
  )),
  add column resource_kind text,
  add column resource_id uuid,
  add constraint institution_audit_events_resource_pair_check check(
    (resource_kind is null and resource_id is null)
    or (resource_kind='institution_publication' and resource_id is not null)
  );

create table public.institution_publications(
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete restrict,
  project_id uuid not null references public.projects(id) on delete restrict,
  creator_user_id uuid references public.profiles(id) on delete set null,
  creator_label text not null check(char_length(btrim(creator_label)) between 1 and 120),
  last_editor_user_id uuid references public.profiles(id) on delete set null,
  last_editor_label text not null check(char_length(btrim(last_editor_label)) between 1 and 120),
  slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 80),
  title text not null check(char_length(btrim(title)) between 1 and 200),
  summary text not null check(char_length(btrim(summary)) between 1 and 1000),
  body text not null check(char_length(btrim(body)) between 1 and 100000),
  document_type text not null check(document_type in('article','research','report','note')),
  status text not null default 'draft' check(status in('draft','published')),
  version integer not null default 1 check(version>=1),
  published_at timestamptz,
  published_by_user_id uuid references public.profiles(id) on delete set null,
  retracted_at timestamptz,
  retracted_by_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  unique(institution_id,slug),
  constraint institution_publications_state_check check(
    (status='draft' and published_at is null and published_by_user_id is null)
    or (status='published' and published_at is not null)
  )
);
create index institution_publications_project_updated_idx on public.institution_publications(project_id,updated_at desc);
alter table public.institution_publications enable row level security;
revoke all on table public.institution_publications from public,anon,authenticated;
grant select,insert,update,delete on table public.institution_publications to service_role;

create or replace function public.prevent_institution_publication_identity_change_v1()
returns trigger language plpgsql set search_path=pg_catalog,public as $guard$
begin
  if new.institution_id is distinct from old.institution_id or new.project_id is distinct from old.project_id
    or (new.creator_user_id is distinct from old.creator_user_id and not(old.creator_user_id is not null and new.creator_user_id is null))
    or new.creator_label is distinct from old.creator_label
    or new.slug is distinct from old.slug or new.created_at is distinct from old.created_at then
    raise exception 'Institution publication identity is immutable';
  end if;
  return new;
end;
$guard$;

create or replace function public.enforce_institution_publication_project_v1()
returns trigger language plpgsql set search_path=pg_catalog,public as $project_guard$
begin
  if not exists(
    select 1 from public.projects p
    where p.id=new.project_id and p.institution_id=new.institution_id
  ) then
    raise exception 'Institution publication project principal mismatch';
  end if;
  return new;
end;
$project_guard$;
create trigger trg_institution_publications_project before insert or update of institution_id,project_id on public.institution_publications
for each row execute function public.enforce_institution_publication_project_v1();
create trigger trg_institution_publications_identity before update on public.institution_publications
for each row execute function public.prevent_institution_publication_identity_change_v1();

create or replace function public.create_institution_publication_v1(
  p_institution_id uuid,p_project_id uuid,p_actor_user_id uuid,p_actor_label text,p_slug text,
  p_title text,p_summary text,p_body text,p_document_type text
) returns public.institution_publications language plpgsql security definer set search_path=pg_catalog,public as $create$
declare institution_row public.institutions; created_row public.institution_publications;
begin
  select * into institution_row from public.institutions where id=p_institution_id;
  if institution_row.id is null or not(
    institution_row.owner_user_id=p_actor_user_id or exists(select 1 from public.institution_members m where m.institution_id=p_institution_id and m.user_id=p_actor_user_id and m.role='member' and m.status='active')
  ) or not exists(select 1 from public.projects p where p.id=p_project_id and p.institution_id=p_institution_id) then return null; end if;
  insert into public.institution_publications(institution_id,project_id,creator_user_id,creator_label,last_editor_user_id,last_editor_label,slug,title,summary,body,document_type)
  values(p_institution_id,p_project_id,p_actor_user_id,btrim(p_actor_label),p_actor_user_id,btrim(p_actor_label),p_slug,btrim(p_title),btrim(p_summary),btrim(p_body),p_document_type)
  returning * into created_row;
  insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id)
  values(p_institution_id,p_actor_user_id,p_actor_user_id,'publication_created','institution_publication',created_row.id);
  return created_row;
end;$create$;

create or replace function public.edit_institution_publication_v1(
  p_publication_id uuid,p_actor_user_id uuid,p_actor_label text,p_expected_version integer,
  p_title text,p_summary text,p_body text,p_document_type text
) returns table(outcome text,publication_id uuid,new_version integer) language plpgsql security definer set search_path=pg_catalog,public as $edit$
declare publication_row public.institution_publications; institution_row public.institutions; clock_time timestamptz:=statement_timestamp(); next_version integer;
begin
  select * into publication_row from public.institution_publications where id=p_publication_id for update;
  select * into institution_row from public.institutions where id=publication_row.institution_id;
  if publication_row.id is null or publication_row.status<>'draft' or not(institution_row.owner_user_id=p_actor_user_id or exists(select 1 from public.institution_members m where m.institution_id=publication_row.institution_id and m.user_id=p_actor_user_id and m.role='member' and m.status='active')) then return query select 'unavailable',null::uuid,null::integer; return; end if;
  if publication_row.version<>p_expected_version then return query select 'conflict',publication_row.id,publication_row.version; return; end if;
  update public.institution_publications set title=btrim(p_title),summary=btrim(p_summary),body=btrim(p_body),document_type=p_document_type,last_editor_user_id=p_actor_user_id,last_editor_label=btrim(p_actor_label),version=version+1,updated_at=clock_time where id=p_publication_id returning version into next_version;
  insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at) values(publication_row.institution_id,p_actor_user_id,p_actor_user_id,'publication_edited','institution_publication',publication_row.id,clock_time);
  return query select 'edited',publication_row.id,next_version;
end;$edit$;

create or replace function public.transition_institution_publication_work_v1(
  p_publication_id uuid,p_actor_user_id uuid,p_expected_version integer,p_action text
) returns table(outcome text,publication_id uuid,new_version integer) language plpgsql security definer set search_path=pg_catalog,public as $transition$
declare publication_row public.institution_publications; institution_row public.institutions; clock_time timestamptz:=statement_timestamp(); next_version integer;
begin
  select * into publication_row from public.institution_publications where id=p_publication_id for update;
  select * into institution_row from public.institutions where id=publication_row.institution_id;
  if publication_row.id is null or institution_row.owner_user_id<>p_actor_user_id or p_action not in('publish','retract') then return query select 'unavailable',null::uuid,null::integer; return; end if;
  if publication_row.version<>p_expected_version then return query select 'conflict',publication_row.id,publication_row.version; return; end if;
  if p_action='publish' then
    if publication_row.status<>'draft' or institution_row.verification_status<>'verified' or institution_row.public_status<>'public' then return query select 'unavailable',null::uuid,null::integer; return; end if;
    update public.institution_publications set status='published',published_at=clock_time,published_by_user_id=p_actor_user_id,retracted_at=null,retracted_by_user_id=null,version=version+1,updated_at=clock_time where id=p_publication_id returning version into next_version;
    insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at) values(publication_row.institution_id,p_actor_user_id,p_actor_user_id,'publication_published','institution_publication',publication_row.id,clock_time);
    return query select 'published',publication_row.id,next_version;
  end if;
  if publication_row.status<>'published' then return query select 'unavailable',null::uuid,null::integer; return; end if;
  update public.institution_publications set status='draft',published_at=null,published_by_user_id=null,retracted_at=clock_time,retracted_by_user_id=p_actor_user_id,version=version+1,updated_at=clock_time where id=p_publication_id returning version into next_version;
  insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at) values(publication_row.institution_id,p_actor_user_id,p_actor_user_id,'publication_retracted','institution_publication',publication_row.id,clock_time);
  return query select 'retracted',publication_row.id,next_version;
end;$transition$;

alter function public.prevent_institution_publication_identity_change_v1() owner to postgres;
alter function public.enforce_institution_publication_project_v1() owner to postgres;
alter function public.create_institution_publication_v1(uuid,uuid,uuid,text,text,text,text,text,text) owner to postgres;
alter function public.edit_institution_publication_v1(uuid,uuid,text,integer,text,text,text,text) owner to postgres;
alter function public.transition_institution_publication_work_v1(uuid,uuid,integer,text) owner to postgres;
revoke all on function public.create_institution_publication_v1(uuid,uuid,uuid,text,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.edit_institution_publication_v1(uuid,uuid,text,integer,text,text,text,text) from public,anon,authenticated;
revoke all on function public.transition_institution_publication_work_v1(uuid,uuid,integer,text) from public,anon,authenticated;
grant execute on function public.create_institution_publication_v1(uuid,uuid,uuid,text,text,text,text,text,text) to service_role;
grant execute on function public.edit_institution_publication_v1(uuid,uuid,text,integer,text,text,text,text) to service_role;
grant execute on function public.transition_institution_publication_work_v1(uuid,uuid,integer,text) to service_role;

notify pgrst,'reload schema';
commit;
