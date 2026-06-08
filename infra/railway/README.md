# Railway staging prep

Status: Railway API is live and the Railway web lane is open for staging prep.
The repo still does not store secrets, but the external Railway services are
real current facts.

As of 2026-06-08:

- Source repo for Railway staging work: `Tex6298/Station`, branch `main`.
- Healthy API service: `@station/api`.
- API URL: `https://stationapi-production.up.railway.app`.
- Health check: `https://stationapi-production.up.railway.app/health` returns
  `200` with `{ "ok": true }`.
- Web service: `@station/web`.
- Web URL: `https://stationweb-production.up.railway.app`.
- Railway's environment label may say `production`; Station is treating this as
  staging-prep infrastructure until the web/Supabase/Stripe/replay pieces are
  configured together.
- Plain `api` is an unused service shell.

MIMIR's current staging default is:

- Web: Railway-hosted Next.js service from `apps/web`.
- API: Railway-hosted Express service from `apps/api`.
- Database/auth/storage: dedicated Supabase staging project.
- Billing: Stripe test mode.
- Replay data: first pass set up manually through the UI/API.

## Service targets

The Railway services share the same root `railway.json`. That config calls
service-aware scripts:

- `@station/api` builds `apps/api` and starts `apps/api/dist/server.js`.
- `@station/web` builds `apps/web` in Next standalone mode and starts the
  generated standalone server.

The root `railway.json` pins the deployment shape for this shared pnpm/Turbo
monorepo:

- Railpack builder
- build command: `node scripts/railway-build.mjs`
- start command: `node scripts/railway-start.mjs`
- health check: `/health`
- watch patterns covering `apps/api`, `apps/web`, shared `packages`, the
  Railway scripts, and workspace config

From the repository root:

```bash
pnpm install --frozen-lockfile
node scripts/railway-build.mjs
node scripts/railway-start.mjs
```

The API and Next standalone server listen on `PORT` when Railway provides it.
Do not hard-code `4000` or `3000` for staging unless the provider explicitly
requires a static override.

Health check path:

```text
/health
```

Expected response:

```json
{ "ok": true }
```

## Required Railway API environment

Set these on the Railway API service only:

```bash
# Railway normally injects PORT at runtime; do not hard-code 4000.
PORT=<railway-provided-port>
API_URL=https://stationapi-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://<station-web-staging>
SUPABASE_URL=https://<supabase-staging-project>.supabase.co
SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DATABASE_URL=<staging-database-url>
JWT_SECRET=<strong-staging-secret>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_YEARLY=price_...
STRIPE_PRICE_CREATOR_MONTHLY=price_...
STRIPE_PRICE_CREATOR_YEARLY=price_...
STRIPE_PRICE_CANON_MONTHLY=price_...
STRIPE_PRICE_CANON_YEARLY=price_...
DEEPSEEK_API_KEY=<optional-for-platform-chat>
OPENAI_API_KEY=<optional-for-embeddings>
DEVELOPER_SPACE_SSE_POLL_MS=5000
```

Do not set `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `JWT_SECRET`,
`STRIPE_SECRET_KEY`, or `STRIPE_WEBHOOK_SECRET` on the Railway web service or
any other web host.

## Railway web environment

The Railway web app must point at the Railway API URL:

```bash
NEXT_PUBLIC_APP_URL=https://stationweb-production.up.railway.app
NEXT_PUBLIC_API_URL=https://stationapi-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://<supabase-staging-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Supabase and Stripe pairing

- In Supabase Auth settings, set the site URL and redirect URLs to the staged
  Railway web URL.
- Create a private `persona-files` storage bucket in the staging Supabase
  project.
- In Stripe test mode, point the webhook endpoint at:

```text
https://stationapi-production.up.railway.app/billing/webhook
```

Use the webhook event list in `infra/stripe/webhook.md`.

## Verification

The API URL is now concrete:

```bash
curl -f https://stationapi-production.up.railway.app/health
curl -i https://stationapi-production.up.railway.app/auth/me
```

```bash
curl -f https://stationweb-production.up.railway.app/health
curl -I https://stationweb-production.up.railway.app
```

Expected:

- `/health` returns `200`.
- the web URL returns a successful app shell response once it exists.
- unauthenticated `/auth/me` returns an auth error, proving the route is online
  without requiring a replay token.

After that, use `docs/ops/STAGING_REPLAY_READINESS.md` for the human replay
path.

## Still not implemented

This repo file does not create:

- a Railway project
- a Railway service
- a web staging URL
- secrets
- a Supabase staging project
- Stripe test resources
- replay account data

## Historical Railway CLI state

Checked from the repo on 2026-06-07:

- Workspace: `tex6298's Projects`
- Project: `capable-learning`
- Project ID: `4c716631-6110-4cec-85f1-ab925239b337`
- Environment: `production`
- API service shell: `api`
- API service ID: `7b0b1d3f-3fe2-45ed-a720-88911cf502a4`
- Source: not connected
- Deployment: none
- Domain: none
- Service variables: Railway system variables only

The available `RAILWAY_TOKEN` can read the project, create/read the `api`
service, and list service variables by explicit selector. It cannot connect a
GitHub source or write a local `.railway` link; those commands return
`Unauthorized`. Connect `Tex6298/Station` branch `main` to the `api` service in
the Railway dashboard, or provide a Railway token with permission to manage
service sources.

For that historical plain `api` shell, do not deploy it unless these runtime
values exist on the service:

- `API_URL`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `JWT_SECRET`
- Stripe test-mode keys, prices, and webhook secret

## Current Railway service posture

Checked through the 2026-06-08 triad handoff and remote health smoke:

- `@station/api` is sourced from `Tex6298/Station` on `main`.
- `@station/api` deploys successfully from the root API-shaped `railway.json`.
- `@station/api` answers
  `https://stationapi-production.up.railway.app/health` with `{ "ok": true }`.
- Supabase runtime secrets were moved to `@station/api`; values are not recorded
  here and must not be duplicated onto web services.
- `@station/web` has a generated Railway URL, but ARGUS's 2026-06-08 live check
  returned Railway `404 Application not found` from `/health`; do not treat web
  staging as live until it returns `200`.
- The plain `api` service is an unused shell and should not receive new
  secrets/config unless MIMIR explicitly retires `@station/api`.
- The local Railway CLI is not installed in this shell, so service-list checks
  could not be repeated here.
