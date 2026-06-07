# Vercel web staging prep

Station's root `vercel.json` is prepared for the web app only:

- `rootDirectory`: `apps/web`
- `framework`: `nextjs`
- build from repo root with `pnpm turbo run build --filter=@station/web`
- output: `apps/web/.next`
- install currently runs `pnpm install --no-frozen-lockfile`

This does not deploy the Express API. Staging still needs a separate Node host
for `apps/api` before the web app can replay real authenticated flows online.
Treat this as documentation of the current web-host prep shape, not a final
decision that Vercel must remain the staging host.

The Vercel install command is looser than the repo validation gate. CI and
replay acceptance should continue to use `pnpm install --frozen-lockfile` unless
MIMIR explicitly waives that check.

## Required web environment

Set these in the Vercel project once staging URLs exist:

```bash
NEXT_PUBLIC_APP_URL=https://<station-web-staging>
NEXT_PUBLIC_API_URL=https://<station-api-staging>
NEXT_PUBLIC_SUPABASE_URL=https://<supabase-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

`API_URL` is not a browser-safe substitute for `NEXT_PUBLIC_API_URL`; the web
client reads `NEXT_PUBLIC_API_URL` when running in the browser.

## Still external

- Confirm Vercel is still the chosen web host or replace this prep with the
  chosen host's equivalent.
- Choose and configure the API host.
- Configure Supabase auth site URL and redirect URLs for the staged web URL.
- Configure Stripe test-mode webhook endpoint against the staged API URL.
- Confirm the pushed GitHub/Vercel status for the exact commit being replayed.
