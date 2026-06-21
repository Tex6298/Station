# PR149 - Staged Replay Measurement Baseline

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS prepares/runs measurable evidence or precisely blocks, ARGUS
reviews claims, ARIADNE rehearses if hosted visible-route evidence is required.
Status: open

## Why This Lane

MIMIR closes PR148 Owner Background Job Status Readback after ARGUS acceptance.
Lane 7 now has the no-worker verdict plus owner-only import/export job readback.

The next move is not more infrastructure. It is staged replay measurement using
the surfaces already accepted: health/deployment readiness, replay readiness,
observability, Memory readback, imports, exports, background-job readback,
Developer Space evidence, and billing/test-mode boundaries.

## Goal

Create a staged replay measurement baseline packet.

The packet should make it clear what can be proven locally, what should be
checked against hosted Railway/Supabase staging, what remains a config/runtime
blocker, and which future optimization lane should open from actual evidence.

## Scope

DAEDALUS should inspect and update replay/staging docs around:

- `docs/roadmap/STATION_BACKEND_IMPLEMENTATION_ROADMAP.md`;
- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`;
- `docs/ops/STAGING_REPLAY_READINESS.md`;
- `docs/roadmap/STAGING_ALPHA_CLOSURE_STATUS.md`;
- `docs/roadmap/BACKGROUND_JOBS_ACTIVATION_AUDIT.md`;
- current readiness services/routes:
  - `/health/deployment`;
  - `/observability/replay-readiness`;
  - `/background-jobs`;
  - import status/retry routes;
  - export package routes;
  - observability summary/trace detail routes.

Expected output:

- a concise replay measurement packet, likely
  `docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md`;
- active roadmap updates naming the next optimization lane only if evidence
  justifies it;
- exact commands/routes DAEDALUS ran locally;
- exact hosted checks ARIADNE should run if local evidence cannot prove them.

## Measurement Axes

Cover:

- deployment readiness and non-secret config posture;
- auth/session and redirect readiness;
- Memory/runtime context quality;
- archive import status, retry, and owner-visible errors;
- export package status/readback;
- background job readback over import/export rows;
- AI observability summary/detail;
- Developer Space observed-runtime health;
- billing/test-mode boundary;
- Redis/Upstash posture as cache/idempotency/rate-limit/job-state only;
- no-worker/no-Cloudflare/no-Redis-Memory-truth boundaries.

## Non-Scope

Do not add:

- worker/queue runtime;
- Redis Memory truth;
- Cloudflare retrieval or Queue implementation;
- provider/embedding migration;
- broad UI redesign;
- new billing behavior;
- new staged data mutation unless explicitly required by an existing replay
  script and safe to run;
- migration-ledger repair.

## Tests

Run the focused validation that matches any touched docs/code. Baseline expected
commands:

```bash
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run test:jobs
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If DAEDALUS runs hosted or local route probes, record commands without secrets
and never print tokens, cookies, DB URLs, or key values.

## ARGUS Review Requirements

ARGUS should verify:

- claims distinguish local proof, hosted proof, and unproven assumptions;
- no secret/config value is committed or printed;
- Redis/Upstash, Cloudflare, workers, providers, and billing are not overclaimed;
- replay measurement axes are concrete enough for ARIADNE/humans to run;
- any next optimization lane is evidence-backed.

If hosted visible-route rehearsal remains, ARGUS should wake ARIADNE with exact
routes, account posture, and pass/fail questions. Otherwise ARGUS can wake
MIMIR directly.
