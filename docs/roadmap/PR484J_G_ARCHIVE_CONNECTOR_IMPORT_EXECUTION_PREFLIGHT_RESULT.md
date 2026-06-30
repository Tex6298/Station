# PR484J-G - Archive Connector Import Execution / Activation Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS as activation receipt only

## Verdict

```text
ACCEPT_PR484J_G_ACTIVATION_RECEIPT_PREFLIGHT
```

ARGUS accepts only the smallest safe lane: archive connector import intent
activation receipts.

This is not import execution. It must not read provider source bodies, create
archive source rows, write existing `import_jobs`, create a new connector job
table, enqueue jobs, run workers, or write Memory, Canon, Continuity, public
documents, or review candidates.

## Accepted Boundary

DAEDALUS may implement only:

- authenticated owner-only route:
  `POST /archive-connectors/import-intents/:intentId/activate`;
- strict empty body only; malformed JSON, arrays, primitives, unknown keys, and
  secret-shaped values fail before storage, credential, provider, or write work;
- UUID path validation before storage work;
- load the intent only from `archive_connector_import_intents` by `id`,
  `owner_user_id`, and `purpose = 'archive_connector'`;
- only pending intents may be activated;
- already activated intents return the existing safe activation readback
  idempotently;
- cancelled, missing, wrong-owner, wrong-purpose, or otherwise stale intents
  fail without credential decrypt, provider fetch, or writes;
- before first activation, re-check the intent persona is still owner-owned;
- require source-ready credential and completed account proof before activation;
- re-run only the accepted PR484J-E source inventory metadata read and match
  exactly one available safe source row against the stored provider, source
  family, source kind, source key, and source label;
- update only `archive_connector_import_intents` to record activation status and
  timestamp metadata;
- add the minimum migration/type support for an activated status and timestamp,
  such as `status = 'activated'` and `activated_at timestamptz`;
- return only safe intent activation metadata and route-level safety booleans.

## Required Response Shape

Successful first activation should return a bounded JSON envelope with:

- `status: "archive_connector_import_intent_activated"`;
- `provider`, `purpose: "archive_connector"`, and `ownerOnly: true`;
- `idempotent: true`;
- `duplicate: false`;
- `activated: true`;
- a safe `intent` object with id, provider, purpose, personaId, sourceFamily,
  sourceKind, sourceKey, sourceLabel, status, createdAt, updatedAt, and
  activatedAt.

Duplicate activation of an already activated intent should return `200` with:

- `status: "archive_connector_import_intent_already_activated"`;
- `idempotent: true`;
- `duplicate: true`;
- `activated: false`;
- the same safe `intent` readback.

Responses must not include owner ids, idempotency fingerprints, raw provider
ids, raw cursors, source bodies, provider payloads, provider headers, tokens,
encrypted credentials, raw OAuth scopes, storage paths, SQL details, stack
traces, or secret-shaped values.

## Required Failure Modes

| Case | Required behavior |
| --- | --- |
| Missing auth | `401`; no storage, credential, provider, or write work. |
| Invalid intent id or body | `400`; no storage, credential, provider, or write work. |
| Missing or wrong-owner intent | `404`; no credential decrypt, provider fetch, or writes. |
| Cancelled or stale non-pending intent | `409`; no credential decrypt, provider fetch, or writes. |
| Already activated intent | `200`; existing safe row, duplicate true, no provider fetch or write. |
| Persona missing or not owner-owned | `404`; no credential decrypt, provider fetch, or writes. |
| Missing/revoked/connect-proof/source-mismatched credential | `409`; no activation write. |
| Missing account proof | `409`; no activation write. |
| Encryption missing/malformed or token invalid | `409`; no activation write. |
| Source inventory reconnect/rate-limit/provider failure | bounded `409`/`429`/`502`; no activation write. |
| Source no longer exactly available | `409`; no activation write. |
| Race conflict after duplicate click | reload and return the existing activated safe row when present. |
| Storage load/update failure | bounded `500`; no raw DB or secret details. |

## Explicitly Forbidden

This lane must not add:

- provider source body/content reads;
- Reddit history content endpoints, Reddit `read` expansion, Reddit pagination
  crawls, or Discord channel/message/member/DM/bot/webhook/install reads;
- existing `import_jobs` writes;
- a new connector job table;
- archive source rows or `persona_files`;
- Memory, Canon, Continuity, public document, or review candidate writes;
- queue enqueue, worker execution, recurring pulls, Redis, Cloudflare, hosted
  runtime work, packages, billing, marketplace, partner adapters, social
  behavior, or UI.

## Required Tests

DAEDALUS should add focused tests proving:

- auth, UUID path, and strict empty-body failures happen before storage work;
- missing/wrong-owner intents fail before credential/provider/write work;
- cancelled/stale intents fail before credential/provider/write work;
- already activated intents are idempotent and do not re-fetch provider
  inventory;
- persona ownership is rechecked before credential decrypt/provider fetch/write;
- source-ready credential and account-proof gates run before activation write;
- activation revalidates the stored source by accepted source inventory metadata
  only;
- stale or unavailable source metadata blocks activation without writes;
- first activation updates only `archive_connector_import_intents`;
- duplicate/race activation returns the existing safe row;
- responses and rows do not leak raw ids, fingerprints, tokens, provider
  payloads, source bodies, storage paths, SQL, stack traces, or secret-shaped
  values;
- static source guards prove no `import_jobs`, archive source, Memory, Canon,
  Continuity, public document, review candidate, queue, worker, UI,
  hosted/runtime, package, billing, Redis, Cloudflare, marketplace, partner
  adapter, or social drift.

Suggested validation command:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Current code review | Pass | Existing `import_jobs` is file/chat-shaped, visible in archive/background-job readbacks, and unsuitable for connector activation in this lane. |
| Current intent table review | Pass | `archive_connector_import_intents` is the right dedicated owner-scoped receipt surface to extend for activation metadata only. |
| Source-boundary review | Pass | Accepted source inventory reads remain metadata-only and do not expose source bodies or raw provider ids. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 120 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484J-G only as an activation-receipt lane.
- Do not implement source-body reads, existing import_jobs writes, archive source rows, connector job tables, queues/workers, or actual import execution.
Task:
- Implement `POST /archive-connectors/import-intents/:intentId/activate` as an owner-only pending-intent activation receipt.
- Re-check persona ownership, source-ready credential/account proof, and accepted PR484J-E source inventory metadata before the first activation write.
- Update only `archive_connector_import_intents` with activated status/timestamp metadata and safe readback/tests.
```
