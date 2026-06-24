-- Signed-in public persona chat alpha.
-- Existing public personas remain read-only until the owner explicitly enables
-- public chat. Public chat implementation must still validate public
-- visibility, safe public slug, owner eligibility, rate limits, and provider
-- request boundaries server-side.

alter table public.personas
  add column if not exists public_chat_enabled boolean not null default false;

comment on column public.personas.public_chat_enabled is
  'Owner opt-in for signed-in public persona chat alpha. Existing public personas default disabled.';
