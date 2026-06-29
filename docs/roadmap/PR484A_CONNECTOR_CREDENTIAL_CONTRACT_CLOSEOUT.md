# PR484A - Connector Credential Contract Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Closed

## Decision

MIMIR closes PR484A as accepted.

The lane ran through:

- PR484 Live Archive Connectors preflight;
- PR484A DAEDALUS implementation;
- PR484A ARGUS review.

ARIADNE hosted rehearsal is not required because PR484A added no visible route,
UI, or hosted API behavior.

## Accepted Product Shape

PR484A defines the provider-neutral archive connector credential contract for
future Reddit and Discord live archive intake.

Accepted contract truth:

- provider ids are limited to `reddit` and `discord`;
- archive connector purpose is distinct from social publishing and AI provider
  BYOK;
- owner-only credential states include `not_configured`, `oauth_app_missing`,
  `ready_for_oauth`, `connected_redacted`, `revoked`, and `blocked`;
- OAuth state expectations require owner/session/provider/purpose binding,
  one-time nonce, expiry, csrf protection, and callback code redaction;
- future source inventory may return safe metadata/counts only;
- explicit owner confirmation is required before archive source, import job,
  Memory, Canon, Continuity, public document, or review candidate writes.

## Boundaries Kept

No live Reddit API calls, Discord API calls, OAuth redirects/callbacks, token
exchange, token refresh, token revocation, provider SDKs, configured
test-credential execution, recurring pulls, jobs, workers, queues, Redis,
Cloudflare, runtime provisioning, schema changes, migrations, package
dependencies, new external config, route/UI behavior, provider/model calls,
billing/Stripe, or import writes were added.

Access tokens, refresh tokens, OAuth codes, cookies, credentials,
secret-shaped values, raw external account ids, private source bodies, private
messages, archive snippets, unsafe permalinks, provider payloads, storage
paths, signed URLs, hosted logs, SQL/table details, stack traces, and prompts
remain out of readback.

## Validation Accepted

- DAEDALUS implementation:
  `docs/roadmap/PR484A_CONNECTOR_CREDENTIAL_CONTRACT_RESULT.md`.
- ARGUS review:
  `docs/roadmap/PR484A_CONNECTOR_CREDENTIAL_CONTRACT_REVIEW_RESULT.md`.

Accepted validation included:

- connector credential contract tests;
- no-write import preview tests;
- Reddit/Discord parser tests;
- social fail-closed route tests;
- social readiness source guard tests;
- typecheck;
- whitespace validation;
- path-scope and sensitive/scope scans.

## Next Lane Rule Applied

PR484A removed the first blocker for the chosen Live Archive Connectors feature,
but it did not make connectors live. MIMIR therefore continues the PR484 feature
through the next direct unblock rather than jumping to a different feature.

MIMIR opens:

`docs/roadmap/PR484B_CONNECTOR_CREDENTIAL_STORAGE_PREFLIGHT_ARGUS.md`
