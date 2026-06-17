-- PR17 - Import-backed Memory/Canon review candidates.

alter table public.continuity_candidates
  alter column archived_chat_transcript_id drop not null,
  add column if not exists source_table text,
  add column if not exists source_id uuid,
  add column if not exists source_label text;

alter table public.continuity_candidates
  drop constraint if exists continuity_candidates_source_ref_check;

alter table public.continuity_candidates
  add constraint continuity_candidates_source_ref_check
  check (
    (
      archived_chat_transcript_id is not null
      and source_table is null
      and source_id is null
    )
    or (
      archived_chat_transcript_id is null
      and source_table = 'persona_files'
      and source_id is not null
    )
  );

create index if not exists idx_continuity_candidates_source_ref
  on public.continuity_candidates (owner_user_id, source_table, source_id);
