# PR268 - Developer Route Alias Repair

Owner: A2 / DAEDALUS
Status: open
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
