# PR527D2A - Forum Reply Count Trusted Activity Repair

Owner: MIMIR / A1 -> DAEDALUS / A2 -> ARGUS / A3 -> MIMIR / A1

Date opened: 2026-07-15

Blocking review:

```text
BLOCK_PR527D2_UNTRUSTED_COMMENT_TIMESTAMP_CAN_PIN_FOREIGN_THREAD_ACTIVITY
```

Status:

```text
OPEN_PR527D2A_TRUSTED_INSERT_TIME_AND_FUNCTION_OWNER_GUARD
```

## Purpose

Correct only the three defects retained by ARGUS in migration `083`:

1. a direct authenticated comment insert can choose an unbounded future
   `comments.created_at`, which the security-definer trigger propagates into a
   foreign thread's `last_activity_at`;
2. migration source assumes but does not enforce that its security-definer
   functions have the required table-owner context; and
3. focused static tests overclaim trusted-time, function-owner,
   fixed-search-path, helper-revocation, and complete-reconciliation coverage.

The canonical active/non-hidden reply-count design, trigger ownership,
transactional reconciliation, direct-counter guard, nonnegative constraint,
service-role-only no-op shim, API compatibility window, and rollback floor
remain accepted.

Accepted source:

- `docs/roadmap/PR527D2_FORUM_REPLY_COUNT_TRUTH_ARGUS_RESULT.md`

## Exact Correction

1. For an actual visible comment `INSERT`, advance parent activity only from a
   trusted database-derived statement time. Do not use `new.created_at` or any
   caller-writable row timestamp.
2. For visibility, status, or parent updates, pass no activity timestamp.
   Hide/unhide, remove/restore, repeated updates, and parent moves must not be
   replayable as synthetic new activity.
3. Fail closed unless migration `083` executes in a context that owns both
   `public.comments` and `public.threads`, or explicitly assign every new
   security-definer function to the required common table owner. Do not leave
   function ownership as an assumption.
4. Extend the existing focused migration-source test to assert exactly:
   - trusted database time for real insert only;
   - no caller-controlled `new.created_at` activity propagation;
   - table-owner precondition or explicit owner assignment;
   - every security-definer and fixed-search-path clause;
   - helper execute revocation from `PUBLIC`, `anon`, and `authenticated`;
   - the complete all-thread reconciliation predicate/update; and
   - the secure service-role-only compatibility and rollback grant floor.
5. Update the DAEDALUS result/status claims to distinguish static/mocked proof
   from executable PostgreSQL review.

An equivalent trusted-time implementation is acceptable only if future input
is rejected or bounded and no update transition can repeatedly advance a
foreign thread.

## Frozen Scope

Do not change:

- comment or thread RLS policy, parent authorization, route behavior, UI,
  Discover, documents, export, seed, generated types, or data model beyond the
  already-open migration `083` objects;
- canonical count predicate, delta semantics, reconciliation, hot-score math,
  direct-counter protection, nonnegative invariant, shim signature, API
  compatibility call, notification behavior, or rollback grant floor;
- packages, lockfiles, config, hosted schema/data, or PR527E; or
- any hosted counter, migration ledger, RPC, function, trigger, constraint,
  row, fixture, or credential.

No hosted migration or write is authorized.

## Repo Allow-List

DAEDALUS may change only:

```text
infra/supabase/migrations/083_forum_visible_reply_count_integrity.sql
apps/api/src/routes/comments.ts
apps/api/src/routes/community.test.ts
apps/api/src/routes/document-discussions.test.ts
docs/roadmap/PR527D2A_FORUM_REPLY_COUNT_TRUSTED_ACTIVITY_REPAIR_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

If another file is genuinely required, stop and wake MIMIR with the exact
reason before editing it.

## Validation Gate

Run:

```text
npx --yes pnpm@10.32.1 test:community
npx --yes pnpm@10.32.1 test:document-discussions
npx --yes pnpm@10.32.1 test:reports
npx --yes pnpm@10.32.1 --filter @station/api typecheck
git diff --check
```

Temporary disposable PostgreSQL validation is allowed locally if it leaves no
package, lockfile, harness, database, capture, or output artifact in the repo.
It does not replace ARGUS review and must never be described as hosted proof.

## Required Result And Review Handoff

Create:

```text
docs/roadmap/PR527D2A_FORUM_REPLY_COUNT_TRUSTED_ACTIVITY_REPAIR_DAEDALUS_RESULT.md
```

Return exactly one result:

```text
READY_PR527D2A_TRUSTED_ACTIVITY_AND_FUNCTION_OWNER_GUARD_FOR_ARGUS
BLOCK_PR527D2A_<EXACT_SQL_TEST_OR_SCOPE_BLOCKER>
```

Record changed files, trusted-time rule, owner-enforcement rule, exact static
assertions, test totals, any disposable local SQL proof, rollback preservation,
hosted-mutation count, scope check, and secret check. Commit the result and
wake ARGUS. Do not apply migration `083` and do not go idle without the
committed review handoff.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed the bounded PR527D2A trusted-activity and function-owner correction.
Task:
- Re-run the exact migration bytes in a disposable PostgreSQL harness, including the adversarial future timestamp and update-replay cases, then review static assertions and frozen scope.
- Wake MIMIR with accept/block verdict; no hosted migration or write is authorized.
```
