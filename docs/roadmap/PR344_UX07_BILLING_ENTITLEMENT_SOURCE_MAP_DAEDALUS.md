# PR344 - UX-07 Billing Entitlement Source Map

Owner: DAEDALUS

Date: 2026-06-26

Status: Accepted by ARGUS

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- PR343 passed hosted desktop/mobile Developer Space observatory proof.
- UX-06 deployed observatory clarity is closed for this slice.
- MIMIR is moving to UX-07 Billing and entitlement clarity.
Task:
- Map billing status data, quota data, tier config, Stripe handoff, and frontend state sources.
- Identify the smallest safe implementation slice for PR345.
- If one obvious low-risk docs/copy/test-only patch is safe, implement it and wake ARGUS.
- Otherwise wake MIMIR with the exact PR345 recommendation.
```

## Product Intent

Billing and entitlement should be transparent, calm, and server-authoritative.
Users should understand what tier they are on, what limits apply, what Stripe
actions do, and what does not change until a verified webhook or server state
changes.

This is not a broad billing-platform lane. It is a source-map lane before
visible billing changes.

## Scope

Map current sources for:

- billing status and subscription state;
- profile tier and entitlement state;
- tier limits and quota copy;
- token-credit or top-up state if visible;
- Stripe Checkout and Billing Portal handoff;
- same-tier inactive subscription behavior;
- lower-tier card behavior for higher-tier users;
- server-authoritative limit displays in Billing, Settings, Studio sidebars,
  storage/quota panels, and Developer Space usage if relevant.

Primary files to inspect:

- `apps/web/app/billing/page.tsx`
- `apps/web/app/settings/page.tsx`
- `apps/api/src/routes/billing.ts`
- `packages/config/src/tiers.ts`
- `packages/auth/src/permissions.ts`
- billing tests and any active docs that mention Stripe or entitlement state

Follow references as needed, but keep the result bounded.

## Known Context

Stripe config is test-mode for this staging lane. Do not treat it as live-money
or production billing readiness.

Previous proof established that Checkout creation alone does not grant
entitlement; entitlement comes from verified server/webhook state.

Existing UX caveats to check:

- same-tier inactive users may need a clearer activation path;
- higher-tier users may still see lower-tier `Upgrade` copy;
- quota and tier limits must stay server-authoritative;
- test-mode checkout/portal handoff should not expose Stripe URLs, customer
  identifiers, payment details, cookies, or secrets in docs.

## Non-Scope

Do not:

- run live-money billing;
- create new Stripe products or prices;
- print or commit Stripe URLs, customer IDs, payment IDs, subscription IDs,
  tokens, cookies, or secrets;
- mutate hosted billing state unless a later ARIADNE/ARGUS proof explicitly
  requires a test-mode route;
- change schema or migrations;
- change webhook security;
- change entitlement enforcement;
- add tax, invoices, Connect, marketplace payments, tips, usage billing, or
  production billing claims;
- broaden into Redis, Cloudflare, provider/model, onboarding, or broad visual
  redesign.

## Expected Result

Create:

```text
docs/roadmap/PR344_UX07_BILLING_ENTITLEMENT_SOURCE_MAP_RESULT.md
```

Include:

- source map by route/API/config/test;
- current visible billing/entitlement states;
- known risks and stale docs if found;
- recommendation for the next smallest safe implementation lane;
- whether a code patch landed;
- validation run or explicit reason no validation was needed.

If code changes land, wake ARGUS with the result and exact validation.

If no code changes land, wake MIMIR with the result and the exact PR345 packet
you recommend opening.
