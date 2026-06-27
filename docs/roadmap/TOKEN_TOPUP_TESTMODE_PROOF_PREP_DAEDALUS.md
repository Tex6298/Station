# Token Top-Up Test-Mode Proof Prep - DAEDALUS

Opened by: MIMIR / A1
Owner: DAEDALUS / A2
Date: 2026-06-27
Status: complete - see `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_PREP_RESULT.md`

## Context

ARGUS accepted the hosted read-only operations proof. That closes the current
ops readback slice as protected-alpha evidence, not as production readiness.

Do not reopen nearby closed lanes by inertia:

- PR148 owner background job status readback is already closed.
- PR181 subscription activation proof is already closed.
- The open Stripe gap named by UX07 is narrower: token-credit purchase buttons
  exist, but payment-mode Checkout has not had a named, explicit test-mode
  proof packet.

The user has provided Stripe test configuration for local/staging work. Do not
print secrets, test cards, Checkout URLs, session IDs, payment IDs, customer
IDs, subscription IDs, cookies, auth headers, webhook payloads, or raw provider
responses.

Stripe best-practice posture for this lane:

- One-time token top-ups should stay on Checkout Sessions with `mode: payment`.
- Subscription activation remains separate Billing/Checkout work with
  `mode: subscription`.
- Do not use the Charges API.
- Do not rewrite the billing architecture to prove this gap.

## Task

Map the current token top-up contract and decide whether a hosted test-mode
proof can be safely opened.

Inspect, at minimum:

- `apps/api/src/routes/token-credits.ts`
- `apps/api/src/services/token-credits.service.ts`
- `apps/api/src/services/billing.service.ts`
- `apps/api/src/controllers/billing.controller.ts`
- `apps/api/src/routes/token-credits.test.ts`
- `apps/api/src/routes/billing.test.ts`
- `apps/web/components/settings/token-usage-panel.tsx`
- relevant migration/RPC definitions for `grant_topup_purchase`
- `docs/roadmap/UX07_BILLING_ENTITLEMENT_FEASIBILITY_RESULT.md`
- relevant validation/status docs

Produce:

- `docs/roadmap/TOKEN_TOPUP_TESTMODE_PROOF_PREP_RESULT.md`

## Required Result Shape

Use this verdict vocabulary exactly:

```text
READY FOR ARGUS PREFLIGHT
NEEDS DAEDALUS PATCH
NO IMMEDIATE TOPUP PROOF
NEEDS MIMIR DECISION
```

Include these sections:

1. Current Contract
   - authenticated route that creates top-up Checkout;
   - available pack/tier rules;
   - Checkout mode and metadata field names only;
   - webhook event paths that grant top-up balance;
   - idempotency mechanism;
   - `/token-credits/me` readback;
   - Settings UI purchase-history behavior;
   - separation from subscription entitlement.

2. Proof Packet Draft
   - exact safe human/browser path if ready;
   - lowest-risk replay account and pack recommendation;
   - before/after readback fields to compare;
   - webhook completion signal to wait for;
   - explicit confirmation that subscription tier/entitlement must not change.

3. Safety And Redaction Rules
   - list forbidden outputs;
   - list allowed selected fields;
   - state whether ARGUS preflight is required before any hosted mutation.

4. Files And Commands Inspected

## Boundaries

This is a prep lane only.

Do not:

- run hosted Checkout;
- click a payment button;
- call Stripe with real payment behavior;
- create, rotate, print, or request secrets;
- change code, config, schema, packages, migrations, or provider settings;
- re-prove subscription activation;
- broaden into tax, invoices, coupons, Connect, deep usage billing, or
  production live-money handling;
- expose raw Stripe object identifiers or raw response bodies.

If you find a small obvious code defect, do not patch it in this lane. Record
`NEEDS DAEDALUS PATCH`, describe the minimal fix, and wake MIMIR.

## Handoff

Wake MIMIR with the result.

If the verdict is `READY FOR ARGUS PREFLIGHT`, MIMIR should send ARGUS a
strict hosted-mutation preflight packet before ARIADNE or any human runs the
test-mode proof.
