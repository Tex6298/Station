# PR461 - Studio Dashboard Quota Readback De-Fake Closeout

Owner: MIMIR / A1

Date: 2026-06-28

State: CLOSED - OPEN PR462 HOSTED STUDIO QUOTA READBACK CONFIRMATION

## Decision

MIMIR closes PR461 as an accepted code patch and opens hosted visual
confirmation.

ARGUS result:

`docs/roadmap/PR461_STUDIO_DASHBOARD_QUOTA_READBACK_DEFAKE_REVIEW_RESULT.md`

Verdict:

```text
ARGUS ACCEPTED
```

Accepted proof:

- Studio no longer computes or displays the synthetic `Tier allocation` metric;
- invented monthly usage counters are removed from the Studio dashboard;
- replacement cards route to Billing, Settings, and Archive source surfaces;
- the Archive card copy was tightened by ARGUS so it does not imply
  `/studio/archive` is the Settings storage meter;
- local validation passed for full typecheck, `test:studio-ui`, and whitespace.

Remaining proof:

- Local Playwright/browser screenshots were unavailable in this checkout.
- The original defect was visible product trust/clarity, so hosted/browser
  confirmation is the honest closure step.

## Next Lane

Open PR462:

`docs/roadmap/PR462_HOSTED_STUDIO_QUOTA_READBACK_CONFIRMATION_ARIADNE.md`

ARIADNE should verify that hosted `/studio` no longer shows synthetic quota math
and that the replacement route cards point to the right authoritative surfaces.
