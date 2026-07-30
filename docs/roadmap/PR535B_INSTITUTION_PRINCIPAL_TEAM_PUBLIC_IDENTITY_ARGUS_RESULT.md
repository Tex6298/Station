# PR535B Institution Principal, Team, And Public Identity - ARGUS Result

Owner: ARGUS / A3 -> DAEDALUS / A2 -> ARGUS / A3 -> MIMIR / A1

Date completed: 2026-07-30

Corrected source: `6f33f9d2c5d267ca2879bdb9c9175663bf22e5ab`

Verdict:

```text
ACCEPT_PR535B_INSTITUTION_PRINCIPAL_TEAM_PUBLIC_IDENTITY_SOURCE_ONLY_WITH_ARGUS_PATCH
```

## Verdict

ARGUS accepts corrected PR535B source-only. Migration `092` now fails closed on
the inherited profile-privilege drift reproduced in the first review, while
the institution principal, lifecycle, audit, owner/admin/member authority,
private/public serializers, four web surfaces, and zero-existing-resource
inheritance remain within the frozen lane and pass independent review.

This is not hosted acceptance. Migration `092` is unapplied, there is no hosted
institution fixture or ledger row, and no deployed runtime was changed. Under
Marty's terminal instruction, MIMIR should record a truthful source-only
PR535B closeout and stop; no hosted follow-on or successor lane is authorized.

## Resolved Finding

The first ARGUS review proved that submitted migration `092` inspected only
selected direct profile grants. A full-profile reader role inherited by
`authenticated` was invisible to that check, so the migration committed while
effective own-row projection of private Stripe/provider-key columns remained.

DAEDALUS corrected only that guard and its proof:

1. Preflight now requires the exact direct migration-`091` profile ACL: seven
   trusted-service table grants and seventy column grants consisting only of
   six browser authority SELECT grants plus sixty-four trusted-service grants.
2. Independent effective checks require `anon` and `authenticated` to have no
   table-wide profile privilege, no profile mutation privilege, and SELECT on
   only `id`, `tier`, and `is_admin`.
3. Trusted `service_role` must retain every expected effective table and
   column privilege.
4. The same direct and effective assertions run again in postassert.
5. All preflight checks occur before `public.institutions` or any other
   institution object is created.

ARGUS reran the original disposable PostgreSQL repro against the corrected
exact bytes. The accepted `0/6/7/64` profile ACL applies successfully. With the
inherited full-profile reader present, migration `092` now raises the expected
effective-browser-ACL error, rolls back, and leaves `public.institutions`
absent. No hosted state was touched.

## Accepted Database Boundary

Independent exact-migration execution confirms:

- exactly `institutions`, `institution_members`, and
  `institution_audit_events` are added;
- all three tables have RLS enabled, zero browser policy, and zero effective
  browser table privilege;
- the sole immutable owner is `institutions.owner_user_id`; an owner membership
  row is rejected and the only member role is `member`;
- six fixed-search-path definer transitions are executable by `service_role`
  and denied to browser roles;
- admin provision/verification, owner publication/invitation/revocation, and
  exact-target response authority are revalidated in the database;
- institution-before-member locking, database-clock expiry, stale removal,
  fresh re-invite, verification/publication coupling, and typed audit writes
  pass;
- direct identity mutation and direct audit update/delete fail; and
- parent institution cleanup cascades successfully with zero institution,
  membership, or audit residue.

The migration changes no existing policy, relation, entitlement, serializer,
route, ownership check, or row and adds no `institution_id` to an existing
table.

## Accepted API And Web Boundary

Source and focused execution confirm:

- public routing is registered before authentication and dynamic routes;
- private responses are `private, no-store` and public identity is `no-store`;
- private access is exact owner or active member, admin reads use fresh
  authoritative profile state, and invitation response is exact target only;
- public identity returns only name, slug, nullable summary, and literal
  `verified: true` for verified/public rows;
- owner/team/admin DTOs contain only the frozen fields and never expose raw ids,
  email, billing/provider state, private profile fields, member lists to admin,
  removed rows, or audit actors;
- submitted usernames and service errors are not echoed;
- the member branch renders no owner controls and requests only the bounded
  institution team endpoint; and
- no Project, Space, Developer Space, document, export, billing, provider,
  credential, storage, moderation, or other existing-resource query was added.

ARGUS's narrow review patch remains accepted: the private index says
`Institution identities`, not `Verified organisations`, because it correctly
lists unverified and revoked principals. The focused regression locks that
claim boundary.

## Validation

| Command / proof | ARGUS result |
| --- | --- |
| Corrected migration SHA-256 | `B923C9EAB0AEADADBA8D16D9250FE1AC42307CE5A51191F48119B0101042A7C3` |
| Disposable exact-migration PostgreSQL hostile audit | Pass; `3` tables, `0` browser policies/grants, `11` denials, `9` events, residue `0` |
| Disposable inherited full-profile reader regression | Pass; migration rejected, `public.institutions` absent |
| `npm exec --yes pnpm@10.32.1 -- run test:institutions` | Pass, `14/14` |
| `npm exec --yes pnpm@10.32.1 -- run test:profile-boundary` | Pass, `5/5` |
| `npm exec --yes pnpm@10.32.1 -- run test:auth` | Pass, `24/24` |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass, `31/31` |
| `npm exec --yes pnpm@10.32.1 -- run test:spaces` | Pass, `11/11` |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass, `61/61` |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass, `35/35` |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass, `57/57` |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass, `15/15` |
| API and web typecheck; web lint | Pass; zero lint warnings/errors |
| Exact correction changed paths | Pass; migration, focused test, and public-safe status evidence only |
| Committed sensitive-value scan; `git diff --check` | Pass; `0` hits / clean |
| Hosted migrations / writes / fixtures / deployments | `0 / 0 / 0 / 0` |

The disposable PGlite package and ARGUS harness remain outside committed
dependencies and ignored local evidence. No real profile value, credential,
token, email, private identifier, or connection value was emitted.

## Baton

MIMIR should close PR535B as source-only accepted with migration `092`
explicitly unapplied, then record the terminal lane state required by Marty.
Do not open a hosted proof, deployment, hardening, cleanup, successor feature,
or new roadmap lane. Return all agents to foreground waiting for explicit
instruction.
