# PR484C - Connector OAuth Readiness Route Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Closed

## Decision

MIMIR closes PR484C as accepted.

The lane ran through:

- PR484C ARGUS preflight;
- PR484C DAEDALUS implementation;
- PR484C ARGUS review.

ARIADNE hosted rehearsal is not required because PR484C is API-only,
read-only, locally tested, and mutation-free.

## Accepted Product Shape

PR484C adds the authenticated read-only route:

```text
GET /archive-connectors/readiness
```

Accepted behavior:

- owner-only auth gate through `requireAuth`;
- archive connector purpose only;
- `reddit` and `discord` only;
- safe setup/readiness metadata only;
- connector encryption status as a boolean/status only;
- provider OAuth app config remains not accepted/configured;
- credential writes, OAuth state creation, redirects/callbacks, token exchange,
  provider calls, source inventory, and import writes remain disabled.

## Boundaries Kept

No OAuth state create route, credential write/revoke route, OAuth redirect,
OAuth callback, token exchange, token refresh/revocation execution, provider
SDK, live Reddit/Discord API call, configured test credential, source inventory
pull, recurring pull, import write, route UI, job, queue, worker, Redis,
Cloudflare, billing/Stripe, provider/model call, package dependency, hosted
runtime behavior, public connector page, broad connector marketplace, or social
posting behavior was added.

The readiness response excludes env names, env values, access tokens, refresh
tokens, OAuth codes, cookies, credentials, raw external account ids, raw owner
or row ids, provider payloads, private source bodies, private messages, archive
snippets, SQL/table details, table names, stack traces, hosted logs, storage
paths, signed URLs, prompts, and secret-shaped values.

## Validation Accepted

- DAEDALUS implementation:
  `docs/roadmap/PR484C_CONNECTOR_OAUTH_READINESS_ROUTE_RESULT.md`.
- ARGUS review:
  `docs/roadmap/PR484C_CONNECTOR_OAUTH_READINESS_ROUTE_REVIEW_RESULT.md`.

Accepted validation included:

- archive connector readiness route tests;
- archive connector credential storage tests;
- archive connector credential contract tests;
- no-write import preview tests;
- Reddit/Discord parser tests;
- social fail-closed route tests;
- web social readiness guard tests;
- typecheck;
- whitespace validation;
- path-scope and sensitive/scope scans.

## Next Lane Rule Applied

PR484C proves a safe owner-only readiness route. The next blocker is accepted
archive-specific provider app configuration naming and readback semantics.

MIMIR therefore opens PR484D as a narrow preflight before any OAuth state
creation, redirect/callback, provider call, token exchange, source inventory,
credential write, or import flow:

`docs/roadmap/PR484D_ARCHIVE_CONNECTOR_PROVIDER_APP_CONFIG_PREFLIGHT_ARGUS.md`
