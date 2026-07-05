# PR488 - Background Job Activation Preflight Result

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Blocked - needs queue-capable config before implementation

## Verdict

```text
BLOCKED_NEEDS_QUEUE_CAPABLE_CONFIG
```

ARGUS does not accept a DAEDALUS implementation lane for PR488A yet.

## Decision

Current hosted config provides Upstash REST operational cache, not a
queue-capable worker runtime.

Public hosted `/health/deployment` was checked on 2026-07-05 and returned
`ready:true` with sanitized Redis readiness:

- `provider: upstash_rest_cache_only`;
- `queueConfigured: false`;
- `workerQueueReady: false`;
- `cacheConfigured: true`;
- `upstashRestConfigured: true`;
- operational cache enabled with `kind: upstash_rest`.

This materially does not change the PR147/PR368 activation decision. Upstash
REST is accepted for operational cache, idempotency, rate limiting, and
short-lived queue-state style data. It is not a BullMQ-compatible TCP queue
provider and does not prove that a production worker process can enqueue,
dequeue, retry, and complete import/export work safely.

## Evidence Reviewed

ARGUS reviewed:

- `docs/roadmap/PR488_BACKGROUND_JOB_ACTIVATION_PREFLIGHT_ARGUS.md`;
- `docs/roadmap/PR114_BACKGROUND_JOBS_FOUNDATION.md`;
- `docs/roadmap/PR147_BACKGROUND_JOBS_ACTIVATION_AUDIT.md`;
- `docs/roadmap/PR148_OWNER_BACKGROUND_JOB_STATUS_READBACK.md`;
- `docs/roadmap/PR368_BACKGROUND_JOBS_QUEUE_EVIDENCE_RESULT.md`;
- `docs/roadmap/PR487A_GLOBAL_ARCHIVE_RESULT_PROVENANCE_CLOSEOUT.md`;
- `apps/api/src/services/background-jobs.service.ts`;
- `apps/api/src/services/operational-cache.service.ts`;
- `apps/api/src/services/readiness.service.ts`;
- `apps/api/src/routes/background-jobs.ts`;
- `apps/api/src/services/file-import-jobs.service.ts`;
- `apps/api/src/routes/persona-files.ts`;
- `apps/api/src/routes/imports.ts`;
- `apps/api/src/routes/exports.ts`;
- focused job/cache/health/storage/export/replay-readiness tests.

Current code facts:

- PR114 job registry, status normalization, idempotency key helpers, retry
  metadata, and safe summary helpers still exist.
- PR148 owner-only `GET /background-jobs` readback still consolidates
  owner-scoped import/export summaries and reports route-followup kinds as
  inactive.
- `queueProviderStatus()` reports TCP Redis/Valkey as queue-capable only when
  `REDIS_URL`, `REDIS_PRIVATE_URL`, or `VALKEY_URL` is configured.
- With only Upstash REST, `queueProviderStatus()` reports
  `workerQueueReady:false` and keeps protected-alpha inline fallback.
- Operational cache supports `runtime_context`, `idempotency`, `rate_limit`, and
  `queue_state` keys, but the provider is `upstash_rest` and there is no worker
  queue client or BullMQ adapter.
- Persona file registration creates durable `import_jobs` rows and can process
  uploaded files through the existing `runFileImportJobById` inline fallback.
  Deferred registration still reports `workerQueue:false`.
- Chat import retry remains a same-request owner-scoped retry path and requires
  owner-provided content for failed chat jobs.
- Export package creation remains inline; failures leave owner-visible failed
  package rows and sanitized stable route errors.
- No current code or hosted proof shows a worker process, queue adapter,
  enqueue/dequeue loop, or measured import/export timeout/fanout defect that
  requires activation.

## Rejected Candidate Slices

`ACCEPT_PR488A_FILE_IMPORT_JOB_ACTIVATION` is premature. File import has the
best bounded runner shape, but current hosted config has no worker queue and
current tests prove the runner as inline fallback, not asynchronous execution.

`ACCEPT_PR488A_EXPORT_ASSEMBLY_RETRY` is premature. Export package creation
already creates owner-scoped failed rows and stable readback. There is no current
measured export assembly timeout/flakiness proof that requires a retry worker.

`ACCEPT_PR488A_QUEUE_ADAPTER_PROOF` is premature until MIMIR/human config proof
selects a queue-capable runtime. A fake adapter over Upstash REST would overclaim
worker readiness.

