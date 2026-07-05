# PR488 - Background Job Activation Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hostile preflight

## Why This Lane

PR487A closed cleanly after ARIADNE passed hosted Global Archive provenance
rehearsal. There is no evidence-label or query-fixture defect to repair.

The next useful backend/product pressure is not another Archive UI slice. The
launch-core plan still names Background jobs as the lane that turns slow or
failure-prone import/export work from protected-alpha inline behavior into a
more durable product capability.

Station already has:

- PR114 background-job foundation and safe summaries;
- PR147 activation audit that rejected a broad worker jump at the time;
- PR148 owner-only background-job readback for existing import/export jobs;
- import jobs, export packages, and owner-visible safe failure/readback;
- Redis/Upstash operational cache/idempotency/rate-limit/short-lived state
  posture, with Redis Memory truth explicitly rejected.

Marty has since provided Upstash/Redis-style config for staging. ARGUS should
decide whether that materially changes the activation decision, and if so,
which smallest implementation lane is justified.

## Accepted Baseline

Do not reopen these as missing:

- job registry/status helpers exist;
- import/export job summaries exist;
- owner-only `/background-jobs` readback exists;
- safe error sanitization exists;
- Upstash REST is accepted for cache/idempotency/rate-limit/short-lived state;
- Redis/Valkey must not become canonical Memory truth;
- Cloudflare Queue/Worker is not required unless a specific future adapter lane
  names it.

## Preflight Questions

ARGUS should answer directly:

- Does current hosted config provide a queue-capable runtime, or only
  Upstash REST/cache-style operational state?
- Is there a narrow import/export job that now justifies actual asynchronous
  activation?
- Is the safest first slice a queue adapter proof, a file-import job runner
  activation, export assembly retry, scheduled publishing worker readiness,
  Developer Space import batch fanout, or no worker lane yet?
- What owner-visible status/readback must exist before any retry or background
  execution starts?
- What payload redaction, idempotency, retry, and failure semantics are
  mandatory?
- Which validation commands and hosted/ARIADNE proof would be required if any
  visible owner route behavior changes?

## Candidate Outcomes

Return exactly one of:

```text
ACCEPT_PR488A_FILE_IMPORT_JOB_ACTIVATION
ACCEPT_PR488A_EXPORT_ASSEMBLY_RETRY
ACCEPT_PR488A_QUEUE_ADAPTER_PROOF
ACCEPT_PR488A_SCHEDULED_PUBLISHING_WORKER_GATE
BLOCKED_NEEDS_QUEUE_CAPABLE_CONFIG
BLOCKED_NEEDS_MIMIR_DECISION
REJECT_DEFER_NO_WORKER_YET
```

If accepted, wake DAEDALUS with exact implementation boundary, touched files,
tests, payload/privacy rules, owner-readback requirements, and ARIADNE rehearsal
requirement if visible routes change.

If blocked, wake MIMIR with the concrete blocker and smallest unblock lane.

If deferred, name the next better customer-facing product lane and why worker
activation should still wait.

## Guardrails

Do not open:

- broad worker platform replacement;
- all job kinds at once;
- Redis/Upstash/Valkey Memory truth;
- Cloudflare Queue/Worker implementation;
- provider/model/embedding/retrieval changes;
- live connector/OAuth/API pulls;
- new parser behavior;
- billing/Stripe changes;
- auth/session changes;
- production deployment rewrites;
- public job status;
- broad dashboard or broad Studio redesign.

Do not put in queue payloads, logs, status, readback, or tests:

- private source bodies;
- full transcripts;
- prompt/completion/provider payloads;
- raw owner/persona/source/file/import-job/candidate/thread/document/memory ids
  in display fields;
- storage paths or signed URLs;
- DB URLs;
- tokens, cookies, API keys, webhook secrets, or secret-shaped values.

## Suggested Validation If Accepted

ARGUS may patch this list based on the accepted slice.

```bash
npm exec --yes pnpm@10.32.1 -- run test:jobs
npm exec --yes pnpm@10.32.1 -- run test:cache
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

Add focused hosted proof only if route/runtime behavior changes in a way that
cannot be accepted by local tests and code review alone.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR487A closed after ARIADNE passed hosted Global Archive result provenance rehearsal.
- MIMIR opened PR488 as the next backend/product capability preflight: decide whether background-job activation is now justified, or name the exact blocker/defer decision.
Task:
- Hostile-preflight current background-job activation readiness against PR114, PR147, PR148, current import/export/job code, and current Redis/Upstash posture.
- Choose a smallest accepted PR488A slice, a concrete blocker, a MIMIR decision, or defer with the next better customer-facing lane.
- If accepted, wake DAEDALUS with exact implementation boundary, tests, privacy/payload rules, owner-readback requirements, and ARIADNE rehearsal requirement if visible routes change.
Guardrails:
- Do not open broad worker infrastructure, all job kinds at once, Redis Memory truth, Cloudflare Queue/Worker, provider/model/embedding/retrieval changes, live connectors, new parsers, billing, auth/session, deployment rewrites, public job status, broad dashboards, private payload readback, or placeholder controls.
```
