-- ============================================================
-- DOCUMENT DISCUSSION THREADS
-- ============================================================

alter table public.threads
  add column if not exists linked_document_id uuid references public.documents (id) on delete set null,
  add column if not exists visibility text not null default 'public',
  add column if not exists is_pinned boolean not null default false,
  add column if not exists is_hidden boolean not null default false,
  add column if not exists reported_count integer not null default 0;

alter table public.threads
  drop constraint if exists threads_visibility_check;

alter table public.threads
  add constraint threads_visibility_check
  check (visibility in ('public', 'community', 'unlisted'));

alter table public.comments
  add column if not exists is_pinned boolean not null default false,
  add column if not exists is_hidden boolean not null default false,
  add column if not exists reported_count integer not null default 0;

alter table public.documents
  add column if not exists discussion_thread_id uuid references public.threads (id) on delete set null;

create index if not exists idx_threads_linked_document_id
  on public.threads (linked_document_id);

create index if not exists idx_documents_discussion_thread_id
  on public.documents (discussion_thread_id);

drop policy if exists "threads_select_members" on public.threads;
drop policy if exists "comments_select_members" on public.comments;

create policy "threads_select_public" on public.threads
  for select using (
    status in ('active', 'locked')
    and is_hidden = false
    and visibility in ('public', 'unlisted')
  );

create policy "threads_select_community" on public.threads
  for select using (
    status in ('active', 'locked')
    and is_hidden = false
    and visibility = 'community'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.tier in ('private', 'creator', 'canon', 'institutional')
    )
  );

create policy "comments_select_public_threads" on public.comments
  for select using (
    status = 'active'
    and is_hidden = false
    and parent_type = 'thread'
    and exists (
      select 1 from public.threads t
      where t.id = parent_id
      and t.status in ('active', 'locked')
      and t.is_hidden = false
      and t.visibility in ('public', 'unlisted')
    )
  );

create policy "comments_select_community_threads" on public.comments
  for select using (
    status = 'active'
    and is_hidden = false
    and parent_type = 'thread'
    and exists (
      select 1 from public.threads t
      where t.id = parent_id
      and t.status in ('active', 'locked')
      and t.is_hidden = false
      and t.visibility = 'community'
    )
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.tier in ('private', 'creator', 'canon', 'institutional')
    )
  );
