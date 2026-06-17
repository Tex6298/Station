# PR15 - Background Job Boundary

Date: 2026-06-17
Status: ready for A3 / ARGUS review
Owner: DAEDALUS implementation, ARGUS review, ARIADNE only if user-visible job
status UI changes materially.

## Why This Lane Is Next

PR14 closed the first external conversation import parser slice. It deliberately
left background workers, Reddit import, export bundle generation, and broader
candidate/review routing out of scope.

The next launch-core risk is not another parser. It is the job boundary that
lets imports, exports, memory extraction, and later Reddit intake run with
recoverable owner-visible status instead of hidden fire-and-forget work.

## Goal

Create the narrow background-job boundary Station needs for launch-core replay:

- one place to describe queue/provider readiness without printing secrets;
- one service boundary for enqueue/claim/run/fail/complete semantics;
- one first job path proved end-to-end, preferably the existing file import
  processing path because it already has `import_jobs` and failure states;
- no dependency on missing production config for local tests.

The replay proof should be:

> Station can record a queued owner-scoped job, run it through the same safe
> processing code used today, expose status without leaking private payloads,
> fail safely, and report whether Redis/Valkey/Upstash is configured without
> pretending an incompatible provider is a worker queue.

## Current Baseline

- `apps/api/src/services/background-jobs.service.ts` currently contains import
  job serializers, status helpers, and error sanitization.
- `apps/api/src/services/archive.service.ts` processes uploaded files directly
  through `processUploadedFile`.
- `apps/api/src/routes/persona-files.ts` still has a fire-and-forget
  `processUploadedFile(...).catch(...)` path after file registration.
- `import_jobs` already records owner, persona, kind, status, source name, and
  owner-visible error text.
- `export_packages` records package status, but export generation is still not
  a general queue.
- Env already distinguishes `REDIS_URL`, `REDIS_PRIVATE_URL`, `VALKEY_URL`,
  `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN`.

## Provider Rule

Be explicit:

- `REDIS_URL`, `REDIS_PRIVATE_URL`, or `VALKEY_URL` can represent a TCP Redis /
  Valkey queue target.
- `UPSTASH_REDIS_REST_URL` plus `UPSTASH_REDIS_REST_TOKEN` is useful for REST
  cache/readiness, but it is not automatically a BullMQ-compatible worker queue.
- If only Upstash REST is present, do not claim BullMQ readiness. Either keep the
  lane on a database-backed job boundary or expose "cache configured, queue
  provider not configured" in readiness.
- Do not block local tests on live Railway, Supabase, Redis, or Upstash network
  access.

## Scope

Implementation:

- Add a small job boundary under `apps/api/src/services/` or `apps/api/src/jobs/`
  using the repo's current patterns.
- Reuse `import_jobs` for the first proven path unless a tiny shared job table is
  truly necessary.
- Move the uploaded-file processing trigger behind an explicit job runner
  function so tests can run it deterministically.
- Preserve the current protected-alpha ability to process immediately when no
  worker is running, but make that behavior visible as "inline fallback" rather
  than pretending a worker exists.
- Keep job rows owner-scoped and sanitized.
- Expose queue/readiness status through the existing health/deployment surface
  if that is already the local pattern.
- Ensure failed jobs do not delete successful prior archive/export data.
- Ensure duplicate registration remains idempotent.

Tests:

- Prove an import job can be queued, claimed/run, completed, and serialized for
  the owner.
- Prove failure stores a sanitized error and leaves existing archive material
  intact.
- Prove non-owners cannot read or retry another user's job.
- Prove readiness distinguishes TCP Redis/Valkey queue config from Upstash REST
  cache config without printing secrets.
- Preserve PR14 parser behavior, including `.json` extension authority.

## Out Of Scope

- Reddit OAuth/import.
- Discord production parser.
- Full BullMQ worker deployment if TCP Redis/Valkey config is absent.
- QStash or another new queue vendor unless MIMIR explicitly opens it.
- Memory candidate review redesign.
- Export bundle redesign beyond preserving existing status behavior.
- Public publishing, UI reskin, Cloudflare retrieval, vector reindexing, or
  Redis as memory truth.
- Broad quota enforcement across every surface. Quota errors touched by this
  lane should be job-related and machine-readable only.

## Validation

Minimum local gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add `test:token-credits` only if the implementation touches token or paid usage
limits.

## Handoff To ARGUS

Wake A3 / ARGUS with:

- files changed and whether any migration was added;
- exact queue/readiness behavior for Redis TCP, Valkey, Upstash REST, and no
  queue config;
- which job path is now deterministic;
- inline fallback behavior and why it remains safe;
- owner-scope, duplicate-guard, failure, and sanitization evidence;
- validation commands and results;
- caveats about deferred Reddit, candidate review, export workers, and broad
  quota enforcement.

ARGUS should review queue overclaiming, config truthfulness, owner scoping,
private payload redaction, failure recovery, idempotency, and accidental scope
creep.

## DAEDALUS Implementation Notes

- No migration was added.
- The first deterministic job path is uploaded persona-file import processing.
  `apps/api/src/services/file-import-jobs.service.ts` claims an existing
  owner-scoped `import_jobs` row, runs `processUploadedFile`, serializes the
  resulting job, and treats reruns with existing archive rows as idempotent.
- `processUploadedFile` now accepts an optional `jobId` and applies processing,
  completed, and failed status updates to that exact job when provided.
- `apps/api/src/routes/persona-files.ts` no longer hides immediate processing
  as an unnamed fire-and-forget call. Registration responses include
  `jobExecution.mode`:
  - `queued` when `processImmediately` is false.
  - `inline_fallback` when protected-alpha immediate processing is started
    without a worker queue.
- Deployment readiness now includes `readiness.redis.queue`:
  - `redis_tcp` when `REDIS_URL` or `REDIS_PRIVATE_URL` is present.
  - `valkey_tcp` when `VALKEY_URL` is present without Redis.
  - `upstash_rest_cache_only` when only Upstash REST URL/token are present.
  - `not_configured` when no queue/cache provider is configured.
- Upstash REST is reported as cache-only and never as BullMQ-compatible worker
  queue readiness.
- Caveat: `import_jobs` does not durably store `file_id` or `storage_path`.
  This lane keeps the deterministic runner fed by the registered file pointer
  available at route/test time. A future true worker should add a narrow durable
  file pointer before claiming jobs independently from the database.

Validation run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```
