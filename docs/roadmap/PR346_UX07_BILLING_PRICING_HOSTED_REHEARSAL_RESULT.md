# PR346 - UX-07 Billing Pricing Hosted Rehearsal Result

Owner: ARIADNE

Date: 2026-06-26

Verdict:

```text
PASS WITH CAVEAT
```

## Routes Tested

Hosted web:

```text
https://stationweb-production.up.railway.app
```

Routes:

```text
/pricing
/billing
/billing?success=1
```

## Summary

ARIADNE completed the hosted desktop and `375px` mobile rehearsal for Pricing
and safe Billing display access.

Railway appears to have deployed PR345. Public Pricing shows the shared
`@station/config` tier display truth:

- Basic: `GBP 10/month`, `5 GB storage`
- Creator: `GBP 100/month`, `GBP 1,000/year`, `50 GB storage`
- Canon / Developer: `GBP 250/month`, `200 GB storage`, `3 Spaces`,
  `1 Developer Space`

The Pricing FAQ copy says plan changes start from Billing and Stripe-hosted
test-mode handoff, and Station reflects changes after verified server
subscription state updates.

## Pricing Result

Pricing passed on desktop and `375px` mobile.

- `/pricing` loaded with HTTP `200`.
- Basic, Creator, and Canon / Developer plan labels were readable.
- Monthly prices read coherently.
- Creator yearly pricing read coherently as `GBP 1,000/year - save 17%`.
- Storage limits matched shared config: `5 GB`, `50 GB`, `200 GB`.
- Space and Developer Space limits matched shared config where visible.
- The plan-change FAQ avoided claiming immediate entitlement activation or
  end-of-period downgrade timing.
- No horizontal overflow, clipped plan cards, overlapping text, or trapped
  controls were visible in the tested desktop or mobile captures.

## Billing Result

Billing is caveated.

No existing staging/replay authenticated session was available in this browser
context. Hosted `/billing` and `/billing?success=1` reached the sign-in screen on
desktop and `375px` mobile before Billing content rendered.

Observed:

- the sign-in screen loaded with HTTP `200`;
- no Checkout, Billing Portal, activation, purchase, or entitlement mutation was
  attempted;
- no Stripe URLs or IDs were opened or printed;
- no horizontal overflow was detected on the sign-in screen.

Not proven:

- authenticated Billing plan-card display;
- authenticated current-plan, subscription-status, and server-returned limit
  readback;
- `/billing?success=1` Checkout-return copy in authenticated Billing context;
- token-credit and storage/usage panel separation inside authenticated Billing.

## Safety Result

Passed.

ARIADNE did not click:

- Upgrade;
- Activate;
- Checkout;
- top-up Buy;
- `Manage / cancel subscription`.

The hosted rehearsal did not create Checkout sessions, open Billing Portal,
mutate Stripe state, change entitlements, print Stripe URLs, print customer or
subscription IDs, or expose cookies, auth values, payment IDs, or secret-shaped
values.

## Validation

Passed:

```text
$env:NODE_PATH = "$env:LOCALAPPDATA\npm-cache\_npx\68e6008f1f37a3f5\node_modules"; npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr346-billing-pricing-hosted-rehearsal.spec.js --reporter=line --workers=1
```

Result:

```text
4 passed
```

Passed:

```text
git diff --check
```

## Recommendation

MIMIR can close the public Pricing portion of this UX-07 deployed display slice
as passed.

MIMIR should not claim authenticated Billing hosted display proof from this run.
No DAEDALUS repair packet is indicated by the public Pricing pass or the
sign-in-gated Billing route. To close the Billing half, MIMIR should either
provide an existing replay authenticated session for ARIADNE or explicitly
accept this as `PASS WITH CAVEAT` for the Billing proof.
