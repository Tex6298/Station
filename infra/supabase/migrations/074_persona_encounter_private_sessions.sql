-- ============================================================
-- PR506A owner-only private encounter session artifacts
-- ============================================================

create table if not exists public.persona_encounter_private_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  initiator_persona_id uuid not null references public.personas(id) on delete cascade,
  responder_persona_id uuid not null references public.personas(id) on delete cascade,
  owner_setup text not null,
  responder_reply text not null,
  initiator_name_snapshot text not null,
  responder_name_snapshot text not null,
  provenance_schema text not null default 'station.persona_encounter.private_session.v1',
  source_retrieval_used boolean not null default false,
  shareable boolean not null default false,
  public_visibility text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint persona_encounter_private_sessions_distinct_personas_check
    check (initiator_persona_id <> responder_persona_id),
  constraint persona_encounter_private_sessions_provenance_schema_check
    check (provenance_schema = 'station.persona_encounter.private_session.v1'),
  constraint persona_encounter_private_sessions_no_source_retrieval_check
    check (source_retrieval_used = false),
  constraint persona_encounter_private_sessions_not_shareable_check
    check (shareable = false),
  constraint persona_encounter_private_sessions_private_visibility_check
    check (public_visibility = 'private'),
  constraint persona_encounter_private_sessions_setup_length_check
    check (char_length(btrim(owner_setup)) between 1 and 1600),
  constraint persona_encounter_private_sessions_reply_length_check
    check (char_length(btrim(responder_reply)) between 1 and 2400)
);

create index if not exists idx_persona_encounter_private_sessions_owner_created
  on public.persona_encounter_private_sessions (owner_user_id, created_at desc);

create index if not exists idx_persona_encounter_private_sessions_owner_initiator_created
  on public.persona_encounter_private_sessions (owner_user_id, initiator_persona_id, created_at desc);

create index if not exists idx_persona_encounter_private_sessions_owner_responder_created
  on public.persona_encounter_private_sessions (owner_user_id, responder_persona_id, created_at desc);

drop trigger if exists trg_persona_encounter_private_sessions_updated_at
  on public.persona_encounter_private_sessions;
create trigger trg_persona_encounter_private_sessions_updated_at
  before update on public.persona_encounter_private_sessions
  for each row execute function public.handle_updated_at();

alter table public.persona_encounter_private_sessions enable row level security;

drop policy if exists "persona_encounter_private_sessions_select_owner"
  on public.persona_encounter_private_sessions;
create policy "persona_encounter_private_sessions_select_owner"
  on public.persona_encounter_private_sessions
  for select
  using (auth.uid() = owner_user_id);

drop policy if exists "persona_encounter_private_sessions_insert_owner"
  on public.persona_encounter_private_sessions;
create policy "persona_encounter_private_sessions_insert_owner"
  on public.persona_encounter_private_sessions
  for insert
  with check (
    auth.uid() = owner_user_id
    and exists (
      select 1
      from public.personas p
      where p.id = initiator_persona_id
        and p.owner_user_id = auth.uid()
    )
    and exists (
      select 1
      from public.personas p
      where p.id = responder_persona_id
        and p.owner_user_id = auth.uid()
    )
  );

drop policy if exists "persona_encounter_private_sessions_update_owner"
  on public.persona_encounter_private_sessions;
create policy "persona_encounter_private_sessions_update_owner"
  on public.persona_encounter_private_sessions
  for update
  using (auth.uid() = owner_user_id)
  with check (
    auth.uid() = owner_user_id
    and exists (
      select 1
      from public.personas p
      where p.id = initiator_persona_id
        and p.owner_user_id = auth.uid()
    )
    and exists (
      select 1
      from public.personas p
      where p.id = responder_persona_id
        and p.owner_user_id = auth.uid()
    )
  );

drop policy if exists "persona_encounter_private_sessions_delete_owner"
  on public.persona_encounter_private_sessions;
create policy "persona_encounter_private_sessions_delete_owner"
  on public.persona_encounter_private_sessions
  for delete
  using (auth.uid() = owner_user_id);

comment on table public.persona_encounter_private_sessions is
  'Owner-only private persona encounter artifacts. These are not conversations, transcripts, public pages, source-retrieval outputs, or shareable/social artifacts.';

comment on column public.persona_encounter_private_sessions.owner_setup is
  'Bounded owner-authored setup text for the private encounter artifact.';

comment on column public.persona_encounter_private_sessions.responder_reply is
  'Bounded model-generated responder reply stored only after server-owned saved generation returns nonblank content.';
