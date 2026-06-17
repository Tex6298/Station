-- Durable publishing approval queue for owner-reviewed Station documents.
-- This records review state and provenance events without adding workers or
-- external dispatch in this lane.

create table if not exists public.publishing_approval_items (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  state text not null default 'draft'
    check (state in (
      'draft',
      'grounding_check',
      'human_review',
      'approved',
      'regenerate',
      'cancelled',
      'scheduled',
      'published',
      'archived'
    )),
  visibility text not null default 'public'
    check (visibility in ('public', 'community', 'unlisted')),
  scheduled_for timestamptz,
  grounding_summary text,
  review_note text,
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  published_at timestamptz,
  cancelled_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_id)
);

create index if not exists publishing_approval_items_owner_state_idx
  on public.publishing_approval_items(owner_user_id, state, updated_at desc);

create table if not exists public.publishing_approval_events (
  id uuid primary key default gen_random_uuid(),
  approval_item_id uuid not null references public.publishing_approval_items(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  actor_user_id uuid not null references public.profiles(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  event_type text not null,
  from_state text,
  to_state text not null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists publishing_approval_events_item_created_idx
  on public.publishing_approval_events(approval_item_id, created_at desc);

create index if not exists publishing_approval_events_owner_created_idx
  on public.publishing_approval_events(owner_user_id, created_at desc);
