# Vercel web fallback prep

Station's root `vercel.json` is prepared for the web app only:

- `rootDirectory`: `apps/web`
- `framework`: `nextjs`
- build from repo root with `pnpm turbo run build --filter=@station/web`
- output: `apps/web/.next`
- install currently runs `pnpm install --no-frozen-lockfile`

This does not deploy the Express API. Railway `@station/api` is the current API
host. As of the 2026-06-08 Railway-web lane, Railway `@station/web` is the
current staging default, so this document is fallback/historical prep rather
than the active staging path.

If MIMIR or the human reopens Vercel web staging, the web app must point at the
Railway API URL before replaying real authenticated flows online.

The Vercel install command is looser than the repo validation gate. CI and
replay acceptance should continue to use `pnpm install --frozen-lockfile` unless
MIMIR explicitly waives that check.

## Required web environment

Set these in the Vercel project only if Vercel becomes the chosen web host:

```bash
NEXT_PUBLIC_APP_URL=https://<station-web-staging>
NEXT_PUBLIC_API_URL=https://stationapi-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://<supabase-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

`API_URL` is not a browser-safe substitute for `NEXT_PUBLIC_API_URL`; the web
client reads `NEXT_PUBLIC_API_URL` when running in the browser.

## Still external

- Provide the concrete Vercel web staging URL if this fallback is reopened.
- Configure Supabase auth site URL and redirect URLs for the staged web URL.
- Configure Stripe test-mode webhook endpoint against the staged API URL.
- Confirm the pushed GitHub/Vercel status for the exact commit being replayed.
