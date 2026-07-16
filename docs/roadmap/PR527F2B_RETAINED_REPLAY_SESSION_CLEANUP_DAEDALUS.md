# PR527F2B - Retained Replay Session Cleanup

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - exact hosted Auth cleanup

## Authority

Use the independent finding in:

`docs/roadmap/PR527F2A_CLEANUP_TIMESTAMP_DRIFT_AUDIT_ARGUS_RESULT.md`

Verdict:

```text
BLOCK_PR527F2A_RETAINED_REPLAY_AUTH_SESSION_AND_SIGN_IN_DRIFT
```

ARGUS proved exactly one active replay-owner session created inside the failed
PR527F2 run/recovery interval, exactly one linked unrevoked refresh-token row,
and an Auth `last_sign_in_at` advance in that interval. The session/token pair
is a live security artifact and must be removed. The sign-in timestamp is
irreversible audit history and must not be guessed or backdated.

## Exact Cleanup Boundary

Use hosted database administration directly. Do not sign in, refresh a token,
call global sign-out, revoke every replay-owner session, or create a new Auth
session while identifying the target.

1. Reproduce ARGUS's sanitized read-only identification and require all of:
   - exactly one retained replay-owner session created in the failed-run
     interval;
   - that session is active;
   - exactly one refresh-token row linked to it in the interval;
   - that refresh token is unrevoked; and
   - the session/refresh ownership keys agree.
2. Snapshot in memory only:
   - the exact target session and refresh primary keys;
   - the complete set/count of every out-of-scope replay-owner session and
     refresh row;
   - Auth user/identity/Profile status fields relevant to collateral-change
     proof; and
   - global preferences, Watches, notifications, tagged residue, and orphan
     baselines.
3. If any target cardinality, ownership, link, activity, or interval assertion
   differs from ARGUS's finding, rollback/stop without a write and wake MIMIR.
4. In one transaction, delete/revoke only the exact linked refresh row and
   delete only the exact target session row. Require affected row count `1`
   for each operation before commit. Let a catalog-proven cascade satisfy one
   side only if the transaction still proves the exact target pair and no
   collateral row; record the actual order honestly.
5. Before commit, require:
   - target session absent/inactive;
   - target linked refresh row absent/revoked;
   - every out-of-scope replay-owner session/refresh row byte-for-byte
     unchanged in memory;
   - Auth user, identities, ordinary Profile, and product rows unchanged; and
   - no new session, refresh token, preference, Watch, notification, tag, or
     orphan residue.
6. Commit only when every invariant passes, then repeat the same proof in a
   fresh read-only transaction.

Do not update `auth.users.last_sign_in_at`,
`community_user_profiles.updated_at`, semantic community counters, Auth user
metadata, identity rows, Profile rows, product data, migration/schema state,
Railway variables, or deployment. Never print token strings, ids, emails,
timestamps, row bodies, credentials, URLs with secrets, or connection strings.

## Result And Handoff

Create:

`docs/roadmap/PR527F2B_RETAINED_REPLAY_SESSION_CLEANUP_DAEDALUS_RESULT.md`

Record sanitized cardinalities, preconditions, exact transaction row counts,
out-of-scope set equality, fresh postcheck, aggregate/orphan truth, and zero
collateral change. A pass verdict is:

```text
PASS_PR527F2B_EXACT_REPLAY_SESSION_REFRESH_CLEANUP
```

DAEDALUS may change only that result, operational status/index/baseline docs,
and `.station-agents/state/DAEDALUS.json`.

Commit and push, then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS removed only the exact replay-owner session/refresh pair created by the failed PR527F2 run, with every out-of-scope session and product baseline unchanged.
Task:
- Execute docs/roadmap/PR527F2C_RETAINED_BASELINE_READ_ONLY_DISPOSITION_ARGUS.md exactly.
- Commit and push the result, then wake MIMIR with WAKEUP A1:. Do not stop without a committed disposition.
```
