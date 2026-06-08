# Station staging replay readiness

Status: staging preparation with a live API host. Full staged replay is still
not implemented or verified by this document.

This runbook names what must be true before a human replay pass can produce
useful product evidence from an online/staged Station deployment.

## Current repo facts

- Web is a Next.js app in `apps/web`.
- API is an Express app in `apps/api` with `GET /health` returning `{ ok: true }`.
- Root `railway.json` pins the Railway API service to Railpack with
  `pnpm --dir apps/api build`, `pnpm --dir apps/api start`, `/health`, and
  API/shared-package watch patterns.
- Railway `@station/api` is sourced from `Tex6298/Station` on `main` and
  answers `https://stationapi-production.up.railway.app/health` with
  `{ "ok": true }`.
- Root `vercel.json` targets the web app only. This records the current
  web-host prep shape, not a final decision that Vercel must remain the staging
  host.
- The current Vercel install command uses `pnpm install --no-frozen-lockfile`;
  CI and replay acceptance should still use the pinned frozen-lockfile gate
  unless MIMIR explicitly waives it.
- MIMIR's provisional default is now Vercel for web and Railway for the Express
  API. Railway setup notes live in `infra/railway/README.md`.
- The API has `pnpm --dir apps/api build` and `pnpm --dir apps/api start`
  equivalents through the package scripts. The external Railway API service now
  exists, but this repo still does not include secrets and does not make the web
  app, Supabase project, Stripe test resources, or replay data real.
- Supabase migrations and setup notes live in `infra/supabase/README.md`.
- Stripe Billing setup notes live in `infra/stripe/webhook.md`.
- Local validation and remote deployment truth are separate; a green local gate
  is not proof that staging is live.

## External facts needed

MIMIR or the human operator must provide these before DAEDALUS can implement or
verify staging:

| Need | Required value |
| --- | --- |
| Web host/provider | Current default is the existing Vercel-shaped web setup; still needs concrete project/status truth. |
| Web staging URL | Public URL for the chosen web host. |
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

- Web host/provider: keep the current Vercel web-app shape for staging.
- API host/provider: use Railway as the default Node host for the Express API.
- Supabase: use a dedicated staging project, not the production or local project.
- Supabase storage: create a private `persona-files` bucket in staging.
- Stripe: use test mode only, with staging webhook endpoint pointed at the
  staged API.
- Replay account/data: set up the first replay manually through the UI/API;
  defer a seed script until manual setup becomes repetitive.
- Remote truth: verify GitHub CI and web/API deployment status for the exact
  commit under replay.

Current DAEDALUS hosting decision: preserve Railway for `@station/api` only.
Keep web staging on the Vercel-shaped path. Railway `@station/web` is
failed/stopped and should stay disconnected or ignored unless MIMIR opens a
separate Railway-web configuration lane.

Remaining human/MIMIR facts: concrete web URL, staging Supabase project values,
Supabase auth redirects, Stripe test Price IDs/webhook secret, replay account
credentials, and web plus API remote status for the pushed commit.

## Current Railway project state

As of 2026-06-08, Railway `@station/api` is sourced from `Tex6298/Station` on
`main`, deploys from the root API-shaped `railway.json`, and returns `200` from:

```text
https://stationapi-production.up.railway.app/health
```

Railway `@station/web` also exists from `Tex6298/Station` but is failed/stopped.
The plain `api` service is an unused shell. Keep runtime secrets on
`@station/api`; do not duplicate them onto `@station/web` or the plain `api`
shell.

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
NEXT_PUBLIC_APP_URL=https://<station-web-staging>
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

This repo is ready for an ARGUS review of Railway API deploy hygiene and
documentation truth. It is not ready to claim full staging implementation until
the external facts above are supplied and the web/Supabase/Stripe/replay pieces
are configured around the live API host.
