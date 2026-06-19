# PR74 - Billing And Entitlement Clarity

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS first, ARGUS reviews. ARIADNE rehearses any visible route
changes.
Status: accepted by ARIADNE; ready for MIMIR closeout

## Why This Lane

PR71 proved the current runtime has the live config needed for this lane:

- Stripe billing is configured in test mode;
- Basic, Creator, and Canon monthly/yearly price variables are present;
- billing routes and readiness checks pass;
- Redis/Upstash is present as an operational cache layer.

PR72 proved billing can appear in the protected-alpha human rehearsal as a
bounded Stripe test-mode proof. ARIADNE's earlier billing pass accepted the
activation flow but left one product-friction note: higher-tier users can still
see lower-tier cards with upgrade-style copy. `STATION_UI_UX_ROADMAP.md` also
keeps UX-07 open: billing and entitlement clarity.

Stripe integration direction stays conservative: subscriptions use Stripe
Billing plus Checkout Sessions, self-service changes use the Stripe Customer
Portal, and Stripe Prices remain the integration unit. PR74 should improve
clarity around the existing integration, not invent a new billing system.

## Goal

Make billing and entitlement status legible without dark patterns.

A signed-in owner should be able to understand:

- their current plan and subscription status;
- what limits and resources that plan currently grants;
- what usage or quota is relevant now;
- how token credits/top-ups differ from subscription entitlements, if visible;
- what checkout and portal buttons will do before leaving Station;
- what happens when checkout is cancelled, inactive, or unavailable;
- which actions are real and which actions are intentionally unavailable.

## Scope

DAEDALUS should inspect the existing code before choosing the smallest useful
slice:

- `/billing`;
- `/settings`;
- Studio sidebar quota and usage readbacks;
- `apps/web/lib/billing-plan-actions.ts`;
- `apps/web/lib/api-client.ts`;
- `apps/api/src/routes/billing.ts`;
- `apps/api/src/services/billing.service.ts`;
- token-credit routes/services and tests;
- `packages/config/src/tiers.ts`;
- existing billing UX browser notes in
  `docs/roadmap/BILLING_UX_BROWSER_ARIADNE.md`.

Then choose exactly one path:

1. **Small implementation path** if existing routes/state are enough:
   - clarify active current-plan, inactive current-plan, lower-tier, and
     higher-tier plan-card states;
   - remove upgrade-style wording where the action is not actually an upgrade;
   - make current limits and visible quota/credit terms easier to understand;
   - keep checkout and portal handoff copy calm and explicit;
   - make loading, error, success, and cancelled states honest;
   - add focused helper or route tests for changed behavior.
2. **Feasibility-only path** if new status data is required:
   - document the exact missing API/state field;
   - recommend the next bounded implementation lane;
   - do not fake entitlement clarity with client-only guesses.

## Guardrails

- No live-money or production billing readiness claim.
- No new pricing strategy, new tiers, coupons, trials, tax, invoices, Connect,
  marketplace payments, or usage-billing architecture.
- No raw Stripe URLs, object IDs, webhook payloads, cookies, tokens, or secrets
  in committed docs or logs.
- No client-only entitlement grants.
- No Redis/Upstash billing-truth migration, worker queue claim, or cache
  architecture work.
- No provider/model routing, Cloudflare retrieval, parser/OAuth, social
  posting, Project/DexOS, hosted runtime, or broad UI reskin.
- No dark-pattern copy, forced urgency, shame copy, or unclear downgrade/portal
  language.

## Acceptance

ARGUS can accept PR74 if:

- every changed billing control is wired, disabled, hidden, or honestly
  labelled;
- active current-plan, inactive current-plan, lower-tier, and higher-tier states
  are understandable;
- checkout and portal actions still use the existing authenticated server
  routes;
- customer/profile/subscription binding is not weakened;
- entitlement limits remain server-authoritative;
- token credits/top-ups are not conflated with subscription entitlements;
- failure states are visible and non-alarming;
- no secrets or raw Stripe identifiers are committed;
- no Redis, provider, Cloudflare, worker, parser/OAuth, Project/DexOS, hosted
  runtime, or broad UI scope is introduced.

ARIADNE should rehearse if visible billing/settings/sidebar behavior changes,
with special attention to transparent tier language, calm upgrade prompts, and
mobile readability.

## Validation

