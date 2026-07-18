# PR532A Append-Only Parent-Cascade Cleanup Repair ARGUS Result

Date: 2026-07-18

Owner: ARGUS / A3

Verdict:

```text
ACCEPT_PR532A_APPEND_ONLY_PARENT_CASCADE_CLEANUP_REPAIR_SOURCE_ONLY
```

## Decision

ARGUS accepts migration 088 and its focused source contract. The repair is
narrow: it replaces only four append-only trigger functions so direct child
UPDATE/DELETE still fails closed, while PostgreSQL can complete genuine
`ON DELETE CASCADE` cleanup after the relevant parent row is already absent.

No hosted schema apply, hosted row mutation, PR532 product fixture, provider
call, retrieval, storage, billing, queue, Cloudflare, partner adapter, UI, or
full PR524B proof was run by ARGUS.

## Review

- The four target functions are exactly the consent audit guard, runtime
  attempt guard, generated revision approval guard, and generated publication
  audit guard.
- Every allow branch is gated by `TG_OP = 'DELETE'` and a missing cascade
  parent. UPDATE never reaches an allow branch.
- The generated approval guard checks revision, artifact, consent, and
  approver profile parents. The generated publication audit guard checks
  publication, consent, artifact, and revision parents.
- The preflight asserts the ten relevant child-to-parent `ON DELETE CASCADE`
  edges before replacement.
- The postassert requires all four functions to be `security definer` with
  fixed `search_path = pg_catalog, public` and `row_security = off`, plus all
  four enabled DELETE and UPDATE trigger bindings.
- The migration does not alter tables, foreign keys, RLS, policies, product
  routes, serializers, UI, or existing rows. It ends with `notify pgrst,
  'reload schema'` inside the same transaction.

ARGUS accepts the `security definer`/RLS-off choice here because the functions
are trigger-only, return no product data, and need RLS-independent parent
existence checks so an invoking role cannot make a parent invisible and turn a
direct child delete into a false cascade.

## Validation

- `npx pnpm@10.32.1 test:persona-encounters` passed: 89 tests.
- `npx pnpm@10.32.1 test:reports` passed: 9 tests.
- `npx pnpm@10.32.1 test:personas` passed: 18 tests.
- `npx pnpm@10.32.1 --filter @station/api typecheck` passed.
- `npx pnpm@10.32.1 --filter @station/db build` passed.
- `git diff --check HEAD^..HEAD` passed.
- Migration 088 SHA-256 matched:

```text
6E5F320E41F2A14969E7BF3D87A6F70D926FA4ACBE9C849460928E0681F2B751
```

Added-line sensitive scan was reviewed. Hits were package names
`@station/api` and `@station/db`, not secrets.

## Next

MIMIR may proceed to the serialized hosted migration-088 apply/reconcile lane.
That next lane should apply and ledger migration 088, verify exact catalog
bindings and zero unintended row changes, rerun the PR532 read-only preflight,
and only then route the full PR524B fixture/proof sequence.

```text
WAKEUP A1:
Codename: MIMIR
```
