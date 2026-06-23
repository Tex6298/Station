# PR180 - Active Subscription Checkout Guard

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS implements the narrow billing safety patch.
Reviewer: ARGUS reviews entitlement/security behavior and overclaim risk.
Rehearsal: ARIADNE not needed unless visible Billing UI changes.
Status: closed by MIMIR after ARGUS acceptance

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

## DAEDALUS Implementation - 2026-06-23

DAEDALUS implemented the narrow API safety guard.

Changed files:

- `apps/api/src/services/billing.service.ts`
- `apps/api/src/controllers/billing.controller.ts`
- `apps/api/src/routes/billing.test.ts`
- `docs/roadmap/PR180_ACTIVE_SUBSCRIPTION_CHECKOUT_GUARD.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Behavior:

- `createCheckoutSession` now loads the requesting user's recorded
  `stripe_subscription_id` and `subscription_status` before creating or
  reusing a Stripe customer and before calling
  `stripe.checkout.sessions.create`.
- If Station records a `stripe_subscription_id` with `subscription_status` of
  `active` or `trialing`, Checkout creation fails closed with
  `ActiveSubscriptionCheckoutBlockedError`.
- `POST /billing/checkout` maps that error to HTTP `409` with a safe,
  actionable message telling the user to use the Customer Portal.
- Inactive/no-subscription paid-tier activation still creates Checkout.
- Customer Portal behavior remains available for active subscribers.

Focused test proof:

- Active and trialing profile fixtures receive HTTP `409`.
- The blocked response does not expose fake customer/subscription ids.
- Blocked active/trialing profiles do not call
  `stripe.checkout.sessions.create`.
- The guard runs before customer creation/reuse side effects in the fake
  Stripe client.
- Customer Portal still returns a session for the active subscriber fixture.
- The existing inactive Checkout creation test still passes and proves server
  pricing/metadata behavior.

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
git diff --check
```

Results:

- `test:billing` passed: 10 tests.
- `test:token-credits` passed: 3 tests.
- `@station/api typecheck` passed.
- `@station/api build` passed.
- `git diff --check` passed with CRLF normalization warnings only.

Additional attempted check:

- `npm exec --yes pnpm@10.32.1 -- run typecheck` failed before TypeScript ran
  because local Turbo on Windows could not spawn
  `turbo-windows-64\bin\turbo.exe` and returned `spawnSync ... UNKNOWN`.
  The narrower API typecheck/build above passed for the changed code path.

No hosted Checkout, webhook send, Stripe cancellation/reset, proof-account
creation, billing UI redesign, pricing change, token-topup change, Stripe
identifier/secret logging, or raw response logging was performed.

Next baton: wake ARGUS for entitlement/security review.

## ARGUS Review Addendum - 2026-06-23

ARGUS found one fail-open edge: if the local profile subscription-state lookup
failed, Checkout could continue because the active/trialing guard had no state
to evaluate. ARGUS patched the route to fail closed with HTTP `503` before
Stripe customer lookup or Checkout Session creation when Station cannot verify
the current billing subscription state.

Additional validation:

- `npm exec --yes pnpm@10.32.1 -- run test:billing` passed: 11 tests,
  including the new unverifiable-subscription-state fail-closed case.
- `npm exec --yes pnpm@10.32.1 -- run test:token-credits` passed: 3 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` passed.

## MIMIR Closeout - 2026-06-23

MIMIR accepts PR180 after ARGUS review.

Closeout decision:

- PR180 closes the direct API duplicate-subscription Checkout safety gap.
- PR179 remains blocked on the replay owner because that account already has
  active billing state and duplicate active/trialing Stripe test subscriptions.
- Do not cancel/reset Stripe test subscriptions from Codex.
- MIMIR opens PR181 for a dedicated clean hosted proof account rather than
  using the dirty replay owner.
