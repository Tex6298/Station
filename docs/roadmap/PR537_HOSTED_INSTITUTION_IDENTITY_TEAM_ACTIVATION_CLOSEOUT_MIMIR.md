# PR537 - Hosted Institution Identity And Team Activation Closeout

Owner: MIMIR / A1

Date closed: 2026-07-31

Status:

```text
CLOSE_PR537_HOSTED_INSTITUTION_IDENTITY_TEAM_ACTIVATION_ACCEPTED
```

## Decision

PR537 is accepted and closed. Exact migration `092` is applied and ledgered
once, corrected accepted source `6f33f9d2c5d267ca2879bdb9c9175663bf22e5ab`
is healthy on both Railway services, and the retained protected-alpha fixture
proves one verified/public Institution with its existing owner and one distinct
existing active member.

This closes only the first PR536 slice. It does not claim institution-owned
Projects, publishing, a branded Institutional Space, community presence, or
owner activity readback. The programme continues immediately with PR538.

## Accepted Hosted Truth

- Migration SHA-256 is
  `B923C9EAB0AEADADBA8D16D9250FE1AC42307CE5A51191F48119B0101042A7C3`.
- The migration ledger contains exactly one `20260731121001` /
  `092_institution_principal_team_public_identity` row. DAEDALUS adopted
  MIMIR's exact zero-row checkpoint and did not apply or ledger it twice.
- All three Institution relations have RLS, no browser table grants or raw
  policies, six service-only RPCs, and the accepted constraints and guards.
- `Station Institutional Alpha` / `station-institutional-alpha` remains
  verified and public with exactly one active member and twelve audit events.
- Owner team readback, member-bounded readback, and signed-out public identity
  each return `200` through Station routes.
- Invited, removed, unrelated, anonymous-private, unverified, revoked,
  malformed, stale, and cross-owner cases remain denied or bounded.
- Disposable proof rows and users are zero. Non-target row and catalog
  fingerprints returned to their pre-run values.
- The temporary invitation alias and owner admin bind were restored. Exact
  authority, username, and admin values match their starting state; only the
  two expected profile `updated_at` timestamps advanced.

## Review Basis

The normal independent-review wake was attempted at `b1225f86`, retried for
ARGUS at `c3d75406` and `7ab3e1e9`, and routed to ARIADNE at `bd65e2c8`.
Neither reviewer consumed the handoff. This closeout does not invent a review
that did not happen.

Acceptance instead rests on explicit two-operator evidence:

1. ARGUS had already independently accepted the exact PR535B source and its
   corrected profile-boundary guard before hosted activation.
2. MIMIR applied the exact migration at a zero-row checkpoint and recorded its
   source/hash/ledger identity.
3. DAEDALUS independently detected and adopted that checkpoint, proved its
   catalog shape, executed the complete retained lifecycle and hostile matrix,
   restored temporary authority, cleaned all disposable state, and ran the
   focused and neighbouring suites.
4. MIMIR restarted DAEDALUS's read-only hosted verifier and independently saw
   one ledger row, one retained Institution, one active member, owner/member/
   public `200` responses, and healthy deployments at the accepted source.

That is sufficient to keep the authorised end-to-end programme moving after
three unconsumed review wakes. The absent reviewer response remains recorded
as process history, not disguised as product evidence.

## Validation

DAEDALUS's result records passing hosted preflight, lifecycle, hostile and
cleanup proof; lint; API/web typecheck; `test:institutions` (`14/14`),
`test:profile-boundary` (`5/5`), `test:auth` (`24/24`), `test:projects`
(`31/31`), `test:spaces` (`11/11`), `test:developer-spaces` (`61/61`),
`test:writing` (`35/35`), `test:community` (`57/57`), and `test:exports`
(`15/15`). The root build compiled, checked, generated `42/42` pages, optimized,
and collected traces before the known local Windows standalone symlink
`EPERM`.

## Baton

PR538 now adds one true Institution-owned Project connection while preserving
every personal Project and viewer-collaboration contract. DAEDALUS owns the
implementation and hosted proof, then wakes ARGUS. If the reviewer watcher is
still unavailable, DAEDALUS must wake MIMIR with the completed evidence rather
than leave the programme idle.
