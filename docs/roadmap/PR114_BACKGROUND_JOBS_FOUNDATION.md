# PR114 - Background Jobs Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible route behavior changes.
Status: open for DAEDALUS

## Why This Lane

PR113 closed the operational cache foundation. The next backend roadmap item is
BE-06 Background jobs.

Station has several protected-alpha flows that can become slow or failure-prone
as staging replay grows: archive text extraction, embedding backfill, memory
consolidation, export package assembly, replay seed/setup, and Developer Space
import batches. Before moving any of those into asynchronous execution, Station
needs a small job-status and idempotency foundation that owners can inspect and
ARGUS can audit.

## Goal

Add the smallest background-job foundation needed for replay-ready backend work:
durable job records or equivalent status tracking, safe payload boundaries,
idempotent retry metadata, and owner-visible failure state.

Do not build a broad worker platform if current code only supports a smaller
job ledger/status foundation.

## Scope

DAEDALUS should implement or precisely block:

- a bounded job model/status helper for pending/running/succeeded/failed or the
  nearest existing states;
- owner/persona or Developer Space scoping where user data is involved;
- idempotency key support or integration with the PR113 cache foundation where
  appropriate;
- retry metadata that records attempt count and last safe error summary without
  storing secrets or raw private payloads;
- owner-visible readback for failed/in-progress work if an appropriate existing
  owner route exists, otherwise document the exact route follow-up;
- candidate job-kind registry for archive extraction, embedding backfill, memory
  consolidation, export package assembly, replay seed/setup, and Developer Space
  import batches without implementing every worker;
- tests for status transitions, owner scoping, idempotency/retry behavior,
  failure readback, and payload redaction.

Prefer extending any existing import/export/archive status machinery over
creating a parallel system.

## Non-Scope

Do not add:

- broad worker execution infrastructure unless current code already has a safe
  runner to extend narrowly;
- queue provider migration;
- Cloudflare queues/workers;
- Redis durable queue processing beyond idempotency/lightweight state;
- embedding backfill execution;
- archive text extraction execution rewrite;
- memory consolidation behavior changes;
- export package content changes;
- replay seed automation;
- billing/auth/session changes;
- broad UI work;
- raw private archive text, prompts, provider payloads, provider keys, or
  secrets in job payloads/logs/status.

## ARGUS Review Requirements

ARGUS should verify:

- job records/status are owner scoped;
- failed jobs have an owner-visible status path or a precise follow-up blocker;
- retries are idempotent or explicitly blocked until a runner lane;
- payloads/status/logs do not contain unnecessary private text, prompts,
  provider payloads, keys, or secrets;
- cache/idempotency usage keeps scoped keys and TTLs;
- no background execution behavior is added beyond the documented scope;
- validation passed.

No ARIADNE rehearsal is required if this remains backend/status/helper/docs/tests
only. If visible owner-facing job status changes, ARGUS should wake ARIADNE
after technical acceptance.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add and run a focused job test gate if PR114 creates one. Also run affected
archive/export/import/cache/API tests touched by the implementation.
