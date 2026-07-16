# PR527F2B - Retained Replay Session Cleanup DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Passed - ready for ARGUS read-only disposition

```text
PASS_PR527F2B_EXACT_REPLAY_SESSION_REFRESH_CLEANUP
```

## Authority

Executed the exact hosted Auth cleanup lane from:

- `docs/roadmap/PR527F2B_RETAINED_REPLAY_SESSION_CLEANUP_DAEDALUS.md`
- `docs/roadmap/PR527F2A_CLEANUP_TIMESTAMP_DRIFT_AUDIT_ARGUS_RESULT.md`

The cleanup removed only the retained replay-owner Auth session artifact from
the failed PR527F2 run/recovery interval. It did not sign in, refresh a token,
call global sign-out, revoke all replay-owner sessions, create any new Auth
session, or touch audit timestamps.

## Identification

Hosted database administration was used directly through the hosted pooler.
No token, session id, refresh id, owner id, email, timestamp, row body,
credential, connection string, or secret was printed or committed.

Read-only identification first proved:

| Check | Result |
| --- | --- |
| Replay Auth user rows | `1` |
| Replay Auth identity rows | `1` |
| Replay ordinary Profile rows | `1` |
| Target failed-run replay sessions | `1` |
| Linked refresh rows on target session | `2` |
| Active/unrevoked linked refresh rows | `1` |
| Product baseline | preferences `0`, Watches `0`, notifications `0` |
| PR527F/PR527F2 residue | Auth users `0`, identities `0`, sessions `0`, refresh tokens `0`, preferences `0`, threads `0`, comments `0`, notifications `0`, Watches `0` |

The target session had exactly one active/unrevoked refresh row. It also had
one already-revoked linked refresh row. Catalog inspection proved
`auth.refresh_tokens.session_id` references `auth.sessions(id) on delete
cascade`, so deleting the target session necessarily removes that already
revoked linked row. This result records that cascade honestly.

## Transaction

In one hosted transaction:

1. Snapshotted in memory only:
   - the target session key;
   - the linked refresh row keys;
   - all out-of-scope replay-owner session and refresh rows;
   - Auth user, identity, Profile, and community-profile status rows;
   - product counts and PR527F/PR527F2 residue counts.
2. Deleted only the exact active/unrevoked refresh row linked to the target
   session: affected rows `1`.
3. Deleted only the exact target replay-owner session row: affected rows `1`.
4. Catalog cascade removed the one already-revoked refresh row linked to that
   same target session.
5. Proved before commit:
   - target session absent;
   - all linked refresh rows for that target session absent;
   - every out-of-scope replay-owner session unchanged;
   - every out-of-scope replay-owner refresh row unchanged;
   - Auth user unchanged;
   - Auth identity unchanged;
   - ordinary Profile unchanged;
   - community profile unchanged;
   - product counts unchanged; and
   - tag residue unchanged.

The transaction committed only after every invariant passed.

## Fresh Postcheck

A fresh read-only postcheck after commit proved:

| Check | Result |
| --- | --- |
| Target sessions in failed-run cleanup window | `0` |
| Target linked refresh rows | `0` |
| Unrevoked refresh rows in the cleanup window | `0` |
| Auth user | unchanged |
| Auth identity | unchanged |
| ordinary Profile | unchanged |
| community profile | unchanged |
| out-of-scope replay sessions | unchanged |
| out-of-scope replay refresh rows | unchanged |
| preferences | `0` |
| Watches | `0` |
| notifications | `0` |
| PR527F/PR527F2 residue | all checked counts `0` |

No Auth `last_sign_in_at`, community `updated_at`, activity counter, Profile
field, product row, migration/schema state, deployment state, Railway
variable, or configuration was updated.

## Cleanup

Temporary `pg@8.13.1` tooling and every temporary script under the OS temp
directory were removed after proof. No screenshots, traces, videos, raw hosted
logs, tokens, cookies, credentials, connection strings, ids, row bodies, or
secret-derived artifacts were retained or committed.

## Claim Boundary

PR527F2B removes the live retained Auth session artifact only. It does not
disposition irreversible Auth `last_sign_in_at` or community-profile
`updated_at` audit drift, and it does not authorize a PR527F2 lifecycle rerun.

ARGUS must execute the queued read-only PR527F2C disposition before MIMIR
decides whether a hardened hosted lifecycle rerun can proceed.

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS removed only the exact replay-owner session/refresh pair created by the failed PR527F2 run, with every out-of-scope session and product baseline unchanged.
Task:
- Execute docs/roadmap/PR527F2C_RETAINED_BASELINE_READ_ONLY_DISPOSITION_ARGUS.md exactly.
- Commit and push the result, then wake MIMIR with WAKEUP A1:. Do not stop without a committed disposition.
```
