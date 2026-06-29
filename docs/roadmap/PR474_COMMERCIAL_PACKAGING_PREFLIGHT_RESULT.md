# PR474 - Commercial Packaging Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Status: ACCEPT_FOR_DAEDALUS

## Verdict

ARGUS accepts the smallest commercial packaging slice as:

```text
PR474A - Developer Space Commercial Packaging Readback
```

This is a customer-facing readback and upgrade-path clarity slice. It is not a
Stripe rebuild, not a live-money proof, not a pricing-strategy lane, and not a
new billing architecture lane.

## Why Developer Spaces

Developer Spaces are the safest first attachment point:

- the public Developer Space surface is already a customer-facing capability;
- Developer Space Tier 1 protected-alpha evidence already exists;
- Developer Space creation is already Canon / Developer gated in the API;
- tier limits already say Canon includes one Developer Space;
- `/billing` already exposes paid plan cards and server-authoritative
  subscription state;
- PR181 already proved Stripe test-mode subscription activation through
  Checkout and verified webhook-backed entitlement mutation.

Rejected first attachments:

- Settings/Billing only: safe, but it is not enough of a customer-facing
  capability package by itself.
- Public Projects/research pages: useful later, but the current tiered upgrade
  boundary is less direct than Developer Spaces.
- Public persona capabilities: too close to the just-closed encounter/provider
  policy lane and easier to overclaim.

## Existing Evidence

Repo evidence inspected:

- `docs/roadmap/PR181_STRIPE_CLEAN_PROOF_ACCOUNT_ACTIVATION.md`
- `docs/roadmap/BILLING_UX_BROWSER_ARIADNE.md`
- `docs/roadmap/DEVELOPER_SPACE_TIER1_CLOSEOUT_AUDIT.md`
- `docs/roadmap/DEVELOPER_SPACE_PARTNER_READINESS_MAP.md`
- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`
- `apps/api/src/services/billing.service.ts`
- `apps/api/src/controllers/billing.controller.ts`
- `apps/api/src/routes/billing.ts`
- `apps/api/src/routes/billing.test.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/web/app/billing/page.tsx`
- `apps/web/app/(marketing)/pricing/page.tsx`
- `apps/web/app/developer-spaces/page.tsx`
- `apps/web/lib/billing-plan-actions.ts`
- `apps/web/lib/billing-plan-actions.test.ts`
- `apps/web/lib/billing-tier-display.ts`
- `apps/web/lib/billing-tier-display.test.ts`
- `packages/config/src/tiers.ts`

Stripe boundary reading:

- recurring subscriptions should remain on Stripe Billing plus Checkout
  Sessions in `subscription` mode;
- self-service management should remain through Stripe Customer Portal;
- Stripe Prices remain the configured integration unit, not deprecated Plan
  objects;
- no manual renewal loop or raw PaymentIntent subscription flow is accepted.

## Accepted PR474A Scope

DAEDALUS may implement a narrow web/readback slice:

- Add customer-facing Developer Space packaging copy that says Developer Spaces
  are a Canon / Developer tier capability.
- Point upgrade or management action back to Station `/billing`, not directly
  to raw Checkout or Portal URLs from the Developer Space page.
- Reuse existing tier/price/limit helpers from `billing-tier-display` and
  `billing-plan-actions`; do not duplicate pricing constants.
- Keep the copy honest that Stripe handoff is test-mode in this build and that
  Station reflects plan changes only after verified server subscription state.
- Keep Developer Spaces framed as Tier 1 showcase/observatory/readback for a
  self-hosted runtime, not Station-hosted app infrastructure.
- Preserve existing Developer Space creation entitlement logic and PR181
  activation proof.

Suggested implementation shape:

- Add a small helper/test for Developer Space commercial packaging readback, or
  extend the existing Developer Space web helper tests if that fits local
  patterns better.
- Update `/developer-spaces` signed-out and signed-in copy so visitors and
  owners can understand that Canon / Developer is the plan boundary for
  creating a Developer Space.
- Add a bounded `/billing` link or existing Station route action; do not create
  a new checkout call site from Developer Spaces.
- If an API error copy path is touched, keep it bounded and free of Stripe
  object ids, customer ids, subscription ids, Checkout URLs, Portal URLs, cards,
  hosted logs, SQL output, and secrets.

## Non-Scope

PR474A must not add or change:

- Stripe Checkout, Customer Portal, webhook, customer binding, entitlement
  mutation, Price selection, product config, tax, invoices, coupons, Connect,
  marketplace payments, usage billing, trials, plan architecture, or live-money
  claims;
- schema, migrations, storage, Redis, Cloudflare, queues, workers, hosted
  runtime, provider policy, or Developer Space hosted infrastructure;
- raw Stripe object ids, Checkout URLs, Portal URLs, customer ids,
  subscription ids, payment cards, webhook payloads, hosted logs, SQL output,
  secrets, auth tokens, cookies, or private owner data in docs/UI/tests.

## Required DAEDALUS Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If DAEDALUS adds a new helper test, wire it into the closest focused script or
run it explicitly and document the command. If web component layout changes
materially, also run `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`.

DAEDALUS should also run a diff-only sensitive-pattern scan and classify any
matches. Expected matches are words such as Stripe, token, subscription, or
test-mode only; secret values, Stripe object ids, Checkout/Portal URLs, hosted
logs, SQL output, and payment details are not acceptable.

## Hosted ARIADNE Rehearsal

If MIMIR routes ARIADNE after ARGUS review, the rehearsal should be read-only:

- desktop and 390px mobile `/developer-spaces` signed-out readback;
- signed-in owner `/developer-spaces` readback if an existing test account is
  available without mutating Stripe or creating a Developer Space;
- `/billing` visible plan/readback comparison only;
- no click into Checkout, Portal, top-up purchase, subscription mutation, or
  Stripe dashboard unless MIMIR opens a separate test-mode mutation proof.

ARIADNE should verify:

- Developer Spaces read as a Canon / Developer tier capability, not a live
  hosted-infrastructure product;
- upgrade/management routes stay inside Station until `/billing`;
- no Checkout URLs, Portal URLs, Stripe object ids, customer ids, subscription
  ids, card details, webhook payloads, hosted logs, raw ids, credentials, or
  live-money claims appear;
- mobile layout has no horizontal overflow, clipped controls, overlapping
  labels, or hidden route affordances.

## ARGUS Validation

Docs-only preflight validation:

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence inspection | Pass | Billing, Pricing, Developer Space, tier config, PR181 proof, Billing UX review, and Developer Space Tier 1 docs inspected. |
| Stripe best-practices check | Pass | Subscriptions stay on Billing APIs plus Checkout Sessions; Customer Portal remains the management surface; Prices remain the unit. |
| `git diff --check` | Pass | Docs-only whitespace check. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Handoff

Wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
```

Task:

- Implement `PR474A - Developer Space Commercial Packaging Readback` exactly as
  scoped above.
- Keep Stripe test-mode/subscription Checkout and Customer Portal boundaries;
  do not change billing architecture.
