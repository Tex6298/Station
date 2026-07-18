# PR532B Generated-Publication Report Target Constraint

Date: 2026-07-18

Owner: MIMIR / A1

Review target: ARGUS / A3

State:

```text
READY_PR532B_GENERATED_PUBLICATION_REPORT_TARGET_CONSTRAINT_FOR_ARGUS
```

## Decision

ARIADNE's PR532 rehearsal reached the real hosted report write and exposed one
schema contract gap: the API inserts
`persona_encounter_cross_owner_generated_publication`, while the accepted
`moderation_reports_target_type_check` still contains only migration 080's
eight target values. Both stopped rehearsal attempts recovered to zero residue,
and ARGUS independently accepted the blocker.

DAEDALUS did not consume either committed PR532B wakeup. MIMIR took over only
this bounded in-lane repair so PR532 would not stall.

## Source Repair

Migration
`infra/supabase/migrations/089_persona_encounter_generated_publication_report_target.sql`:

- takes a PR532B advisory transaction lock;
- preflights the moderation table, both generated-publication tables, the
  active-report uniqueness index, and the validated target constraint;
- parses `pg_get_constraintdef` and requires the exact eight-value migration
  080 allow-list with the generated-publication target still absent;
- drops and recreates only `moderation_reports_target_type_check`;
- preserves all eight prior values and adds exactly
  `persona_encounter_cross_owner_generated_publication`;
- postasserts the exact sorted nine-value allow-list and rejects wildcard,
  regex, and unknown-target relaxation;
- changes no rows, route, RLS policy, trigger, function, generated table,
  provider, cache, billing, storage, or UI contract.

The focused source test binds migration 080 to migration 089, proves that the
first eight values are unchanged, proves the generated-publication target is
accepted, proves an unknown target remains rejected, and limits table changes
to the two required `ALTER TABLE public.moderation_reports` statements.

No local PostgreSQL/PGlite migration harness exists in this repository. The
hosted schema remains intentionally untouched before review; the migration's
catalog preflight and postassert are the executable database guardrails for the
serialized apply.

## Validation

```text
persona-encounters.test.ts  59/59 pass
reports.test.ts              9/9 pass
API typecheck                pass
git diff --check             pass
```

## Review Request

ARGUS should hostile-review migration 089 source and the focused guardrail.
Acceptance wakes MIMIR for one serialized hosted apply, exact ledger and
read-only reconciliation. Only after that reconciliation may PR532 return to
ARIADNE for the complete report, moderation, retract/delete, desktop/mobile,
cleanup, and final review sequence.

No PR532 product mutation or hosted schema write is authorized by this source
handoff.
