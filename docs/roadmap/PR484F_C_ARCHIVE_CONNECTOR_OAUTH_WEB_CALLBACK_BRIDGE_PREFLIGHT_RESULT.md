# PR484F-C - Archive Connector OAuth Web Callback Bridge Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Status: Accepted - DAEDALUS may implement bounded web callback bridge

## Verdict

```text
ACCEPT_PR484F_C_WEB_CALLBACK_BRIDGE
```

ARGUS accepts a web callback bridge as the smallest safe unblock after the
PR484F-B API-cookie bridge block.

Accepted shape:

- provider redirects to a Station web callback route;
- the web callback route recovers the existing browser owner auth context;
- the web route calls one bounded API verify endpoint with Bearer auth;
- the API endpoint consumes the existing PR484E OAuth state row using owner,
  provider, nonce, csrf, purpose, expiry, consumed state, and the existing
  Bearer-derived session binding;
- the endpoint returns only bounded success/failure readback;
- no authorization URL generation, server redirect, token exchange, credential
  write/revoke, provider SDK/call, source inventory, import write, queue,
  hosted runtime, Cloudflare, billing, provider/model call, package dependency,
  broad connector marketplace, or social posting behavior is allowed.

## Required Route Shape

Reserve this web route:

```text
/archive-connectors/oauth/callback/[provider]
```

Do not place the provider callback route under `/settings/...`, `/studio/...`,
or any other middleware-protected route that redirects signed-out traffic to
`/login?redirect=...`.

Reason: the current middleware preserves the full protected URL as a login
redirect target. If a provider callback lands signed out, that would forward
the callback query through the login URL. The accepted bridge must not forward
or display raw provider callback query values.

The web callback route must be a minimal client page or an equivalent
client-owned bridge. It must:

- read only the provider path param and the expected callback query keys;
- immediately remove the callback query from browser history before auth
  recovery, login navigation, or rendering detailed state;
- validate provider against the archive connector allow-list;
- validate state handle shape before any API call;
- recover the current stored Station browser session and call the API with the
  stored access token;
- avoid calling a helper that refreshes the access token before verify, because
  PR484E currently binds state to the access token used at state-start;
- if auth is missing, stale, expired, or mismatched, show bounded restart copy
  and do not carry callback query into a login redirect;
- never render, log, store, place in a link, or return raw code, raw state,
  provider error description, owner id, row id, session id, nonce hash, csrf
  hash, token, cookie, credential, SQL/table detail, stack trace, hosted log,
  storage path, signed URL, prompt, provider payload, private source material,
  or secret-shaped values.

## Required API Shape

Add this API route under the existing archive connector router:

```text
POST /archive-connectors/oauth/:provider/callback/verify
```

The existing `archiveConnectorsRouter.use(requireAuth)` boundary must continue
to protect this route. No unauthenticated callback route is accepted on the API.

The API route must:

- validate provider with the archive connector provider allow-list;
- accept only a bounded callback verification body;
- require a state handle matching the existing PR484E nonce/csrf shape;
- require a bounded code string only for the success callback path;
- split state into nonce/csrf and call `consumeArchiveConnectorOAuthState` with
  the authenticated owner id, provider, nonce, csrf, and the existing
  `sessionBinding(ownerUserId, bearerToken)`;
- consume exactly one matching state row and fail closed for owner, provider,
  session, csrf, purpose, expiry, or replay mismatch;
- discard the callback code after state verification in this lane;
- return only safe readback such as status, provider, purpose, consumed status,
  local redirect path, and disabled capability booleans.

Accepted status codes:

- `200` for verified and consumed callback state;
- `400` for unsupported provider or malformed callback input;
- `401` from `requireAuth` for missing/invalid Bearer auth;
- `409` for invalid, expired, consumed, owner-mismatched, session-mismatched, or
  provider-mismatched state;
- `500` only for unexpected bounded server failure, with no raw storage or
  callback details in the response.

The API response must not include the callback code, state handle, nonce, csrf,
session hash, owner id, state row id, auth token, provider payload, credential
material, raw external account id, table/schema detail, stack trace, hosted
log, or secret-shaped values.

## PR484E Binding Decision

