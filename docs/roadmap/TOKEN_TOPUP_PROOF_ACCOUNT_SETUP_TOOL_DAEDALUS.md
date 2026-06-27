# Token Top-Up Proof Account Setup Tool - DAEDALUS

Opened by: MIMIR / A1
Owner: DAEDALUS / A2
Date: 2026-06-28
Status: complete - see `docs/roadmap/TOKEN_TOPUP_PROOF_ACCOUNT_SETUP_TOOL_RESULT.md`

## Context

ARGUS rejected the proposed one-off `visitor` to `private` hosted setup
mutation in
`docs/roadmap/TOKEN_TOPUP_DEDICATED_ACCOUNT_SETUP_PREFLIGHT_ARGUS.md`.

That rejection does not close the token top-up proof. It says the current repo
does not yet have a narrow audited way to create or prepare exactly one
dedicated Basic/private non-production proof account. Manual SQL, dashboard,
service-role, or custom helper mutation would be too hidden and too close to
PR181/subscription activation.

MIMIR is not asking the user to solve this yet. Open the separate setup-tool
lane ARGUS allowed as the next safe path.

## Objective

Design the narrowest Station-side setup mechanism that can prepare one
dedicated non-production Basic/private proof account for the token top-up hosted
rerun, without reopening subscription activation and without granting broad
agent entitlement authority.

If a safe implementation is obvious and tightly bounded, implement it behind
the required guardrails and return it for ARGUS review. If it is not safe or not
worth the code surface, return a clear `NO SAFE TOOL` verdict with the exact
user-provided account ask.

## Required Questions

Answer these before changing behavior:

- Should this be a CLI script, authenticated admin route, or no Station-side
  tool at all?
- How does the mechanism prove it is non-production/test-only?
- How does it identify exactly one target account without recording raw emails,
  raw ids, credentials, cookies, auth headers, SQL rows, hosted logs, or
  screenshots in committed docs?
- Can the target be "the currently authenticated user" to avoid raw target-id
  handling, or does that create a worse user-risk boundary?
- What audit trail exists after setup?
- What prevents accidental use on live customer accounts?
- What prevents subscription status, Stripe customer/subscription fields,
  top-up purchases, token transactions, or usage counters from changing?
- What selected Station readback will prove setup succeeded before ARIADNE
  reruns Checkout?

## Preferred Safety Shape

Prefer a shape with these properties:

- explicit non-production/test flag required;
- unavailable by default;
- requires an authenticated privileged operator or an equivalent local-only
  operator boundary already present in the repo;
- targets exactly one dedicated proof account;
- changes only the minimum account eligibility surface needed for Basic/private
  top-up availability;
- records a small setup audit note if the repo has an appropriate audit surface;
- returns only selected safe readback fields;
- refuses to run if the account already has top-up purchase history unless the
  lane explicitly accepts that history;
- refuses to run if the account has active subscription state or existing Stripe
  subscription identifiers;
- leaves token usage, top-up purchases, token transactions, billing
  subscriptions, Stripe state, personas, Spaces, Developer Spaces, archives,
  exports, forums, provider config, Redis, Cloudflare, queues, and workers
  untouched.

## Explicit Non-Goals

Do not:

- run the setup against hosted staging in this lane unless this file is first
  amended by MIMIR after ARGUS review;
- click subscription Checkout or token top-up Checkout;
- reopen PR181/subscription activation;
- add broad admin-console behavior;
- add a general tier-editing feature;
- create a path that can silently upgrade arbitrary users;
- print or commit account emails, raw ids, credentials, env values, cookies,
  auth headers, SQL rows, Stripe ids, Checkout URLs, Portal URLs, receipt URLs,
  webhook payloads, hosted logs, screenshots, or raw endpoint bodies.

## Deliverable

Produce:

`docs/roadmap/TOKEN_TOPUP_PROOF_ACCOUNT_SETUP_TOOL_RESULT.md`

Use one verdict:

```text
READY FOR ARGUS SETUP-TOOL REVIEW
NO SAFE TOOL - NEEDS USER-PROVIDED BASIC PROOF ACCOUNT
NEEDS MIMIR DECISION
```

If returning `READY FOR ARGUS SETUP-TOOL REVIEW`, include:

- selected implementation or design shape;
- files changed or proposed;
- exact guardrails;
- exact mutation boundaries;
- exact readback fields;
- tests run;
- why it avoids PR181/subscription activation;
- why it is safer than manual SQL/service-role/dashboard edits;
- what ARGUS must hostile-review before ARIADNE gets another hosted rerun.

If returning `NO SAFE TOOL`, include the smallest account ask MIMIR should take
back to the user, written without requiring credentials or secret sharing in
chat.

## Wakeup

When complete, wake MIMIR.
