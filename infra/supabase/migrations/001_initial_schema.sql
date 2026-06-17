-- ============================================================
-- Station – Initial Schema Migration
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- Enable pgvector for persona archive embeddings
create extension if not exists vector;

-- ============================================================
-- PROFILES
-- Extends Supabase auth.users with tier + display info
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text unique not null,
  display_name  text,
  bio           text,
  avatar_url    text,
  tier          text not null default 'visitor'
                  check (tier in ('visitor', 'private', 'creator', 'canon', 'institutional')),
  stripe_customer_id    text,
  stripe_subscription_id text,
  subscription_status   text default 'inactive',
  byok_openai_key       text,   -- encrypted at rest via Supabase Vault in production
  byok_anthropic_key    text,
  byok_deepseek_key     text,
  ai_mode               text not null default 'platform'
                          check (ai_mode in ('platform', 'byok')),
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- PERSONAS
-- ============================================================
create table public.personas (
  id                uuid primary key default gen_random_uuid(),
  owner_user_id     uuid not null references public.profiles (id) on delete cascade,
  name              text not null,
  short_description text,
  long_description  text,
  avatar_url        text,
  visibility        text not null default 'private'
                      check (visibility in ('private', 'public')),
  provider          text not null default 'platform'
                      check (provider in ('platform', 'openai', 'anthropic', 'deepseek', 'gemini')),
  awakening_prompt  text,   -- the initiatory/ritual prompt used to establish this persona
  style_notes       text,   -- how this persona speaks and thinks
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
create table public.conversations (
  id            uuid primary key default gen_random_uuid(),
  persona_id    uuid not null references public.personas (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  title         text,
  mode          text not null default 'private'
                  check (mode in ('private', 'public')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- CONVERSATION MESSAGES
-- ============================================================
create table public.conversation_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'system')),
  content         text not null,
  tokens_used     integer,
  provider_used   text,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- PERSONA MEMORY
-- Searchable context items injected into every conversation
-- ============================================================
create table public.memory_items (
  id               uuid primary key default gen_random_uuid(),
  persona_id       uuid not null references public.personas (id) on delete cascade,
  owner_user_id    uuid not null references public.profiles (id) on delete cascade,
  title            text,
  content          text not null,
  summary          text,
  source_type      text not null default 'manual'
                     check (source_type in ('chat', 'import', 'document', 'calibration', 'manual')),
  relevance_weight integer not null default 1,
  embedding        vector(1536),  -- for semantic search via pgvector
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- CANON ITEMS
-- High-priority rules / truths about the persona (always injected)
-- ============================================================
create table public.canon_items (
  id            uuid primary key default gen_random_uuid(),
  persona_id    uuid not null references public.personas (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  title         text,
  content       text not null,
  source_type   text not null default 'manual'
                  check (source_type in ('chat', 'import', 'document', 'calibration', 'manual')),
  priority      integer not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- PERSONA FILES
-- Documents / images uploaded to the persona archive
-- ============================================================
create table public.persona_files (
  id            uuid primary key default gen_random_uuid(),
  persona_id    uuid not null references public.personas (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  file_name     text not null,
  file_type     text,
  file_size     bigint,
  storage_path  text not null,  -- Supabase Storage path
  source_type   text not null default 'upload'
                  check (source_type in ('upload', 'import', 'calibration', 'generated')),
  processed     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- IMPORT JOBS
-- Tracks file/chat import processing status
-- ============================================================
create table public.import_jobs (
  id            uuid primary key default gen_random_uuid(),
  persona_id    uuid not null references public.personas (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  kind          text not null check (kind in ('file', 'chat')),
  status        text not null default 'queued'
                  check (status in ('queued', 'processing', 'completed', 'failed')),
  source_name   text not null,
  error_message text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- CALIBRATION SESSIONS
-- Structured Q&A sessions used to extract persona style rules
-- ============================================================
create table public.calibration_sessions (
  id                        uuid primary key default gen_random_uuid(),
  owner_user_id             uuid not null references public.profiles (id) on delete cascade,
  persona_id                uuid references public.personas (id) on delete set null,
  session_title             text,
  transcript                text not null,
  extracted_style_notes     text,
  extracted_public_rules    text,
  extracted_private_rules   text,
  extracted_uncertainty_rules text,
  save_target               text not null default 'persona'
                              check (save_target in ('persona', 'global', 'public_mode', 'other')),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ============================================================
-- SPACES (public pages — MySpace/Substack hybrid)
-- ============================================================
create table public.spaces (
  id                        uuid primary key default gen_random_uuid(),
  owner_user_id             uuid not null references public.profiles (id) on delete cascade,
  slug                      text unique not null,
  title                     text not null,
  short_description         text,
  long_description          text,
  theme                     text default 'default',
  custom_css                text,
  is_public                 boolean not null default false,
  comments_default_enabled  boolean not null default true,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ============================================================
-- SPACE PAGES
-- ============================================================
create table public.space_pages (
  id               uuid primary key default gen_random_uuid(),
  space_id         uuid not null references public.spaces (id) on delete cascade,
  slug             text not null,
  title            text not null,
  page_type        text not null default 'custom'
                     check (page_type in ('home', 'about', 'personas', 'documents', 'custom')),
  body             text,
  sort_order       integer not null default 0,
  is_published     boolean not null default false,
  comments_enabled boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (space_id, slug)
);

-- ============================================================
-- DOCUMENTS (posts / articles / manifestos)
-- ============================================================
create table public.documents (
  id               uuid primary key default gen_random_uuid(),
  author_user_id   uuid not null references public.profiles (id) on delete cascade,
  space_id         uuid references public.spaces (id) on delete set null,
  persona_id       uuid references public.personas (id) on delete set null,
  title            text not null,
  slug             text not null,
  body             text,
  document_type    text not null default 'essay'
                     check (document_type in ('essay', 'codex', 'manifesto', 'field_log', 'research', 'archive_note', 'transcript')),
  status           text not null default 'draft'
                     check (status in ('draft', 'published', 'archived')),
  visibility       text not null default 'private'
                     check (visibility in ('private', 'public', 'members')),
  comments_enabled boolean not null default true,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (author_user_id, slug)
);

-- ============================================================
-- FORUM CATEGORIES
-- ============================================================
create table public.forum_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- FORUM THREADS
-- ============================================================
create table public.threads (
  id                uuid primary key default gen_random_uuid(),
  category_id       uuid not null references public.forum_categories (id) on delete cascade,
  author_user_id    uuid not null references public.profiles (id) on delete cascade,
  linked_space_id   uuid references public.spaces (id) on delete set null,
  linked_persona_id uuid references public.personas (id) on delete set null,
  title             text not null,
  body              text not null,
  status            text not null default 'active'
                      check (status in ('active', 'locked', 'removed')),
  score             integer not null default 0,
  comment_count     integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- COMMENTS (on threads and documents)
-- ============================================================
create table public.comments (
  id             uuid primary key default gen_random_uuid(),
  author_user_id uuid not null references public.profiles (id) on delete cascade,
  parent_type    text not null check (parent_type in ('thread', 'document', 'space_page')),
  parent_id      uuid not null,
  body           text not null,
  status         text not null default 'active'
                   check (status in ('active', 'removed', 'flagged')),
  score          integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================
-- MODERATION REPORTS
-- ============================================================
create table public.moderation_reports (
  id              uuid primary key default gen_random_uuid(),
  reporter_id     uuid not null references public.profiles (id) on delete cascade,
  target_type     text not null check (target_type in ('thread', 'comment', 'document', 'persona', 'space')),
  target_id       uuid not null,
  reason          text not null,
  status          text not null default 'open'
                    check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  reviewed_by     uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- DISCOVER FEED EVENTS
-- ============================================================
create table public.discover_feed (
  id          uuid primary key default gen_random_uuid(),
  item_type   text not null check (item_type in ('document', 'thread', 'space', 'persona')),
  event_type  text not null check (event_type in ('published', 'created', 'featured', 'updated')),
  item_id     uuid not null,
  title       text not null,
  description text,
  href        text not null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.handle_updated_at();
create trigger trg_personas_updated_at before update on public.personas for each row execute function public.handle_updated_at();
create trigger trg_conversations_updated_at before update on public.conversations for each row execute function public.handle_updated_at();
create trigger trg_memory_items_updated_at before update on public.memory_items for each row execute function public.handle_updated_at();
create trigger trg_canon_items_updated_at before update on public.canon_items for each row execute function public.handle_updated_at();
create trigger trg_import_jobs_updated_at before update on public.import_jobs for each row execute function public.handle_updated_at();
create trigger trg_calibration_sessions_updated_at before update on public.calibration_sessions for each row execute function public.handle_updated_at();
create trigger trg_spaces_updated_at before update on public.spaces for each row execute function public.handle_updated_at();
create trigger trg_space_pages_updated_at before update on public.space_pages for each row execute function public.handle_updated_at();
create trigger trg_documents_updated_at before update on public.documents for each row execute function public.handle_updated_at();
create trigger trg_threads_updated_at before update on public.threads for each row execute function public.handle_updated_at();
create trigger trg_comments_updated_at before update on public.comments for each row execute function public.handle_updated_at();
create trigger trg_moderation_reports_updated_at before update on public.moderation_reports for each row execute function public.handle_updated_at();

-- ============================================================
-- NEW USER PROFILE TRIGGER
-- Automatically creates a profile row when a user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- PGVECTOR INDEX for memory_items semantic search
-- ============================================================
create index on public.memory_items using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
