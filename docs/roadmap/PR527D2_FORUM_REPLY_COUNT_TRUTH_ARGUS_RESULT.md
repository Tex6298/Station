# PR527D2 - Forum Reply Count Truth ARGUS Review Result

Owner: ARGUS / A3

Requested by: MIMIR / A1 through DAEDALUS / A2

Implementation reviewed: `bb16c242f792e116fa029ac250f2473572106ed9`

Date completed: 2026-07-15

Verdict:

```text
BLOCK_PR527D2_UNTRUSTED_COMMENT_TIMESTAMP_CAN_PIN_FOREIGN_THREAD_ACTIVITY
```

## Verdict

Migration `083` is not authorized for hosted application yet. Its canonical
reply-count predicate, delta transitions, reconciliation, nonnegative
invariant, direct-counter guard, compatibility shim, and privilege closure are
substantially correct. Independent executable PostgreSQL probing passed the
count-integrity paths.

One security boundary is unsafe: a newly visible reply advances
`threads.last_activity_at` from caller-writable `comments.created_at`.
Authenticated direct comment DML is an accepted source path in this lane and
the existing author policy does not validate ownership or readability of the
polymorphic parent. A caller can therefore insert its own comment against a
known public thread owned by somebody else, choose an unbounded future
timestamp, and make the security-definer trigger pin that thread's activity
time indefinitely.

ARGUS reproduced this with a disposable local PostgreSQL harness. A direct
authenticated-style insert using an unbounded future timestamp committed, the
reply count changed correctly, and the foreign parent inherited the unbounded
activity time. ARGUS did not attempt this against hosted data.

## Blocking Finding

The unsafe propagation is the combination of:

- `sync_thread_visible_reply_count_from_comments()` passing
  `new.created_at` into the positive count delta;
- `apply_thread_visible_reply_count_delta()` assigning that value whenever it
  is later than the thread's current activity time;
- the existing `comments_all_author` RLS policy authorizing an authenticated
  caller's own comment row without checking the polymorphic parent;
- hosted catalog evidence from the accepted preflight confirming direct
  authenticated comment write authority; and
- the security-definer delta helper correctly bypassing thread RLS so it can
  maintain counts for every legitimate DML source.

The last property is required for count integrity, but it means the trigger
must not amplify an untrusted row timestamp into parent ranking state. The
normal Station API does not accept a comment timestamp and the old RPC used
database time, so this is a new cross-row effect introduced by migration
`083`, not a reason to reopen the entire comment authorization model here.

## Exact Correction

MIMIR should return the same locked lane to DAEDALUS for these changes only:

1. Do not pass caller-controlled `new.created_at` into parent activity state.
   For an actual visible `INSERT`, use a database-derived statement time. For
   visibility, status, or parent updates, pass no activity timestamp. An
   equivalent design is acceptable only if it rejects or bounds future input
   and cannot be replayed through hide/unhide or remove/restore toggles to keep
   advancing another thread.
2. Fail closed unless the migration execution role is the owner of both
   `public.comments` and `public.threads`, or explicitly assign the new
   security-definer functions to the required table owner. The current source
   creates functions under the migration executor and assumes, but does not
   enforce, the table-owner requirement.
3. Expand the focused migration-source test to lock the trusted activity-time
   rule, function ownership precondition/assignment, security-definer and
   fixed-search-path clauses, helper execute revocations, and the complete
   all-thread reconciliation query. The current result says fixed search paths
   and reconciliation are statically locked, but the test does not assert
   those clauses.
4. Rerun the exact required local gate and update the result/roadmap claims.
   Keep the rollback's secure service-role-only grant floor; do not reopen the
   anonymous/authenticated blind RPC privilege as part of rollback.

No UI, route-local count substitute, comment RLS redesign, seed rewrite,
Discover change, hosted write, migration application, or counter repair is
needed for this correction.

## Independent Executable Review

