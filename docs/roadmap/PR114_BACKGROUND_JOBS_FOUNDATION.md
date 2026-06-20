# PR114 - Background Jobs Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible route behavior changes.
Status: implemented by DAEDALUS, awaiting ARGUS review

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

## DAEDALUS Result - 2026-06-20

Implemented as a narrow service contract, docs, and focused validation gate.
No route behavior, worker execution, UI, queue provider, or payload format
changed.

Files changed:

- `apps/api/src/services/background-jobs.service.ts`
- `apps/api/src/services/background-jobs.service.test.ts`
- `docs/architecture/background-jobs-foundation.md`
- `docs/roadmap/PR114_BACKGROUND_JOBS_FOUNDATION.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `package.json`

Job model/status proof:

- Added a bounded registry for `archive_extraction`, `embedding_backfill`,
  `memory_consolidation`, `export_assembly`, `replay_seed_setup`, and
  `developer_space_import_batch`.
- Existing durable stores are documented as `import_jobs` for archive
  extraction and `export_packages` for export assembly.
- Export `requested` status normalizes to the shared `queued` job state.
- Status transitions allow inline completion, processing failure, and failed
  retry/idempotent completion while keeping completed jobs terminal except for
  idempotent readback.

Owner-scope proof:

- Shared job summaries retain `ownerUserId`, `personaId`, `developerSpaceId`,
  and `resourceId` without widening route access.
- Existing owner-visible readback stays with storage/import routes for
  `import_jobs` and export routes for `export_packages`.
- Embedding backfill, memory consolidation, replay seed/setup, and Developer
  Space import batch execution remain route-follow-up items until their lanes
  add owner-visible failed/in-progress readback.

Idempotency/retry proof:

- Added `backgroundJobIdempotencyKey`, scoped through the PR113 operational-cache
  key shape with owner/persona/Developer Space/resource/operation fields.
- Idempotency TTL reuses the PR113 `idempotency` default of 24 hours.
- Added retry metadata helper for attempt count, retryable flag, and last safe
  error summary.

Payload redaction proof:

- Retry metadata and job summaries reuse `sanitizeJobErrorMessage`.
- Focused tests prove bearer tokens, `sk-...` keys, token assignments, and
  caller-supplied private snippets are redacted from safe error summaries.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:jobs` | Pass | 5 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 16 tests passed; archive/import job behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 4 tests passed; export package status/readback stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:cache` | Pass | 5 tests passed; operational-cache/idempotency helper behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

Non-scope confirmation:

- No broad worker infrastructure.
- No Cloudflare queues/workers.
- No queue-provider migration.
- No Redis durable queue processing.
- No embedding backfill execution.
- No archive extraction rewrite.
- No memory consolidation behavior change.
- No export package content change.
- No replay automation.
- No billing/auth/session change.
- No UI work.
- No raw private archive text, prompts, provider payloads, provider keys,
  secrets, or export contents in job payloads/logs/status.
