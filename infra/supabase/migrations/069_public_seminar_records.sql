-- ============================================================
-- Durable owner seminar record contract
-- ============================================================

create table if not exists public.public_seminar_records (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null check (source_type in ('document')),
  source_id uuid not null references public.documents(id) on delete restrict,
  title text not null,
  summary text,
  status text not null default 'draft' check (status in ('draft', 'ready', 'published', 'cancelled')),
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  discussion_thread_id uuid references public.threads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, source_type, source_id)
);

create index if not exists idx_public_seminar_records_owner_status_updated
  on public.public_seminar_records (owner_user_id, status, updated_at desc);

create index if not exists idx_public_seminar_records_source
  on public.public_seminar_records (source_type, source_id);

drop trigger if exists trg_public_seminar_records_updated_at on public.public_seminar_records;
create trigger trg_public_seminar_records_updated_at
  before update on public.public_seminar_records
  for each row execute function public.handle_updated_at();

alter table public.public_seminar_records enable row level security;

drop policy if exists "public_seminar_records_select_owner" on public.public_seminar_records;
create policy "public_seminar_records_select_owner"
  on public.public_seminar_records
  for select
  using (auth.uid() = owner_user_id);

drop policy if exists "public_seminar_records_insert_owner" on public.public_seminar_records;
create policy "public_seminar_records_insert_owner"
  on public.public_seminar_records
  for insert
  with check (auth.uid() = owner_user_id);

drop policy if exists "public_seminar_records_update_owner" on public.public_seminar_records;
create policy "public_seminar_records_update_owner"
  on public.public_seminar_records
  for update
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "public_seminar_records_delete_owner" on public.public_seminar_records;
create policy "public_seminar_records_delete_owner"
  on public.public_seminar_records
  for delete
  using (auth.uid() = owner_user_id);

comment on table public.public_seminar_records is
  'Owner-scoped durable public seminar record contract. Direct public table reads are intentionally absent; public readback must go through a safe serializer or future view.';

comment on column public.public_seminar_records.source_type is
  'First accepted durable seminar source type is document only. Thread and Space source records are deferred for separate owner-boundary review.';

comment on column public.public_seminar_records.source_id is
  'Raw owner source row id. Do not expose directly in public APIs or client readback; public routes must use safe serializers.';
