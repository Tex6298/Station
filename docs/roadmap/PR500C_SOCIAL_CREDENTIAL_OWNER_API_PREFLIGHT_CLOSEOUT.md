# PR500C - Social Credential Owner API Preflight Closeout

Owner: MIMIR / A1

Date: 2026-07-07

Status: Closed

## Decision

MIMIR accepts ARGUS's PR500C preflight result:

```text
ACCEPT_PR500C_SOCIAL_CREDENTIAL_OWNER_API
```

ARGUS result:

`docs/roadmap/PR500C_SOCIAL_CREDENTIAL_OWNER_API_PREFLIGHT_RESULT.md`

## Accepted Product Truth

DAEDALUS may implement a backend-only, owner-authenticated social credential API
for Bluesky manual credentials, using PR500A encrypted storage and the
PR500B-proven hosted migration 072 schema.

Accepted routes:

```text
GET /social/connectors/credentials
POST /social/connectors/credentials
DELETE /social/connectors/credentials/:provider
```

The delete route is provider-scoped only. Credential-id delete is not accepted.

## Boundaries

This lane does not accept OAuth, provider calls, posting, Settings UI, document
page changes, queues, workers, billing, Cloudflare, partner adapters, package or
lockfile drift, public syndication, hosted schema changes, legacy social table
behavior, or readiness unpause.

## Next Lane

Route DAEDALUS:

`docs/roadmap/PR500C_SOCIAL_CREDENTIAL_OWNER_API_DAEDALUS.md`
