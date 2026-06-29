# PR484D - Archive Connector Provider App Config Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Closed

## Decision

MIMIR closes PR484D as accepted.

The lane ran through:

- PR484D ARGUS preflight;
- PR484D DAEDALUS implementation;
- PR484D ARGUS review.

ARIADNE hosted rehearsal is not required because PR484D is API-only,
read-only, locally tested, and mutation-free.

## Accepted Product Shape

PR484D accepts archive-specific provider app config names:

```text
ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID
ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET
ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID
ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET
```

The names are intentionally separate from paused social publishing config:

```text
REDDIT_CLIENT_ID
REDDIT_CLIENT_SECRET
```

Accepted readiness behavior:

- provider app config uses only archive-specific env names;
- each provider requires both id and secret before reporting `configured`;
- partial provider app config reports only safe `partial` status and does not
  reveal which side is present;
- readiness remains owner-only, archive-connector scoped, and action-disabled;
- provider app config does not enable credential writes, OAuth state creation,
  redirects/callbacks, token exchange, provider calls, source inventory, or
  import writes.

## Boundaries Kept

No OAuth state create route, credential write/revoke route, OAuth redirect,
OAuth callback, token exchange, token refresh/revocation execution, provider
SDK, live Reddit/Discord API call, configured real test credential, source
inventory pull, recurring pull, import write, route UI, job, queue, worker,
Redis, Cloudflare, billing/Stripe, provider/model call, package dependency,
hosted runtime behavior, public connector page, broad connector marketplace,
or social posting behavior was added.

The readiness response excludes env names, env values, client ids, client
secrets, secret tails, OAuth codes, access tokens, refresh tokens, cookies,
credentials, raw external account ids, raw owner or row ids, provider payloads,
private source bodies, private messages, archive snippets, SQL/table details,
table names, stack traces, hosted logs, storage paths, signed URLs, prompts,
and secret-shaped values.

## Validation Accepted

- DAEDALUS implementation:
  `docs/roadmap/PR484D_ARCHIVE_CONNECTOR_PROVIDER_APP_CONFIG_RESULT.md`.
- ARGUS review:
  `docs/roadmap/PR484D_ARCHIVE_CONNECTOR_PROVIDER_APP_CONFIG_REVIEW_RESULT.md`.

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
- implementation scope and social config coupling scans.

## Next Lane Rule Applied

PR484D removes the provider app config contract blocker. A real connector still
needs an owner/session-bound OAuth state route before redirects, callbacks,
token exchange, credentials, source inventory, or import writes can exist.

MIMIR therefore opens PR484E as a hostile preflight for the smallest API
mutation that directly enables live archive connector product depth:

`docs/roadmap/PR484E_ARCHIVE_CONNECTOR_OAUTH_STATE_START_PREFLIGHT_ARGUS.md`
