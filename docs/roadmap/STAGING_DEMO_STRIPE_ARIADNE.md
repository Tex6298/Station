# Staging demo Stripe proof - ARIADNE

Date: 2026-06-12

Owner: ARIADNE, A4 UX Navigator

## Verdict

`STAGING-DEMO-STRIPE-01` reached paid activation in staging Stripe test mode for
the replay owner.

This is a bounded demo proof only. It does not claim live-money billing,
production readiness, broad billing expansion, usage metering, invoices, tax,
Connect, marketplace payments, or token-credit top-ups.

Because the flow reached active subscription state, ARGUS should verify that the
entitlement change occurred only through the verified Stripe Checkout/webhook
path before MIMIR treats this as accepted demo evidence.

## Sanitization Rules Followed

- No Stripe secret values were printed or committed.
- No Checkout URL or Checkout path was committed.
- No webhook payload body was captured.
- No customer ID, subscription ID, owner ID, persona ID, token, cookie,
  credential, key, private excerpt, prompt, completion, raw response body, or
  replay corpus text was committed.
- No screenshots were saved.
- Browser evidence is summarized only as route host, status labels, tier labels,
  subscription labels, and visible product friction.

## Method

Surfaces:

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Browser: local Chrome headless through Chrome DevTools Protocol.
- Stripe surface: hosted Checkout in test/sandbox mode.

Flow:

1. Signed in as the replay owner through the staging API.
2. Confirmed deployment health was ready and Stripe billing/prices were
   configured.
3. Read `/billing/me` before activation.
4. Inspected the live Billing page with a normal Station browser session.
5. Created a Canon monthly Checkout session through the authenticated API.
6. Opened hosted Stripe Checkout in Chrome.
7. Completed the hosted test-mode card form as far as the browser allowed.
8. Re-read `/billing/me`, `/auth/me`, and the Billing page after activation.

The Canon Checkout session was created through the API rather than by clicking a
visible Canon plan button because the replay owner was already seeded as Canon.
The Billing page therefore marked Canon as "Current plan" while the subscription
status was still inactive. This avoided downgrading the replay owner through a
lower-tier visible button during the proof.

## Sanitized Results

| Probe | Result | Sanitized evidence |
| --- | --- | --- |
| Deployment health | Pass | Ready `true`; Stripe billing `true`; Stripe prices `true`; served SHA prefix `0614fdd06e65`. |
| Replay owner sign-in | Pass | HTTP 200; token kept in memory only. |
| Billing before | Pass, inactive | HTTP 200; tier `canon`; subscription `inactive`; customer present; no subscription present. |
| Billing page before | Pass with UX friction | Page loaded Billing; showed `Canon / Developer` and `inactive`; no error visible; Canon card disabled as `Current plan`. |
| Checkout session create | Pass | HTTP 200; hosted Checkout host was `checkout.stripe.com`; URL not printed or committed. |
| Hosted Checkout page | Pass | Hosted page showed Station/Canon context, card/name/country fields, and a Subscribe action. |
| Hosted Checkout submit | Partial browser return | Test form submitted; headless browser did not capture a clean return to Station before API state changed. |
| Billing after | Pass, active | HTTP 200; tier `canon`; subscription `active`; customer present; subscription present. |
| Auth readback after | Pass | HTTP 200; user tier remained `canon`; admin flag false. |
| Billing page after | Pass | Billing page showed `Canon / Developer` and `active`; no inactive label; no error visible. |

## UX Findings

Same-tier activation friction:

- The replay owner starts as tier `canon` with subscription `inactive`.
- The Billing UI uses tier to mark the Canon card as `Current plan`, so the
  visible Canon Checkout path is disabled even when the subscription is inactive.
- Lower-tier cards remain visible as "Upgrade" actions for a Canon user. A human
  demo should not use those lower-tier buttons to prove Canon activation.

Hosted return friction:

- The headless Checkout run did not observe a clean return to
  `/billing?success=1` before `/billing/me` reported active subscription state.
- The Billing page readback after activation was clean and active.
- A human rehearsal should confirm the visible hosted Checkout return and success
  banner, because this proof primarily validates activation state rather than
  polished return UX.

## Demo Language

Safe claim:

- "The replay owner completed a hosted Stripe test-mode Checkout activation in
  staging, and Station now reads that account as Canon with an active
  subscription."

Do not claim:

- live-money billing;
- production billing readiness;
- broad subscription platform readiness;
- invoices, tax, Connect, marketplace payments, or usage-based billing;
- that the hosted return UX is polished until a human browser rehearsal confirms
  the success redirect.

## Next

Wake ARGUS.

ARGUS should verify:

- entitlement mutation is consistent with the verified Stripe Checkout/webhook
  path;
- no entitlement mutation was inferred from the browser redirect alone;
- the committed evidence stays sanitized;
- the same-tier Billing UI friction is either accepted for demo scope or opened
  as a small UX lane.

ARGUS should wake MIMIR with the closeout verdict.
