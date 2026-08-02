-- PR541 first-class Institution Salon principal.
begin;
select pg_advisory_xact_lock(hashtextextended('station.pr541.institution_community.097',0));
lock table public.community_subcommunities in share row exclusive mode;
lock table public.institution_audit_events in share row exclusive mode;

do $preflight$ begin
  if to_regclass('public.institution_spaces') is null or to_regclass('public.community_subcommunity_moderators') is null then raise exception 'PR541 prerequisite relation missing';end if;
  if exists(select 1 from public.community_subcommunities where owner_user_id is null)then raise exception 'PR541 personal principal preflight failed';end if;
end;$preflight$;

alter table public.community_subcommunities alter column owner_user_id drop not null;
alter table public.community_subcommunities add column institution_id uuid references public.institutions(id) on delete restrict;
alter table public.community_subcommunities add constraint community_subcommunities_exact_principal_check check((owner_user_id is not null)::integer+(institution_id is not null)::integer=1);
alter table public.community_subcommunities add constraint community_subcommunities_institution_salon_check check(institution_id is null or(subcommunity_type='salon'and linked_space_id is null and linked_developer_space_id is null));
create unique index community_subcommunities_one_institution on public.community_subcommunities(institution_id)where institution_id is not null;

create or replace function public.prevent_subcommunity_principal_change_v1()returns trigger language plpgsql set search_path=pg_catalog,public as $guard$
begin if new.owner_user_id is distinct from old.owner_user_id or new.institution_id is distinct from old.institution_id then raise exception 'Subcommunity principal is immutable';end if;return new;end;$guard$;
create trigger trg_community_subcommunities_principal before update on public.community_subcommunities for each row execute function public.prevent_subcommunity_principal_change_v1();

alter table public.institution_audit_events drop constraint institution_audit_events_action_check,
add constraint institution_audit_events_action_check check(action in('provisioned','verification_granted','verification_revoked','published','unpublished','member_invited','invitation_accepted','invitation_declined','invitation_expired','member_revoked','publication_created','publication_edited','publication_published','publication_retracted','space_created','space_edited','space_published','space_unpublished','community_created')),
drop constraint institution_audit_events_resource_pair_check,
add constraint institution_audit_events_resource_pair_check check((resource_kind is null and resource_id is null)or(resource_kind in('institution_publication','institution_space','institution_subcommunity')and resource_id is not null));

drop policy if exists "community_subcommunities_select_public_safe" on public.community_subcommunities;
create policy "community_subcommunities_select_public_safe" on public.community_subcommunities for select using(status='active'and visibility in('public','community')and(institution_id is null or exists(select 1 from public.institutions i where i.id=institution_id and i.verification_status='verified'and i.public_status='public')));
drop policy if exists "community_subcommunities_owner_select" on public.community_subcommunities;
create policy "community_subcommunities_owner_select" on public.community_subcommunities for select using(auth.uid()=owner_user_id or exists(select 1 from public.institutions i where i.id=institution_id and i.owner_user_id=auth.uid()));
drop policy if exists "community_subcommunity_moderators_owner_admin_select" on public.community_subcommunity_moderators;
create policy "community_subcommunity_moderators_owner_admin_select" on public.community_subcommunity_moderators for select using(exists(select 1 from public.community_subcommunities s left join public.institutions i on i.id=s.institution_id where s.id=subcommunity_id and(s.owner_user_id=auth.uid()or i.owner_user_id=auth.uid()))or exists(select 1 from public.profiles p where p.id=auth.uid()and p.is_admin=true));
drop policy if exists "community_subcommunity_moderators_owner_admin_write" on public.community_subcommunity_moderators;
create policy "community_subcommunity_moderators_owner_admin_write" on public.community_subcommunity_moderators for all using(exists(select 1 from public.community_subcommunities s left join public.institutions i on i.id=s.institution_id where s.id=subcommunity_id and(s.owner_user_id=auth.uid()or i.owner_user_id=auth.uid()))or exists(select 1 from public.profiles p where p.id=auth.uid()and p.is_admin=true))with check(exists(select 1 from public.community_subcommunities s left join public.institutions i on i.id=s.institution_id where s.id=subcommunity_id and(s.owner_user_id=auth.uid()or i.owner_user_id=auth.uid()))or exists(select 1 from public.profiles p where p.id=auth.uid()and p.is_admin=true));

create or replace function public.create_institution_subcommunity_v1(p_institution_id uuid,p_actor_user_id uuid,p_slug text,p_title text,p_description text)
returns table(outcome text,subcommunity_id uuid,category_id uuid)language plpgsql security definer set search_path=pg_catalog,public as $create$
declare institution_row public.institutions;created_category public.forum_categories;created_subcommunity public.community_subcommunities;
begin
  if p_actor_user_id is null or p_slug is null or p_title is null or p_description is null or p_slug!~'^[a-z0-9]+(-[a-z0-9]+)*$'or char_length(p_slug)not between 3 and 80 or btrim(p_title)<>p_title or char_length(p_title)not between 1 and 120 or btrim(p_description)<>p_description or char_length(p_description)not between 1 and 500 then return query select 'invalid',null::uuid,null::uuid;return;end if;
  select * into institution_row from public.institutions where id=p_institution_id for update;
  if institution_row.id is null or institution_row.owner_user_id is distinct from p_actor_user_id then return query select 'unavailable',null::uuid,null::uuid;return;end if;
  if exists(select 1 from public.community_subcommunities where institution_id=p_institution_id)then return query select 'conflict',null::uuid,null::uuid;return;end if;
  begin
    insert into public.forum_categories(slug,title,description,sort_order)values(p_slug,p_title,p_description,100)returning * into created_category;
    insert into public.community_subcommunities(category_id,owner_user_id,institution_id,slug,title,description,subcommunity_type,visibility,status,linked_space_id,linked_developer_space_id)values(created_category.id,null,p_institution_id,p_slug,p_title,p_description,'salon','public','active',null,null)returning * into created_subcommunity;
    insert into public.institution_audit_events(institution_id,actor_user_id,subject_user_id,action,resource_kind,resource_id)values(p_institution_id,p_actor_user_id,p_actor_user_id,'community_created','institution_subcommunity',created_subcommunity.id);
  exception when unique_violation then return query select 'conflict',null::uuid,null::uuid;return;end;
  return query select 'created',created_subcommunity.id,created_category.id;
end;$create$;

alter function public.prevent_subcommunity_principal_change_v1()owner to postgres;
alter function public.create_institution_subcommunity_v1(uuid,uuid,text,text,text)owner to postgres;
revoke all on function public.create_institution_subcommunity_v1(uuid,uuid,text,text,text)from public,anon,authenticated;
grant execute on function public.create_institution_subcommunity_v1(uuid,uuid,text,text,text)to service_role;
notify pgrst,'reload schema';
commit;
