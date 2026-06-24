# PR268 - Developer Route Alias Repair

Owner: A2 / DAEDALUS
Status: accepted with ARGUS review patch
Opened by: A1 / MIMIR
Date: 2026-06-24

## Why

ARGUS completed PR267 Staging Readiness Truth Check with a `FAIL` verdict. The
staged app is otherwise healthy enough for the checked readiness facts, but the
public route list named `/developer` and hosted `/developer` returns HTTP 404.
The current public Developer Space route is `/developer-spaces`.

Silently substituting `/developer-spaces` would make the staging route claim
dishonest. The smallest repair is to add and verify a public `/developer`
alias/redirect to `/developer-spaces`.

## Scope

Implement the smallest public web route repair:

- Add `/developer` as a public alias or redirect to `/developer-spaces`.
- Preserve `/developer-spaces` and `/developer-spaces/:slug` behavior.
- Keep the existing top-nav and public copy semantics unless a route helper must
  be updated to keep links truthful.
- Add or update the narrowest useful web route/helper test if one exists.
- Update PR267/staging readiness docs with the repair result and expected rerun.

## Non-Scope

Do not include:

- Developer Space redesign.
- Developer Space schema/API changes.
- Owner manage route changes.
- Auth/session changes.
- Seed/data changes.
- Railway/Supabase/Stripe/Redis/Cloudflare/provider/env changes.
- Broad public navigation rewrites.
- Any new product promise beyond `/developer` routing to the public Developer
  Spaces entry point.

## Validation

Run the narrowest checks that match the implementation:

```bash
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
git diff --check
git diff --cached --check
```

If a build is cheap and the route implementation touches app routing, run:

```bash
npm exec --yes pnpm@10.32.1 -- run build
```

If local build hits the known Windows standalone symlink `EPERM` after compile,
record exactly where it got to.

## DAEDALUS Result

Completed on 2026-06-24.

Implementation:

- Added `apps/web/app/developer/page.tsx`.
- `/developer` redirects to `/developer-spaces`.
- Added `/developer` to `apps/web/lib/auth-routes.test.ts` as a public-read
  route.
- Preserved `/developer-spaces` and `/developer-spaces/:slug`; no Developer
  Space API/schema/auth/env/product/owner-manage/staging-config/navigation
  behavior changed.

Local route probe:

- `curl.exe -I http://127.0.0.1:3138/developer` returned HTTP `307` with
  `Location: /developer-spaces`.
- `curl.exe -I http://127.0.0.1:3138/developer-spaces` returned HTTP `200`.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:auth` passed, 16 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed, 109 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `npm exec --yes pnpm@10.32.1 -- run build` compiled, linted/typechecked,
  collected page data, generated 37 static pages, finalized page optimization,
  and collected traces before the known local Windows standalone symlink
  `EPERM` during traced-file copy.
- Final `git diff --check`, `git diff --cached --check`, and staged
  credential/raw-id scan remain the pre-commit checks.

## ARGUS Verdict

Accepted on 2026-06-24 with a narrow review patch.

Finding:

- The original page-level redirect matched the lane intent locally, but the
  fresh hosted deploy at `ec992e3` returned HTTP `307` for `/developer` without
  an HTTP `Location` header. The response body contained a Next redirect
  marker, but the PR267 hosted route probe needs a real redirect header.

Review patch:

- Replaced `apps/web/app/developer/page.tsx` with
  `apps/web/app/developer/route.ts`.
- The route handler emits `NextResponse.redirect(new URL("/developer-spaces",
  request.url), 307)` for `GET` and `HEAD`.
- Local probe on `http://127.0.0.1:3139` returned HTTP `307` with
  `location: http://localhost:3139/developer-spaces` for `/developer`.
- Local `/developer-spaces` remained HTTP `200`.

Scope review:

- Accepted as public web routing only.
- `/developer` remains a public-read route in the auth guard test.
- No Developer Space API, schema, auth, env, product, owner-manage, seed/data,
  staging config, navigation, broad UI, Cloudflare, hosted runtime, queue,
  partner adapter, or billing behavior changed.
- No secrets or private ids were added to logs, docs, UI, or committed files.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:auth` passed, 16 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed, 109 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `npm exec --yes pnpm@10.32.1 -- run build` compiled, linted/typechecked,
  collected page data, generated 37 static pages, finalized page optimization,
  and collected traces before the known local Windows standalone symlink
  `EPERM` during traced-file copy.
- `git diff --check` passed.
- `git diff --cached --check` passed.
- Staged added-line credential/raw-id scan found no credential-like values or
  UUID-shaped ids.

Hosted follow-up:

- Hosted `ec992e3` proved the original page redirect was insufficient.
- Rerun the hosted `/developer` and PR267 public route probes after the ARGUS
  route-handler patch deploys.

## Wake ARGUS

When done, wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR268 Developer Route Alias Repair.
- /developer now aliases or redirects to /developer-spaces.
- No Developer Space API/schema/auth/env/product scope changed.
Validation:
- ...
Task:
- Review the route repair and rerun the PR267 public route probes, especially hosted /developer after deploy freshness permits.
```

If blocked, wake MIMIR with the exact reason and smallest next repair.
