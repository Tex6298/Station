-- ============================================================
-- Moderation review request foundation
-- ============================================================
-- Durable participant/admin contract for report or target review requests.
-- This is intentionally not a public moderation log and should only be
-- exposed through participant-safe/admin-safe serializers.

create table if not exists public.moderation_review_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  requester_role text not null check (requester_role in ('reporter', 'target_author')),
  target_type text not null check (target_type in ('thread', 'comment')),
  target_id uuid not null,
  report_id uuid references public.moderation_reports(id) on delete set null,
  moderation_action_id uuid references public.community_moderation_actions(id) on delete set null,
  reason text not null,
  status text not null default 'open'
    check (status in ('open', 'reviewing', 'upheld', 'denied', 'dismissed', 'withdrawn')),
  resolution_summary text,
  admin_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_moderation_review_requests_requester_status
  on public.moderation_review_requests (requester_id, status, created_at desc);

create index if not exists idx_moderation_review_requests_queue
  on public.moderation_review_requests (status, created_at desc);

create index if not exists idx_moderation_review_requests_target
  on public.moderation_review_requests (target_type, target_id, created_at desc);

create unique index if not exists idx_moderation_review_requests_active_unique
  on public.moderation_review_requests (requester_id, target_type, target_id, reason)
  where status in ('open', 'reviewing');

drop trigger if exists trg_moderation_review_requests_updated_at on public.moderation_review_requests;
create trigger trg_moderation_review_requests_updated_at
  before update on public.moderation_review_requests
  for each row execute function public.handle_updated_at();

alter table public.moderation_review_requests enable row level security;

drop policy if exists "moderation_review_requests_insert_own" on public.moderation_review_requests;
create policy "moderation_review_requests_insert_own"
  on public.moderation_review_requests
  for insert
  with check (auth.uid() = requester_id);

drop policy if exists "moderation_review_requests_select_own" on public.moderation_review_requests;
create policy "moderation_review_requests_select_own"
  on public.moderation_review_requests
  for select
  using (auth.uid() = requester_id);

drop policy if exists "moderation_review_requests_admin_all" on public.moderation_review_requests;
create policy "moderation_review_requests_admin_all"
  on public.moderation_review_requests
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_admin = true
    )
  );

comment on table public.moderation_review_requests is
  'Participant/admin moderation review request contract. Participant serializers must exclude admin_notes, reviewed_by, hidden target bodies, and private target material.';

comment on index public.idx_moderation_review_requests_active_unique is
  'Prevents duplicate active review requests from the same requester for the same target and reason.';
