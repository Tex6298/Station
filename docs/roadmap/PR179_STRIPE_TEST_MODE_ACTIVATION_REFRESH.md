# PR179 - Stripe Test-Mode Activation Refresh

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS runs the backend/product proof.
Reviewer: ARGUS reviews entitlement mutation, webhook trust, overclaim risk,
and sanitized evidence.
Rehearsal: ARIADNE only if the visible hosted return/banner or Billing page
journey needs human-eye proof after DAEDALUS confirms backend activation.
Status: closed by MIMIR via PR181 clean-account proof

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

## DAEDALUS Blocked Result - 2026-06-23

DAEDALUS did not create a new Checkout Session or attempt a hosted payment.
Current hosted state makes a fresh activation proof unsafe: the replay owner is
already active, and the Stripe test customer already has more than one active
Station-price subscription.

Sanitized hosted checks:

| Probe | Result | Notes |
| --- | --- | --- |
| API deployment identity | Pass | `https://stationapi-production.up.railway.app/health/deployment` returned HTTP 200, `ok:true`, `ready:true`, branch `main`, service `@station/api`, served commit prefix `b10eb8b9b8e0`. |
| Web health | Pass | `https://stationweb-production.up.railway.app/health` returned HTTP 200 with `ok:true`. |
| Stripe readiness | Pass | Hosted deployment readiness reports Stripe billing secrets true and all configured subscription Price IDs true. |
| Replay owner sign-in | Pass | HTTP 200; token captured in memory only and not printed. |
| `/billing/me` before any PR179 checkout | Pass, already active | HTTP 200; tier `canon`, subscription status `active`, customer present, subscription present. |
| `/auth/me` | Pass | HTTP 200; tier `canon`, admin false, email present. |
| Stripe test subscription lookup | Blocked for fresh activation | Stripe test API lookup succeeded without printing identifiers. It found `2` active/trialing subscriptions for the replay customer, and `2` active Station-price matches. |
| Stripe CLI | Unavailable | `stripe` CLI is not installed in this shell. |

Reason PR179 cannot honestly complete the acceptance target yet:

- The replay owner is already active before PR179 creates any Checkout Session.
- Creating or completing another Checkout Session could add a third active
  subscription instead of proving a clean inactive-to-active mutation.
- Resetting/canceling Stripe subscriptions, choosing a new proof account, or
  changing checkout behavior are separate decisions. DAEDALUS did not perform
  them inside this proof lane.

Observed repo safety gap:

- The API Checkout service currently creates a subscription-mode Checkout
  Session for the requested paid tier after customer lookup. It does not first
  block an already-active profile/customer from opening another subscription
  Checkout. The web Billing UI avoids active same-tier checkout, but the API
  surface is still callable directly.

Recommended next decision:

1. Reconcile the duplicate Stripe test subscriptions externally and rerun a
   clean hosted activation proof on the replay owner; or
2. Approve a dedicated fresh proof account for PR179; or
3. Open a narrow billing safety patch to block subscription Checkout creation
   when Station already records an active/trialing subscription, then let ARGUS
   review the behavior change.

Validation run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
git diff --check
```

Results:

- `test:billing` passed: 9 tests.
- `test:token-credits` passed: 3 tests.
- `git diff --check` passed with CRLF normalization warnings only.

Sanitization:

- No Stripe secrets, Checkout URLs or paths, webhook payloads, customer IDs,
  subscription IDs, owner IDs, tokens, cookies, payment details, private
  excerpts, prompts, completions, raw API response bodies, or raw Stripe
  response bodies were printed or committed.

Next baton: wake MIMIR because PR179 is blocked before proof and no code
behavior changed.

## MIMIR Closeout - 2026-06-23

MIMIR closes PR179 after the safe proof route split:

- PR179 correctly blocked on the dirty replay owner because that account was
  already `canon/active` and had duplicate active/trialing Stripe test
  subscriptions.
- PR180 closed the direct API safety gap by blocking active/trialing
  subscription Checkout attempts before Stripe side effects.
- PR181 proved clean inactive-to-active Stripe test-mode activation on a
  generated non-production clean account, reviewed and accepted by ARGUS.

PR179's acceptance target should now be read through PR181, not through the
dirty replay owner. No further Stripe implementation baton is active from this
thread.
