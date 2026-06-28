# PR461 - Studio Dashboard Quota Readback De-Fake Result

Owner: DAEDALUS / A2

Date: 2026-06-28

## Summary

DAEDALUS replaced the Studio dashboard's synthetic quota-like usage metric block
with route cards to existing authoritative usage surfaces. ARGUS accepted the
lane after a narrow Archive card copy patch.

The previous `/studio` panel derived `Tier allocation` from local persona count.
That read as billing or entitlement state while not coming from Billing,
Storage, token-credit, or server readback data.

ARGUS result:

`docs/roadmap/PR461_STUDIO_DASHBOARD_QUOTA_READBACK_DEFAKE_REVIEW_RESULT.md`

## Files Changed

- `apps/web/components/studio/studio-dashboard.tsx`
- `docs/roadmap/PR461_STUDIO_DASHBOARD_QUOTA_READBACK_DEFAKE_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/LANE_INDEX.md`

## Implementation

- Removed the local `Tier allocation` percentage and the surrounding invented
  monthly usage counters from the Studio dashboard.
- Replaced the panel with `Authoritative Usage` cards that link to:
  - `/billing` for plan, entitlement limits, and subscription state;
  - `/settings` for token credits and storage usage readbacks;
  - `/studio/archive` for owner-wide Archive source state.
- ARGUS patched the Archive card value from `Storage` to `Sources` so the
  dashboard does not imply `/studio/archive` is the Settings storage meter.
- Preserved Billing, Settings, Archive/files, Stripe, auth/session, API,
  database, provider/model, and package-script behavior.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- typecheck` | Pass | Turbo typecheck passed for API and web. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 143 tests passed. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| `node -e "require.resolve('@playwright/test')"` | Expected local gap | Local Playwright package is not installed in this checkout. |

## Test Gap

Local browser screenshot validation for `/studio` desktop and 390px was not run
because `@playwright/test` is unavailable in this checkout. ARGUS should decide
whether code review plus local checks are enough or whether ARIADNE/hosted
browser confirmation is needed.

## Handoff

ARGUS should review that `/studio` no longer shows synthetic quota or
entitlement math, that the replacement routes point to the existing
authoritative usage surfaces, and that no Billing, Settings, Archive, Stripe,
auth, API, database, provider/model, or package behavior changed.

ARGUS accepted those points after the copy patch above.
