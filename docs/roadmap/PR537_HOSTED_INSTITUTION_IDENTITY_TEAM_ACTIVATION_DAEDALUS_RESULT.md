# PR537 Hosted Institution Identity And Team Activation - DAEDALUS Result

Owner: DAEDALUS / A2 -> ARGUS / A3

Date completed: 2026-07-31

Status:

```text
READY_PR537_HOSTED_INSTITUTION_IDENTITY_TEAM_ACTIVATION_FOR_ARGUS
```

## Decision

PR537 is ready for independent review. The accepted migration `092` is present
and ledgered exactly once, corrected accepted source is live on both Railway
services, and one protected-alpha institution is retained as verified/public
with its existing owner and one distinct existing active member.

Owner, member, and anonymous public readback pass. Invited, removed, unrelated,
anonymous-private, unverified, revoked, malformed, stale, and cross-owner cases
were exercised with bounded outcomes. Disposable rows and users are zero; the
retained fixture is the exact identity/team state required by PR538.

## Serialized Schema Checkpoint

MIMIR completed an exact zero-row takeover apply while DAEDALUS was preparing
the first preflight. DAEDALUS stopped before writing when the three relations
appeared, then adopted the checkpoint only after proving:

- migration SHA-256
  `B923C9EAB0AEADADBA8D16D9250FE1AC42307CE5A51191F48119B0101042A7C3`;
- corrected accepted executable source
  `6f33f9d2c5d267ca2879bdb9c9175663bf22e5ab`;
- exactly one ledger row, with version `20260731121001`, name
  `092_institution_principal_team_public_identity`, creator
  `MIMIR_PR537_TAKEOVER`, and the accepted path/hash/source/idempotency receipt;
- exactly `3` institution relations and `0/0/0` institution/member/audit rows;
- exact migration `091` predecessor and `0/6/7/64` browser/service profile ACL;
- zero active hosted writers; and
- healthy API/web Railway deployments on `main` at the same accepted source.

DAEDALUS did not apply a second migration or add a second ledger row. Fresh
catalog proof found RLS on all three relations, zero browser policies/table
grants, six service RPCs, zero browser RPC authority, five guard triggers, and
the accepted constraint set. Fresh PostgREST returned `401` for anonymous raw
institution access and `200` for service access.

## Retained Hosted State

The retained public-safe fixture is:

| Field | Result |
| --- | --- |
| Name | `Station Institutional Alpha` |
| Slug | `station-institutional-alpha` |
| Verification | `verified` |
| Publication | `public` |
| Institution rows | `1` |
| Active member rows | `1` |
| Audit events | `12` |
| Owner team readback | HTTP `200` |
| Member bounded team readback | HTTP `200` |
| Signed-out public identity | HTTP `200` |

The public response contained only `name`, `slug`, nullable `summary`, and
literal verified state. It exposed no raw ids, owner/member records, email,
billing/provider fields, audit actors, tokens, or private profile values.

## Lifecycle And Hostile Proof

Provision, verification, invitation, invitation response, publication,
verification revocation/restoration, and final publication used Station API
routes. The existing member moved through unrelated, invited, stale, removed,
freshly invited, and active states; this kept retained audit references bound
only to the two retained identities.

Migration `092` correctly prevents changing invitation creation/expiry identity
after insert. To produce a deterministic hosted stale case without waiting
seven days, the disposable invited row was replaced once in a management
transaction by the same identity with internally consistent pre-aged
timestamps. The stale response and removal then ran through the Station API.
This narrow temporal fixture setup is explicit for ARGUS review; no product row
outside the institution boundary was written by it.

The configured member has a legacy 31-character username while the accepted
invitation contract permits at most 30. The same profile was temporarily bound
to a unique valid invitation alias, then restored exactly after acceptance.
The existing owner was temporarily granted admin authority for provisioning
and verification, then restored exactly. Final profile authority hashes,
username, and admin state match; only the two expected automatic profile
`updated_at` timestamps advanced. No private value is recorded here.

Final cleanup removed the disposable cross-owner institution and every removed
negative membership row. It left zero tagged Auth users, zero disposable
institutions, zero non-active retained memberships, and no proof-session count
drift. Non-target row-count and catalog fingerprints returned to their exact
pre-run values.

## Validation

| Command or proof | Result |
| --- | --- |
| Hosted preflight/schema/ledger/PostgREST | Pass; one exact ledger row, `3` relations, `6` service RPCs, browser raw access denied |
| Hosted lifecycle and hostile matrix | Pass; retained `1` institution / `1` active member, residue `0` |
| Fresh restarted hosted verifier | Pass; owner/member/public `200`, ledger `1`, source and deployment exact |
| `npm exec --yes pnpm@10.32.1 -- install --frozen-lockfile` | Pass |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass; zero warnings/errors |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass; API and web |
| `test:institutions` | Pass, `14/14` |
| `test:profile-boundary` | Pass, `5/5` |
| `test:auth` | Pass, `24/24` |
| `test:projects` | Pass, `31/31` |
| `test:spaces` | Pass, `11/11` |
| `test:developer-spaces` | Pass, `61/61` |
| `test:writing` | Pass, `35/35` |
| `test:community` | Pass, `57/57` |
| `test:exports` | Pass, `15/15` |
| Root build | Source compiled, linted/typechecked, generated `42/42` pages, optimized, and collected traces; then reproduced the known local Windows standalone symlink `EPERM` during traced-file copy |

The operator and all credentials, ids, tokens, profile values, and detailed
journal remain DPAPI-encrypted under ignored `.station-private/pr537`. No
product source or visible UI changed in this result commit.

## Boundary And Baton

PR537 adds no institution-owned Project, publication, Space, community,
audit-readback UI, branding, billing, provider, or personal-resource authority.
Those remain later PR536 slices.

ARGUS should independently review the exact takeover ledger identity, migration
catalog/ACL shape, accepted Railway source, retained owner/member/public state,
temporal stale-fixture setup, restored profile authority, disposable cleanup,
and validation evidence. If accepted, wake MIMIR for PR537 closeout and PR538
sequencing. If a correction is required, wake DAEDALUS with the exact finding.
