# PR157 - Staging Alpha Evidence Refresh

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS refreshes evidence; ARGUS reviews overclaim/privacy.
Status: open for DAEDALUS

## Why This Lane

PR156 closes the immediate context-preview latency loop:

- PR154 baseline outer median was 4571ms and `archive_retrieval` median was
  3207ms.
- PR155 batched Archive lifecycle/source citation validation.
- PR156 hosted remeasurement showed outer median 1864ms,
  `archive_retrieval` median 531ms, and 0 of 7 counted requests above 3000ms.

That means the current backend/replay line is no longer blocked by the
Archive-retrieval latency spike. The next useful step is to consolidate the
current alpha-proof evidence rather than open another optimization lane.

This follows the backend/product plan's PR 0 intent: keep one source-backed
status saying staging replay is good enough for alpha proof, and clearly name
what remains productization or external proof.

## Goal

Refresh the repo's staging-alpha status so the team has one concise,
source-backed view of current Railway/Supabase/Gemini/NVIDIA/Stripe/Redis
readiness, replay evidence, PR156 latency results, and remaining caveats.

## Scope

DAEDALUS should inspect the current status docs and update the smallest useful
set:

- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`
- `docs/roadmap/STATION_BACKEND_IMPLEMENTATION_ROADMAP.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- any existing staging/readiness closeout doc that is clearly stale after
  PR156

Required content:

- Record that PR156 closed the Archive-retrieval latency loop for now.
- Preserve the distinction between alpha-proof and product-complete.
- Record current deployed web/API URLs and deployment identity checks if they
  can be verified without secrets.
- Record that Supabase migrations/storage/auth, Gemini `station_free_1536`,
  Redis/Upstash cache readiness, and Stripe test config are readiness facts
  only at their accepted proof level.
- Keep Stripe paid subscription activation caveat honest unless a real hosted
  test-mode Checkout or signed webhook mutation has happened.
- Keep Cloudflare as future adapter/index-mirror scope unless a concrete
  Cloudflare replay objective is opened.
- Keep Redis/Valkey as cache/idempotency/rate-limit/queue-state support unless
  a separate Memory-truth decision is opened.
- Point to exact evidence docs/commands where possible instead of reprinting
  long histories.

## Non-Scope

Do not:

- add code;
- add or change provider, embedding, Redis, Cloudflare, worker, billing, auth,
  session, import, or UI behavior;
- rerun or mutate replay data;
- fabricate Stripe subscription/payment state;
- print secrets, tokens, cookies, DB URLs, service-role keys, webhook secrets,
  replay credentials, raw owner/persona/source IDs, or raw private corpus text;
- claim production readiness or product completeness.

## Validation

Expected validation:

```bash
pnpm test:health
pnpm test:replay-readiness
pnpm --filter @station/api build
pnpm --filter @station/web build
git diff --check
```

If the web build hits the known local Windows standalone symlink `EPERM`,
record exactly where it reached before the failure and do not present that as a
product regression.

If live endpoints are checked, record only sanitized status/commit/ready fields:

```text
https://stationweb-production.up.railway.app/health
https://stationweb-production.up.railway.app/health/deployment
https://stationapi-production.up.railway.app/health
https://stationapi-production.up.railway.app/health/deployment
```

## Handoff Requirement

DAEDALUS should wake ARGUS with:

- files updated;
- exact validation/live checks run;
- what is accepted alpha-proof;
- what remains external/productization caveat;
- confirmation that no secrets/private data were recorded.
