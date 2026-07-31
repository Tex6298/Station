-- PR540 branded public Institutional Space
begin;

select pg_advisory_xact_lock(hashtextextended('station.pr540.institution_spaces.095',0));
lock table public.institutions in share mode;
lock table public.institution_audit_events in share row exclusive mode;

do $preflight$
begin
  if to_regclass('public.institution_publications') is null or to_regclass('public.projects') is null then raise exception 'PR540 prerequisite relation missing'; end if;
  if to_regclass('public.institution_spaces') is not null then raise exception 'PR540 Institution Space relation already exists'; end if;
end;$preflight$;

alter table public.institution_audit_events
  drop constraint institution_audit_events_action_check,
  add constraint institution_audit_events_action_check check(action in(
    'provisioned','verification_granted','verification_revoked','published','unpublished',
    'member_invited','invitation_accepted','invitation_declined','invitation_expired','member_revoked',
    'publication_created','publication_edited','publication_published','publication_retracted',
    'space_created','space_edited','space_published','space_unpublished'
  )),
  drop constraint institution_audit_events_resource_pair_check,
  add constraint institution_audit_events_resource_pair_check check(
    (resource_kind is null and resource_id is null)
    or (resource_kind in('institution_publication','institution_space') and resource_id is not null)
  );

create table public.institution_spaces(
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null unique references public.institutions(id) on delete restrict,
  creator_user_id uuid references public.profiles(id) on delete set null,
  creator_label text not null check(char_length(btrim(creator_label)) between 1 and 120),
  last_editor_user_id uuid references public.profiles(id) on delete set null,
  last_editor_label text not null check(char_length(btrim(last_editor_label)) between 1 and 120),
  mark_text text not null check(mark_text=upper(btrim(mark_text)) and mark_text ~ '^[A-Z0-9&+]{1,4}$'),
  headline text not null check(char_length(btrim(headline)) between 1 and 160),
  about text not null check(char_length(btrim(about)) between 1 and 3000),
  accent_key text not null check(accent_key in('cobalt','coral','forest','gold')),
  status text not null default 'draft' check(status in('draft','published')),
  version integer not null default 1 check(version>=1),
  published_at timestamptz,
  published_by_user_id uuid references public.profiles(id) on delete set null,
  unpublished_at timestamptz,
  unpublished_by_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint institution_spaces_state_check check(
    (status='draft' and published_at is null and published_by_user_id is null)
    or (status='published' and published_at is not null)
  )
);
alter table public.institution_spaces enable row level security;
revoke all on table public.institution_spaces from public,anon,authenticated;
grant select,insert,update,delete on table public.institution_spaces to service_role;

create or replace function public.prevent_institution_space_identity_change_v1() returns trigger language plpgsql set search_path=pg_catalog,public as $guard$
begin
  if new.institution_id is distinct from old.institution_id
    or (new.creator_user_id is distinct from old.creator_user_id and not(old.creator_user_id is not null and new.creator_user_id is null))
    or new.creator_label is distinct from old.creator_label or new.created_at is distinct from old.created_at then raise exception 'Institution Space identity is immutable'; end if;
  return new;
end;$guard$;
create trigger trg_institution_spaces_identity before update on public.institution_spaces for each row execute function public.prevent_institution_space_identity_change_v1();

create or replace function public.create_institution_space_v1(p_institution_id uuid,p_actor_user_id uuid,p_actor_label text,p_mark_text text,p_headline text,p_about text,p_accent_key text)
returns public.institution_spaces language plpgsql security definer set search_path=pg_catalog,public as $create$
declare institution_row public.institutions;created_row public.institution_spaces;
begin
  select * into institution_row from public.institutions where id=p_institution_id;
  if institution_row.id is null or institution_row.owner_user_id<>p_actor_user_id then return null;end if;
  insert into public.institution_spaces(institution_id,creator_user_id,creator_label,last_editor_user_id,last_editor_label,mark_text,headline,about,accent_key)
  values(p_institution_id,p_actor_user_id,btrim(p_actor_label),p_actor_user_id,btrim(p_actor_label),upper(btrim(p_mark_text)),btrim(p_headline),btrim(p_about),p_accent_key) returning * into created_row;
  insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id) values(p_institution_id,p_actor_user_id,p_actor_user_id,'space_created','institution_space',created_row.id);
  return created_row;
end;$create$;

