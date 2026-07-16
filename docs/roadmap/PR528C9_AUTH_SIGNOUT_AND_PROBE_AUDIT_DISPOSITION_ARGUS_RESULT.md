# PR528C9 - Auth Sign-Out And Probe Audit Disposition ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Accepted; separate probe-session hygiene required before PR528 closeout

```text
ACCEPT_PR528C9_AUTH_SIGNOUT_AND_PROBE_AUDIT_DISPOSITION
```

## Verdict

PR528C8's original hosted blocker is cleared. The exact accepted Auth repair is
deployed, the retained Station Guide owner remains at zero sessions and zero
unrevoked refresh tokens, and B12's bounded product canary proved that one
deployed `POST /auth/signout` removes its exact session and refresh token before
the signed-out JWT fails `/auth/me` with `401`.

The irreversible `last_sign_in_at` changes on the two dedicated probe accounts
are non-blocking test-audit history. They truthfully record unintended legacy
verifier sign-ins, caused no product-state or privacy damage, and must not be
backdated. The narrower defect is that the legacy protected-read verifier was
not Auth-read-only.

The 258 older probe sessions are not justified fixtures. They may be isolated
from the public partner rehearsal because they belong only to two controlled
test accounts, no B12-created pair remains, and the retained public and private
product state is exact. They still require one separately authorized cleanup
lane before PR528 closes:

```text
PR528B13_DEDICATED_PROBE_SESSION_HYGIENE
```

That lane does not block routing the accepted hosted SHA to ARIADNE.

## Accepted Deployment And Sign-Out

Fresh read-only deployment binding proved:

- API and web are ready on exact accepted SHA
  `67da511fed5c69471516dd3bc03b4ba4614cab54`, branch `main`;
- each Railway service has one active successful deployment bound to that SHA;
- migration readiness remains `025-086` with all seven proofs green;
- current `fork/main` has no later `auth.service.ts` change;
- the accepted and current Auth source Git blobs are identical;
- accepted `auth.service.ts` SHA-256 begins `AC1BB13DFAE7B240`; and
- the deployed implementation is exactly Auth admin
  `signOut(accessToken, "local")`.

Fresh protected Auth reads proved the retained Station Guide owner has:

| Auth scope | Current result |
| --- | ---: |
| Sessions | `0` |
| Active sessions | `0` |
| Unrevoked refresh tokens | `0` |

The protected B12 canary evidence is exact: one product sign-out returned
`204`, removed its one session and one unrevoked refresh token, restored the
owner to zero, and made that JWT receive `401` from `/auth/me`.

## Probe Audit Drift

Both dedicated probe users have `last_sign_in_at` values advanced by B12's
three legacy-verifier executions. This is irreversible Auth audit history, not
live cleanup residue.

Classification:

- blocking product, security, or privacy damage: **no**;
- non-blocking test-audit history that must remain truthful: **yes**;
- narrower defect requiring a guard: **legacy protected reads silently signed
  in**; and
- restoration or guessed backdating authorized: **no**.

The public corpus hash and private Aster product-state hash remain exact. No
profile, corpus, storage, billing, provider, or private conversation state was
changed by the audit-field drift.

## Legacy Probe Baseline

Fresh read-only Auth/database queries rebound the current dedicated-account
baseline exactly:

| Dedicated probe account | Sessions | Active sessions | Unrevoked refresh tokens |
| --- | ---: | ---: | ---: |
| Cross-owner replay probe | `257` | `257` | `257` |
| Private Aster owner | `1` | `1` | `1` |
| **Total** | **`258`** | **`258`** | **`258`** |

Every current row predates the B12 collateral-cleanup boundary. There are zero
session rows and zero refresh-token rows from B12's six accidental pairs.

B12's protected guarded transaction records that the six exact new pairs were
deleted and every older row remained byte-for-byte unchanged. C9 independently
rebound the exact current pre-boundary counts and absence of later rows. It did
not claim a separate cryptographic attestation of the B12 executor or recreate
private row bodies in public evidence.

These rows have no documented fixture requirement. Their smallest cleanup lane
is `PR528B13_DEDICATED_PROBE_SESSION_HYGIENE`, bounded to:

- only the two protected dedicated probe Auth users;
- only their session and refresh-token state;
- one bounded per-owner Auth session only if required to invoke an Auth-admin
  global revocation;
- the resulting truthful `last_sign_in_at` advance if such a sign-in is
  required; and
- exact postflight proof of zero sessions and zero unrevoked refresh tokens for
  both owners, with unrelated Auth and all product state unchanged.

The lane must not mutate users, identities, profiles, corpus rows, storage, or
private Aster state, and it must not guess or restore historical audit values.

## Verifier Safety

Source inspection confirmed the B12 replacement private-Aster verifier uses
service-role database/storage reads and anonymous Discover GETs only:

| Verifier boundary | Result |
| --- | ---: |
| Replacement Auth/session calls | `0` |
| Replacement product writes | `0` |
| Legacy verifier Auth sign-in calls present | Yes |
| Durable committed guard already present | No |

The smallest durable guard is a committed reusable protected-read verifier
with a contract test that rejects Auth/session-producing calls and rejects any
product request other than `GET`. The current corrected verifier is protected
private evidence, so source inspection proves this run but does not provide a
durable CI guard against regression.

## Retained Product State

Fresh read-only checks proved the public partner corpus remains exact:

- one retained Station Guide profile, public Space, published document, and
  linked customized discussion;
- four standard Space pages and two prior document versions;
- zero comments, engagement, moderation rows, explicit Discover rows, or
  public-owner storage objects;
- zero public-owner rows across 51 available forbidden scopes, with two absent
  hosted connector scopes recorded honestly; and
- all seven anonymous public surfaces green, including exact title search,
  canonical body-phrase search, summary feed excerpt, and linked-thread feed
  deduplication.

Fresh service-role/storage and anonymous-read checks also rebound private
Aster's exact protected product-state hash:

- Memory weights remain `1.25`, `1.25`, and `1.5`;
- storage remains `1145` bytes in one exact private object;
- all 46 private-owner forbidden scopes remain zero;
- anonymous Discover leakage remains zero; and
- conversations, provider traces, token transactions, and provider use remain
  zero.

## Validation

| Check | Result |
| --- | --- |
| Read-only hosted ARGUS review | Pass; acceptance verdict produced |
| `node --check .station-private/pr528c9/argus-review.mjs` | Pass |
| `npx --yes pnpm@10.32.1 test:auth` | Pass: `24/24` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass |

The C9 review created or revoked zero hosted sessions, performed zero hosted
product writes, triggered zero deployments, and made zero provider calls. No
credential, JWT, email, private identifier, private timestamp, row body, or
protected-ledger content was printed or committed.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the read-only PR528C9 disposition of the hosted sign-out fix, irreversible probe audit drift, and legacy probe-session baseline.
Verdict:
- ACCEPT_PR528C9_AUTH_SIGNOUT_AND_PROBE_AUDIT_DISPOSITION
Task:
- Route exact accepted hosted SHA 67da511f to ARIADNE, and open PR528B13_DEDICATED_PROBE_SESSION_HYGIENE before PR528 closeout with mutation limited to the two protected probe owners' session/refresh state and any truthful audit advance required by bounded Auth-admin global revocation.
```
