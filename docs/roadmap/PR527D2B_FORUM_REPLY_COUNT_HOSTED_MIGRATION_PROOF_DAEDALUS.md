# PR527D2B - Forum Reply Count Hosted Migration And Proof

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-15

Status: Open - exact migration apply and hosted proof authorized

## Decision

PR527D2A is accepted locally as:

```text
ACCEPT_PR527D2A_TRUSTED_ACTIVITY_AND_FUNCTION_OWNER_GUARD_WITH_ARGUS_TEST_PATCH
```

MIMIR authorizes one audited hosted operation for the exact accepted migration
and its bounded proof. This is not permission for product-code changes,
manual correction of individual product rows, or a broader Forum lane.

Accepted implementation ancestry:

```text
da105cf077b224abfa2a3e48e0cc00b52bd34455
```

Exact migration:

```text
infra/supabase/migrations/083_forum_visible_reply_count_integrity.sql
SHA-256 DA4BBF4021723768F9DCEC41E0AD91C6FA4D909BAE17012B72FDF0462907C44B
```

Source decisions:

- `docs/roadmap/PR527D2_FORUM_REPLY_COUNT_TRUTH_PREFLIGHT_ARGUS_RESULT.md`
- `docs/roadmap/PR527D2A_FORUM_REPLY_COUNT_TRUSTED_ACTIVITY_REPAIR_ARGUS_RESULT.md`
- `docs/roadmap/PR527D2_FORUM_REPLY_COUNT_TRUTH_DAEDALUS_RESULT.md`

## Owner Chain

```text
MIMIR -> DAEDALUS -> ARGUS -> MIMIR -> ARIADNE -> MIMIR
```

DAEDALUS applies and proves. ARGUS independently reviews the hosted evidence
and resulting database state. MIMIR then decides whether a small ARIADNE
human readback is still useful before closing PR527D2 and resuming PR527E.

## Deployment Anchor

Before any hosted write:

1. Confirm Railway web and API are healthy, ready, on `main`, and report the
   same full commit SHA.
2. Confirm that deployed SHA contains accepted review commit `da105cf0` and
   has no later diff in migration `083`, the comments route, or its focused
   tests. A docs-only descendant is acceptable; runtime or migration drift is
   not.
3. Recompute the exact migration hash from the checked-out deployed lineage.
4. Confirm the database target and Railway URLs are hosted and non-local
   without printing their values.

Wait for a coherent deployment if the services are merely rolling. Stop and
wake MIMIR if the accepted source or target identity is ambiguous.

## Preflight

Run read-only catalog and aggregate probes before applying anything. Record
only sanitized booleans, counts, object names, role classes, and hashes.

Prove:

- migration `083` is absent from the hosted migration ledger;
- the new visible-reply trigger and direct-counter guard trigger are absent;
- the new nonnegative constraint and helper functions are absent;
- the legacy `increment_thread_comment_count(uuid)` blind-increment shape is
  present;
- `public.comments` and `public.threads` exist, share one owner, and the
  migration connection executes as that owner;
- the existing comments updated-at trigger and all other migration
  preconditions are present;
- a rollback packet has been prepared locally before the first write; and
- the current aggregate mismatch shape is retained without identifiers or
  bodies: one readable live undercount and one removed-thread overcount were
  previously observed, while all other threads matched.

Recompute the canonical count for every hosted thread:

```text
COUNT(comments)
WHERE parent_type = 'thread'
  AND parent_id = threads.id
  AND status = 'active'
  AND is_hidden = false
```

Do not expose inaccessible parents, identities, comment text, thread text, or
row-level captures in command output or committed evidence.

## Authorized Hosted Apply

If and only if every preflight check passes:

1. Use the existing safe hosted pooler path and temporary tooling outside the
   repository. Do not add a package or lockfile entry.
2. Apply the checked-in migration file byte-for-byte. Do not copy-edit,
   split, reorder, or substitute its SQL.
3. Let the migration's own transaction, advisory lock, reconciliation,
   validation, privilege changes, and PostgREST reload complete.
4. After successful schema postcheck, record exactly one fresh honest row in
   `supabase_migrations.schema_migrations` named
   `083_forum_visible_reply_count_integrity`, using the established hosted
   timestamp-version convention. Confirm its count is exactly one.
5. Never insert the ledger row before the exact migration has committed.

If the migration transaction fails, prove its new objects and ledger row are
absent and report the bounded blocker. Do not improvise a repair.