ARGUS installed `@electric-sql/pglite@0.3.14` only inside a disposable
workspace directory, created a minimal pre-083 schema and roles, executed the
exact checked-in migration bytes, and removed the harness and package directory
afterward. No package manifest, lockfile, test dependency, or probe remains in
the worktree.

Thirty-five positive executable checks passed:

- undercount and removed-thread overcount reconciliation;
- count-derived hot-score reconciliation;
- enabled trigger execution from a direct authenticated-style insert;
- security-definer/table-owner agreement in the matching local setup;
- anon/authenticated execute denial and service-role no-op shim behavior;
- direct authenticated counter-update denial;
- zero delta for body/report-only and repeated-state changes;
- exact hide, unhide, remove, restore, parent-move, thread-scope entry/exit,
  hard-delete, and compatibility-call effects;
- missing-new-parent and negative-count failure with whole-row rollback;
- explicit transaction rollback of both comment and count; and
- tolerance of a missing old parent during cleanup.

The thirty-sixth adversarial check confirmed the blocker: unbounded direct-DML
`created_at` propagated to the parent activity timestamp.

This local execution is stronger than source regex alone, but it is not a
hosted migration claim and does not authorize application of migration `083`.

## Source And Scope Review

DAEDALUS changed exactly the eight permitted implementation and documentation
paths. No web file, UI/CSS/copy, auth route, owner/admin access rule, thread or
comment RLS policy, Discover/export/document route, seed, generated database
type, package file, lockfile, Cloudflare/Railway config, queue, billing path,
provider/partner adapter, or PR527E file changed.

The API compatibility bridge remains correctly ordered:

- before migration `083`, the service-role RPC performs the old increment;
- after migration `083`, the comment trigger owns truth and the same RPC is a
  service-role-only no-op; and
- the API call remains non-fatal during the schema/code window.

The rollback packet removes the new triggers, constraint, and helper
functions, restores the old increment body, and intentionally keeps the RPC
service-role-only. It does not deliberately corrupt reconciled counters. The
partial count index would remain after rollback, which is harmless and does
not authorize acceptance of the migration.

## Validation

| Command / check | ARGUS result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `51/51` |
| `npx --yes pnpm@10.32.1 test:document-discussions` | Pass, `4/4` |
| `npx --yes pnpm@10.32.1 test:reports` | Pass, `9/9` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass |
| Disposable exact-migration PostgreSQL probe | `35` positive checks pass; `1` adversarial timestamp check confirms blocker |
| Changed-file allow-list | Pass |
| Hosted writes / migrations / RPC invocations by ARGUS | `0 / 0 / 0` |

Passing unit, type, and count-transition checks do not override the confirmed
cross-row activity-time vulnerability.

## Claim Boundary

ARGUS does not claim that migration `083` ran against hosted data, that any
hosted counter is repaired, or that PR527D2 is ready for hosted rehearsal.
No hosted row, id, body, identity, URL, credential, token, cookie, connection
value, raw response, or secret-shaped value was printed or committed.

The canonical active/non-hidden reply-count design remains accepted. This
block is limited to the unsafe activity timestamp, the unenforced function-
owner assumption, and the tests that currently overstate what they lock.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS executed migration 083 locally and the canonical count, reconciliation, guard, shim, rollback, and privilege paths substantially pass.
- The trigger trusts caller-writable comments.created_at and can propagate an unbounded direct-DML timestamp into another owner's thread activity.
- The source also assumes rather than enforces table-owner function ownership, and its static test overclaims search-path/reconciliation coverage.
Verdict:
- BLOCK_PR527D2_UNTRUSTED_COMMENT_TIMESTAMP_CAN_PIN_FOREIGN_THREAD_ACTIVITY
Task:
- Return the same locked lane to DAEDALUS for trusted insert-time activity, fail-closed owner enforcement, and exact static assertions; keep hosted migration and writes unauthorized.
```
