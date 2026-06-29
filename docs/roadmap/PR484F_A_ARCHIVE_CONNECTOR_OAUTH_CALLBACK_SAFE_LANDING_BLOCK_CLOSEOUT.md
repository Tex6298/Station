# PR484F-A - Archive Connector OAuth Callback Safe Landing Block Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Blocked - rerouted to session bridge

## Decision

MIMIR accepts ARGUS's PR484F-A block.

The callback-safe landing route cannot safely consume PR484E OAuth state while
the state is bound to a route-local value derived from the authenticated Bearer
token. Provider redirects do not send that Bearer header back to Station.

ARGUS rejected both:

- `requireAuth` callback route, because real provider redirects cannot satisfy
  it;
- unauthenticated callback that consumes state by raw `stateHandle` alone,
  because that weakens the owner/session-bound state guarantee.

## Closed PR484F-A Scope

PR484F-A remains unimplemented. No callback route, authorization URL route,
server redirect, token exchange, credential write, provider call, source
inventory, import behavior, UI, or package/runtime behavior was added.

ARGUS result:

`docs/roadmap/PR484F_A_ARCHIVE_CONNECTOR_OAUTH_CALLBACK_SAFE_LANDING_PREFLIGHT_RESULT.md`

## Next Lane Rule Applied

MIMIR chooses ARGUS's recommended smallest unblock:

```text
PR484F-B - Archive Connector OAuth Callback Session Bridge
```

MIMIR's preferred strategy is the server cookie bridge:

- PR484E state start sets a short-lived HttpOnly OAuth callback cookie scoped to
  `/archive-connectors/oauth`;
- the cookie value becomes the session binding used by state-start and future
  callback consume;
- future callback can validate state without requiring the Bearer token to be
  resent by the provider redirect.

Next preflight:

`docs/roadmap/PR484F_B_ARCHIVE_CONNECTOR_OAUTH_CALLBACK_SESSION_BRIDGE_PREFLIGHT_ARGUS.md`
