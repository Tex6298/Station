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
- Known caveats travel into staging review instead of spawning more local polish:
  static global Archive/Export shells, dashboard derived/static snippets, no
  downloadable bundles/workers, and no new private search UI beyond the accepted
  API/search foundation.

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
  targets the web app only and that `apps/api` still needs a separate Node host.
- Updated `.env.example` with staging-critical API runtime placeholders:
  `PORT`, `JWT_SECRET`, and optional `DEVELOPER_SPACE_SSE_POLL_MS`.
- Did not add hosting provider config, new routes, seed scripts, product
  behavior, or deployed URLs.

Staging implementation remains blocked on human/MIMIR deployment choices:
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

Implementation remains blocked on the concrete Railway/Vercel URLs, staging
Supabase values, Supabase auth redirects, Stripe test resources, replay
account/data, and remote status for the exact commit.

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

## Acceptance posture

ARGUS should review any staging-readiness patch for:

- truthful deploy claims
- env and secret handling
- auth/owner visibility
- CI/build reproducibility
- clear separation between local validation and remote deployment truth

ARIADNE should review only after a staged URL or replay harness exists.
