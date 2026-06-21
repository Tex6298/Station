# PR147 - Background Jobs Activation Audit

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS audits or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible route behavior changes.
Status: closed by MIMIR on 2026-06-21.

## Why This Lane

MIMIR closes PR146 Memory Graph Relationship Readback after ARGUS technical
acceptance and ARIADNE Persona Management rehearsal.

Lane 6 has delivered the current Memory UX/observability pass. The next
roadmap lane is Lane 7: decide when Station needs real background
infrastructure instead of protected-alpha synchronous flows. The repo already
has a background job registry, import/export status readback, retry metadata,
operational-cache helpers, and queue-provider readiness reporting. It should
not jump to BullMQ/Redis workers without evidence.

This lane should decide the first real background-job activation target, or
explicitly keep the current inline fallback posture.

## Goal

Produce a background-jobs activation audit and next-lane recommendation.

DAEDALUS should determine whether current replay/import/export/developer-space
flows justify opening an actual queue/worker lane now, and identify the smallest
safe next implementation if they do.

## Scope

Inspect:

- `apps/api/src/services/background-jobs.service.ts`;
- `apps/api/src/services/operational-cache.service.ts`;
- `apps/api/src/services/readiness.service.ts`;
- archive import and retry routes/tests;
- export package routes/tests;
- Developer Space import/webhook batch routes/tests;
- replay-readiness docs and service;
- `docs/roadmap/STATION_FUTURE_LANES.md`;
- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`;
- `docs/roadmap/STATION_BACKEND_IMPLEMENTATION_ROADMAP.md`.

Answer these directly:

- Are archive import backfills slow or failure-prone enough to need queued
  workers now?
- Is memory reindex or embedding backfill currently open, or still deferred?
- Do export packages need retryable package assembly now?
- Do Developer Space imports/webhooks need queue fanout now, or do current
  receipt/idempotency guards suffice?
- Does replay seed/setup need a job surface, or is script/manual replay still
  enough?
- Does Railway/Redis/Upstash config currently support a worker queue, or only
  cache/idempotency/rate-limit state?
- What owner-visible failed-job/status readback exists today, and what is
  missing?

If DAEDALUS finds a narrow correctness/readiness wording gap, patch it. If not,
produce a concise audit doc and next-lane recommendation.

## Expected Output

Add a short audit packet, likely:

- `docs/roadmap/BACKGROUND_JOBS_ACTIVATION_AUDIT.md`.

Update the relevant active roadmap docs with:

- current queue provider posture;
- which candidate trigger is active or inactive;
- whether PR148 should be a queue adapter, owner job-status UI/readback patch,
  export assembly retry lane, archive import retry lane, Developer Space import
  batch lane, or no queue yet.

## Non-Scope

Do not add:

- BullMQ/Redis/Valkey worker runtime;
- production worker process;
- Redis as canonical Memory truth;
- Cloudflare Queue/Worker implementation;
- background processing for every candidate at once;
- public job status;
- broad UI redesign;
- provider/embedding migration;
- migration-ledger repair.

Open a real implementation lane only after this audit names the trigger and
acceptance gates.

## Tests

Run the focused validation for any touched area. Baseline expected commands:

```bash
npm exec --yes pnpm@10.32.1 -- run test:jobs
npm exec --yes pnpm@10.32.1 -- run test:cache
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If archive import, export package, or Developer Space behavior changes, add the
matching test script and name why.

## ARGUS Review Requirements

ARGUS should verify:

- the audit does not overclaim queue readiness from Upstash REST cache-only
  config;
- Redis/Valkey remains cache, queue, idempotency, rate-limit, or short-lived
  job state only, not Memory truth;
- private data is not proposed for queue payloads/logs;
- owner-visible failure/status readback is addressed before retry workers;
- any code patch is narrow and tested;
- the next recommended lane has concrete acceptance gates.

## DAEDALUS Implementation Notes

Implemented on 2026-06-21.

Audit packet:

- `docs/roadmap/BACKGROUND_JOBS_ACTIVATION_AUDIT.md`

Verdict:

- Do not activate a real queue/worker lane yet.
- Current evidence supports protected-alpha inline fallback plus staged replay
  measurement.
- Upstash REST remains cache-only and must not be treated as worker queue
  readiness.
- TCP Redis/Valkey is queue-capable config when present, but the repo still
  keeps inline fallback available and has no broad worker runtime.
- PR148 should be no worker implementation by default. If MIMIR wants one more
  Lane 7 implementation before replay, make it owner-only background job status
  readback/consolidation, not BullMQ/Redis/Valkey worker runtime or Cloudflare
  Queue work.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:jobs` passed with 5 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:cache` passed with 5 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:health` passed with 16 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed with 2
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.

## ARGUS Review

Accepted on 2026-06-21 after a narrow wording patch.

ARGUS findings:

- The audit does not activate BullMQ, Redis/Valkey worker runtime, Cloudflare
  Queue/Worker, a production worker process, broad background processing,
  public job status, or Redis Memory truth.
- The no-worker recommendation is justified by current evidence: import/export
  flows already have owner-scoped durable status/readback, Developer Space
  observed-runtime has receipt/idempotency/failure guards, and replay seed/setup
  remains manual/scripted until measured pain appears.
- Upstash REST is described as cache/idempotency/rate-limit support only, not
  BullMQ-compatible worker queue readiness.
- TCP Redis/Valkey is described as queue-capable config when present, with
  protected-alpha inline fallback still available and no broad worker runtime.
- ARGUS tightened `docs/roadmap/STATION_FUTURE_LANES.md` so Redis/Valkey Memory
  truth is not an accepted current role; any Redis-backed Memory-truth design
  requires a separate MIMIR lane plus ARGUS privacy review.
- The PR148 recommendation remains MIMIR-owned: default to staged replay
  measurement; if MIMIR opens PR148 before replay, make it owner-only background
  job status/readback consolidation, not worker infrastructure.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:jobs` passed with 5 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:cache` passed with 5 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:health` passed with 16 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed with 2
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.

No visible route behavior changed, so ARIADNE rehearsal is not required.

## MIMIR Closeout

MIMIR closes PR147 on 2026-06-21.

PR147 is accepted as a no-worker activation audit. MIMIR accepts ARGUS's
verdict: keep protected-alpha inline fallback plus staged replay measurement;
do not open BullMQ, Redis/Valkey worker runtime, Cloudflare Queue, or broad
worker infrastructure yet.

Next lane: `PR148 - Owner Background Job Status Readback`. This is the only
pre-replay Lane 7 implementation MIMIR is opening: consolidate existing
owner-scoped import/export job status readback without activating workers.
