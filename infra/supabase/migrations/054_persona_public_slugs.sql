-- Dedicated public route identifiers for public persona readback pages.
-- Public URLs must not use raw persona UUIDs.

alter table public.personas
  add column if not exists public_slug text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'personas_public_slug_format'
  ) then
    alter table public.personas
      add constraint personas_public_slug_format
      check (public_slug is null or public_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;
end $$;

create unique index if not exists personas_public_slug_unique_idx
  on public.personas (public_slug)
  where public_slug is not null;

with candidates as (
  select
    id,
    coalesce(
      nullif(
        trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')),
        ''
      ),
      'persona'
    ) as base_slug
  from public.personas
  where visibility = 'public'
    and public_slug is null
),
ranked as (
  select
    id,
    case
      when count(*) over (partition by base_slug) = 1 then base_slug
      else base_slug || '-' || substr(md5(id::text), 1, 8)
    end as generated_slug
  from candidates
)
update public.personas p
set public_slug = ranked.generated_slug
from ranked
where p.id = ranked.id;

comment on column public.personas.public_slug is
  'Dedicated safe public route identifier for opted-in public persona readback pages. Do not use raw persona ids in public URLs.';
