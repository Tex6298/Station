-- ============================================================
-- ARCHIVED CHATS AND CONTINUITY CANDIDATES
-- ============================================================

alter table public.conversations
  add column if not exists status text not null default 'active',
  add column if not exists archived_at timestamptz,
  add column if not exists message_count integer not null default 0;

alter table public.conversations
  drop constraint if exists conversations_status_check;

alter table public.conversations
  add constraint conversations_status_check
  check (status in ('active', 'archived'));

alter table public.export_packages
  alter column included_sections set default array[
    'persona',
    'memory',
    'canon',
    'archive',
    'archived_chats',
    'continuity_candidates',
    'integrity',
    'published_documents',
    'discussion_refs'
  ];

create table if not exists public.archived_chat_transcripts (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  persona_id uuid not null references public.personas (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  transcript_markdown text not null,
  message_count integer not null default 0,
  source_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (conversation_id)
);

create table if not exists public.continuity_candidates (
  id uuid primary key default gen_random_uuid(),
  archived_chat_transcript_id uuid not null references public.archived_chat_transcripts (id) on delete cascade,
  persona_id uuid not null references public.personas (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  candidate_type text not null check (candidate_type in ('memory', 'canon')),
  title text,
  content text not null,
  rationale text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  source_message_ids uuid[] not null default '{}'::uuid[],
  accepted_target_type text check (accepted_target_type in ('memory', 'canon')),
  accepted_target_id uuid,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_archived_chat_transcripts_owner_persona
  on public.archived_chat_transcripts (owner_user_id, persona_id, created_at desc);

create index if not exists idx_continuity_candidates_owner_persona_status
  on public.continuity_candidates (owner_user_id, persona_id, status, created_at desc);

drop trigger if exists trg_archived_chat_transcripts_updated_at on public.archived_chat_transcripts;
create trigger trg_archived_chat_transcripts_updated_at
  before update on public.archived_chat_transcripts
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_continuity_candidates_updated_at on public.continuity_candidates;
create trigger trg_continuity_candidates_updated_at
  before update on public.continuity_candidates
  for each row execute function public.handle_updated_at();

alter table public.archived_chat_transcripts enable row level security;
alter table public.continuity_candidates enable row level security;

create policy "archived_chat_transcripts_all_owner" on public.archived_chat_transcripts
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "continuity_candidates_all_owner" on public.continuity_candidates
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);
