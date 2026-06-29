# PR484B - Connector Credential Storage Preflight Result

Date: 2026-06-29

Owner: ARGUS / A3

Status: ACCEPT_PR484B_ENCRYPTED_CONNECTOR_CREDENTIAL_STORE

## Verdict

ARGUS accepts a bounded encrypted archive connector credential store for
PR484B.

DAEDALUS may implement migration, service, tests, and architecture/roadmap docs
only. The slice should create the durable owner-scoped storage and one-time
OAuth state primitives needed for a later Reddit/Discord OAuth route, but it
must not make connectors live.

ARGUS rejects reusing AI BYOK storage directly. AI BYOK is useful precedent for
AES-256-GCM mechanics and fail-closed tests, but archive connector credentials
need a separate purpose, schema, table boundary, and environment key.

## Current Repo Findings

- PR484A established the provider-neutral archive connector contract for
  `reddit` and `discord` only.
- Existing AI BYOK storage uses `AI_PROVIDER_KEY_ENCRYPTION_KEY` and
  `station.ai_provider.byok_key.v1`; that must remain AI-provider-specific.
- The PR440 review found an important rotation guard: encrypt and fingerprint
  replacement secret material before revoking the existing active row.
  PR484B must carry that guard forward.
- No accepted archive connector credential table, OAuth state table, token
  exchange path, callback route, provider SDK, hosted test credential policy,
  source inventory pull, or import write path exists today.
- The next Supabase migration number appears to be `062` after
  `061_public_seminar_interests.sql`, but DAEDALUS should use the next
  available migration number if main has moved.

## Accepted PR484B Scope

DAEDALUS may touch these files or close local equivalents:

- `infra/supabase/migrations/062_archive_connector_credentials.sql`
- `packages/db/src/types.ts`
- `apps/api/src/services/archive-connectors/credential-storage.ts`
- `apps/api/src/services/archive-connectors/credential-storage.test.ts`
- `docs/architecture/live-archive-connector-credential-storage.md`
- roadmap/status/validation docs

No route, web UI, provider SDK, package dependency, queue, worker, Redis,
Cloudflare, billing, provider/model, or import pipeline file should change in
PR484B unless ARGUS explicitly reopens this preflight.

## Migration Expectations

Add a dedicated owner-scoped encrypted credential table for archive connectors.
It should include:

- owner id;
- provider limited to `reddit` and `discord`;
- purpose fixed to `archive_connector`;
- status limited to active/revoked-style states needed for storage;
- encrypted credential payload;
- deterministic non-secret credential fingerprint;
- optional sanitized owner-local account label;
- optional hashed external account fingerprint, never a raw external account
  id;
- created, updated, rotated, and revoked timestamps;
- a unique active credential constraint per owner/provider/purpose;
- owner/provider/status indexes;
- RLS with owner-only read/write policies.

Do not store or return access-token last-four values. Token tails are still
token material for OAuth-style credentials and are not needed for the accepted
readback. Use a fingerprint and sanitized account label instead.

Add separate OAuth state storage. It should include owner/session/provider/
purpose binding, session hash, nonce hash, csrf hash, expiry, one-time consume
status, and timestamps. It must not store callback codes, access tokens,
refresh tokens, cookies, raw provider payloads, raw session/nonce/csrf values,
or raw redirect URLs. Any redirect path stored for later use must be a local
path only.

OAuth state storage should be separate from credential storage, either as a
separate table or a clearly separate service/table namespace. Credential rows
must not double as CSRF/state records.

## Service Expectations

Add an API service under `apps/api/src/services/archive-connectors/` that:

- uses `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`;
- uses AES-256-GCM with payload schema
  `station.archive_connector.credential.v1`;
- fails closed when encryption config is missing or malformed;
- encrypts and fingerprints replacement credential material before revoking any
  active existing row;
- never logs, serializes, returns, snapshots, or documents raw tokens, refresh
  tokens, OAuth codes, cookies, credentials, encrypted payloads, auth tags,
  ciphertext, provider payloads, raw external account ids, private messages,
  source bodies, prompts, stack traces, SQL/table output, storage paths, signed
  URLs, or secret-shaped values;
