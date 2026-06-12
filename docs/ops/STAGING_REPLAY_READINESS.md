# Station staging replay readiness

Status: setup/config is green for the Railway staging target. Full populated
staged replay is still not implemented or verified by this document.

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
- The external Railway API and web services exist and have URL/env wiring.
  Database, migrations through `030`, private `persona-files` storage, Gemini
  embedding config, Stripe test config, Redis/Upstash config, public URLs, and
  Supabase Auth redirects are proven at setup level by public readiness. Replay
  data and populated Gemini retrieval quality are still unproven.
- Supabase migrations and setup notes live in `infra/supabase/README.md`.
- Stripe Billing setup notes live in `infra/stripe/webhook.md`.
- Supabase setup blockers, NVIDIA env aliasing, and Redis cache boundaries are
  tracked in `docs/ops/STAGING_SETUP_BLOCKERS.md`.
- Local validation and remote deployment truth are separate; a green local gate
  is not proof that staging is live.

## External facts needed

The setup/config facts are now known. These are the remaining facts for a
populated replay measurement pass:

| Need | Required value |
| --- | --- |
| Web host/provider | Current default is Railway `@station/web` from `Tex6298/Station` branch `main`; setup commit `7bb8965` deployed successfully. |
| Web staging URL | `https://stationweb-production.up.railway.app`. |
| API staging URL | Known for the current API host: `https://stationapi-production.up.railway.app`. |
| API host/provider | Known for the current API host: Railway `@station/api` from `Tex6298/Station` branch `main`. |
| Supabase project | Configured on Railway `@station/api`; do not print secrets. |
| Supabase auth settings | Proven for the Railway web URL and `/reset-password/update`. |
| Storage bucket | Private `persona-files` bucket proven by public readiness. |
| Stripe mode | Test-mode config is present; replay still needs a test-flow smoke if billing is exercised. |
| Replay account | Create or confirm one non-production test user without committing credentials. |
| Replay data policy | First pass should use existing UI/API paths; add a narrow seed/helper only if those paths cannot populate the corpus. |
| Remote status | Public `/health/deployment` must remain `ready:true` for the commit under review. |

## MIMIR staging defaults

These are the current defaults for populated replay.

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

Current MIMIR hosting decision: use Railway for both staging web and API from
the `Tex6298/Station` fork. Preserve the healthy `@station/api` and
`@station/web` deploys. Do not place server-only secrets on `@station/web`.

Remaining work: populate replay data, rebuild/write Gemini `station_free_1536`
vectors for that corpus, run owner-scoped retrieval measurement, and capture
sanitized evidence.

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
embedding profile proof, Stripe, and Redis/cache configuration remain false.
MIMIR's follow-up no-data RPC smoke also proved `match_memory_items` and
`match_private_archive_chunks` are callable and return zero rows for nonexistent
owner/persona scope.

DAEDALUS's 2026-06-11 migration-029 proof attempt keeps staging blocked for the
selected `station_free_1536` profile. Public `/health/deployment` now reports
`embeddingProfileCode=station_free_1536`, `embeddingProvider=gemini`,
database `ok: true`, storage `ok: true`, but migrations `ok: false` with
`query_failed`. Direct PostgREST RPC proof returns `PGRST202` for the
provider-aware `match_memory_items` and `match_private_archive_chunks`
signatures, with hints pointing to the old pre-029 signatures. See
`docs/ops/STAGING_MIGRATION_029_PROOF.md`.

MIMIR/ARGUS follow-up on 2026-06-11 closed the setup/config blockers:

- migration `029` was applied and provider-aware RPCs returned HTTP `200`;
- migration `030` enabled read-only client RLS for `integrity_questions`;
- Supabase Auth settings now allow the Railway web URL and
  `/reset-password/update`;
- `@station/api` was redeployed after a scoped Supabase Management API timeout
  polish;
- live `/health/deployment` returns `ready:true` with auth redirect booleans
  true.

The active follow-up is the populated replay data and Gemini retrieval
measurement plan in `docs/ops/STAGING_REPLAY_DATA_PLAN.md`.

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
EMBEDDING_PROFILE_CODE=station_free_1536
EMBEDDING_MODEL=
EMBEDDING_DIM=1536
GEMINI_API_KEY=<required-for-active-embeddings>
# OPENAI_API_KEY=<optional-openai_1536-native-or-rollback-profile>
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

MIMIR's active 2026-06-11 handoff is stricter than a generic replay account:
DAEDALUS should populate the bounded corpus and measure Gemini retrieval as
specified in `docs/ops/STAGING_REPLAY_DATA_PLAN.md`. A no-data RPC call is not
retrieval-quality evidence.

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

- DAEDALUS route-audited the active 2026-06-11 replay lane and found that a
  fresh API signup cannot populate the bounded corpus through existing UI/API
  paths alone: signup creates a `visitor`, while persona creation requires
  `private`, Space/document creation requires `creator`, and Developer Spaces
  require `canon`. DAEDALUS added and ran `scripts/staging-replay-seed.mjs`
  with synthetic ignored local corpus data. ARGUS should review the seeded
  state before it is treated as measurement evidence.
- Replay account/data now covers persona, archive/chat memory, continuity,
  Space/document, discussion, Developer Space, and export paths. Billing remains
  separate staging evidence if MIMIR includes it in the next replay scope.
- The seed run wrote Gemini `station_free_1536` metadata for replay memory
  vectors. Same 1536 dimensions do not make OpenAI and Gemini vector spaces
  compatible.
- Initial data-backed retrieval and context-preview checks are accepted by
  ARGUS for the replay owner, anonymous, invalid-token, wrong-persona, and
  rejected-memory negative-control paths. A true other-owner token was not
  available locally; automated `test:conversation-archive` and
  `test:persona-context` coverage still proves cross-owner blocks for these
  route families. A live second-owner probe remains a useful hardening follow-up
  rather than a blocker for this seeded replay slice.
- A broader staged replay E2E walkthrough now includes the live second-owner
  privacy preflight. The throwaway second owner received HTTP 403 and zero
  private rows on the replay archive route.
- The walkthrough also covers public Space/document/discussion, Developer Space
  public detail/SSE stream/owner usage, owner export readback, billing status,
  and observability metadata with sanitized counts only.
- ARGUS accepted the staged replay E2E walkthrough as deployed-API evidence. It
  does not close browser/mobile UX, portable export bundles, active Stripe
  customer/subscription flow, observability trace usefulness, Discover polish,
  onboarding, or partner-grade replay.
- Capture retrieval quality as counts, modes, timings, skipped-source counts,
  provider/profile metadata, and human relevance ratings only. Do not store
  private excerpts or prompt bodies in docs.
- Cloudflare remains deferred by adapter contract unless MIMIR names a
  Cloudflare-specific replay objective. The dependency check lives in
  `docs/ops/CLOUDFLARE_DEPENDENCY_CHECK.md`.

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

The current seeded staging replay loop is closed as ready-enough evidence for a
human walkthrough:

- ARGUS accepted deployed API replay evidence.
- ARGUS accepted populated Gemini retrieval quality for the seeded corpus.
- ARIADNE accepted browser/mobile staging replay with no true blocker.
- ARIADNE accepted UX-EXPORT-01 after `/studio/export` stopped overpromising
  downloadable/background export behavior.

Carry remaining friction as future product/demo work, not active replay
readiness blockers: portable export bundles, paid subscription activation after
the accepted Stripe test-mode smoke, and non-zero-token LLM trace proof if a
demo requires it.
