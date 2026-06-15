# Staging alpha closure status

Date: 2026-06-15

Status: PR 0 closure/evidence alignment for
`docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`.

This document closes the accepted Railway staging replay as alpha-proof, not as
a product-complete backend claim. It records source/live evidence that current
staging is coherent enough to move from broad "backend not built" churn into the
bounded backend/product lanes in the plan.

## Boundary

Alpha-proof means:

- the Railway web and API services are live for the current staging line;
- source-visible readiness endpoints prove the configured staging dependencies
  without exposing secrets;
- accepted replay/human rehearsal docs show the current user journey can be
  exercised end to end in protected-alpha conditions;
- remaining backend work is optimization, robustness, and productization.

Product-complete is not claimed. In particular, this status does not claim:

- production-grade retrieval quality;
- fully hardened import/archive failure behavior;
- paid activation has been commercially proven beyond current test-mode config;
- Redis is canonical memory;
- workers, queues, or Cloudflare retrieval are required or implemented.

## Current live proof

Checked from this repo shell on 2026-06-15.

| Target | Command | Result |
| --- | --- | --- |
| API health | `curl.exe -fsS --max-time 20 https://stationapi-production.up.railway.app/health` | `{"ok":true}` |
| Web health | `curl.exe -fsS --max-time 20 https://stationweb-production.up.railway.app/health` | `{"ok":true}` |
| API deployment readiness | `curl.exe -fsS --max-time 20 https://stationapi-production.up.railway.app/health/deployment` | `ok:true`, `ready:true`, Railway commit `bfe60aa23d3a9b014e3b18f7520d9b7e719279b6`, branch `main`, service `@station/api` |
| Web deployment identity | `curl.exe -fsS --max-time 20 https://stationweb-production.up.railway.app/health/deployment` | `ok:true`, `ready:true`, Railway commit `bfe60aa23d3a9b014e3b18f7520d9b7e719279b6`, branch `main`, service `@station/web` |
| Replay readiness route boundary | `curl.exe -fsS --max-time 20 https://stationapi-production.up.railway.app/observability/replay-readiness` | HTTP `401` unauthenticated, matching the repo test that replay-readiness is behind auth |

The deployment readiness response reported only sanitized booleans/metadata. No
secret values were copied into this document.

## Dependency readiness claims

The live API `/health/deployment` response is the current source for these
staging claims:

- Railway: web and API are deployed from `Tex6298/Station`, branch `main`, at
  commit `bfe60aa23d3a9b014e3b18f7520d9b7e719279b6`.
- Supabase: URL, anon key, service-role key, database URL, private
  `persona-files` bucket, migrations proof, and Auth redirect proof all report
  ready.
- Gemini: the selected embedding profile is `station_free_1536`, provider
  `gemini`, with Gemini embeddings configured.
- NVIDIA: platform chat is configured through the NVIDIA provider path.
- Stripe: billing secrets and configured price IDs report ready for staging
  test-mode paths.
- Redis: cache config reports ready through Upstash REST, with Railway Redis
  false. Redis is infrastructure support, not canonical memory truth.
- Deployment identity: both web and API expose non-secret Railway identity and
  readiness metadata.

Repo-side source references:

- Railway staging shape and service boundaries:
  `infra/railway/README.md`.
- Staging replay setup and evidence index:
  `docs/ops/STAGING_REPLAY_READINESS.md`.
- API readiness implementation and tests:
  `apps/api/src/routes/health.ts` and `apps/api/src/routes/health.test.ts`.
- Web deployment identity implementation and tests:
  `apps/web/app/health/deployment/route.ts`,
  `apps/web/lib/deployment-identity.ts`, and
  `apps/web/lib/deployment-identity.test.ts`.
- Replay-readiness auth boundary and tests:
  `apps/api/src/services/replay-readiness.service.ts` and
  `apps/api/src/routes/replay-readiness.test.ts`.

## Accepted replay evidence

The current accepted replay evidence is documented in:

- `docs/roadmap/LIVE_STAGING_REPLAY_REVIEW_ARIADNE.md`
- `docs/roadmap/ARIADNE_HUMAN_REHEARSAL_REVIEW.md`
- `docs/roadmap/SETTINGS_PLACEHOLDER_RECHECK_ARIADNE.md`
- `docs/roadmap/SETTINGS_MOBILE_LAYOUT_RECHECK_ARIADNE.md`

Those reviews establish that the protected-alpha staging journey is good enough
for alpha proof after the accepted `/settings` follow-ups. They do not close the
backend/product optimization lanes now listed in
`docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`.

## PR 0 validation

Run from this Windows repo shell on 2026-06-15:

| Command | Result | Notes |
| --- | --- | --- |
| `npx --yes pnpm@10.32.1 test:health` | Pass | 11 tests passed. |
| `npx --yes pnpm@10.32.1 test:replay-readiness` | Pass | 1 replay-readiness test passed after required package builds. |
| `npx --yes pnpm@10.32.1 --filter @station/api build` | Pass | API and required shared package builds passed. |
| `npx --yes pnpm@10.32.1 --filter @station/web build` | Local environment failure after compile/type/page generation | Next compiled successfully, lint/type checks ran, and 28 static pages generated. The build then failed while writing standalone traced files because this Windows shell cannot create Next symlinks: `EPERM: operation not permitted, symlink ... react -> apps\\web\\.next\\standalone...`. Treat Railway/Linux as decisive for this standalone artifact. |
| Live API/web `/health` | Pass | Both returned `{"ok":true}`. |
| Live API/web `/health/deployment` | Pass | Both returned `ok:true`, `ready:true`, Railway commit `bfe60aa23d3a9b014e3b18f7520d9b7e719279b6`. |
| `git diff --check` | Pass | No whitespace errors before committing PR 0 docs. |

## Exit decision

PR 0 can be considered complete when ARGUS accepts this document for overclaim
and no-secret safety. The next implementation lane should be PR 1 from
`docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`: replay memory/retrieval
quality. Do not reopen broad UI or create Redis/Cloudflare/worker lanes unless
new replay evidence forces a bounded lane.
