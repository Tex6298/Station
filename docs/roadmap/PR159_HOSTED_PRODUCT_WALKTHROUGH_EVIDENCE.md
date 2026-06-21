# PR159 - Hosted Product Walkthrough Evidence

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: ARIADNE runs the human-eye hosted walkthrough.
Status: opened for ARIADNE

## Why This Lane

PR158 reconciled the backend/product roadmap and ARGUS accepted that no backend
implementation blocker is currently open from the plan. The next useful signal
should therefore come from fresh hosted replay/product evidence, not stale
roadmap text.

This lane asks ARIADNE to run the current Railway staging product as a human
would, using the accepted replay scope and recording concrete defects or a clean
closeout. If she finds implementation defects, she should wake DAEDALUS with
the exact route/control/API symptom. If the run is clean enough, she should wake
MIMIR with the product-evidence verdict.

## Goal

Produce one current hosted walkthrough evidence packet that answers:

- does the accepted staging-alpha product path still hold on the deployed app;
- which visible flows pass, fail, or remain honestly caveated;
- whether any specific DAEDALUS implementation lane is justified now.

## Hosted Target

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

ARIADNE should verify deployment identity first through public health/
deployment endpoints and record only sanitized status, branch, commit, ready,
and service fields.

## Walkthrough Scope

ARIADNE should use hosted human routes, not local mocks, unless she explicitly
records why hosted access is unavailable.

Cover:

- signed-out first impression: landing/front door and Discover;
- public chain: Discover/feed or public entry point -> public Space/public
  work -> public document -> linked forum discussion where available;
- signed-in replay owner basics: session restore, Studio entry, persona
  selection;
- Memory: saved Memory, lifecycle/supersession control visibility, runtime
  explanation/readback, no raw ids/secrets;
- Continuity: continuity as its own owner-visible stop, not only runtime
  context counts;
- Archive: archive trust/import/readback/export surfaces, including honest
  empty/thin/error states;
- Developer Space: public observatory and owner manage/evidence surfaces, with
  methodology/field-log storytelling caveats if still thin;
- Billing: read current status and visible actions only; do not record Checkout
  URLs, Stripe IDs, customer/subscription IDs, or webhook data. Open hosted
  Checkout only if the route is clearly test-mode safe and the run can avoid
  committing sensitive URLs.

## Defect Rules

Treat these as actionable defects if observed:

- visible buttons or controls that look live but do not navigate, mutate state,
  show disabled/preview affordance, or explain why unavailable;
- route chains that dead-end unexpectedly;
- auth/session persistence failures that cannot be explained by redeploy or
  explicit sign-out;
- public/private visibility confusion;
- raw ids, tokens, URLs, provider payloads, prompts, Checkout URLs, Stripe IDs,
  customer/subscription IDs, owner/persona/source IDs, or private corpus text
  visible in the UI;
- desktop or 390px mobile horizontal overflow or overlapping controls.

## Non-Scope

ARIADNE should not:

- change code or docs beyond her evidence note;
- mutate billing state unless the test-mode path is explicitly safe and needed
  for the walkthrough;
- retry imports or replay seeds unless the route itself prompts it;
- open Redis, Cloudflare, provider, worker, or broad UI redesign lanes by
  assumption;
- print secrets, cookies, tokens, raw IDs, private corpus text, Checkout URLs,
  or webhook payloads.

## Evidence Output

Update this doc or create a tiny companion note with:

- deployment identity checked;
- routes covered;
- pass/fail/caveat table;
- concrete defects with route, control, expected behavior, actual behavior, and
  whether DAEDALUS should fix;
- whether ARGUS is needed before DAEDALUS, if the defect touches privacy,
  billing, auth/session, or owner scoping;
- recommended next wakeup.

## Handoff

If concrete implementation defects are found:

- wake DAEDALUS with exact defects and keep scope narrow.

If no implementation defect is found:

- wake MIMIR with a concise product-evidence verdict and any honest caveats.
