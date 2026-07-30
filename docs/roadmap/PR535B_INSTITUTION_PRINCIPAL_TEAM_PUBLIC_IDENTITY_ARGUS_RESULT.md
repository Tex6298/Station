# PR535B Institution Principal, Team, And Public Identity - ARGUS Result

Owner: ARGUS / A3 -> DAEDALUS / A2

Date completed: 2026-07-30

Implementation reviewed: `18f1d6db14f08d5dd212fc94038d7719d246a47e`

Verdict:

```text
BLOCK_PR535B_MIGRATION_092_PROFILE_PREFLIGHT_ACCEPTS_EFFECTIVE_PRIVILEGE_DRIFT
READY_PR535B_EXACT_PROFILE_ACL_GUARD_FOR_DAEDALUS
```

## Verdict

PR535B is not source-accepted yet. The institution principal, lifecycle,
service-only transition, serializer, route, and zero-resource-inheritance
design substantially passes hostile review, including execution of the exact
migration in local PostgreSQL. One privacy precondition is not fail-closed:
migration `092` claims to require the exact accepted migration-`091` profile
boundary, but it can commit while an inherited role grant restores private
profile projection to `authenticated`.

Migration `092` remains unapplied hosted. This result does not authorize a
hosted migration, fixture, deployment, successor lane, or broader Institution
feature.

## Blocking Finding

The preflight at
`infra/supabase/migrations/092_institution_principal_team_public_identity.sql`
checks direct grants whose grantee is `PUBLIC`, `anon`, or `authenticated`.
It does not prove the exact trusted-service grant set and does not inspect
effective privileges inherited through another role. Its pre/post grant
fingerprint likewise includes only `PUBLIC`, `anon`, `authenticated`, and
`service_role`, so a grant to a parent role is invisible on both sides.

ARGUS reproduced the failure in disposable in-memory PostgreSQL:

1. Bootstrap the accepted one-policy profile RLS shape and exact six direct
   browser column grants from migration `091`.
2. Grant full `profiles` SELECT to a separate role and grant that role to
   `authenticated`.
3. Confirm `authenticated` has effective SELECT on private Stripe/provider-key
   columns and can project those values for its own RLS-authorized profile row.
4. Execute the exact checked-in migration `092` bytes.
5. Observe that migration `092` commits, creates all three institution tables,
   and leaves the effective private projection intact.

Public-safe result:

```text
Migration applied despite inherited drift: true
Authenticated sensitive privilege after migration: true
Authenticated own rows projected: 1
Private marker values projected: 2
Hosted writes: 0
```

No real credential, token, profile value, hosted identifier, or connection
value was used or emitted. The repro and PGlite package are ignored/local-only
and do not change a manifest or lockfile.

## Exact Correction

DAEDALUS should keep the existing PR535B contract and change only the migration
guard, its focused proof, and the result/status documents:

1. Before creating an institution object, require the exact migration-`091`
   direct profile ACL: zero browser table grants, exactly the six
   `anon`/`authenticated` SELECT column grants for `id`, `tier`, and
   `is_admin`, and the exact trusted `service_role` table/column grant set.
2. Independently prove effective `anon` and `authenticated` privileges. They
   must have no table-wide profile privilege, no sensitive-column SELECT, and
   no column mutation privilege; only SELECT on `id`, `tier`, and `is_admin`
   may be effective.
3. Bind or repeat the same effective ACL assertion in postassert so an
   invisible parent-role grant cannot survive the migration's claimed exact
   boundary.
4. Add a regression that introduces an inherited full-profile reader role and
   proves migration `092` aborts before `public.institutions` exists. Also keep
   the clean accepted profile shape passing.
5. Recompute the migration SHA-256 and rerun the focused, profile/auth,
   neighboring, SQL parse/execution, typecheck, lint, and diff gates.

Do not change profile policy semantics, apply migration `092`, touch hosted
data, add institution content/resources, or reopen migration `091` itself.

## Passing Review Surface

With the accepted profile boundary intact, ARGUS executed the exact migration
in disposable PGlite PostgreSQL and independently passed:

- three RLS-enabled institution tables, zero browser policies, and zero
  browser table grants;
- service-only execution of all six fixed-search-path definer transitions;
- admin provision/verification and owner publication/invitation authority;
- exact-target acceptance, stale expiry, fresh re-invite, and decline;
- owner identity immutability and owner-membership rejection;
- direct audit update/delete rejection plus authorized parent cascade cleanup;
- eight hostile transition/raw-access denials, nine typed lifecycle events,
  and zero institution/member/audit cleanup residue; and
- zero hosted writes.

Source review also confirms the API/web diff touches no existing resource
query or entitlement, private/public serializers are bounded, route ordering
is static-before-dynamic, submitted usernames and service errors are not
echoed, and the member request plan contains only the team endpoint.

ARGUS made one narrow review patch: the private index eyebrow now says
`Institution identities`, not `Verified organisations`, because the page
correctly includes unverified and revoked principals. A focused regression
locks that claim boundary.

## Validation

| Command / proof | ARGUS result |
| --- | --- |
| Exact migration SHA-256 | Pass; submitted hash `928FCB9395E1803253491F1C367470F46DB9139E9A9BDCB23FD79967333B3E0D` |
| Disposable exact-migration PostgreSQL hostile audit | Pass; normal accepted boundary, `8` denials, `9` events, residue `0` |
| Disposable inherited-grant PostgreSQL repro | Block confirmed; migration commits with effective private projection |
| `npm exec --yes pnpm@10.32.1 -- run test:institutions` | Pass after ARGUS wording patch, `13/13` |
| `npm exec --yes pnpm@10.32.1 -- run test:profile-boundary` | Pass, `5/5` |
| `npm exec --yes pnpm@10.32.1 -- run test:auth` | Pass, `24/24` |
| API and web typecheck | Pass |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass, zero warnings/errors |
| `git diff --check` | Pass |
| Hosted migrations / writes / fixtures | `0 / 0 / 0` |

The broad neighboring counts in the DAEDALUS result remain useful submitted
evidence, but passing tests do not override the executable privacy-precondition
repro. ARGUS will rerun the required matrix on the corrected source.

## Handoff

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- The PR535B institution lifecycle, RPCs, serializers, route boundaries, and
  zero-resource inheritance substantially pass, including exact migration
  execution in disposable PostgreSQL.
- Migration 092 nevertheless accepts an inherited role grant that restores
  authenticated private profile projection, contradicting its exact
  migration-091 precondition.
- ARGUS narrowly corrected the private index verification overclaim and added
  a focused wording regression.
Task:
- Add exact direct and effective profile ACL checks before/post migration,
  prove inherited full-profile grant drift aborts before object creation,
  recompute the hash, rerun the required matrix, and WAKEUP A3.
- Keep migration 092 unapplied hosted and do not expand PR535B.
```
