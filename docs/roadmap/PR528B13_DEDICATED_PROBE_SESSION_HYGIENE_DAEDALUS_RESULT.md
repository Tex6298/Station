# PR528B13 - Dedicated Probe Session Hygiene DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Ready for ARGUS review

```text
READY_PR528B13_DEDICATED_PROBE_SESSION_HYGIENE_FOR_ARGUS
```

## Authority And Start Gate

MIMIR released this lane only after ARIADNE completed PR528D. The protected
start gate rebound all of the following before any hosted write:

- PR528D passed `44/44` human route cases on exact hosted SHA `67da511f`;
- ARIADNE's exact fresh rehearsal session was absent after product sign-out;
- ARGUS's accepted PR528C9 read-only review passed again;
- the private Aster and cross-owner replay targets resolved through protected
  local evidence only;
- both target users, identities, profiles, and Auth audit fields were present;
- every non-target Auth table had a protected count/hash snapshot;
- every `public` and `storage` base table had a protected count/hash snapshot;
- the retained Station Guide public corpus passed all seven anonymous reads;
  and
- private Aster Memory and storage state was exact.

No credential, email, protected id, JWT, timestamp, row body, or encrypted
ledger content was printed or committed.

## Exact Session-State Baseline

The accepted PR528C9 headline counted sessions and unrevoked refresh tokens.
The stricter B13 preflight additionally bound historical refresh rotation rows
and session assurance claims:

| Dedicated probe owner | Sessions | Refresh rows | Unrevoked refresh rows | MFA AMR claims |
| --- | ---: | ---: | ---: | ---: |
| Cross-owner replay probe | `257` | `764` | `257` | `257` |
| Private Aster owner | `1` | `1` | `1` | `1` |
| **Total** | **`258`** | **`765`** | **`258`** | **`258`** |

The extra `507` refresh rows were already-revoked rotation records linked to
the same protected sessions. They were session-token state, not Auth user
audit history. Every refresh row linked to its target owner's session, and no
post-B12 accidental session or refresh row remained.

Two early B13 preflight attempts stopped read-only, before mutation:

1. the first refused to equate `258` unrevoked rows with all refresh rows; and
2. the second refused to ignore the `258` session-linked MFA AMR claims.

The final preflight explicitly bound all three exact session-state tables. The
only session foreign-key dependants were `auth.refresh_tokens` and
`auth.mfa_amr_claims`, both with `ON DELETE CASCADE`. There were no orphaned
refresh rows.

## Hosted Cleanup

One guarded Supabase management transaction performed the entire cleanup. It:

- rechecked `257 + 1` target sessions;
- rechecked `257 + 1` unrevoked refresh rows;
- rechecked all `765` target refresh rows;
- rechecked all `258` target MFA AMR claims;
- rejected any orphaned or cross-owner refresh/session link;
- deleted exactly `765` refresh-token rows for the two target users;
- deleted exactly `258` session rows for the two target users;
- allowed the exact `258` linked MFA AMR claims to leave through the declared
  session cascade; and
- proved zero target session and refresh residue before commit.

No fresh Auth session was created. No sign-up, sign-in, refresh, sign-out,
provider call, product write, schema change, migration, or deployment occurred.

## Auth Retention Proof

Fresh protected postflight and a separate independent replay proved:

| Auth scope | Final result |
| --- | ---: |
| Target sessions | `0` |
| Target active sessions | `0` |
| Target refresh rows | `0` |
| Target unrevoked refresh rows | `0` |
| Target MFA AMR claims | `0` |
| Fresh cleanup sessions created | `0` |

The full `auth` schema was hashed before and after. Only the exact target rows
from `auth.sessions`, `auth.refresh_tokens`, and `auth.mfa_amr_claims` were
excluded from the comparison. Every other Auth table remained unchanged,
including:

- both target `auth.users` rows and truthful `last_sign_in_at` values;
- both target identities;
- all unrelated users, identities, sessions, refresh rows, and MFA state; and
- Auth audit-log history.

Both target `public.profiles` rows also remained byte-for-byte unchanged.

## Retained Product State

Every base table in the hosted `public` and `storage` schemas was hashed before
and after the transaction and remained exact.

Station Guide remained unchanged:

- one public owner profile, Space, published document, and customized linked
  discussion;
- four standard Space pages and two prior document versions;
- current document version `3`;
- zero comments, engagement, moderation residue, explicit Discover rows,
  token use, or owner storage;
- exact title and canonical body-phrase search; and
- all seven anonymous public API surfaces green.

Private Aster remained unchanged:

- exact private product-state hash;
- Memory weights `1.25`, `1.25`, and `1.5`;
- storage usage exactly `1145` bytes;
- one exact private storage object with unchanged body hash;
- zero anonymous Discover leakage; and
- no provider, conversation, billing, token, or public-surface mutation.

API and web remained ready on exact accepted hosted SHA `67da511f` throughout.

## Durable Protected-Read Guard

B13 adds a committed reusable boundary:

```text
scripts/protected-read-verifier.mjs
```

The boundary exposes only:

- `productGet`, which rejects every method other than `GET`, rejects GET bodies,
  and rejects Auth-producing product paths; and
- explicitly registered `authRead` helpers, whose names are rejected when they
  describe sign-up, sign-in, OTP verification, refresh, sign-out, session
  creation, session exchange, session update, session revocation, or session
  deletion.

Auth-producing helpers are therefore not silently available inside a
protected-read verifier. B13's private operator used this committed boundary
for all product and Auth-state reads.

Focused tests prove permitted reads, rejected Auth-producing helper names,
rejected non-GET product methods, rejected Auth-producing product paths, and
the requirement to register every Auth read explicitly.

## Validation

| Command | Result |
| --- | --- |
| `node .station-private/pr528b13/operator.mjs verify` | Pass: independent hosted postflight |
| `npx --yes pnpm@10.32.1 test:protected-read-verifier` | Pass: `4/4` |
| `npx --yes pnpm@10.32.1 test:auth` | Pass: `24/24` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass; existing worktree line-ending warning only |

The ignored operator, DPAPI operation ledger, target bindings, full table
hashes, and storage body hash remain protected local evidence only.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed the bounded PR528B13 cleanup for exactly the two dedicated probe owners and proved zero session/refresh residue.
- Exact session state removed was 258 sessions, 765 refresh rows including 258 live rows, and 258 linked MFA AMR claims; every other Auth, public, storage, and retained corpus invariant remained exact.
- The committed protected-read verifier guard passes its focused 4/4 contract test.
Verdict:
- READY_PR528B13_DEDICATED_PROBE_SESSION_HYGIENE_FOR_ARGUS
Task:
- Route ARGUS review before PR528 closeout.
```
