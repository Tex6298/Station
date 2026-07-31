-- PR540 correction: fail closed on nullable authority and concurrency inputs.
begin;
select pg_advisory_xact_lock(hashtextextended('station.pr540.institution_space_guards.096',0));
do $preflight$ begin if to_regclass('public.institution_spaces') is null then raise exception 'PR540 Institution Space relation missing';end if;end;$preflight$;

create or replace function public.create_institution_space_v1(p_institution_id uuid,p_actor_user_id uuid,p_actor_label text,p_mark_text text,p_headline text,p_about text,p_accent_key text)
returns public.institution_spaces language plpgsql security definer set search_path=pg_catalog,public as $create$
declare institution_row public.institutions;created_row public.institution_spaces;
begin
  if p_actor_user_id is null then return null;end if;
  select * into institution_row from public.institutions where id=p_institution_id;
  if institution_row.id is null or institution_row.owner_user_id is distinct from p_actor_user_id then return null;end if;
  insert into public.institution_spaces(institution_id,creator_user_id,creator_label,last_editor_user_id,last_editor_label,mark_text,headline,about,accent_key) values(p_institution_id,p_actor_user_id,btrim(p_actor_label),p_actor_user_id,btrim(p_actor_label),upper(btrim(p_mark_text)),btrim(p_headline),btrim(p_about),p_accent_key) returning * into created_row;
  insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id) values(p_institution_id,p_actor_user_id,p_actor_user_id,'space_created','institution_space',created_row.id);
  return created_row;
end;$create$;

create or replace function public.edit_institution_space_v1(p_space_id uuid,p_actor_user_id uuid,p_actor_label text,p_expected_version integer,p_mark_text text,p_headline text,p_about text,p_accent_key text)
returns table(outcome text,space_id uuid,new_version integer) language plpgsql security definer set search_path=pg_catalog,public as $edit$
declare space_row public.institution_spaces;institution_row public.institutions;clock_time timestamptz:=statement_timestamp();next_version integer;
begin
  if p_actor_user_id is null or p_expected_version is null then return query select 'unavailable',null::uuid,null::integer;return;end if;
  select * into space_row from public.institution_spaces where id=p_space_id for update;select * into institution_row from public.institutions where id=space_row.institution_id;
  if space_row.id is null or space_row.status<>'draft' or institution_row.owner_user_id is distinct from p_actor_user_id then return query select 'unavailable',null::uuid,null::integer;return;end if;
  if space_row.version is distinct from p_expected_version then return query select 'conflict',space_row.id,space_row.version;return;end if;
  update public.institution_spaces set mark_text=upper(btrim(p_mark_text)),headline=btrim(p_headline),about=btrim(p_about),accent_key=p_accent_key,last_editor_user_id=p_actor_user_id,last_editor_label=btrim(p_actor_label),version=version+1,updated_at=clock_time where id=p_space_id returning version into next_version;
  insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at) values(space_row.institution_id,p_actor_user_id,p_actor_user_id,'space_edited','institution_space',space_row.id,clock_time);
  return query select 'edited',space_row.id,next_version;
end;$edit$;

create or replace function public.transition_institution_space_v1(p_space_id uuid,p_actor_user_id uuid,p_expected_version integer,p_action text)
returns table(outcome text,space_id uuid,new_version integer) language plpgsql security definer set search_path=pg_catalog,public as $transition$
declare space_row public.institution_spaces;institution_row public.institutions;clock_time timestamptz:=statement_timestamp();next_version integer;
begin
  if p_actor_user_id is null or p_expected_version is null or p_action is null or p_action not in('publish','unpublish') then return query select 'unavailable',null::uuid,null::integer;return;end if;
  select * into space_row from public.institution_spaces where id=p_space_id for update;select * into institution_row from public.institutions where id=space_row.institution_id;
  if space_row.id is null or institution_row.owner_user_id is distinct from p_actor_user_id then return query select 'unavailable',null::uuid,null::integer;return;end if;
  if space_row.version is distinct from p_expected_version then return query select 'conflict',space_row.id,space_row.version;return;end if;
  if p_action='publish' then
    if space_row.status<>'draft' or institution_row.verification_status<>'verified' or institution_row.public_status<>'public' then return query select 'unavailable',null::uuid,null::integer;return;end if;
    update public.institution_spaces set status='published',published_at=clock_time,published_by_user_id=p_actor_user_id,unpublished_at=null,unpublished_by_user_id=null,version=version+1,updated_at=clock_time where id=p_space_id returning version into next_version;
    insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at) values(space_row.institution_id,p_actor_user_id,p_actor_user_id,'space_published','institution_space',space_row.id,clock_time);return query select 'published',space_row.id,next_version;return;
  end if;
  if space_row.status<>'published' then return query select 'unavailable',null::uuid,null::integer;return;end if;
  update public.institution_spaces set status='draft',published_at=null,published_by_user_id=null,unpublished_at=clock_time,unpublished_by_user_id=p_actor_user_id,version=version+1,updated_at=clock_time where id=p_space_id returning version into next_version;
  insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id,created_at) values(space_row.institution_id,p_actor_user_id,p_actor_user_id,'space_unpublished','institution_space',space_row.id,clock_time);return query select 'unpublished',space_row.id,next_version;
end;$transition$;

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
