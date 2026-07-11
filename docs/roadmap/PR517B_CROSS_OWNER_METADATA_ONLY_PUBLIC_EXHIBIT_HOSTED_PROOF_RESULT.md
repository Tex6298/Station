# PR517B - Cross-Owner Metadata-Only Public Exhibit Hosted Proof Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

Result:

```text
FAIL_PR517B_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_PROOF
```

## Summary

ARIADNE started the hosted PR517B proof against Railway staging, but stopped
before creating any hosted proof data because migration `080` is not present in
the Railway Supabase REST schema.

The failure is a hosted migration/deploy readiness defect, not a product
contract verdict:

- hosted API health returned `200`;
- hosted API route
  `/persona-encounters/cross-owner-public-exhibits/not-real` returned a clean
  `404`, so the route surface is present enough to answer;
- Railway Supabase REST could read
  `persona_encounter_cross_owner_consents`;
- Railway Supabase REST could read `moderation_reports`;
- Railway Supabase REST returned `404 PGRST205` for
  `persona_encounter_cross_owner_public_exhibits`;
- the direct hosted proof harness also failed while checking
  `public.persona_encounter_cross_owner_public_exhibits`;
- no sign-in, persona, consent, exhibit, report, moderation, provider, runtime,
  retrieval, storage, public-surfacing, or cleanup proof step was executed after
  the migration check failed.

Because the dedicated cross-owner public exhibit table is missing from the
hosted schema, ARIADNE could not prove proposal, exact bilateral approval,
metadata-only public readback, report, moderation remove/restore,
revocation/retract hiding, same-owner regression safety, no public surfacing
drift, or cleanup.

## Proof Output

Hosted proof harness:

```text
result FAIL_PR517B_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_PROOF
apiUrl https://stationapi-production.up.railway.app
webUrl https://stationweb-production.up.railway.app
apiHealthStatus 200
webApiHealthStatus 404
defect relation "public.persona_encounter_cross_owner_public_exhibits" does not exist
cleanup no hosted proof fixture was created before the migration check failed
```

Railway Supabase REST schema check:

```text
persona_encounter_cross_owner_consents status 200 rows 1
persona_encounter_cross_owner_public_exhibits status 404 code PGRST205
moderation_reports status 200 rows 1
```

Hosted API route smoke check:

```text
GET /persona-encounters/cross-owner-public-exhibits/not-real
status 404
body {"error":"Cross-owner public exhibit not found."}
```

## Validation

```text
node .tmp\pr517b-hosted-proof.mjs
node .tmp\pr517b-rest-targets.mjs
```

Result: fail.

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Defect

Hosted migration `080_persona_encounter_cross_owner_public_exhibits.sql` is not
available in the Railway Supabase schema used by the hosted REST endpoint.

Until that migration is applied and visible to PostgREST, PR517B cannot verify
the PR517A contract on staging.

## Next

MIMIR should route a deploy/migration readiness fix or rerun instruction before
asking ARIADNE to repeat PR517B.
