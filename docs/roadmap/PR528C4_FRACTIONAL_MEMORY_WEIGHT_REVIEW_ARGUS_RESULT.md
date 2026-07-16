# PR528C4 - Fractional Memory Weight Review ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Accepted for serialized migration and deployment proof

```text
ACCEPT_PR528B5_FRACTIONAL_MEMORY_WEIGHT_CONTRACT_FOR_DEPLOYMENT
```

## Findings

No blocking product-source or migration finding.

DAEDALUS commit `ecc42b84e62f` removes the exact PR528C3 blocker without
changing retrieval policy or touching the retained corpus. Migration `086`
converts the persistent relevance-weight contract to `numeric`, the shared
Archive write service stops rounding valid fractions, and deployment readiness
now fails closed on the old integer column or either old integer RPC output.

ARGUS added test-only review assertions for the cases the submitted proof did
not directly exercise: owner-create upper/lower bounds, absent trusted input,
negative trusted input, positive infinity, exact pre-086 RPC equivalence,
catalog output indexing, service-role ACL, and catalog-only data access. The
expanded focused matrix passes and found no product defect.

This verdict accepts source for deployment sequencing. It does not claim that
migration `085` or `086` has been applied, that the accepted source is hosted,
or that any retained Memory row has been corrected.

## Migration Audit

`086_fractional_memory_relevance_weight.sql` is a forward, transactional, and
repeat-safe migration:

| Requirement | Review result |
| --- | --- |
| Serialization | Uses a migration-specific transaction advisory lock. |
| Preconditions | Requires `public.memory_items`, the relevance column, and the active six- and seven-argument retrieval RPCs before mutation. |
| Repeat safety | Accepts only the pre-migration `integer` or its own post-migration `numeric` column shape; rerun drops and recreates the exact current RPC signatures. |
| Existing values | Uses `relevance_weight::numeric`, preserving every integer exactly. |
| Default and nullability | Explicitly restores default `1` and `NOT NULL`. |
| Internal compatibility | Adds no owner-route maximum or other global numeric range constraint; zero and trusted values above `5` remain representable. |
| Scope | Adds no backfill update, unrelated column, index, RLS policy, trigger, queue, storage, provider, or corpus change. |

The migration changes only the column type, its explanatory comment, the two
dependent RPC return types, and the bounded readiness function.

## Retrieval RPC Equivalence

ARGUS mechanically extracted both active RPC definitions from migration `029`
and both replacements from migration `086`. After normalizing only these
allowed textual differences:

```text
create or replace function -> create function
relevance_weight integer -> relevance_weight numeric
```

both full function-and-grant contracts compare equal.

Therefore migration `086` preserves:

- function names, argument order, argument types, and defaults;
- `vector(1536)` and the active provider/model/index parameters;
- Memory embedding, lifecycle-status, supersession, expiry, and
  non-Archive filters;
- private Archive owner, persona, Archive-source, embedding, provider, model,
  dimension, and index filters;
- similarity calculation, vector-distance ordering, and caller-provided limit;
- SQL `STABLE` / default security-invoker behavior; and
- the existing authenticated execute grants.

Only each `relevance_weight` output changes from `integer` to `numeric`.

## Catalog And Readiness Proof

`memory_relevance_weight_contract()` reads only PostgreSQL catalog metadata. It
does not select a Memory row, weight value, owner, persona, embedding, body, or
other product data.

The proof:

- resolves the exact current RPC signatures with `to_regprocedure`;
- uses `generate_subscripts(proallargtypes, 1)` so catalog array lower bounds
  are respected;
- selects only table-output arguments whose mode is `t` and whose name is
  exactly `relevance_weight`;
- formats the column and both output OIDs through `pg_catalog.format_type`;
- reports ready only when all three shapes are exactly `numeric`;
- returns non-ready data for an integer shape, and is treated as failed when a
  row, output, or RPC is absent;
- revokes execution from `public`, `anon`, and `authenticated`; and
- grants execution only to `service_role` (in addition to the function owner).

The public deployment-health path uses the service-role client and discards the
catalog row after converting it to the existing non-secret proof status. Before
migration `086`, the missing RPC fails the proof. After migration, any remaining
integer column or RPC output also fails. Deployment readiness cannot claim this
contract from a mixed or stale schema.

## Write Contract

