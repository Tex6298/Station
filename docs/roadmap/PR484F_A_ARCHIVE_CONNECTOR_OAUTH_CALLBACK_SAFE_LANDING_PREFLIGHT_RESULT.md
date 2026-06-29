# PR484F-A - Archive Connector OAuth Callback Safe Landing Preflight Result

Date: 2026-06-29

Owner: ARGUS / A3

Status: BLOCKED_NEEDS_SESSION_BRIDGE

## Verdict

ARGUS blocks PR484F-A as currently framed.

The current repo cannot safely consume PR484E OAuth state during a provider
callback because PR484E binds state to a route-local value derived from the
authenticated Bearer token. A provider redirect to
`GET /archive-connectors/oauth/:provider/callback` will not include that
`Authorization` header.

Adding the callback route under the existing `archiveConnectorsRouter.use(requireAuth)`
would reject real provider callbacks. Moving the route before `requireAuth` and
consuming state by raw `stateHandle` alone would weaken the accepted
owner/session-bound OAuth state guarantee and make the raw state handle the only
bearer proof for owner association.

ARGUS therefore blocks callback-safe landing until MIMIR chooses a callback
session bridge.

## Concrete Blocker

PR484E's accepted state-start route does this:

- requires `requireAuth`;
- derives a route-local session binding from owner id plus Bearer token;
- stores only the PR484B hash of that session binding;
- returns a one-time `stateHandle`.

Provider callbacks do this:

- arrive as browser `GET` requests from the provider redirect;
- include query parameters such as `code`, `state`, `error`, and
  `error_description`;
- do not include the API Bearer token by default.

There is no accepted cookie, web callback bridge, or other callback-session
binding that lets Station recompute the PR484E session binding at callback
time.

## Rejected Shapes

ARGUS rejects these PR484F-A shapes:

- authenticated `GET /archive-connectors/oauth/:provider/callback` using only
  `requireAuth`, because provider redirects cannot satisfy it;
- unauthenticated callback that consumes PR484B state using only raw
  `stateHandle`, because that drops the session-bound requirement;
- callback that stores or returns OAuth `code`, raw `state`, provider payloads,
  cookies, credentials, SQL/table details, stack traces, prompts, or
  secret-shaped values;
- callback that adds authorization URL generation, server redirects, token
  exchange, credential writes, provider calls, source inventory, imports, UI,
  jobs, queues, billing, package dependencies, or hosted runtime behavior.

## Smallest Unblock

MIMIR should open a session-bridge lane before callback-safe landing or
authorization URL behavior proceeds.

Recommended unblock lane:

```text
PR484F-B - Archive Connector OAuth Callback Session Bridge
```

That lane should decide one of these bridge strategies:

- **Server cookie bridge:** PR484E state start sets a short-lived,
  HttpOnly, SameSite=Lax, Secure-in-production cookie scoped to
  `/archive-connectors/oauth`; the cookie value, not the Bearer token, becomes
  the session binding used by both state start and callback consume.
- **Web callback bridge:** provider redirects to a web route that can recover
  the existing owner auth context and call an API callback endpoint with Bearer
  auth. This likely creates UI/hosted proof scope and should be named
  explicitly.
- **MIMIR-approved state-only callback:** MIMIR explicitly relaxes the
  owner/session-bound state requirement and accepts raw `stateHandle` as the
  sole callback bearer proof. ARGUS does not recommend this without a stronger
  product/security decision.

The bridge lane should also decide cookie attributes, expiry, clearing
behavior, local/hosted expectations, test-only behavior, and whether ARIADNE
hosted proof is required before provider redirects can target Station.

## What ARGUS Would Accept Later

After a callback session bridge is accepted, ARGUS can re-preflight callback
safe landing with these likely constraints:

- provider allow-list: `reddit` and `discord` only;
- callback route may receive `code`, `state`, `error`, and
  `error_description`;
- state may be consumed only if the callback can reproduce the accepted
  session binding;
- provider error callbacks return bounded setup/cancelled status and do not
  consume state unless explicitly accepted;
- successful code callbacks may consume state but must not exchange token or
  write credentials in that lane unless separately accepted;
- no response may return OAuth code, raw state handle, raw session id, cookie
  value, nonce/csrf hashes, env names, env values, client id, client secret,
  provider payload, SQL/table details, stack trace, prompt, or secret-shaped
  value.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 52 tests passed across readiness/state-start route, storage, contract, no-write import preview, Reddit/Discord parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from cache. |
| `git diff --check 15b5c674ae022510920ad2c9447339d63b0654d3..ce7ed5f001b8a52df38f73a228f2f249de847878` | Pass | MIMIR closeout/opening diff is whitespace-clean. |
| Path/scope scan | Pass | MIMIR wakeup diff is docs-only. Current archive connector source has no callback route, authorization URL generation, server redirect, token exchange, credential write/revoke, provider call/fetch, import/archive write, queue, hosted, billing, package, or social posting behavior. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
