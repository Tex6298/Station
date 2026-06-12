# Billing UX browser review - ARIADNE

Date: 2026-06-12

Owner: ARIADNE, A4 UX Navigator

## Verdict

Accept `BILLING-UX-01` for the staging human rehearsal.

The patch fixes the demo-blocking UX friction from `STAGING-DEMO-STRIPE-01`:
same-tier inactive paid plans now present a visible activation action instead
of a dead disabled `Current plan` card.

No code or security blocker surfaced in ARIADNE's browser pass.

## Scope Reviewed

This was a browser UX review, not a new billing integration review.

Reviewed:

- visible inactive same-tier activation posture;
- hosted return/success-banner posture;
- active current-plan and portal behavior;
- mobile width for active and inactive billing states;
- visible errors and obvious next action.

Not reviewed:

- live-money billing;
- production billing readiness;
- Stripe webhook internals beyond ARGUS's accepted review;
- invoices, tax, Connect, marketplace payments, or usage billing;
- broad billing information architecture.

## Browser Method

Surfaces:

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Browser: local Chrome headless through Chrome DevTools Protocol.

Modes:

- Real active replay owner: used the staging replay owner after the accepted
  Stripe test-mode activation proof.
- Inactive same-tier state: used a browser-only mocked `/billing/me` response
  with tier `canon` and subscription `inactive`. This avoided creating another
  real Checkout session or mutating backend entitlement state.

No screenshots were saved. No Checkout URLs, portal URLs, Stripe IDs, customer
IDs, subscription IDs, owner IDs, persona IDs, tokens, cookies, credentials,
payment details, private excerpts, prompts, completions, webhook bodies, or raw
response bodies were committed.

## Results

| Browser check | Result | Sanitized evidence |
| --- | --- | --- |
| Real active `/billing?success=1` | Pass | Success parameter present; success banner visible; `Canon / Developer` and `active` visible; no inactive label; no visible error. |
| Active current-plan card | Pass | Canon card stayed disabled as `Current plan`; no `Activate Canon` action appeared for the active subscription. |
| Active portal action | Pass | `Manage / cancel subscription` was visible and opened Stripe Billing Portal host; no visible app error. |
| Inactive same-tier top action | Pass | Mocked inactive Canon status showed `Activate Canon / Developer`; no portal action appeared. |
| Inactive same-tier plan card | Pass | Mocked inactive Canon status showed `Activate Canon`; no disabled Canon `Current plan` button appeared. |
| Inactive activation navigation | Pass for UX posture | Clicking the activation action left Station for a Stripe-owned host using the mocked Checkout response; no app error was visible. |
| Mobile active billing | Pass | 390px viewport had no horizontal overflow; success/current/portal posture remained visible. |
| Mobile inactive billing | Pass | 390px viewport had no horizontal overflow; activation action remained visible. |

## UX Notes

Success-banner posture:

- The success message is clear enough for the rehearsal:
  `Subscription activated. Welcome to Canon / Developer!`
- It should still be framed as Stripe test-mode evidence, not live-money or
  production billing readiness.

Activation posture:

- The top current-plan panel now gives the clearest next action for the exact
  replay-owner problem: `Activate Canon / Developer`.
- The Canon plan card also shows `Activate Canon`.
- This is legible enough for a human demo and avoids the previous dead-end.

Active/trialing posture:

- Active users keep the expected `Manage / cancel subscription` portal action.
- Active same-tier plan cards stay disabled as `Current plan`.

Residual friction:

- A Canon user can still see lower-tier cards with `Upgrade` copy. That is not a
  blocker for this rehearsal, but a later billing IA/copy lane should decide how
  lower-tier plan cards behave for higher-tier users.

## Human Rehearsal Guidance

For the staging human rehearsal:

- It is safe to include billing as a bounded Stripe test-mode proof after the
  ARGUS-accepted entitlement review.
- Narrate the Billing page as entitlement/status visibility, not as a broad
  billing platform.
- Do not show or read Stripe URLs, IDs, payment details, portal URLs, webhook
  payloads, tokens, cookies, or credentials.
- If the active replay owner is used, show the success banner/current-plan state
  and portal affordance; do not click lower-tier plan buttons.

## Next

Wake MIMIR.

Recommended MIMIR verdict:

- Accept `BILLING-UX-01` for the human staging rehearsal.
- Proceed to `STAGING-DEMO-HUMAN-01` with billing included only as bounded
  Stripe test-mode proof.
- Keep lower-tier billing IA/copy as optional future polish, not a current demo
  blocker.
