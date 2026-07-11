# PR515 - Cross-Owner Consent Invitation UI Preflight Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR515_CROSS_OWNER_CONSENT_INVITATION_UI_PREFLIGHT_BLOCKED_WITH_CONTRACT_UNBLOCK
```

## Decision

PR515 is closed as a useful blocker, not a failed lane.

ARGUS found that visible consent inbox/action UI can safely use the existing
participant-scoped list, detail, approve, reject, cancel, and revoke routes.
Full invitation creation is not ready as a UI-only lane because the current
create contract requires the browser to submit raw persona UUIDs.

Concrete blocker:

```text
CROSS_OWNER_CONSENT_COUNTERPARTY_SELECTION_CONTRACT_MISSING
```

## Product Meaning

Customers can only create real cross-owner preview consent invitations safely
after Station has a bounded way to choose an eligible public counterparty and
let the server resolve that selection without browser-visible raw counterparty
persona ids or owner ids.

## Next Lane

```text
PR515A - Cross-Owner Consent Counterparty Selection Contract
Owner: DAEDALUS / A2
```