create or replace function public.edit_institution_space_v1(p_space_id uuid,p_actor_user_id uuid,p_actor_label text,p_expected_version integer,p_mark_text text,p_headline text,p_about text,p_accent_key text)
returns table(outcome text,space_id uuid,new_version integer) language plpgsql security definer set search_path=pg_catalog,public as $edit$
declare space_row public.institution_spaces;institution_row public.institutions;clock_time timestamptz:=statement_timestamp();next_version integer;
begin
  select * into space_row from public.institution_spaces where id=p_space_id for update;select * into institution_row from public.institutions where id=space_row.institution_id;
  if space_row.id is null or space_row.status<>'draft' or institution_row.owner_user_id<>p_actor_user_id then return query select 'unavailable',null::uuid,null::integer;return;end if;
  if space_row.version<>p_expected_version then return query select 'conflict',space_row.id,space_row.version;return;end if;
  update public.institution_spaces set mark_text=upper(btrim(p_mark_text)),headline=btrim(p_headline),about=btrim(p_about),accent_key=p_accent_key,last_editor_user_id=p_actor_user_id,last_editor_label=btrim(p_actor_label),version=version+1,updated_at=clock_time where id=p_space_id returning version into next_version;
  insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at) values(space_row.institution_id,p_actor_user_id,p_actor_user_id,'space_edited','institution_space',space_row.id,clock_time);
  return query select 'edited',space_row.id,next_version;
end;$edit$;

create or replace function public.transition_institution_space_v1(p_space_id uuid,p_actor_user_id uuid,p_expected_version integer,p_action text)
returns table(outcome text,space_id uuid,new_version integer) language plpgsql security definer set search_path=pg_catalog,public as $transition$
declare space_row public.institution_spaces;institution_row public.institutions;clock_time timestamptz:=statement_timestamp();next_version integer;
begin
  select * into space_row from public.institution_spaces where id=p_space_id for update;select * into institution_row from public.institutions where id=space_row.institution_id;
  if space_row.id is null or institution_row.owner_user_id<>p_actor_user_id or p_action not in('publish','unpublish') then return query select 'unavailable',null::uuid,null::integer;return;end if;
  if space_row.version<>p_expected_version then return query select 'conflict',space_row.id,space_row.version;return;end if;
  if p_action='publish' then
    if space_row.status<>'draft' or institution_row.verification_status<>'verified' or institution_row.public_status<>'public' then return query select 'unavailable',null::uuid,null::integer;return;end if;
    update public.institution_spaces set status='published',published_at=clock_time,published_by_user_id=p_actor_user_id,unpublished_at=null,unpublished_by_user_id=null,version=version+1,updated_at=clock_time where id=p_space_id returning version into next_version;
    insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at) values(space_row.institution_id,p_actor_user_id,p_actor_user_id,'space_published','institution_space',space_row.id,clock_time);return query select 'published',space_row.id,next_version;return;
  end if;
  if space_row.status<>'published' then return query select 'unavailable',null::uuid,null::integer;return;end if;
  update public.institution_spaces set status='draft',published_at=null,published_by_user_id=null,unpublished_at=clock_time,unpublished_by_user_id=p_actor_user_id,version=version+1,updated_at=clock_time where id=p_space_id returning version into next_version;
  insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at) values(space_row.institution_id,p_actor_user_id,p_actor_user_id,'space_unpublished','institution_space',space_row.id,clock_time);return query select 'unpublished',space_row.id,next_version;
end;$transition$;

alter function public.prevent_institution_space_identity_change_v1() owner to postgres;
alter function public.create_institution_space_v1(uuid,uuid,text,text,text,text,text) owner to postgres;
alter function public.edit_institution_space_v1(uuid,uuid,text,integer,text,text,text,text) owner to postgres;
alter function public.transition_institution_space_v1(uuid,uuid,integer,text) owner to postgres;
revoke all on function public.create_institution_space_v1(uuid,uuid,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.edit_institution_space_v1(uuid,uuid,text,integer,text,text,text,text) from public,anon,authenticated;
revoke all on function public.transition_institution_space_v1(uuid,uuid,integer,text) from public,anon,authenticated;
grant execute on function public.create_institution_space_v1(uuid,uuid,text,text,text,text,text) to service_role;
grant execute on function public.edit_institution_space_v1(uuid,uuid,text,integer,text,text,text,text) to service_role;
grant execute on function public.transition_institution_space_v1(uuid,uuid,integer,text) to service_role;
notify pgrst,'reload schema';
commit;
