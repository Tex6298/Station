# PR500C - Social Credential Owner API Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open hostile preflight

## Background

PR500A established the encrypted social credential storage contract.

PR500B proved hosted migration 072 is now present and ready:

`docs/roadmap/PR500B_SOCIAL_CREDENTIAL_HOSTED_MIGRATION_072_PROOF_CLOSEOUT.md`

The next product step can now be reconsidered: an owner-only backend API for
manual social credentials. This route is not accepted yet.

## Product Question

May DAEDALUS implement a backend-only owner social credential API using the
PR500A helper and hosted migration 072?

Candidate outcome:

```text
ACCEPT_PR500C_SOCIAL_CREDENTIAL_OWNER_API
```

Expected narrow shape:

- `GET /social/connectors/credentials` returns safe metadata rows only.
- `POST /social/connectors/credentials` stores one Bluesky manual credential
  using the PR500A encrypted storage helper.
- `DELETE /social/connectors/credentials/:credentialId` or provider-scoped
  local revoke marks the owner credential revoked without provider calls.
- Existing `/social/readiness`, paused social mutation routes, Settings Social,
  and document pages remain paused/readback-only.

Other outcomes:

```text
BLOCK_PR500C_WITH_CONCRETE_REASON
REJECT_PR500C_SOCIAL_CREDENTIAL_OWNER_API
```

Name the exact blocker or rejection reason.

## Questions For ARGUS

1. Should the route use credential id delete, provider-scoped revoke, or both?
2. Should create replace an existing active credential by revoking the old row,
   or fail with a bounded active-credential-exists error?
3. What exact Bluesky manual credential fields may be accepted in the request
   body without storing or returning handles/account ids in plaintext?
4. What safe metadata may list/readback return?
5. What bounded error codes are required for missing config, invalid provider,
   invalid payload, active duplicate, not found, cross-owner, storage failure,
   and signed-out requests?
6. Is hosted proof after implementation required, or is local/API review enough
   if no UI/public behavior changes?

## Guardrails

- Backend API only; no Settings Social credential UI in this lane.
- Bluesky manual credential fixture only unless ARGUS explicitly accepts a
  broader pure enum with disabled providers.
- No OAuth redirect, callback, token exchange, refresh, state, account lookup,
  provider profile call, provider SDK, or external provider call.
- No posting, cross-posting, scheduling, retry, delete, retract, edit, metric
  import, comment import, queue, worker, webhook, Redis, Cloudflare, billing,
  Stripe, public syndication, or readiness-unpause behavior.
- No use of legacy `social_connections` or `social_posts` for new credential
  behavior.
- No migration/backfill/decrypt/cleanup of existing legacy social secret rows.
- No plaintext response of handles, provider ids, tokens, app passwords, OAuth
  codes, callback query values, webhook payloads, env values, encrypted
  payloads, owner ids, SQL/table details, stack traces, private document text,
  or secret-shaped values.

## Suggested Validation

If accepted, require DAEDALUS to run at least:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/social-connectors/credential-contract.test.ts apps/api/src/services/social-connectors/credential-storage.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also require source scans for no provider calls, no OAuth/token exchange, no
legacy social secret table writes, no live composer, no credential UI, no
package/lockfile drift, and no readiness-unpause claims.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR500B hosted migration 072 proof passed after DAEDALUS applied the accepted
  migration.
- Hosted schema is now ready for the next social credential boundary decision.
- MIMIR is asking for hostile preflight of a backend-only owner credential API,
  not OAuth, provider calls, posting, UI, or readiness unpause.
Task:
- Run docs/roadmap/PR500C_SOCIAL_CREDENTIAL_OWNER_API_PREFLIGHT_ARGUS.md.
- Decide ACCEPT_PR500C_SOCIAL_CREDENTIAL_OWNER_API, BLOCK, or REJECT.
- Wake MIMIR with exact accepted scope and next owner.
```
