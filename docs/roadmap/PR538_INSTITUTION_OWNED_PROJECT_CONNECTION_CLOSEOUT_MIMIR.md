# PR538 - Institution-Owned Project Connection Closeout

Owner: MIMIR / A1

Date closed: 2026-07-31

Status:

```text
CLOSE_PR538_INSTITUTION_OWNED_PROJECT_CONNECTION_ACCEPTED
```

## Decision

PR538 is accepted and closed. Migration `093` is applied and ledgered exactly
once, corrected source `a2b8c8597e82adbf06b3552906b36748fc734a29` is ready
on both Railway services, and `Station Institutional Alpha` solely owns one
retained public Project without a hidden human owner or Project owner row.

The Institution owner has management access, its active member has explicit
read-only access, hostile membership states remain denied, and signed-out
visitors receive only the routeable public Project plus bounded verified
Institution attribution. Existing personal Project owner/viewer behavior and
all four retained personal Projects remain intact.

## Accepted Principal Contract

- `projects.owner_user_id` and `projects.institution_id` form an exact XOR.
- Existing personal owner ids were not rewritten.
- Personal Projects retain exactly one matching active Project owner member.
- Institution Projects have zero Project owner members; Institution owner and
  active-member authority derive only from the Institution principal.
- Both principal columns are immutable and the Institution foreign key uses
  `RESTRICT`, so organisation work cannot silently cascade away.
- The create transition is service-only. Browser RPC authority is zero.

Migration `093_institution_owned_projects` has version `20260731150001`, SHA-256
`E95DB00E8A1D1AA706C69123B222D6C20EFABF96E492D183BAF3359947EFF435`,
and one exact ledger receipt.

## Corrected Public Boundary

MIMIR's first review rejected three bounded defects in the initial deployed
source `bb5674cf`:

1. Discover could list a public Institution Project after its Institution was
   revoked/private, producing a public dead link.
2. one Project serializer inherited a raw `id` outside its declared
   Institution Project allowlist; and
3. the Institution Project visibility control swallowed mutation feedback.

DAEDALUS corrected all three at `a2b8c859`. Discover now admits Institution
Projects only for verified/public principals and fails those rows closed on
principal lookup error while preserving personal public Projects. Institution
Project list/detail DTOs are exact. The visibility control renders bounded
success and error feedback.

Hosted revocation removed the retained Project from Discover and returned
`404` from its public route while owner private access remained `200`.
Restoration and publication restored both public paths. That correction cycle
added the expected append-only `verification_revoked`,
`verification_granted`, and `published` events; the retained Institution audit
total is now `21`, all explained.

## Review Basis

ARGUS was woken by DAEDALUS at `34f0d48f`, retried by MIMIR at `9eb740b5`, and
woken again with the correction at `7e725fe0`, but did not consume the handoff.
This closeout does not claim an ARGUS verdict.

Independent acceptance is instead MIMIR's direct source and hosted review:

- MIMIR found and blocked the three defects above rather than accepting the
  first result;
- DAEDALUS supplied the bounded correction and hosted proof;
- MIMIR reviewed the exact `951bce2f..a2b8c859` diff;
- MIMIR restarted the read-only hosted verifier and confirmed exact source,
  schema, ledger, retained principal, row counts, authority restoration, and
  zero tagged residue; and
- MIMIR reran `test:projects` (`33/33`), `test:institutions` (`16/16`), and
  `test:community` (`57/57`) against the correction.

## Hosted End State

- one retained verified/public Institution and one active retained member;
- one retained public Institution Project and four personal Projects;
- owner/member/private/public role and route behavior exact;
- invalid principals `0`, Institution Project owner rows `0`;
- tagged Auth users, profiles, and memberships `0`;
- retained owner admin authority false; and
- API and web ready at exact source `a2b8c859`.

## Boundary And Baton

PR538 does not claim institution-owned writing, branded Space aggregation,
community presence, or owner audit readback. PR539 now opens collaborative
Institution publishing on the retained Institution Project. It must preserve
organisation ownership and explicit human attribution without reclassifying
personal Station documents.
