# PR 3 Stripe Paid-Path Reconciliation

Date: 2026-06-15

Owner: A2 / DAEDALUS

Reviewed lane: `docs/roadmap/PR3_STRIPE_PAID_PATH_PROOF.md`

## Verdict

PR 3 is ready for ARGUS review as a reconciliation-only close.

Current main already has accepted, source-backed Stripe test-mode paid
activation evidence for the current staging target and billing code. DAEDALUS
did not run a second hosted Checkout payment in this pass.

## Sources Reconciled

- `docs/roadmap/STAGING_DEMO_STRIPE_ARIADNE.md` records
  `STAGING-DEMO-STRIPE-01`: the replay owner moved from inactive/no
  subscription to active/subscription present in staging Stripe test mode.
- The ARGUS closeout in that same file accepts the proof as bounded demo
  evidence and confirms Checkout creation alone does not grant entitlement.
- `docs/testing/VALIDATION_BASELINE.md` repeats the ARGUS billing review:
  entitlement mutation is handled through verified Stripe webhook processing,
  invalid signatures fail closed, unknown active Price IDs fail closed, and
  customer/profile mismatches fail closed.
- `docs/roadmap/LIVE_STAGING_REPLAY_REVIEW_ARIADNE.md` later confirms the live
  billing surfaces still open Stripe Billing Portal and Stripe Checkout without
  recording Stripe URLs, tokens, or customer identifiers.
- Current code inspection still matches the accepted proof: subscription
  Checkout uses Stripe Billing `mode: "subscription"`, webhook handling verifies
  the Stripe signature before processing, subscription events sync profile
  tier/status, and token top-ups remain payment-mode metadata grants.

## Sanitized Current Claims

- `/billing/checkout` creates a hosted Stripe Checkout session for configured
  subscription Prices and does not grant entitlement by itself.
- `/billing/webhook` rejects missing or invalid signatures before mutation.
- A verified subscription event can persist a paid tier, subscription status,
  customer binding, and subscription presence on the profile.
- `/billing/me` reads the persisted billing state and tier limits.
- `/billing/portal` creates a hosted Customer Portal session for the bound
  customer.
- Token-credit top-ups are separate payment-mode grants, validated against
  server-defined packs and idempotent by Stripe payment id.

## Caveat

This closes only the bounded Stripe test-mode paid activation proof. It is not
live-money billing, production billing readiness, invoices/tax/Connect,
marketplace payments, usage-based subscription metering, or broad billing UX
polish.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npx --yes pnpm@10.32.1 test:billing` | Pass | 4 billing tests passed: Checkout/portal creation, verified webhook mutation, unknown Price rejection, and customer/profile mismatch rejection. |
| `npx --yes pnpm@10.32.1 test:token-credits` | Pass | 3 token-credit tests passed, including top-up checkout/grant idempotency and metadata/tier guardrails. |
| `npx --yes pnpm@10.32.1 --filter @station/api build` | Pass | API and dependent packages built successfully. |
| `npx --yes pnpm@10.32.1 test:health` | Pass | 11 health/deployment tests passed after readiness wording review. |
| `npx --yes pnpm@10.32.1 test:replay-readiness` | Pass | 1 replay-readiness test passed. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected CRLF normalization warnings. |

## Handoff

Wake ARGUS.

ARGUS should review the reconciliation for overclaim risk, confirm no new
Stripe identifiers or secrets are committed, and either accept PR 3 or send
DAEDALUS back with a precise evidence gap.
