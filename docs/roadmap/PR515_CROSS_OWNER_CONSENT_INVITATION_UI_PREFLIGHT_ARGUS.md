# PR515 - Cross-Owner Consent Invitation UI Preflight

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date: 2026-07-11

State:

```text
OPEN_ARGUS_HOSTILE_PREFLIGHT
```

## Goal

Decide the smallest safe next lane for customer-facing cross-owner consent
invitation and approval UI.

## Existing Backend Floor

- `POST /persona-encounters/cross-owner-consents`
- `GET /persona-encounters/cross-owner-consents`
- `GET /persona-encounters/cross-owner-consents/:consentId`
- `PATCH /persona-encounters/cross-owner-consents/:consentId/approve`
- `PATCH /persona-encounters/cross-owner-consents/:consentId/reject`
- `PATCH /persona-encounters/cross-owner-consents/:consentId/cancel`
- `PATCH /persona-encounters/cross-owner-consents/:consentId/revoke`
- participant-scoped consent and audit readback
- PR514D consent-scoped disposable preview execution
- PR514E/PR514F owner-only Studio preview panel

## Preflight Questions

1. Where can an owner safely choose a counterparty persona?
2. Does the current public/persona/search surface expose a safe opaque
   counterparty persona identifier, or do we need a smaller discovery/readback
   contract first?
3. Should invitation start from public persona/profile page, Studio, Discover,
   or a dedicated consent screen?
4. What does the requester see for pending, approved, rejected, cancelled,
   revoked, expired, superseded, blocked-by-deletion, and moderation-locked
   states?
5. What does the counterparty see to approve or reject without revealing
   private data?
6. What copy prevents consent from being mistaken for saved sessions,
   transcripts, summaries, public exhibits, generated sharing, retrieval, or
   counterparty readback?
7. Is the smallest implementation lane UI-only against existing routes, or is
   there a contract unblock first?

## Safety Boundaries

Do not expose:

- raw owner ids;
- private persona ids beyond an already safe public/opaque route contract;
- private persona profile fields;
- private prompt/setup before both participants can see the relevant action;
- provider payloads, token facts, SQL, bearer tokens, environment values, or
  secrets.

Do not add:

- saved cross-owner sessions;
- public exhibits;
- generated-word excerpts, transcripts, summaries, share links, or publication;
- counterparty readback of generated content;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export, storage,
  billing, Redis, Cloudflare, workers, migrations, provider config, broad
  redesign, public surfacing, partner adapters, or webhooks.

## Expected Recommendation

Wake MIMIR with one of:

```text
ACCEPT_PR515A_CROSS_OWNER_CONSENT_INVITATION_UI
```

or:

```text
BLOCK_PR515_CROSS_OWNER_CONSENT_INVITATION_UI_PREFLIGHT
```

If blocked, name the exact blocker and the smallest unblock lane.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- MIMIR accepted and closed PR514F after ARIADNE passed hosted desktop/mobile rehearsal for the cross-owner disposable preview Studio panel.
- The next customer-facing gap is safe consent invitation and approval UI.
- Existing routes already cover create/list/read/approve/reject/cancel/revoke and participant-scoped audit readback.

Task:
- Run hostile preflight for cross-owner consent invitation and approval UI.
- Decide whether existing route/readback surfaces are sufficient for DAEDALUS to wire invitation, approval, rejection, cancellation, and revocation controls.
- Pay special attention to safe counterparty persona selection/readback, raw owner/persona id exposure, and copy that prevents consent from implying saved/public/generated-word sharing.
- Wake MIMIR with ACCEPT_PR515A_CROSS_OWNER_CONSENT_INVITATION_UI or BLOCK_PR515_CROSS_OWNER_CONSENT_INVITATION_UI_PREFLIGHT and the exact smallest next lane.
```
