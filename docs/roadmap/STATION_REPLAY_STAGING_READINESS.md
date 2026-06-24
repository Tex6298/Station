# Station replay staging readiness

Status: MIMIR-opened staging-prep lane, 2026-06-07.

This lane prepares Station for replay on a real online/staged environment. It
does not try to finish every local UX roadmap item before staging. The point is
to get the current protected-alpha loops coherent enough to exercise online,
then let staged replay reveal the next optimizations.

## Current decision

- ARGUS accepted the sequencing correction in `docs: accept replay staging
  sequence`.
- UX-01A, UX-02A, UX-02B, and UX-DEBT-01 are accepted enough for staging prep.
- UX-01B and UX-03 are not pre-staging defaults. Open them only if MIMIR names
  a concrete replay blocker and ARGUS adds gates.
- PR266 reconfirmed this posture on 2026-06-24: no new local UX implementation
  lane is recommended before a staging readiness truth check.
- PR267 truth check failed on 2026-06-24 because hosted `/developer` returned
  HTTP 404 even though `/developer-spaces` and the replay Developer Space
  observatory route were live.
- PR268 is accepted with an ARGUS route-handler patch for the public
  `/developer` redirect to `/developer-spaces`, but MIMIR's hosted freshness
  rerun at `b31cf1e` still returned HTTP `307` without `Location`.
- PR269 adds a middleware-level redirect and dynamic/no-store route fallback;
  ARGUS patched forwarded public-origin handling, and hosted probes passed at
  `c2cf0cb`.
- PR270 ARGUS accepted staged replay owner measurement against hosted web/API
  at commit prefix `c2cf0cb48ca7`: owner auth/session, replay-readiness,
  background jobs, Memory, context preview, imports, exports, Developer Space,
  observability, billing, and public `/developer`/Developer Space routes were
  routeable with data present. The recommended next move is ARIADNE human-eye
  replay rehearsal, not a new DAEDALUS implementation lane.
- PR271 completed that ARIADNE rehearsal as `PASS WITH CAVEATS`. The hosted
  app is coherent enough for staging decisions, and the remaining visible
  caveats are bounded rather than structural.
- PR272 ARGUS accepted the tiny polish lane for the three bounded PR271
  caveats with no review patch: Discover right-rail roulette now leaves endless
  `Drawing...`, public Developer Space status labels distinguish live
  connection from latest readback, and public forum category descriptions
  normalize provider-list dash mojibake at display time. Because these are
  visible hosted caveats, ARGUS recommends a focused ARIADNE hosted rerun before
  MIMIR closes them from product evidence.
- PR273 opens that focused ARIADNE hosted rerun. Its scope is only the three
  PR271/PR272 visible caveats after hosted deploy freshness, not a new full-site
  audit or mutation run.
- PR273 passed on hosted desktop and mobile. MIMIR closes the three visible
  caveats and opens PR274 for DAEDALUS as the first post-polish online runtime
  quality probe: session persistence plus one bounded chat/context round trip
  with sanitized observability/readiness evidence.
- Broader known caveats still travel into staging review instead of spawning
  more local polish: static global Archive/Export shells, dashboard
  derived/static snippets, no downloadable bundles/workers, and no new private
  search UI beyond the accepted API/search foundation.

## Readiness question

What must be true so a human can run a real replay pass through the staged app
and collect useful product evidence?

The answer should cover:

1. Staging/deploy topology: web host, API host, Supabase project, and URL/env
   wiring.
2. Validation gate: local required checks, remote CI status, and any explicitly
   waived checks.
3. Replay account setup: test user, seed or manual data prerequisites, and safe
   Stripe/test-mode assumptions.
4. Replay path: the shortest useful end-to-end journey across Studio, Archive,
   Continuity, Spaces, Discover, Developer Spaces, and Billing.
5. Known limitations: what reviewers should notice without treating as a
   blocker.
6. Handoff shape: whether DAEDALUS can implement a setup slice, whether ARGUS
   should gate first, or whether MIMIR/human deployment configuration is needed.

## DAEDALUS first pass

DAEDALUS should inspect, not overbuild:

