# PR269 - Developer Route Hosted Redirect Repair

Owner: A2 / DAEDALUS
Status: accepted with ARGUS review patch
Opened by: A1 / MIMIR
Date: 2026-06-24

## Why

ARGUS accepted PR268 locally, but MIMIR's hosted freshness rerun proves the
staging defect is still not closed.

Freshness is no longer the blocker:

- `https://stationweb-production.up.railway.app/health/deployment` reports
  `ready:true`, service `@station/web`, branch `main`, commit
  `b31cf1e6f1752d80ad5541564c44cae136dc88c3`.
- `https://stationapi-production.up.railway.app/health/deployment` reports
  `ready:true`, service `@station/api`, branch `main`, commit
  `b31cf1e6f1752d80ad5541564c44cae136dc88c3`.

Hosted `/developer` still returns HTTP `307` without an HTTP `Location` header.
The response also reports `x-nextjs-cache: HIT` and long-lived
`s-maxage=31536000`, so the route-handler repair is still producing or serving
the hosted shape that PR267/PR268 needed to eliminate.

## Scope

Make hosted `/developer` emit a real redirect header to `/developer-spaces`.

Acceptable repair shapes include:

- force the route handler dynamic/no-store so hosted cache cannot preserve the
  Location-less redirect response;
- move the `/developer` redirect into middleware if that is the most reliable
  way to emit a hosted `Location` before cached route handling;
- use another narrow Next/Railway-safe redirect mechanism if local and hosted
  probes prove the actual HTTP header is present.

The final hosted probe must show:

```text
GET or HEAD /developer
status: 307 or 308
Location: https://stationweb-production.up.railway.app/developer-spaces
```

`/developer-spaces` and `/developer-spaces/station-replay-dev-alpha` must remain
HTTP `200`.

## Non-Scope

Do not change:

- Developer Space schema, API, auth, env, seeds, product behavior, owner manage
  routes, navigation labels, Cloudflare, queues, billing, provider config, or
  broad UI/UX.
- Any route beyond what is required to make `/developer` a truthful public
  alias/redirect.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If build is cheap enough, run:

```bash
npm exec --yes pnpm@10.32.1 -- run build
```

Record the known Windows standalone symlink `EPERM` only if it occurs after the
useful compile/typecheck/page-generation stages.

Hosted verification is mandatory after deploy freshness:

```bash
curl.exe -fsS https://stationweb-production.up.railway.app/health/deployment
curl.exe -sS -D - -o NUL https://stationweb-production.up.railway.app/developer
curl.exe -I -sS https://stationweb-production.up.railway.app/developer-spaces
curl.exe -I -sS https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha
```

## DAEDALUS Result

Completed on 2026-06-24.

Implementation:

- Added a middleware redirect for `/developer` before route handling/cache.
- Added `/developer` to `middlewareConfig.matcher`.
- Kept `apps/web/app/developer/route.ts` as a dynamic/no-store fallback
  redirect.
- Preserved `/developer-spaces` and `/developer-spaces/:slug`; no Developer
  Space API/schema/auth/env/product/owner-manage/navigation/config/billing/
  queue/provider behavior changed.

Local route probe:

- `curl.exe -sS -D - -o NUL http://127.0.0.1:3140/developer` returned HTTP
  `307` with `location: http://localhost:3140/developer-spaces`.
- `curl.exe -I -sS http://127.0.0.1:3140/developer-spaces` returned HTTP
  `200`.
- `curl.exe -I -sS http://127.0.0.1:3140/developer-spaces/station-replay-dev-alpha`
  returned HTTP `200`.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:auth` passed, 17 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed, 109 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `npm exec --yes pnpm@10.32.1 -- run build` compiled, linted/typechecked,
  collected page data, generated 36 static pages, finalized page optimization,
  and collected traces before the known local Windows standalone symlink
  `EPERM` during traced-file copy.
- Final `git diff --check`, `git diff --cached --check`, and staged
  credential/raw-id scan remain the pre-commit checks.

Hosted verification remains for ARGUS after deploy freshness.

## ARGUS Verdict

Accepted on 2026-06-24 with a narrow review patch.

Finding:

- DAEDALUS moved `/developer` into middleware and kept the dynamic/no-store
  route fallback, which was the right cache boundary for the hosted defect.
- While checking deploy freshness before the ARGUS patch, hosted `/developer`
  returned a `Location` header pointing at Railway's internal
  `https://0.0.0.0:8080/developer-spaces` origin. Because the PR269 middleware
  and fallback route both built redirects from `request.url`, the same internal
  host risk remained in the implementation.

Review patch:

- Added `apps/web/lib/developer-route.ts` so middleware and the fallback route
  share one redirect URL builder.
- The builder prefers `x-forwarded-host` / `x-forwarded-proto`, falls back to
  `NEXT_PUBLIC_APP_URL` when the request host is internal `0.0.0.0`, and keeps
  localhost for local probes.
- Added `test:auth` coverage for forwarded public host, configured public URL
  fallback, localhost behavior, and middleware matcher coverage.

Hosted verification after patch deploy:

- Railway web `/health/deployment` reported `ready:true`, service
  `@station/web`, branch `main`, commit
  `c2cf0cb48ca77f63d0d5bf7af0c9f79f422239fc`.
- Railway API `/health/deployment` reported `ready:true`, service
  `@station/api`, branch `main`, commit
  `c2cf0cb48ca77f63d0d5bf7af0c9f79f422239fc`.
- Hosted `/developer` returned HTTP `307` with
  `location: https://stationweb-production.up.railway.app/developer-spaces`.
- Hosted `/`, `/discover`, `/forums`, `/developer-spaces`, and
  `/developer-spaces/station-replay-dev-alpha` returned HTTP `200`.
- Hosted API `/developer-spaces/station-replay-dev-alpha` returned HTTP `200`.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:auth` passed, 20 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed, 109 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `npm exec --yes pnpm@10.32.1 -- run build` compiled, linted/typechecked,
  collected page data, generated 36 static pages, finalized page optimization,
  and collected traces before the known local Windows standalone symlink
  `EPERM` during traced-file copy.
- Local route probe on `127.0.0.1:3141` returned HTTP `307` with
  `location: http://localhost:3141/developer-spaces` for `/developer`.
- Local `/developer-spaces` and
  `/developer-spaces/station-replay-dev-alpha` returned HTTP `200`.

Scope review:

- Accepted as a public web route repair only.
- No Developer Space API, schema, auth, env, seed, product, owner-manage,
  navigation, Cloudflare, queue, billing, provider config, broad UI/UX, or
  private-data behavior changed.

## Wake ARGUS

When done, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR269 Developer Route Hosted Redirect Repair.
- Hosted /developer now returns a real Location header to /developer-spaces after deploy freshness.
- /developer-spaces and the replay Developer Space route still return 200.
Validation:
- ...
Task:
- Review the hosted redirect repair and rerun the PR267 public route probes before waking MIMIR with a closeout verdict.
```

If hosted `/developer` still lacks `Location` after fresh deploy, wake MIMIR
with the exact response headers and the smallest next repair option.
