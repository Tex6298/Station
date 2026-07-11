# PR513C - Cross-Owner Runtime Attempt Append-Only Trigger Repair Result

Owner: DAEDALUS / A2

Date: 2026-07-11

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the narrow PR513C repair for the hosted PR513B blocker:

- patched migration `078` so fresh installs use short, distinct append-only
  trigger names;
- added migration `079` to repair hosted/follow-on databases by dropping the
  old long source names, the PostgreSQL-truncated collision name, and then
  recreating two short triggers;
- used these trigger names:
  - `pe_co_rt_attempts_no_update`;
  - `pe_co_rt_attempts_no_delete`;
- preserved the existing trigger function
  `prevent_persona_encounter_cross_owner_runtime_attempt_mutation`;
- added focused tests proving both trigger names are distinct and below
  PostgreSQL's 63-byte identifier limit.

No provider-backed preview, provider call, prompt assembly, generated words,
token rows, private sessions, public exhibits, reports, memory/canon/archive/
continuity/export/jobs/storage/public rows, UI, package, provider/retrieval,
Redis, Cloudflare, Stripe, billing, worker, deployment, or public surfacing
changed.

## Files Changed

- `infra/supabase/migrations/078_persona_encounter_cross_owner_runtime_attempts.sql`
- `infra/supabase/migrations/079_persona_encounter_runtime_attempt_trigger_repair.sql`
- `apps/api/src/routes/persona-encounters.test.ts`
- `docs/roadmap/PR513C_CROSS_OWNER_RUNTIME_ATTEMPT_APPEND_ONLY_TRIGGER_REPAIR_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Migration Repair

Migration `079` drops:

```text
trg_persona_encounter_cross_owner_runtime_attempts_append_only_update
trg_persona_encounter_cross_owner_runtime_attempts_append_only_delete
trg_persona_encounter_cross_owner_runtime_attempts_append_only_
pe_co_rt_attempts_no_update
pe_co_rt_attempts_no_delete
```

It then recreates:

```text
pe_co_rt_attempts_no_update before update
pe_co_rt_attempts_no_delete before delete
```

Both triggers execute:

```text
public.prevent_persona_encounter_cross_owner_runtime_attempt_mutation()
```

The repair preserves the PR513A append-only semantics; it only fixes trigger
identifier collision.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 49 tests passed, including fresh `078` short trigger shape and `079` repair migration shape. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit report/takedown behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; PR513C adds no visible UI. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Changed-path scan | Pass | Changes are limited to migrations `078`/`079`, persona encounter tests, and roadmap/testing docs. |
| Forbidden-path scan | Pass | No web UI, package/lockfile, provider service, token service, operational cache, `packages/ai`, `packages/auth`, Railway, Cloudflare, or deploy-script paths changed. |
| Secret-shaped diff scan | Pass | No API-key, private-key, GitHub token, bearer-token-shaped, provider-key env, Railway token, or private-key block values found in the diff. |
| `git diff --check` | Pass | No unstaged whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Review Handoff

ARGUS should review:

- whether migration `079` drops the hosted truncated/collided trigger name;
- whether both short triggers are distinct and under 63 bytes;
- whether both update and delete events still call the append-only trigger
  function;
- whether the patch preserves PR513A non-scope boundaries.

If accepted, MIMIR should apply hosted migration `079`, verify both triggers
exist and fire, then route ARIADNE for a PR513D hosted rerun.
