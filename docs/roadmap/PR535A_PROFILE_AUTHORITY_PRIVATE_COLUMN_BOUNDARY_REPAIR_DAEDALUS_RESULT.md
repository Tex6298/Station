# PR535A Profile Authority And Private Column Boundary Repair - DAEDALUS Result

**Owner:** DAEDALUS / A2 -> ARGUS / A3

**Date:** 2026-07-30

**Base:** `49266210 docs: authorize PR535A profile boundary repair`

**State:**

```text
READY_PR535A_PROFILE_AUTHORITY_AND_PRIVATE_COLUMN_BOUNDARY_REPAIR_FOR_ARGUS
```

## Verdict

DAEDALUS implemented the authorized source-only profile boundary repair. The
new migration removes broad browser profile projection and mutation while
retaining only authenticated own-row `id`, `tier`, and `is_admin` authority
reads needed by the existing tier/admin RLS checks.

Migration `091` was not applied to hosted Supabase. No profile row or private
profile value was read, printed, rewritten, or included in evidence. PR535
Institutional Spaces remains blocked pending ARGUS hostile source review and a
separately authorized hosted migration/proof stage.

## Migration Contract

- `091_profiles_private_column_authority_boundary.sql` runs in one transaction
  under a transaction-scoped advisory lock and a `profiles` table lock.
- Preflight requires the exact sixteen-column profile shape, enabled non-forced
  RLS, both inherited profile policies, the exact browser/service table and
  column grants, and all eleven dependent authority-policy expression hashes.
- The broad `profiles_select_public` and `profiles_update_own` policies are
  removed. All table and explicit column privileges are revoked from `PUBLIC`,
  `anon`, and `authenticated` before the replacement boundary is installed.
- One permissive SELECT policy applies only to `anon` and `authenticated` with
  `auth.uid() = id`. Those roles receive column SELECT only on `id`, `tier`, and
  `is_admin`; they receive no profile mutation privilege or policy.
- Existing explicit `service_role` SELECT/INSERT/UPDATE/DELETE access is
  preserved. Postassert also requires its prior REFERENCES/TRIGGER/TRUNCATE
  grants to remain unchanged.
- Postassert requires exactly one profile SELECT policy, no browser table
  privilege, exactly six browser authority-column grants, and the unchanged
  eleven dependent policy hashes before PostgREST reload and commit.
- The migration contains no profile DML, profile column change, migration
  ledger write, institution object, auth/session change, or unrelated policy
  mutation.

Migration source SHA-256:

```text
28607E835E3779DA691D5F2BF59DF955B8FA1066A63863BE53D9D6758A276AB6
```

## Focused Proof

The new root `test:profile-boundary` suite checks the fail-closed catalog
preflight, exact policy fingerprints, complete table/column revocation,
own-row three-column authority grant, absence of browser mutation grants and
policies, retained service access, no profile data rewrite, and PostgREST
reload/commit ordering.

It also scans current product paths to prove profile-facing auth, billing,
Settings, Project, Discover, and forum access remains API/service-owned, while
the web source contains no direct `profiles` query that would require the
removed broad browser grant.

## Validation

| Command / review | Result |
| --- | --- |
| Read-only hosted catalog fingerprint preflight | Pass; exact two profile policies, `21` table grants, `192` expanded column grants, and eleven dependent policy hashes; no profile row/value read |
| Ephemeral PostgreSQL AST parse | Pass; migration `091` parsed without retaining a dependency or touching hosted Supabase |
| `npx --yes pnpm@10.32.1 install --frozen-lockfile` | Pass; lockfile already current |
| `npx --yes pnpm@10.32.1 test:profile-boundary` | Pass, `4/4` |
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

ARGUS should hostile-review PostgreSQL syntax and upgrade safety, exact live
preflight compatibility, table-versus-column ACL semantics, own-row RLS
behavior, anonymous absence, authority-policy execution, service-route
compatibility, no-DML scope, focused assertions, and the complete diff.

If source is accepted, ARGUS should wake MIMIR with the verdict. No agent should
apply migration `091` hosted or begin Institutional Spaces without a new exact
authorization.
