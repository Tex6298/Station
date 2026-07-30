# PR535A1 Profile Boundary Hosted Migration And Proof - ARGUS Result

**Owner:** ARGUS / A3 -> MIMIR / A1

**Date:** 2026-07-30

**Base:** `d7240f02 docs: prove hosted profile boundary`

**State:**

```text
ACCEPT_PR535A1_PROFILE_BOUNDARY_HOSTED_MIGRATION_AND_PROOF
```

## Verdict

ARGUS accepts the PR535A1 hosted migration and proof. Exact migration `091` is
applied and ledgered once; the broad live profile projection/mutation defect is
repaired; hostile role behavior, service/public compatibility, cleanup, row and
catalog stability, and current Railway health all pass independent review.

This closes the concrete profile-boundary blocker found during PR535 preflight.
It does not authorize Institutional Spaces, migration `092`, or any principal,
team, route, role, resource link, or UI implementation. MIMIR retains the next
sequencing decision.

## Identity

Accepted identity is exact:

```text
Source: e75a2fd94dbeedfaee2b5ff889cb3d48b7fb4039
Migration: infra/supabase/migrations/091_profiles_private_column_authority_boundary.sql
SHA-256: BEF7172884D8EF768091A8C65DC51166ADA3A82506492BDEA7F60607A8F967B8
Ledger version: 20260730173301
Ledger name: 091_profiles_private_column_authority_boundary
```

The ledger has one exact collision-guarded row with the accepted path, hash,
source, idempotency, creator, and restore-only rollback receipts. It is the
latest row; the exact `090` predecessor and every non-target ledger fingerprint
remain unchanged.

Railway API and web remain ready together on `main` at executable source
`cb1b0083`. Git proves zero `apps/` or `packages/` difference from accepted
source `e75a2fd9`, so the documentation/migration-only source gap required no
application redeploy. Deployment ids and source remained stable through proof
and independent review.

## Boundary

Fresh catalog and effective-privilege inspection proved:

| Check | Accepted result |
| --- | ---: |
| Profile columns | `16` |
| Profile policies | `1` exact `profiles_select_own_authority` |
| Hosted dependent authority policies | `11`, exact and unchanged |
| Browser table grants | `0` |
| Browser column grants | `6` |
| Unexpected browser column grants | `0` |
| Effective anon/auth sensitive-column privileges | `0` |
| Effective anon/auth mutation-column privileges | `0` |
| Effective anon/auth table mutation privilege | `false` / `false` |
| Trusted service table/column grants | `7` / `64` |
| Trusted effective service privileges | `7` |

Anonymous sensitive projection now returns `401`; anonymous
`id/tier/is_admin` projection returns `200` with zero rows; and service all-
column projection returns `200`. The RLS policy is scoped only to `anon` and
`authenticated` with the accepted own-row expression hash.

## Hostile Proof

ARGUS decrypted the DPAPI state locally, emitted no private value, and proved
it exactly matches the public receipt. The encrypted hostile evidence records:

- authenticated sensitive projection `403`;
- own `id/tier/is_admin` projection `200` with exactly one own row;
- another profile projection `200` with zero rows;
- direct `tier`, `is_admin`, and `display_name` writes each `403`; and
- a full service-side disposable profile digest unchanged after all attempts.

Representative auth, billing, Settings, private-tier, admin, and direct
dependent-policy paths passed. ARGUS independently rechecked the retained
public Space serializer at the exact pre-run body hash with zero private
profile keys. The disposable public persona route now returns `404` after
cleanup.

## Cleanup

The encrypted state contains exactly two bounded probe accounts and one
disposable persona lifecycle. Both accounts are signed out and deleted. Fresh
independent residue queries return zero users, identities, sessions, refresh
tokens, profiles, and personas for the encrypted probe identities. The public
persona is absent, the complete profile row count and value digest match the
pre-run baseline, and the restarted verifier confirms all bound public,
storage, core Auth, unrelated catalog, non-target ledger, and deployment
fingerprints remain exact.

The private operator, DPAPI state/error evidence, public-safe receipt, and
independent ARGUS auditor are all ignored under `.station-private/`. Public
committed additions and the public receipt have zero credential, token, email,
private-id, private-key, or connection-string value hits.

## Validation

| Command / proof | Result |
| --- | --- |
| Complete `c26c7a09..d7240f02` authorization/result review | Pass; docs-only public scope |
| Fresh `node .station-private/pr535a1/operator.mjs verify` | Pass; ledger `1`, cleanup complete, residue `0`, Railway exact |
| Independent ignored ARGUS hosted audit | Pass; exact catalog/effective ACL/ledger, current PostgREST, encrypted hostile evidence, cleanup, serializer, and deployment |
| `node --check` private operator and ARGUS auditor | Pass |
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
| Executable diff since validated `e75a2fd9` | `0` files under `apps`, `packages`, `infra`, or `scripts` |
| Committed/public-receipt sensitive-value scan | Pass, `0` / `0` hits |
| `git diff --check` | Pass; line-ending notices only |

## Baton

MIMIR should close PR535A/PR535A1 as hosted accepted and decide whether to open
the separately frozen PR535 institution slice or pause. ARGUS does not open
that lane here, and migration `092` remains unauthorized.
