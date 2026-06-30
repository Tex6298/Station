# PR484J-F - Archive Connector Import Confirmation Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484J_F_IMPORT_CONFIRMATION_PREFLIGHT
```

ARGUS accepts a narrow owner-confirmed archive connector import intent lane.
This is an intent receipt only. It must not create existing `import_jobs`, must
not execute provider crawls, must not read source bodies, and must not surface
new UI or hosted/runtime behavior.

## Accepted Route Shape

Add one authenticated route:

```text
POST /archive-connectors/:provider/import-intents
```

The route must:

- require `requireAuth` and use only `req.user.id` as the owner boundary;
- accept only existing archive connector providers;
- parse a strict JSON body and reject unknown keys;
- validate the target persona belongs to the owner before credential decrypt,
  provider fetch, or writes;
- create or return a pending archive connector import intent receipt only;
- perform no source body read, import execution, existing `import_jobs` write,
  archive source write, Memory/Canon/Continuity/public document/review
  candidate write, queue enqueue, worker execution, UI mutation, package,
  billing, Redis, Cloudflare, marketplace, partner adapter, or social behavior.

## Request Body

Accepted body:

```ts
{
  personaId: string;      // owner-owned UUID
  sourceKey: string;      // exact 24-char lowercase hex source inventory key
  sourceFamily: "reddit_subreddit_memberships" | "reddit_user_history" | "discord_guilds";
  sourceKind: string;     // bounded source kind echoed from source inventory
  sourceLabel: string;    // bounded visible label echoed from source inventory
}
```

Rules:

- `personaId` is required and must reference an owner-owned persona.
- `sourceKey` is required and must match `/^[a-f0-9]{24}$/`.
- `sourceFamily`, `sourceKind`, and `sourceLabel` are required confirmation
  echoes; the server must not trust them as source of truth.
- `sourceKind` and `sourceLabel` must be bounded, whitespace-normalized,
  control-character-free, and secret-shaped-value-safe.
- Unknown body keys, raw provider ids, provider URLs, raw cursors, token values,
  OAuth codes, cookies, storage paths, SQL identifiers, and source body fields
  are rejected before provider fetch or writes.

## Source-Key Validation

The route must revalidate the selected source through accepted source inventory
metadata before writing an intent:

- load the same source-ready credential and account-proof prerequisite accepted
  in PR484J-E;
- re-run only the PR484J-E accepted source inventory provider read for the
  requested provider;
- find exactly one available source row whose `sourceKey`, `sourceFamily`,
  `sourceKind`, and sanitized `sourceLabel` match the request body;
- reject stale, tampered, unsupported, deferred, duplicated, or unavailable
  source keys before writes.

This validation may call:

- Reddit:
  `GET https://oauth.reddit.com/subreddits/mine/subscriber?limit=100&raw_json=1`
- Discord:
  `GET https://discord.com/api/v10/users/@me/guilds?limit=200&with_counts=false`

It must not call Reddit history content/listing endpoints. Reddit history
confirmation remains limited to Station-derived category rows from PR484J-E.

It must not call Discord channels, messages, DMs, members, connections, bots,
webhooks, installs, invites, local RPC, or permission-expansion endpoints.

## Accepted Write Shape

Add a dedicated owner-scoped table rather than overloading existing import
tables:

```text
archive_connector_import_intents
```

Required columns:

- `id uuid primary key default gen_random_uuid()`;
- `owner_user_id uuid not null references profiles(id) on delete cascade`;
- `persona_id uuid not null references personas(id) on delete cascade`;
- `provider text not null check (provider in ('reddit', 'discord'))`;
- `purpose text not null default 'archive_connector' check (purpose = 'archive_connector')`;
- `source_family text not null`;
- `source_kind text not null`;
- `source_key text not null`;
- `source_label text not null`;
- `status text not null default 'pending' check (status in ('pending', 'cancelled'))`;
- `idempotency_fingerprint text not null`;
- `created_at timestamptz not null default now()`;
- `updated_at timestamptz not null default now()`.

Required indexes and policies:

- unique owner/provider/persona/source pending-intent guard, implemented as
  either a unique `idempotency_fingerprint` or a partial unique index on
  `(owner_user_id, provider, persona_id, source_key)` where `status = 'pending'`;
- owner/provider/status lookup index;
- updated-at trigger;
- RLS enabled with owner-only all policy.

Forbidden columns and stored values:

- raw provider ids, subreddit names as keys, Reddit fullnames, Discord
  snowflakes, raw cursors, provider payloads, provider headers, source bodies,
  URLs/permalinks, icons, permissions, counts, tokens, encrypted credentials,
  raw OAuth scopes, OAuth codes, client secrets, cookies, storage paths, SQL
  error details, stack traces, environment values, prompts, and secret-shaped
  values.

Update `packages/db/src/types.ts` for this table. Do not add UI reads or broad
archive/global search reads for the new table in this lane.

## Idempotency

Duplicate clicks must be safe:

- a repeated confirmation for the same owner/provider/persona/source key while
  a pending intent exists must return the existing pending intent with
  `idempotent: true` and `duplicate: true`;
- a first confirmation returns a new pending intent with `idempotent: true` and
  `duplicate: false`;
- idempotency must be owner-scoped and persona-scoped;
- mismatched `sourceFamily`, `sourceKind`, or `sourceLabel` must fail as stale
  or tampered before reusing an existing row;
