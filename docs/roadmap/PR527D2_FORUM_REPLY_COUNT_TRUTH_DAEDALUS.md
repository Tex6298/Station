# PR527D2 - Forum Reply Count Truth Implementation

Owner: MIMIR / A1 -> DAEDALUS / A2 -> ARGUS / A3 -> MIMIR / A1

Date opened: 2026-07-15

Accepted preflight:

```text
ACCEPT_PR527D2_DATABASE_TRIGGER_OWNED_VISIBLE_REPLY_COUNT_WITH_TRANSACTIONAL_RECONCILIATION
```

Status:

```text
OPEN_PR527D2_DATABASE_TRIGGER_OWNED_VISIBLE_REPLY_COUNT_IMPLEMENTATION
```

## Product Contract

For every thread, including hidden or removed parents that may later be
restored, `threads.comment_count` is exactly the number of comments where:

```text
parent_type = 'thread'
parent_id = threads.id
status = 'active'
is_hidden = false
```

This is the currently renderable reply count after parent-thread access is
authorized. Hidden and removed moderation history does not count. Detail,
category, document, Discover, export metadata, and count-derived ranking must
all consume the same repaired stored truth.

Accepted source:

- `docs/roadmap/PR527D2_FORUM_REPLY_COUNT_TRUTH_PREFLIGHT_ARGUS_RESULT.md`

## Required Implementation

Create exactly:

```text
infra/supabase/migrations/083_forum_visible_reply_count_integrity.sql
```

Migration `083` must:

1. Execute transactionally under an advisory lock and fail closed if the
   expected prior function/trigger/constraint shape is not present.
2. Add an `AFTER INSERT OR DELETE OR UPDATE OF parent_type, parent_id, status,
   is_hidden` trigger on `comments`.
3. Compute old/new canonical visibility and apply exact `+1`, `-1`, or zero.
   Cross-parent moves must lock affected parent threads in deterministic order.
4. Treat a missing new thread parent as an integrity error. A missing old
   parent during hard parent cleanup may be tolerated.
5. Update `comment_count` and `hot_score` together. A newly visible reply may
   move `last_activity_at` forward; hide/remove/delete must not fabricate
   activity time.
6. Use security-definer functions owned by the table owner with fixed
   `search_path`; revoke direct execute from `PUBLIC`, `anon`, and
   `authenticated` wherever applicable.
7. Add a thread insert/update guard that blocks non-owner execution contexts
   from setting the database-owned counter directly while permitting the
   owner-run trigger and migration reconciliation.
8. Reconcile every existing thread in the same transaction from the canonical
   aggregate and recompute `hot_score = score + comment_count * 0.35`.
9. Add and validate `CHECK (comment_count >= 0)` after reconciliation. Never
   clamp an invalid negative transition.
10. Replace `increment_thread_comment_count(uuid)` with a no-write compatibility
    shim, retain its signature, revoke `PUBLIC`/`anon`/`authenticated`, grant
    only `service_role`, and document deprecation.
11. Request PostgREST schema reload. Do not invent or insert a hosted migration
    ledger row locally; that belongs to the later audited hosted operation.

The trigger must abort the comment mutation in the same database transaction
when count maintenance fails. Notification fanout remains non-authoritative
and follows successful creation as it does now.

## API Compatibility Boundary

`apps/api/src/routes/comments.ts` may change only to make the existing RPC
call and comment accurately describe the deployment bridge:

- before migration `083`, the old RPC still increments;
- after migration `083`, the trigger owns truth and the service-role-only shim
  is a no-op; and
- the initial code must not remove the compatibility call before hosted
  migration application.

Do not add route-local counter math, read-time repair, a public repair RPC, or
a UI substitution.

## Required Coverage

Use existing community and document-discussion tests to lock both migration
source and API compatibility behavior. Local static/mocked tests must not be
described as execution of the PostgreSQL trigger.

Cover:

- exact trigger events, canonical predicate, deterministic parent locking,
  full reconciliation, `hot_score`, direct-write guard, nonnegative check,
  fixed search paths, privilege revocation, compatibility shim, and schema
  reload;
- normal API create and the retained compatibility call without application
  double-count ownership;
- zero-delta body/pin/vote/witness/report-only changes;
- hide/unhide/remove/restore and repeated same-state transitions;
- soft delete, hard delete, direct service-style insert, parent movement, and
  failed/rolled-back writes;
- standalone and document-linked parents plus public, community, hidden, and
  removed access boundaries; and
- the absence of a detail/category/Discover route-local count substitute.

Where a behavior cannot execute without real PostgreSQL, lock the SQL contract
honestly and leave dynamic proof to the post-review hosted migration gate.

## Repo Allow-List

DAEDALUS may change only:

```text
infra/supabase/migrations/083_forum_visible_reply_count_integrity.sql
apps/api/src/routes/comments.ts
apps/api/src/routes/community.test.ts
apps/api/src/routes/document-discussions.test.ts
docs/roadmap/PR527D2_FORUM_REPLY_COUNT_TRUTH_DAEDALUS_RESULT.md
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

Do not apply migration `083`, repair a hosted counter, invoke the blind RPC,
or perform any hosted write in this implementation lane. Do not print or
commit a connection value, id, body, identity, credential, token, raw response,
or secret-shaped material.

Prepare a bounded rollback packet in the result for later hosted use. It may
disable/drop the new triggers and constraint and restore the prior RPC
definition/grants in one audited transaction if the migration regresses. It
must not deliberately corrupt reconciled counter values.

## Required Result And Review Handoff

Create:

```text
docs/roadmap/PR527D2_FORUM_REPLY_COUNT_TRUTH_DAEDALUS_RESULT.md
```

Return exactly one result:

```text
READY_PR527D2_DATABASE_TRIGGER_OWNED_VISIBLE_REPLY_COUNT_FOR_ARGUS
BLOCK_PR527D2_<EXACT_SQL_TEST_OR_SCOPE_BLOCKER>
```

Record changed files, migration object/privilege contract, transition table,
reconciliation and rollback shape, test totals, static-versus-dynamic proof
boundary, hosted-mutation count, scope check, and secret check. Commit the
result and wake ARGUS. Do not deploy/apply the migration and do not go idle
without a committed review handoff.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed the locked local PR527D2 migration 083 implementation.
Task:
- Hostile-review transactional SQL, trigger/guard privileges, compatibility window, reconciliation, tests, rollback packet, and frozen scope.
- Wake MIMIR with accept/block verdict; no hosted migration or write is authorized during review.
```
