-- ============================================================
-- PR517A cross-owner metadata-only public encounter exhibits
-- ============================================================

create table if not exists public.persona_encounter_cross_owner_public_exhibits (
  id uuid primary key default gen_random_uuid(),
  consent_id uuid not null references public.persona_encounter_cross_owner_consents(id) on delete cascade,
  requester_owner_user_id uuid not null references public.profiles(id) on delete cascade,
  requester_persona_id uuid not null references public.personas(id) on delete cascade,
  requester_persona_name_snapshot text not null,
  counterparty_owner_user_id uuid not null references public.profiles(id) on delete cascade,
  counterparty_persona_id uuid not null references public.personas(id) on delete cascade,
  counterparty_persona_name_snapshot text not null,
  slug text not null unique,
  public_title text not null,
  public_summary text not null,
  public_tags text[] not null default '{}'::text[],
  status text not null default 'proposed',
  contract_version integer not null default 1,
  provenance_schema text not null default 'station.persona_encounter.cross_owner_public_exhibit.v1',
  requester_metadata_approved_at timestamptz,
  counterparty_metadata_approved_at timestamptz,
  reported_count integer not null default 0,
  published_at timestamptz,
  retracted_at timestamptz,
  removed_at timestamptz,
  removed_by uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  updated_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pe_co_public_exhibits_distinct_owners_check
    check (requester_owner_user_id <> counterparty_owner_user_id),
  constraint pe_co_public_exhibits_distinct_personas_check
    check (requester_persona_id <> counterparty_persona_id),
  constraint pe_co_public_exhibits_slug_check
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]{8}$'),
  constraint pe_co_public_exhibits_title_length_check
    check (char_length(btrim(public_title)) between 1 and 140),
  constraint pe_co_public_exhibits_summary_length_check
    check (char_length(btrim(public_summary)) between 1 and 1000),
  constraint pe_co_public_exhibits_tags_check
    check (public.persona_encounter_public_exhibit_tags_valid(public_tags)),
  constraint pe_co_public_exhibits_status_check
    check (status in ('proposed', 'published', 'retracted', 'removed')),
  constraint pe_co_public_exhibits_contract_version_check
    check (contract_version = 1),
  constraint pe_co_public_exhibits_schema_check
    check (provenance_schema = 'station.persona_encounter.cross_owner_public_exhibit.v1'),
  constraint pe_co_public_exhibits_reported_count_check
    check (reported_count >= 0),
  constraint pe_co_public_exhibits_published_approval_check
    check (
      status <> 'published'
      or (
        requester_metadata_approved_at is not null
        and counterparty_metadata_approved_at is not null
        and published_at is not null
        and removed_at is null
      )
    )
);

create unique index if not exists idx_pe_co_public_exhibits_one_open_per_consent
  on public.persona_encounter_cross_owner_public_exhibits (consent_id)
  where status in ('proposed', 'published');

create index if not exists idx_pe_co_public_exhibits_requester
  on public.persona_encounter_cross_owner_public_exhibits (requester_owner_user_id, created_at desc);

create index if not exists idx_pe_co_public_exhibits_counterparty
  on public.persona_encounter_cross_owner_public_exhibits (counterparty_owner_user_id, created_at desc);

create index if not exists idx_pe_co_public_exhibits_public_slug
  on public.persona_encounter_cross_owner_public_exhibits (slug)
  where status = 'published' and removed_at is null and retracted_at is null;

create or replace function public.validate_persona_encounter_cross_owner_public_exhibit()
returns trigger
language plpgsql
as $$
declare
  v_consent public.persona_encounter_cross_owner_consents%rowtype;
begin
  select *
  into v_consent
  from public.persona_encounter_cross_owner_consents
  where id = new.consent_id;

  if not found then
    raise exception 'cross-owner public exhibit consent not found';
  end if;

  if v_consent.status <> 'approved'
    or v_consent.requested_scope_version <> 1
    or not ('publish_metadata_only_public_exhibit' = any(v_consent.requested_scopes))
  then
    raise exception 'cross-owner public exhibit requires active approved metadata-only consent';
  end if;

  if new.requester_owner_user_id <> v_consent.requester_owner_user_id
    or new.requester_persona_id <> v_consent.requester_persona_id
    or new.counterparty_owner_user_id <> v_consent.counterparty_owner_user_id
    or new.counterparty_persona_id <> v_consent.counterparty_persona_id
  then
    raise exception 'cross-owner public exhibit participants must match consent';
  end if;

  if new.requester_persona_name_snapshot <> v_consent.requester_persona_name_snapshot
    or new.counterparty_persona_name_snapshot <> v_consent.counterparty_persona_name_snapshot
  then
    raise exception 'cross-owner public exhibit display snapshots must match consent';
  end if;

  return new;
