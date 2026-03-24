-- ============================================================
-- Station – Row Level Security (RLS) Policies
-- Run after 001_initial_schema.sql
-- ============================================================

-- Enable RLS on all user-facing tables
alter table public.profiles enable row level security;
alter table public.personas enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.memory_items enable row level security;
alter table public.canon_items enable row level security;
alter table public.persona_files enable row level security;
alter table public.import_jobs enable row level security;
alter table public.calibration_sessions enable row level security;
alter table public.spaces enable row level security;
alter table public.space_pages enable row level security;
alter table public.documents enable row level security;
alter table public.forum_categories enable row level security;
alter table public.threads enable row level security;
alter table public.comments enable row level security;
alter table public.moderation_reports enable row level security;
alter table public.discover_feed enable row level security;

-- ============================================================
-- PROFILES
-- ============================================================
-- Anyone can read public profile info
create policy "profiles_select_public" on public.profiles
  for select using (true);

-- Users can only update their own profile
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ============================================================
-- PERSONAS
-- ============================================================
-- Owner can do everything with their personas
create policy "personas_all_owner" on public.personas
  for all using (auth.uid() = owner_user_id);

-- Anyone can read public personas
create policy "personas_select_public" on public.personas
  for select using (visibility = 'public');

-- ============================================================
-- CONVERSATIONS
-- ============================================================
-- Only owner can access their conversations
create policy "conversations_all_owner" on public.conversations
  for all using (auth.uid() = owner_user_id);

-- ============================================================
-- CONVERSATION MESSAGES
-- ============================================================
-- Owner can access messages in their own conversations
create policy "messages_all_owner" on public.conversation_messages
  for all using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and c.owner_user_id = auth.uid()
    )
  );

-- ============================================================
-- MEMORY ITEMS
-- ============================================================
create policy "memory_all_owner" on public.memory_items
  for all using (auth.uid() = owner_user_id);

-- ============================================================
-- CANON ITEMS
-- ============================================================
create policy "canon_all_owner" on public.canon_items
  for all using (auth.uid() = owner_user_id);

-- ============================================================
-- PERSONA FILES
-- ============================================================
create policy "persona_files_all_owner" on public.persona_files
  for all using (auth.uid() = owner_user_id);

-- ============================================================
-- IMPORT JOBS
-- ============================================================
create policy "import_jobs_all_owner" on public.import_jobs
  for all using (auth.uid() = owner_user_id);

-- ============================================================
-- CALIBRATION SESSIONS
-- ============================================================
create policy "calibration_all_owner" on public.calibration_sessions
  for all using (auth.uid() = owner_user_id);

-- ============================================================
-- SPACES
-- ============================================================
-- Owner can do everything
create policy "spaces_all_owner" on public.spaces
  for all using (auth.uid() = owner_user_id);

-- Anyone can read public spaces
create policy "spaces_select_public" on public.spaces
  for select using (is_public = true);

-- ============================================================
-- SPACE PAGES
-- ============================================================
-- Space owner can do everything with their pages
create policy "space_pages_all_owner" on public.space_pages
  for all using (
    exists (
      select 1 from public.spaces s
      where s.id = space_id
      and s.owner_user_id = auth.uid()
    )
  );

-- Anyone can read published pages in public spaces
create policy "space_pages_select_public" on public.space_pages
  for select using (
    is_published = true
    and exists (
      select 1 from public.spaces s
      where s.id = space_id
      and s.is_public = true
    )
  );

-- ============================================================
-- DOCUMENTS
-- ============================================================
-- Author can do everything with their documents
create policy "documents_all_author" on public.documents
  for all using (auth.uid() = author_user_id);

-- Anyone can read public published documents
create policy "documents_select_public" on public.documents
  for select using (visibility = 'public' and status = 'published');

-- Members-only documents: authenticated users with paid tier
create policy "documents_select_members" on public.documents
  for select using (
    visibility = 'members'
    and status = 'published'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.tier in ('private', 'creator', 'canon', 'institutional')
    )
  );

-- ============================================================
-- FORUM CATEGORIES (public read)
-- ============================================================
create policy "forum_categories_select_all" on public.forum_categories
  for select using (true);

-- ============================================================
-- THREADS
-- ============================================================
-- Active threads are readable by authenticated paid users
create policy "threads_select_members" on public.threads
  for select using (
    status = 'active'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.tier in ('private', 'creator', 'canon', 'institutional')
    )
  );

-- Authors can manage their own threads
create policy "threads_all_author" on public.threads
  for all using (auth.uid() = author_user_id);

-- ============================================================
-- COMMENTS
-- ============================================================
-- Active comments readable by authenticated paid users
create policy "comments_select_members" on public.comments
  for select using (
    status = 'active'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.tier in ('private', 'creator', 'canon', 'institutional')
    )
  );

-- Authors can manage their own comments
create policy "comments_all_author" on public.comments
  for all using (auth.uid() = author_user_id);

-- ============================================================
-- MODERATION REPORTS
-- ============================================================
-- Users can create reports and see their own
create policy "reports_insert" on public.moderation_reports
  for insert with check (auth.uid() = reporter_id);

create policy "reports_select_own" on public.moderation_reports
  for select using (auth.uid() = reporter_id);

-- Admins can see and update all reports
create policy "reports_all_admin" on public.moderation_reports
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.is_admin = true
    )
  );

-- ============================================================
-- DISCOVER FEED (public read)
-- ============================================================
create policy "discover_feed_select_all" on public.discover_feed
  for select using (true);
