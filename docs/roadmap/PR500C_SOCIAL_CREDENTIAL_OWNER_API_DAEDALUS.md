# PR500C - Social Credential Owner API

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-07

Status: Implemented; ready for ARGUS review

## Source

ARGUS accepted this lane in:

`docs/roadmap/PR500C_SOCIAL_CREDENTIAL_OWNER_API_PREFLIGHT_RESULT.md`

Verdict:

```text
ACCEPT_PR500C_SOCIAL_CREDENTIAL_OWNER_API
```

## Task

Implement only the backend-only owner social credential API accepted by ARGUS.

Allowed routes under the existing authenticated `/social` router:

```text
GET /social/connectors/credentials
POST /social/connectors/credentials
DELETE /social/connectors/credentials/:provider
```

Do not add a credential-id delete route.

## GET Boundary

`GET /social/connectors/credentials` may return safe owner metadata only:

- provider;
- purpose;
- credential category;
- status;
- created/updated/revoked timestamps if already safe and non-secret.

Do not return internal row ids, owner ids, encrypted payloads, credential
fingerprints, identifiers, handles, account ids, provider profile ids, secret
tails, app passwords, tokens, OAuth values, env values, SQL/table details,
stack traces, private document text, or secret-shaped values.

Do not read or write legacy `social_connections` or `social_posts`.

## POST Boundary

`POST /social/connectors/credentials` accepts exactly:

```ts
{
  provider: "bluesky";
  credential: {
    identifier: string;
    appPassword: string;
  };
}
```

Requirements:

- trim and bound both strings before storage;
- reject missing, empty, overlong, scalar, array, null, unsupported-provider,
  and extra-field payloads before calling storage;
- only `identifier` and `appPassword` may enter the encrypted PR500A credential
  payload;
- neither value may be returned, logged, documented as a fixture, echoed in
  errors, copied into plaintext metadata, or stored in legacy social tables;
- create uses replacement semantics: valid create revokes the owner's previous
  active Bluesky posting credential and inserts a new active encrypted
  credential;
- do not add an active-duplicate error in this lane;
- response is safe metadata only.

## DELETE Boundary

`DELETE /social/connectors/credentials/:provider` is local revoke/disconnect
only.

Accepted behavior:

- `provider` is limited to `bluesky`;
- request body is absent or an empty JSON object only;
- repeated deletes are idempotent;
- route revokes the owner's active Bluesky posting credential if present;
- response is safe metadata or a bounded no-op result.

Forbidden behavior:

- provider-side revoke;
- OAuth disconnect;
- token refresh;
- provider SDK/API call;
- credential-id path behavior;
- cross-owner lookup;
- legacy social table mutation.

## Required Errors

Use bounded errors:

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

Do not change:

- Settings Social UI or web credential forms;
- `/social/readiness` paused behavior;
- paused legacy social mutation routes;
- document pages;
- migrations, hosted schema, RLS, or package manifests;
- lockfiles;
- OAuth redirect/callback/token exchange/refresh/state logic;
- provider account lookup, profile lookup, validation, SDK usage, or external
  social provider calls;
- posting, scheduling, retry, delete, retract, edit, metric import, comment
  import, webhook, queue, worker, Redis, Cloudflare, Stripe, billing, public
  syndication, partner adapter, or hosted runtime behavior.

Implementation scope should stay limited to:

- `apps/api/src/routes/social.ts`;
- `apps/api/src/routes/social.test.ts`;
- focused PR500A helper/tests only if a helper adjustment is truly required;
- existing readiness/auth/archive tests and docs needed to prove no drift.

## Required Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/social-connectors/credential-contract.test.ts apps/api/src/services/social-connectors/credential-storage.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Required coverage:

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

## Handoff

Wake ARGUS after implementation.

```text
WAKEUP A3:
Codename: ARGUS
```

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR500C as a backend-only owner social credential API.
- Hosted migration 072 is already proven ready.
- Scope is GET metadata, POST Bluesky manual credential replacement storage,
  and provider-scoped local DELETE revoke only.
Task:
- Implement docs/roadmap/PR500C_SOCIAL_CREDENTIAL_OWNER_API_DAEDALUS.md.
- Do not add OAuth, provider calls, posting, Settings UI, document changes,
  queues, billing, package drift, legacy social tables, public syndication,
  hosted schema changes, or readiness unpause.
- Wake ARGUS with the implementation result.
```
