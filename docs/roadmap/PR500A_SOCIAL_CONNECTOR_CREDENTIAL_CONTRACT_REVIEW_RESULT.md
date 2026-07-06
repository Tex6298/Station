# PR500A - Social Connector Credential Contract ARGUS Review

Owner: ARGUS / A3

Date: 2026-07-06

Status: ACCEPTED

## Verdict

```text
ACCEPT_PR500A_SOCIAL_CONNECTOR_CREDENTIAL_CONTRACT_IMPLEMENTATION
```

ARGUS accepts PR500A with one narrow credential-hardening patch.

## ARGUS Patch

ARGUS changed the social connector credential fingerprint from an unkeyed
digest over secret material to an HMAC keyed by
`SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`.

ARGUS also made non-JSON-serializable credential material fail with the bounded
`social_connector_credential_payload_invalid` error before encryption or
fingerprinting, and added a source assertion covering HMAC usage.

## Review

- Migration 072 adds `social_connector_credentials`, separate from legacy
  `social_connections` and `social_posts`.
- The schema is owner-scoped with RLS, one active Bluesky manual-credential row
  per owner/provider/purpose, encrypted credential payload storage, safe status
  fields, and no plaintext handle/token/account/callback columns.
- Storage uses the social-specific
  `SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` contract and
  `station.social_connector.credential.v1` AES-256-GCM envelopes.
- Missing or malformed encryption config fails closed before DB work.
- Readback is provider/status/timestamp/category metadata only and does not
  include raw encrypted payloads, secret values, secret tails, provider account
  ids, callback values, handles, or env values.
- Active `/social/*` routes remain PR476A readback-only and paused; no route is
  wired to the new storage helper.
- Dormant live social provider posting service and dormant document-level
  composer were deleted, and no active non-test imports remain.
- Settings Social and document owner surfaces remain paused, with no credential
  inputs, Connect/OAuth/disconnect/save/post controls, or live composer.

## Scope Boundary

No OAuth redirect, callback verification, token exchange, refresh, provider
account lookup, provider SDK/package/lockfile change, external provider call,
posting, cross-posting, scheduling, retry, delete, retract, edit, metrics,
queue, worker, webhook, Redis, Cloudflare, billing, Stripe, credential UI,
public syndication, legacy social credential migration/backfill/cleanup, or
social-readiness unpause entered PR500A.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/social-connectors/credential-contract.test.ts apps/api/src/services/social-connectors/credential-storage.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 22 focused social credential, route, UI, and auth tests passed after the ARGUS patch. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts` | Pass | 88 archive connector guard tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| Scoped active-code source scan | Pass | No provider `fetch`, dispatch, legacy social table writes, OAuth redirect/token-exchange calls, queues/workers, billing, credential UI, or live composer references in active PR500A surfaces. |
| Package/lockfile scan | Pass | No `package.json`, package-specific manifest, or lockfile diff. |
| Deleted-helper source scan | Pass | Deleted social service and composer files are absent; remaining hits are test guardrails only. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Hosted Rehearsal

ARGUS does not require ARIADNE hosted proof for this backend/storage-only lane
because it does not expose a new route, visible Settings/document behavior,
OAuth/provider flow, package/runtime dependency, hosted config, or public
behavior.

MIMIR may require hosted migration proof before any future social connector
route depends on migration 072.

## Handoff

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
```

MIMIR should close PR500A or decide the next move. Do not broaden from this
accepted storage contract into OAuth, live posting, provider calls, queues,
billing, credential UI, public syndication, or hosted readiness claims.
