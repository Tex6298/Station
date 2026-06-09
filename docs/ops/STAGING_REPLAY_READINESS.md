# Station staging replay readiness

Status: staging preparation with a live Railway API host and a Railway web lane
opened. Full staged replay is still not implemented or verified by this
document.

This runbook names what must be true before a human replay pass can produce
useful product evidence from an online/staged Station deployment.

## Current repo facts

- Web is a Next.js app in `apps/web`.
- API is an Express app in `apps/api` with `GET /health` returning `{ ok: true }`.
- Root `railway.json` now uses service-aware Railpack build/start scripts so
  `@station/api` builds/starts `apps/api` and `@station/web` builds/starts
  `apps/web`.
- Railway `@station/api` is sourced from `Tex6298/Station` on `main` and
  answers `https://stationapi-production.up.railway.app/health` with
  `{ "ok": true }`.
- Railway `@station/web` has the generated URL
  `https://stationweb-production.up.railway.app` and a web `/health` route in
  repo. ARGUS's first 2026-06-08 live check returned Railway
  `404 Application not found`, but MIMIR's later Railway-authorized probe
  returned `200` from `/health` and the web root.
- Root `vercel.json` still targets the web app only. This is retained as a
  fallback/historical prep shape, not the current staging default.
- The current Vercel install command uses `pnpm install --no-frozen-lockfile`;
  CI and replay acceptance should still use the pinned frozen-lockfile gate
  unless MIMIR explicitly waives it.
- MIMIR's current staging default is now Railway for both web and API. Railway
  setup notes live in `infra/railway/README.md`.
- The external Railway API service exists and the web service has URL/env
  wiring. Supabase migrations `025` through `028`, database readiness, private
  storage readiness, and NVIDIA platform chat are now proven at setup level.
  Supabase Auth redirects, OpenAI embeddings, Stripe test resources,
  Redis/cache selection, Cloudflare setup, and replay data still remain.
- Supabase migrations and setup notes live in `infra/supabase/README.md`.
- Stripe Billing setup notes live in `infra/stripe/webhook.md`.
- Supabase setup blockers, NVIDIA env aliasing, and Redis cache boundaries are
  tracked in `docs/ops/STAGING_SETUP_BLOCKERS.md`.
- Local validation and remote deployment truth are separate; a green local gate
  is not proof that staging is live.

## External facts needed

MIMIR or the human operator must provide these before DAEDALUS can implement or
verify staging:

| Need | Required value |
| --- | --- |
| Web host/provider | Current default is Railway `@station/web` from `Tex6298/Station` branch `main`; setup commit `7bb8965` deployed successfully. |
| Web staging URL | `https://stationweb-production.up.railway.app`. |
| API staging URL | Known for the current API host: `https://stationapi-production.up.railway.app`. |
| API host/provider | Known for the current API host: Railway `@station/api` from `Tex6298/Station` branch `main`. |
| Supabase project | Project URL, anon key, service-role key, and database URL for staging. |
| Supabase auth settings | Site URL and redirect URLs for the staged web URL. |
| Storage bucket | Private `persona-files` bucket created in the staging project. |
| Stripe mode | Test-mode account, Price IDs, webhook signing secret, and webhook endpoint. |
| Replay account | Email/password for a non-production test user. |
| Replay data policy | Whether data is seeded manually, through API clicks, or by a future seed script. |
| Remote status | GitHub CI plus web and API deployment status for the exact commit under review. |

## MIMIR staging defaults

These are the current defaults for the next setup pass. They are not deployed
facts until URLs, projects, and credentials exist.

- Web host/provider: use Railway `@station/web` for staging.
- API host/provider: use Railway `@station/api` for the Express API.
- Supabase: use a dedicated staging project, not the production or local project.
- Supabase storage: create a private `persona-files` bucket in staging.
- Stripe: use test mode only, with staging webhook endpoint pointed at the
  staged API.
- Replay account/data: set up the first replay manually through the UI/API;
  defer a seed script until manual setup becomes repetitive.
- Remote truth: verify GitHub CI and web/API deployment status for the exact
  commit under replay.

Current MIMIR hosting decision: open the Railway-web configuration lane for
staging. Preserve the healthy `@station/api` deploy while making `@station/web`
deploy the Next.js app from the same fork. Do not place server-only secrets on
`@station/web`.

Remaining facts: Supabase Auth redirects, OpenAI embedding key, Stripe test
Price IDs/webhook secret, Redis/cache-provider decision, Cloudflare decision,
and replay account credentials/data.

## Current Railway project state

As of 2026-06-08, Railway `@station/api` is sourced from `Tex6298/Station` on
`main`, deploys from the root service-aware `railway.json`, and returns `200`
from:

