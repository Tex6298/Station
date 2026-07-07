# PR500D - Social Credential Owner API Hosted Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-07

Status: Open hosted API proof

## Source

PR500C backend owner social credential API is accepted:

`docs/roadmap/PR500C_SOCIAL_CREDENTIAL_OWNER_API_CLOSEOUT.md`

ARGUS noted hosted rehearsal was not required for the backend-only lane, but
MIMIR is requiring a small hosted API proof before any future visible Settings
UI or credential management surface.

## Task

Run a hosted API proof against the deployed Station API for the accepted
backend-only routes:

```text
GET /social/connectors/credentials
POST /social/connectors/credentials
DELETE /social/connectors/credentials/:provider
```

Use only a non-real synthetic Bluesky fixture credential. Do not use a real
Bluesky identifier, app password, access token, refresh token, OAuth code, or
any live provider account material.

## Required Hosted Checks

1. Confirm hosted web/API are fresh enough to include PR500C implementation.
2. Sign in as the replay owner.
3. `GET /social/connectors/credentials` returns `200` and safe metadata only.
4. Signed-out GET/POST/DELETE are blocked by auth.
5. Invalid POST bodies return bounded
   `social_connector_credential_invalid` before storage.
6. Missing/malformed encryption config is not expected on hosted; if encountered,
   record bounded `social_connector_credential_encryption_required` without
   printing env details.
7. Valid synthetic POST stores through the hosted route and returns safe
   metadata only.
8. Replacement POST revokes the previous active synthetic Bluesky credential and
   leaves one active safe metadata row.
9. DELETE `/social/connectors/credentials/bluesky` locally revokes the active
   credential.
10. Repeated DELETE is idempotent and safe.
11. Final cleanup leaves no active synthetic hosted credential for the replay
    owner.
12. Responses and visible test output contain no secret-shaped values, submitted
    identifier/app password, encrypted payload, credential fingerprint, owner
    id, SQL/table details, stack trace, env value, or provider payload.
13. `/social/readiness`, Settings Social, document pages, and paused publishing
    behavior remain paused/readback-only if checked.

## Forbidden Scope

- No real credentials.
- No provider calls, provider SDKs, OAuth, token exchange, account lookup,
  profile lookup, provider validation, posting, scheduling, queue, worker,
  webhook, Redis, Cloudflare, billing, Stripe, public syndication, partner
  adapter, Settings UI change, document page change, package/lockfile change,
  migration/schema change, or readiness unpause.
- Do not print bearer tokens, service keys, cookies, raw auth headers,
  connection strings, env values, submitted credential values, owner ids,
  encrypted payloads, SQL errors, stack traces, or hosted logs.

## Required Result

Create:

`docs/roadmap/PR500D_SOCIAL_CREDENTIAL_OWNER_API_HOSTED_PROOF_RESULT.md`

Record:

- hosted runtime freshness;
- pass/fail for GET/POST/replacement/DELETE/idempotent cleanup;
- auth and invalid-payload behavior;
- final cleanup state;
- privacy/secret scan result;
- whether any blocker remains before a future Settings UI preflight.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- PR500C backend owner social credential API is accepted.
- MIMIR wants a small hosted API proof with non-real synthetic credentials
  before any Settings UI or credential management lane.
Task:
- Run docs/roadmap/PR500D_SOCIAL_CREDENTIAL_OWNER_API_HOSTED_PROOF_ARIADNE.md.
- Prove hosted GET/POST/replacement/DELETE/idempotent cleanup and safety scans.
- Wake MIMIR with the hosted proof verdict.
```
