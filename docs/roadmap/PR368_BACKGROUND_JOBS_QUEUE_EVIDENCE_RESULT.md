# PR368 - Background Jobs Queue Evidence Refresh Result

Date: 2026-06-26
Owner: DAEDALUS
Status: READY FOR MIMIR

## Verdict

PASS - no worker activation.

The current repo evidence does not justify adding BullMQ, Redis/Valkey worker
runtime, Cloudflare Queue, a production worker process, Redis Memory truth, or
new queue infrastructure.

PR364 through PR367 improved owner trust/readback for export, Global Archive
search, import intake, and publishing without producing a measured latency,
timeout, retry, flakiness, or fanout problem that requires background execution.

## Evidence Reviewed

| Area | Evidence | Result |
| --- | --- | --- |
| Background job service | `apps/api/src/services/background-jobs.service.ts` and `background-jobs.service.test.ts` | Active job readback maps to existing `import_jobs` and `export_packages`; route-followup kinds remain inactive; status transitions, retry metadata, idempotency keys, and sanitizers are tested. |
| Owner job route | `apps/api/src/routes/background-jobs.ts` and `background-jobs.test.ts` | `GET /background-jobs` requires auth, returns only owner-scoped import/export summaries, redacts unsafe labels, and reports route-followup kinds as inactive. |
| Queue/cache readiness | `apps/api/src/routes/health.ts`, `apps/api/src/services/readiness.service.ts`, `apps/api/src/routes/health.test.ts` | Upstash REST is reported as cache-only, not worker queue readiness. TCP Redis/Valkey is queue-capable config only when present. No provider still reports protected-alpha inline fallback. |
| Operational cache | `apps/api/src/services/operational-cache.service.ts` | Upstash REST supports operational cache/idempotency/rate-limit/short-lived queue-state keys only; no TCP worker queue client or BullMQ adapter is active. |
| Replay readiness | `apps/api/src/services/replay-readiness.service.ts` and `apps/api/src/routes/replay-readiness.test.ts` | Replay remains measurement-first and authenticated; job-failure recovery capture surfaces use statuses and sanitized errors, not raw private payloads. |
| PR149-PR157 measurement notes | `docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md` and `docs/roadmap/STATION_FUTURE_LANES.md` | The only measured latency loop was Archive retrieval; it was addressed by batching/remeasurement, not worker activation. |
| Recent trust lanes | PR364, PR365, PR366, PR367 result docs | These lanes clarified export, archive search, import, and publishing trust/readback. None changed API persistence, queue runtime, worker runtime, Redis Memory truth, or provider behavior. |

## PR368 Questions

1. Is any current replay/import/export/Developer Space flow demonstrably blocked
   by synchronous execution?

   No. Current evidence shows owner-visible readback and prior Archive
   retrieval latency repair, not a remaining synchronous execution blocker.

2. Does the owner already have enough job status/readback?

   Yes for current protected-alpha flows. Imports expose list/status/retry
   routes, exports expose package status/readback, and `/background-jobs`
   consolidates owner-scoped import/export summaries with queued, processing,
   completed, failed, retry, and sanitized error context.

3. Are inactive route-followup job kinds still honest?

   Yes. `embedding_backfill`, `memory_consolidation`, `replay_seed_setup`, and
   `developer_space_import_batch` remain inactive route-followup kinds. No
   owning route has grown enough in this audit to justify activation.

4. Does Upstash REST need clearer cache-only labeling?

   Not in code. Health readiness already says Upstash REST is cache-only and
   not BullMQ-compatible worker queue readiness. The docs now restate that
   posture for the current main audit.

5. If TCP Redis/Valkey is absent, does the repo avoid claiming worker queue
   readiness?

   Yes. The absence path reports `workerQueueReady: false`,
   `queueConfigured: false`, and protected-alpha inline fallback required.

6. If a worker is recommended, what exact job opens it?

   No worker is recommended now. A future worker lane should open only when a
   named flow has measured pain and a narrow contract:

   - job kind: one concrete kind, not a generic platform worker;
   - payload: owner id plus durable resource ids/status metadata only, with no
     prompts, private archive bodies, provider payloads, raw URLs, bearer
     values, API keys, secrets, or raw transcripts;
   - ownership: owner-scoped read/write checks before enqueue, execution, and
     readback;
   - retry: bounded attempt count, safe status transitions, sanitized failure
     labels, idempotency key, and owner-visible retry outcome;
   - validation: focused service tests, route tests, `/health/deployment`
     readiness tests, and replay evidence proving the worker solves the
     measured problem.

## Patch Scope

Docs-only reconciliation. No code, schema, migration, queue adapter, worker
runtime, Redis/Valkey behavior, Upstash behavior, Memory truth, Developer Space
behavior, provider behavior, auth, billing, Railway config, or Supabase config
changed.

## Validation

DAEDALUS ran the focused current-main gates:

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:jobs` | Pass, 9 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass, 18 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass, 2 tests |
| `git diff --check` | Pass, CRLF normalization warnings only |

## Handoff

Wake MIMIR. Recommended next decision: close PR368 as no-worker activation, then
choose the next roadmap lane from current product/staging evidence. Do not open
background worker infrastructure unless the trigger criteria above are met.