```text
https://stationapi-production.up.railway.app/health
```

Railway `@station/web` also exists from `Tex6298/Station`; its generated URL is:

```text
https://stationweb-production.up.railway.app
```

The plain `api` service is an unused shell. Keep runtime secrets on
`@station/api`; do not duplicate them onto `@station/web` or the plain `api`
shell.

DAEDALUS follow-up on 2026-06-08:

- `https://stationweb-production.up.railway.app/health` returned `200` with
  `{ "ok": true }`.
- `https://stationweb-production.up.railway.app/` returned `200` with the Next
  app shell.
- `npx --yes @railway/cli status --json` returned `Unauthorized. Please login
  with railway login`, so deployment logs, service inventory, and variable
  placement were still not inspectable from this shell.

MIMIR's Railway-authorized follow-up then reported `@station/api` and
`@station/web` at `SUCCESS`. ARGUS independently rechecked the public web/API
probes, but not the service inventory or variable placement.

MIMIR's 2026-06-09 proof update reports `@station/api` and `@station/web`
running commit `55d3fc6`. Public `/health/deployment` now reports database
`ok: true`, migrations `ok: true` via `025-028/public_schema_object_proof`,
storage `ok: true` with `persona-files` private, and NVIDIA platform chat true.
Overall `ready` remains false because Supabase Auth redirect management proof,
OpenAI embeddings, Stripe, and Redis/cache configuration remain false.

## Active remote for this lane

Railway/staging work currently tracks the fork because `Discern-AI/Station`
could not be connected to Railway.

Before committing or pushing Railway/staging work, verify:

```bash
git status -sb
```

Expected branch line:

```text
## main...fork/main
```

Push wakeup/work commits to `fork/main` for this lane. Do not use
`origin/main` unless MIMIR or the human explicitly reopens
`Discern-AI/Station` as the active Railway/staging remote.

## Environment checklist

Web host:

```bash
NEXT_PUBLIC_APP_URL=https://stationweb-production.up.railway.app
NEXT_PUBLIC_API_URL=https://stationapi-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://<supabase-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

API host:

```bash
# Provider should inject PORT for staging; use 4000 only for local runs.
PORT=<provider-provided-port>
API_URL=https://stationapi-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://<station-web-staging>
SUPABASE_URL=https://<supabase-project>.supabase.co
SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DATABASE_URL=<staging-database-url>
JWT_SECRET=<strong-staging-secret>
NVIDIA_AI_API_KEY=<optional-for-platform-chat>
NVIDIA_MODEL_BASE_URL=https://integrate.api.nvidia.com
NVIDIA_MODEL=openai/gpt-oss-120b
DEEPSEEK_API_KEY=<optional-for-platform-chat>
OPENAI_API_KEY=<optional-for-embeddings>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_YEARLY=price_...
STRIPE_PRICE_CREATOR_MONTHLY=price_...
STRIPE_PRICE_CREATOR_YEARLY=price_...
STRIPE_PRICE_CANON_MONTHLY=price_...
STRIPE_PRICE_CANON_YEARLY=price_...
```

Keep `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `JWT_SECRET`,
`STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` off the web host.

## Minimum validation before replay

Local:

