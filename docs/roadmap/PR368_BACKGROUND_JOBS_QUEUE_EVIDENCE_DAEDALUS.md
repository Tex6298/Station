# PR368 - Background Jobs Queue Evidence Refresh

Date opened: 2026-06-26
Opened by: A1 / MIMIR
Owner: DAEDALUS audits and patches only if the gap is bounded. ARGUS reviews
any code/docs change. ARIADNE is not required unless visible hosted behavior
changes.
Status: completed by DAEDALUS; awaiting MIMIR closeout.

## Why This Lane

PR367 closed the publishing trust readback lane. PR364 through PR367 have now
made export, Global Archive search, import intake, and publishing trust more
legible without adding workers, queues, Cloudflare, provider swaps, schema
changes, or config demands.

Redis/Upstash config exists in the environment, but the repo's accepted posture
is still evidence-led:

- Upstash REST is operational cache/idempotency/rate-limit support, not a
  BullMQ-compatible worker queue.
- TCP Redis/Valkey would be queue-capable config if present, but protected-alpha
  inline fallback remains available.
- Redis is not canonical Memory truth.
- Worker activation needs a named painful flow, owner-visible job status, and
  payload/privacy rules before implementation.

DAEDALUS should refresh that evidence against the current repo so the team does
not drift into either stale no-worker dogma or premature infrastructure.

## Goal

Decide whether current protected-alpha evidence now justifies a real queue or
worker lane.

Default expectation: if no measured flow is blocked by latency, timeout,
flakiness, retry need, or fanout pain, do not implement a worker. Instead, patch
only the smallest no-config readback/docs gap that keeps the current state
honest.

## Scope

Inspect the current implementations and docs for:

- `apps/api/src/services/background-jobs.service.ts`;
- `apps/api/src/routes/background-jobs.ts`;
- health/deployment queue/cache readiness;
- import job status/retry readback;
- export package status/readback;
- Developer Space observed-runtime ingestion/fanout posture;
- staged replay timing/measurement notes after PR149 through PR157;
- recent trust/readback lanes PR364 through PR367.

Answer these questions with repo evidence:

1. Is any current replay/import/export/Developer Space flow demonstrably blocked
   by synchronous execution?
2. Does the owner already have enough job status/readback to understand queued,
   processing, completed, failed, and retryable work?
3. Are inactive route-followup job kinds still honest, or has any route grown
   enough to need activation?
4. Does Upstash REST need clearer labeling as cache-only in any owner-visible or
   readiness surface?
5. If TCP Redis/Valkey is absent, does the repo avoid claiming worker queue
   readiness?
6. If a worker is recommended, what exact job kind, payload shape, ownership
   boundary, retry behavior, and validation gate would open it?

## Patch Permission

Patch only if the gap is small and bounded, for example:

- clearer readiness/readback copy that distinguishes Upstash REST cache support
  from worker queue readiness;
- a missing sanitizer/readback guard in existing background-job helpers;
- a small docs update that reconciles current PR364-PR367 evidence with the
  accepted no-worker-or-worker trigger criteria.

If the audit finds a larger implementation need, do not start it in PR368. Wake
MIMIR with the exact recommended next lane and trigger evidence.

## Non-Scope

Do not add:

- BullMQ, Redis, ValKey, or Cloudflare Queue worker runtime;
- a production worker process;
- Redis as canonical Memory truth or vector truth;
- provider/model/embedding migration;
- Cloudflare retrieval;
- new database schema or migrations;
- broad job dashboard UI;
- new staged data;
- billing, auth, Railway, or Supabase config changes.

## Validation

If code changes:

```bash
npm exec --yes pnpm@10.32.1 -- run test:jobs
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If docs-only:

```bash
git diff --check
```

## Handoff

If no implementation is justified, wake MIMIR with:

- `PASS - no worker activation`;
- exact evidence reviewed;
- trigger criteria for the future worker lane;
- whether any docs/readback patch was made.

If a bounded patch is made, wake ARGUS with:

- files changed;
- why the patch is evidence refresh/readback only;
- proof no worker/queue runtime or Memory-truth change was added;
- validation output.