- `vercel.json`
- `.github/workflows/ci.yml`
- `.env.example`
- `infra/supabase/README.md`
- `infra/vercel/README.md`
- `docs/roadmap/builds.md`
- `docs/roadmap/prep-lane-audit.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- app env usage in `apps/web` and `apps/api`

Deliver one of two results:

- A narrow repo patch that improves staging readiness without changing product
  behavior.
- A no-code readiness plan naming the external deployment facts or credentials
  that MIMIR/human must provide before implementation can proceed.

## DAEDALUS prep result

DAEDALUS's 2026-06-07 pass is staging preparation only, not staging
implementation.

- Added `docs/ops/STAGING_REPLAY_READINESS.md` as the replay runbook and
  external-facts checklist.
- Updated `infra/vercel/README.md` to state that the current `vercel.json`
  targets the web app only and that, at that checkpoint, `apps/api` still needed
  a separate Node host.
- Updated `.env.example` with staging-critical API runtime placeholders:
  `PORT`, `JWT_SECRET`, and optional `DEVELOPER_SPACE_SSE_POLL_MS`.
- Did not add hosting provider config, new routes, seed scripts, product
  behavior, or deployed URLs.

At that 2026-06-07 checkpoint, staging implementation remained blocked on
human/MIMIR deployment choices:
web host/provider, web URL, API URL/provider, Supabase staging project,
Supabase auth redirect settings, Stripe test-mode prices/webhook, replay
account, replay data policy, and remote deployment status for the exact commit.

ARGUS's follow-up tightened two staging-prep claims before acceptance:

- The existing web-only Vercel config is a current repo fact, not a final web
  host decision.
- Replay acceptance keeps the pinned frozen-lockfile install gate even though
  the current Vercel install command is looser.

## MIMIR staging defaults

MIMIR's 2026-06-07 provisional defaults:

- Web staging: Vercel-shaped `apps/web`.
- API staging: Railway-hosted `apps/api` Express service.
- Supabase: dedicated staging project with private `persona-files` bucket.
- Stripe: test mode only.
- Replay data: first pass manual setup through UI/API.

## DAEDALUS Railway prep result

DAEDALUS translated those defaults into preparation docs only:

- Added `infra/railway/README.md` with API build/start commands, `/health`
  check, Railway API env boundary, paired Vercel web env, Supabase/Stripe
  pairing, and URL smoke commands.
- Updated `docs/ops/STAGING_REPLAY_READINESS.md` to point at the Railway API
  prep notes and include the post-URL smoke commands.
- Did not add a Railway project config, service ID, deployed URL, secret,
  Supabase project, Stripe resource, seed script, or product behavior.

Implementation remains blocked on the concrete Vercel web URL, staging Supabase
values, Supabase auth redirects, Stripe test resources, replay account/data, and
remote status for the exact commit.

ARGUS's Railway-prep follow-up accepted the pass as documentation/readiness only
after tightening two points:

- Remote status must include both web and API deployment truth, not only Vercel.
- Railway/provider `PORT` should be injected for staging; `4000` is only the
  local default.

## Railway service-shell config

MIMIR's 2026-06-07 service-shell pass added root `railway.json` only. The config
pins Railpack, `pnpm --dir apps/api build`, `pnpm --dir apps/api start`,
`/health`, restart policy, and monorepo watch patterns. It does not create or
prove a Railway project, service ID, deployed URL, secret, staging Supabase
project, Stripe resource, replay account, or remote-green status.

ARGUS accepted the config shell after checking it against the API package
scripts, the Express `/health` route, local JSON parsing, API build, and current
Railway config/healthcheck docs. ARGUS corrected the staging runbook wording so
the repo no longer says it lacks Railway config while `railway.json` exists.

## Railway fork deployment reality

As of 2026-06-08, staging deploy work moved onto `Tex6298/Station` because the
`Discern-AI/Station` repo could not be connected to Railway.

Current facts:

- Railway `@station/api` is sourced from `Tex6298/Station` on `main`.
- `@station/api` uses the root API-shaped `railway.json`.
- `https://stationapi-production.up.railway.app/health` returns
  `{ "ok": true }`.
- Supabase runtime secrets belong on `@station/api`; values are not recorded in
  the repo.
- Railway `@station/web` previously existed in a failed/stopped state before
  the Railway-web lane reopened it.
- Plain `api` is an unused shell service.

MIMIR opened the Railway-web lane on 2026-06-08. The root `railway.json` is now
service-aware: `@station/api` builds/starts the Express API, while
`@station/web` builds the Next.js app in standalone mode and starts the
standalone server. Railway generated the web URL
`https://stationweb-production.up.railway.app`, and `@station/web` has public
web env keys for app URL, API URL, Supabase URL, and Supabase anon key. Server
secrets remain off web services.

ARGUS did not accept the Railway-web lane on first review. The live API remained
healthy, but `https://stationweb-production.up.railway.app/health` returned
Railway `404 Application not found`, and the web root returned `404`. DAEDALUS
needs to inspect Railway `@station/web` deployment/domain logs or correct the
documented URL/service truth before this lane can be accepted.

MIMIR's Railway-authorized follow-up probe later on 2026-06-08 found the
generated web URL live:

- `https://stationweb-production.up.railway.app/health` returned `200` with
  `{ "ok": true }`.
- `https://stationweb-production.up.railway.app/` returned `200` with the Next
  app shell.
- Railway service inventory reported `@station/api` and `@station/web` at
  `SUCCESS`.
- Public API `/health` returned `{ "ok": true }`, and unauthenticated API
  `/auth/me` returned `401`.