`memoryRelevanceWeight()` now behaves as required:

| Trusted input | Stored value |
| --- | ---: |
| `1.25` | `1.25` |
| `1.5` | `1.5` |
| `1.4` | `1.4` |
| `0` | `0` |
| `6.25` | `6.25` |
| Absent | `1` |
| Negative | `1` |
| `NaN` or infinity | `1` |

Owner Memory create and update continue to use the unchanged Zod range
`0.1..5`. ARGUS independently proved both endpoints reject `0.09` and `5.01`
and preserve valid fractional input without rounding.

No integer coercion remains in the trusted Archive write path. Existing
integer callers and fixtures remain valid because integer values are a subset
of the new numeric contract.

## Fractional Round Trips

The focused tests independently cover:

| Path | Proven value |
| --- | ---: |
| Owner manual Memory create | `1.25` |
| Owner Memory update | `1.5` |
| Owner/lifecycle readback | `1.5` |
| File-backed ChatGPT and Claude Archive processing | `1.5` |
| Archived chat chunk | `1.4` |
| Archived-chat candidate acceptance | `1.5` |
| File-import candidate acceptance | `1.5` |
| Memory retrieval mapping | `1.25` |
| Private Archive retrieval mapping | `1.5` |
| Persona export manifest | `1.25` |

Lifecycle status/trust, source links, provenance, embeddings, storage
reservation/release, owner scoping, and safe error behavior remain covered by
the same tests.

## Scope Audit

All 11 files in `ecc42b84e62f` are necessary to the forward migration, trusted
write helper, readiness/type contract, focused round-trip coverage, or result
receipt. No UI source changed because the current slider and two-decimal copy
already state the intended fractional contract.

The diff changes no relevance scoring formula, sorting precedence, query
eligibility, vector calculation, embedding provider/model/index behavior,
Memory lifecycle policy, visibility rule, owner boundary, storage accounting,
export shape beyond fractional test data, chat/provider route, billing, queue,
Cloudflare, public content, or retained corpus state.

No historical migration was edited. Database generated types remain `number`
for relevance values; the only new generated shape is the service-role catalog
proof RPC.

## Validation

| Command / proof | Result |
| --- | --- |
| Full focused Memory, Archive/import, conversation, retrieval, lifecycle UI, export, and readiness matrix after ARGUS assertions | Pass, `99/99` |
| Relevant package build: types, config, DB, auth, AI, and API | Pass |
| `npx --yes pnpm@10.32.1 typecheck` | Pass |
| `npx --yes pnpm@10.32.1 lint` | Pass, zero warnings/errors |
| Mechanical migration `029` versus `086` RPC equivalence check | Pass for both functions |
| `git diff --check ecc42b84^ ecc42b84` | Pass |

The npm launcher repeated only its existing warnings about pnpm-specific npm
configuration keys. Product lint remained warning-free.

No hosted database, migration, deployment, retained Memory row, encrypted
ledger, account, storage object, provider, billing row, queue, or public corpus
was read or mutated during this source-only review.

## Deployment Boundary

The accepted repair may proceed only through the separately authorized PR528B6
sequence:

1. Apply migrations in ledger order, including `085` and then `086`, to the
   intended hosted target.
2. Verify migration ledger/hash and catalog state: document summary, numeric
   Memory column, default `1`, `NOT NULL`, both numeric RPC outputs, exact RPC
   ACLs, and the service-role-only catalog proof.
3. Deploy the exact accepted source SHA.
4. Require `/health/deployment` to report ready with both document-summary and
   fractional-weight object proofs.
5. Only then decrypt the cleanup ledger in-process and correct exactly the two
   curated rows from `1` to `1.25` and the one Archive row from `2` to `1.5`.
6. Require exactly three scoped updates, unchanged content/embeddings/lifecycle/
   storage state, and repeated anonymous/cross-owner/Discover/forbidden-scope
   privacy proof before corpus acceptance.

This review does not authorize migration, deployment, retained-row correction,
public corpus creation, chat, or provider configuration by itself.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS reviewed the fractional Memory relevance-weight source and migration repair.
Verdict:
- ACCEPT_PR528B5_FRACTIONAL_MEMORY_WEIGHT_CONTRACT_FOR_DEPLOYMENT
Task:
- If accepted, wake PR528B6 for serialized migrations, deployment, and exact retained-row correction.
```
