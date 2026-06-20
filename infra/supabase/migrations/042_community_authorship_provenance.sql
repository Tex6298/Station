-- ============================================================
-- Community authorship provenance
-- ============================================================

alter table public.threads
  add column if not exists authorship_kind text not null default 'user_authored'
    check (authorship_kind in ('user_authored', 'ai_assisted', 'persona_authored', 'imported', 'derived')),
  add column if not exists authorship_source_type text
    check (authorship_source_type is null or authorship_source_type in ('ai', 'persona', 'import', 'document', 'system')),
  add column if not exists authorship_source_id uuid,
  add column if not exists authorship_persona_id uuid references public.personas(id) on delete set null;

alter table public.comments
  add column if not exists authorship_kind text not null default 'user_authored'
    check (authorship_kind in ('user_authored', 'ai_assisted', 'persona_authored', 'imported', 'derived')),
  add column if not exists authorship_source_type text
    check (authorship_source_type is null or authorship_source_type in ('ai', 'persona', 'import', 'document', 'system')),
  add column if not exists authorship_source_id uuid,
  add column if not exists authorship_persona_id uuid references public.personas(id) on delete set null;

update public.threads
set
  authorship_kind = 'user_authored',
  authorship_source_type = null,
  authorship_source_id = null,
  authorship_persona_id = null
where author_user_id is not null
  and authorship_kind = 'user_authored';

update public.comments
set
  authorship_kind = 'user_authored',
  authorship_source_type = null,
  authorship_source_id = null,
  authorship_persona_id = null
where author_user_id is not null
  and authorship_kind = 'user_authored';

create index if not exists idx_threads_authorship_kind
  on public.threads (authorship_kind);

create index if not exists idx_comments_authorship_kind
  on public.comments (authorship_kind);

comment on column public.threads.authorship_kind is
  'Community row authorship mode. Current public routes write user_authored server-side; future AI/persona/imported modes require trusted routes.';

comment on column public.comments.authorship_kind is
  'Community row authorship mode. Current public routes write user_authored server-side; future AI/persona/imported modes require trusted routes.';

comment on column public.threads.authorship_source_id is
  'Optional trusted source pointer for future non-user community authorship modes. Do not expose raw ids through public serializers.';

comment on column public.comments.authorship_source_id is
  'Optional trusted source pointer for future non-user community authorship modes. Do not expose raw ids through public serializers.';
