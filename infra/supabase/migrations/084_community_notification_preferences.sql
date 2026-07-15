begin;

select pg_advisory_xact_lock(hashtextextended('station.pr527f.community_notification_preferences.084', 0));

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'PR527F expected public.profiles to exist before migration 084';
  end if;

  if to_regprocedure('public.handle_updated_at()') is null then
    raise exception 'PR527F expected public.handle_updated_at() to exist before migration 084';
  end if;

  if to_regclass('public.community_notification_preferences') is not null then
    raise exception 'PR527F expected public.community_notification_preferences to be absent before migration 084';
  end if;
end
$$;

create table public.community_notification_preferences (
  owner_user_id uuid primary key references public.profiles(id) on delete cascade,
  forum_reply_notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_community_notification_preferences_updated_at
  before update on public.community_notification_preferences
  for each row
  execute function public.handle_updated_at();

alter table public.community_notification_preferences enable row level security;

drop policy if exists "community_notification_preferences_select_own"
  on public.community_notification_preferences;
create policy "community_notification_preferences_select_own"
  on public.community_notification_preferences
  for select
  using (auth.uid() = owner_user_id);

drop policy if exists "community_notification_preferences_insert_own"
  on public.community_notification_preferences;
create policy "community_notification_preferences_insert_own"
  on public.community_notification_preferences
  for insert
  with check (auth.uid() = owner_user_id);

drop policy if exists "community_notification_preferences_update_own"
  on public.community_notification_preferences;
create policy "community_notification_preferences_update_own"
  on public.community_notification_preferences
  for update
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

revoke all on table public.community_notification_preferences from public, anon, authenticated;
grant select, insert, update on table public.community_notification_preferences to authenticated;
grant all on table public.community_notification_preferences to service_role;

comment on table public.community_notification_preferences is
  'Owner-only Community notification preference row. Missing row means forum reply notifications are enabled.';

comment on column public.community_notification_preferences.forum_reply_notifications_enabled is
  'Gates only future in-app thread_comment notification creation. Existing notifications, Watches, report status, and review request notifications are unchanged.';

notify pgrst, 'reload schema';

commit;
