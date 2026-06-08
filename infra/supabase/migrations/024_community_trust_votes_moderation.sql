-- ============================================================
-- Community trust, voting, and moderation action log
-- ============================================================

create table if not exists public.community_user_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  trust_level integer not null default 0 check (trust_level between 0 and 4),
  reputation_score integer not null default 0,
  thread_count integer not null default 0,
  comment_count integer not null default 0,
  helpful_vote_count integer not null default 0,
  report_count integer not null default 0,
  muted_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_votes (
  id uuid primary key default gen_random_uuid(),
  voter_user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('thread', 'comment')),
  target_id uuid not null,
  value integer not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (voter_user_id, target_type, target_id)
);

create table if not exists public.community_moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('thread', 'comment', 'user')),
  target_id uuid not null,
  action_type text not null check (action_type in ('lock', 'unlock', 'pin', 'unpin', 'hide', 'unhide', 'remove', 'restore', 'mute', 'unmute')),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.threads
  add column if not exists last_activity_at timestamptz not null default now(),
  add column if not exists vote_count integer not null default 0,
  add column if not exists hot_score numeric not null default 0,
  add column if not exists moderation_state text not null default 'normal'
    check (moderation_state in ('normal', 'needs_review', 'hidden', 'removed'));

alter table public.comments
  add column if not exists vote_count integer not null default 0,
  add column if not exists moderation_state text not null default 'normal'
    check (moderation_state in ('normal', 'needs_review', 'hidden', 'removed'));

create index if not exists idx_threads_category_activity
  on public.threads (category_id, is_pinned desc, last_activity_at desc);

create index if not exists idx_threads_category_hot
  on public.threads (category_id, is_pinned desc, hot_score desc, last_activity_at desc);

create index if not exists idx_community_votes_target
  on public.community_votes (target_type, target_id);

create index if not exists idx_community_moderation_actions_target
  on public.community_moderation_actions (target_type, target_id, created_at desc);

drop trigger if exists trg_community_user_profiles_updated_at on public.community_user_profiles;
create trigger trg_community_user_profiles_updated_at
  before update on public.community_user_profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_community_votes_updated_at on public.community_votes;
create trigger trg_community_votes_updated_at
  before update on public.community_votes
  for each row execute function public.handle_updated_at();

alter table public.community_user_profiles enable row level security;
alter table public.community_votes enable row level security;
alter table public.community_moderation_actions enable row level security;

drop policy if exists "community_profiles_select_authenticated" on public.community_user_profiles;
create policy "community_profiles_select_authenticated"
  on public.community_user_profiles
  for select
  using (auth.uid() is not null);

drop policy if exists "community_profiles_self_insert" on public.community_user_profiles;
create policy "community_profiles_self_insert"
  on public.community_user_profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "community_profiles_self_update" on public.community_user_profiles;
create policy "community_profiles_self_update"
  on public.community_user_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "community_votes_select_authenticated" on public.community_votes;
create policy "community_votes_select_authenticated"
  on public.community_votes
  for select
  using (auth.uid() is not null);

drop policy if exists "community_votes_all_voter" on public.community_votes;
create policy "community_votes_all_voter"
  on public.community_votes
  for all
  using (auth.uid() = voter_user_id)
  with check (auth.uid() = voter_user_id);

drop policy if exists "community_moderation_actions_select_authenticated" on public.community_moderation_actions;
create policy "community_moderation_actions_select_authenticated"
  on public.community_moderation_actions
  for select
  using (auth.uid() is not null);

drop policy if exists "community_moderation_actions_admin_insert" on public.community_moderation_actions;
create policy "community_moderation_actions_admin_insert"
  on public.community_moderation_actions
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create or replace function public.recalculate_thread_vote_score(thread_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  new_score integer;
begin
  select coalesce(sum(value), 0)::integer
  into new_score
  from public.community_votes
  where target_type = 'thread' and target_id = thread_id;

  update public.threads
  set
    score = new_score,
    vote_count = abs(new_score),
    hot_score = new_score + (comment_count * 0.35),
    last_activity_at = greatest(last_activity_at, now())
  where id = thread_id;
end;
$$;

create or replace function public.recalculate_comment_vote_score(comment_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  new_score integer;
begin
  select coalesce(sum(value), 0)::integer
  into new_score
  from public.community_votes
  where target_type = 'comment' and target_id = comment_id;

  update public.comments
  set score = new_score, vote_count = abs(new_score)
  where id = comment_id;
end;
$$;

create or replace function public.increment_thread_comment_count(thread_id uuid)
returns void
language sql
security definer
as $$
  update public.threads
  set
    comment_count = comment_count + 1,
    last_activity_at = now(),
    hot_score = score + ((comment_count + 1) * 0.35)
  where id = thread_id;
$$;

insert into public.community_user_profiles (user_id, thread_count, comment_count, reputation_score)
select
  p.id,
  coalesce(t.thread_count, 0),
  coalesce(c.comment_count, 0),
  coalesce(t.thread_count, 0) * 2 + coalesce(c.comment_count, 0)
from public.profiles p
left join (
  select author_user_id, count(*)::integer as thread_count
  from public.threads
  group by author_user_id
) t on t.author_user_id = p.id
left join (
  select author_user_id, count(*)::integer as comment_count
  from public.comments
  group by author_user_id
) c on c.author_user_id = p.id
on conflict (user_id) do nothing;

comment on table public.community_user_profiles is
  'Discourse-inspired community trust profile with level, reputation, activity counts, and mute state.';

comment on table public.community_votes is
  'Lemmy/Flarum-inspired normalized voting table for threads and comments.';

comment on table public.community_moderation_actions is
  'Discourse/Lemmy-inspired public moderation action log for lock/pin/hide/remove/restore actions.';