DAEDALUS may keep PR484E's current Bearer-derived session binding for this
bridge.

Implementation constraint: the web callback must use the stored access token
that created the state. It must not refresh the token before verify and then
attempt to consume the old state with a new token-derived binding.

If the stored token is absent or no longer valid, the bridge must fail closed
with bounded restart copy. A more durable session-id binding can be proposed in
a later lane, but it is not required to unblock this web callback bridge.

## Provider Error Path

If a provider returns an error instead of a code, the web route may show bounded
failure copy and ask the owner to restart setup. It must not display or forward
raw `error_description`. State consumption for provider-error callbacks is not
required in PR484F-C.

## Acceptable Files

DAEDALUS may touch only the narrow local equivalents needed for this bridge:

- `apps/web/app/archive-connectors/oauth/callback/[provider]/page.tsx`;
- a focused web helper and test, for example
  `apps/web/lib/archive-connector-oauth-callback.ts` and matching test;
- `apps/api/src/routes/archive-connectors.ts`;
- `apps/api/src/routes/archive-connectors.test.ts`;
- `apps/api/src/services/archive-connectors/credential-storage.ts` only if a
  small exported helper/error distinction is needed for bounded route handling;
- roadmap/testing docs needed to report validation truth.

Do not touch hosted runtime config, CORS config, package manifests, lockfiles,
provider adapters, UI settings panels, billing, queues, Cloudflare, Redis,
source inventory, import writes, social posting, or broad connector UI.

## Required Tests

API tests must prove:

- verify requires Bearer auth;
- unsupported providers and malformed state/code fail without writes;
- a valid callback consumes a PR484E state exactly once;
- owner, provider, session, csrf, expiry, and replay mismatches fail closed;
- response bodies never include code, state, nonce, csrf, session hash, owner id,
  row id, storage details, stack traces, or secret-shaped values;
- source guards still prove no authorization URL generation, redirects, token
  exchange, provider calls, credential writes, inventory/import writes, queues,
  Cloudflare, billing, package changes, or social posting behavior.

Web tests must prove:

- the callback route is outside middleware-protected login-redirect paths;
- callback query values are removed from history before auth navigation or
  detailed rendering;
- missing auth renders bounded restart copy and does not link to login with raw
  callback query;
- valid provider/state/code calls the accepted API route with Bearer auth;
- invalid provider, missing code/state, and provider-error callbacks never call
  the API with unsafe input and never render raw callback values.

Replay the existing archive connector, import-preview, parser, social, and web
readiness tests plus typecheck.

## ARIADNE Proof

ARIADNE hosted proof is not required for DAEDALUS to implement PR484F-C while
the route remains unreachable by product authorization URL generation and no
token exchange/provider call exists.

ARIADNE hosted proof is required before any later lane enables a real
authorization URL, provider redirect, live callback URL, token exchange, or
credential write. That later proof must use the real deployed web/API origin
shape without logging callback query values, provider payloads, tokens, cookies,
or hosted logs.

## ARGUS Validation

| Check | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Passed with 52 tests |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Passed |
| `git diff --check 8cd3aefda068b620be459a724b18312c65d5a42c..a2f88912b83e` | Passed |
| MIMIR wakeup diff path scan | Docs-only |
| Current source/scope scan | Existing source has no archive connector callback route, authorization URL generation, server redirect, token exchange, provider call, credential write, source inventory, import write, queue, hosted runtime, Cloudflare, billing, package, or social posting implementation |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484F-C Archive Connector OAuth Web Callback Bridge.
- Implement only the bounded web callback route and Bearer-auth API verify route described in the result doc.
Task:
- Use public web route `/archive-connectors/oauth/callback/[provider]`, not `/settings/...`, so callback query values are not forwarded through login redirects.
- Add `POST /archive-connectors/oauth/:provider/callback/verify` under existing archive connector Bearer auth.
- Consume PR484E state once with the existing owner/provider/nonce/csrf/session binding and return only bounded readback.
- Keep authorization URL generation, token exchange, credential writes, provider calls, source inventory, import writes, broad UI, hosted runtime, queues, Cloudflare, billing, packages, and social posting out of scope.
```
