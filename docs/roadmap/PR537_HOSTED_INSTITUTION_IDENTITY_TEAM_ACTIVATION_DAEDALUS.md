# PR537 - Hosted Institution Identity And Team Activation

Owner: DAEDALUS / A2

Date opened: 2026-07-31

Status:

```text
OPEN_PR537_HOSTED_INSTITUTION_IDENTITY_TEAM_ACTIVATION
```

## Authority

PR536 fixes Institutional Alpha as the complete customer programme. PR537 is
its first executable slice. PR535B source was accepted by ARGUS at
`26f5375ee1bda6db556fcf4911fd946593c597a4`; this lane activates that exact
foundation rather than redesigning or expanding it.

## Hosted Contract

1. Revalidate the accepted migration `092` SHA-256
   `B923C9EAB0AEADADBA8D16D9250FE1AC42307CE5A51191F48119B0101042A7C3`,
   migration `091` profile ACL, current migration ledger, and ready Railway
   API/web source before mutation. Stop before writes on drift.
2. Apply exact migration `092` once, add exactly one migration ledger row, and
   prove the three institution relations, six service RPCs, RLS, browser ACL,
   immutable principal/member constraints, and append-only audit guards.
3. Deploy the accepted institution API/web source and prove Railway web/API
   health and executable source identity. Documentation-only commits after the
   accepted source do not change executable identity.
4. Use existing protected-alpha configuration and server-side credentials
   without printing them. Provision and retain one clearly labelled staging
   Institution, verify it, assign its existing owner, invite one distinct
   member, accept the invitation, and publish the identity.
5. Prove owner team readback, member bounded team readback, owner management,
   admin verification, and signed-out public identity. Prove invited, removed,
   unrelated, anonymous-private, unverified, revoked, malformed, stale, and
   cross-owner cases fail with the accepted bounded semantics.
6. Leave the retained Institution and active member in the exact safe state
   needed by PR538. Remove disposable negative-control users and rows, and
   prove no unrelated Auth/profile/session/resource/catalog drift.
7. Record only public-safe names, statuses, counts, hashes, timestamps, route
   classes, and deployment identities. Do not record credentials, raw tokens,
   database URLs, private emails, raw user ids, or private profile values.

## Validation

- Run `test:institutions`, `test:profile-boundary`, auth, Projects, Spaces,
  Developer Spaces, writing, community, exports, API/web typechecks, and web
  lint against the exact working source.
- Prove migration/ledger idempotence and a fresh PostgREST catalog read.
- Exercise the lifecycle through Station API routes, not direct table writes,
  except for value-free catalog/security inspection and authorized cleanup.
- Capture an encrypted/private operator journal for any sensitive fixture
  bindings; commit only the sanitized result.

## Boundaries

PR537 adds no Institution-owned Project, publication, Space, community, audit
readback, custom branding, billing, provider, or personal-resource access.
Those remain globally numbered PR538-PR542 slices under PR536. Do not broaden
the accepted member role or use membership as authority over existing rows.

## Handoff

Commit the hosted proof and public-safe result, then wake A3 ARGUS for an
independent exact-migration, deployment, lifecycle, privacy, retained-fixture,
and no-drift review. Wake MIMIR only on a concrete stop condition that cannot be
resolved inside this exact activation contract.
