# PR527D2A - Forum Reply Count Trusted Activity Repair ARGUS Result

Owner: ARGUS / A3

Requested by: MIMIR / A1 through DAEDALUS / A2

Implementation reviewed: `934eba6cbef71d8d7c2f6d35e8e4bc299df82f82`

Date completed: 2026-07-15

Verdict:

```text
ACCEPT_PR527D2A_TRUSTED_ACTIVITY_AND_FUNCTION_OWNER_GUARD_WITH_ARGUS_TEST_PATCH
```

## Verdict

ARGUS accepts the bounded PR527D2A correction with one test-only review patch.
Migration `083` now derives parent activity from trusted database statement
time only for an actual visible reply insert. Visibility, status, hidden-state,
and parent updates still maintain the canonical count but pass no activity
timestamp, so state toggles and parent moves cannot replay synthetic activity.

The migration also fails closed unless `public.comments` and
`public.threads` share one owner and the migration runs as that owner. This
makes the security-definer execution context an enforced precondition rather
than a deployment assumption.

The prior PR527D2 blocker is resolved locally. This verdict does not authorize
hosted migration application, counter repair, or a ledger write. MIMIR still
owns the audited hosted-operation decision.

## Executable Review

ARGUS executed the exact checked-in migration bytes against a disposable
`@electric-sql/pglite@0.3.14` PostgreSQL environment. The package lived under
the system temp directory; the single workspace probe and the package tree
were removed immediately after execution. No harness, dependency, lockfile,
database, capture, or output artifact remains in the repository.

All `30/30` focused checks passed:

- a non-owner migration role fails before object creation;
- the valid table-owner context applies the migration successfully;
- both security-definer count functions have the table owner;
- all-thread canonical reconciliation repairs a stored undercount;
- an authenticated-style direct insert with an unbounded future row timestamp
  increments once but leaves parent activity finite and bounded by trusted
  statement time;
- hide, unhide, repeated unhide, remove, restore, and parent movement preserve
  exact count deltas without advancing parent activity;
- a second future-timestamp insert advances activity only to trusted database
  time, and repeated update transitions leave it unchanged;
- direct counter mutation and anonymous compatibility-RPC execution are
  denied atomically;
- the service-role compatibility shim executes without writing;
- a missing parent aborts and rolls back the comment row; and
- the nonnegative constraint is validated with the intended shim grants.

No hosted database, API, RPC, row, function, trigger, constraint, migration,
counter, or ledger was mutated during review.

## ARGUS Test Patch

DAEDALUS added the required source assertions, but several used unbounded
cross-function regular expressions. For example, an assertion beginning at
the delta helper could still find `security definer` or `search_path` in a
later function if the intended helper lost that clause.

ARGUS added a small source-function extractor and now checks each current
function body independently:

- `forum_comment_counts_as_visible_reply`;
- `apply_thread_visible_reply_count_delta`;
- `sync_thread_visible_reply_count_from_comments`;
- `prevent_direct_thread_comment_count_write`; and
- `increment_thread_comment_count`.

The helper revocation assertions now stop at their own statements rather than
matching through a later revoke. The test also locks exactly one
`statement_timestamp()` source and rejects `new.created_at` inside the sync
function. No migration, route, mock behavior, product code, or runtime API
contract changed in the ARGUS patch.

## Migration Review

The accepted migration retains the PR527D2 contract:

```text
comment_count = COUNT(comments)
WHERE parent_type = 'thread'
  AND parent_id = threads.id
  AND status = 'active'
  AND is_hidden = false
```

The implementation remains transactional under an advisory lock and covers
insert, delete, relevant update, cross-parent movement, direct DML, hard
cleanup, and failed-write rollback. It updates count and count-derived
`hot_score` together, reconciles every thread, validates a nonnegative check,
blocks direct counter writes outside the owner context, and replaces the blind
increment with a service-role-only no-write shim.

The API compatibility call remains correctly ordered for migration-before-code
and code-before-migration deployment windows. Notifications remain
non-authoritative and follow successful route creation. The rollback packet
keeps the safe service-role-only RPC grant floor and does not deliberately
restore stale counters.

## Privacy And Authorization

The trusted-time correction closes the new cross-row amplification found by
ARGUS: caller-writable comment time can no longer pin another owner's thread
activity. The security-definer helper still bypasses thread RLS only for the
required count and hot-score maintenance under canonical comment transitions.

No RLS policy, parent readability rule, route authentication, tier check,
owner/admin visibility, moderation vocabulary, comment body, or public
serializer changed. No hosted/product id, body, identity, credential, token,
cookie, connection value, raw response, or secret-shaped value was printed or
committed.

## Scope

DAEDALUS changed exactly the six committed correction paths allowed by the
PR527D2A packet. ARGUS adds only the focused community test patch, this review
result, roadmap/testing truth updates, and its watcher receipt.

Confirmed unchanged:

- `apps/api/src/routes/comments.ts` and every route behavior;
- document, Discover, export, seed, and generated database types;
- UI, CSS, copy, auth, billing, queues, Cloudflare/Railway configuration,
  provider/partner adapters, packages, and lockfiles;
- comment and thread RLS policies; and
- hosted schema, data, counters, migration ledger, and PR527E.

## Validation

| Command / check | ARGUS result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `51/51` |
| `npx --yes pnpm@10.32.1 test:document-discussions` | Pass, `4/4` |
| `npx --yes pnpm@10.32.1 test:reports` | Pass, `9/9` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| Exact-migration disposable PostgreSQL review | Pass, `30/30` |
| Future timestamp bounded / update replay stable | Pass / pass |
| Wrong-owner fail-closed gate | Pass |
| Changed-file and frozen-scope review | Pass |
| Hosted writes / migrations / RPC invocations | `0 / 0 / 0` |
| `git diff --check` | Pass |

## Claim Boundary

This is local implementation acceptance only. Static source assertions and the
disposable PostgreSQL execution do not prove the configured hosted pre-state,
application transaction, durable post-state, PostgREST reload, migration
ledger, corrected live count, cross-surface readback, rollback readiness, or
zero-residue hosted fixture cleanup.

Those claims remain gated on a separately authorized, exact-SHA, audited
hosted operation and post-state proof.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR527D2A with a narrow test-only patch after the exact migration passed 30/30 executable PostgreSQL checks.
- Future caller timestamps are bounded to trusted insert statement time, update transitions cannot replay activity, and wrong-owner migration execution fails closed.
- Canonical count, reconciliation, guard, shim, rollback floor, privacy, and frozen scope remain intact; hosted mutation count is zero.
Verdict:
- ACCEPT_PR527D2A_TRUSTED_ACTIVITY_AND_FUNCTION_OWNER_GUARD_WITH_ARGUS_TEST_PATCH
Task:
- Close the local correction and decide the separately audited hosted migration/proof gate. Do not infer hosted application or counter repair from this local acceptance.
```
