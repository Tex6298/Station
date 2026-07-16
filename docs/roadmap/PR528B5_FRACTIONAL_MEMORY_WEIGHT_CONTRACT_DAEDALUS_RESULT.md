# PR528B5 - Fractional Memory Weight Contract DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Ready for MIMIR routing to ARGUS

```text
READY_PR528B5_FRACTIONAL_MEMORY_WEIGHT_CONTRACT_FOR_ARGUS
```

## Result

Station now has a bounded source and forward-migration repair for the Memory
relevance-weight precision blocker found in PR528C3. Valid fractional values
are no longer rounded in the trusted Archive write service, and migration
`086` changes the persistent column plus both active retrieval RPC return
contracts from `integer` to `numeric`.

The owner API contract remains unchanged at `0.1..5`. Trusted internal callers
retain support for finite non-negative values outside that owner range. No
scoring formula, retrieval ordering, lifecycle rule, visibility boundary,
embedding behavior, storage accounting, or Studio control changed.

## Migration Contract

`086_fractional_memory_relevance_weight.sql`:

- requires the current Memory table, relevance column, and active six- and
  seven-argument retrieval RPCs before changing anything;
- converts existing values with the explicit preserving cast
  `relevance_weight::numeric`;
- preserves the column default of `1` and its non-null contract;
- deliberately adds no database maximum of `5`, because that is an owner-route
  boundary rather than the trusted internal persistence boundary;
- recreates `match_memory_items` and `match_private_archive_chunks` with
  numeric relevance-weight outputs while preserving their current arguments,
  provider/index filters, Memory lifecycle filtering, owner/archive filtering,
  vector ordering, limits, invoker security behavior, and authenticated grants;
- adds the service-role-only `memory_relevance_weight_contract()` catalog proof;
- leaves deployment and hosted execution to the separately reviewed follow-up.

Readiness now reports migration proof version `025-086` and fails closed when
the Memory column or either RPC still advertises `integer`.

## Fractional Round Trips

Focused coverage proves these exact values survive without rounding:

| Path | Proven value |
| --- | ---: |
| Owner Memory create | `1.25` |
| Owner Memory update and owner/lifecycle readback | `1.5` |
| File-backed ChatGPT and Claude Archive chunks | `1.5` |
| Archived chat chunk | `1.4` |
| Accepted chat/import candidate Memory | `1.5` |
| Memory retrieval RPC mapping | `1.25` |
| Private Archive retrieval RPC mapping | `1.5` |
| Persona export manifest | `1.25` |
| Trusted internal zero | `0` |
| Trusted internal value above owner maximum | `6.25` |

Owner create/update tests continue to reject `0.09` and `5.01`. Invalid or
absent trusted internal input retains the existing fallback value of `1`.
Existing integer fixtures continue to pass unchanged across the wider suites.

## Exact File Ledger

| File | Necessity |
| --- | --- |
| `infra/supabase/migrations/086_fractional_memory_relevance_weight.sql` | Forward-only numeric column, RPC, and catalog-proof contract |
| `apps/api/src/services/archive.service.ts` | Remove trusted-write integer rounding while rejecting invalid negative/non-finite input |
| `apps/api/src/services/readiness.service.ts` | Require the deployed numeric column and RPC catalog contract |
| `packages/db/src/types.ts` | Add the generated-shape contract for the new readiness RPC; numeric values remain TypeScript `number` |
| `apps/api/src/routes/health.test.ts` | Prove integer readiness rejection and inspect migration boundaries |
| `apps/api/src/routes/continuity.test.ts` | Prove owner create, update, bounds, and lifecycle readback |
| `apps/api/src/routes/storage.test.ts` | Prove Archive/file fractional writes, zero, broad internal values, and invalid fallback |
| `apps/api/src/routes/conversation-archive.test.ts` | Prove archived chat and candidate-acceptance fractional values |
| `packages/ai/test/retrieval-metadata.test.ts` | Prove both retrieval mappings preserve fractions |
| `apps/api/src/routes/exports.test.ts` | Prove fractional owner Memory survives export serialization |
| `docs/roadmap/PR528B5_FRACTIONAL_MEMORY_WEIGHT_CONTRACT_DAEDALUS_RESULT.md` | Public-safe implementation and validation receipt |

No lifecycle UI source change was necessary. Its existing focused test passed
against the numeric readback contract.

## Validation

| Command / proof | Result |
| --- | --- |
| Focused Memory, Archive/import, conversation, retrieval, lifecycle UI, export, and readiness run | Pass, `99/99` |
| Relevant package build (`types`, `config`, `db`, `auth`, `ai`, `api`) | Pass |
| `pnpm typecheck` | Pass |
| `pnpm lint` | Pass, no warnings or errors |
| `pnpm test:health` | Pass, `21/21` |
| `pnpm test:storage` | Pass, `19/19` |
| `pnpm test:continuity` | Pass, `12/12` |
| `pnpm test:conversation-archive` | Pass, `43/43` |
| `pnpm test:retrieval-metadata` | Pass, `13/13` |
| `pnpm test:exports` | Pass, `15/15` |

The migration was not applied to any hosted database in this lane. No hosted
state, retained corpus row, encrypted cleanup artifact, account, storage
object, deployment, provider, billing record, queue, or public content was
read or mutated.

## Follow-Up Boundary

PR528B6 remains blocked. ARGUS must first accept the source and migration
contract. Only after accepted deployment may a separately authorized lane use
the encrypted cleanup ledger to correct exactly the retained corpus rows
specified in PR528C3 and repeat the privacy and write-boundary probes.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed the fractional Memory relevance-weight source and migration repair.
Verdict:
- READY_PR528B5_FRACTIONAL_MEMORY_WEIGHT_CONTRACT_FOR_ARGUS
Task:
- Route ARGUS source/migration review before any hosted correction.
```
