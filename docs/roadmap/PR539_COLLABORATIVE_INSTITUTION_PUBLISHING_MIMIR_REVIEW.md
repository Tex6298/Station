# PR539 Collaborative Institution Publishing - MIMIR Review

Owner: MIMIR / A1 -> DAEDALUS / A2

Date reviewed: 2026-07-31

Status:

```text
CHANGES_REQUIRED_PR539_PUBLIC_ROUTE_AUTH_SCOPE_AND_LINK_TRUTH
```

## Decision

PR539's first-class publication model, retained hosted lifecycle, role
authority, attribution, optimistic conflict behavior, audit pairing, and
personal-document isolation are credible. The lane is not ready for ARIADNE,
because the new router currently places a root-wide authentication gate in
front of unrelated public API routes. One adjacent public-link truth defect
must be corrected in the same bounded source/deploy pass.

ARGUS did not consume the handoff, so MIMIR performed the documented
unavailable-reviewer fallback against executable source
`2d35c1661ca8a2c780a5710dad62a45c4570e541`.

## Finding 1 - Root-mounted Auth Middleware Blocks Unrelated Public Routes

Severity: blocker

`institutionPublicationsRouter` is mounted at the API root before the
Institution and Developer Space routers. Its exact public publication route is
followed by an unscoped `institutionPublicationsRouter.use(requireAuth)`.
Every request that does not match that one public publication route therefore
passes through `requireAuth`, including unrelated routes registered later in
`apps/api/src/app.ts`.

Fresh signed-out hosted probes at exact deployed source returned:

```text
/institutions/public/station-institutional-alpha -> 401
/developer-spaces/public -> 401
/developer-spaces/station-replay-dev-alpha -> 401
```

These are existing public product surfaces. Their regression was missed
because the focused route test mounts only `institutionPublicationsRouter` and
does not place a public neighbour after it.

Required correction:

- scope both `requireAuth` and private `Cache-Control` middleware to the
  Institution publication private route family only;
- preserve the exact signed-out publication route before that private gate;
- add an app-order or equivalent next-router regression test proving an
  unrelated signed-out public route is not intercepted; and
- after deploy, prove all three routes above return their prior public status,
  the retained public publication still returns `200`, and an anonymous
  private publication request still returns `401`.

Do not move authentication responsibility into the browser, weaken private
publication auth, or reorder unrelated routers as a substitute for correctly
scoping this router.

## Finding 2 - Public Href Ignores Project Visibility

Severity: correction required

The public read route correctly requires the attached Project to have public
visibility, but private publication serialization builds `publicHref` from
publication status plus Institution state only. A published publication whose
Project becomes private therefore advertises an `Open public page` link that
returns `404`.

Required correction:

- derive `publicHref` from publication, verified/public Institution, and
  public Project state together;
- keep the public route fail-closed for non-public Projects; and
- add a focused test that Project visibility loss removes the href and keeps
  signed-out read at `404`, with restoration returning both.

This does not require changing migration `094`, replaying the retained
publication lifecycle, or adding a global Discover index.

## Evidence That Remains Accepted

MIMIR restarted `.station-private/pr539/operator.mjs verify` and confirmed:

- exact migration SHA
  `BC2402C5474707ADCC4270DF7830A571270C0D225D3233D8D3DB3AFDBD408C6D`;
- API and web healthy at exact source `2d35c166`;
- one migration ledger row, one retained publication at version `7`, and seven
  paired publication audit events;
- three service RPCs, zero browser RPC/table authority, and two audit resource
  columns;
- tagged Auth users and memberships at zero; and
- anonymous/service table catalog status `401/200`.

Fresh independent validation also passes:

- `test:institution-publications` (`4/4`);
- `test:institutions` (`16/16`); and
- `test:projects` (`33/33`).

Those results establish the bounded correction baseline; they do not waive the
live public-route regression.

## Baton

DAEDALUS applies only these two corrections, adds regression coverage,
redeploys the exact corrected source, reruns the retained read-only verifier
and focused/neighbour suites, and records public-safe hosted route receipts.
Then wake MIMIR for correction review. Do not wake ARIADNE until the corrected
source and hosted public boundary are accepted.
