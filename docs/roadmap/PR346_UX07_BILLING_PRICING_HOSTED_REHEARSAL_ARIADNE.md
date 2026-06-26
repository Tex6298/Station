# PR346 - UX-07 Billing Pricing Hosted Rehearsal

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR345 Billing tier display helper.
- Public Pricing and authenticated Billing now share display truth from @station/config.
- MIMIR needs hosted desktop/mobile proof after Railway deploy before claiming UX-07 deployed billing clarity for this slice.
Task:
- Run a hosted human-eye rehearsal for Pricing and Billing display only.
- Do not create Checkout sessions, open Billing Portal, mutate Stripe state, or change entitlements.
- Wake MIMIR with PASS, PASS WITH CAVEAT, FAIL, or BLOCKED.
```

## Target

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

## Required Checks

Run this as a human-eye/browser rehearsal after Railway deploy.

Public Pricing:

- Check desktop and a narrow mobile viewport around `375px`.
- Confirm the visible paid tiers use the expected storage limits from shared
  tier config: Basic/private `5 GB`, Creator `50 GB`, Canon / Developer
  `200 GB`.
- Confirm monthly and yearly prices still read coherently.
- Confirm the FAQ or plan-change copy does not promise immediate entitlement
  activation or end-of-period downgrade timing beyond verified server
  subscription state.
- Confirm no horizontal overflow, clipped plan cards, overlapping text, or
  trapped controls.

Authenticated Billing:

- Use the existing staging/replay authenticated session if available.
- If auth is unavailable, mark Billing `BLOCKED` or `PASS WITH CAVEAT` and say
  exactly which public checks still passed.
- Confirm plan-card display copy matches Pricing for tier labels, prices,
  storage, Spaces, and Developer Spaces.
- Confirm current plan, subscription status, and server-returned limit readback
  are visible and calm.
- Confirm `/billing?success=1` copy says Checkout returned and Station reflects
  the plan after verified server subscription state updates. It must not claim
  activation merely because the browser returned from Checkout.
- Confirm token-credit and storage/usage panels remain separate from
  subscription entitlement copy.
- Confirm mobile Billing has no horizontal overflow or clipped plan cards.

Safety:

- Do not click Upgrade, Activate, Checkout, top-up Buy, or
  `Manage / cancel subscription`.
- Do not open or print Stripe Checkout URLs, Portal URLs, customer IDs,
  subscription IDs, payment IDs, cookies, tokens, or secrets.
- Do not mutate hosted billing or entitlement state.

## Non-Scope

Do not test:

- live-money billing;
- Stripe webhook behavior;
- entitlement enforcement;
- tax, invoices, Connect, marketplace, tips, usage billing, or token-top-up
  purchase flows;
- Redis, Cloudflare, providers, onboarding, or broad visual redesign.

## Result Doc

Create:

```text
docs/roadmap/PR346_UX07_BILLING_PRICING_HOSTED_REHEARSAL_RESULT.md
```

Use one verdict:

```text
PASS
PASS WITH CAVEAT
FAIL
BLOCKED
```

Include:

- hosted freshness evidence;
- Pricing desktop/mobile result;
- Billing desktop/mobile result;
- `/billing?success=1` copy result;
- privacy/Stripe safety result;
- caveats or defects;
- whether MIMIR can close this UX-07 deployed display slice or should wake
  DAEDALUS with a repair packet.
