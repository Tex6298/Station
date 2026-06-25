# PR304 - API Readiness Migration Timeout Result

Owner: DAEDALUS
Date: 2026-06-25
Status: PASS WITH CAVEATS - accepted by ARGUS

## Result

ARGUS accepts PR304 with no product patch. DAEDALUS patched API deployment readiness so migration-object/RPC proof remains
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
| `git diff --check` | Pass | Whitespace check passed. |
| `git diff --cached --check` | Pass | Staged whitespace check passed during ARGUS review. |
| Added-line hygiene scan | Pass | No credentials, credentialed URLs, UUID-shaped ids, raw prompts, raw completions, private source bodies, or secret-bearing env values found. |

## Residual Hosted Risk

This patch improves the API readiness code path, but it does not prove hosted
Railway/Supabase behavior until the API deploys this commit and ARIADNE or
MIMIR rechecks `/health/deployment`.

If hosted readiness still reports `readiness.migrations.ok=false`, the response
should now identify the exact proof id and enum error without exposing secrets.

## ARGUS Verdict

PASS WITH CAVEATS.

ARGUS accepts PR304 and wakes MIMIR.

WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR304 API Readiness Migration Timeout with no product patch.
- Migration readiness remains required for deployment `ready:true`; no proof was removed.
- Migration object/RPC proofs now use a dedicated bounded 5s timeout instead of the generic 1.5s readiness timeout.
- Public object and active embedding RPC proofs run independently.
- `/health/deployment` now returns sanitized `readiness.migrations.proofs` entries using only bounded proof ids, `ok`, `checked`, and enum error values.
- The bounded proof ids are `memory_columns`, `developer_space_policy`, `documents_version`, `document_versions`, `memory_rpc`, and `archive_rpc`.
- The readiness response does not expose SQL, database URLs, tokens, cookies, raw ids, prompts, completions, provider payloads, private source bodies, or secret values.
- PR303 selected-pair product behavior, provider/model selection, embedding, retrieval, context assembly, schema, seed, import, Redis, Cloudflare, queue, worker, billing, Stripe, public UI, and Studio UI behavior were not changed.
Validation:
- `npm exec --yes pnpm@10.32.1 -- run test:health` passed, 17 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed, 2 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed, 2 turbo tasks from cache.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing web raw `<img>` warnings only.
- `git diff --check` passed.
- `git diff --cached --check` passed.
- Added-line hygiene scan found no credentials, credentialed URLs, UUID-shaped ids, raw prompts, raw completions, private source bodies, or secret-bearing env values.
Recommendation:
- Coordinate deploy/readiness recheck.
- If API `/health/deployment` is ready on PR304 or later, resume PR303 hosted product evidence.
- If migrations remain non-ready, use the sanitized proof id and enum error to route the next fix.
