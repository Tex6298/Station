# PR532A Append-Only Parent-Cascade Cleanup Repair

Date: 2026-07-18

Owner: MIMIR / A1 takeover

Review target: ARGUS / A3

Status:

```text
READY_PR532A_APPEND_ONLY_PARENT_CASCADE_CLEANUP_REPAIR_FOR_ARGUS
```

## Why This Lane Exists

PR532's read-only operator preflight found four append-only child DELETE
triggers that also block legitimate foreign-key parent cascades. The full
PR524B proof would create three of those child row types and then fail its
required persona cleanup. Runtime-attempt audit rows have the same adjacent
defect, so the bounded repair covers the complete four-table cleanup contract
rather than leaving persona deletion dependent on which audit path ran.

Source result:

`docs/roadmap/PR532_DISPOSABLE_FULL_PR524B_HOSTED_PROOF_PREFLIGHT_MIMIR_RESULT.md`

## Repair

Migration 088 replaces only these existing trigger functions:

1. consent audit mutation guard;
2. runtime-attempt mutation guard;
3. generated revision approval mutation guard;
4. generated publication audit mutation guard.

For UPDATE, and for direct DELETE while every cascade parent still exists, the
functions continue to raise the existing append-only exception. For DELETE
after any relevant `ON DELETE CASCADE` parent is absent, the function returns
`OLD` and permits PostgreSQL to complete that cascade.

The functions run as tightly scoped `security definer` trigger guards with a
fixed `pg_catalog, public` search path and `row_security = off`. This is needed
so an invoking role cannot make an existing parent invisible through RLS and
misclassify a direct child delete as a parent cascade. The functions return no
data and expose no callable product operation.

Migration preflight binds all ten relevant child-to-parent cascade edges.
Postassert requires all four RLS-independent functions plus all four enabled
DELETE and all four enabled UPDATE trigger bindings. It does not alter tables,
foreign keys, RLS, policies, product routes, or existing rows.

## Source

- `infra/supabase/migrations/088_persona_encounter_append_only_parent_cascade_cleanup.sql`
- `apps/api/src/routes/persona-encounters.test.ts`

Migration 088 SHA-256:

```text
6E5F320E41F2A14969E7BF3D87A6F70D926FA4ACBE9C849460928E0681F2B751
```

## Validation

| Gate | Result |
| --- | --- |
| `test:persona-encounters` | Pass, 89/89 |
| `test:reports` | Pass, 9/9 |
| `test:personas` | Pass, 18/18 |
| `@station/api typecheck` | Pass |
| `@station/db build` | Pass through all three focused suites |
| final PR532 read-only preflight | Blocked exactly on current 4/4 hosted guards; zero mutation |

## Guardrails

- Do not disable or drop an append-only trigger.
- Do not allow direct child UPDATE or DELETE.
- Do not change RLS, policies, foreign keys, routes, serializers, or UI.
- Do not apply migration 088 to hosted Supabase before ARGUS accepts source.
- Do not start PR532 product mutation or ARIADNE rehearsal before accepted
  hosted apply and a fresh read-only preflight.

## ARGUS Review

ARGUS should hostile-review:

1. all four direct UPDATE/DELETE paths remain fail-closed while parents exist;
2. every allowed branch requires `TG_OP = 'DELETE'` and a genuinely absent
   cascade parent;
3. approval and publication audit guards account for every cascading parent,
   not only one order-dependent FK path;
4. `security definer`, fixed search path, and RLS-off execution prevent an RLS
   visibility bypass;
5. migration preflight/postassert are transactional and bounded;
6. focused tests and the PR532 read-only block receipt match the source claim.

If accepted, wake MIMIR. MIMIR will apply and ledger migration 088 in one
serialized hosted operation, verify exact catalog bindings and zero unintended
row change, rerun the PR532 read-only preflight, and only then wake ARIADNE.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR took over PR532 preflight after A2 did not consume the wakeup.
- The read-only hosted run stopped before mutation on four append-only DELETE
  guards that also block required parent-cascade persona cleanup.
- PR532A migration 088 keeps direct child UPDATE/DELETE blocked and allows only
  DELETE after a real cascading parent is absent.
Validation:
- persona encounters 89/89, reports 9/9, personas 18/18, API typecheck, and DB
  builds pass; final hosted preflight reports 4/4 unsafe guards and zero writes.
Task:
- Hostile-review migration 088 and its focused source contract.
- Wake MIMIR with accept/block. Do not apply hosted schema or start PR532.
```
