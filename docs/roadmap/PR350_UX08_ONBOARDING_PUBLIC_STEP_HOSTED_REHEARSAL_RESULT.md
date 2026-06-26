# PR350 - UX-08 Onboarding Public Step Hosted Rehearsal Result

Owner: ARIADNE

Date: 2026-06-26

Verdict: PASS

## Scope

ARIADNE rehearsed the hosted `/studio/onboarding` Public step after the Railway deployment using the local ignored replay-owner credential keys. Credential values, cookies, auth values, authorization header values, raw owner IDs, and session artifacts were not printed, summarized, committed, or retained.

Hosted target:

```text
https://stationweb-production.up.railway.app
```

## Hosted Freshness Evidence

- Signed-in `/studio/onboarding` loaded successfully on desktop and 375px mobile.
- The accepted four onboarding path cards remained visible:
  - Fresh Start
  - Awakening
  - Document Migrator
  - API Bridge
- The signed-in Public step panel appeared after those four cards.
- The Public step surfaced existing route targets only:
  - `/space`
  - `/space/new`
  - `/studio/publish`
  - `/studio/assistant?prompt=...`

## Authenticated Desktop Result

PASS.

- `/studio/onboarding` returned 200 after replay-owner sign-in.
- The four accepted onboarding cards still appeared before the Public step.
- The Public step panel was visible after the card grid.
- Copy stayed owner-controlled and did not claim automatic publishing, automatic Space creation, visibility mutation, approval submission, backend execution, or Assistant autonomy.
- No horizontal overflow was detected at the desktop viewport.

## Authenticated Mobile Result

PASS.

- `/studio/onboarding` returned 200 after replay-owner sign-in at a 375px viewport.
- The four accepted onboarding cards remained readable.
- The Public step panel remained readable after the cards.
- No horizontal overflow, clipped cards, overlapping text, or trapped controls were detected.

## Route Safety Result

PASS.

- `/space` returned 200.
- `/space/new` returned 200.
- `/studio/publish` returned 200.
- `/studio/assistant?prompt=...` returned 200.
- The Assistant handoff prefilled the prompt text.
- No Space creation, publishing submission, visibility mutation, or Assistant message send was performed.
- The browser-side mutation guard observed no non-auth mutating requests during the rehearsal.

## Signed-Out Boundary Result

PASS.

- A fresh signed-out context loaded `/studio/onboarding` with a sign-in boundary.
- The signed-in Public step panel was not exposed before authentication.
- No horizontal overflow was detected in the signed-out boundary view.

## Caveats Or Defects

None.

## Recommendation

MIMIR can close the deployed UX-08 first Space/public publishing onboarding proof as passed. No DAEDALUS repair packet is needed.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr350-onboarding-public-step-hosted-rehearsal.spec.js --reporter=line --workers=1` - passed, 3 tests.
- `git diff --check` - passed with expected CRLF normalization warnings.
