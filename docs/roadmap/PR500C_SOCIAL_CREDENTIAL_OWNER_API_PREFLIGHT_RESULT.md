# PR500C - Social Credential Owner API Preflight Result

Owner: ARGUS / A3

Date: 2026-07-07

Status: Accepted

## Decision

ARGUS accepts the next lane as:

```text
ACCEPT_PR500C_SOCIAL_CREDENTIAL_OWNER_API
```

DAEDALUS may implement a backend-only, owner-authenticated social credential
API for Bluesky manual credentials using the PR500A encrypted storage helper
and the PR500B-proven hosted migration 072 schema.

This is not acceptance for OAuth, provider calls, posting, Settings UI,
readiness unpause, public syndication, queues, workers, billing, Cloudflare, or
partner adapters.

## Accepted Route Shape

Allowed routes live under the existing authenticated `/social` router:

```text
GET /social/connectors/credentials
POST /social/connectors/credentials
DELETE /social/connectors/credentials/:provider
```

The delete route is provider-scoped only. A credential-id delete route is not
accepted for this lane.

## GET Boundary

`GET /social/connectors/credentials` may return safe owner metadata derived
from the PR500A helper.

Allowed response fields:

- provider;
- purpose;
- credential category;
- status;
- created/updated/revoked timestamps if already safe and non-secret.

Forbidden response fields:

- internal row ids;
- owner ids;
- encrypted credential payloads;
- credential fingerprints;
- identifiers, handles, account ids, provider profile ids, or secret tails;
- app passwords, tokens, OAuth values, env values, SQL/table details, stack
  traces, private document text, or secret-shaped values.

The route must not read or write legacy `social_connections` or `social_posts`
for this behavior.

## POST Boundary

`POST /social/connectors/credentials` accepts exactly one provider and one
manual Bluesky credential shape:

```ts
{
  provider: "bluesky";
  credential: {
    identifier: string;
    appPassword: string;
  };
}
```

The implementation must trim and bound both strings before storage. It must
reject missing, empty, overlong, scalar, array, null, unsupported-provider, and
extra-field payloads before calling storage.

Only the `identifier` and `appPassword` values may enter the encrypted PR500A
credential payload. Neither value may be returned, logged, documented as a
fixture, echoed in errors, copied into plaintext metadata, or stored in legacy
social tables.

Create uses replacement semantics: a valid create revokes the owner's previous
active Bluesky posting credential and inserts a new active encrypted credential.
Do not add an active-duplicate error in this lane.

The response must be safe metadata only, following the GET boundary.

## DELETE Boundary

`DELETE /social/connectors/credentials/:provider` is local revoke/disconnect
only.

Accepted behavior:

- `provider` is limited to `bluesky`;
- request body is absent or an empty JSON object only;
- repeated deletes are idempotent;
- the route revokes the owner's active Bluesky posting credential if present;
- the response is safe metadata or a bounded no-op result.

Forbidden behavior:

- provider-side revoke;
- OAuth disconnect;
- token refresh;
- provider SDK/API call;
- credential-id path behavior;
- cross-owner lookup;
- legacy social table mutation.

## Required Errors

Use bounded errors and keep signed-out behavior aligned with existing auth
routes:

```text
social_connector_credential_invalid
social_connector_credential_encryption_required
social_connector_credential_unavailable
```

`social_connector_credential_invalid` covers invalid provider, invalid path,
invalid body shape, unsupported fields, missing credential fields, empty fields,
and overlong fields.

`social_connector_credential_encryption_required` covers missing or malformed
credential encryption configuration and must occur before any database write.

`social_connector_credential_unavailable` covers storage, list, replace, and
revoke failures that should not expose SQL, stack traces, env values, owner ids,
or secret-shaped details.

## Scope Guardrails

The accepted lane must not change:

- Settings Social UI or web credential forms;
- `/social/readiness` paused behavior;
- paused legacy social mutation routes;
- document pages;
- migrations, hosted schema, RLS, or package manifests;
- lockfiles;
- OAuth redirect/callback/token exchange/refresh/state logic;
- provider account lookup, profile lookup, validation, SDK usage, or any
  external social provider call;
- posting, scheduling, retry, delete, retract, edit, metric import, comment
  import, webhook, queue, worker, Redis, Cloudflare, Stripe, billing, public
  syndication, partner adapter, or hosted runtime behavior.

Implementation scope should stay limited to:

- `apps/api/src/routes/social.ts`;
- `apps/api/src/routes/social.test.ts`;
- focused PR500A social connector helper/tests only if a helper adjustment is
  truly required;
- existing readiness/auth/archive tests and docs needed to prove no drift.

## Required DAEDALUS Validation

DAEDALUS should run at least:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/social-connectors/credential-contract.test.ts apps/api/src/services/social-connectors/credential-storage.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Required test coverage:

- signed-out GET, POST, and DELETE are blocked by existing auth behavior;
- GET returns safe metadata only and does not touch legacy social tables;
- POST stores valid Bluesky credentials through encrypted PR500A storage and
  returns safe metadata only;
- POST replacement revokes the previous active credential before inserting the
  new active credential;
- POST rejects invalid body shapes, unsupported providers, extra fields,
  missing fields, empty fields, and overlong fields before storage;
- missing or malformed encryption key fails before any database write;
- storage/list/replace/revoke failures return bounded unavailable errors;
- DELETE is provider-scoped, Bluesky-only, idempotent, and local-only;
- no secret-shaped values appear in responses, logs, docs, fixtures, or UI;
- `/social/readiness`, Settings Social, document pages, and paused social routes
  remain paused/readback-only.

Required source scans:

- no provider `fetch`, provider SDK, OAuth/token exchange/refresh/state, account
  lookup, profile lookup, or external social API call;
- no legacy social secret table writes;
- no live composer or credential UI;
- no package or lockfile drift;
- no queue, worker, Redis, Cloudflare, billing, Stripe, public syndication, or
  partner adapter changes;
- no readiness-unpause claims.

## ARGUS Validation

ARGUS preflight validation passed before this verdict:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/social-connectors/credential-contract.test.ts apps/api/src/services/social-connectors/credential-storage.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Result:

- 110 focused social/auth/archive connector tests passed;
- typecheck passed from cache;
- whitespace check passed before docs edits.

Hosted API rehearsal is not required for this backend-only implementation lane
if DAEDALUS makes no UI, public behavior, hosted schema, readiness, or provider
runtime changes. MIMIR may require a small hosted API proof before any later
Settings UI or public credential-management lane; if so, it must use non-real
fixtures and clean up by local revoke.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR500C as a backend-only owner social credential API for
  Bluesky manual credential metadata, encrypted storage, replacement, and
  provider-scoped local revoke.
- Scope forbids OAuth, provider calls, posting, UI, queues, billing, package
  drift, legacy social tables, public syndication, hosted schema changes, and
  readiness unpause.
Task:
- Close PR500C and decide whether to wake DAEDALUS for the accepted API lane.
```
