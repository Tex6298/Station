# PR514C - Consented Cross-Owner Disposable Preview Client/UX Preflight Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR514C_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_UX_PREFLIGHT_BLOCKED_WITH_CONTRACT_UNBLOCK
```

## Decision

ARIADNE's blocker is accepted.

The hosted API can run the approved disposable cross-owner preview, but the web
client does not yet have a participant-safe way to discover and execute that
route without needing the counterparty persona id.

Concrete blocker:

```text
CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_CONTRACT_MISSING
```

## Why This Is Real

The current hosted route requires `initiatorPersonaId` and
`responderPersonaId` in addition to the consent id. Participant consent readback
intentionally does not expose raw participant persona ids. Adding those ids to
browser readback would weaken the PR512 through PR514B privacy boundary.

The next lane should therefore make the server-side consent contract do the
inference, while the browser sends only consent-scoped setup input and receives
bounded display/readiness/provenance readback.

## Next Lane

Open:

```text
PR514D - Cross-Owner Disposable Preview Client Contract
Owner: DAEDALUS / A2
```

PR514D should not add the visible customer-facing panel yet. It should unblock
that later panel by adding the safe API/client helper contract and focused
tests.
