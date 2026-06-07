# Railway API staging prep

Status: preparation only. No Railway project, service, URL, or secret is created
by this file.

MIMIR's current staging default is:

- Web: Vercel-shaped `apps/web` staging.
- API: Railway-hosted Express service from `apps/api`.
- Database/auth/storage: dedicated Supabase staging project.
- Billing: Stripe test mode.
- Replay data: first pass set up manually through the UI/API.

## Service target

The Railway service should run the Express API, not the Next.js web app.

The root `railway.json` pins the API service deployment shape for this shared
pnpm/Turbo monorepo:

- Railpack builder
- build command: `pnpm --dir apps/api build`
- start command: `pnpm --dir apps/api start`
- health check: `/health`
- watch patterns covering `apps/api`, shared `packages`, and workspace config

From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm --dir apps/api build
pnpm --dir apps/api start
```

The API listens on `PORT`, defaulting to `4000` locally. Railway should provide
the runtime port through `PORT`; do not hard-code `4000` for staging unless the
provider explicitly requires a static override.

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
API_URL=https://<station-api-staging>
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
`STRIPE_SECRET_KEY`, or `STRIPE_WEBHOOK_SECRET` on the Vercel web project.

## Paired web environment

The Vercel web app must point at the Railway API URL:

```bash
NEXT_PUBLIC_APP_URL=https://<station-web-staging>
NEXT_PUBLIC_API_URL=https://<station-api-staging>
NEXT_PUBLIC_SUPABASE_URL=https://<supabase-staging-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Supabase and Stripe pairing

- In Supabase Auth settings, set the site URL and redirect URLs to the staged
  Vercel web URL.
- Create a private `persona-files` storage bucket in the staging Supabase
  project.
- In Stripe test mode, point the webhook endpoint at:

```text
https://<station-api-staging>/billing/webhook
```

Use the webhook event list in `infra/stripe/webhook.md`.

## Verification once URLs exist

These commands are placeholders until the real URLs exist:

```bash
curl -f https://<station-api-staging>/health
curl -I https://<station-web-staging>
curl -i https://<station-api-staging>/auth/me
```

Expected:

- `/health` returns `200`.
- the web URL returns a successful app shell response.
- unauthenticated `/auth/me` returns an auth error, proving the route is online
  without requiring a replay token.

After that, use `docs/ops/STAGING_REPLAY_READINESS.md` for the human replay
path.

## Still not implemented

This file does not create:

- a Railway project
- a Railway service
- a deployed API URL
- secrets
- a Supabase staging project
- Stripe test resources
- replay account data
