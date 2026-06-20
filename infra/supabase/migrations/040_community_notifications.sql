-- ============================================================
-- Community notifications foundation
-- ============================================================
-- Durable in-app notification rows only. This is intentionally not email,
-- push, realtime fanout, a public notification feed, or an admin activity log.

create table if not exists public.community_thread_watches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  thread_id uuid not null references public.threads(id) on delete cascade,
  is_muted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, thread_id)
);

create table if not exists public.community_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  notification_type text not null check (
    notification_type in ('thread_comment', 'report_status', 'review_request_status')
  ),
  target_type text not null check (
    target_type in ('thread', 'comment', 'moderation_report', 'moderation_review_request')
  ),
  target_id uuid not null,
  event_key text not null,
  title text not null,
  summary text,
  route_href text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (recipient_user_id, event_key)
);

create index if not exists idx_community_thread_watches_thread
  on public.community_thread_watches (thread_id, is_muted);

create index if not exists idx_community_notifications_recipient_created
  on public.community_notifications (recipient_user_id, created_at desc);

create index if not exists idx_community_notifications_recipient_unread
  on public.community_notifications (recipient_user_id, created_at desc)
  where read_at is null;

create index if not exists idx_community_notifications_target
  on public.community_notifications (target_type, target_id, created_at desc);

drop trigger if exists trg_community_thread_watches_updated_at on public.community_thread_watches;
create trigger trg_community_thread_watches_updated_at
  before update on public.community_thread_watches
  for each row execute function public.handle_updated_at();

alter table public.community_thread_watches enable row level security;
alter table public.community_notifications enable row level security;

drop policy if exists "community_thread_watches_select_own" on public.community_thread_watches;
create policy "community_thread_watches_select_own"
  on public.community_thread_watches
  for select
  using (auth.uid() = user_id);

drop policy if exists "community_thread_watches_insert_own" on public.community_thread_watches;
create policy "community_thread_watches_insert_own"
  on public.community_thread_watches
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "community_thread_watches_update_own" on public.community_thread_watches;
create policy "community_thread_watches_update_own"
  on public.community_thread_watches
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "community_thread_watches_delete_own" on public.community_thread_watches;
create policy "community_thread_watches_delete_own"
  on public.community_thread_watches
  for delete
  using (auth.uid() = user_id);

drop policy if exists "community_notifications_select_own" on public.community_notifications;
create policy "community_notifications_select_own"
  on public.community_notifications
  for select
  using (auth.uid() = recipient_user_id);

drop policy if exists "community_notifications_update_own_read_state" on public.community_notifications;
create policy "community_notifications_update_own_read_state"
  on public.community_notifications
  for update
  using (auth.uid() = recipient_user_id)
  with check (auth.uid() = recipient_user_id);

comment on table public.community_thread_watches is
  'Current-user thread watch state for in-app Community notifications. Watch APIs must validate thread readability before insert.';

comment on table public.community_notifications is
  'Participant-safe in-app notification rows. Serializers must not expose hidden target bodies, admin notes, moderator identities, or other recipients.';

comment on column public.community_notifications.event_key is
  'Stable per-recipient idempotency key for a single notification event.';
