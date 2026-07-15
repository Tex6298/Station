-- ============================================================
-- PR527D2 forum visible reply count integrity
-- ============================================================

begin;

select pg_advisory_xact_lock(hashtextextended('station.pr527d2.visible_reply_count.083', 0));

do $$
declare
  increment_oid oid;
begin
  increment_oid := to_regprocedure('public.increment_thread_comment_count(uuid)');
  if increment_oid is null then
    raise exception 'PR527D2 expected public.increment_thread_comment_count(uuid) to exist before migration 083';
  end if;

  if pg_get_functiondef(increment_oid) not ilike '%comment_count = comment_count + 1%' then
    raise exception 'PR527D2 expected the pre-083 increment_thread_comment_count(uuid) blind increment shape';
  end if;

  if to_regclass('public.comments') is null or to_regclass('public.threads') is null then
    raise exception 'PR527D2 expected public.comments and public.threads to exist before migration 083';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.comments'::regclass
      and tgname = 'trg_comments_updated_at'
      and not tgisinternal
  ) then
    raise exception 'PR527D2 expected the existing comments updated_at trigger before migration 083';
  end if;

  if exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.comments'::regclass
      and tgname = 'trg_comments_visible_reply_count'
      and not tgisinternal
  ) then
    raise exception 'PR527D2 visible reply count trigger already exists before migration 083';
  end if;

  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.threads'::regclass
      and conname = 'threads_comment_count_nonnegative_check'
  ) then
    raise exception 'PR527D2 nonnegative comment_count constraint already exists before migration 083';
  end if;
end;
$$;

create index if not exists idx_comments_thread_visible_reply_count
  on public.comments (parent_id, created_at)
  where parent_type = 'thread' and status = 'active' and is_hidden = false;

create or replace function public.forum_comment_counts_as_visible_reply(
  comment_parent_type text,
  comment_status text,
  comment_is_hidden boolean
)
returns boolean
language sql
immutable
strict
set search_path = public, pg_temp
as $$
  select comment_parent_type = 'thread'
    and comment_status = 'active'
    and comment_is_hidden = false;
$$;

revoke all on function public.forum_comment_counts_as_visible_reply(text, text, boolean) from public, anon, authenticated;

create or replace function public.apply_thread_visible_reply_count_delta(
  target_thread_id uuid,
  reply_delta integer,
  activity_at timestamptz default null,
  tolerate_missing_parent boolean default false
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_count integer;
  next_count integer;
begin
  if target_thread_id is null or reply_delta = 0 then
    return;
  end if;

  select comment_count
  into current_count
  from public.threads
  where id = target_thread_id
  for update;

  if not found then
    if tolerate_missing_parent then
      return;
    end if;
    raise exception 'Visible reply count parent thread % is missing', target_thread_id
      using errcode = '23503';
  end if;

  next_count := current_count + reply_delta;
  if next_count < 0 then
    raise exception 'Visible reply count for thread % would become negative', target_thread_id
      using errcode = '23514';
  end if;

  update public.threads
  set
    comment_count = next_count,
    hot_score = score + (next_count * 0.35),
    last_activity_at = case
      when reply_delta > 0
        and activity_at is not null
        and (last_activity_at is null or activity_at > last_activity_at)
      then activity_at
      else last_activity_at
    end
  where id = target_thread_id;
end;
$$;

revoke all on function public.apply_thread_visible_reply_count_delta(uuid, integer, timestamptz, boolean)
  from public, anon, authenticated;

create or replace function public.sync_thread_visible_reply_count_from_comments()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  old_visible boolean := false;
  new_visible boolean := false;
  old_thread_id uuid := null;
  new_thread_id uuid := null;
begin
  if tg_op <> 'INSERT' then
    old_visible := public.forum_comment_counts_as_visible_reply(old.parent_type, old.status, old.is_hidden);
    if old_visible then
      old_thread_id := old.parent_id;
    end if;
  end if;

  if tg_op <> 'DELETE' then
    new_visible := public.forum_comment_counts_as_visible_reply(new.parent_type, new.status, new.is_hidden);
    if new_visible then
      new_thread_id := new.parent_id;
    end if;
  end if;

  if old_visible and new_visible and old_thread_id = new_thread_id then
    return coalesce(new, old);
  end if;

  if old_visible and new_visible and old_thread_id <> new_thread_id then
    perform 1
    from public.threads
    where id in (old_thread_id, new_thread_id)
    order by id
    for update;
  end if;

  if old_visible then
    perform public.apply_thread_visible_reply_count_delta(old_thread_id, -1, null, true);
  end if;

  if new_visible then
    perform public.apply_thread_visible_reply_count_delta(new_thread_id, 1, new.created_at, false);
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function public.sync_thread_visible_reply_count_from_comments()
  from public, anon, authenticated;

create trigger trg_comments_visible_reply_count
  after insert or delete or update of parent_type, parent_id, status, is_hidden
  on public.comments
  for each row
  execute function public.sync_thread_visible_reply_count_from_comments();

create or replace function public.prevent_direct_thread_comment_count_write()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  thread_table_owner name;
begin
  select pg_get_userbyid(c.relowner)
  into thread_table_owner
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'threads';

  if current_user = thread_table_owner then
    return new;
  end if;

  if tg_op = 'INSERT' and coalesce(new.comment_count, 0) <> 0 then
    raise exception 'comment_count is database-owned and must start at zero'
      using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' and new.comment_count is distinct from old.comment_count then
    raise exception 'comment_count is database-owned and cannot be written directly'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_direct_thread_comment_count_write()
  from public, anon, authenticated;

create trigger trg_threads_comment_count_direct_write_guard
  before insert or update of comment_count
  on public.threads
  for each row
  execute function public.prevent_direct_thread_comment_count_write();

with visible_reply_counts as (
  select
    t.id,
    coalesce(count(c.id), 0)::integer as visible_reply_count
  from public.threads t
  left join public.comments c
    on c.parent_type = 'thread'
   and c.parent_id = t.id
   and c.status = 'active'
   and c.is_hidden = false
  group by t.id
)
update public.threads t
set
  comment_count = visible_reply_counts.visible_reply_count,
  hot_score = t.score + (visible_reply_counts.visible_reply_count * 0.35)
from visible_reply_counts
where visible_reply_counts.id = t.id
  and (
    t.comment_count is distinct from visible_reply_counts.visible_reply_count
    or t.hot_score is distinct from (t.score + (visible_reply_counts.visible_reply_count * 0.35))
  );

alter table public.threads
  add constraint threads_comment_count_nonnegative_check
  check (comment_count >= 0) not valid;

alter table public.threads
  validate constraint threads_comment_count_nonnegative_check;

create or replace function public.increment_thread_comment_count(thread_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Deprecated compatibility shim for API deployments that still call the
  -- former blind increment. Migration 083 makes the comments trigger the
  -- sole owner of visible reply counts.
  return;
end;
$$;

revoke all on function public.increment_thread_comment_count(uuid) from public, anon, authenticated;
grant execute on function public.increment_thread_comment_count(uuid) to service_role;

comment on function public.increment_thread_comment_count(uuid) is
  'Deprecated PR527D2 compatibility shim. Visible reply counts are maintained by trg_comments_visible_reply_count.';

comment on function public.sync_thread_visible_reply_count_from_comments() is
  'Maintains threads.comment_count as active, non-hidden thread replies transactionally.';

comment on constraint threads_comment_count_nonnegative_check on public.threads is
  'PR527D2 invariant: visible reply count cannot be negative.';

notify pgrst, 'reload schema';

commit;
