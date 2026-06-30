# PR484J-F - Archive Connector Import Confirmation Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Summary

DAEDALUS implemented the accepted owner-only archive connector import
confirmation boundary as an intent receipt only.

Implemented surface:

- `POST /archive-connectors/:provider/import-intents`;
- strict confirmation body with owner persona id plus safe source inventory
  `sourceKey`, `sourceFamily`, `sourceKind`, and `sourceLabel` echoes;
- owner persona check before credential decrypt, provider source inventory, or
  writes;
- source-ready credential and completed account-proof reuse from PR484J-E;
- source confirmation by re-running the accepted PR484J-E source inventory
  metadata read and matching exactly one available safe source row;
- dedicated `archive_connector_import_intents` table;
- idempotent pending intent readback for duplicate confirmation clicks;
- DB type surface for the new intent table;
- focused route/storage/provider/redaction/source-guard tests.

## Accepted Write

The only new write target is:

```text
public.archive_connector_import_intents
```

Stored fields are limited to owner id, persona id, provider, archive connector
purpose, safe source family/kind/key/label, pending/cancelled status, a
Station-generated idempotency fingerprint, and timestamps.

The route does not write existing `import_jobs`, archive source rows, Memory,
Canon, Continuity, public documents, review candidates, jobs, or queues.

## Preconditions

Import intent creation is eligible only when all of these are true:

- authenticated owner session is present;
- provider is `reddit` or `discord`;
- request body has exactly `personaId`, `sourceKey`, `sourceFamily`,
  `sourceKind`, and `sourceLabel`;
- `personaId` is an owner-owned persona and is checked first;
- exactly one active owner/provider archive connector credential is source
  inventory ready;
- completed provider account proof is present on the active credential row;
- the safe source echo matches exactly one available source row returned by the
  accepted source inventory metadata read.

Missing or wrong-owner personas return before credential decrypt, provider
fetch, or writes.

## Safe Response

Successful responses return:

- `status: "archive_connector_import_intent_created"` or
  `"archive_connector_import_intent_exists"`;
- provider, archive connector purpose, owner boundary, idempotency booleans,
  duplicate boolean, and created boolean;
- safe intent metadata: id, provider, persona id, safe source family/kind/key,
  safe source label, status, created timestamp, and updated timestamp;
- route-level safety booleans proving source body reads, archive source writes,
  existing import job writes, jobs, queues, public writes, raw provider id
  readback, provider payload/header readback, credential writes, credential
  metadata updates, token exchange, token refresh/revoke, and UI changes are
  disabled.

Responses do not include idempotency fingerprints, owner ids, raw provider ids,
raw cursors, source bodies, provider payloads, provider headers, tokens,
encrypted credentials, SQL/storage details, stack traces, environment values,
or secret-shaped values.

## Non-Scope

PR484J-F did not add:

- source body reads, source imports, crawling, pagination, recurring pulls, or
  provider source content reads;
- existing `import_jobs` writes or archive source writes;
- Memory, Canon, Continuity, public documents, or review candidates;
- jobs, queues, workers, Redis, Cloudflare, hosted/runtime work, packages,
  billing, marketplace, partner adapters, or social behavior;
- UI changes or frontend behavior.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 52 archive connector route tests passed, including import intent auth/body/persona/credential/source/duplicate/failure/source-guard coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 120 tests passed across connector storage/routes, import preview/parsers, background jobs, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

## ARGUS Review Request

Please review for:

- owner persona check ordering before credential/provider/write work;
- exact source-ready credential and account-proof enforcement;
- safe source echo matching against PR484J-E inventory metadata only;
- idempotent duplicate pending intent behavior;
- response redaction and disabled safety booleans;
- absence of existing import job writes, archive source writes, source body
  reads, jobs, queues, UI, hosted/runtime, packages, billing, Redis,
  Cloudflare, marketplace, partner adapter, and social drift.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR484J-F Archive Connector Import Confirmation.
- The lane adds only an owner-only import intent receipt route, dedicated intent table/types, strict source confirmation, duplicate pending intent readback, tests, and docs.
Risk:
- Review owner/persona ordering, source echo matching, idempotency behavior, and no-import/no-job boundaries.
Task:
- Review PR484J-F and wake MIMIR with acceptance or DAEDALUS with fixes.
```
