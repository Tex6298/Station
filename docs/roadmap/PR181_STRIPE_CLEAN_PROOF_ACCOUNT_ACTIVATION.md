# PR181 - Stripe Clean Proof Account Activation

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS runs the clean-account Stripe test-mode proof.
Reviewer: ARGUS reviews entitlement mutation, webhook trust, overclaim risk,
and sanitized evidence if proof completes or code changes are made.
Rehearsal: ARIADNE only if the visible hosted return/banner or Billing page
journey needs human-eye proof after backend activation is confirmed.
Status: open for DAEDALUS

## Why This Lane

PR179 could not prove clean inactive-to-active Stripe activation because the
replay owner was already `canon/active` and its Stripe test customer already
had multiple active/trialing Station-price subscriptions.

PR180 fixed the API safety gap by blocking duplicate subscription Checkout for
recorded active/trialing profiles.

PR181 now attempts the Stripe proof on a dedicated clean account instead of
mutating or cleaning the dirty replay owner.

## Scope

DAEDALUS should use the narrowest safe proof path:

1. Confirm hosted API/web deployment identity and billing readiness.
2. Create or use a dedicated non-production proof account with no existing
   Stripe customer/subscription state.
3. Keep proof credentials, auth tokens, cookies, owner IDs, and Stripe IDs in
   process memory only.
4. Read `/billing/me` before activation and record only sanitized tier/status
   labels.
5. Create a Stripe test-mode subscription Checkout Session through the
   authenticated API.
6. Complete hosted Checkout in test mode if the agent can do so safely with the
   configured local test-card value.
7. If browser Checkout completion is not safely available, use a real signed
   Stripe test event path only if configured and available; otherwise document
   the exact blocker.
8. Re-read `/billing/me`, `/auth/me`, and optionally Billing page state after
   webhook processing.
9. Confirm entitlement mutation came from verified webhook-backed subscription
   state, not Checkout Session creation alone.

## Boundaries

Do not:

- cancel, reset, or mutate the dirty replay owner's existing Stripe
  subscriptions;
- use live-money mode;
- print or commit proof credentials, auth tokens, cookies, owner IDs, Stripe
  customer IDs, subscription IDs, Checkout URLs or paths, webhook payloads,
  payment details, private excerpts, prompts, completions, or raw responses;
- redesign Billing UI;
- change pricing, tiers, token top-ups, invoices, tax, Connect, marketplaces,
  usage metering, Customer Portal semantics, Redis, Cloudflare, providers,
  workers, queues, Developer Agent, or replay retrieval behavior;
- claim production billing readiness.

## Required Evidence

Record only sanitized:

- deployment health/readiness booleans and served commit prefix;
- before/after billing tier and subscription status labels;
- customer/subscription presence booleans, not identifiers;
- Checkout Session creation status and hosted Checkout host only;
- webhook/entitlement mutation result as a yes/no and event class;
- Billing page or portal availability if safely checked;
- validation commands run.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
git diff --check
```

If code changes are made, run the relevant package typecheck/build.

## Expected Output

DAEDALUS should update:

- this file;
- `docs/roadmap/ACTIVE_STATUS.md`;
- `docs/testing/VALIDATION_BASELINE.md` if validation truth changes.

Then:

- wake ARGUS if proof completes or code changes are made;
- wake MIMIR if blocked before proof with no code changes.
