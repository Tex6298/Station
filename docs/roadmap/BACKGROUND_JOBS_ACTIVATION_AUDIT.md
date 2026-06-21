# Background Jobs Activation Audit

Date: 2026-06-21
Owner: A2 / DAEDALUS
Status: PR147 implementation handoff; awaiting ARGUS review

## Verdict

Do not activate a real queue/worker lane yet.

Current Station evidence supports the protected-alpha inline fallback posture.
The repo has useful job-shaped primitives, owner status readback for the main
import/export flows, retry metadata, idempotency keys, and queue-provider
readiness reporting. It does not yet have replay evidence showing a specific
flow is blocked by latency, flaky completion, or owner-visible timeout.

PR148 should not be a BullMQ, Redis, Valkey, Cloudflare Queue, or broad worker
runtime lane. If MIMIR wants one more Lane 7 step before staging replay, PR148
should be an owner-only background job status/readback consolidation lane. That
would make existing import/export status and future route-followup jobs easier
to inspect before any retry worker is introduced. Otherwise, the right next
move is staged replay measurement with the existing surfaces.

## Current Queue Provider Posture

- `queueProviderStatus()` treats TCP Redis/Valkey as queue-capable config, but
  still keeps protected-alpha inline fallback available.
- Upstash REST is explicitly cache-only for this repo: it enables operational
  cache/idempotency/rate-limit style behavior, not BullMQ-compatible worker
  queue readiness.
- The operational cache provider supports Upstash REST and test/disabled modes.
  TCP Redis/Valkey currently reports disabled operational-cache behavior because
  there is no TCP client implementation in the repo.
- Redis/Valkey is not canonical Memory truth. Current allowed roles remain
  cache, idempotency, rate-limit, queue state, and short-lived working state.

## Candidate Trigger Audit

### Archive import backfills

Current state:

- `import_jobs` is the durable status store for archive extraction.
- `/imports/:id/status`, `/imports/persona/:personaId`, and `/imports/:id/retry`
  provide owner-scoped status and retry readback.
- Failed chat imports can be retried against the same job while preserving
  owner scope and sanitized failure text.
- Persona file registration creates import jobs and has duplicate/orphan/repair
  guardrails in tests.

Decision:

- No worker activation yet. There is no current replay evidence that archive
  imports are slow or failure-prone enough to justify a queue runtime.
- Keep measuring `job status`, `chunks created`, `owner-visible error labels`,
  and `retry outcome` during staged replay.

### Memory reindex / embedding backfill

Current state:

- Embedding profile metadata and mixed-dimension safeguards are present.
- The active backfill/reindex story is still a deferred/proof-driven lane, not
  an open background-processing implementation.

Decision:

- No worker activation. Open a dedicated reindex/backfill lane only when the
  embedding profile or replay corpus requires it, with payload/privacy gates
  specific to that workload.

### Export package assembly

Current state:

- Persona and Developer Space exports write `export_packages` rows, mark them
  `processing`, then either complete with manifest data or fail with an
  owner-visible error.
- Existing owner routes list and read export package status.

Decision:

- No retryable export assembly worker yet. Export assembly may be the best
  future worker candidate if replay shows package creation is slow or flaky, but
  current code already records failed package rows and owner readback.

### Developer Space imports / webhooks

Current state:

- Developer Space ingestion has payload guardrails, rate-limit support,
  signing-secret checks, receipt/idempotency handling, in-progress replay
  responses, replay-conflict detection, and failed-receipt finalization.
- Current SSE is database-poll backed; it is not a queue fanout mechanism.

Decision:

- No queue fanout yet. Current receipt/idempotency guards are the right
  protected-alpha posture until replay shows ingestion batches are too slow or
  duplicate/failure handling is insufficient.

### Replay seed/setup

Current state:

- Replay setup is script/manual oriented.
- Replay readiness exposes measurement points and setup blockers; it does not
  claim job execution infrastructure.

Decision:

- No job surface for replay seed/setup yet. Keep replay setup manual/scripted
  until a repeated setup task becomes painful enough to justify status, retry,
  and ownership semantics.

## Owner-Visible Status Readback

Exists today:

- Import jobs: owner-scoped status, persona list, failed status, sanitized
  errors, and retry for failed chat imports.
- Export packages: owner-scoped list/detail routes with status, content summary,
  manifest readback, and failed package errors.
- Deployment readiness: non-secret Redis/Upstash queue/cache posture through
  `/health/deployment`.
- Replay readiness: measurement surfaces for import status/retry, export
  status, and job failure recovery.

Missing before workers:

- A unified owner-only background job status surface across import jobs, export
  packages, and future route-followup job kinds.
- A public contract for route-followup job kinds such as embedding backfill,
  memory consolidation, replay seed setup, and Developer Space import batch.
- Queue payload rules that prove private text, prompts, provider payloads,
  archive excerpts, and secrets do not enter durable queue logs.
- Staged replay evidence naming a single painful flow.

## PR148 Recommendation

Default recommendation: no PR148 worker implementation yet. Run staged replay
with the existing measurement points and decide from evidence.

If MIMIR wants an implementation PR before replay, make PR148:

```text
PR148 - Owner Background Job Status Readback
```

Acceptance gates:

- Owner-only API readback combines existing `import_jobs` and `export_packages`
  summaries without widening access.
- Route-followup job kinds remain documented as inactive until an owning route
  exists.
- Readback emits statuses, safe labels, timestamps, and sanitized errors only.
- No raw import bodies, archive excerpts, prompts, provider payloads, URLs,
  bearer values, API keys, secrets, owner ids, persona ids, or queue payloads
  are exposed.
- `test:jobs`, focused import/export tests, `test:health`, `test:replay-readiness`,
  `typecheck`, and `git diff --check` pass.

Do not open a queue adapter until a replay/import/export/Developer Space flow
has measured pain and a named owner-visible status surface.
