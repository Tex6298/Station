-- ============================================================
-- PR513C cross-owner runtime attempt append-only trigger repair
-- ============================================================

-- Migration 078 originally used trigger names long enough to collide after
-- PostgreSQL's 63-byte identifier truncation. Drop both source names and the
-- hosted truncated name, then recreate distinct short triggers for each event.

drop trigger if exists trg_persona_encounter_cross_owner_runtime_attempts_append_only_update
  on public.persona_encounter_cross_owner_runtime_attempts;
drop trigger if exists trg_persona_encounter_cross_owner_runtime_attempts_append_only_delete
  on public.persona_encounter_cross_owner_runtime_attempts;
drop trigger if exists trg_persona_encounter_cross_owner_runtime_attempts_append_only_
  on public.persona_encounter_cross_owner_runtime_attempts;

drop trigger if exists pe_co_rt_attempts_no_update
  on public.persona_encounter_cross_owner_runtime_attempts;
create trigger pe_co_rt_attempts_no_update
  before update on public.persona_encounter_cross_owner_runtime_attempts
  for each row execute function public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation();

drop trigger if exists pe_co_rt_attempts_no_delete
  on public.persona_encounter_cross_owner_runtime_attempts;
create trigger pe_co_rt_attempts_no_delete
  before delete on public.persona_encounter_cross_owner_runtime_attempts
  for each row execute function public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation();

comment on trigger pe_co_rt_attempts_no_update
  on public.persona_encounter_cross_owner_runtime_attempts is
  'Short non-colliding PR513C trigger name. Blocks updates so cross-owner runtime attempt audit rows remain append-only.';

comment on trigger pe_co_rt_attempts_no_delete
  on public.persona_encounter_cross_owner_runtime_attempts is
  'Short non-colliding PR513C trigger name. Blocks deletes so cross-owner runtime attempt audit rows remain append-only.';