end;
$$;

drop trigger if exists pe_co_public_exhibits_validate
  on public.persona_encounter_cross_owner_public_exhibits;
create trigger pe_co_public_exhibits_validate
  before insert or update on public.persona_encounter_cross_owner_public_exhibits
  for each row execute function public.validate_persona_encounter_cross_owner_public_exhibit();

drop trigger if exists pe_co_public_exhibits_updated_at
  on public.persona_encounter_cross_owner_public_exhibits;
create trigger pe_co_public_exhibits_updated_at
  before update on public.persona_encounter_cross_owner_public_exhibits
  for each row execute function public.handle_updated_at();

create or replace function public.retract_cross_owner_public_exhibits_on_consent_inactive()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'approved' and new.status <> 'approved' then
    update public.persona_encounter_cross_owner_public_exhibits
    set
      status = 'retracted',
      retracted_at = coalesce(retracted_at, now()),
      updated_at = now()
    where consent_id = new.id
      and status in ('proposed', 'published');
  end if;

  return new;
end;
$$;

drop trigger if exists pe_co_public_exhibits_retract_on_consent
  on public.persona_encounter_cross_owner_consents;
create trigger pe_co_public_exhibits_retract_on_consent
  after update of status on public.persona_encounter_cross_owner_consents
  for each row execute function public.retract_cross_owner_public_exhibits_on_consent_inactive();

alter table public.persona_encounter_cross_owner_public_exhibits enable row level security;

drop policy if exists "pe_co_public_exhibits_select_published"
  on public.persona_encounter_cross_owner_public_exhibits;
create policy "pe_co_public_exhibits_select_published"
  on public.persona_encounter_cross_owner_public_exhibits
  for select
  using (
    status = 'published'
    and removed_at is null
    and retracted_at is null
    and exists (
      select 1
      from public.persona_encounter_cross_owner_consents consent
      where consent.id = consent_id
        and consent.status = 'approved'
        and consent.requested_scope_version = 1
        and 'publish_metadata_only_public_exhibit' = any(consent.requested_scopes)
    )
  );

drop policy if exists "pe_co_public_exhibits_select_participants"
  on public.persona_encounter_cross_owner_public_exhibits;
create policy "pe_co_public_exhibits_select_participants"
  on public.persona_encounter_cross_owner_public_exhibits
  for select
  using (
    auth.uid() = requester_owner_user_id
    or auth.uid() = counterparty_owner_user_id
  );

drop policy if exists "pe_co_public_exhibits_insert_participants"
  on public.persona_encounter_cross_owner_public_exhibits;
drop policy if exists "pe_co_public_exhibits_update_participants"
  on public.persona_encounter_cross_owner_public_exhibits;
drop policy if exists "pe_co_public_exhibits_delete_participants"
  on public.persona_encounter_cross_owner_public_exhibits;
-- No direct participant insert/update/delete policy is created. Cross-owner
-- public exhibit rows are server-mediated so exact metadata approval,
-- participant identity, active consent, report/takedown, and revocation remain
-- coupled.

alter table public.moderation_reports
  drop constraint if exists moderation_reports_target_type_check;

alter table public.moderation_reports
  add constraint moderation_reports_target_type_check
  check (target_type in (
    'user',
    'space',
    'document',
    'thread',
    'comment',
    'persona',
    'persona_encounter_public_exhibit',
    'persona_encounter_cross_owner_public_exhibit'
  ));

comment on table public.persona_encounter_cross_owner_public_exhibits is
  'Metadata-only public exhibits for bilaterally approved cross-owner encounter consent. Stores public title, summary/context note, tags, display snapshots, status, timestamps, report count, and provenance only. No generated words, preview output, transcripts, excerpts, summaries, prompts, provider payloads, token facts, retrieval bodies, private setup, private notes, raw owner ids in public output, raw persona ids in public output, SQL details, env values, cookies, bearer values, or secret-shaped strings are public.';

comment on column public.persona_encounter_cross_owner_public_exhibits.consent_id is
  'Internal consent reference. Public routes must not expose raw consent id, owner ids, persona ids, private setup, generated reply, provider payload, token facts, SQL details, or secret-shaped strings.';

comment on column public.persona_encounter_cross_owner_public_exhibits.public_summary is
  'Owner-authored public context note. Not a transcript, excerpt, generated reply, generated summary, private setup, private curation, provider payload, source retrieval body, or PR516 disposable preview output.';
