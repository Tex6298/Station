# PR347 - UX-07 Authenticated Billing Hosted Recheck Result

Owner: ARIADNE

Date: 2026-06-26

Verdict:

```text
PASS
```

## Routes Tested

Hosted web:

```text
https://stationweb-production.up.railway.app
```

Routes:

```text
/login?redirect=/billing
/billing
/billing?success=1
```

## Login Result

Passed.

ARIADNE used the local ignored `.env` replay-owner credential keys without
printing, logging, screenshotting, committing, or summarizing the credential
values.

Desktop and `375px` mobile login both reached authenticated `/billing`.

No cookies, auth values, raw owner IDs, or credential values were recorded in
the result.

## Billing Desktop Result

Desktop authenticated `/billing` passed.

- `/billing` loaded with HTTP `200`.
- Current plan readback was visible and calm.
- Subscription status was visible.
- Server-returned limits were visible:
  - `3 Spaces`
  - `1 Developer Space`
  - `200 GB`
- Shared PR345 plan-card display copy was visible:
  - Basic: `GBP 10/month`, `5 GB storage`
  - Creator: `GBP 100/month`, `50 GB storage`
  - Canon / Developer: `GBP 250/month`, `200 GB storage`, `3 Spaces`,
    `1 Developer Space`
- The active/current-plan posture read clearly.
- The `Manage / cancel subscription` control was visible but was not clicked.
- Token-credit copy remained separate from subscription entitlement copy:
  `Entitlements and token credits are separate.`
- No horizontal overflow was detected.

## Billing Mobile Result

`375px` authenticated `/billing` passed.

- Current plan, subscription status, server-returned limits, token-credit
  separation, and plan cards remained readable.
- Plan cards stacked cleanly.
- No clipped plan cards, overlapping text, horizontal overflow, or trapped
  controls were visible.
- Mutation controls were not clicked.

## Checkout-Return Copy

Authenticated `/billing?success=1` passed on desktop and `375px` mobile.

The success notice said:

```text
Checkout returned. Station reflects your plan after verified server subscription state updates.
```

It did not claim subscription activation merely because the browser returned
from Checkout.

## Stripe And Privacy Safety

Passed.

ARIADNE did not click:

- Upgrade;
- Activate;
- Checkout;
- top-up Buy;
- `Manage / cancel subscription`.

The hosted recheck did not create Checkout sessions, open Billing Portal,
mutate Stripe state, change entitlements, or print Stripe URLs, Portal URLs,
customer IDs, subscription IDs, payment IDs, cookies, auth values, credentials,
or secret-shaped values.

## Validation

Passed:

```text
$env:NODE_PATH = "$env:LOCALAPPDATA\npm-cache\_npx\68e6008f1f37a3f5\node_modules"; npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr347-auth-billing-hosted-recheck.spec.js --reporter=line --workers=1
```

Result:

```text
2 passed
```

Passed:

```text
git diff --check
```

Note: `git diff --check` printed only the expected CRLF normalization notice for
`.station-agents/state/ARIADNE.json`.

## Recommendation

MIMIR can close the authenticated Billing display proof as passed.

No DAEDALUS repair packet is needed from this hosted recheck.
