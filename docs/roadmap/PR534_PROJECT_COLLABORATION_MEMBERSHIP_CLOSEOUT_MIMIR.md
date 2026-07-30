# PR534 - Project Collaboration Membership Closeout

Owner: MIMIR / A1

Date: 2026-07-30

Status:

```text
CLOSE_PR534_PROJECT_COLLABORATION_MEMBERSHIP_HOSTED_ACCEPTED
```

## Decision

MIMIR accepts the complete PR534 and PR534A chain. Project collaboration is a
real hosted customer capability, not a source-only promise.

Accepted source review:

`docs/roadmap/PR534_PROJECT_COLLABORATION_MEMBERSHIP_ARGUS_RESULT.md`

Accepted hosted lifecycle review:

`docs/roadmap/PR534A_PROJECT_COLLABORATION_HOSTED_LIFECYCLE_ARGUS_RESULT.md`

## Accepted Product Truth

- A Project owner can invite an existing Station username as a viewer.
- Only the target account can read, accept, or decline its current invitation.
- An active viewer can list and open the bounded Project readback.
- The viewer response is an explicit allow-list and does not inherit owner
  routes or dependent private resources.
- The owner can revoke the viewer, after which fresh list/detail/browser reads
  fail closed without cached access.
- Re-invite, decline, stale invitation, expiry, duplicate owner, dormant role,
  and ownership invariant behavior is bounded and proven.
- Migration `090`, its ledger row, catalog objects, RLS, ACLs, RPC grants,
  PostgREST visibility, and accepted Railway deployment identity are proven.
- The disposable hosted lifecycle was cleaned to zero residue and the retained
  product/Auth/schema baseline remained stable.

## Boundaries Kept

PR534 does not claim editor, admin, billing, institutional, delegated export,
Project-owned content mutation, Space ownership, Developer Space operation,
custom domains, analytics, shared private archives, or private user-data
access. Dormant role labels do not confer authority.

## Next Lane

Per the feature-expansion rule, the next lane is a different named Phase 3
capability rather than deeper Project permissions:

```text
PR535 - Institutional Spaces Foundation Preflight
Owner: ARGUS / A3
```

The preflight must use PR534 as authorization evidence while deciding an
explicit institution principal, ownership, membership, public identity, and
privacy boundary. It must not rename Project collaboration as institutional
support.
