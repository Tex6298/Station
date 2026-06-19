# PR74 Billing And Entitlement Clarity - ARIADNE Result

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: accepted

## Scope

ARIADNE rehearsed the visible `/billing` changes against the deployed Railway
runtime.

Runtime checked:

- Web: `80e3bbe2f9e1409d4f30f96d0627d4432c6241d5`
- API: `80e3bbe2f9e1409d4f30f96d0627d4432c6241d5`
- Services: `@station/web`, `@station/api`

No credentials, tokens, cookies, raw Stripe URLs, customer IDs, subscription
IDs, checkout/session IDs, portal URLs, owner IDs, or secret-shaped values were
recorded.

## Live Signed Owner

The live replay-owner account rendered as active Canon on desktop and `390px`
mobile.

Passed checks:

- current-plan panel showed `Canon / Developer`;
- active subscription copy told the owner to use the portal for cancellation or
  subscription changes;
- `Manage / cancel subscription` was visible as an enabled owner action;
- lower-tier Basic and Creator cards were disabled as `Included in current
  plan`;
- the Canon card was disabled as `Current plan`;
- lower-tier cards did not use upgrade-style copy;
- subscription entitlements and token credits were clearly separated;
- no raw Stripe object-shaped values, tokens, or secrets were visible.

The mobile route also checked `/billing?cancelled=1`; the cancellation banner
said the Station plan was not changed and did not frame cancellation as an
error.

## Mocked Browser States

To cover states that are not present on the live replay-owner account without
mutating real billing, ARIADNE used browser-level mocked `/billing/me` responses
inside the rehearsal runner. This did not change backend data and did not call
hosted Stripe Checkout or Portal.

Mocked desktop states passed:

- inactive Basic: `Activate Basic` was enabled, Creator/Canon showed higher-tier
  `Upgrade` checkout copy, and cancelled checkout copy was calm;
- active Creator: Basic was `Included in current plan`, Creator was `Current
  plan`, Canon was a higher-tier `Upgrade`, and portal language remained tied
  to the active current subscription;
- inactive Canon: Basic/Creator were disabled as `Lower-tier option`, Canon was
  enabled as `Activate Canon`, and the lower-tier explanation pointed to the
  Stripe portal for active subscription changes or current-plan reactivation
  when billing is inactive.

## UX Verdict

Pass. PR74 can close.

The billing page now distinguishes active current-plan, inactive current-plan,
lower-tier, higher-tier, checkout, portal, entitlement, and token-credit
language without dark-pattern copy. Controls were either enabled as real owner
actions or disabled with clear explanatory copy. No confusing downgrade action,
raw Stripe identifier, secret-shaped value, live-money claim, production billing
claim, client-only entitlement grant, Redis billing-truth claim, provider scope,
Cloudflare scope, worker scope, parser/OAuth scope, Project/DexOS scope, or
broad UI scope appeared in the rehearsal.

## Validation

- Railway web/API deployment preflight
- Signed Chrome/CDP desktop `/billing` with live active Canon state
- Signed Chrome/CDP `390px` `/billing?cancelled=1` with live active Canon state
- Signed Chrome/CDP desktop `/billing` with mocked inactive Basic state
- Signed Chrome/CDP desktop `/billing` with mocked active Creator state
- Signed Chrome/CDP desktop `/billing` with mocked inactive Canon state
- `node --check scripts/tmp-pr74-billing-rehearsal.mjs`
- `node scripts/tmp-pr74-billing-rehearsal.mjs`
- `git diff --check`

The temporary local rehearsal helper was removed before commit.
