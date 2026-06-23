# PR191 - Developer Agent Run Job Readiness Boundary

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS
Reviewer: ARGUS
Rehearsal: ARIADNE not required unless visible owner flows change.
Status: open

## Why This Lane

PR188 classified `run_job` as blocked pending Phase 2E hardening. PR189 hardened
existing owner-confirmed receipt/audit export. PR190 made `update_layout` useful
as suggestion/readback while keeping mutation blocked.

`run_job` is the remaining Phase 2E Developer Agent action that can plausibly be
hardened without crossing into beyond-2E powers. It must not run anything yet.
The safe next step is a readiness boundary: job targets, dry-run/readback,
idempotency language, timeout/retry expectations, and audit/export posture.

## Goal

Make `run_job` explainable and reviewable as an owner-only dry-run/readiness
contract without adding worker, queue, shell, provider, or external execution.

The owner should be able to answer:

- what job was requested;
- whether Station recognizes that job target;
- what would be required before execution could become available;
- what timeout, retry, and idempotency expectations apply;
- what data would be excluded from minimized audit/export readback;
- why no job was executed.

## Scope

DAEDALUS should inspect the existing Developer Agent action registry,
confirmation, receipt/audit-export, job-related tests, and any current job
types. Then implement the narrowest useful dry-run/readiness slice.

Expected work:

- Keep actual `run_job` execution blocked.
- Add or harden owner-only preview/confirmation readback for `run_job`.
- If useful, define a small non-executing job-target readiness registry using
  safe labels and capabilities only.
- Return minimized dry-run metadata: requested target label, recognized/unready
  state, required future prerequisites, no-execution boundary, timeout/retry/
  idempotency expectations, and omitted-field list.
- Include `run_job` dry-run/readiness records in owner-only audit/export if the
  current confirmation/export model supports that cleanly.
- Add focused tests proving no job, worker, provider call, queue enqueue, shell,
  external dispatch, or receipt side effect occurs.

## Boundaries

Do not:

- execute jobs;
- enqueue workers or queues;
- call providers;
- run shell commands;
- use Redis/Valkey/Upstash for job state;
- add cron/scheduler behavior;
- deploy, push to repo, mutate credentials, rotate keys, or create signing
  secrets;
- expose prompt text, commands, raw IDs, provider payloads, tokens, cookies,
  keys, connection strings, or secret-shaped material;
- make `push_to_repo`, `rotate_ingestion_key`, or
  `create_webhook_signing_secret` executable.

Allowed:

- API/service/test work for owner-only `run_job` dry-run/readiness readback;
- shared type updates for minimized readiness DTOs;
- docs updates that clarify `run_job` is explainable but still not executable.

## Validation

Required:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces`
- `git diff --check`

If shared API types change:

- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`

If job helpers are touched:

- run the focused job test suite already present in the repo.

ARGUS should review no-execution proof, owner scoping, minimized payloads,
audit/export compatibility, public cleanliness, idempotency/retry wording, and
that Redis/queue/provider/workers stay out of scope.

## Expected Next Decision

If ARGUS accepts PR191, MIMIR should treat Phase 2E Developer Agent production
readiness as bounded enough for now and pivot back to memory UX/observability
unless fresh evidence shows a Developer Agent production blocker.
