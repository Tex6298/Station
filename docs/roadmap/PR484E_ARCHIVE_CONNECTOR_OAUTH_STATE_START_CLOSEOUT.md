# PR484E - Archive Connector OAuth State Start Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Closed

## Decision

MIMIR closes PR484E as accepted.

The lane ran through:

- PR484E ARGUS preflight;
- PR484E DAEDALUS implementation;
- PR484E ARGUS review, including bounded setup/error response hardening.

ARIADNE hosted rehearsal is not required because PR484E is API-only,
local-test covered, and adds no UI, provider call, redirect, callback, token
exchange, credential write, source inventory, import write, package
dependency, or hosted runtime behavior.

## Accepted Product Shape

PR484E adds:

```text
POST /archive-connectors/oauth/:provider/start
```

Accepted behavior:

- authenticated owner-only route through `requireAuth`;
- `reddit` and `discord` provider allow-list;
- archive-specific provider app config gate before any state write;
- one hash-only `archive_connector_oauth_states` row per successful start;
- nonce and csrf generated with 32 random bytes each;
- one opaque `stateHandle` returned only on successful authenticated start;
- route-local auth/session binding from owner id plus Bearer token digest;
- local redirect path validation before writes;
- setup-required responses do not reveal missing versus partial config detail;
- storage failures return bounded error responses and no raw `stateHandle`.

## Boundaries Kept

No OAuth redirect route, OAuth callback or consume route, OAuth code handling,
token exchange, token refresh/revocation execution, credential write/revoke
route, provider SDK, live Reddit/Discord API call, configured real test
credential, source inventory pull, recurring pull, import write, route UI, job,
queue, worker, Redis, Cloudflare, billing/Stripe, provider/model call, package
dependency, hosted runtime behavior, public connector page, broad connector
marketplace, or social posting behavior was added.

Responses and stored rows exclude env names, env values, client ids, client
secrets, secret tails, OAuth codes, access tokens, refresh tokens, cookies,
credentials, raw external account ids, raw owner ids, raw row ids, raw session
ids, nonce hashes in readback, csrf hashes in readback, provider payloads,
private source bodies, private messages, archive snippets, SQL/table details,
stack traces, hosted logs, storage paths, signed URLs, prompts, and static
secret-shaped fixtures.

## Validation Accepted

- DAEDALUS implementation:
  `docs/roadmap/PR484E_ARCHIVE_CONNECTOR_OAUTH_STATE_START_RESULT.md`.
- ARGUS review:
  `docs/roadmap/PR484E_ARCHIVE_CONNECTOR_OAUTH_STATE_START_REVIEW_RESULT.md`.

Accepted validation included:

- archive connector readiness/state-start tests;
- archive connector credential storage tests;
- archive connector credential contract tests;
- no-write import preview tests;
- Reddit/Discord parser tests;
- social fail-closed route tests;
- web social readiness guard tests;
- typecheck;
- whitespace validation;
- path/scope and source/scope scans.

## Next Lane Rule Applied

PR484E creates server-side OAuth state but still does not move a browser to a
provider or define provider authorization URL behavior.

The next direct unblock is the OAuth authorization boundary: how Station may
build or issue a provider authorization URL while preserving the accepted state
handle and while intentionally exposing only the client id data that OAuth
requires.

MIMIR therefore opens PR484F:

`docs/roadmap/PR484F_ARCHIVE_CONNECTOR_OAUTH_AUTHORIZE_PREFLIGHT_ARGUS.md`
