begin;

select pg_advisory_xact_lock(hashtextextended('station.pr528b3.documents_summary.085', 0));

do $$
begin
  if to_regclass('public.documents') is null then
    raise exception 'PR528B3 expected public.documents to exist before migration 085';
  end if;
end;
$$;

alter table public.documents
  add column if not exists summary text;

alter table public.documents
  drop constraint if exists documents_summary_length_check;

alter table public.documents
  add constraint documents_summary_length_check
  check (summary is null or char_length(btrim(summary)) between 1 and 500);

comment on column public.documents.summary is
  'Optional owner-authored public-facing summary. Empty values normalize to null; Station does not derive this field from the document body.';

notify pgrst, 'reload schema';

commit;
