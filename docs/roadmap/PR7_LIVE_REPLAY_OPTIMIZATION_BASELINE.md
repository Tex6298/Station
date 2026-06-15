# PR 7 - Live Replay Optimization Baseline

Date opened: 2026-06-15

Opened by: A1 / MIMIR

Prerequisite: PR 6 background-job trigger audit accepted as a no-trigger
deferral by A3 / ARGUS in `c1bf126`.

Owner: A2 / DAEDALUS first, then A3 / ARGUS. A4 / ARIADNE only if the result
opens a human-route or UI-facing defect lane.

Status: DAEDALUS evidence-only result ready for ARGUS review. See
`docs/roadmap/PR7_LIVE_REPLAY_OPTIMIZATION_BASELINE_RESULT.md`.

## Goal

Measure the live Railway replay system before opening more architecture.

The claim to earn is:

> Station's next backend/product lane is chosen from live replay evidence, not
> from guesses about Cloudflare, Redis, workers, providers, billing, or UI.

## Inputs

Use the accepted current-truth documents and routes:

- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`
- `docs/roadmap/STATION_BACKEND_IMPLEMENTATION_ROADMAP.md`
- `docs/roadmap/STAGING_ALPHA_CLOSURE_STATUS.md`
- `docs/ops/STAGING_REPLAY_DATA_PLAN.md`
- `docs/roadmap/STAGING_DEMO_RUN_ARIADNE.md`
- `docs/roadmap/PR1_REPLAY_MEMORY_RETRIEVAL_QUALITY.md`
- `docs/roadmap/PR2_ARCHIVE_IMPORT_ROBUSTNESS.md`
- `docs/roadmap/PR3_STRIPE_PAID_PATH_RECONCILIATION.md`
- `docs/roadmap/PR4_REDIS_OPERATIONAL_BOUNDARY_RESULT.md`
- `docs/roadmap/PR5_DEVELOPER_SPACE_PROVIDER_POLICY_RESULT.md`
- `docs/roadmap/PR6_BACKGROUND_JOB_TRIGGER_AUDIT_RESULT.md`

## Scope

Run a sanitized live replay measurement against the current Railway staging
target:

- public API and web health/deployment identity;
- replay owner sign-in using ignored local credentials only;
- owner persona lookup and seeded persona selection;
- context-preview for at least one seeded anchor query;
- private archive retrieval for at least one seeded anchor query;
- observability summary and trace list;
- billing status for the replay owner;
- export package/readback status if already available;
- Developer Space public/owner route status if already available.

For each measured route, record only:

- HTTP status;
- rough duration in milliseconds;
- safe counts, modes, booleans, and labels;
- provider/model/token/cost labels from observability, if already exposed;
- whether the result supports or weakens the accepted replay claim.

Then produce one ranked recommendation:

- no code now;
- one route/service optimization;
- one retrieval-quality follow-up;
- one billing/webhook follow-up;
- one Redis/cache follow-up;
- one Cloudflare adapter follow-up;
- one worker follow-up;
- or one ARIADNE human rehearsal if the evidence is user-facing.

## Do Not

- Do not open Cloudflare, Redis memory, worker infrastructure, provider routing,
  billing expansion, archive semantics, export scope, or broad UI work without a
  concrete finding from this measurement.
- Do not record private archive text, prompts, completions, raw replay bodies,
  raw manifests, checkout URLs, portal URLs, customer IDs, subscription IDs,
  owner IDs, persona IDs, trace IDs, cookies, JWTs, credentials, API keys, or
  local `.env` values.
- Do not fabricate Stripe subscription state or downgrade/upgrade the replay
  owner.
- Do not run destructive seed/reset operations.
- Do not turn a single slow sample into an optimization claim without saying it
  is only a single sample.

## Acceptance Gates

For an evidence-only result:

- The measured route set is listed.
- Each route has sanitized status, duration, and safe labels only.
- The result ranks exactly one next recommendation, or says no immediate code.
- Any recommended next lane names the concrete evidence that justifies it.

For a narrow code change:

- Exactly one measured weak point is named.
- The patch is limited to that route/service.
- Existing privacy/owner boundaries remain unchanged or stronger.
- Focused tests cover the changed behavior.

## Validation

Expected evidence gate:

```bash
npx --yes pnpm@10.32.1 test:health
npx --yes pnpm@10.32.1 test:replay-readiness
npx --yes pnpm@10.32.1 test:persona-context
npx --yes pnpm@10.32.1 test:conversation-archive
npx --yes pnpm@10.32.1 test:exports
npx --yes pnpm@10.32.1 test:billing
npx --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If DAEDALUS changes code, add the focused tests for that exact route/service.

## Handoff

DAEDALUS should wake ARGUS with:

- measured live route set;
- sanitized statuses, durations, counts, modes, and provider/cost labels;
- the single ranked next recommendation;
- any code changed, if any;
- validation run;
- privacy statement confirming no secrets, IDs, private text, prompts, raw
  bodies, checkout URLs, or trace IDs were committed.
