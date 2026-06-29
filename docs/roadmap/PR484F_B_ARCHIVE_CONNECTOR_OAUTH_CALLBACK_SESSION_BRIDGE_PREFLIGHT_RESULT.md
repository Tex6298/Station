# PR484F-B - Archive Connector OAuth Callback Session Bridge Preflight Result

Date: 2026-06-29

Owner: ARGUS / A3

Status: BLOCKED_NEEDS_WEB_CALLBACK_BRIDGE

## Verdict

ARGUS blocks PR484F-B as currently framed.

The server cookie bridge is a plausible OAuth callback-session strategy, but
the current repo does not yet have a browser transport path that can reliably
set and send an API-domain OAuth bridge cookie from the Station web app.

Current evidence:

- the API uses default `cors()` in `apps/api/src/app.ts`, with no
  credentialed CORS allow-list;
- the shared web API client in `apps/web/lib/api-client.ts` calls `fetch`
  without `credentials: "include"`;
- hosted config/tests reference separate Railway web/API origins
  (`stationweb-production.up.railway.app` and
  `stationapi-production.up.railway.app`);
- PR484F-B explicitly does not allow UI, hosted runtime, callback route, or
  authorization URL behavior that would prove this cookie path end to end.

Implementing an API `Set-Cookie` now would therefore be local-testable but not
honest product proof for the browser/provider callback path. ARGUS blocks until
MIMIR chooses a web callback bridge or explicitly opens a credentialed
web/API-cookie transport lane with hosted proof.

## Concrete Blocker

For the preferred server cookie bridge to work in the browser:

1. the authenticated state-start request must store the API-domain cookie in
   the user's browser;
2. the provider callback redirect must return to the same API domain and path
   scope so the browser sends that cookie;
3. Station must prove the cookie is not exposed in JSON, docs, UI, logs,
   tests, or error readback.

The current repo only satisfies the second condition in theory. It does not
show that the web app can receive and persist an API cookie because the API CORS
and web fetch path are not credentialed.

## Rejected Shapes

ARGUS rejects these PR484F-B shapes:

- patching only `POST /archive-connectors/oauth/:provider/start` to set a
  cookie while leaving web/API credential transport unproven;
- broad `cors({ credentials: true, origin: true })` or wildcard credentialed
  CORS;
- adding callback routes, authorization URL generation, server redirects, token
  exchange, credential writes, provider calls, source inventory, imports, UI,
  jobs, queues, billing, package dependencies, or hosted runtime behavior under
  PR484F-B;
- returning or logging cookie values, raw state handles, raw session ids,
  nonce/csrf hashes, env values, client ids, client secrets, OAuth codes,
  provider payloads, SQL/table details, stack traces, prompts, or
  secret-shaped values.

## Smallest Unblock

Recommended unblock lane:

```text
PR484F-C - Archive Connector OAuth Web Callback Bridge
```

MIMIR should decide whether the OAuth callback should land on the web origin
instead of the API origin. A web callback bridge can recover the existing owner
auth context and call an API endpoint with the Bearer token, avoiding a
cross-origin API cookie transport requirement.

If MIMIR still prefers the server cookie bridge, open a specific transport
lane instead:

```text
PR484F-C - Archive Connector OAuth Credentialed Cookie Transport
```

That lane must explicitly allow and validate:

- specific-origin credentialed CORS for Station web origin only;
- web request code for the connector state-start call using
  `credentials: "include"` only on that route;
- cookie attributes: `HttpOnly`, `SameSite=Lax`, `Secure` on HTTPS,
  `Path=/archive-connectors/oauth`, `Max-Age` no longer than the state expiry;
- random cookie value with owner association only in the OAuth state row;
- no cookie value in JSON, logs, docs, UI, tests, or errors;
- ARIADNE hosted proof across the real web/API domains before authorization URL
  or callback routes become live.

## What ARGUS Would Accept Later

After MIMIR chooses a viable browser transport, ARGUS can re-preflight a
session bridge with these likely constraints:

- state-start may generate a random callback session value;
- the value is used as the PR484B `sessionId` binding instead of the Bearer
  token-derived value;
- the raw callback session value is stored only in an HttpOnly cookie and never
  returned in JSON;
- owner id remains only in the OAuth state row;
- callback consume can verify provider, state handle, expiry, and cookie
  binding without requiring the provider redirect to send an Authorization
  header;
- no callback handling, authorization URL, token exchange, credential write,
  provider call, source inventory, import write, UI, jobs, queues, billing,
  package dependency, or hosted runtime widening unless separately accepted.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 52 tests passed across readiness/state-start route, storage, contract, no-write import preview, Reddit/Discord parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from cache. |
| `git diff --check a177abd64a5b584500877562de2da6bd4c0c502e..40adb4a8ab7e7e9e688293a85748a962acce5a79` | Pass | MIMIR closeout/opening diff is whitespace-clean. |
| Path/scope scan | Pass | MIMIR wakeup diff is docs-only. Current archive connector/API source has no cookie bridge, callback route, authorization URL generation, server redirect, token exchange, credential write/revoke, provider call/fetch, import/archive write, queue, hosted, billing, package, or social posting behavior. |
| Browser transport check | Blocker | API uses default `cors()` and web API client does not send `credentials: "include"`, so API-domain cookie storage from web state-start is unproven. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
