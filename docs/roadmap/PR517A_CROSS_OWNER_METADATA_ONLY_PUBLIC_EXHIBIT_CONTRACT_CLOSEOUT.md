# PR517A - Cross-Owner Metadata-Only Public Exhibit Contract Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT_ACCEPTED_LOCALLY
```

## Decision

PR517A is accepted locally with the ARGUS review patch.

Source:

- `docs/roadmap/PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT_RESULT.md`
- `docs/roadmap/PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT_REVIEW_RESULT.md`

## Accepted Shape

PR517A added a dedicated cross-owner, metadata-only public exhibit contract:

```text
public.persona_encounter_cross_owner_public_exhibits
```

Accepted behavior:

- participant-authenticated proposal route:
  `POST /persona-encounters/cross-owner-consents/:consentId/public-exhibit`;
- participant-authenticated exact metadata approval route:
  `PATCH /persona-encounters/cross-owner-public-exhibits/:slug/approve`;
- participant-authenticated retract route:
  `PATCH /persona-encounters/cross-owner-public-exhibits/:slug/retract`;
- public API detail readback:
  `GET /persona-encounters/cross-owner-public-exhibits/:slug`;
- authenticated report route:
  `POST /persona-encounters/cross-owner-public-exhibits/:slug/report`;
- distinct report target type:
  `persona_encounter_cross_owner_public_exhibit`;
- admin remove/restore support with active bilateral metadata approval required
  before restore;
- consent revocation retracts linked proposed/published cross-owner public rows.

Public readback remains metadata-only: slug, title, summary, tags, safe
participant display snapshots, status, contract version, timestamps,
metadata-only provenance, and report path.

## ARGUS Patch

ARGUS fixed two issues before acceptance:

- same-owner public exhibit moderation no longer selects cross-owner-only
  `consent_id` from the same-owner table;
- the SQL validator permits consent-revocation triggers to retract linked
  cross-owner public rows after consent inactivity, while still blocking
  metadata or identity mutation after inactive consent.

## Validation

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters PASS - 73 tests
npm exec --yes pnpm@10.32.1 -- run test:reports            PASS - 8 tests
npm exec --yes pnpm@10.32.1 -- run test:studio-ui          PASS - 215 tests
npm exec --yes pnpm@10.32.1 -- run typecheck               PASS
git diff --check                                            PASS
git diff --cached --check                                   PASS
```

## Next Lane

PR517A is local code/schema acceptance only. Hosted migration `080` and hosted
API/browser proof remain required before any hosted or customer-facing claim.

Open:

```text
PR517B - Cross-Owner Metadata-Only Public Exhibit Hosted Proof
Owner: ARIADNE / A4
```
