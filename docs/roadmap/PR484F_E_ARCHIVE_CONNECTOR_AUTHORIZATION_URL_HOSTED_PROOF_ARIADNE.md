# PR484F-E - Archive Connector Authorization URL Hosted Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted OAuth origin/config proof

## Why This Rehearsal

ARGUS accepted PR484F-D:

`docs/roadmap/PR484F_D_ARCHIVE_CONNECTOR_OAUTH_AUTHORIZATION_URL_REVIEW_RESULT.md`

The remaining risk is hosted product truth. PR484F-D can now return a visitable
provider authorization URL, but it is still not a completed connector flow. The
live Railway app must prove that hosted URL construction uses the deployed web
callback origin and safe provider app config, without token exchange,
credential writes, provider calls, source inventory, or imports.

This is a human-eye plus bounded hosted API proof. Do not visit Reddit or
Discord authorization URLs with a real account, do not complete OAuth consent,
and do not paste or print raw callback/query values.

## Required Checks

Run against hosted Railway with the existing staging owner session and ARIADNE
tools.

1. Freshness:
   - hosted web/API health are ready at app commit `6e81319f` or later, or at
     the deploy-equivalent app commit if later commits are docs/state only;
   - API route inventory or bounded samples show the PR484F-D authorize route
     exists.
2. Readiness/config:
   - check owner-only archive connector readiness for Reddit and Discord;
   - record only provider status classes such as missing, partial, or
     configured;
   - do not print env values, client ids, client secrets, secret tails, tokens,
     cookies, raw response bodies, hosted logs, or provider account details;
   - if no provider is configured enough for URL readback, return
     `CONFIG_BLOCKER_PROVIDER_APP`.
3. State start:
   - for one configured provider, create a PR484E OAuth state with the hosted
     API;
   - keep the returned state handle private inside the tool run;
   - do not print the raw state handle, nonce, csrf, row id, owner id, session
     id, token, cookie, or raw API response body.
4. Authorization URL readback:
   - call `POST /archive-connectors/oauth/:provider/authorize` with that state
     handle;
   - verify the response is bounded and includes `authorizationUrl`;
   - verify the provider host is correct for the selected provider;
   - verify `redirect_uri` points to
     `https://stationweb-production.up.railway.app/archive-connectors/oauth/callback/<provider>`
     or the exact current deployed Station web origin if the Railway web URL has
     changed;
   - verify the redirect URI is not localhost, the API origin, request `Host`,
     `Origin`, `Referer`, `X-Forwarded-*`, `API_URL`, or any unrelated host;
   - verify Reddit uses only `scope=identity` and `duration=temporary`, or
     Discord uses only `scope=identify`;
   - verify client id and state appear only inside `authorizationUrl`, not as
     separate response fields.
5. Non-consuming state:
   - repeat the authorize call with the same unconsumed state;
   - verify the route still succeeds or returns the same bounded behavior
     without consuming state;
   - do not run a real provider callback with a real `code`.
6. Failure posture:
   - sample one malformed or mismatched authorize request only if ARIADNE tools
     can do so without exposing secrets;
   - verify bounded `400`/`409` style failure and no provider URL readback.
7. Safety/source boundary:
   - no token exchange, token refresh, token revocation, credential write,
     credential revoke, provider SDK/fetch/call, source inventory, recurring
     pull, import write, queue, worker, Redis, Cloudflare, billing/Stripe,
     provider/model call, package change, broad UI, marketplace, or social
     posting behavior is active;
   - no OAuth code, access token, refresh token, client secret, env value,
     credential material, provider payload, source data, import data, SQL/table
     output, stack trace, hosted log, prompt, signed URL, storage path, cookie,
     or secret-shaped value appears in visible readback.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
CONFIG_BLOCKER_PROVIDER_APP
DEPLOYMENT_WAITING
PRODUCT_DEFECT_NEEDS_DAEDALUS
PRIVACY_OR_OAUTH_BOUNDARY_FAIL
AUTH_SESSION_BLOCKER
```

Use `PASS_READY_TO_CLOSE` only if hosted freshness, provider readiness,
state-start, authorization URL readback, redirect URI origin, minimal scopes,
non-consuming state behavior, and sensitive readback boundaries pass.

Use `CONFIG_BLOCKER_PROVIDER_APP` if hosted Railway lacks enough
`ARCHIVE_CONNECTOR_REDDIT_*` or `ARCHIVE_CONNECTOR_DISCORD_*` provider app
config for a bounded authorization URL. Name the missing provider/config class,
not secret values.

Use `DEPLOYMENT_WAITING` if the live app has not deployed commit `6e81319f` or
later.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for route absence, wrong redirect origin,
wrong scopes, state consumed during authorize, non-bounded failures, or
unexpected URL/readback behavior that can be fixed in code.

Use `PRIVACY_OR_OAUTH_BOUNDARY_FAIL` if any raw state handle, OAuth code, token,
client secret, env value, credential material, provider payload, hosted log,
SQL/table output, stack trace, cookie, owner id, row id, session id, nonce/csrf
value or hash, private source material, import data, signed URL, storage path,
prompt, or secret-shaped value appears in visible readback.

Use `AUTH_SESSION_BLOCKER` only if ARIADNE cannot recover a hosted owner session
or Bearer auth for the bounded checks.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR484F-E hosted authorization URL proof.
Verdict:
- PASS_READY_TO_CLOSE | CONFIG_BLOCKER_PROVIDER_APP | DEPLOYMENT_WAITING | PRODUCT_DEFECT_NEEDS_DAEDALUS | PRIVACY_OR_OAUTH_BOUNDARY_FAIL | AUTH_SESSION_BLOCKER
Task:
- Close PR484F-D/E, wait for deploy/config, route the smallest repair, or
  choose the next live archive connector lane.
```
