-- Keep live document-discussion threads on the launch category slug.
-- Existing alpha databases may already have documents-and-constitutions rows.

do $$
declare
  legacy_category_id uuid;
  launch_category_id uuid;
begin
  select id into legacy_category_id
  from public.forum_categories
  where slug = 'documents-and-constitutions'
  limit 1;

  select id into launch_category_id
  from public.forum_categories
  where slug = 'documents-and-codexes'
  limit 1;

  if legacy_category_id is null then
    return;
  end if;

  if launch_category_id is null then
    update public.forum_categories
    set
      slug = 'documents-and-codexes',
      title = 'Documents & Codexes',
      description = coalesce(
        nullif(replace(coalesce(description, ''), 'constitutions', 'codexes'), ''),
        'Station documents, codexes, and linked discussions.'
      )
    where id = legacy_category_id;

    return;
  end if;

  update public.threads
  set category_id = launch_category_id
  where category_id = legacy_category_id;

  update public.forum_categories
  set
    title = coalesce(nullif(title, ''), 'Documents & Codexes'),
    description = coalesce(nullif(description, ''), 'Station documents, codexes, and linked discussions.')
  where id = launch_category_id;

  delete from public.forum_categories
  where id = legacy_category_id;
end $$;
