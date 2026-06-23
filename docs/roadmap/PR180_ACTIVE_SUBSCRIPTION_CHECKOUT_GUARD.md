# PR180 - Active Subscription Checkout Guard

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS implements the narrow billing safety patch.
Reviewer: ARGUS reviews entitlement/security behavior and overclaim risk.
Rehearsal: ARIADNE not needed unless visible Billing UI changes.
Status: open for DAEDALUS

## Why This Lane

PR179 was blocked before proof. The hosted replay owner already reads
`canon/active` with customer and subscription present, and Stripe test lookup
found multiple active/trialing Station-price subscriptions for that customer.

DAEDALUS did not create another Checkout Session because that could add another
active subscription instead of proving a clean inactive-to-active mutation.

The important repo safety gap is smaller and concrete:

- the web Billing UI avoids active same-tier Checkout;
- the API Checkout service can still be called directly and creates a
  subscription-mode Checkout Session after customer lookup;
- it does not first block a profile that Station already records as
  active/trialing.

PR180 fixes that API safety gap before any further hosted Stripe proof.

## Scope

Patch the billing API/service so subscription Checkout creation fails closed
when Station already records an active or trialing subscription for the
requesting user.

Expected behavior:

- `POST /billing/checkout` still creates Checkout for inactive/no-subscription
  paid-tier activation.
- `POST /billing/checkout` rejects an already active/trialing subscription
  profile before calling `stripe.checkout.sessions.create`.
- The rejection response is safe, actionable, and does not expose customer IDs,
  subscription IDs, raw Stripe responses, or profile internals.
- Existing Customer Portal behavior remains available for active subscribers.
- Web Billing helper behavior should remain unchanged unless DAEDALUS finds a
  visible mismatch.

## Candidate Implementation Shape

DAEDALUS should inspect current code before editing, but the likely target is:

- `apps/api/src/services/billing.service.ts`
- `apps/api/src/controllers/billing.controller.ts` only if response
  classification needs to become clearer
- `apps/api/src/routes/billing.test.ts`

Suggested guard:

- load the user's profile/subscription state before creating Checkout;
- treat `subscription_status` values `active` and `trialing` with an existing
  `stripe_subscription_id` as blocking subscription Checkout;
- return a typed/specific error that the route maps to a non-500 response;
- assert the Stripe fake records no Checkout Session call in the blocked case.

If current schema/status naming differs, follow the existing billing service
patterns rather than inventing new state.

## Boundaries

Do not:

- cancel or mutate existing Stripe subscriptions;
- create a fresh proof account;
- rerun hosted Checkout;
- send webhook events;
- redesign Billing UI;
- change pricing, tiers, token top-ups, invoices, tax, Connect, marketplaces,
  usage metering, or Customer Portal semantics;
- print or commit Stripe secrets, Checkout URLs, webhook payloads, customer IDs,
  subscription IDs, owner IDs, tokens, cookies, payment details, or raw
  responses.

## Validation

Required:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
git diff --check
```

Add API build/typecheck only if the changed code path requires it by local
project convention.

## Expected Output

DAEDALUS should update:

- this file;
- `docs/roadmap/ACTIVE_STATUS.md`;
- `docs/testing/VALIDATION_BASELINE.md` if validation truth changes.

Then wake ARGUS with:

- changed files;
- exact blocked behavior;
- proof that no Checkout Session is created for active/trialing profiles;
- proof that inactive Checkout still works;
- validation run.

## After PR180

MIMIR should decide whether to:

- rerun PR179 on a dedicated clean proof account;
- close PR179 as blocked by existing active state plus accepted API safety
  guard;
- or ask the user to reconcile duplicate Stripe test subscriptions manually.
