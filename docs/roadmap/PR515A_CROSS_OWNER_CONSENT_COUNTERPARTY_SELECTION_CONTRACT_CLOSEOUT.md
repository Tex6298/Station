# PR515A - Cross-Owner Consent Counterparty Selection Contract Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR515A_CROSS_OWNER_CONSENT_COUNTERPARTY_SELECTION_CONTRACT_ACCEPTED
```

## Decision

PR515A is accepted and closed. ARGUS accepted the implementation without a
review patch.

## Proved

- authenticated target lookup exists at
  `GET /persona-encounters/cross-owner-consent-targets/:publicSlug`;
- authenticated invitation creation exists at
  `POST /persona-encounters/cross-owner-consents/from-public-persona`;
- browser-facing invitation creation no longer needs a raw counterparty persona
  UUID or owner id;
- target readback is public-only: display name, short public description,
  sanitized avatar URL, safe public slug/href, eligibility, and provenance;
- unsafe or UUID-shaped slugs, private personas, unavailable targets,
  ineligible-owner targets, stale targets, same-owner targets, missing
  requester ownership, raw-id bodies, and forged fields fail closed before
  consent writes;
- existing consent ledger RPC, audit rows, bounded scope, participant readback,
  and non-executable ledger semantics are preserved;
- web helpers normalize safe slugs and `/personas/:slug` hrefs while rejecting
  nested paths and UUID-shaped slugs;
- no visible invitation UI, generated-word sharing, saved session, public
  exhibit, retrieval, storage, billing, Redis, Cloudflare, worker, migration,
  provider config, public surfacing, hosted-runtime scope, or broad redesign
  entered PR515A.

## Next Lane

```text
PR515B - Cross-Owner Consent Invitation and Inbox UI
Owner: DAEDALUS / A2
```
