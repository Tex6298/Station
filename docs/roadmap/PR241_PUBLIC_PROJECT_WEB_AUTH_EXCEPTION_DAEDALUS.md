# PR241 - Public Project Web Auth Exception

Owner: DAEDALUS
Reviewer: ARGUS
Status: Implemented - ARGUS review pending
Opened: 2026-06-24
Implemented: 2026-06-24

## Frame

ARIADNE failed PR240 because the hosted anonymous web page
`/projects/public/ariadne-pr240-public-profile-202606241001` redirected to
login on desktop and mobile.

The hosted API route passed:

- anonymous `GET /projects/public/:slug` returned the allowed public Project
  profile payload;
- UUID-shaped, invalid, and private Project slugs stayed closed;
- owner-only `GET /projects/:slug` still required auth.

This is a web auth guard/matcher defect, not a public Project API rewrite.

## Known Locus

- `apps/web/lib/auth-routes.ts`
- `apps/web/middleware.ts`
- `apps/web/lib/auth-routes.test.ts`

Current issue:

- `isProtectedRoute()` returns `true` for all `/projects` paths.
- Middleware matcher includes `/projects/:path*`, so `/projects/public/:slug`
  is redirected before the public page can render.

## Goal

Allow anonymous web access to:

```text
/projects/public/:slug
```

while preserving auth protection for:

```text
/projects
/projects/:idOrSlug
/projects/<anything other than public route>
```

Do not weaken API authorization. Do not change the public Project API contract
unless required to compile.

## Scope

Expected implementation shape:

- Update `isProtectedRoute()` so the public Project profile route family is not
  protected.
- Keep the middleware matcher broad if that is the local pattern; the helper
  exception is enough as long as tests prove the public route no longer
  redirects.
- Keep owner Project routes protected.
- Keep signed-out `/projects/:slug` redirect behavior.

## Tests

Update `apps/web/lib/auth-routes.test.ts`:

- `/projects/public/example-project` is public;
- `/projects/public/ariadne-pr240-public-profile-202606241001` is public;
- `/projects` is protected;
- `/projects/owner-project` is protected;
- `/projects/public` behavior is explicit. Prefer public/404 page behavior if
  the route family is public, but do not allow it to expose owner content.

Run `test:auth` to cover middleware/auth helper behavior.

Run `test:projects` to prove the public Project profile route/helper contract
still passes after the auth exception.

## Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

## Hard Exclusions

Do not add:

- schema or migrations;
- public Project creation or public transition UI;
- Discover Project cards;
- Project evidence, documents, document routes, or activity counters;
- public Project reporting/moderation;
- member invitations or member-role authorization;
- institutional/lab/company account ownership;
- Project exports or Project export permissions;
- billing, Stripe, invoices, tax, marketplace, customer records, quotas, or
  tier changes;
- hosted runtime, containers, queues, workers, Redis, Cloudflare, or Developer
  Agent runtime actions;
- Project-authored forum posts;
- provider/model calls or broad UI redesign.

Do not expose owner ids, raw member rows, private Project evidence, private or
draft document routes, document bodies, raw Developer Space event payloads,
private node metrics/snapshots, prompts, completions, provider fields, traces,
reports, export bundle contents, ingestion keys, webhook secrets, env values,
service keys, SQL, stack traces, or raw JSON blobs.

## Review Handoff

When implementation is complete, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS repaired PR241 Public Project web auth exception.
Risk:
- The public Project profile page must be anonymous, while owner Project routes
  stay protected.
Task:
- Review implementation and tests against
  docs/roadmap/PR241_PUBLIC_PROJECT_WEB_AUTH_EXCEPTION_DAEDALUS.md.
- Wake MIMIR with ACCEPT / PATCH / REJECT and whether ARIADNE needs a focused
  hosted rerun.
```

## DAEDALUS Result - 2026-06-24

Implementation:

- Updated `apps/web/lib/auth-routes.ts` so `/projects/public` route-family
  paths are public.
- Preserved auth protection for `/projects`, `/projects/:idOrSlug`, and other
  non-public Project paths.
- Kept `apps/web/middleware.ts` matcher behavior unchanged.
- Updated `apps/web/lib/auth-routes.test.ts` to prove:
  - `/projects/public/example-project` is public;
  - `/projects/public/ariadne-pr240-public-profile-202606241001` is public;
  - `/projects/public` is public and will fall through to public/404 page
    behavior rather than owner auth redirect;
  - `/projects` and `/projects/owner-project` remain protected.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:auth` passed with 16 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:projects` passed with 11 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `git diff --check` passed with CRLF normalization warnings only.
- `git diff --cached --check` passed with CRLF normalization warnings only.

Review:

- ARGUS review required before MIMIR decides whether ARIADNE needs a focused
  hosted rerun.
