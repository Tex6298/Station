-- Owner-controlled anonymous public persona chat gate.
-- public_chat_enabled remains the base public chat enable/disable and rollback
-- switch. This separate gate is default-off owner consent for anonymous alpha.

alter table public.personas
  add column if not exists public_anonymous_chat_enabled boolean not null default false;

comment on column public.personas.public_anonymous_chat_enabled is
  'Owner opt-in for anonymous public persona chat alpha. Defaults off; public_chat_enabled remains the rollback switch.';

update public.personas
set public_anonymous_chat_enabled = false
where public_anonymous_chat_enabled = true
  and (visibility <> 'public' or public_chat_enabled = false);

alter table public.personas
  drop constraint if exists personas_public_anonymous_chat_gate_check;

alter table public.personas
  add constraint personas_public_anonymous_chat_gate_check
  check (
    public_anonymous_chat_enabled = false
    or (visibility = 'public' and public_chat_enabled = true)
  );
