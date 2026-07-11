-- ============================================================
-- PR508A metadata-only public encounter exhibits
-- ============================================================

create or replace function public.persona_encounter_public_exhibit_tags_valid(tags text[])
returns boolean
language sql
immutable
as $$
  select tags is not null
    and cardinality(tags) <= 12
    and not exists (
      select 1
      from unnest(tags) as tag
      where tag is null
        or char_length(btrim(tag)) not between 1 and 40
    );
$$;

create table if not exists public.persona_encounter_public_exhibits (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  private_session_id uuid not null references public.persona_encounter_private_sessions(id) on delete cascade,
  slug text not null unique,
  public_title text not null,
  public_summary text not null,
  public_tags text[] not null default '{}'::text[],
  initiator_name_snapshot text not null,
  responder_name_snapshot text not null,
  status text not null default 'published',
  provenance_schema text not null default 'station.persona_encounter.public_exhibit.v1',
  reported_count integer not null default 0,
  published_at timestamptz not null default now(),
  retracted_at timestamptz,
  removed_at timestamptz,
  removed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint persona_encounter_public_exhibits_slug_check
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]{8}$'),
  constraint persona_encounter_public_exhibits_title_length_check
    check (char_length(btrim(public_title)) between 1 and 140),
  constraint persona_encounter_public_exhibits_summary_length_check
    check (char_length(btrim(public_summary)) between 1 and 1000),
  constraint persona_encounter_public_exhibits_tags_check
    check (public.persona_encounter_public_exhibit_tags_valid(public_tags)),
  constraint persona_encounter_public_exhibits_status_check
    check (status in ('published', 'retracted', 'removed')),
  constraint persona_encounter_public_exhibits_schema_check
    check (provenance_schema = 'station.persona_encounter.public_exhibit.v1'),
  constraint persona_encounter_public_exhibits_reported_count_check
    check (reported_count >= 0)
);

create unique index if not exists idx_persona_encounter_public_exhibits_private_session
  on public.persona_encounter_public_exhibits (private_session_id);

create index if not exists idx_persona_encounter_public_exhibits_owner_status
  on public.persona_encounter_public_exhibits (owner_user_id, status, created_at desc);

create index if not exists idx_persona_encounter_public_exhibits_public_slug
  on public.persona_encounter_public_exhibits (slug)
  where status = 'published' and removed_at is null;

create or replace function public.validate_persona_encounter_public_exhibit_source()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT'
    or new.private_session_id is distinct from old.private_session_id
    or new.owner_user_id is distinct from old.owner_user_id
  then
    if not exists (
      select 1
      from public.persona_encounter_private_sessions session
      where session.id = new.private_session_id
        and session.owner_user_id = new.owner_user_id
        and session.publication_candidate = true
        and session.shareable = false
        and session.public_visibility = 'private'
        and session.source_retrieval_used = false
        and exists (
          select 1
          from public.personas initiator
          where initiator.id = session.initiator_persona_id
            and initiator.owner_user_id = new.owner_user_id
        )
        and exists (
          select 1
          from public.personas responder
          where responder.id = session.responder_persona_id
            and responder.owner_user_id = new.owner_user_id
        )
    ) then
      raise exception 'persona encounter public exhibit source must be an owner-matched private candidate session';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_persona_encounter_public_exhibits_validate_source
  on public.persona_encounter_public_exhibits;
create trigger trg_persona_encounter_public_exhibits_validate_source
  before insert or update on public.persona_encounter_public_exhibits
  for each row execute function public.validate_persona_encounter_public_exhibit_source();

drop trigger if exists trg_persona_encounter_public_exhibits_updated_at
  on public.persona_encounter_public_exhibits;
create trigger trg_persona_encounter_public_exhibits_updated_at
  before update on public.persona_encounter_public_exhibits
  for each row execute function public.handle_updated_at();

alter table public.persona_encounter_public_exhibits enable row level security;

drop policy if exists "persona_encounter_public_exhibits_select_published"
  on public.persona_encounter_public_exhibits;
create policy "persona_encounter_public_exhibits_select_published"
  on public.persona_encounter_public_exhibits
  for select
  using (status = 'published' and removed_at is null);

drop policy if exists "persona_encounter_public_exhibits_select_owner"
  on public.persona_encounter_public_exhibits;
create policy "persona_encounter_public_exhibits_select_owner"
  on public.persona_encounter_public_exhibits
  for select
  using (auth.uid() = owner_user_id);

drop policy if exists "persona_encounter_public_exhibits_insert_owner"
  on public.persona_encounter_public_exhibits;
create policy "persona_encounter_public_exhibits_insert_owner"
  on public.persona_encounter_public_exhibits
  for insert
  with check (auth.uid() = owner_user_id and status = 'published');

drop policy if exists "persona_encounter_public_exhibits_update_owner"
  on public.persona_encounter_public_exhibits;
create policy "persona_encounter_public_exhibits_update_owner"
  on public.persona_encounter_public_exhibits
  for update
  using (auth.uid() = owner_user_id and status <> 'removed')
  with check (auth.uid() = owner_user_id and status in ('published', 'retracted'));

alter table public.moderation_reports
  drop constraint if exists moderation_reports_target_type_check;

alter table public.moderation_reports
  add constraint moderation_reports_target_type_check
  check (target_type in ('user', 'space', 'document', 'thread', 'comment', 'persona', 'persona_encounter_public_exhibit'));

comment on table public.persona_encounter_public_exhibits is
  'Metadata-only public exhibits derived from same-owner private encounter artifacts. No transcript, setup body, generated reply, private curation, source body, provider payload, or cross-owner persona words are published.';

comment on column public.persona_encounter_public_exhibits.private_session_id is
  'Private source artifact id kept internal. Public and report routes use the public slug, not this raw id.';

comment on column public.persona_encounter_public_exhibits.public_title is
  'Owner-authored public exhibit title. Must be newly authored for public output and not copied from private curation.';

comment on column public.persona_encounter_public_exhibits.public_summary is
  'Owner-authored public metadata/context note. Not a transcript, excerpt, generated reply, private setup, or private curation note.';