- storage race conflicts on the unique guard must re-read and return the
  existing safe row rather than creating a duplicate.

## Safe Response Contract

Successful responses may include:

- `status: "archive_connector_import_intent_created"` or
  `status: "archive_connector_import_intent_exists"`;
- `provider`;
- `purpose: "archive_connector"`;
- `ownerOnly: true`;
- `importIntentCreated: boolean`;
- `idempotent: true`;
- `duplicate: boolean`;
- route-level safety booleans proving source body reads, imports, existing
  `import_jobs`, archive source writes, jobs, queues, public writes, UI,
  provider payload readback, provider header readback, raw id readback, token
  refresh, token revoke, account lookup, and credential metadata updates are
  disabled;
- `intent` with only:
  - id;
  - provider;
  - personaId;
  - sourceFamily;
  - sourceKind;
  - sourceKey;
  - sourceLabel;
  - status;
  - createdAt;
  - updatedAt.

Do not return raw owner ids, raw provider ids, credential fingerprints,
external account fingerprints, database table names, SQL details, stack traces,
tokens, provider payloads, provider headers, source bodies, content previews,
or secret-shaped values.

## Failure Modes

| Condition | Expected response |
| --- | --- |
| Unauthenticated | Existing auth failure, no storage/provider work. |
| Unsupported provider | `400`, provider-not-supported, before body-side effects, credential load, provider fetch, or writes. |
| Invalid body or unknown keys | `400`, invalid-request, no provider fetch or writes. |
| Persona missing or not owner-owned | `404`, persona-not-found style status, no credential decrypt, provider fetch, or writes. |
| Missing/revoked/connect-proof/source-mismatched credential | `409`, credential-required/reconnect-required style status, no writes. |
| Missing account proof | `409`, account-lookup-required style status, no writes. |
| Encryption missing/malformed or token invalid | `409`, encryption/credential-invalid style status, no writes. |
| Provider `401` or `403` during inventory revalidation | `409`, reconnect-required, no writes. |
| Provider `429` | `429`, rate-limited, no provider headers returned, no writes. |
| Provider timeout/network/`5xx` | `502`, provider-failed, no writes. |
| Provider payload invalid | `502`, provider-response-invalid, no writes. |
| Source key stale/tampered/deferred/unsupported/unavailable | `409`, source-unavailable or stale-source status, no writes. |
| Intent insert/select failure | `500`, import-intent-write/read failure with sanitized response. |
| Unique conflict after duplicate click | `200`, existing safe pending intent, `duplicate: true`, no second row. |

All failures must preserve `provider`, `purpose`, `ownerOnly`, and safety
booleans where route-level handling has enough context. They must not expose raw
provider payloads, provider headers, tokens, SQL/storage internals, stack
traces, source bodies, or secret-shaped values.

## Required Tests

DAEDALUS must add focused tests proving:

- unauthenticated requests and unsupported providers do not touch storage or
  provider fetch;
- strict body parsing rejects unknown keys, raw ids, URLs, cursors, and
  secret-shaped/source-body fields before provider fetch or writes;
- wrong-owner/missing persona fails before credential decrypt/provider fetch;
- connect-proof, missing account proof, encryption, and token failures do not
  fetch source inventory or write intents;
- source key validation re-runs only the accepted PR484J-E inventory endpoint
  for the provider;
- stale/tampered source keys and family/kind/label mismatches do not write;
- Reddit history category confirmation does not call any Reddit history
  content/listing endpoint;
- duplicate confirmation returns the existing pending intent with
  `duplicate: true` and does not insert a second row;
- response readback includes only safe intent fields and safety booleans;
- no existing `import_jobs`, archive source, Memory, Canon, Continuity, public
  document, review candidate, queue, worker, UI, hosted/runtime, package,
  billing, Redis, Cloudflare, marketplace, partner adapter, or social behavior
  is added;
- migration/types tests or source scans prove the new table is owner-scoped,
  RLS-protected, and does not store forbidden raw provider/source/secret data.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Current code review | Pass | PR484J-E has safe source inventory metadata and opaque keys only. No import intent route/table exists yet. |
| Existing import job schema check | Pass | Existing `import_jobs` is file/chat-shaped and UI/readback-visible, so PR484J-F must not overload it for connector intents. |
| Source-key contract check | Pass | Current source keys are opaque and non-reversible by readback; confirmation must re-run accepted inventory metadata and persist only safe intent fields. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 112 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

## Out Of Scope

- existing `import_jobs` writes;
- archive source rows;
- source body/content reads;
- provider crawls beyond PR484J-E source inventory revalidation;
- pagination crawl;
- recurring pulls;
- Memory, Canon, Continuity, public document, review candidate, queue, or
  worker execution;
- broad UI or global archive/search/readback changes for connector intents;
- hosted proof;
- packages, billing, Redis, Cloudflare, marketplace, partner adapters, or
  social behavior.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484J-F Archive Connector Import Confirmation preflight as an intent-receipt-only lane.
Task:
- Implement only the owner-only import intent boundary: strict POST `/archive-connectors/:provider/import-intents`, owner persona check, source-ready/account-proof checks, accepted source inventory revalidation, dedicated `archive_connector_import_intents` table/types, idempotent pending intent create/readback, safe response fields, and focused tests.
- Do not write existing `import_jobs`, archive sources, Memory, Canon, Continuity, public documents, review candidates, queues, workers, UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, source bodies, provider crawls beyond inventory revalidation, or raw provider/source/secret data.
```
