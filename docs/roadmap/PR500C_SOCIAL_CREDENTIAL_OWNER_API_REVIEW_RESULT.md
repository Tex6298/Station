# PR500C - Social Credential Owner API Review Result

Owner: ARGUS / A3

Date: 2026-07-07

Status: Accepted

## Decision

ARGUS accepts the PR500C implementation as:

```text
ACCEPT_PR500C_SOCIAL_CREDENTIAL_OWNER_API_IMPLEMENTATION
```

No ARGUS code patch was required.

## Review Scope

Reviewed implementation and handoff:

- `docs/roadmap/PR500C_SOCIAL_CREDENTIAL_OWNER_API_DAEDALUS.md`
- `docs/roadmap/PR500C_SOCIAL_CREDENTIAL_OWNER_API_RESULT.md`
- `apps/api/src/app.ts`
- `apps/api/src/routes/social.ts`
- `apps/api/src/routes/social.test.ts`
- PR500A credential contract/storage helpers used by the route.

## Findings

The implementation matches the accepted PR500C lane:

- `GET /social/connectors/credentials` returns owner-scoped safe metadata only.
- `POST /social/connectors/credentials` accepts only the Bluesky manual
  credential body accepted by ARGUS, trims and bounds fields, rejects invalid
  payloads before storage, checks encryption config before database writes, and
  stores through the PR500A encrypted storage helper.
- `DELETE /social/connectors/credentials/:provider` is Bluesky-only,
  provider-scoped, owner-scoped, idempotent, and local-only.
- The delete route does not accept credential ids.
- The route-specific JSON parser in `apps/api/src/app.ts` is narrowly mounted
  to `/social/connectors/credentials` so scalar JSON reaches the social route
  validator and returns `social_connector_credential_invalid`.

Owner boundaries are intact:

- the social router is still protected by `requireAuth`;
- storage read/list/revoke paths are scoped by `req.user.id`;
- tests prove another owner's active credential remains active after local
  revoke;
- no cross-owner row id or owner id is returned.

Metadata safety is intact:

- readback uses the PR500A metadata serializer;
- responses omit internal row ids, owner ids, encrypted payloads, credential
  fingerprints, identifiers, handles, provider account ids, tokens, app
  passwords, OAuth values, env values, SQL details, and stack traces;
- the route-level `providerLabel`, `configured`, `connectionStatus`, and safety
  booleans are accepted as non-secret metadata.

The implementation did not widen into forbidden scope:

- no OAuth redirect/callback/token exchange/refresh/state behavior;
- no provider SDK, provider fetch, account lookup, profile lookup, or provider
  validation call;
- no posting, scheduling, retry, queue, worker, webhook, Redis, Cloudflare,
  Stripe, billing, public syndication, partner adapter, or hosted schema
  change;
- no Settings Social credential UI, document page change, package drift,
  lockfile drift, migration drift, or legacy social table behavior;
- `/social/readiness` remains paused/readback-only for live publishing.

## Validation

ARGUS reran the requested validation:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/social-connectors/credential-contract.test.ts apps/api/src/services/social-connectors/credential-storage.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Result:

- 117 focused tests passed: 29 social/auth/readiness tests and 88 archive
  connector guard tests;
- typecheck passed;
- `git diff --check` passed;
- `git diff --cached --check` passed;
- disallowed path scan found no package/lockfile, web UI, Settings, document,
  migration, hosted schema, queue, worker, billing, Stripe, Cloudflare, or
  post-composer changes;
- implementation scan found no provider fetch/SDK, token exchange, refresh,
  state, account/profile lookup, provider token revocation, legacy social table
  use, posting dispatch, queue/worker, Redis, Cloudflare, Stripe, billing
  client, Settings, document, or readiness-unpause implementation;
- secret-shaped diff scan found no committed secret values.

## Residual Boundaries

This acceptance does not approve:

- hosted API rehearsal with real credentials;
- Settings Social credential UI;
- OAuth or provider account validation;
- external provider calls;
- live posting or public syndication;
- readiness unpause;
- migration/schema changes beyond already-proven migration 072.

MIMIR should decide the next lane.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR500C implementation as `ACCEPT_PR500C_SOCIAL_CREDENTIAL_OWNER_API_IMPLEMENTATION`.
- Owner scope, metadata safety, bounded parser/errors, encrypted storage usage,
  provider-scoped local revoke, and paused readiness/UI/publishing boundaries
  passed review.
- Validation passed: 117 focused tests, typecheck, diff checks, forbidden-path
  scans, and secret-shaped diff scan.
Task:
- Close PR500C and decide the next roadmap move.
```
