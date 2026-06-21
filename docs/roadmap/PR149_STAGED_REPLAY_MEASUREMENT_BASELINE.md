# PR149 - Staged Replay Measurement Baseline

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS prepares/runs measurable evidence or precisely blocks, ARGUS
reviews claims, ARIADNE rehearses if hosted visible-route evidence is required.
Status: ARIADNE hosted probe blocked; exact verdict commit is not deployed

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

## DAEDALUS Implementation Notes

Implemented on 2026-06-21.

Output:

- Added `docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md`.
- The packet separates local/source proof, hosted proof still required for the
  exact deployed commit, unproven assumptions, and config/runtime blockers.
- Hosted route probes are provided as sanitized commands with placeholder
  tokens/ids only.
- No hosted route probe was run in this PR149 pass; local tests cannot prove
  Railway/Supabase staging state before this commit is deployed.

Recommendation:

- Do not open an optimization implementation lane from local proof alone.
- ARGUS should review the packet for overclaim/no-secret safety.
- If ARGUS wants hosted visible-route evidence for the current commit, wake
  ARIADNE with the hosted probe packet in
  `docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md`.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass | 16 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:jobs` | Pass | 9 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 97 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks passed from cache. |
| `git diff --check` | Pass | CRLF warnings only for local triad state and touched docs. |

## ARGUS Review

Accepted on 2026-06-21 after a narrow wording patch to avoid local-proof
overclaim.

ARGUS findings:

- The packet is documentation/measurement only. It adds no product feature,
  worker runtime, Redis Memory truth, Cloudflare retrieval/Queue, provider or
  embedding migration, broad UI redesign, new billing behavior, staged data
  mutation, or migration-ledger repair.
- The packet distinguishes the commands DAEDALUS actually ran locally from
  hosted proof that must be rerun after the exact deployed commit is live.
- Hosted probe commands use placeholder bearer/id variables only and repeatedly
  warn not to print tokens, cookies, database URLs, service keys, webhook
  secrets, API keys, raw private payloads, prompts, completions, provider
  payloads, or raw secret-bearing URLs.
- Redis/Upstash remains cache, idempotency, rate-limit, and job-state posture
  only; the packet does not claim worker readiness or canonical Memory truth.
- No optimization implementation lane is justified from local proof alone.

ARGUS review patch:

- Clarified that only the PR149 local proof-run commands were rerun for this
  packet.
- Renamed the measurement matrix's local column to coverage/gate language so
  existing focused tests and source files are not overclaimed as freshly rerun
  proof.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:health` passed with 16 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed with 2
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:jobs` passed with 9 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 97 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF warnings only.

Because the packet exists to drive hosted/staged replay measurement and no
hosted probes were run in this PR149 pass, ARGUS wakes ARIADNE to run the hosted
probe packet in `docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md` after this
verdict commit is deployed. ARIADNE should record only statuses, counts,
booleans, modes, timestamps, latency ranges, selected provider/profile names,
and high-level ratings; do not record raw private replay text, prompt bodies,
provider payloads, tokens, cookies, secret-bearing URLs, or raw ids beyond
stable doc references.

## ARIADNE Hosted Probe Attempt

Attempted on 2026-06-21.

Result: blocked on the packet precondition. Railway API and web were healthy,
but both deployment identity endpoints continued serving commit
`654a3cc3fe9e`, not the ARGUS verdict commit `4da7432`.

ARIADNE did not run authenticated owner replay probes because the handoff asked
for the hosted packet only after this verdict commit is deployed. Running the
token-bearing packet against a stale deployment would overclaim PR149 hosted
proof.

Non-secret stale-host boundary observed:

| Probe | Result | Latency |
| --- | --- | --- |
| API `/health` | HTTP 200 | 420ms |
| Web `/health` | HTTP 200 | 401ms |
| API `/health/deployment` | HTTP 200 | 1673ms |
| Web `/health/deployment` | HTTP 200 | 374ms |
| API `/observability/replay-readiness` without auth | HTTP 401 | 386ms |

Deployment identity poll:

- Target commit prefix: `4da7432`.
- API served commit prefix: `654a3cc3fe9e`.
- Web served commit prefix: `654a3cc3fe9e`.
- Poll duration: 15 minutes.
- API/web `ready`: true during the final poll response.

Validation:

- 15-minute sanitized poll of hosted `/health/deployment` for API and web.
- `curl.exe` public boundary checks for API/web health, deployment, and
  unauthenticated replay-readiness.

Next: MIMIR should decide whether to wait for or trigger a deployment for the
PR149 verdict commit, or explicitly authorize a stale-runtime measurement
against deployed commit `654a3cc3fe9e`.
