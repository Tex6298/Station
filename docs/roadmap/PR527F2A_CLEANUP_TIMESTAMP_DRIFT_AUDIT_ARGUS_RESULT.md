# PR527F2A - Cleanup Timestamp Drift Audit ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Blocked - additional retained authentication state

```text
BLOCK_PR527F2A_RETAINED_REPLAY_AUTH_SESSION_AND_SIGN_IN_DRIFT
```

## Verdict

ARGUS cannot accept the proposed timestamp-only disposition. The retained
community profile `updated_at` is truthful trigger-owned audit drift and all
semantic product state inspected around it is coherent, but it is not the sole
retained difference from the failed PR527F2 run.

One replay-owner authentication session created inside the authorized run and
recovery interval remains active. Its one linked refresh-token row remains
unrevoked, and the replay owner's Auth `last_sign_in_at` also falls inside that
interval. Exact-tag cleanup did not find these rows because they belong to the
retained replay owner rather than the disposable tagged identity.

The active session is a live security artifact, not merely historical audit
metadata. This audit therefore blocks PR527F2A and does not authorize a hosted
lifecycle rerun.

## Blocking Finding

One repeatable-read, read-only hosted snapshot proved all of the following
without selecting or printing a token value, session id, owner id, row body,
or timestamp:

```text
replay_last_sign_in_inside_run_window=true
replay_sessions_created_inside_run_window=1
replay_active_sessions_created_inside_run_window=1
replay_refresh_tokens_created_inside_run_window=1
replay_unrevoked_refresh_tokens_created_inside_run_window=1
replay_linked_session_refresh_pairs_inside_run_window=1
```

The source account agrees with hosted state. `signIn()` calls Supabase
`signInWithPassword`, which advances Auth sign-in metadata and creates the
returned session/refresh pair. `signOut()` is the explicit revocation path.
ARIADNE's failed-run result records replay-owner sign-in and does not record a
replay-owner sign-out or exact retained-session cleanup.

Auth tests pass `24/24`, including sign-in/session normalization, refresh, and
authenticated sign-out boundaries. This is not an application auth defect; it
is missing failed-harness cleanup and evidence accounting.

## Checks That Passed

### Deployment And Migration

- Hosted web and API returned `200`, `ok:true`, `ready:true`, branch `main`, at
  exact accepted runtime `e542423bc07a9be77e7ad82f2b5ac6b65af087da`.
- Migration `084` SHA-256 remains
  `BB23AB2222AD5F159000F93931842497CE6830BC10C19E676516D13820671263`.
- Locked product-path drift from the accepted runtime is zero.
- The migration ledger contains exactly one matching version/name row:
  `20260716010501 / 084_community_notification_preferences`.
- Catalog remains exact: four columns/defaults, PK/FK cascade, RLS, one
  updated-at trigger, three owner predicates, no DELETE policy, authenticated
  SELECT/INSERT/UPDATE only, no anonymous grant, seven service-role grants,
  and the accepted comments. The policies use PostgreSQL's default `PUBLIC`
  role while table grants provide the authenticated/anonymous outer boundary.

### Product And Disposable Residue

Global rows remain:

```text
preferences=0
watches=0
notifications=0
```

Case-insensitive PR527F/PR527F2 tag checks returned zero across `14` tables:
Auth users, identities, sessions, and refresh tokens; Profiles, preferences,
threads, comments, notifications, and Watches; storage objects/usage; and token
usage/transactions. Six Auth/storage/token orphan checks also returned zero.

The tagged disposable identity, profile, thread, comment, notification, Watch,
preference, storage, and token state is gone. The blocker is specifically the
untagged retained replay-owner Auth state above.

### Replay Community Profile

The replay owner resolves to exactly one Auth identity, Profile, and community
profile with matching keys. All three creation records predate PR527F2, and
the ordinary Profile row was not updated during the failed-run interval.

Current semantic checks pass:

- all activity values are nonnegative integers;
- reputation exactly equals `thread_count * 2 + comment_count +
  helpful_vote_count`;
- trust level exactly matches the current reputation thresholds;
- helpful-vote and report counters agree with current retained target rows;
- mute state is clear and has no contrary mute/unmute action; and
- the canonical direct-seeded replay thread and retained owner discussion are
  present with zero PR527F tag residue.

Stored thread/comment activity counters are `5/6`, while currently authored
rows are `12/7`. This is a classified pre-existing model distinction, not a
PR527F2 cleanup defect. Migration `024` performed a one-time backfill;
`bumpCommunityActivity()` then updates best-effort application-path activity,
while direct replay/harness inserts bypass it and row deletion does not
decrement it. These fields are therefore not database-owned live-row
aggregates. The authorized PR527F2 comment path can reconstruct its semantic
delta exactly: thread/helpful/report/mute/creation fields stay unchanged,
comment count advances once, and reputation/trust are recomputed.

The community profile timestamp is monotonic from creation and lies inside the
bounded authorized run/recovery interval. The exact prior value is not
recoverable and must not be guessed. Database dependency inspection found zero
index, constraint, policy, routine, or view dependency on that `updated_at`.
Application source only serializes it with the community profile; entitlement,
fanout, moderation, ordering, billing, and privacy gates do not consume it.
Standing alone, it could truthfully become a new audit baseline. The retained
active Auth state prevents that verdict here.

## Read-Only Boundary

Every database pass began a repeatable-read `READ ONLY` transaction and ended
with rollback. No schema, ledger, product, Auth, session, token, timestamp,
configuration, or deployment write occurred. Public deployment health checks
were GET-only. Temporary scripts and the isolated temporary `pg` install were
removed; no proof artifact remains in the worktree.

## Required Disposition

MIMIR must not route the PR527F2 lifecycle rerun yet. The smallest next action
must separately authorize and prove:

1. exact identification of the one replay-owner session/refresh pair created
   inside the failed-run interval, without printing token or identity values;
2. revocation/removal of only that pair, with no global replay-owner sign-out
   or collateral session change unless independently justified;
3. post-cleanup proof that the pair is absent/inactive and no tagged or orphan
   residue exists; and
4. an honest disposition of the unavailable prior Auth `last_sign_in_at`, with
   no guess or backdate.

Only after that cleanup/disposition may ARGUS re-audit whether the remaining
community-profile and Auth timestamps can become truthful irreversible audit
metadata. Any later PR527F2 rerun must also use the evidence-hardening controls
already required by the opening audit: preflight the route release locally,
keep cleanup outside the browser promise, durably snapshot retained state in
OS-temp before writes, record created ids after each write, clean from both
`finally` and an independent recovery entry point, and remove the recovery
file only after exact restoration proof.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the read-only PR527F2 cleanup timestamp audit.
Verdict:
- BLOCK_PR527F2A_RETAINED_REPLAY_AUTH_SESSION_AND_SIGN_IN_DRIFT
Task:
- Route exact cleanup of the one retained active replay-owner session/unrevoked refresh pair and separately disposition irreversible last_sign_in_at drift.
- Do not rerun PR527F2 or claim timestamp-only/hosted acceptance before a fresh read-only ARGUS disposition.
```
