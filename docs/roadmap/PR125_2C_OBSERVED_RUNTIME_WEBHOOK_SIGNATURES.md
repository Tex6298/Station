# PR125 - 2C Observed Runtime Webhook Signatures

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews raw-body handling, signature
verification, replay/idempotency, secret handling, and overclaim risk. ARIADNE
only rehearses if visible routes change.
Status: opened for DAEDALUS

## Why This Lane

PR124 added the first observed-runtime webhook ingress alpha, but ARGUS kept a
clear caveat: HMAC/signature verification is deferred and should be added before
partner or production webhook use.

PR125 should harden the existing alpha route without widening into Cloudflare,
hosted runtime, workers, queues, or partner adapters.

## Scope

- Add raw-body handling for `POST /developer-spaces/ingest/observed-runtime`
  using the local Stripe webhook pattern in `apps/api/src/app.ts` as the
  reference.
- Add HMAC-SHA256 signature verification before parsing or importing the
  observed-runtime payload.
- Use the existing Developer Space ingestion key as the alpha signing secret
  unless DAEDALUS finds a concrete reason that is unsafe. Do not create a new
  dashboard secret/config requirement in this lane.
- Define and test a small header contract, for example:
  - `X-Station-Signature: t=<unix-seconds>,v1=<hex-hmac>`;
  - signed payload: `<timestamp>.<raw-body-bytes>`;
  - timestamp tolerance with a conservative default.
- Missing, malformed, stale, or invalid signatures must fail before import,
  receipt creation, usage/quota mutation, or SSE broadcast.
- Keep the existing Developer Space key auth and PR124 webhook idempotency
  receipts in force.
- Keep response/error bodies non-secret and machine-readable.
- Update architecture/status docs to state exactly what signature verification
  proves and what remains future, such as separate signing-secret rotation or
  partner-specific adapters.

## Non-Scope

- No partner-specific adapter, partner branding, or partner onboarding flow.
- No separate signing-secret management UI, vault UI, rotation UI, or user-pasted
  secret flow unless the existing ingestion key cannot safely serve as alpha
  signing material and MIMIR is woken with that exact blocker.
- No hosted runtime, container execution, scheduler, worker, queue, background
  loop, Cloudflare Worker, Vectorize index, D1 binding, or Cloudflare config
  request.
- No billing, Stripe changes, Redis memory truth, provider routing,
  chat-native developer agent, or broad Developer Space UI redesign.
- No claim that Station executes, controls, or hosts the observed runtime.

## Acceptance

- Unsigned observed-runtime webhook requests are rejected.
- Bad, stale, malformed, or mismatched signatures are rejected without import or
  receipt mutation.
- Valid signatures with the existing Developer Space key can import through the
  accepted PR124 path.
- Duplicate signed requests preserve PR124 same-id/same-payload idempotency and
  same-id/different-payload conflict behavior.
- Signature errors do not leak the signing key, raw body, private payload, or
  secret-shaped values.
- Docs clearly frame this as alpha HMAC hardening, not partner onboarding,
  separate secret rotation, Cloudflare runtime, or hosted execution.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
git diff --check
```

If app-level middleware changes affect other routes, include the focused billing
webhook test or explain why it is unaffected.

## Handoff

Wake ARGUS with:

- exact files touched;
- raw-body routing/middleware changes;
- signature header contract and signing input;
- whether the Developer Space ingestion key is used as alpha signing material;
- unsigned/bad/stale/valid/replay/conflict test results;
- proof no import/receipt/usage mutation happens before signature acceptance;
- validation results;
- explicit non-claims around separate signing-secret management, partner
  adapters, hosted runtime, Cloudflare, workers, queues, and secrets.

If signature verification cannot be implemented cleanly inside this scope, wake
MIMIR with the exact blocker and recommended next lane.
