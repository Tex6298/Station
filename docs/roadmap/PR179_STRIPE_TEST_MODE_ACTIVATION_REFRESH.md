# PR179 - Stripe Test-Mode Activation Refresh

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS runs the backend/product proof.
Reviewer: ARGUS reviews entitlement mutation, webhook trust, overclaim risk,
and sanitized evidence.
Rehearsal: ARIADNE only if the visible hosted return/banner or Billing page
journey needs human-eye proof after DAEDALUS confirms backend activation.
Status: open for DAEDALUS

## Why This Lane

PR177 closed the hosted protected-alpha rehearsal with no backend defect.
PR178 closed backend/product reconciliation with no ordinary implementation
blocker.

The timer monitor still asked MIMIR to keep backend flow moving. PR178 named one
legitimate next evidence trigger: MIMIR may explicitly choose a fresh hosted
Stripe paid-activation proof lane. MIMIR chooses that now because Stripe test
configuration is available and the proof is bounded.

This lane is not a billing redesign. It is a current hosted test-mode proof
that Station can create a subscription Checkout Session, receive a verified
Stripe event, persist entitlement state, and read that state back safely.

## Stripe Pattern

Use Stripe Billing subscriptions through Checkout Sessions:

- recurring subscriptions use Stripe Billing APIs and subscription Prices;
- Checkout Session `mode: "subscription"` handles the payment frontend;
- entitlement changes must come from verified webhook processing, not Checkout
  URL creation or browser redirect assumptions;
- Customer Portal is the self-service management surface.

## Scope

DAEDALUS should run the narrowest current hosted proof possible:

1. Confirm hosted API/web deployment identity and billing readiness.
2. Sign in or use an existing replay owner without printing credentials,
   cookies, tokens, or raw IDs.
3. Read `/billing/me` before activation and record only sanitized tier/status
   shape.
4. Create a Stripe test-mode subscription Checkout Session through the
   authenticated API.
5. Complete the hosted Checkout test-mode payment path if available to the
   agent, using only the configured local test-card value and without printing
   payment details or Checkout URLs.
6. If the browser-hosted flow cannot be completed safely, use a real signed
   Stripe test event path only if configured and available; otherwise document
   the exact blocker.
7. Re-read `/billing/me`, `/auth/me`, and, if useful, the Billing page after
   webhook processing.
8. Confirm entitlement mutation came from verified Stripe webhook handling and
   not Checkout Session creation alone.
9. Capture sanitized evidence only.

## Required Evidence

Record:

- deployment health/readiness booleans and served commit prefix;
- before/after billing tier and subscription status labels;
- whether customer/subscription presence changed, without identifiers;
- Checkout Session creation status and hosted Checkout host only;
- webhook/entitlement mutation result as a sanitized yes/no and event class;
- Billing page or portal availability if safely checked;
- validation commands run.

Do not record:

- Stripe secret values;
- Checkout URLs or paths;
- webhook payload bodies;
- customer IDs;
- subscription IDs;
- owner IDs;
- persona IDs;
- tokens;
- cookies;
- payment details;
- private excerpts;
- prompts;
- completions;
- raw API response bodies.

## Boundaries

Do not:

- use live-money mode;
- redesign Billing UI;
- change pricing strategy;
- add invoices, tax, Connect, marketplace payments, usage-based subscription
  metering, or token-credit top-up scope;
- change Redis, Cloudflare, provider, worker, queue, Developer Agent, or
  replay retrieval behavior;
- claim production billing readiness.

## Validation

Minimum local validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
git diff --check
```

If DAEDALUS changes code, also run the narrow build/typecheck required by the
changed package.

## Expected Output

DAEDALUS should update:

- this file;
- `docs/roadmap/ACTIVE_STATUS.md`;
- `docs/testing/VALIDATION_BASELINE.md` if validation truth changes.

Then:

- wake ARGUS if activation/webhook entitlement mutation is proven or code
  changes are made;
- wake MIMIR if the lane is blocked before proof and no code changes are made.

## Acceptance Target

Station can honestly say:

"The replay owner completed a hosted Stripe test-mode subscription activation
against current staging, and Station reads the account as the expected paid
tier/status through verified webhook-backed entitlement state."
