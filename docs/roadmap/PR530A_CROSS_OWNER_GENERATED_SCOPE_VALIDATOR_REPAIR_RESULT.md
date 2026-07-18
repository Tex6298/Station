# PR530A - Cross-Owner Generated Scope Validator Repair Result

Owner: DAEDALUS / A2

Date: 2026-07-18

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Result

PR530A adds the single forward migration authorized by the accepted preflight.
Migration 087 replaces only
`public.persona_encounter_cross_owner_consent_scopes_valid(text[])`, raising
the cardinality ceiling from seven to eight and admitting the already-current
`publish_exact_generated_revision` scope.

The repaired validator remains an immutable SQL boolean function. It requires
a non-null array containing one through eight elements, rejects null elements
and unknown labels, and permits exactly the eight labels shared by the API
constant and `PersonaEncounterCrossOwnerConsentRequestedScope`. Duplicate
allowed labels retain the historical database behavior; no uniqueness rule was
introduced.

## Changed Files

- `infra/supabase/migrations/087_persona_encounter_cross_owner_scope_validator.sql`
  adds the bounded forward repair.
- `apps/api/src/routes/persona-encounters.test.ts` adds the focused migration,
  source-contract, fail-closed input, duplicate, and no-placement proof.
- `docs/roadmap/PR530A_CROSS_OWNER_GENERATED_SCOPE_VALIDATOR_REPAIR_RESULT.md`
  records this result.

Historical migrations 077, 081, and 082 are unchanged. No API route, type,
authorization, RLS, consent lifecycle, approval, moderation, public payload, or
UI behavior changed.

## Migration Contract

Migration 087:

1. opens an explicit transaction and takes
   `station.pr530.cross_owner_generated_scope_validator.087` through
   `pg_advisory_xact_lock(hashtextextended(...))`;
2. fails before replacement unless the existing validator, both ledger tables,
   and both named validated CHECK constraints exist;
3. proves through `pg_depend` that each named CHECK depends on the validator;
4. uses one `create or replace function` statement and does not alter a table,
   recreate a constraint, or change a policy;
5. post-asserts SQL language, immutable volatility, boolean return type,
   validated CHECK dependencies, and validity of every existing consent and
   audit row;
6. notifies PostgREST to reload its schema and commits.

The transaction rolls back the replacement if any postcondition or existing-row
validation fails.

## Focused Proof

The new test parses the exact migration 087 validator body, the API
`CROSS_OWNER_CONSENT_REQUESTED_SCOPES` constant, and the database type union,
then requires all three ordered label sets to equal the same eight-item
contract. Its executable contract model proves rejection of null, empty,
null-element, unknown, ninth-element, and mixed-invalid inputs. It proves
acceptance of `publish_exact_generated_revision` alone, the exact PR524B pair
with `save_private_cross_owner_artifact`, and duplicate allowed labels without
admitting unknown labels or bypassing the cardinality ceiling.

The full persona-encounter suite also keeps legacy invitation/lifecycle,
generated artifact/revision/approval/publication, moderation,
retract/delete, and public-detail behavior green. Static no-drift assertions
reject table/constraint recreation and generated list, search, feed, forum,
Discover, or persona-chat placement in migration 087.

## Validation

The repository has no PGlite, testcontainers, or equivalent disposable
PostgreSQL dependency that can faithfully execute this migration chain. No
local database execution is claimed. The focused test is honest static source
proof plus an executable model of the asserted SQL predicate; migration 087's
catalog and existing-row assertions execute when the migration is eventually
applied.

| Command | Result |
| --- | --- |
| `npx.cmd --yes pnpm@10.32.1 run test:persona-encounters` | Pass, `88/88` tests. |
| `npx.cmd --yes pnpm@10.32.1 run test:reports` | Pass, `9/9` tests. |
| `npx.cmd --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass. |
| `npx.cmd --yes pnpm@10.32.1 --filter @station/db build` | Pass. |

## Hosted Boundary

PR530A made no hosted Supabase, PostgREST, application, or product-data
mutation. Migration 087 has not been deployed. ARGUS's separate finding that
hosted lacks migrations 081 and 082 remains unresolved and outside this
source-only step.

## Verdict

```text
READY_FOR_HOSTILE_REVIEW
```

ARGUS should review migration 087's catalog assumptions, exact scope parity,
focused proof, historical migration no-drift, and hosted no-mutation boundary
before MIMIR chooses the next serialized step.
