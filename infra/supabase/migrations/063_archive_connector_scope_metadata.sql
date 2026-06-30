-- ============================================================
-- Archive connector OAuth scope metadata
-- ============================================================

alter table public.archive_connector_oauth_states
  add column if not exists scope_profile text not null default 'connect';

alter table public.archive_connector_oauth_states
  drop constraint if exists archive_connector_oauth_states_scope_profile_check;

alter table public.archive_connector_oauth_states
  add constraint archive_connector_oauth_states_scope_profile_check
  check (scope_profile in ('connect', 'source_inventory'));

alter table public.archive_connector_credentials
  add column if not exists scope_profile text not null default 'connect',
  add column if not exists granted_scopes text[] not null default '{}'::text[];

alter table public.archive_connector_credentials
  drop constraint if exists archive_connector_credentials_scope_profile_check;

alter table public.archive_connector_credentials
  add constraint archive_connector_credentials_scope_profile_check
  check (scope_profile in ('connect', 'source_inventory'));

update public.archive_connector_credentials
set granted_scopes = case
  when provider = 'reddit' and cardinality(granted_scopes) = 0 then array['identity']
  when provider = 'discord' and cardinality(granted_scopes) = 0 then array['identify']
  else granted_scopes
end
where purpose = 'archive_connector';

comment on column public.archive_connector_oauth_states.scope_profile is
  'Station-selected archive connector OAuth scope profile. The client cannot override scopes at authorization time.';

comment on column public.archive_connector_credentials.scope_profile is
  'Station-normalized archive connector scope profile. Existing credentials default to connect proof only.';

comment on column public.archive_connector_credentials.granted_scopes is
  'Station-normalized canonical OAuth scopes granted for safe readback. Does not store raw token payload strings.';
