-- Keep public persona URLs on dedicated slugs, never raw UUID-shaped ids.
-- This repairs databases that already ran 054 before the UUID-shape guard.

with uuid_slugs as (
  select
    id,
    public_slug,
    'persona-' || public_slug as base_slug
  from public.personas
  where public_slug ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
),
safe_slugs as (
  select
    u.id,
    case
      when exists (
        select 1
        from public.personas p
        where p.id <> u.id
          and p.public_slug = u.base_slug
      ) then u.base_slug || '-' || substr(md5(u.id::text), 1, 8)
      else u.base_slug
    end as public_slug
  from uuid_slugs u
)
update public.personas p
set public_slug = safe_slugs.public_slug
from safe_slugs
where p.id = safe_slugs.id;

alter table public.personas
  drop constraint if exists personas_public_slug_format;

alter table public.personas
  add constraint personas_public_slug_format
  check (
    public_slug is null or (
      public_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      and public_slug !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    )
  );
