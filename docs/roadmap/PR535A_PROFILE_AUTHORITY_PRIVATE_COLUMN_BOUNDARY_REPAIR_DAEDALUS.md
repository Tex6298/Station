# PR535A - Profile Authority And Private Column Boundary Repair

Owner: DAEDALUS / A2

Date: 2026-07-30

Status:

```text
OPEN_PR535A_PROFILE_AUTHORITY_AND_PRIVATE_COLUMN_BOUNDARY_REPAIR
```

## Authority

ARGUS blocked Institutional Spaces and defined this exact direct unblock in:

`docs/roadmap/PR535_INSTITUTIONAL_SPACES_FOUNDATION_PREFLIGHT_ARGUS_RESULT.md`

DAEDALUS is authorized to implement the source repair only. Hosted migration
and proof remain a separate post-review stage.

## Required Implementation

Add exactly:

```text
infra/supabase/migrations/091_profiles_private_column_authority_boundary.sql
```

The migration must:

1. Run in one explicit transaction with a transaction-scoped advisory lock.
2. Assert the expected `profiles` columns, RLS state, policies, grants, and the
   eleven dependent profile-authority policy expressions before mutation.
3. Drop `profiles_select_public` and `profiles_update_own`.
4. Revoke all table and column privileges on `public.profiles` from `public`,
   `anon`, and `authenticated`.
5. Add one SELECT policy for `anon` and `authenticated` restricted to
   `auth.uid() = id`.
6. Grant those browser roles column SELECT only on `id`, `tier`, and
   `is_admin`. Anonymous callers therefore receive no profile row.
7. Grant browser roles no profile INSERT, UPDATE, or DELETE privilege and add
   no browser mutation policy.
8. Preserve explicit trusted `service_role` SELECT/INSERT/UPDATE/DELETE for
   current API, billing, auth-trigger, and Settings flows.
9. Reload the PostgREST schema after commit.
10. Rewrite no row, rotate no credential, and change no dependent policy,
    serializer, auth/session behavior, or unrelated object.

## Proof

Add focused executable migration assertions and a root
`test:profile-boundary` script. The proof must establish without reading or
printing profile values:

- anonymous and authenticated sensitive projections are denied;
- authenticated callers can select only their own `id`, `tier`, and
  `is_admin` authority row;
- another profile is absent;
- direct updates to `tier`, `is_admin`, and benign display columns fail;
- service-owned API profile, billing, Settings, and public serializer paths
  remain functional;
- representative tier/admin-dependent policies remain functional;
- no browser table privilege or mutation policy remains.

Run at minimum:

```text
test:profile-boundary
test:auth                 24/24 baseline
test:spaces               11/11 baseline
test:community            57/57 baseline
test:billing              16/16 baseline
test:ai-settings          14/14 baseline
test:projects             31/31 baseline
test:developer-spaces     61/61 baseline
test:exports              15/15 baseline
API typecheck
DB build
types build
```

Use the current package-manager/version convention in the repo. Record actual
counts if suites have legitimately advanced.

## Stop Conditions

Stop and wake MIMIR with the exact blocker if:

- source grants or policies differ from the ARGUS preflight;
- a dependent authority policy cannot work with own-row authority SELECT;
- preserving a current route requires broad direct browser profile access;
- any browser profile update remains possible;
- the repair requires reading, printing, or rewriting private profile values;
- implementation requires institution schema, product UI, billing, auth/session
  redesign, or unrelated policy changes.

## Handoff

Commit source, tests, docs, and public-safe validation only. Wake A3 ARGUS for
hostile source review. Do not apply migration `091` to hosted Supabase in this
lane and do not start PR535B.
