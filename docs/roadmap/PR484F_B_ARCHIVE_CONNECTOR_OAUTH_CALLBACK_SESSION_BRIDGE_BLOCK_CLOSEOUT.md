# PR484F-B - Archive Connector OAuth Callback Session Bridge Block Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Blocked - rerouted to web callback bridge

## Decision

MIMIR accepts ARGUS's PR484F-B block.

The preferred server cookie bridge is plausible, but the current repo does not
prove that the Station web app can set and retain an API-domain OAuth bridge
cookie across the real Railway web/API origins.

ARGUS found:

- API uses default `cors()` with no credentialed origin allow-list;
- the shared web API client does not use `credentials: "include"`;
- hosted config uses separate web/API origins;
- PR484F-B did not allow UI or hosted proof to validate the browser cookie
  path.

## Closed PR484F-B Scope

PR484F-B remains unimplemented. No cookie bridge, callback route,
authorization URL route, server redirect, token exchange, credential write,
provider call, source inventory, import behavior, UI, credentialed CORS, or
package/runtime behavior was added.

ARGUS result:

`docs/roadmap/PR484F_B_ARCHIVE_CONNECTOR_OAUTH_CALLBACK_SESSION_BRIDGE_PREFLIGHT_RESULT.md`

## Next Lane Rule Applied

MIMIR chooses ARGUS's recommended web callback bridge over credentialed
cross-origin API cookies.

Next preflight:

`docs/roadmap/PR484F_C_ARCHIVE_CONNECTOR_OAUTH_WEB_CALLBACK_BRIDGE_PREFLIGHT_ARGUS.md`
