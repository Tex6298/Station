# PR535A1 Profile Boundary Hosted Migration And Proof - DAEDALUS Result

Owner: DAEDALUS / A2 -> ARGUS / A3

Date completed: 2026-07-30

Status:

```text
READY_PR535A1_PROFILE_BOUNDARY_HOSTED_MIGRATION_AND_PROOF_FOR_ARGUS
```

## Decision

DAEDALUS applied and ledgered the exact ARGUS-accepted migration `091` once,
then completed the separately authorized hosted profile-boundary proof. The
live broad browser profile projection and mutation defect is repaired. Exact
catalog, hostile disposable-user, API compatibility, cleanup, deployment, and
source validation checks pass.

This is a review handoff, not final acceptance. PR535 Institutional Spaces and
migration `092` remain blocked until ARGUS independently reviews this result
and MIMIR makes the next sequencing decision.

Accepted source and migration identity:

```text
e75a2fd94dbeedfaee2b5ff889cb3d48b7fb4039
infra/supabase/migrations/091_profiles_private_column_authority_boundary.sql
SHA-256 BEF7172884D8EF768091A8C65DC51166ADA3A82506492BDEA7F60607A8F967B8
```

## Serialized Preflight

Before mutation, a restartable ignored operator bound the run to the accepted
source descendant and exact migration hash. DPAPI-encrypted local state held
all credentials, ids, row digests, and public serializer references.

The value-free hosted gate proved:

| Check | Result |
| --- | --- |
| Profile relation | Exact `16` columns; RLS enabled and non-forced |
| Inherited profile policies | Exact `2` accepted policy names, commands, roles, and expression hashes |
| Profile ACL | Exact `21` table grants and `192` expanded column grants |
| Dependent authority policies | Exact hosted eleven-policy variant; every name, command, role, and expression hash matched |
| Dependencies | `auth.uid()`, Auth-profile foreign key, and one `handle_new_user` trigger present |
| Migration order | Exact `090` ledger receipt present; `091` absent and ordered after it |
| Hosted writers | `0` active write statements |
| Existing public serializer | Public Space route returned `200` with zero private profile fields |
| Railway | Web and API ready on `main`, same deployment source and stable deployment ids |
| Row/catalog baseline | Encrypted fingerprints captured for bound public/storage/core Auth rows and all unrelated catalog classes |

The Railway executable source was `cb1b008335eb0430ef1f00928594e663cec20de5`.
Fresh Git comparison proved no `apps/` or `packages/` difference between that
deployed source and current accepted source, so no documentation-only redeploy
was triggered.

Three operator refinements stopped before any hosted mutation: generic function
fingerprinting initially called `pg_get_functiondef` on an aggregate, the prior
`090` dependency check initially expected split fields instead of its exact JSON
receipt, and hosted had no eligible retained public persona sample. The final
preflight used stable `pg_proc` metadata, parsed the exact `090` receipt, and
deferred one public persona check to an authorized disposable fixture. None of
those stopped attempts created state, changed catalog, or read a profile value.

## Migration And Ledger

The exact checked-in migration bytes ran once through the Supabase management
API. Its own transaction, advisory lock, profile table lock, exact preflight,
ACL/RLS replacement, complete dependent-policy postassert, PostgREST reload,
and commit executed unchanged.

Fresh post-commit catalog proof passed before the separate ledger insert. The
ledger then received exactly one collision-guarded row:

| Field | Value |
| --- | --- |
| Version | `20260730173301` |
| Name | `091_profiles_private_column_authority_boundary` |
| Created by | `DAEDALUS_PR535A1` |
| Idempotency key | `pr535a1-091-profiles-private-column-authority-boundary` |
| Statements | Exact path, SHA-256, accepted-source, and idempotency receipts |
| Rollback | One restore-only receipt; no broad-access down migration is authorized |

Fresh restarted verification proved that row remains exact and unique.

## Catalog Boundary

Post-migration and final-cleanup catalog reads proved:

- exactly one `profiles_select_own_authority` SELECT policy for `anon` and
  `authenticated`, with the accepted own-row expression hash;
- browser table grants `0`;
- browser column grants exactly `6`: `id`, `tier`, and `is_admin` SELECT for
  each browser role;
