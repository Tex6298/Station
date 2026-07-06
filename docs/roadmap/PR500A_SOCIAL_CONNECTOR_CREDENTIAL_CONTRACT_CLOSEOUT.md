# PR500A - Social Connector Credential Contract Closeout

Owner: MIMIR / A1

Date: 2026-07-06

Status: Closed

## Decision

MIMIR closes PR500A as accepted:

```text
ACCEPT_PR500A_SOCIAL_CONNECTOR_CREDENTIAL_CONTRACT_IMPLEMENTATION
```

ARGUS accepted the implementation in:

`docs/roadmap/PR500A_SOCIAL_CONNECTOR_CREDENTIAL_CONTRACT_REVIEW_RESULT.md`

## Accepted Product Truth

PR500A safely establishes the social-specific encrypted credential foundation
without enabling live social publishing:

- migration 072 adds `social_connector_credentials`, separate from legacy
  `social_connections` and `social_posts`;
- storage is owner-scoped, RLS-protected, one-active-row constrained, and
  limited to encrypted credential payload plus safe metadata;
- `SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` is a social-specific contract;
- AES-256-GCM envelopes use `station.social_connector.credential.v1`;
- ARGUS hardened credential fingerprinting to use HMAC keyed by the social
  credential encryption key;
- non-JSON credential payloads fail closed before encryption/fingerprinting;
- readback remains provider/status/timestamp/category metadata only;
- dormant live provider posting service and document-level social composer are
  removed;
- active `/social/*`, Settings Social, and document owner surfaces remain
  paused/readback-only.

## Boundaries Kept

No OAuth, callback, token exchange, refresh, provider account lookup, provider
SDK/package/lockfile change, external provider call, posting, scheduling,
retry, deletion, metric import, queue, worker, webhook, Redis, Cloudflare,
billing, Stripe, credential UI, public syndication, legacy social secret
migration/backfill/cleanup, or social-readiness unpause entered PR500A.

## Validation Accepted

- 22 focused social credential, route, UI, and auth tests passed.
- 88 archive connector guard tests passed.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- Scoped active-code, package/lockfile, and deleted-helper scans passed.
- `git diff --check` and `git diff --cached --check` passed.

## Next Lane

Open PR500B as a hostile preflight before exposing the new credential contract
through any owner route or UI:

`docs/roadmap/PR500B_SOCIAL_CREDENTIAL_OWNER_ROUTE_PREFLIGHT_ARGUS.md`

MIMIR's expected next product slice is an owner-only credential route/readback/
revoke contract for the Bluesky manual fixture, but ARGUS should decide whether
hosted migration 072 proof must happen first and should reject any OAuth,
provider call, posting, queue, billing, credential UI, or readiness-unpause
drift.
