# PR535A Profile Authority And Private Column Boundary Repair - DAEDALUS Result

**Owner:** DAEDALUS / A2 -> ARGUS / A3

**Date:** 2026-07-30

**Base:** `5774d051 docs: require PR535A clean replay fix`

**State:**

```text
READY_PR535A_DEPENDENT_POLICY_CLEAN_REPLAY_COMPATIBILITY_FOR_ARGUS
```

## Verdict

DAEDALUS implemented the authorized source-only profile boundary repair and the
exact clean-replay correction required by ARGUS. The migration removes broad
browser profile projection and mutation while retaining only authenticated
own-row `id`, `tier`, and `is_admin` authority reads needed by the existing
tier/admin RLS checks.

Migration `091` was not applied to hosted Supabase. No profile row or private
profile value was read, printed, rewritten, or included in evidence. PR535
Institutional Spaces remains blocked pending ARGUS hostile source review and a
separately authorized hosted migration/proof stage.

## Migration Contract

- `091_profiles_private_column_authority_boundary.sql` runs in one transaction
  under a transaction-scoped advisory lock and a `profiles` table lock.
- Preflight requires the exact sixteen-column profile shape, enabled non-forced
  RLS, both inherited profile policies, the exact browser/service table and
  column grants, and one of only two exact dependent-policy fingerprints: the
  hosted eleven-policy catalog or the ordered-source twelve-policy catalog that
  additionally contains `moderation_review_requests_admin_all` from migration
  `039`.
- The broad `profiles_select_public` and `profiles_update_own` policies are
  removed. All table and explicit column privileges are revoked from `PUBLIC`,
  `anon`, and `authenticated` before the replacement boundary is installed.
- One permissive SELECT policy applies only to `anon` and `authenticated` with
  `auth.uid() = id`. Those roles receive column SELECT only on `id`, `tier`, and
  `is_admin`; they receive no profile mutation privilege or policy.
- Existing explicit `service_role` SELECT/INSERT/UPDATE/DELETE access is
  preserved. Postassert also requires its prior REFERENCES/TRIGGER/TRUNCATE
  grants to remain unchanged.
- Preflight records the accepted variant and its complete fingerprint in
  transaction-local settings. Postassert requires exactly the same observed
  eleven- or twelve-policy fingerprint, exactly one profile SELECT policy, no
  browser table privilege, and exactly six browser authority-column grants
  before PostgREST reload and commit.
- The migration contains no profile DML, profile column change, migration
  ledger write, institution object, auth/session change, or unrelated policy
  mutation.

Migration source SHA-256:

```text
BEF7172884D8EF768091A8C65DC51166ADA3A82506492BDEA7F60607A8F967B8
```

## Focused Proof

The root `test:profile-boundary` suite checks the fail-closed catalog preflight,
both exact policy variants, complete table/column revocation, own-row
three-column authority grant, absence of browser mutation grants and policies,
retained service access, no profile data rewrite, and PostgREST reload/commit
ordering.

The clean-replay regression reads migration `039`, requires its exact admin-all
profile-dependent policy in the twelve-row variant, verifies migrations `040`
through `091` do not drop it, and requires postassert to compare against the
fingerprint retained by preflight. Migration `091` neither changes nor removes
the moderation-review policy.

It also scans current product paths to prove profile-facing auth, billing,
Settings, Project, Discover, and forum access remains API/service-owned, while
the web source contains no direct `profiles` query that would require the
removed broad browser grant.

## Validation

| Command / review | Result |
| --- | --- |
| Ordered-source migration reconciliation | Pass; migration `039` creates the twelfth policy, migrations `040` through `091` drop it `0` times, and `091` admits only the exact eleven/twelve variants |
| Read-only hosted catalog fingerprint preflight | Pass; exact two profile policies, `21` table grants, `192` expanded column grants, and hosted eleven-policy fingerprint; no profile row/value read |
| Ephemeral PostgreSQL AST parse | Pass; migration `091` parsed without retaining a dependency or touching hosted Supabase |
| `npx --yes pnpm@10.32.1 install --frozen-lockfile` | Pass; lockfile already current |
| `npx --yes pnpm@10.32.1 test:profile-boundary` | Pass, `5/5` |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, `24/24` |
| `npx --yes pnpm@10.32.1 test:spaces` | Pass, `11/11` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `57/57` |
| `npx --yes pnpm@10.32.1 test:billing` | Pass, `16/16` |
| `npx --yes pnpm@10.32.1 test:ai-settings` | Pass, `14/14` |
| `npx --yes pnpm@10.32.1 test:projects` | Pass, `31/31` |
| `npx --yes pnpm@10.32.1 test:developer-spaces` | Pass, `61/61` |
| `npx --yes pnpm@10.32.1 test:exports` | Pass, `15/15` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/db build` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/types build` | Pass |
| `node --check scripts/profile-boundary.test.mjs` | Pass |
| `git diff --check` | Pass; line-ending notices only |

## Frozen Boundaries

No hosted migration, profile value access, institution schema, institution UI,
browser profile editor, auth/session semantic, billing behavior, Developer
Space behavior, Project behavior, dependency, lockfile, or external
configuration changed. This source result does not claim that hosted access is
repaired until the exact migration is separately applied and proved.

## Baton

ARGUS should hostile-review the exact hosted-eleven/ordered-source-twelve
variant selection, transaction-local fingerprint binding, migration-039
regression, PostgreSQL syntax and upgrade safety, table-versus-column ACL
semantics, own-row RLS behavior, authority-policy execution, service-route
compatibility, no-DML scope, and the complete correction diff.

If source is accepted, ARGUS should wake MIMIR with the verdict. No agent should
apply migration `091` hosted or begin Institutional Spaces without a new exact
authorization.
