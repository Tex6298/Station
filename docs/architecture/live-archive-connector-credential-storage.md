# Live Archive Connector Credential Storage

Date: 2026-06-29

Status: PR484B encrypted storage foundation

## Purpose

Archive connector credentials use a dedicated encrypted store separate from AI
provider BYOK and paused social publishing. The accepted providers remain
`reddit` and `discord`, and the only accepted purpose is `archive_connector`.

PR484B creates storage primitives only. It does not add live provider calls,
OAuth routes, callback handling, token exchange, source inventory, recurring
pulls, import writes, route/UI behavior, or hosted connector behavior.

## Tables

`archive_connector_credentials` stores owner-scoped encrypted credential
metadata:

- owner id;
- provider constrained to `reddit` or `discord`;
- purpose constrained to `archive_connector`;
- status constrained to `active` or `revoked`;
- encrypted credential payload;
- deterministic non-secret credential fingerprint;
- optional hashed external account fingerprint;
- optional sanitized owner-local account label;
- created, updated, rotated, and revoked timestamps.

It has one active credential per owner/provider/purpose and owner-only RLS.

`archive_connector_oauth_states` stores one-time OAuth state records separately
from credentials:

- owner id;
- session hash;
- provider and purpose;
- nonce hash;
- csrf hash;
- optional local redirect path only;
- expiry and consumed timestamps.

It never stores callback codes, access tokens, refresh tokens, cookies, raw
provider payloads, raw session/nonce/csrf values, raw redirect URLs, or
credentials.

## Encryption

The API service uses `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`, not
`AI_PROVIDER_KEY_ENCRYPTION_KEY`.

Credential payloads use AES-256-GCM with schema:

```text
station.archive_connector.credential.v1
```

Missing or malformed encryption config fails closed before any existing active
credential is revoked. Replacement writes encrypt and fingerprint the new
credential before revoking an existing active row.

## Safe Readback

Safe readback may include:

- provider;
- purpose;
- active or revoked state;
- timestamps;
- sanitized account label;
- fingerprint presence;
- external account fingerprint presence.

Safe readback must not include encrypted payloads, ciphertext, auth tags,
tokens, token tails, OAuth codes, cookies, credentials, raw external account
ids, provider payloads, private source bodies, storage paths, signed URLs,
hosted logs, SQL/table details, stack traces, prompts, or secret-shaped values.

## OAuth State

OAuth state helpers create one-time state records with owner, session hash,
provider, purpose, nonce hash, csrf hash, and expiry. Consumption succeeds once
and fails closed on expiry, reuse, owner mismatch, session mismatch, provider
mismatch, purpose mismatch, or csrf mismatch.

PR484B does not implement redirect or callback route behavior.

## Non-Goals

PR484B does not add live Reddit API calls, Discord API calls, OAuth redirects,
OAuth callback routes, token exchange, token refresh, token revocation,
provider SDKs, configured test credentials, source inventory pulls, recurring
pulls, background jobs, workers, queues, scheduled jobs, Redis, Cloudflare,
runtime provisioning, automatic import into archive sources/import jobs/Memory/
Canon/Continuity/public documents/review candidates, route/UI behavior, public
connector pages, cross-owner connector access, admin impersonation,
provider/model calls, billing, Stripe, package dependencies, or hosted runtime
behavior.
