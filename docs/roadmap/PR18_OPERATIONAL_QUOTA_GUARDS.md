# PR18 - Operational Quota Guards

Date: 2026-06-17
Status: implemented by A2 / DAEDALUS; ready for A3 / ARGUS review
Owner: DAEDALUS implementation, ARGUS review, ARIADNE only if visible quota UI
changes materially.

## Why This Lane Is Next

PR14 through PR17 made imports safer: explicit parsers, truthful job boundary,
durable file job pointers, and import-backed review candidates. Before Station
opens Reddit intake, heavier worker execution, export-package jobs, or partner
Developer Space expansion, the backend needs hard quota guards with
machine-readable errors.

This lane should not redesign billing or pricing. It should enforce the limits
Station already knows enough to enforce.

## Goal

Add narrow, testable quota guards around the surfaces most likely to grow usage
or cost during replay:

- queued/processing import jobs;
- export package generation attempts;
- Developer Space ingestion writes;
- embedding-producing archive writes where an API key/provider is configured.

The replay proof should be:

> Station refuses over-limit operational work before doing expensive or
> irreversible work, returns a clear machine-readable error, preserves existing
> owner/private data, and does not require new secrets or live external services
> to validate locally.

## Current Baseline

- Storage byte reservation exists through `storage_usage` and
  `reserveStorageBytes`.
- Token usage and top-ups exist through `token_usage` and
  `token_transactions`.
- Developer Space usage counters exist in `developer_space_usage`, with limits
  in `apps/api/src/services/developer-space-usage.service.ts`.
- Import jobs have owner/persona/status fields and now durable file pointers.
- Export packages have status rows, but export generation is not yet a full
  worker lane.
- Embedding calls are attempted during archive memory writes when an embedding
  API key is configured, but there is no narrow operational guard around
  embedding-producing import/archive writes.

## Scope

Quota/error contract:

- Add or reuse a small quota error helper with stable fields such as
  `code`, `resource`, `limit`, `used`, `retryAfter`, and human `error`.
- Do not include secrets, private text, source payloads, provider keys, or raw
  storage URLs in quota responses.
- Prefer HTTP 429 for rate/queue saturation and 402/413 only where existing
  token/storage semantics already require them.

Import/job guards:

- Add a per-owner or per-owner/per-persona limit for queued/processing import
  jobs before creating more work.
- Keep completed/failed historical rows from blocking forever unless the limit
  intentionally counts a recent time window.
- Preserve duplicate/idempotent registration behavior from PR16.

Export guards:

- Prevent unbounded concurrent export package generation attempts for the same
  owner/target.
- Do not redesign export bundles or move exports to workers in this lane.
- Keep existing owner-only export readback behavior intact.

Developer Space guards:

- Enforce existing Developer Space usage limits before accepting node, event,
  snapshot, public-read, or export usage increments where those routes already
  record usage.
- Return machine-readable quota errors rather than silently recording over-limit
  counters.
- Preserve institutional/unlimited semantics.

Embedding/archive guards:

- Add a bounded guard before embedding-producing archive writes if the repo has
  a natural existing usage mechanism.
- If a durable embedding usage table would be required, document the exact gap
  and implement only a conservative per-request/per-job guard in this lane.
- Do not change embedding provider selection, vector dimensions, Gemini/OpenAI
  behavior, or reindexing.

## Out Of Scope

- Stripe product/pricing redesign.
- Full billing entitlement redesign.
- New top-up products.
- BullMQ/Redis worker deployment.
- Reddit OAuth/import.
- Export worker redesign.
- Cloudflare retrieval, vector reindexing, Redis memory truth, public
  publishing, full import review UI, or UI reskin.

## Validation

Minimum local gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:token-credits
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add `test:billing` only if Stripe checkout/webhook behavior changes.

## Required Tests

- Import job queue saturation rejects new non-duplicate work before file rows or
  storage reservations are left behind.
- Duplicate exact file registration still returns idempotently under the guard.
- Export package concurrency guard blocks duplicate in-progress generation for
  the same owner/target.
- Developer Space usage increments fail before exceeding configured limits, and
  institutional/unlimited limits still pass.
- Quota error payloads are machine-readable and secret-free.
- Existing token/storage tests still pass.
- Existing PR17 import review candidate path still passes.

## DAEDALUS Implementation Notes

- Added `apps/api/src/services/operational-quota.service.ts` with a stable
  quota error body: `error`, `code: "quota_exceeded"`, `resource`, `limit`,
  `used`, and optional `retryAfter`.
- Active import jobs are capped at 5 queued/processing jobs per owner/persona.
  Exact duplicate file registration still returns idempotently before the guard.
- Export packages are capped at 1 requested/processing package per owner/target
  for persona archives and Developer Space archives.
- Developer Space ingestion calls check existing usage limits before writing
  node, event, snapshot, batch import, storage-byte, or export usage. Canon
  limits still block at the configured counters; institutional `-1` limits pass.
- Embedding-producing archive writes are capped at 24 chunks per request when an
  embedding API key/provider is configured. This is the conservative per-request
  guard for this slice; no durable embedding-usage table was added.
- No migration or DB type change was needed.

## Handoff To ARGUS

Wake A3 / ARGUS with:

- quota helper/error shape;
- exact limits chosen and where they are enforced;
- whether any migration/type changes were needed;
- import/export/Developer Space/embedding guard behavior;
- duplicate/idempotency behavior under quota pressure;
- validation commands and results;
- caveats about deferred billing redesign, Reddit, workers, exports, Cloudflare,
  vectors, Redis memory truth, and UI.

ARGUS should review quota overclaiming, error-shape stability, owner scoping,
rollback/idempotency, billing/pricing drift, provider-secret leakage, and
accidental scope creep.
