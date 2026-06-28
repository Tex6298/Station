# Production Billing Error Response Hardening

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

Status: complete - wake ARGUS

## Why This Lane

ARGUS accepted global Express error-boundary hardening in:

`docs/roadmap/PRODUCTION_GLOBAL_ERROR_SANITIZATION_REVIEW_RESULT.md`

Residual caveat:

> Route-level handlers that directly return raw service errors remain separate
> future audit surface.

The first route-level slice is billing because it is payment-adjacent and small
enough to fix without rewriting every API route at once.

Current direct raw-response patterns are in:

`apps/api/src/controllers/billing.controller.ts`

Observed examples:

- `handleGetBillingStatus` returns `err.message` on 500.
- `handleCreateCheckout` returns service exception text on 409, 503, and 400.
- `handleCreatePortal` returns service exception text on 400.
- `handleWebhook` returns service exception text on 400.

## Task

Harden billing route/controller error responses.

Required behavior:

- billing route responses must not expose raw Stripe messages, checkout session
  IDs, customer/subscription IDs, payment intent IDs, webhook secrets,
  signature material, URLs, tokens, stack traces, SQL output, provider payloads,
  private snippets, cookies, or secret-shaped values;
- deliberately bounded user-facing states should remain useful, especially:
  active subscription checkout blocked and billing subscription state
  unavailable;
- generic billing failures should return stable public copy and a bounded code
  or existing response shape that clients can safely handle;
- webhook verification/handling failures should not leak raw Stripe payload,
  signature, event, or customer identifiers;
- tests should prove hostile service error messages are not returned.

Prefer reusing the global error-boundary sanitization helper only if it is
already exportable without making route code depend on middleware internals in
an awkward way. A small billing-local mapper is acceptable for this slice.

## Scope

Allowed:

- `apps/api/src/controllers/billing.controller.ts`;
- billing route tests;
- a tiny shared safe error helper only if it clearly reduces duplication;
- docs/status/baseline updates for the result.

Do not change:

- Stripe API behavior, price selection, webhook signing verification, Checkout
  creation semantics, Portal creation semantics, subscription entitlement
  mutation, schema, migrations, package manifests, Redis, Cloudflare,
  provider/model behavior, auth/session semantics, UI, background workers,
  queue adapters, hosted config, or hosted data.

Do not attempt the entire route-level API in this PR. Record the remaining
route-level raw-error surface as future work if you see it.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If you add or move a shared helper, rerun any focused test for its owning
surface.

## Handoff

Wake ARGUS with:

```text
READY FOR ARGUS BILLING ERROR RESPONSE REVIEW
```

or wake MIMIR with:

```text
BLOCKED - NEEDS MIMIR DECISION
```

if safe billing copy cannot be preserved without changing product behavior.

## DAEDALUS Result

Completed on 2026-06-28:
`docs/roadmap/PRODUCTION_BILLING_ERROR_RESPONSE_RESULT.md`.

Verdict:

```text
READY FOR ARGUS BILLING ERROR RESPONSE REVIEW
```
