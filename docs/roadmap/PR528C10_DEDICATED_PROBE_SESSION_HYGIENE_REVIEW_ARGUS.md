# PR528C10 - Dedicated Probe Session Hygiene Review

Owner: ARGUS / A3

Date opened: 2026-07-16

Status: Open for hostile read-only review

```text
OPEN_PR528C10_DEDICATED_PROBE_SESSION_HYGIENE_REVIEW
```

## Purpose

Independently review PR528B13's exact two-owner Auth-session cleanup and the
new committed protected-read verifier guard before PR528 closes.

This is a read-only review. The two target owners are already at zero. Do not
create a session, repeat cleanup, run the retired verifier, mutate either
corpus, or trigger a deployment.

## Submitted Hosted Result

DAEDALUS reports the protected baseline contained:

| Session state | Removed |
| --- | ---: |
| Sessions | `258` |
| Refresh-token rows | `765` |
| Unrevoked refresh-token rows within that total | `258` |
| Session-linked MFA AMR claims | `258` |

All rows belonged to exactly the dedicated cross-owner replay probe and private
Aster owner. No fresh cleanup session was created. The transaction deleted the
exact target refresh rows and sessions, allowed only declared session cascades
to remove linked MFA AMR claims, and retained both users, identities, profiles,
and truthful Auth audit history.

## Required Hosted Review

Using only protected administrative/database reads:

1. prove both target owners have zero sessions, zero refresh-token rows, zero
   unrevoked refresh-token rows, and zero MFA AMR claims;
2. prove both target users, identities, profiles, and current truthful audit
   fields remain present;
3. inspect the protected B13 before/after evidence for exact target ownership,
   refresh/session linkage, declared foreign-key cascades, and absence of
   orphan or cross-owner rows;
4. prove unrelated Auth users, identities, sessions, refresh rows, MFA state,
   and audit history remain unchanged;
5. prove every hosted `public` and `storage` base-table invariant remains exact;
6. rebind the complete Station Guide public chain and all seven anonymous
   public surfaces; and
7. rebind private Aster's product-state hash, Memory weights, `1145` storage
   bytes, one private object, zero leakage, zero provider use, and zero private
   forbidden residue.

Do not expose credentials, email addresses, protected identifiers, private
timestamps, row bodies, or ledger contents in the result.

## Guard Review

Review:

- `scripts/protected-read-verifier.mjs`;
- `scripts/protected-read-verifier.test.mjs`; and
- `test:protected-read-verifier` in `package.json`.

Hostile questions:

- Does `productGet` reject every non-GET method, any request body, and known
  Auth-producing product paths before transport?
- Are Auth reads unavailable unless explicitly registered and named?
- Do obvious sign-up, sign-in, OTP, refresh, sign-out, session create/exchange/
  update/revoke/delete names fail closed regardless of punctuation or case?
- Can a normal protected verifier accidentally reach the raw Auth client or
  write transport through the returned object?
- Is the guard's stated boundary honest about deliberate misuse of a
  misleadingly named registered callback rather than claiming sandbox-level
  enforcement?
- Is the helper reusable without importing credentials, target ids, private
  state, or ignored operator code?

Patch only a concrete guard defect found in review. Do not broaden C10 into a
general test-harness or Auth redesign.

## Validation

At minimum run:

```text
npx --yes pnpm@10.32.1 test:protected-read-verifier
npx --yes pnpm@10.32.1 test:auth
npx --yes pnpm@10.32.1 --filter @station/api typecheck
git diff --check
```

If review patches source/tests, rerun the focused suite after the patch.

## Verdict

Accept with:

```text
ACCEPT_PR528C10_DEDICATED_PROBE_SESSION_HYGIENE
```

Block with:

```text
BLOCK_PR528C10_<CONCRETE_REASON>
```

Any blocker must name the smallest exact follow-up. PR528 has already passed
its human rehearsal; do not reopen unrelated product/UI work.

## Handoff

Commit a public-safe result and wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR528C10 hostile review of the exact two-owner session cleanup and protected-read verifier guard.
Verdict:
- ACCEPT_PR528C10_DEDICATED_PROBE_SESSION_HYGIENE
Task:
- Close PR528 and provide Marty the one-screen partner route checklist and hosted URL.
```
