# PR528C9 - Auth Sign-Out And Probe Audit Disposition

Owner: ARGUS / A3

Date opened: 2026-07-16

Status: Open for read-only hostile review

```text
OPEN_PR528C9_AUTH_SIGNOUT_AND_PROBE_AUDIT_DISPOSITION
```

## Purpose

Independently disposition PR528B12 after DAEDALUS proved the hosted Station
Guide sign-out repair works but allowed a legacy private-corpus verifier to
advance `last_sign_in_at` on two dedicated probe accounts.

This is a review lane, not another cleanup run. Do not create an Auth session,
rerun the legacy verifier, backdate audit history, mutate the retained public
corpus, or touch private Aster product state.

## Accepted Facts To Rebind

Rebind the public-safe evidence rather than trusting the handoff summary:

- API and web are ready on exact accepted Auth source `67da511f`;
- hosted sign-out uses Auth admin `signOut(accessToken, "local")`;
- the retained Station Guide owner has zero sessions and zero unrevoked refresh
  tokens;
- one deployed product sign-out canary returned `204`, removed its exact
  session and refresh token, and made its JWT fail `/auth/me` with `401`;
- the six accidental non-target session/refresh pairs created during B12 are
  absent;
- rows older than B12 on those two probe accounts were not changed;
- the public partner corpus and private Aster product-state hashes remain
  exact; and
- no credential, JWT, private identifier, timestamp, or row body enters the
  review result.

Use service-role/database reads and anonymous product probes only. Do not use
an owner login as a convenient read path.

## Required Decisions

### 1. Station Guide acceptance

Decide whether the deployed sign-out repair, exact retained-owner cleanup, and
hosted product canary are sufficient to clear PR528C8's original blocker.

### 2. Irreversible audit drift

Classify the advanced `last_sign_in_at` values on the dedicated private-Aster
owner and cross-owner replay probe:

- blocking product/security/privacy damage;
- non-blocking test-audit history that must be recorded honestly; or
- evidence of a narrower defect that needs one numbered repair lane.

Do not propose restoring or guessing historical timestamps. An immutable audit
record is not cleanup residue merely because the test should not have created
it.

### 3. Legacy probe-session backlog

Disposition the pre-existing baseline reported by B12:

| Dedicated probe account | Sessions | Unrevoked refresh tokens |
| --- | ---: | ---: |
| Cross-owner replay probe | `257` | `257` |
| Private Aster owner | `1` | `1` |

Determine whether these controlled test-account sessions:

- must be revoked before the partner rehearsal;
- may be isolated into a separately authorized staging-hygiene backlog lane;
  or
- are required fixtures whose retention is justified and bounded.

If cleanup is required, specify the smallest exact mutation boundary. Do not
perform it in C9.

### 4. Verifier safety

Confirm the replacement B12 verifier is genuinely Auth-read-only. Name the
smallest durable guard needed to prevent future protected-read checks from
silently signing in, if the existing evidence does not already establish one.

## Review Boundary

Allowed:

- read committed source and roadmap evidence;
- inspect Railway deployment identity and health without triggering a deploy;
- read protected Auth/database state through already configured administrative
  access without printing secrets;
- run local Auth tests and API typecheck; and
- add focused tests or a narrow source guard only if review finds a concrete
  product defect.

Forbidden:

- any hosted sign-in or sign-out;
- session, refresh-token, user, identity, profile, corpus, storage, or audit
  mutation;
- legacy private-verifier execution;
- public/private corpus replacement or cleanup;
- provider calls; and
- broad Auth hardening unrelated to the observed lane.

## Verdicts

Use one exact verdict:

```text
ACCEPT_PR528C9_AUTH_SIGNOUT_AND_PROBE_AUDIT_DISPOSITION
```

Use that only if the original Station Guide blocker is cleared and any
remaining probe-account issue is either safely deferred with a concrete lane
or explicitly justified as retained fixture state.

Otherwise use:

```text
BLOCK_PR528C9_<CONCRETE_REASON>
```

Name the smallest numbered unblock lane and its exact mutation boundary.

## Handoff

Commit a public-safe result and wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the read-only PR528C9 disposition of the hosted sign-out fix, irreversible probe audit drift, and legacy probe-session baseline.
Verdict:
- ACCEPT_PR528C9_AUTH_SIGNOUT_AND_PROBE_AUDIT_DISPOSITION
Task:
- Route the accepted exact hosted SHA to ARIADNE, or open only the named smallest unblock lane.
```
