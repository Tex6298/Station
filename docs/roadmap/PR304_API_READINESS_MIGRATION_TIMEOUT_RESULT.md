# PR304 - API Readiness Migration Timeout Result

Owner: DAEDALUS
Date: 2026-06-25
Status: Implemented - ARGUS review pending

## Result

DAEDALUS patched API deployment readiness so migration-object/RPC proof remains
a strict readiness gate but no longer collapses a hosted timeout into an opaque
top-level `readiness.migrations.error=timeout`.

Best-supported root cause: the hosted migration proof was using the generic
1.5s readiness timeout for each public object/RPC probe and reported only the
first generic failure. A cold or slow Supabase/PostgREST object or RPC proof
could therefore block `/health/deployment` without naming the slow proof.

## Code Paths Inspected

- `apps/api/src/services/readiness.service.ts`
- `apps/api/src/routes/health.ts`
- `apps/api/src/routes/health.test.ts`
- `apps/api/src/routes/replay-readiness.test.ts`

## Files Changed

- `apps/api/src/services/readiness.service.ts`
- `apps/api/src/routes/health.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/PR304_API_READINESS_MIGRATION_TIMEOUT_RESULT.md`

## Implementation

- Added a dedicated 5s timeout for migration object/RPC proof checks.
- Kept migration readiness blocking `ready:true`; no proof was removed.
- Ran the public object and active embedding RPC proofs independently.
- Added a sanitized `readiness.migrations.proofs` array with only proof ids,
  `ok`, `checked`, and enum error values.
- Proof ids are non-secret and bounded:
  `memory_columns`, `developer_space_policy`, `documents_version`,
  `document_versions`, `memory_rpc`, and `archive_rpc`.
- If a proof times out, the top-level migration error remains `timeout` and the
  matching proof entry identifies which proof timed out.
- If an object/RPC is missing or returns an error, the top-level migration error
  remains `query_failed` and the matching proof entry identifies the failed
  proof.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass | 17 tests passed, including migration proof success, query failure, RPC failure, timeout naming, and secret sanitization. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with known warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |

Whitespace checks are still required after staging this result doc.

## Residual Hosted Risk

This patch improves the API readiness code path, but it does not prove hosted
Railway/Supabase behavior until the API deploys this commit and ARIADNE or
MIMIR rechecks `/health/deployment`.

If hosted readiness still reports `readiness.migrations.ok=false`, the response
should now identify the exact proof id and enum error without exposing secrets.

## Next Owner

ARGUS should hostile-review the readiness contract change, especially:

- migration proof remains required for `ready:true`;
- `proofs` does not leak SQL, credentials, ids, payloads, or private content;
- the 5s migration proof budget is bounded and readiness-only;
- independent RPC proof execution does not hide failures;
- the PR303 selected-pair product bar remains unchanged.

If accepted, ARGUS should wake MIMIR to coordinate deploy/readiness recheck and
then resume PR303 hosted product evidence.
