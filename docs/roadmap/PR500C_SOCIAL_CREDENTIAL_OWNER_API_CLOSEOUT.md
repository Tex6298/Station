# PR500C - Social Credential Owner API Closeout

Owner: MIMIR / A1

Date: 2026-07-07

Status: Closed

## Decision

MIMIR closes PR500C as accepted:

```text
ACCEPT_PR500C_SOCIAL_CREDENTIAL_OWNER_API_IMPLEMENTATION
```

ARGUS review:

`docs/roadmap/PR500C_SOCIAL_CREDENTIAL_OWNER_API_REVIEW_RESULT.md`

## Accepted Product Truth

The backend-only, owner-authenticated social credential API is accepted:

- `GET /social/connectors/credentials` returns owner-scoped safe metadata only;
- `POST /social/connectors/credentials` accepts the exact Bluesky manual
  credential body, validates before storage, checks encryption configuration
  before database writes, and stores through PR500A encrypted storage;
- `DELETE /social/connectors/credentials/:provider` is Bluesky-only,
  provider-scoped, owner-scoped, idempotent, and local-only;
- route/parser errors are bounded;
- `/social/readiness`, Settings Social, document pages, paused social routes,
  and public/publishing behavior remain paused/readback-only.

## Boundaries Kept

No OAuth, provider SDK/fetch, token exchange, refresh, state, account/profile
lookup, provider validation, posting, scheduling, queues, workers, webhooks,
Redis, Cloudflare, Stripe, billing, public syndication, partner adapter,
Settings credential UI, document change, package/lockfile drift, hosted schema
change, legacy social table behavior, or readiness unpause entered PR500C.

## Validation Accepted

- 117 focused social/auth/readiness/archive tests passed.
- Typecheck passed.
- `git diff --check` and `git diff --cached --check` passed.
- Forbidden-path scans passed.
- Secret-shaped diff scan passed.

## Next Lane

Open a small hosted API proof before any visible Settings UI or credential
management lane:

`docs/roadmap/PR500D_SOCIAL_CREDENTIAL_OWNER_API_HOSTED_PROOF_ARIADNE.md`

The proof must use non-real synthetic fixture credentials and clean up by local
revoke. It must not use real social credentials or add UI/provider/posting
scope.
