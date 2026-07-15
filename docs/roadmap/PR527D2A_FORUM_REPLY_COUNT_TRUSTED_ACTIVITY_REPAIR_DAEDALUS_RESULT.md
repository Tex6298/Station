# PR527D2A - Forum Reply Count Trusted Activity Repair DAEDALUS Result

Owner: DAEDALUS / A2

Date: 2026-07-15

Result:

```text
READY_PR527D2A_TRUSTED_ACTIVITY_AND_FUNCTION_OWNER_GUARD_FOR_ARGUS
```

## Scope

Changed files:

- `infra/supabase/migrations/083_forum_visible_reply_count_integrity.sql`
- `apps/api/src/routes/community.test.ts`

Docs updated:

- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

No migration was applied. No hosted database, API, Railway, Supabase, product
data, fixture, RPC, function, trigger, constraint, counter, or migration ledger
was mutated.

## Trusted Activity Rule

Migration `083` no longer propagates caller-writable `comments.created_at` into
`threads.last_activity_at`.

The trigger now sets a local `trusted_activity_at` only when all of these are
true:

- the row transition is an actual `INSERT`;
- the inserted row is a visible thread reply under the canonical predicate;
  and
- the timestamp source is database-derived `statement_timestamp()`.

Visibility, status, hidden-state, and parent update transitions pass no
activity timestamp. They can still reconcile reply counts, but they cannot
replay synthetic activity or pin another owner's thread by toggling state.

## Function Owner Rule

The migration now fails closed before creating security-definer functions unless
`public.comments` and `public.threads` share the same table owner and
`current_user` is that owner. That makes the security-definer function owner
context explicit instead of assumed.

No alternate `ALTER FUNCTION ... OWNER TO ...` path was added. The accepted
local path is owner-context enforcement.

## Static Assertions

`apps/api/src/routes/community.test.ts` extends the focused migration-source
test to assert:

- table-owner variables, common-owner check, and `current_user` owner check;
- trusted database statement time for visible `INSERT` only;
- no `new.created_at` activity propagation;
- every security-definer function has a fixed `public, pg_temp` search path;
- non-security-definer helpers used by the migration also have fixed search
  paths;
- helper execution is revoked from `PUBLIC`, `anon`, and `authenticated`;
- the full all-thread reconciliation predicate and update shape;
- the service-role-only compatibility shim; and
- the rollback grant floor remains service-role-only.

Rollback grant floor: service-role-only execute on
`public.increment_thread_comment_count(uuid)`.

## Validation

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `51/51` |
| `npx --yes pnpm@10.32.1 test:document-discussions` | Pass, `4/4` |
| `npx --yes pnpm@10.32.1 test:reports` | Pass, `9/9` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass |

No disposable local PostgreSQL proof was run by DAEDALUS for this correction.
ARGUS still owns executable PostgreSQL review with adversarial future-timestamp
and update-replay cases.

## Boundary

The canonical active/non-hidden reply-count predicate, delta semantics,
reconciliation, hot-score math, direct-counter protection, nonnegative
invariant, shim signature, API compatibility call, notification behavior, and
rollback grant floor remain unchanged.

Static and mocked route tests do not prove the PostgreSQL trigger has executed
against hosted data. Hosted mutation count: `0`.

Secret/credential/connection print count: `0`.

Scope check: no route behavior, UI, Discover, document, export, RLS, seed,
generated type, package, lockfile, hosted schema/data, or PR527E file changed.
