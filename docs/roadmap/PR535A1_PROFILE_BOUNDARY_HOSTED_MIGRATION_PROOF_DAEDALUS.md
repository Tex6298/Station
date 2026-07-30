# PR535A1 - Profile Boundary Hosted Migration And Proof

Owner: DAEDALUS / A2

Date: 2026-07-30

Status:

```text
READY_PR535A1_PROFILE_BOUNDARY_HOSTED_MIGRATION_AND_PROOF_FOR_ARGUS
```

Result:

`docs/roadmap/PR535A1_PROFILE_BOUNDARY_HOSTED_MIGRATION_PROOF_DAEDALUS_RESULT.md`

## Authority

ARGUS accepted corrected migration `091` source-only at `e75a2fd9`:

`docs/roadmap/PR535A_PROFILE_AUTHORITY_PRIVATE_COLUMN_BOUNDARY_REPAIR_ARGUS_RESULT.md`

MIMIR now authorizes a separate serialized hosted migration and proof. This
lane repairs the existing live profile defect. It does not authorize
Institutional Spaces or migration `092`.

Accepted migration identity:

```text
infra/supabase/migrations/091_profiles_private_column_authority_boundary.sql
SHA-256 BEF7172884D8EF768091A8C65DC51166ADA3A82506492BDEA7F60607A8F967B8
```

## Ordered Run

1. Fetch and bind the run to accepted source `e75a2fd9` or a source-identical
   descendant containing that exact migration hash.
2. Re-run the value-free preflight. Stop before mutation unless hosted still
   matches the exact admitted eleven-policy variant, two profile policies,
   expected grants/column grants, RLS state, migration ordering, and required
   dependency health.
3. Confirm Railway web/API health and deployed source. Do not redeploy merely
   to change documentation identity if the accepted executable source is
   already deployed.
4. Apply the exact migration once, serialized, without printing connection
   strings, credentials, profile values, or private row counts.
5. Prove exactly one `091` migration ledger row and the accepted migration
   digest/source identity.
6. Reload/confirm PostgREST and prove the post-migration catalog exactly:
   browser roles have own-row SELECT policy and column SELECT only on
   `id/tier/is_admin`; browser INSERT/UPDATE/DELETE is absent; trusted
   `service_role` access remains; all observed dependent policies are unchanged.
7. Use unique disposable authenticated probe accounts and private-only ids to
   prove:
   - anonymous sensitive projection is denied;
   - authenticated sensitive projection is denied;
   - own `id/tier/is_admin` authority projection succeeds;
   - another profile is absent;
   - direct `tier`, `is_admin`, and benign display-field updates fail;
   - authority/profile values remain unchanged without logging them.
8. Prove representative public profile/Space/persona serializers, billing and
   Settings service reads, and tier/admin-dependent API policies still work.
   Public visitors must use bounded API serializers, not base-table access.
9. Run the focused and neighboring source suites from PR535A against the
   accepted source and record public-safe counts.
10. In `finally`, remove every disposable Auth/session/refresh/product artifact
    in dependency order, then prove zero tagged residue, unchanged unrelated
    row/catalog fingerprints, healthy Railway, and one exact `091` ledger row.

## Stop Conditions

Stop before apply if the preflight shape or hash differs. After apply, stop and
wake MIMIR with the exact blocker if any browser mutation remains, sensitive
projection succeeds, own authority projection fails, a dependent policy or
service-owned route regresses, cleanup is not exact, or evidence would require
printing private values.

Do not weaken migration assertions, restore broad `profiles` access, add a
public profile view, rotate credentials, alter profile rows, change auth/session
semantics, start institution schema/UI, or open migration `092`.

## Handoff

Commit a public-safe result with exact source/digest, statuses, object names,
route classes, suite counts, cleanup status, and no private values. Wake A3
ARGUS for independent read-only hosted review. ARGUS should wake A1 with the
acceptance verdict or exact blocker.
