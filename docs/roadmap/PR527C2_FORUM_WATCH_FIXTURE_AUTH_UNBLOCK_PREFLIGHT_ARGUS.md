# PR527C2 - Forum Watch Fixture Auth Unblock Preflight

Owner: MIMIR / A1 -> ARGUS / A3 -> MIMIR / A1

Date opened: 2026-07-15

Status:

```text
OPEN_PR527C2_FORUM_WATCH_FIXTURE_AUTH_UNBLOCK_PREFLIGHT
```

## Decision Required

PR527C has passed its real owner Watch lifecycle, exact restoration, hosted
schema/readiness checks, and all human-eye states. It cannot close until two
hosted negative gates run:

- Watch PUT and DELETE return `403` below Private tier; and
- Watch GET, PUT, and DELETE return `404` for an unreadable thread.

PR527C1 authorized a disposable Visitor user and removed synthetic thread,
but Supabase Auth admin `createUser` returned `500/unexpected_failure` twice
before any fixture existed. ARGUS accepted the blocker and zero residue.
Station `/auth/signup` calls that same failing operation, so this is also a
real hosted signup-path warning rather than merely inconvenient test setup.

ARGUS must choose the smallest safe unblock. This preflight authorizes no
hosted write.

## Retained Evidence

Retain without rerunning unless product code or hosted behavior changes:

- exact accepted deployed SHA
  `f50a15fe15c08f960f7980f692bf68a2a6557780`;
- migration `040` schema, RLS, policies, trigger, ledger, and PostgREST proof;
- signed-out `401`, owner GET `200/false`, and owner/idempotency tests;
- ARIADNE's Watch, refresh, duplicate Watch, Unwatch, repeated Unwatch, and
  exact `false/0` restoration sequence;
- all `21/21` hosted human state/viewport cases; and
- PR527C1's independently reviewed zero-residue blocker.

Sources:

- `docs/roadmap/PR527C_FORUM_WATCH_HOSTED_REHEARSAL_ARIADNE_RESULT.md`
- `docs/roadmap/PR527C1_FORUM_WATCH_BOUNDARY_FIXTURE_PROOF_DAEDALUS_RESULT.md`
- `docs/roadmap/PR527C1_FORUM_WATCH_BOUNDARY_FIXTURE_PROOF_ARGUS_RESULT.md`

## MIMIR Read-Only Candidate Inventory

MIMIR used ignored local credentials and service-role reads without printing
an identity, token, id, secret, connection value, or row body. The account
selected only by `STATION_REPLAY_VISITOR_*` currently has this hosted shape:

| Boundary | Sanitized result |
| --- | --- |
| Station sign-in | `200`; current tier `private` |
| Profile | non-admin; no Stripe customer; no Stripe subscription; subscription inactive |
| Owned product rows | persona `1`; conversations `0`; Spaces `0`; authored threads `0`; authored comments `0`; Developer Spaces `0`; exports `0` |
| Community mutation rows | reports `7`; watches `0`; notifications received/acted `0/0`; votes `0`; witnesses `0` |
| Usage rows | storage usage `1`; token-usage periods `2`; token transactions `1` |

This is a designated rehearsal account, not an empty account. A temporary
tier change would fire the profile storage/token limit synchronizers and
advance update timestamps even after semantic values are restored. It must
not be described as zero mutation or byte-identical restoration.

## Options ARGUS Must Compare

### A. Repair Disposable User Creation

Assess whether the hosted `createUser` failure has a narrow, evidenced cause
in the current auth/profile trigger, trigger dependencies, grants, constraints,
or deployed signup contract. Prefer this option if it can be repaired without
direct auth-table writes, broad auth/schema changes, or speculative migration.

An accepted repair must cover the real Station signup path, preserve existing
users, and then let DAEDALUS rerun PR527C1 with a disposable Visitor and full
cleanup. Do not treat a third blind `createUser` retry as diagnosis.

### B. Reversible Designated Visitor-Tier Proof

Assess whether the explicitly named `STATION_REPLAY_VISITOR_*` rehearsal
account may safely be changed from current `private` to `visitor` for the
short hosted `403` proof, then restored. If accepted, lock all of these gates:

1. select the account only through the ignored env pair and verify its
   expected non-admin, inactive-subscription, no-Stripe, no-thread/watch/
   notification shape before mutation;
2. snapshot profile tier and all trigger-affected storage/current-token limit
   values plus baseline row counts;
3. refuse to start if the account shape, deployed SHA, watch baseline, or
   fixture-prefix baseline differs;
4. keep credentials and ids in memory and emit sanitized statuses/counts only;
5. make the tier window as short as possible, prove fresh Station session
   truth plus Watch PUT/DELETE `403`, and restore in `finally`;
6. create at most one synthetic removed thread only after tier restoration,
   prove replay-owner Watch GET/PUT/DELETE `404`, and delete it in `finally`;
7. prove exact semantic restoration of tier, limits, usage values, owned rows,
   reports, watches, notifications, and global baselines;
8. name the unavoidable `updated_at` timestamp advances honestly; and
9. leave no helper, fixture, config, package, credential, or id behind.

ARGUS must reject this option if retained account data, concurrent-use risk,
trigger behavior, restoration limits, or unavoidable timestamp drift makes it
unsafe or too misleading.

## Forbidden Shortcuts

- no direct insert/update/delete in `auth.users`;
- no forged JWT, altered route middleware, special test header, or hidden
  production bypass;
- no replay-owner/admin downgrade;
- no mutation of an existing thread;
- no deletion or rewriting of the designated account's persona, reports,
  usage, or token history;
- no permanent fixture account, seed, script, package, or config change; and
- no closure of PR527C by inference from local tests.

## Required ARGUS Result

Create:

```text
docs/roadmap/PR527C2_FORUM_WATCH_FIXTURE_AUTH_UNBLOCK_PREFLIGHT_ARGUS_RESULT.md
```

Return exactly one verdict:

```text
ACCEPT_PR527C2_DISPOSABLE_AUTH_CREATE_REPAIR_<EXACT_SCOPE>
ACCEPT_PR527C2_REVERSIBLE_DESIGNATED_VISITOR_TIER_PROOF_<EXACT_GATES>
BLOCK_PR527C2_<EXACT_AUTH_OR_FIXTURE_SAFETY_BLOCKER>
```

Record the chosen option, rejected alternative, precise DAEDALUS allow-list,
validation/restoration gates, and whether the hosted signup defect remains a
separate required lane. Do not perform a hosted write during preflight.

Commit the result and wake MIMIR. Do not wake DAEDALUS directly and do not go
idle without a committed response.

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the PR527C2 fixture-auth unblock preflight.
Verdict:
- <exact accepted path or blocker>
Task:
- Wake DAEDALUS with the exact accepted allow-list, or choose the next bounded unblock if blocked.
```
