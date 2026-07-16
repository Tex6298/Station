# PR527F2C - Retained Baseline Read-Only Disposition ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Accepted - current hosted state is the honest rerun baseline

```text
ACCEPT_PR527F2C_RETAINED_BASELINE_WITH_TRUTHFUL_IRREVERSIBLE_AUDIT_TIMESTAMPS
```

## Verdict

ARGUS accepts the current retained hosted baseline after DAEDALUS's exact
PR527F2B session cleanup. The failed-run session and all linked refresh rows
are gone, no out-of-scope replay Auth row shows cleanup-window mutation, and
the only remaining failed-run differences are two truthful, monotonic audit
timestamps:

- Auth `last_sign_in_at`, advanced by the authorized replay-owner password
  sign-in; and
- `community_user_profiles.updated_at`, advanced by the authorized first
  comment and retained through exact semantic recovery.

Their exact prior values were lost with ARIADNE's terminated in-memory
snapshot. They cannot be reconstructed honestly and must not be guessed or
backdated. This result establishes current state as the new rerun baseline. It
does not pass the failed PR527F2 rehearsal or claim hosted product acceptance.

## Independent Session Cleanup Proof

Fresh repeatable-read, read-only snapshots prove:

```text
failed_run_window_sessions=0
failed_run_window_refresh_tokens=0
active_target_session_refresh_pairs=0
out_of_scope_sessions_touched_during_cleanup=0
out_of_scope_refresh_tokens_touched_during_cleanup=0
```

The non-secret fields of every current out-of-scope replay-owner session and
refresh row were equal across two separate fresh transactions. The token field
was neither selected nor hashed. The second snapshot again found zero target
session rows.

DAEDALUS's committed transaction evidence records one explicit active refresh
delete and one exact target-session delete; the catalog-proven session cascade
removed the target's one already-revoked linked refresh row. Independent fresh
state now contains no target row and zero Auth or token orphan residue, so no
linked target refresh row survived that cascade.

No private id, timestamp, email, token, token-derived hash, row body,
credential, connection string, or secret was printed or committed.

## Deployment And Schema

- Hosted web and API returned `200`, `ok:true`, `ready:true`, branch `main`, at
  exact accepted runtime `e542423bc07a9be77e7ad82f2b5ac6b65af087da`.
- Migration `084` SHA-256 remains
  `BB23AB2222AD5F159000F93931842497CE6830BC10C19E676516D13820671263`.
- Locked product-path drift from the accepted runtime remains zero.
- The migration ledger contains exactly one matching version/name row:
  `20260716010501 / 084_community_notification_preferences`.
- Migration `084` catalog remains exact: four columns/defaults, PK/FK cascade,
  updated-at trigger, RLS, three owner predicates, no DELETE policy,
  authenticated SELECT/INSERT/UPDATE only, no anonymous grant, seven
  service-role grants, and accepted comments.

Global rows remain:

```text
preferences=0
watches=0
notifications=0
```

PR527F/PR527F2 tag checks are zero across the same `14`
Auth/product/storage/token tables used by PR527F2A. Six Auth/storage/token
orphan checks are also zero.

## Retained Owner Truth

The replay owner still resolves to exactly one Auth identity, ordinary Profile,
and community profile with matching keys. Their creation records predate the
failed run. All semantic checks remain unchanged and coherent:

- activity values are nonnegative integers;
- reputation exactly equals `thread_count * 2 + comment_count +
  helpful_vote_count`;
- trust level exactly matches the current score threshold;
- helpful-vote and report counters agree with retained target rows;
- mute state is clear; and
- thread/comment counters retain the previously classified application-activity
  versus current-row distinction.

Those thread/comment counters are not live database aggregates. Migration
`024` backfilled once, API activity updates are best-effort, direct
seed/harness writes bypass the updater, and deletion does not decrement the
profile. Their mismatch is pre-existing model truth, not hidden cleanup drift.

