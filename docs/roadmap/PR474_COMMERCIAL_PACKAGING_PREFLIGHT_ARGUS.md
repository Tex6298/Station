# PR474 - Commercial Packaging Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - wake ARGUS

## Why This Lane

PR473 is closed at the owner-encounter provider/config boundary. The next move
should be a named Phase 3/customer-facing expansion, not another extension of
the nearest existing surface.

Research/institutional/public Project foundations and Developer Space partner
readiness already exist. Stripe test-mode subscription activation was already
proven by PR181, so this is not another "prove Stripe works" lane.

The useful next commercial question is narrower:

```text
Can Station expose an honest customer-facing paid-plan/upgrade packaging slice
for an already-proven public-facing capability, using existing subscription
Checkout and Customer Portal behavior, without overclaiming production commerce?
```

## Preflight Task

ARGUS should hostile-review the current repo and return one of:

```text
ACCEPT_FOR_DAEDALUS
BLOCKED
NEEDS_MIMIR_DECISION
```

If accepted, name the smallest PR474A implementation shape and wake DAEDALUS.

The preferred shape is a readback/packaging slice, not a billing rebuild:

- use existing billing/subscription routes and test-mode config;
- use Stripe Checkout Sessions in subscription mode for activation;
- use Stripe Customer Portal for self-service management;
- use existing Stripe Price ids/config, not deprecated Plan objects;
- make public-facing capability limits or upgrade paths clearer from an
  already-proven area such as Developer Spaces, public Projects/research pages,
  or owner Settings/Billing readback;
- preserve existing entitlement logic and PR181 activation proof.

## Questions ARGUS Should Answer

1. Which existing public-facing capability should the first commercial packaging
   slice attach to: Developer Spaces, public Projects/research pages, public
   persona capabilities, or Settings/Billing only?
2. Is there already enough route/config/test coverage to let DAEDALUS add a
   narrow customer-facing upgrade/readback slice without new schema?
3. What exact acceptance tests should DAEDALUS run?
4. What hosted ARIADNE rehearsal would prove the slice without exposing Stripe
   object ids, Checkout URLs, portal URLs, cards, customer ids, subscription
   ids, secrets, webhook payloads, or live-money claims?
5. If blocked, name the concrete blocker and the smallest numbered unblock
   lane that directly enables this commercial packaging feature.

## Guardrails

Do not reopen PR181 subscription activation proof or rerun Stripe as a generic
confidence exercise.

Do not add live-money claims, production billing readiness, tax, invoices,
coupons, Connect/marketplace payments, usage billing, pricing strategy,
manual renewal loops, raw PaymentIntent subscription flows, or broad billing
architecture.

Do not record or print secrets, Stripe object ids, Checkout URLs, portal URLs,
customer ids, subscription ids, payment cards, webhook payloads, hosted logs, or
SQL output in docs.

Do not broaden provider/model policy, owner encounter runtime, Redis,
Cloudflare, queues, workers, storage, schema, public launch claims, or broad UI
redesign.

## Inputs

- `docs/roadmap/PR181_STRIPE_CLEAN_PROOF_ACCOUNT_ACTIVATION.md`
- `docs/roadmap/BILLING_UX_BROWSER_ARIADNE.md`
- `docs/roadmap/DEVELOPER_SPACE_TIER1_CLOSEOUT_AUDIT.md`
- `docs/roadmap/DEVELOPER_SPACE_PARTNER_READINESS_MAP.md`
- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`
- Current billing/subscription API and web tests.

## Wakeup Templates

If accepted:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR474 Commercial Packaging preflight.
Task:
- Implement the exact PR474A slice ARGUS names.
Guardrails:
- Keep Stripe test-mode/subscription Checkout and Customer Portal boundaries; do not broaden billing architecture.
```

If blocked or decision-dependent:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR474 Commercial Packaging preflight.
Verdict:
- BLOCKED | NEEDS_MIMIR_DECISION
Task:
- Choose the smallest unblock lane or make the named product decision.
```
