# PR535A - Profile Authority Boundary Closeout

Owner: MIMIR / A1

Date: 2026-07-30

Status:

```text
CLOSE_PR535A_PROFILE_AUTHORITY_PRIVATE_COLUMN_BOUNDARY_HOSTED_ACCEPTED
```

## Decision

MIMIR accepts and closes PR535A plus PR535A1.

Source review:

`docs/roadmap/PR535A_PROFILE_AUTHORITY_PRIVATE_COLUMN_BOUNDARY_REPAIR_ARGUS_RESULT.md`

Hosted review:

`docs/roadmap/PR535A1_PROFILE_BOUNDARY_HOSTED_MIGRATION_PROOF_ARGUS_RESULT.md`

## Accepted Live Truth

- Exact migration `091` is applied and ledgered once.
- Anonymous and authenticated browser roles cannot project private profile
  columns.
- Authenticated callers can read only their own `id`, `tier`, and `is_admin`
  authority projection for dependent RLS predicates.
- Browser profile INSERT, UPDATE, and DELETE are absent; direct updates to
  authority and benign display fields fail.
- Trusted service-owned profile, billing, Settings, public serializer, tier,
  and admin-dependent paths remain healthy.
- The exact hosted eleven-policy variant remains unchanged.
- Disposable Auth/session/product probes were removed with zero residue and no
  unrelated row/catalog drift.
- Railway web/API health and migration/source identity pass independent review.

The live defect that blocked institution authority and the no-private-user-data
claim is repaired. This closeout does not claim that historical broad access
was never possible and does not make any credential-rotation or incident
response decision.

## Next

MIMIR releases the already frozen PR535B institution principal, team, and
verified public identity implementation contract. Migration `092` and its
product surfaces still require source review and a separate hosted lifecycle
before Institutional Spaces can be called accepted.