## Exact Timestamp Inventory

Catalog-driven inspection enumerated every retained owner timestamp column
whose value lies inside the failed-run interval:

```text
auth.users:                    last_sign_in_at
auth.identities:               none
public.profiles:               none
community_user_profiles:       updated_at
owner-linked auth audit rows:  0
```

Both values are later than their owning row's creation record, lie inside the
authorized failed-run interval, and lie outside the PR527F2B cleanup interval.
No Auth user `updated_at`, identity timestamp, ordinary Profile timestamp, or
additional community-profile timestamp falls in the failed-run interval.

The source account is exact:

- `signIn()` calls Supabase `signInWithPassword`; session validity and refresh
  depend on session/JWT/refresh state, not `last_sign_in_at`.
- Station authorization and billing entitlement read normalized Auth identity
  plus `profiles.tier`/`is_admin`; no Station source reads
  `last_sign_in_at`.
- The Auth catalog has one ordinary descending btree index on
  `last_sign_in_at`. No constraint, routine, or view consumes it, and Station
  issues no query or ordering against it. Updating the index entry is part of
  storing the audit field, not a separate product ordering effect.
- The normal comment path calls `bumpCommunityActivity()`, whose profile update
  invokes `handle_updated_at()`. Application source only serializes that
  community timestamp; no entitlement, session, fanout, moderation, ordering,
  billing, privacy, migration, or cleanup gate consumes it.
- The community timestamp has zero index, constraint, or policy dependency.

The timestamps are therefore audit metadata without current product authority.
Exact historical reconstruction is impossible because neither prior value was
durably captured. Dead tuples, relation files, guessed values, no-op updates,
sign-in, sign-out, refresh, and backdating were not attempted.

## Validation And Write Boundary

| Command / proof | Result |
| --- | --- |
| Fresh hosted repeatable-read audit | Pass; exact cleanup, schema, ledger, zero rows/residue/orphans, owner semantics, and two-field inventory |
| Second fresh out-of-scope snapshot | Pass; non-secret session/refresh row shapes stable, target remains absent |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, `24/24` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `54/54` |
| `git diff --check` | Pass; line-ending warnings only |

Every hosted database pass used `READ ONLY` and rollback. Public deployment
checks were GET-only. No Auth, session, token, timestamp, schema, ledger,
product, configuration, or deployment write occurred. The temporary script and
isolated `pg` package were removed.

## Complete Rerun Boundary

MIMIR may now open one complete evidence-hardened PR527F2 rerun. It must carry
all of these controls together:

1. prove the Playwright route-release/unroute callback locally before any
   hosted write;
2. keep lifecycle cleanup outside the browser promise and always await route
   completion before unregistering it;
3. durably write the complete aggregate and retained-row pre-snapshot to an
   untracked OS-temp recovery file before the first hosted mutation;
4. append exact created ids and each successful write to that recovery journal
   immediately, without printing them;
5. clean both in `finally` and from an independent recovery entry point;
6. restore the exact retained community snapshot without advancing its trigger
   timestamp;
7. account for any replay Auth sign-in/session effect explicitly, clean the
   exact created session/refresh rows, and never silently add another
   irreversible Auth timestamp claim;
8. rerun the complete preference/fanout/RLS/refresh/keyboard/theme lifecycle
   rather than reusing partial failed-run evidence; and
9. delete temporary recovery state only after fresh zero-residue and exact
   restoration proof.

This disposition authorizes MIMIR to route that bounded rerun, not ARGUS to
execute it and not any broader Settings, Auth, runtime, or product expansion.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the fresh read-only retained-baseline disposition after exact session cleanup.
Verdict:
- ACCEPT_PR527F2C_RETAINED_BASELINE_WITH_TRUTHFUL_IRREVERSIBLE_AUDIT_TIMESTAMPS
Task:
- Open the evidence-hardened complete PR527F2 rerun with every locked recovery, Auth-accounting, and zero-residue control above.
```
