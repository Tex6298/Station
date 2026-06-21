# PR157 - Staging Alpha Evidence Refresh

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS refreshes evidence; ARGUS reviews overclaim/privacy.
Status: accepted by ARGUS; waking MIMIR for closeout

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

## DAEDALUS Evidence Refresh

Implemented on 2026-06-21.

Updated files:

- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`
- `docs/roadmap/STATION_BACKEND_IMPLEMENTATION_ROADMAP.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/ops/STAGING_PROOF_WAIVER_HANDOFF.md`
- `docs/roadmap/PR157_STAGING_ALPHA_EVIDENCE_REFRESH.md`

Sanitized public live checks run:

- `https://stationweb-production.up.railway.app/health`: HTTP 200,
  `ok:true`.
- `https://stationweb-production.up.railway.app/health/deployment`: HTTP 200,
  `ok:true`, `ready:true`, service `@station/web`, branch `main`, commit
  `508b4acc2dbe`.
- `https://stationapi-production.up.railway.app/health`: HTTP 200,
  `ok:true`.
- `https://stationapi-production.up.railway.app/health/deployment`: HTTP 200,
  `ok:true`, `ready:true`, service `@station/api`, branch `main`, commit
  `508b4acc2dbe`, app/API URLs on Railway HTTPS.

Accepted alpha-proof status:

- PR156 closes the immediate Archive-retrieval latency loop for now:
  context-preview outer median improved from 4571ms to 1864ms, trace `total`
  median from 3549ms to 892ms, and `archive_retrieval` median from 3207ms to
  531ms; 0 of 7 counted requests exceeded 3000ms.
- Current public deployment readiness reports Supabase database, migration proof,
  private `persona-files` storage, Supabase Auth redirects, Gemini
  `station_free_1536` embeddings, NVIDIA platform chat configuration, Stripe
  test config, and Upstash REST operational cache configured at their accepted
  proof levels.
- Redis/Upstash remains operational cache, idempotency, rate-limit, and
  cache-only queue-state support; it is not canonical Memory truth.
- Cloudflare remains future adapter/index-mirror scope unless MIMIR opens a
  concrete Cloudflare replay objective.

Remaining caveats:

- This is protected-alpha proof, not production readiness or product
  completeness.
- Stripe readiness is config-level/test-resource readiness. Paid subscription
  activation still needs a real hosted test-mode Checkout or signed Stripe
  webhook mutation for the replay owner; no subscription/payment state was
  fabricated.
- The web build reaches successful compile, lint/typecheck, page data, 36
  static pages, optimization, and trace collection locally, then fails in
  Windows standalone trace-copy on symlink `EPERM`; this matches the known local
  packaging limitation.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:health` passed with 16 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed with 2
  tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` reached compile,
  lint/typecheck, page data, 36 static pages, optimization, and trace
  collection, then failed on known local Windows standalone symlink `EPERM`
  while copying traced files.
- `git diff --check` passed with CRLF normalization warnings only.

No secrets, tokens, cookies, DB URLs, service keys, webhook secrets, replay
credentials, raw IDs, or raw private corpus text were recorded.

## ARGUS Review

Accepted on 2026-06-21.

Findings:

- PR157 is docs/evidence-only and matches the requested lane. No code,
  provider, embedding, Redis, Cloudflare, worker, billing, auth, session,
  operational cache, UI, public route, or runtime behavior was changed.
- Public live checks were re-run by ARGUS. Web/API `/health` returned HTTP 200
  with `ok:true`; web/API `/health/deployment` returned HTTP 200 with
  `ok:true`, `ready:true`, Railway branch `main`, and commit `508b4acc2dbe`.
- API deployment readiness exposes non-secret categories for database,
  migrations, storage, public URLs, Supabase Auth redirects, providers, Stripe,
  and Redis/Upstash. The checked booleans support the documented config-level
  proof without printing secret values.
- The PR156 latency claim is scoped correctly as protected-alpha evidence:
  outer median 1864ms, trace `total` median 892ms, `archive_retrieval` median
  531ms, and 0 of 7 counted requests above 3000ms.
- The docs do not claim production readiness, product completeness, paid Stripe
  activation, Redis/Upstash canonical Memory truth, or Cloudflare runtime
  readiness.
- Stripe remains explicitly framed as config/test-resource readiness until a
  real hosted test-mode Checkout or signed webhook mutation proves paid
  activation for the replay owner.
- No secrets, tokens, cookies, DB URLs, service keys, webhook secrets, replay
  credentials, raw IDs, or raw private corpus text were added.

ARGUS validation:

- Public web/API `/health` and `/health/deployment` checks passed with
  `ok:true`; deployment checks also returned `ready:true` at commit
  `508b4acc2dbe`.
- `npm exec --yes pnpm@10.32.1 -- run test:health` passed with 16 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed with 2
  tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` reached
  successful compile, lint/typecheck, page data, 36 static pages, optimization,
  and trace collection, then failed on the known local Windows standalone
  symlink `EPERM` while copying traced files.
- `git diff --check` passed with CRLF normalization warnings only.
- Staged secret-shaped value scan passed.

Next:

- Wake MIMIR to close PR157 and decide the next roadmap move.
