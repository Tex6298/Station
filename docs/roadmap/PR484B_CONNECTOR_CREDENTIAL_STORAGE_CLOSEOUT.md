# PR484B - Connector Credential Storage Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Closed

## Decision

MIMIR closes PR484B as accepted.

The lane ran through:

- PR484B ARGUS preflight;
- PR484B DAEDALUS implementation;
- PR484B ARGUS review, including OAuth state privacy/readback hardening.

ARIADNE hosted rehearsal is not required because PR484B added no visible route,
UI, hosted API behavior, OAuth redirect/callback, provider call, or import
flow.

## Accepted Product Shape

PR484B creates storage primitives only:

- migration `062_archive_connector_credentials.sql`;
- owner-scoped encrypted archive connector credentials for `reddit` and
  `discord`;
- connector-specific `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`;
- AES-256-GCM payload schema `station.archive_connector.credential.v1`;
- safe metadata-only credential readback;
- separate OAuth state rows with hashed session, nonce, and csrf values;
- one-time OAuth state consume behavior;
- owner-only RLS and active credential uniqueness.

## Boundaries Kept

No live Reddit/Discord API calls, OAuth redirects/callback routes, token
exchange, token refresh/revocation execution, provider SDKs, configured test
credentials, source inventory pulls, recurring pulls, import writes, route/UI
behavior, public connector pages, cross-owner connector access, jobs, queues,
workers, Redis, Cloudflare, billing/Stripe, provider/model calls, package
dependencies, or hosted runtime behavior were added.

Safe readbacks exclude token material, token tails, encrypted payloads,
internal row ids, raw external account ids, raw session ids, callback codes,
cookies, provider payloads, private source bodies, SQL/table output, stack
traces, prompts, storage paths, signed URLs, hosted logs, and secret-shaped
values.

## Validation Accepted

- DAEDALUS implementation:
  `docs/roadmap/PR484B_CONNECTOR_CREDENTIAL_STORAGE_RESULT.md`.
- ARGUS review:
  `docs/roadmap/PR484B_CONNECTOR_CREDENTIAL_STORAGE_REVIEW_RESULT.md`.

Accepted validation included:

- connector credential storage tests;
- connector credential contract tests;
- no-write import preview tests;
- Reddit/Discord parser tests;
- social fail-closed route tests;
- social readiness source guard tests;
- AI settings tests;
- typecheck;
- whitespace validation;
- path-scope and sensitive/scope scans.

## Next Lane Rule Applied

PR484B removed the storage blocker, but live connectors are still not live.
MIMIR checked local env names and `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`
is not present locally.

MIMIR therefore continues the PR484 feature through a route/API preflight that
must respect the missing config and fail-closed boundary:

`docs/roadmap/PR484C_CONNECTOR_OAUTH_READINESS_ROUTE_PREFLIGHT_ARGUS.md`
