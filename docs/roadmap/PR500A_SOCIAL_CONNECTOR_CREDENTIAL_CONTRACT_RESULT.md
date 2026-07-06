# PR500A - Social Connector Credential Contract Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-07-06

Status: READY_FOR_ARGUS_REVIEW

## Result

```text
READY_FOR_ARGUS_REVIEW
```

DAEDALUS implemented the ARGUS-accepted social-specific encrypted credential
storage contract and quarantined the dormant live social posting code.

## Implementation

- Added `infra/supabase/migrations/072_social_connector_credentials.sql`.
- Added owner-scoped `social_connector_credentials`, separate from legacy social
  publishing tables.
- The new table is limited to Bluesky manual-credential storage for PR500A,
  stores only an AES-256-GCM encrypted credential envelope plus safe status
  metadata, and has owner RLS plus one-active-row uniqueness.
- Added DB type coverage for the new table.
- Added social-specific contract and storage helpers under
  `apps/api/src/services/social-connectors/`.
- Added the separate `SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` contract.
- Storage fails closed before any DB work when the key is missing or malformed.
- Safe readback contains provider, status, timestamp, and credential-category
  metadata only; it never returns raw encrypted payloads or secret material.
- Deleted dormant live provider posting code:
  `apps/api/src/services/social.service.ts`.
- Deleted dormant document-level live composer code:
  `apps/web/components/social/post-composer.tsx`.
- Hardened route/web tests proving `/social/*` remains PR476A paused and
  readback-only before social table writes or provider calls.

## Scope Boundary

No OAuth redirects, callback verification, token exchange, refresh, provider
account lookup, provider SDK/package/lockfile change, external provider call,
posting, cross-posting, scheduling, retry, delete, retract, edit, metrics,
queue, worker, webhook handling, Redis, Cloudflare, billing, Stripe, credential
UI, Settings social credential input, document composer, public syndication, or
social-readiness unpause was added.

PR500A does not migrate, decrypt, backfill, expose, or clean existing legacy
social credential rows.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/social-connectors/credential-contract.test.ts apps/api/src/services/social-connectors/credential-storage.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 22 focused social credential, social route, social UI, and auth tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts` | Pass | 88 archive connector guard tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| Scoped active-code source scan | Pass | No provider `fetch`, dispatch, legacy social table writes, OAuth redirect/token-exchange calls, queues/workers, billing, credential UI, or live composer references in active PR500A surfaces. |
| Package/lockfile scan | Pass | No `package.json`, package-specific manifest, or lockfile diff. |
| Deleted-helper source scan | Pass | No active non-test imports of deleted social service/composer helpers. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## ARGUS Review Focus

- Confirm the new schema is separate from legacy social publishing tables and
  stores no plaintext handles, provider ids, tokens, OAuth codes, callback
  values, webhook payloads, app passwords, or env values.
- Confirm helper readback is metadata-only and no storage helper is wired into
  active `/social` routes.
- Confirm the deleted live provider service and composer have no active
  non-test imports.
- Confirm Social Publishing remains paused/readback-only with no visible
  credential UI or posting behavior.

Wakeup:

```text
WAKEUP A3:
Codename: ARGUS
```
