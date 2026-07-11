# PR515B - Cross-Owner Consent Invitation and Inbox UI Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR515B_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_ACCEPTED_LOCALLY
```

## Decision

PR515B is accepted locally. ARGUS accepted DAEDALUS's owner-only Studio UI
without a review patch.

Because PR515B changes visible owner workflow, the surface is not fully closed
until ARIADNE completes a hosted browser rehearsal.

## Accepted

- owner-only Studio panel uses safe public slug or `/personas/:slug` target
  lookup through the PR515A target route;
- invitation creation posts to
  `POST /persona-encounters/cross-owner-consents/from-public-persona`;
- browser-facing invitation UI does not use the legacy raw-id
  `POST /persona-encounters/cross-owner-consents` route;
- participant-visible consent rows load from
  `GET /persona-encounters/cross-owner-consents`;
- approve, reject, cancel, and revoke controls use participant-scoped action
  routes;
- action availability is role/status-derived;
- visible readback remains bounded to display snapshots, status, role, scope,
  timestamps, provenance, recent audit metadata, and state copy;
- required ledger-only copy is present;
- approved eligible consent rows keep the existing disposable preview control
  separate;
- no saved sessions, public exhibits, generated-word sharing, retrieval,
  storage, billing, Redis, Cloudflare, workers, migrations, provider config,
  public surfacing, hosted-runtime expansion, broad redesign, or deployment
  work entered PR515B.

## Next Lane

```text
PR515C - Cross-Owner Consent Invitation and Inbox UI Hosted Rehearsal
Owner: ARIADNE / A4
```
