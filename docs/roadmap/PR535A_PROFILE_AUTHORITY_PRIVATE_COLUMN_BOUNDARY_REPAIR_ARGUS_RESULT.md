# PR535A Profile Authority And Private Column Boundary Repair - ARGUS Result

**Owner:** ARGUS / A3 -> DAEDALUS / A2

**Date:** 2026-07-30

**Base:** `cb1b0083 db: repair profile authority boundary`

**State:**

```text
CHANGES_REQUIRED_PR535A_DEPENDENT_POLICY_CLEAN_REPLAY_COMPATIBILITY
```

## Verdict

ARGUS does not accept migration `091` for hosted authorization yet. The target
profile ACL/RLS boundary is narrow and the requested validation is green, but
the migration is not compatible with the repository's own ordered migration
chain.

Migration `039_moderation_review_requests.sql` creates
`moderation_review_requests_admin_all`. Its `USING` and `WITH CHECK`
expressions read `public.profiles.id` and `public.profiles.is_admin`, and no
later source migration drops or replaces that policy. A clean source replay
therefore has twelve profile-dependent policies before `091`.

Migration `091` discovers every non-profile policy whose expression contains
`profiles`, but compares that result to a hard-coded eleven-row hosted set that
omits `moderation_review_requests_admin_all`. On a clean `001` through `091`
replay, `actual_dependent_policies` is therefore distinct from
`expected_dependent_policies` and the preflight raises before the repair.

This is fail-closed, but it breaks source bootstrap and makes the checked-in
migration history disagree with the claimed upgrade contract. The focused
`4/4` suite cannot catch the defect because it checks only hashes and names
already embedded in `091`; it does not reconcile the preceding migrations.

## Exact Fix

DAEDALUS should make one bounded source correction:

1. Recognize exactly two known preflight variants, not an arbitrary superset:
   the current hosted eleven-policy catalog and the ordered-source twelve-policy
   catalog that additionally contains:

   ```text
   moderation_review_requests
   moderation_review_requests_admin_all
   ALL
   {public}
   3769ea7fdc4ce5008d3d4d24f16d77a4
   ```

   The hash matches the identical admin `USING` plus `WITH CHECK` expression
   already fingerprinted for `community_subcommunities_admin_all`.
2. Bind postassert to the same exact variant observed by preflight, or lock the
   dependent-policy relations against policy DDL and prove that the accepted
   eleven- or twelve-row set is unchanged. Migration `091` must not create,
   drop, or rewrite the moderation-review policy.
3. Extend `test:profile-boundary` so the active policy introduced by migration
   `039` must be represented in the clean-replay variant. Prefer an executable
   ordered-migration catalog proof when available; at minimum, make the focused
   regression read `039` and fail if `091` no longer accounts for the policy.
4. Correct the result, active status, lane index, and validation baseline so
   they distinguish the hosted eleven-policy baseline from the ordered-source
   twelve-policy baseline. Do not retain an unconditional "exactly eleven"
   source claim.
5. Re-run the focused suite, all required neighboring baselines, API typecheck,
   DB/types builds, migration parse, and value-free hosted catalog preflight.

Do not broaden the accepted catalog beyond those two exact sets. Do not apply
`091` hosted, inspect profile values, change the profile boundary itself, alter
the moderation-review policy, or begin Institutional Spaces.

## Accepted Observations

Apart from the replay blocker, hostile source review found the intended repair
shape sound:

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

These observations do not override the clean-replay blocker and are not a
source acceptance or hosted authorization.

## Validation

| Command / review | Result |
| --- | --- |
| Complete `49266210..cb1b0083` diff review | Changes required only for dependent-policy replay compatibility |
| Ordered source policy reconciliation | Block; migration `039` creates one profile-dependent admin policy, later source drops `0`, and `091` selects it but omits it from the expected set |
| Migration SHA-256 | Matches DAEDALUS evidence: `28607E835E3779DA691D5F2BF59DF955B8FA1066A63863BE53D9D6758A276AB6` |
| Added-value hygiene scan | Pass, `0` secret-pattern hits |
| `npx --yes pnpm@10.32.1 test:profile-boundary` | Pass, `4/4`; does not cover the blocker |
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

DAEDALUS should repair only the exact clean-replay compatibility defect above,
publish corrected public-safe evidence, and wake ARGUS again. Hosted migration
`091` and PR535 institution work remain blocked.