Run the narrow gates for the path taken:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
npm exec --yes pnpm@10.32.1 -- run test:spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If frontend helper or visible Studio/sidebar behavior changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
```

If web route rendering changes substantially, run the web build and name any
known Windows standalone symlink `EPERM` separately from compile/type results.

## Handoff

DAEDALUS should wake ARGUS with:

- implementation path or feasibility-only path;
- billing/status data sources inspected;
- routes/components changed;
- exact behavior for active, inactive, lower-tier, and higher-tier states;
- token-credit/quota wording changes, if any;
- validation results;
- explicit non-scope confirmation.

If blocked, wake MIMIR with the smallest exact blocker and the recommended next
lane. Do not go silent or go to sleep without waking ARGUS or MIMIR.

## DAEDALUS Implementation

Implemented on 2026-06-19 as the small implementation path. Existing
`/billing/me` status was enough: tier, subscription status, customer binding,
and server-authored limits already give the Billing page enough state to clarify
plan cards without a new API field.

Changed surfaces:

- `/billing`;
- `apps/web/lib/billing-plan-actions.ts`;
- `apps/web/lib/billing-plan-actions.test.ts`;
- root `test:billing` script, so the billing helper coverage runs with the
  API billing route tests.

Behavior by state:

- Active current-plan state: same-tier cards stay disabled as `Current plan`;
  the current-plan panel explains that active/trialing subscriptions should use
  the Stripe portal for cancellation or subscription changes.
- Inactive current-plan state: same-tier cards and the current-plan panel show
  activation copy and still use the existing authenticated Checkout route.
- Lower-tier cards for higher-tier users no longer say `Upgrade`. Active
  higher-tier users see disabled `Included in current plan` copy. Inactive
  higher-tier users see disabled `Lower-tier option` copy that explains the
  lower tier is below the recorded tier.
- Higher-tier cards still use `Upgrade - price/mo` and the existing
  authenticated Checkout route.

Other clarity changes:

- Cancelled Checkout now says the plan was not changed rather than implying an
  error.
- The current-plan panel now explicitly says plan entitlements and token
  credits are separate: subscription tier controls Spaces, Developer Spaces,
  publishing, and storage; token top-ups add model-usage credit without changing
  tier.
- Checkout and portal copy remains calm and explicit. No raw Stripe URLs, object
  IDs, webhook payloads, cookies, tokens, or secrets were recorded.

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
npm exec --yes pnpm@10.32.1 -- run test:spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

`npm exec --yes pnpm@10.32.1 -- --filter @station/web build` compiled,
linted/typechecked, collected page data, and generated 31 static pages, then
failed only during the known local Windows standalone symlink `EPERM`.

## ARGUS Review

Accepted on 2026-06-19 as a narrow billing/entitlement clarity implementation.

- ARGUS confirmed the billing helper only changes client-side copy/control
  choice from existing `/billing/me` fields: tier, subscription status, customer
  binding, and server-authored limits.
- Active current-plan cards are disabled as `Current plan`; inactive same-tier
  cards use the existing authenticated Checkout route; higher-tier cards remain
  Checkout upgrades.
- Lower-tier cards for higher-tier users no longer show upgrade-style copy.
  Active higher-tier users see disabled `Included in current plan`; inactive
  higher-tier users see disabled `Lower-tier option` with portal/reactivation
  caveat.
- Checkout and portal actions still use existing authenticated server routes;
  customer/profile/subscription binding and server-authoritative limits were
  not weakened.
- The page now distinguishes subscription entitlements from token credits
  without claiming live-money or production billing readiness.
- No Stripe architecture, pricing strategy, new tiers, coupons, trials, tax,
  invoices, Connect, marketplace, usage billing, client-only entitlement grant,
  Redis/Upstash billing truth, provider routing, Cloudflare, worker,
  parser/OAuth, Project/DexOS, hosted runtime, broad UI, dark-pattern copy, raw
  Stripe identifiers, or secrets were added.

ARGUS validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run test:token-credits
npm exec --yes pnpm@10.32.1 -- run test:spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

The web build compiled, linted/typechecked, collected page data, and generated
31 static pages, then failed at the known Windows standalone traced-file symlink
`EPERM`. The only lint warnings were the pre-existing raw `<img>` warnings in
public Space and Discover.

ARIADNE should rehearse `/billing` as a signed owner on desktop and `390px`
mobile, checking active/current, inactive/cancelled, lower-tier, higher-tier,
Checkout, portal, entitlement, and token-credit language.

## ARIADNE Result

Accepted on 2026-06-19. See
`docs/roadmap/PR74_BILLING_ENTITLEMENT_CLARITY_ARIADNE.md`.

ARIADNE rehearsed the deployed Railway implementation at
`80e3bbe2f9e1409d4f30f96d0627d4432c6241d5`. The live replay-owner billing page
passed as active Canon on desktop and `390px` mobile, including current-plan
copy, portal/cancellation language, lower-tier included states, token-credit
separation, and cancelled-checkout copy. Browser-level mocked `/billing/me`
states covered inactive Basic, active Creator, and inactive Canon without
mutating real billing or opening hosted Stripe URLs. No route-level defect
requires a DAEDALUS repair lane.