`ACCEPT_PR488A_SCHEDULED_PUBLISHING_WORKER_GATE` is out of scope. PR488 evidence
is about import/export/job activation, and scheduled publishing would introduce
public-write timing risks without a queue-capable runtime.

## Concrete Blocker

Before any background-job activation implementation, MIMIR needs a
queue-capable config proof.

The smallest unblock lane is config/proof only, not DAEDALUS feature work:

- choose the accepted queue provider for Station's Railway API runtime, such as
  TCP Redis/Valkey or another MIMIR-approved queue provider;
- configure it without exposing secret values;
- prove through sanitized `/health/deployment` that
  `queueConfigured:true` and `workerQueueReady:true`;
- document the intended worker process/runtime topology without deploying broad
  worker infrastructure;
- keep `inlineFallback:true`;
- keep Redis/Valkey/Upstash out of canonical Memory truth;
- do not enqueue private payloads or run import/export work during the proof.

After that proof, the likely first DAEDALUS code lane should be a narrow
queue-adapter proof, not broad job activation: one adapter contract, one
synthetic/id-only job kind, owner-scope/idempotency/retry/failure semantics, no
private payloads, and no production import/export execution until adapter proof
passes. File-import activation can follow only if MIMIR names measured import
pain or a hosted replay defect.

## Mandatory Future Payload Rules

Any future queue/worker lane must keep payloads, logs, status, tests, and
owner-visible readback free of:

- private source bodies;
- full transcripts;
- prompts, completions, or provider payloads;
- raw URLs;
- storage paths or signed URLs;
- raw owner/persona/source/file/import-job/candidate/thread/document/memory ids
  in display fields;
- DB URLs;
- tokens, cookies, API keys, webhook secrets, or secret-shaped values.

Payloads should be durable-id references plus owner scope, operation kind,
idempotency key, attempt metadata, and sanitized error/status labels only.

## Validation

ARGUS ran validation on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Public hosted `/health/deployment` sanitized Redis readback | Pass | `ready:true`; `provider: upstash_rest_cache_only`; `queueConfigured:false`; `workerQueueReady:false`; operational cache `kind: upstash_rest`. |
| Code review | Pass | Current code supports owner job readback, inline file import runner, inline export assembly, and cache/idempotency/rate-limit/queue-state keys, but no worker queue runtime. |
| `npm exec --yes pnpm@10.32.1 -- run test:jobs` | Pass | 10 background job readback/helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:cache` | Pass | 5 operational cache tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass | 18 health/deployment readiness tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 19 storage/import tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 7 export tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 replay-readiness tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are already documented as non-failures in the validation baseline.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocks PR488 background-job activation as BLOCKED_NEEDS_QUEUE_CAPABLE_CONFIG.
- Hosted /health/deployment is ready but reports Upstash REST cache-only: queueConfigured false and workerQueueReady false.
- Current import/export/job code has owner readback, inline fallback, safe errors, and tests, but no queue-capable worker runtime or measured import/export pain requiring activation.
Task:
- Decide whether to open a config/proof-only unblock lane for queue-capable runtime, or defer workers and choose the next customer-facing product lane.
- Smallest unblock: choose/configure a real queue-capable provider without exposing secrets, prove sanitized /health/deployment queueConfigured true and workerQueueReady true, document worker topology, keep inlineFallback true, and do not run import/export work.
- After config proof, prefer a narrow queue-adapter proof before any file-import or export-worker activation unless MIMIR names measured hosted replay pain.
Guardrails:
- Do not route DAEDALUS to build worker activation on Upstash REST cache-only posture.
- Do not open broad worker infrastructure, all job kinds at once, Redis Memory truth, Cloudflare Queue/Worker, provider/model/embedding/retrieval changes, live connectors, new parsers, billing, auth/session, deployment rewrites, public job status, broad dashboards, private payload readback, or placeholder controls.
- Do not put private source bodies, transcripts, prompts, provider payloads, raw URLs, storage paths, signed URLs, raw ids in display fields, DB URLs, tokens, cookies, API keys, webhook secrets, or secret-shaped values into queue payloads, logs, tests, or owner readback.
Validation:
- Public hosted /health/deployment sanitized Redis readback
- npm exec --yes pnpm@10.32.1 -- run test:jobs
- npm exec --yes pnpm@10.32.1 -- run test:cache
- npm exec --yes pnpm@10.32.1 -- run test:health
- npm exec --yes pnpm@10.32.1 -- run test:storage
- npm exec --yes pnpm@10.32.1 -- run test:exports
- npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
```
