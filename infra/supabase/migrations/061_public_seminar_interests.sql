-- ============================================================
-- Public seminar signed-in interest
-- ============================================================

create table if not exists public.public_seminar_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null check (source_type in ('document', 'thread', 'space')),
  source_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source_type, source_id)
);

create index if not exists idx_public_seminar_interests_target
  on public.public_seminar_interests (source_type, source_id);

drop trigger if exists trg_public_seminar_interests_updated_at on public.public_seminar_interests;
create trigger trg_public_seminar_interests_updated_at
  before update on public.public_seminar_interests
  for each row execute function public.handle_updated_at();

alter table public.public_seminar_interests enable row level security;

drop policy if exists "public_seminar_interests_select_actor" on public.public_seminar_interests;
create policy "public_seminar_interests_select_actor"
  on public.public_seminar_interests
  for select
  using (auth.uid() = user_id);

drop policy if exists "public_seminar_interests_all_actor" on public.public_seminar_interests;
create policy "public_seminar_interests_all_actor"
  on public.public_seminar_interests
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on table public.public_seminar_interests is
  'Signed-in public seminar interest rows. Public serializers expose aggregate counts and current viewer state only; attendee lists, anonymous identity, IPs, user agents, cookies, auth headers, reminder destinations, payment data, and RSVP/ticket semantics do not belong here.';

comment on column public.public_seminar_interests.source_id is
  'Server-resolved public source row id for document, thread, or space targets. The public seminar digest is only a client handle and is not stored as the durable target.';