- returns only safe readback metadata such as provider, purpose, connected or
  revoked state, timestamps, sanitized label, and fingerprint-derived presence;
- revokes active credentials without exposing stored secret material;
- keeps archive connector purpose separate from social publishing and AI BYOK.

Add OAuth state helpers that:

- create one-time state records with owner/session/provider/purpose binding,
  session hash, nonce hash, csrf hash, and expiry;
- consume state exactly once;
- fail closed on expired, consumed, owner-mismatched, session-mismatched,
  provider-mismatched, or purpose-mismatched state;
- never store or return callback codes, tokens, cookies, raw session ids, raw
  nonce, raw csrf, or provider payloads;
- do not implement redirect or callback route behavior in PR484B.

## Config Assumptions

PR484B may add optional env parsing for
`ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` if the service needs it.

Marty will need to provide `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` before
any future route can write real connector credentials. PR484B itself should
prove missing config fails closed and preserves existing active credentials.

Do not add `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, Discord app credentials,
provider test credentials, hosted secrets, or social publishing config in this
lane.

## Explicit Non-Scope

PR484B must not add or change:

- live Reddit API calls, Discord API calls, OAuth redirects, OAuth callback
  routes, token exchange, token refresh, token revocation, provider SDKs, or
  configured test-credential execution;
- source inventory pulls, recurring pulls, background jobs, workers, queues,
  scheduled jobs, Redis, Cloudflare, runtime provisioning, or connector
  reliability claims;
- automatic import into archive sources, import jobs, Memory, Canon,
  Continuity, public documents, review candidates, or owner import review;
- route/UI behavior, public connector pages, cross-owner connector access,
  admin impersonation, provider/model calls, billing, Stripe, broad connector
  marketplace, package dependencies, or hosted runtime behavior;
- `apps/api/src/routes/import-preview.ts`, `apps/api/src/routes/social.ts`,
  `apps/api/src/services/social.service.ts`, or import write behavior.

## Required Tests

DAEDALUS should add focused tests proving:

- credential writes fail closed when
  `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` is missing or malformed;
- a failed replacement does not revoke the existing active credential;
- encrypted payloads do not contain access tokens, refresh tokens, raw account
  ids, callback codes, cookies, or secret-shaped fixtures;
- safe readback excludes encrypted payloads, ciphertext, auth tags, tokens,
  token tails, raw external account ids, callback codes, cookies, provider
  payloads, source bodies, storage paths, signed URLs, stack traces, SQL/table
  output, and prompts;
- owner/provider/purpose constraints prevent cross-owner or cross-purpose
  credential use;
- revoke flows return safe metadata only;
- OAuth state creation stores only hashes and metadata;
- OAuth state consume is one-time and fails closed on expiry, owner/session/
  provider/purpose mismatch, or reuse;
- source-level guards show no `fetch(`, OAuth redirect route, callback route,
  token exchange, provider SDK, import job, archive source, Memory, Canon,
  Continuity, document write, queue, worker, Redis, Cloudflare, billing,
  Stripe, or provider/model scope.

Required validation before waking ARGUS:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- run test:ai-settings
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a path/scope scan confirming PR484B did not introduce routes, UI,
provider SDKs, package dependencies, live provider calls, token exchange,
source inventory pulls, import writes, jobs, queues, Redis, Cloudflare,
billing/Stripe, provider/model calls, hosted runtime behavior, public connector
pages, or secret/credential readback.

## ARIADNE Requirement

ARIADNE hosted rehearsal is not required if PR484B remains migration, service,
tests, and docs only with no visible route, UI, or hosted API behavior.

If DAEDALUS adds any route, callback, owner-visible readback, UI, hosted config
behavior, or live connector behavior despite this preflight, ARGUS should reject
the scope or require a separate ARIADNE hosted owner-only desktop and 390px
mobile proof.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:ai-settings` | Pass | 12 tests passed; current AI BYOK storage precedent remains green and separate. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 15 tests passed across the existing connector contract, no-write import preview, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from cache. |
| `git diff --check` | Pass | No whitespace errors before the docs patch. |
| Scope scan | Pass | Matches were expected guardrail/config terms or existing AI BYOK/migration precedent; no live archive connector implementation exists today. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
```
