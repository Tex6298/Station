# PR528C10 - Dedicated Probe Session Hygiene Review ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Accepted after narrow protected-read guard patch

```text
ACCEPT_PR528C10_DEDICATED_PROBE_SESSION_HYGIENE
```

## Verdict

PR528B13 removed the exact dedicated-probe session state it was authorized to
remove. Fresh independent protected reads prove both target owners now have
zero sessions, zero refresh-token rows, zero unrevoked refresh-token rows, and
zero linked MFA AMR claims. Both users, identities, profiles, and truthful Auth
audit fields remain exact, as do every unrelated Auth row and every hosted
`public` and `storage` base table.

ARGUS found and patched two concrete fail-open cases in the committed
protected-read guard. The original guard accepted obvious verb-after-session
names such as `session.create`, and it accepted percent-encoded Auth product
paths such as `/auth/%73ignin`. The narrow patch rejects both forms before any
registered reader or product transport can run and extends the existing
focused four-test contract.

## Protected Cleanup Evidence

The DPAPI-protected B13 operation ledger and public-safe receipt agree on:

| Exact target session state | Removed |
| --- | ---: |
| Sessions | `258` |
| Refresh-token rows | `765` |
| Unrevoked refresh-token rows within that total | `258` |
| Session-linked MFA AMR claims | `258` |

The protected baseline binds exactly two distinct owners: the dedicated
cross-owner replay probe and the private Aster owner. It records `257 + 1`
sessions, `764 + 1` refresh rows, `257 + 1` unrevoked rows, `257 + 1` linked
MFA claims, and zero orphan or cross-owner refresh/session links.

The guarded transaction deleted refresh rows by those two protected owners,
deleted sessions by those same owners, and relied only on declared session
foreign-key cascades. Fresh schema inspection proves the only two dependants
of `auth.sessions` are:

- `auth.refresh_tokens.session_id`, `ON DELETE CASCADE`; and
- `auth.mfa_amr_claims.session_id`, `ON DELETE CASCADE`.

The operation ledger is protected evidence, not a cryptographic attestation of
the executor. C10 therefore rebound the hosted result independently rather
than treating the handoff summary as proof.

## Current Auth State

Fresh protected database reads produced:

| Target scope | Cross-owner probe | Private Aster owner |
| --- | ---: | ---: |
| Sessions | `0` | `0` |
| Active sessions | `0` | `0` |
| Refresh-token rows | `0` | `0` |
| Unrevoked refresh-token rows | `0` | `0` |
| Linked MFA AMR claims | `0` | `0` |
| Orphan or cross-owner refresh rows | `0` | `0` |

For each target, the current full `auth.users` hash, identity hash/count, and
profile hash/count match the protected pre-cleanup values. This includes the
truthful `last_sign_in_at` audit fields, which were not rewritten.

A fresh full `auth` base-table snapshot, excluding only the exact target rows
that B13 was authorized to remove, hashes identically to the protected
preflight snapshot. This rebinds every unrelated user, identity, session,
refresh row, MFA row, and Auth audit record as unchanged. It also proves no
target MFA claim survived as an orphan after its session cascade.

## Hosted Product State

A fresh full snapshot of every hosted `public` and `storage` base table hashes
identically to B13's protected preflight snapshot.

Station Guide remains exact:

- zero sessions and zero unrevoked refresh tokens;
- one retained profile, public Space, published document, and customized
  linked discussion;
- four standard Space pages and two prior document versions;
- zero comments, engagement, moderation residue, explicit Discover rows,
  token use, or owner storage;
- zero owner residue across 51 available forbidden scopes, with two absent
  connector scopes recorded honestly; and
- all seven anonymous surfaces green, including exact title search, canonical
  body-phrase search, summary feed excerpt, and linked-thread deduplication.

Private Aster also remains exact:

- the full protected product-state hash is unchanged;
- Memory weights remain `1.25`, `1.25`, and `1.5`;
- storage remains `1145` bytes with one exact private object;
- all 46 private-owner forbidden scopes remain zero;
- anonymous Discover leakage remains zero; and
- conversations, provider traces, token transactions, and provider use remain
  zero.

## Deployment Identity

B13's private replay still hard-coded accepted Auth SHA `67da511f`, so its
`verify` command stopped at `api_deployment_sha_mismatch` after the later B13
commit was automatically deployed. It did not report a state mismatch and did
not perform a hosted write.

C10 independently rebound the current deployment instead of suppressing that
failure:

- API and web are ready on exact hosted SHA `577d6085`, branch `main`;
- both Railway service identities match their one active successful
  deployment;
- migration readiness remains `025-086` with all seven proofs green; and
- every path changed from accepted Auth SHA `67da511f` to hosted SHA
  `577d6085` is roadmap/state evidence, the protected-read guard and test, or
  the one root package test-script entry.

After removing `test:protected-read-verifier` from the later `package.json` in
memory, the root package manifests are structurally identical. No application,
package, dependency lock, schema, migration, or deployment configuration
changed. The live product runtime is therefore source-equivalent to accepted
Auth SHA `67da511f` while honestly reporting its current deployment identity.

## Guard Review And Patch

The original guard correctly rejected direct non-GET methods, GET bodies,
literal product Auth routes, verb-first Auth mutation names, and unregistered
Auth readers. It also returned a frozen object exposing only `productGet` and
`authRead`.

Hostile review found two bypasses:

1. `session.create`, `session/update`, `session revoke`, and equivalent
   verb-after-session forms did not match the verb-first denylist.
2. Encoded paths including `/auth/%73ignin`, `/auth%2fsignin`, and double-
   encoded equivalents passed the literal pathname regex.

The patch:

- rejects session mutation names by semantic presence of both `session` and a
  create, set, update, delete, revoke, or exchange verb, regardless of order,
  punctuation, or case;
- rejects OTP mutation names in either word order;
- repeatedly decodes bounded path encodings, normalizes slash and dot
  segments, and rejects encoded Auth-producing routes before transport; and
- tests that the returned capability object is frozen and exposes no raw Auth
  client.

The guard is an accidental-mutation capability boundary, not a sandbox.
Explicitly registered callbacks remain trusted code; a deliberately
misleading callback can still mutate. The source now states that limitation
directly and this result makes no stronger claim.

## Validation

| Check | Result |
| --- | --- |
| Independent C10 hosted read-only review | Pass; acceptance verdict produced |
| `node .station-private/pr528b13/operator.mjs inspect` | Pass; exact zero residue and two declared cascades |
| `node --check .station-private/pr528c10/argus-review.mjs` | Pass |
| `npx --yes pnpm@10.32.1 test:protected-read-verifier` | Pass: `4/4` after patch |
| `npx --yes pnpm@10.32.1 test:auth` | Pass: `24/24` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass; existing state-file line-ending warnings only |

C10 created or revoked zero hosted sessions, performed zero hosted product
writes, triggered zero manual deployments, and made zero provider calls. No
credential, JWT, email, protected identifier, private timestamp, row body, or
encrypted-ledger content was printed or committed.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR528C10 hostile review of the exact two-owner session cleanup and protected-read verifier guard.
- Both dedicated probe owners are at zero session, refresh, and MFA residue with target retention and every unrelated Auth/public/storage invariant exact.
- ARGUS patched encoded Auth-path and verb-after-session guard bypasses; the focused contract remains 4/4 and the boundary is explicitly not a sandbox.
Verdict:
- ACCEPT_PR528C10_DEDICATED_PROBE_SESSION_HYGIENE
Task:
- Close PR528 and provide Marty the one-screen partner route checklist and hosted URL.
```
