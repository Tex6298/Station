# PR527F2C - Retained Baseline Read-Only Disposition

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Queued after PR527F2B cleanup

## Entry Gate

Do not begin until this result exists and passes:

`docs/roadmap/PR527F2B_RETAINED_REPLAY_SESSION_CLEANUP_DAEDALUS_RESULT.md`

Use these earlier findings:

- `docs/roadmap/PR527F2_SETTINGS_PERSISTENCE_HOSTED_LIFECYCLE_ARIADNE_RESULT.md`
- `docs/roadmap/PR527F2A_CLEANUP_TIMESTAMP_DRIFT_AUDIT_ARGUS_RESULT.md`

This lane is read-only. It determines whether exact session cleanup leaves
only two truthful, irreversible audit timestamps from the authorized failed
run. It does not pass PR527F2 or authorize hidden drift.

## Exact Audit

In fresh repeatable-read, read-only transactions:

1. Independently prove PR527F2B removed exactly the failed-run target session
   and linked refresh row, with no active/unrevoked target pair remaining and
   every out-of-scope replay-owner session/refresh row unchanged.
2. Re-prove exact deployment/migration/ledger/catalog truth, global preferences
   `0`, Watches `0`, notifications `0`, zero PR527F2 tagged residue, and zero
   Auth/storage/token orphan residue.
3. Re-prove retained Auth identity/Profile/community-profile ownership and all
   semantic community consistency checks from PR527F2A.
4. Require the only remaining failed-run differences to be:
   - Auth `last_sign_in_at`, advanced by ordinary authorized password sign-in;
   - community profile `updated_at`, advanced by the ordinary authorized first
     comment and retained through exact semantic cleanup.
5. Source/catalog audit both fields. Confirm they are monotonic audit metadata,
   cannot be reconstructed exactly, and have no entitlement, session validity,
   fanout, moderation, ordering, billing, privacy, migration, or cleanup effect.
6. Do not print either timestamp or any private identifier. Do not attempt a
   guess, backdate, no-op update, sign-in, sign-out, token refresh, or write.

## Verdict Boundary

Accept only if the exact session artifact is gone and the two timestamps are
the sole retained differences:

```text
ACCEPT_PR527F2C_RETAINED_BASELINE_WITH_TRUTHFUL_IRREVERSIBLE_AUDIT_TIMESTAMPS
```

That verdict establishes current hosted state as the new honest rerun baseline.
It does not accept the failed run. Otherwise return one exact blocker.

Give MIMIR the smallest complete rerun boundary, carrying forward the required
controls: local route-callback preflight, cleanup outside the browser promise,
durable OS-temp pre-snapshot and write journal, independent recovery entry
point, exact retained-row restoration without trigger advance, complete
lifecycle rerun, and temp-state deletion only after fresh zero-residue proof.

## Result And Handoff

Create:

`docs/roadmap/PR527F2C_RETAINED_BASELINE_READ_ONLY_DISPOSITION_ARGUS_RESULT.md`

ARGUS may change only that result, operational status/index/baseline docs, and
`.station-agents/state/ARGUS.json`.

Commit and push, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the fresh read-only retained-baseline disposition after exact session cleanup.
Verdict:
- ACCEPT_PR527F2C_RETAINED_BASELINE_WITH_TRUTHFUL_IRREVERSIBLE_AUDIT_TIMESTAMPS (or exact blocker)
Task:
- Open the evidence-hardened complete PR527F2 rerun only if the hosted baseline is accepted.
```