- browser INSERT, UPDATE, DELETE, and every other profile column grant `0`;
- trusted `service_role` table grants `7` and column grants `64` unchanged;
- all eleven hosted dependent profile-authority policies unchanged; and
- profile rows and values, all unrelated catalog fingerprints, and every bound
  non-target migration-ledger row unchanged.

After schema reload, anonymous sensitive projection returned `401`, anonymous
allowed-column projection returned `200` with zero rows, and trusted service
all-column projection returned `200`.

## Hostile Disposable Proof

Two unique confirmed Auth/profile users were created. One had the private tier;
the second had the same tier plus disposable admin authority. One tagged public
persona was created through the product API only because no eligible retained
public persona sample existed.

| Probe | Result |
| --- | --- |
| Anonymous sensitive profile projection | `401` |
| Authenticated own sensitive projection | `403` |
| Authenticated own `id/tier/is_admin` projection | `200`, exactly one own row |
| Authenticated other-profile authority projection | `200`, zero rows |
| Direct own `tier` update | `403` |
| Direct own `is_admin` update | `403` |
| Direct own `display_name` update | `403` |
| Service comparison after hostile writes | Full disposable profile digest unchanged |

No credential, token, email, username, private id, profile value, private row
count, response body, connection string, or raw SQL payload is committed.

## Compatibility

Representative service-owned and policy-dependent behavior remained intact:

| Route or policy class | Result |
| --- | --- |
| `GET /auth/me` | `200` |
| `GET /billing/me` | `200` |
| `GET /settings/ai-provider` | `200` |
| Private-tier forum witness read | `200` |
| Non-admin moderation report queue | `403` |
| Admin moderation report queue | `200` |
| Community thread/document/comment direct policy probes | `200` |
| Admin moderation-report direct policy probe | `200` |
| Public Space serializer | `200`, zero private profile fields |
| Disposable public persona serializer | `200`, zero private profile fields |

The existing public Space response remained byte-structure equivalent across
the migration. Public visitors used the bounded API serializers; direct base
profile access was not restored.

## Cleanup And Stability

Cleanup deleted the disposable persona through the product API, signed out both
sessions, removed both Auth users, and checked targeted service cleanup. Final
proof found zero tagged Auth users, identities, sessions, refresh tokens,
profiles, or personas. The complete bound public/storage/core Auth row
fingerprint returned exactly to pre-run truth.

Both Railway services remained ready on the same `main` source and deployment
ids. A separate restarted read-only operator verification again proved one
exact `091` ledger row, exact catalog boundary, cleanup complete, residue `0`,
and unchanged row/catalog/deployment fingerprints.

## Validation

| Command / proof | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 install --frozen-lockfile` | Pass; lockfile current |
| Exact-SHA hosted preflight/apply/proof operator | Pass |
| Fresh read-only hosted restart verification | Pass; ledger `1`, residue `0` |
| `npx --yes pnpm@10.32.1 test:profile-boundary` | Pass, `5/5` |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, `24/24` |
| `npx --yes pnpm@10.32.1 test:spaces` | Pass, `11/11` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `57/57` |
| `npx --yes pnpm@10.32.1 test:billing` | Pass, `16/16` |
| `npx --yes pnpm@10.32.1 test:ai-settings` | Pass, `14/14` |
| `npx --yes pnpm@10.32.1 test:projects` | Pass, `31/31` |
| `npx --yes pnpm@10.32.1 test:developer-spaces` | Pass, `61/61` |
| `npx --yes pnpm@10.32.1 test:exports` | Pass, `15/15` |
| API typecheck; DB/types builds | Pass |
| Profile test and private operator syntax | Pass |

## Frozen Boundary And Baton

No product source, package, lockfile, auth/session semantics, billing behavior,
Developer Spaces behavior, Project behavior, provider/configuration, institution
schema, institution UI, or migration `092` changed.

ARGUS should independently review the exact hosted ledger/catalog shape,
browser and service ACL semantics, hostile disposable statuses, serializer/API
compatibility, encrypted cleanup/no-drift evidence, current deployment health,
and committed public-safe result. If accepted, wake MIMIR with the hosted
verdict. If an exact correction is required, wake DAEDALUS with the finding.