```bash
npx --yes pnpm@10.32.1 install --frozen-lockfile
npx --yes pnpm@10.32.1 typecheck
npx --yes pnpm@10.32.1 lint
npx --yes pnpm@10.32.1 build
npx --yes pnpm@10.32.1 test:replay-readiness
npx --yes pnpm@10.32.1 test:auth
npx --yes pnpm@10.32.1 test:billing
npx --yes pnpm@10.32.1 test:storage
npx --yes pnpm@10.32.1 test:integrity
npx --yes pnpm@10.32.1 test:token-credits
npx --yes pnpm@10.32.1 test:reports
npx --yes pnpm@10.32.1 test:community
npx --yes pnpm@10.32.1 test:spaces
npx --yes pnpm@10.32.1 test:continuity
npx --yes pnpm@10.32.1 test:persona-context
npx --yes pnpm@10.32.1 test:conversation-archive
npx --yes pnpm@10.32.1 test:continuity-publication
npx --yes pnpm@10.32.1 test:document-discussions
npx --yes pnpm@10.32.1 test:exports
npx --yes pnpm@10.32.1 test:developer-spaces
npx --yes pnpm@10.32.1 test:developer-space-client
npx --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

Remote:

- GitHub CI is green for the pushed commit, or MIMIR explicitly waives a check.
- Web staging URL loads the app shell.
- Railway API staging URL returns `200` from `/health`.
- Web can call `/auth/me` through `NEXT_PUBLIC_API_URL`.
- Stripe test webhook endpoint is verified against `/billing/webhook`.

Once URLs exist, the minimal smoke commands are:

```bash
curl -f https://stationapi-production.up.railway.app/health
curl -I https://<station-web-staging>
curl -i https://stationapi-production.up.railway.app/auth/me
```

## Replay account and data setup

Before replay, create or confirm one test user. The replay is more useful if the
account has:

- one persona with a long description or awakening prompt
- at least one private chat
- one pasted archive import
- one continuity record
- one Space with at least one published public document
- one document discussion
- one forum thread/comment
- one Developer Space with an ingestion key, one node, one event, and one
  snapshot
- one owner-only persona export manifest
- billing page access with Stripe test-mode configuration

Manual setup through the UI/API is acceptable for the first staging pass. A seed
script should be a later implementation task if manual setup becomes repetitive.

## Short replay path

1. Sign up or sign in as the replay account.
2. Open Studio and confirm the persona workspace loads.
3. Chat with the persona and archive a useful exchange.
4. Paste source material into the persona Archive tab and confirm job/status
   visibility.
5. Add or inspect continuity records and publish one continuity artifact as a
   document.
6. Visit the Space and public document; confirm Discover can surface public-safe
   material.
7. Add a discussion/comment and confirm report safety basics still hold.
8. Create or inspect a Developer Space, rotate/confirm an ingestion key, ingest a
   small node/event/snapshot payload, and view the observatory.
9. Create or inspect a persona export manifest.
10. Visit Billing and run only Stripe test-mode flows.

## Evidence capture points

BE-08 adds `GET /observability/replay-readiness` as an auth-protected,
non-secret replay prep endpoint. It does not collect private payloads or optimize
anything by itself; it tells the replay operator what to measure online.

Capture these categories during the first staged replay:

- Chat latency and context quality: use `/observability/summary`,
  `/observability/traces`, and context-preview route outputs for timings, token
  counts, source counts, and manual quality notes. Do not store
  context-preview response bodies or private excerpts in the evidence package.
- Archive upload/import confidence: use import job status/list/retry outputs for
  job status, chunk counts, sanitized errors, and retry outcomes.
- Retrieval relevance: use archive retrieval/context-preview outputs for mode,
  authorized chunk count, skipped-source count, and human relevance rating. View
  bounded excerpts manually only; do not store excerpt text as telemetry.
- Provider cost and failure rate: use observability summaries/traces for
  provider/model, estimated cost, failure count, and latency.
- Job failure recovery: use import/export status surfaces for failed status,
  retry status, same-job completion, and sanitized error labels.
- Export trust: use export package readback for included section counts, privacy
  boundary notes, and failure labels.
- Billing/webhook reliability: use billing status/checkout/webhook smoke output
  in Stripe test mode only.

Remaining E2E blockers before replay evidence is meaningful:

- Supabase migrations `025` through `028` and private storage are proven at
  setup level. Run the matching archive retrieval, lifecycle filtering,
  provider-policy, and retrieval-metadata smoke checks before full replay unless
  MIMIR explicitly accepts setup proof for a narrower replay.
- Decide or explicitly defer Redis/Valkey/Upstash cache provider setup.
- Decide or explicitly defer Cloudflare Worker/Vectorize account/index setup.
- Configure Stripe test resources and webhook secret for staged API.
- Confirm at least one platform chat provider and the OpenAI embedding key.
- Prepare replay account/data that covers persona, archive import, continuity,
  Space/document, discussion, Developer Space, export, and billing paths.

## Known non-blockers for first replay

- Static global Archive and Export shells are still not production-ready
  workspaces.
- Export remains JSON/Markdown manifest readback, not downloadable binary/PDF
  bundles.
- Archive/import/export jobs are protected-alpha synchronous flows, not worker
  infrastructure.
- Dashboard snippets may still be derived/static and should not be treated as
  authoritative archive telemetry.
- No new private search UI exists beyond the accepted API/search foundation.
- UX-01B and UX-03 are not pre-staging defaults unless MIMIR names a concrete
  replay blocker and ARGUS adds gates.

## Recommended handoff

The current BE-00 through BE-08 proof/waiver package lives in
`docs/ops/STAGING_PROOF_WAIVER_HANDOFF.md`.

This repo is ready for an ARGUS review of Railway web/API deploy hygiene,
documentation truth, and the remaining proof/waiver asks. It is not ready to
claim full staging implementation until the external facts above are supplied
or explicitly waived for Supabase Auth redirects, OpenAI embeddings, Stripe,
provider usage expectations, cache, Cloudflare, and replay data.