ARGUS accepted the recovered Railway-web public probes after independently
rechecking web `/health`, web root, API `/health`, API `/auth/me`, script syntax,
and `railway.json` parsing. Service inventory came through MIMIR's
Railway-authorized handoff rather than ARGUS's local shell.

Full staging is still not complete. The remaining blockers are Supabase
migrations/auth redirects, private storage bucket, Stripe test prices/webhook,
and replay account/data policy.

ARGUS accepted the API-only posture on 2026-06-08 after rechecking the live API
URL, unauthenticated `/auth/me`, `railway.json` parsing, frozen install, API
build, web lint/build on `next@14.2.35`, and the lockfile/package scan for the
old `next@14.2.5`. The acceptance caveat is that Railway service-list and
variable placement were not independently rechecked because the Railway CLI is
absent in this shell; keep `@station/web` and plain `api` service status as
handoff truth until a Railway-authorized check reruns.

## Acceptance posture

ARGUS should review any staging-readiness patch for:

- truthful deploy claims
- env and secret handling
- auth/owner visibility
- CI/build reproducibility
- clear separation between local validation and remote deployment truth

ARIADNE should review only after a staged URL or replay harness exists.

## PR267 truth check result

ARGUS ran the PR267 docs/evidence-only check on 2026-06-24.

Verdict: `FAIL`.

Non-secret hosted evidence:

- Railway web `/health` and API `/health` returned HTTP 200 with `{ ok: true }`.
- Railway web/API `/health/deployment` returned HTTP 200 with `ok:true` and
  `ready:true`.
- Web and API reported branch `main` and runtime commit
  `38ad00e6f56823a302737139b4e7453294b9ea30`.
- Commits after `38ad00e6f56823a302737139b4e7453294b9ea30` were docs/state
  only, so product-code deployment freshness was acceptable.
- Public web routes `/`, `/discover`, `/forums`, `/developer-spaces`, and
  `/developer-spaces/station-replay-dev-alpha` returned HTTP 200.
- Public web route `/developer` returned HTTP 404.
- Public API `/developer-spaces/station-replay-dev-alpha` returned HTTP 200
  with public-safe Developer Space readback.
- API deployment readiness reported database, migrations, private
  `persona-files` storage, public URL wiring, Supabase Auth redirects, Stripe
  test billing/prices, platform chat, NVIDIA chat, Gemini
  `station_free_1536` embeddings, and Upstash REST operational cache ready.
- Redis/Upstash remains cache-only; no worker queue is ready and inline
  fallback is true.
- Cloudflare remains deferred by docs; no live Cloudflare readiness claim was
  made.
- Owner replay routes were not rechecked because no safe owner harness was
  available without credentials/tokens.

Next recommendation:

- Add and verify a public `/developer` redirect or alias to `/developer-spaces`,
  then rerun the public route probes. Do not open broader UX or product work
  before this staged route mismatch is resolved.

## PR268 route repair result

ARGUS accepted the narrow route-truth repair on 2026-06-24 with a review patch.

- DAEDALUS's page-level redirect deployed fresh at `ec992e3`, but hosted
  `/developer` returned HTTP `307` without a `Location` header.
- ARGUS replaced the page-level redirect with a route handler so `/developer`
  emits a real HTTP `307` redirect to `/developer-spaces` for `GET` and
  `HEAD`.
- `/developer-spaces` and `/developer-spaces/:slug` behavior is preserved.
- Local probe on `127.0.0.1:3139` returned HTTP `307` with
  `location: http://localhost:3139/developer-spaces` for `/developer`, and
  HTTP `200` for `/developer-spaces`.
- MIMIR should rerun the PR267 hosted public route probes after the ARGUS patch
  deploys, especially hosted `/developer`.

## PR269 hosted redirect repair result

ARGUS accepted the hosted redirect repair on 2026-06-24 with a review patch.

- `/developer` now redirects in middleware before route handling/cache.
- `apps/web/app/developer/route.ts` remains as a dynamic/no-store fallback.
- ARGUS patched redirect URL construction so hosted redirects use forwarded
  public host/proto or `NEXT_PUBLIC_APP_URL` instead of Railway's internal
  `0.0.0.0:8080` origin.
- Local `/developer` returned HTTP `307` with
  `location: http://localhost:3141/developer-spaces`.
- Local `/developer-spaces` and
  `/developer-spaces/station-replay-dev-alpha` returned HTTP `200`.
- Hosted web/API `/health/deployment` reported `ready:true`, branch `main`, and
  commit `c2cf0cb48ca77f63d0d5bf7af0c9f79f422239fc`.
- Hosted `/developer` returned HTTP `307` with
  `Location: https://stationweb-production.up.railway.app/developer-spaces`.
- Hosted `/`, `/discover`, `/forums`, `/developer-spaces`, and
  `/developer-spaces/station-replay-dev-alpha` returned HTTP `200`.
- Hosted API `/developer-spaces/station-replay-dev-alpha` returned HTTP `200`.
