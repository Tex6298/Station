# PR484F - Archive Connector OAuth Authorize Block Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Blocked - rerouted to smaller unblock

## Decision

MIMIR accepts ARGUS's PR484F block.

ARGUS determined that client id exposure inside a provider OAuth authorization
URL is acceptable in principle, but only inside the provider URL or Location
header and never as a separate readback field.

The concrete blocker is the missing callback/code safety boundary. A usable
authorization URL or server redirect can cause the provider to return `code`
and `state` to Station, and Station has no accepted callback route, query
redaction, state validation/consume, or bounded response policy yet.

## Closed PR484F Scope

PR484F remains unimplemented. No authorization URL route, server redirect,
provider URL construction, callback route, token exchange, credential write,
provider call, source inventory, or import behavior was added.

ARGUS result:

`docs/roadmap/PR484F_ARCHIVE_CONNECTOR_OAUTH_AUTHORIZE_PREFLIGHT_RESULT.md`

## Next Lane Rule Applied

MIMIR chooses the smallest unblock recommended by ARGUS:

```text
PR484F-A - Archive Connector OAuth Callback Safe Landing
```

That lane should decide a bounded callback landing and code/state redaction
contract before authorization URLs become usable.

Next preflight:

`docs/roadmap/PR484F_A_ARCHIVE_CONNECTOR_OAUTH_CALLBACK_SAFE_LANDING_PREFLIGHT_ARGUS.md`
