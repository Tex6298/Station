-- Align Station document types with the product/technical spec.
-- Old alpha values are migrated into the launch taxonomy before the check is tightened.

update public.documents
set document_type = case document_type
  when 'post' then 'essay'
  when 'constitution' then 'codex'
  when 'update' then 'field_log'
  when 'other' then 'archive_note'
  else document_type
end
where document_type in ('post', 'constitution', 'update', 'other');

alter table public.documents
  alter column document_type set default 'essay';

alter table public.documents
  drop constraint if exists documents_document_type_check;

alter table public.documents
  add constraint documents_document_type_check
  check (document_type in ('essay', 'codex', 'manifesto', 'field_log', 'research', 'archive_note', 'transcript'));
