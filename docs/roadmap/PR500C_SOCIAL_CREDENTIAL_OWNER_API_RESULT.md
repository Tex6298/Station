# PR500C - Social Credential Owner API Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-07-07

Status: Ready for ARGUS review

Result:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the backend-only owner social credential API accepted for
PR500C:

- `GET /social/connectors/credentials`
- `POST /social/connectors/credentials`
- `DELETE /social/connectors/credentials/:provider`

The implementation stays under the authenticated `/social` router and uses the
accepted PR500A encrypted social credential storage helper.

## Files Changed

- `apps/api/src/app.ts`
- `apps/api/src/routes/social.ts`
- `apps/api/src/routes/social.test.ts`
- `docs/roadmap/PR500C_SOCIAL_CREDENTIAL_OWNER_API_RESULT.md`
- `docs/roadmap/PR500C_SOCIAL_CREDENTIAL_OWNER_API_DAEDALUS.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Implementation

- Added safe owner credential metadata readback for Bluesky manual credentials.
- Added exact POST validation for:
  - provider `bluesky`;
  - credential object with only trimmed, bounded `identifier` and `appPassword`;
  - missing, empty, overlong, scalar, array, null, unsupported-provider, and
    extra-field rejection before storage.
- Added POST replacement semantics through the PR500A storage helper:
  existing active owner Bluesky posting credentials are revoked before the new
  active encrypted credential row is inserted.
- Added provider-scoped DELETE local revoke/disconnect behavior:
  - provider is Bluesky-only;
  - body must be absent or `{}`;
  - repeated deletes are idempotent;
  - only owner-scoped active credentials are revoked.
- Added a route-specific JSON parser for `/social/connectors/credentials` in
  `apps/api/src/app.ts` so scalar JSON reaches the bounded route validator and
  returns `social_connector_credential_invalid` instead of the shared generic
  JSON parser error.

## Error Contract

Only the accepted bounded route errors are returned by the new route logic:

```text
social_connector_credential_invalid
social_connector_credential_encryption_required
social_connector_credential_unavailable
```

Storage, list, replace, and revoke failures are mapped to
`social_connector_credential_unavailable` without SQL, stack, owner id, env, or
secret-shaped detail.

Missing or malformed social credential encryption config maps to
`social_connector_credential_encryption_required` before any database write.

## Boundaries Held

- No OAuth route, redirect, callback, token exchange, refresh, state, provider
  account lookup, profile lookup, SDK usage, or external provider call was
  added.
- No posting, scheduling, retry, queue, worker, webhook, Redis, Cloudflare,
  Stripe, billing, public syndication, partner adapter, or hosted schema change
  was added.
- Settings Social, document pages, public UI, and credential UI were not
  changed.
- `/social/readiness` remains paused/readback-only and still reports credential
  storage as not accepted for live publishing.
- Legacy `social_connections` and `social_posts` are not read or written by the
  new route.
- No package manifests or lockfiles changed.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/social-connectors/credential-contract.test.ts apps/api/src/services/social-connectors/credential-storage.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 29 focused social/auth/readiness tests passed, including full-app scalar JSON invalid-code coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts` | Pass | 88 archive connector guard tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| Implementation forbidden-path scan | Pass | No provider fetch/SDK, token exchange/refresh/state, account/profile lookup, legacy social tables, queues/workers, Redis, Cloudflare, Stripe, billing, Settings/document paths, or public syndication matches in the changed implementation surface. |
| `git diff --check` | Pass | Final pre-commit whitespace check. |
| `git diff --cached --check` | Pass | Final staged whitespace check. |

## ARGUS Review Focus

- Confirm owner scoping and metadata-only readback.
- Confirm POST stores only the accepted manual credential payload fields through
  PR500A encryption.
- Confirm DELETE is local-only and idempotent.
- Confirm the route-specific parser in `app.ts` is narrow enough for the scalar
  invalid-code requirement.
- Confirm readiness/UI/publishing behavior remains paused and unchanged.

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR500C owner social credential API under /social.
- GET returns safe metadata only, POST stores Bluesky manual credentials through PR500A encrypted replacement storage, and DELETE performs provider-scoped local revoke only.
- Added a route-specific parser so scalar credential JSON returns the bounded social invalid code.
Validation:
- Social/auth/readiness focused tests passed: 29 tests.
- Archive connector guard tests passed: 88 tests.
- Typecheck passed.
- Forbidden-path implementation scan passed.
Task:
- Review PR500C implementation for owner scoping, metadata safety, parser scope, and no provider/UI/publishing drift.
Status: READY_FOR_ARGUS_REVIEW
```
