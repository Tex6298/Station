-- ============================================================
-- ARCHIVE EXPORT PACKAGES
-- ============================================================

create table if not exists public.export_packages (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  persona_id uuid not null references public.personas (id) on delete cascade,
  package_kind text not null default 'persona_archive',
  status text not null default 'completed',
  format text not null default 'json_markdown',
  included_sections text[] not null default array[
    'persona',
    'memory',
    'canon',
    'archive',
    'integrity',
    'published_documents',
    'discussion_refs'
  ],
  manifest_json jsonb not null default '{}'::jsonb,
  manifest_markdown text not null default '',
  content_summary jsonb not null default '{}'::jsonb,
  error_message text,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.export_packages
  drop constraint if exists export_packages_status_check;

alter table public.export_packages
  add constraint export_packages_status_check
  check (status in ('requested', 'processing', 'completed', 'failed'));

alter table public.export_packages
  drop constraint if exists export_packages_format_check;

alter table public.export_packages
  add constraint export_packages_format_check
  check (format in ('json_markdown'));

create index if not exists idx_export_packages_owner_persona
  on public.export_packages (owner_user_id, persona_id, created_at desc);

drop trigger if exists trg_export_packages_updated_at on public.export_packages;
create trigger trg_export_packages_updated_at
  before update on public.export_packages
  for each row execute function public.handle_updated_at();

alter table public.export_packages enable row level security;

create policy "export_packages_all_owner" on public.export_packages
  for all using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);