If a post-commit security or integrity invariant fails, use the reviewed
rollback packet from the PR527D2 result in one audited transaction, remove
only this operation's ledger row after rollback succeeds, request PostgREST
reload, and report the exact sanitized blocker. Preserve reconciled counter
values; do not restore known stale values.

## Required Hosted Proof

### Durable schema and data truth

Prove after apply:

- all migration functions and triggers exist with the expected table owner,
  security-definer/fixed-search-path shape, and trigger events;
- direct execute is revoked from `PUBLIC`, `anon`, and `authenticated` for
  internal helpers;
- the compatibility shim is executable only by `service_role` and performs
  no write;
- the direct counter guard and validated nonnegative constraint exist;
- every thread counter equals the canonical aggregate;
- every thread hot score equals `score + comment_count * 0.35` within the
  database numeric contract;
- the known live undercount reconciles from `1` to `2` and the known removed
  overcount reconciles, without identifying either row; and
- the migration ledger has exactly one honest `083` row.

### Bounded disposable lifecycle

Use a uniquely tagged, public-safe standalone Forum fixture. Do not mutate an
existing account, thread, document, Space, report, vote, watch, notification,
or comment. A disposable Station auth/profile may be created if required and
must be removed in `finally`.

Prove exact counter and hot-score behavior for:

- route-created visible reply;
- direct service-role visible reply;
- hide and repeated hide;
- unhide and repeated unhide;
- remove and restore;
- owner soft delete;
- hard delete;
- repeated compatibility-shim invocation with no count change; and
- a deliberately failed mutation that rolls back both comment and counter.

Also run one rollback-only direct database transaction proving a
caller-supplied future comment timestamp cannot pin parent activity and that
visibility/status/parent updates do not replay activity time.

### Cross-surface readback

While the disposable fixture exists, confirm its visible reply count agrees
through:

- Forum thread detail;
- Forum category listing; and
- Discover rising/search where the fixture is eligible to appear.

Confirm the corrected existing document-linked discussion reports the same
count through the public document entry point and Forum thread detail. Use
only aggregate/equality evidence in the result doc.

### Cleanup

Cleanup is mandatory in `finally`, including failure paths. Remove all
disposable auth/profile, thread, comment, notification, vote, witness, report,
watch, token/session, and related fixture rows. Prove:

- zero tagged residue;
- restored aggregate baselines outside the intended migration reconciliation;
- no fixture remains discoverable through public surfaces; and
- the migration objects, one ledger row, and reconciled canonical counters
  are the only intended durable hosted changes.

## Frozen Scope

Do not change:

- application, web, API, test, migration, package, or lockfile source;
- auth, tier, billing, Stripe, Redis, Cloudflare, provider, queue, or Railway
  configuration;
- Forum copy, styling, routes, visibility rules, moderation vocabulary, or
  ranking formula;
- existing product content by hand; or
- PR527E or any unrelated PR527 surface.

Allowed committed files are limited to:

```text
docs/roadmap/PR527D2B_FORUM_REPLY_COUNT_HOSTED_MIGRATION_PROOF_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

## Evidence Hygiene

Do not print or commit connection strings, passwords, tokens, service keys,
cookies, auth headers, raw SQL errors, stack traces containing values, row
identifiers, identities, bodies, private content, or raw HTTP/database
responses. Sanitize evidence at collection time rather than after capture.

## Result And Handoff

Create:

`docs/roadmap/PR527D2B_FORUM_REPLY_COUNT_HOSTED_MIGRATION_PROOF_DAEDALUS_RESULT.md`

Record exact pass/fail for deployment ancestry, source hash, preflight,
migration transaction, ledger, catalog/privilege shape, reconciliation,
disposable lifecycle, activity-time adversary, cross-surface readback,
cleanup, durable changes, and frozen scope.

Commit and push the result. Then wake ARGUS explicitly:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR527D2B's exact migration 083 hosted operation and bounded proof, or stopped on a sanitized blocker.
Task:
- Independently review docs/roadmap/PR527D2B_FORUM_REPLY_COUNT_HOSTED_MIGRATION_PROOF_DAEDALUS_RESULT.md, the exact hosted catalog/aggregate state, ledger truth, cleanup, and scope.
- Commit and push an ARGUS verdict, then wake MIMIR with WAKEUP A1:. Do not stop without a committed handoff.
```
