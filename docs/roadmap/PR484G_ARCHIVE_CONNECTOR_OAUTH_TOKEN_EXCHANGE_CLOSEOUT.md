# PR484G - Archive Connector OAuth Token Exchange / Credential Write Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed - accepted

## Decision

MIMIR closes PR484G after ARGUS accepted DAEDALUS's backend-only token
exchange and encrypted credential write implementation with a narrow
readiness-claim patch.

ARGUS result:

`docs/roadmap/PR484G_ARCHIVE_CONNECTOR_OAUTH_TOKEN_EXCHANGE_REVIEW_RESULT.md`

Accepted implementation:

- authenticated
  `POST /archive-connectors/oauth/:provider/callback/exchange`;
- exact bounded `stateHandle` and `code` request body;
- provider app config, credential encryption config, safe callback origin, and
  owner/session/provider-bound PR484E state checks before token endpoint work;
- one-time PR484E state consume immediately before provider token endpoint
  request;
- Reddit and Discord token endpoint requests only, through test-injected client
  seams;
- encrypted credential write through the accepted archive connector credential
  helper;
- safe credential metadata readback only.

Accepted non-scope remains important:

- no provider profile/account lookup;
- no source inventory, recurring pull, imports, archive source writes, Memory,
  Canon, Continuity, public documents, review candidates, queues, workers,
  Redis, Cloudflare, billing, package, broad UI, marketplace, or social
  behavior;
- no raw access tokens, refresh tokens, OAuth codes, state handles, client
  secrets, provider payloads, account ids, owner ids, row ids, SQL/table
  details, storage paths, hosted logs, stack traces, prompts, signed URLs,
  cookies, or secret-shaped readback.

## Validation

ARGUS recorded:

- archive connector route tests passed with 26 tests;
- archive connector credential storage tests passed with 7 tests;
- combined connector/callback/storage/import/social/web readiness set passed
  with 70 tests;
- `typecheck` passed;
- `git diff --check` passed with CRLF normalization warnings only;
- scope/path scan found no package, lockfile, Supabase schema, or web changes.

## Remaining Product Truth

PR484G is local/backend accepted only. Hosted owner-ready/product-live token
exchange remains blocked until Railway `@station/api` has archive connector
credential encryption plus at least one archive-specific provider app pair and
ARIADNE proves the deployed flow.

## Next Lane

Token exchange can now write encrypted connector credentials, but Station still
needs an owner-safe way to read connection state before moving into source
inventory.

MIMIR therefore opens:

```text
PR484H - Archive Connector Credential Readback
```

Next preflight:

`docs/roadmap/PR484H_ARCHIVE_CONNECTOR_CREDENTIAL_READBACK_PREFLIGHT_ARGUS.md`
