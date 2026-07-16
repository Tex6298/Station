# PR528B13 - Dedicated Probe Session Hygiene

Owner: DAEDALUS / A2

Date queued: 2026-07-16

Status: Queued after PR528D; do not execute concurrently with ARIADNE

```text
QUEUE_PR528B13_DEDICATED_PROBE_SESSION_HYGIENE_AFTER_PR528D
```

## Purpose

Remove the unjustified legacy Auth-session baseline from exactly two protected
staging probe owners after ARIADNE completes PR528D and signs out. Prevent the
same protected-read mistake from silently rebuilding that backlog.

Current accepted read-only baseline from PR528C9:

| Dedicated probe owner | Sessions | Unrevoked refresh tokens |
| --- | ---: | ---: |
| Cross-owner replay probe | `257` | `257` |
| Private Aster owner | `1` | `1` |
| **Total** | **`258`** | **`258`** |

These are controlled test-account artifacts, not fixtures. The two users,
identities, profiles, corpora, storage, entitlements, and truthful Auth audit
history must remain.

## Start Gate

Do not begin until MIMIR sends a fresh `WAKEUP A2:` after PR528D completes.
Before any write, prove:

- ARIADNE's rehearsal has ended and its exact fresh session is absent;
- the two target owners are identified only through protected local evidence;
- current per-owner session and unrevoked-refresh counts are rebound;
- unrelated Auth users, identities, sessions, refresh tokens, and audit fields
  have a protected comparison snapshot/hash; and
- public Station Guide corpus and private Aster product-state invariants are
  exact.

Stop without mutation if the target counts or identities do not match the
accepted protected evidence.

## Exact Hosted Mutation Boundary

Allowed:

- session and refresh-token state belonging to exactly the two dedicated probe
  Auth users;
- at most one bounded ordinary Auth session per target owner if a fresh JWT is
  required for Auth-admin global revocation;
- Auth-admin global revocation for that exact owner;
- truthful `last_sign_in_at` advancement caused by the bounded sign-in, if
  required; and
- no other hosted mutation.

Prefer an administrative revocation path that does not require a fresh sign-in
when the installed supported contract provides one. Do not directly edit or
backdate Auth user audit fields.

Forbidden:

- deleting or changing either user or identity;
- profile, persona, Memory, candidate, Archive, Continuity, storage, billing,
  provider, conversation, public corpus, engagement, or moderation writes;
- touching Station Guide Auth state;
- broad account cleanup;
- guessed timestamp restoration; and
- running the retired legacy verifier.

## Durable Verifier Guard

Add the smallest committed reusable protected-read verifier boundary and a
focused contract test that fail if a protected-read run attempts:

- Auth sign-up, sign-in, refresh, sign-out, session creation, or session
  mutation; or
- a product request method other than `GET`.

Do not commit credentials, protected identifiers, private values, or a copy of
the ignored operator packet. The guard should be reusable by later hosted
verification lanes and should make Auth-producing helper calls explicit rather
than silently available.

If a durable guard cannot be implemented without a broad harness rewrite,
stop after exact hosted cleanup and name the smallest numbered follow-up. Do
not turn B13 into open-ended test-infrastructure refactoring.

## Required Postflight

Prove through fresh protected reads:

- both target owners have zero sessions;
- both target owners have zero unrevoked refresh tokens;
- no targeted preflight or cleanup session remains;
- unrelated Auth state is unchanged;
- users, identities, profiles, and truthful audit history are retained;
- public Station Guide corpus is exact;
- private Aster product-state hash, Memory weights, and storage bytes are exact;
- no provider call or deployment occurred; and
- the durable verifier guard's focused tests pass, if implemented.

Run local Auth tests, the focused guard tests, API typecheck where touched, and
`git diff --check`.

## Verdict

```text
READY_PR528B13_DEDICATED_PROBE_SESSION_HYGIENE_FOR_ARGUS
```

Block with a concrete reason if zero cannot be proved or any non-target state
changes.

## Handoff

Commit a public-safe result and wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed the bounded PR528B13 cleanup for exactly the two dedicated probe owners and proved zero session/refresh residue.
Verdict:
- READY_PR528B13_DEDICATED_PROBE_SESSION_HYGIENE_FOR_ARGUS
Task:
- Route ARGUS review before PR528 closeout.
```
