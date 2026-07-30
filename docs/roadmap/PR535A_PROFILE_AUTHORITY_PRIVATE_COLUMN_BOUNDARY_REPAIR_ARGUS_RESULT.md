# PR535A Profile Authority And Private Column Boundary Repair - ARGUS Result

**Owner:** ARGUS / A3 -> DAEDALUS / A2 -> ARGUS / A3 -> MIMIR / A1

**Date:** 2026-07-30

**Base:** `e75a2fd9 db: preserve profile policy replay variants`

**State:**

```text
ACCEPT_PR535A_PROFILE_AUTHORITY_AND_PRIVATE_COLUMN_BOUNDARY_REPAIR_SOURCE_ONLY
```

## Verdict

ARGUS accepts corrected migration `091` source-only. The target profile ACL/RLS
boundary is narrow, the ordered migration chain is now represented exactly,
and all required validation passes at `e75a2fd9`.

This verdict does not authorize hosted application and does not claim that the
live profile exposure is repaired. Migration `091` remains unapplied, the
hosted database remains on the blocked pre-migration boundary, and PR535
Institutional Spaces remains blocked pending a separate MIMIR decision.

## Resolved Finding

The first review found that migration `039_moderation_review_requests.sql`
creates `moderation_review_requests_admin_all`, while hosted currently has only
the other eleven profile-dependent policies. DAEDALUS resolved that mismatch
without accepting arbitrary catalog drift:

1. Preflight defines the exact hosted eleven-policy fingerprint and constructs
   one ordered-source twelve-policy fingerprint by inserting only:

   ```text
   moderation_review_requests
   moderation_review_requests_admin_all
   ALL
   {public}
   3769ea7fdc4ce5008d3d4d24f16d77a4
   ```

   The hash matches the identical admin `USING` plus `WITH CHECK` expression
   already fingerprinted for `community_subcommunities_admin_all`.
2. Equality checks admit only the complete hosted or ordered-source JSON set.
   Preflight records the selected variant and full observed fingerprint in
   transaction-local custom settings; postassert parses and compares against
   that same complete fingerprint.
3. The focused regression reads migration `039`, requires its exact policy
   shape, scans migrations `040` through `091` for any drop, and requires the
   twelve-row variant plus preflight/postassert binding.
4. Corrected public evidence distinguishes the current hosted eleven-policy
   catalog from the ordered-source twelve-policy catalog.

An independent value-free PostgreSQL probe also stored a `4096`-character
custom setting in one `DO` block, recovered it in a second `DO` block in the
same transaction, and rolled back. It read and wrote zero database rows. This
proves the mechanism used to carry the fingerprint through migration `091`,
not the migration's still-pending hosted application.

## Accepted Observations

Hostile source review found the repair shape sound:

- one explicit transaction, advisory lock, profile table lock, exact profile
  shape/RLS/policy/grant guards, and rollback-on-drift behavior are present;
- browser table and explicit column privileges are revoked before granting only
  own-row `id`, `tier`, and `is_admin` SELECT;
- browser profile mutation policy and privilege are absent;
- trusted `service_role` access and service-owned API profile paths remain;
- every currently enumerated dependent predicate reads only the caller's
  `id/tier/is_admin`, so the proposed own-row authority projection is sufficient;
- the migration contains no profile DML, institution object, product route/UI,
  dependency, lockfile, or hosted mutation;
- committed additions contain no credential, token, email, or connection-string
  value.

These observations support source acceptance only. Hosted behavior still needs
an independently authorized exact-SHA migration and lifecycle proof.

## Validation

| Command / review | Result |
| --- | --- |
| Complete correction diff review | Pass; only the exact replay correction, focused test, and public evidence changed |
| Ordered source policy reconciliation | Pass; migration `039` creates the twelfth policy and migrations `040` through `091` drop it `0` times |
| Exact variant and postassert binding | Pass; only full eleven/twelve sets are accepted and the observed fingerprint is compared unchanged |
| Fresh hosted value-free audit | Pass; pre-migration catalog still has `2` profile policies and `11` dependent policies; rows read `0` |
| Transaction-local PostgreSQL probe | Pass; `4096` characters round-tripped across separate `DO` blocks, rows read/written `0` |
| Migration SHA-256 | Matches DAEDALUS evidence: `BEF7172884D8EF768091A8C65DC51166ADA3A82506492BDEA7F60607A8F967B8` |
| Correction added-value hygiene scan | Pass, `0` secret-pattern hits |
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
| `node --check scripts/profile-boundary.test.mjs` | Pass |
| `git diff --check` | Pass; line-ending notices only |

## Baton

MIMIR may authorize a separate exact-SHA hosted migration and proof lane or
pause PR535A. This source verdict authorizes neither hosted migration `091` nor
PR535 institution work.
