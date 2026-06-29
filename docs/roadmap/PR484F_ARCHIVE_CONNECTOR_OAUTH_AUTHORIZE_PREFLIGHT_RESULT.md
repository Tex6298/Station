# PR484F - Archive Connector OAuth Authorize Preflight Result

Date: 2026-06-29

Owner: ARGUS / A3

Status: BLOCKED_NEEDS_MIMIR_DECISION

## Verdict

ARGUS blocks PR484F as currently framed.

Client id exposure inside an OAuth authorization URL is acceptable in
principle because OAuth authorization requests require a client identifier.
That exposure must be limited to the provider authorization URL or `Location`
header; client ids must not be returned as separate fields, logged, documented
as real values, or confused with client secrets.

The blocker is not the client id. The blocker is that a usable provider
authorization URL or server `302` sends the owner to the provider, and the
provider redirects back to Station with `code` and `state`. There is no accepted
callback/code redaction/state consume boundary yet. Returning a live
`authorizationUrl` before that boundary can create unmanaged OAuth codes at a
not-yet-accepted Station route.

ARGUS therefore rejects both `authorizationUrl` readback and server `302` for
PR484F until MIMIR either:

- opens a smaller callback-safe landing/state validation lane first; or
- explicitly combines authorization URL creation with a bounded callback
  landing/code-redaction/state-validation contract in the same numbered lane.

## Source Basis

- OAuth 2.0 authorization code flow directs the user-agent to the authorization
  endpoint with `client_id`, `redirect_uri`, scope, and state, then redirects
  back to the client with an authorization code and state:
  `https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1`.
- Discord documents `https://discord.com/oauth2/authorize` as the authorization
  URL and shows `client_id`, `scope`, `state`, and `redirect_uri` in the
  authorization URL. It also states that acceptance redirects to the
  `redirect_uri` with `code` and `state`:
  `https://docs.discord.com/developers/topics/oauth2#authorization-code-grant`.
- Reddit's OAuth documentation likewise describes sending the user's browser to
  the authorization URL and redirecting to the redirect URI with a code:
  `https://github.com/reddit-archive/reddit/wiki/OAuth2/d58daf50843e7c38606483068b568f10fad0b3d7#other-important-information`.

These sources make the callback/code boundary part of the authorization URL
boundary, not an unrelated later concern.

## Concrete Blocker

PR484E safely creates a state row and returns a `stateHandle`, but Station
still lacks an accepted route that can safely receive provider callback query
parameters.

Without that boundary:

- a returned `authorizationUrl` can be visited by an authenticated owner or
  copied into a browser;
- provider acceptance can send `code` and `state` to an unaccepted Station
  callback path;
- the repo has not yet defined code/query redaction, callback response shape,
  state validation, state consumption, error handling, or hosted/access-log
  expectations for that request;
- PR484F's non-scope explicitly forbids callback routes, state
  consume/callback handling, OAuth code handling, and token exchange.

## Smallest Unblock

MIMIR should open the smallest lane that decides the callback/code boundary
before provider authorization URLs become live.

Recommended unblock lane:

```text
PR484F-A - Archive Connector OAuth Callback Safe Landing
```

That lane should decide whether DAEDALUS may add only:

- `GET /archive-connectors/oauth/:provider/callback`;
- `reddit` / `discord` provider allow-list;
- bounded handling of `code`, `state`, `error`, and `error_description`;
- state-handle shape validation and, if accepted, PR484B state consumption;
- no token exchange, no credential write/revoke, no provider calls, no source
  inventory, no imports, no UI, no jobs/queues, no billing, no package deps,
  and no hosted runtime expansion beyond the accepted route;
- redacted errors/responses that never return OAuth codes, raw state handles,
  raw session ids, nonce/csrf hashes, provider payloads, SQL/table details,
  stack traces, prompts, or secret-shaped values.

After that callback-safe boundary exists, MIMIR can reopen authorization URL
readback or server redirect with concrete callback safety requirements.

## What ARGUS Would Accept Later

Once the callback/code boundary is accepted, ARGUS can accept client id exposure
inside a provider authorization URL under these constraints:

- no client secret in URL, response, docs, logs, or tests;
- `response_type=code` only;
- `state` is the PR484E one-time state handle only;
- `redirect_uri` is exactly the accepted Station callback route;
- Reddit and Discord URLs/scopes are named from official provider docs;
- minimum scopes only, with any source-inventory or message-history scopes
  requiring a separate ARGUS/MIMIR decision;
- no token exchange, token refresh/revocation, credential write/revoke,
  provider SDK/call, source inventory, import write, UI, job, queue, Redis,
  Cloudflare, billing/Stripe, provider/model, package dependency, hosted
  runtime, broad connector marketplace, or social posting scope.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 52 tests passed across readiness/state-start route, storage, contract, no-write import preview, Reddit/Discord parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from cache. |
| `git diff --check d121ce4dd229e98b97c84fca494ca0d24ed5f6fe..38fc717fcbe9a217ccdc01301181c389b4448dc2` | Pass | MIMIR closeout/opening diff is whitespace-clean. |
| Path/scope scan | Pass | MIMIR wakeup diff is docs-only. Current archive connector source has no authorize route, server redirect, callback, token exchange, credential write/revoke, provider call/fetch, import/archive write, queue, hosted, billing, package, or social posting behavior. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
