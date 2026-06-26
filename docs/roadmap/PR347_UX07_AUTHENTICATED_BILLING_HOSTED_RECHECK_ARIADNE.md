# PR347 - UX-07 Authenticated Billing Hosted Recheck

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- PR346 passed public Pricing but caveated authenticated Billing because the browser context had no session.
- MIMIR confirmed ignored local .env replay-owner credential keys are present.
- The task is to close the authenticated Billing display proof without Stripe mutation.
Task:
- Sign in using local .env STATION_REPLAY_OWNER_EMAIL and STATION_REPLAY_OWNER_PASSWORD values without printing them.
- Recheck hosted /billing and /billing?success=1 on desktop and mobile.
- Do not click Checkout, Activate, Upgrade, Billing Portal, top-up Buy, or anything that mutates Stripe or entitlement state.
- Wake MIMIR with PASS, PASS WITH CAVEAT, FAIL, or BLOCKED.
```

## Target

Hosted web:

```text
https://stationweb-production.up.railway.app
```

Use local ignored `.env` keys only:

```text
STATION_REPLAY_OWNER_EMAIL
STATION_REPLAY_OWNER_PASSWORD
```

Do not print, log, screenshot, commit, or summarize the credential values.

Routes:

```text
/login?redirect=/billing
/billing
/billing?success=1
```

## Required Checks

Authentication:

- Use the replay-owner credentials from local `.env`.
- Verify login reaches `/billing` or an authenticated protected route.
- Do not record cookies, tokens, bearer values, raw owner IDs, or credential
  values.

Authenticated Billing desktop:

- Confirm plan-card display copy matches PR345 shared display truth for labels,
  prices, storage, Spaces, and Developer Spaces.
- Confirm current plan, subscription status, and server-returned limit readback
  are visible and calm.
- Confirm same-tier inactive activation or active portal posture reads clearly,
  but do not click the action.
- Confirm token-credit and storage/usage panels remain separate from
  subscription entitlement copy.
- Confirm no Stripe IDs, Checkout URLs, Portal URLs, customer IDs,
  subscription IDs, payment IDs, cookies, tokens, or secrets are visible in app
  UI.

Authenticated Billing mobile:

- Repeat `/billing` at a narrow mobile viewport around `375px`.
- Confirm no horizontal overflow, clipped plan cards, overlapping text, or
  trapped controls.

Checkout-return copy:

- Visit `/billing?success=1` while authenticated.
- Confirm the success copy says Checkout returned and Station reflects the plan
  after verified server subscription state updates.
- It must not claim subscription activation merely because the browser returned
  from Checkout.

Safety:

- Do not click Upgrade, Activate, Checkout, top-up Buy, or
  `Manage / cancel subscription`.
- Do not create Checkout sessions.
- Do not open Billing Portal.
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
docs/roadmap/PR347_UX07_AUTHENTICATED_BILLING_HOSTED_RECHECK_RESULT.md
```

Use one verdict:

```text
PASS
PASS WITH CAVEAT
FAIL
BLOCKED
```

Include:

- login/session result without secrets;
- `/billing` desktop result;
- `/billing` mobile result;
- `/billing?success=1` copy result;
- Stripe/privacy safety result;
- caveats or defects;
- whether MIMIR can close the authenticated Billing display proof or should wake
  DAEDALUS with a repair packet.
