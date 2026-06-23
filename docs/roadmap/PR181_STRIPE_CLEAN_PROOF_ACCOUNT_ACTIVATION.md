# PR181 - Stripe Clean Proof Account Activation

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS runs the clean-account Stripe test-mode proof.
Reviewer: ARGUS reviews entitlement mutation, webhook trust, overclaim risk,
and sanitized evidence if proof completes or code changes are made.
Rehearsal: ARIADNE only if the visible hosted return/banner or Billing page
journey needs human-eye proof after backend activation is confirmed.
Status: closed by MIMIR after ARGUS acceptance

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

## DAEDALUS Proof Result - 2026-06-23

DAEDALUS completed the clean-account hosted Stripe test-mode activation proof
without touching the dirty replay owner's subscriptions.

Method:

- Used a generated non-production proof account with credentials held in
  process memory only.
- Used a temporary local Node/Chrome runner with the cached Playwright module;
  no proof script or screenshot was committed.
- Used the configured local Stripe test-card values without printing payment
  details.
- Did not use live-money mode.

Sanitized hosted evidence:

| Probe | Result | Notes |
| --- | --- | --- |
| API deployment identity | Pass | `https://stationapi-production.up.railway.app/health/deployment` returned HTTP 200, `ok:true`, `ready:true`, branch `main`, service `@station/api`, served commit prefix `be37b1f4ac9a`. |
| Stripe readiness | Pass | Hosted readiness reported Stripe ready and Canon monthly Price configured. |
| Proof account signup | Pass | HTTP 201; access token captured in memory only; initial tier `visitor`. |
| Billing before activation | Pass, clean | HTTP 200; tier `visitor`, subscription status `inactive`, no customer present, no subscription present. |
| Checkout Session creation | Pass | HTTP 200; hosted Checkout URL present; host `checkout.stripe.com`; full URL/path not printed. |
| Billing after Checkout creation only | Pass, no entitlement mutation | HTTP 200; tier `visitor`, subscription status `inactive`, customer present, no subscription present. |
| Hosted Checkout completion | Pass | Chrome headless loaded `checkout.stripe.com`, filled card/expiry/CVC/name fields, submitted, and returned to Station. Postal field was not present or not required in the rendered flow. |
| Billing after hosted Checkout | Pass, activated | HTTP 200; tier `canon`, subscription status `active`, customer present, subscription present. |
| `/auth/me` after hosted Checkout | Pass | HTTP 200; tier `canon`, admin false, email present. |
| Stripe event-class lookup | Pass | Stripe test event lookup found `checkout.session.completed` and `customer.subscription.created` for the proof subscription. `customer.subscription.updated` was not required for this activation. |

Proof conclusion:

- Checkout Session creation alone did not grant entitlement.
- Entitlement changed only after hosted Checkout completed and Stripe
  webhook-backed subscription state was available.
- Station now reads the clean proof account as Canon with an active
  subscription.

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
git diff --check
```

Results:

- `test:billing` passed: 11 tests.
- `test:token-credits` passed: 3 tests.
- `git diff --check` passed.

Sanitization:

- No proof credentials, auth tokens, cookies, owner IDs, Stripe customer IDs,
  subscription IDs, Checkout URLs or paths, webhook payloads, payment details,
  private excerpts, prompts, completions, or raw API/Stripe responses were
  printed or committed.

No code, Billing UI, pricing, tiers, token top-ups, invoices, tax, Connect,
marketplaces, usage metering, Customer Portal semantics, Redis, Cloudflare,
providers, workers, queues, Developer Agent, replay retrieval, or dirty replay
owner Stripe state changed.

Next baton: wake ARGUS for entitlement mutation, webhook trust, overclaim, and
sanitization review.

## ARGUS Review - 2026-06-23

ARGUS accepted PR181 after reviewing the clean Stripe test-mode activation
proof.

Verdict:

- Proof used a generated non-production clean account.
- The dirty replay-owner Stripe state was not touched.
- Checkout creation alone left entitlement at tier `visitor`, subscription
  status `inactive`.
- Hosted test-mode Checkout completion plus webhook-backed subscription state
  produced tier `canon`, subscription status `active`.
- `/auth/me` read the activated account as tier `canon`.
- Stripe event-class evidence matched `checkout.session.completed` and
  `customer.subscription.created`.
- No proof credentials, tokens, cookies, owner IDs, Stripe IDs, Checkout
  URLs/paths, webhook payloads, payment details, private excerpts, prompts,
  completions, or raw responses were committed.

ARGUS validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
git diff --check
git diff --cached --check
```

Results:

- `test:billing` passed: 11 tests.
- `test:token-credits` passed: 3 tests.
- `git diff --check` passed with only ARGUS-state CRLF warning noted.
- `git diff --cached --check` passed.
- Targeted Stripe/proof leak scan was clean.
- Diff credential-pattern scan was clean.

No code, Billing UI, pricing, tier, token-topup, invoice, tax, Connect,
marketplace, usage-metering, Customer Portal, Redis, Cloudflare, provider,
worker, queue, Developer Agent, replay retrieval, or dirty-owner Stripe state
changed.

## MIMIR Closeout - 2026-06-23

MIMIR accepts ARGUS's verdict and closes PR181. PR179's original replay-owner
proof remains correctly blocked by existing active billing state, but the
clean-account route proves the intended inactive-to-active Stripe test-mode
activation behavior without touching the dirty replay owner.

Current baton: no active Stripe implementation baton; MIMIR returns to
foreground watch.
