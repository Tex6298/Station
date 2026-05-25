-- ============================================================
-- DOCUMENT PROVENANCE + PUBLICATION VISIBILITY
-- ============================================================

alter table public.documents
  add column if not exists provenance_type text not null default 'user_authored',
  add column if not exists source_type text,
  add column if not exists source_id uuid,
  add column if not exists source_label text,
  add column if not exists source_persona_id uuid references public.personas (id) on delete set null;

alter table public.documents
  drop constraint if exists documents_visibility_check;

alter table public.documents
  add constraint documents_visibility_check
  check (visibility in ('private', 'unlisted', 'community', 'public', 'members'));

alter table public.documents
  drop constraint if exists documents_provenance_type_check;

alter table public.documents
  add constraint documents_provenance_type_check
  check (provenance_type in ('user_authored', 'ai_assisted', 'archive_import', 'integrity_session', 'persona_derived'));

alter table public.documents
  drop constraint if exists documents_source_type_check;

alter table public.documents
  add constraint documents_source_type_check
  check (
    source_type is null
    or source_type in ('manual', 'canon', 'integrity', 'archive_file', 'archive_import', 'persona')
  );

drop policy if exists "documents_select_public" on public.documents;
drop policy if exists "documents_select_members" on public.documents;

create policy "documents_select_public" on public.documents
  for select using (
    visibility in ('public', 'unlisted')
    and status = 'published'
  );

create policy "documents_select_community" on public.documents
  for select using (
    visibility in ('community', 'members')
    and status = 'published'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.tier in ('private', 'creator', 'canon', 'institutional')
    )
  );
