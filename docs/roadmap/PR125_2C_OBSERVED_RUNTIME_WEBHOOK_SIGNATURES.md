# PR125 - 2C Observed Runtime Webhook Signatures

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews raw-body handling, signature
verification, replay/idempotency, secret handling, and overclaim risk. ARIADNE
only rehearses if visible routes change.
Status: accepted by ARGUS on 2026-06-20

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

## DAEDALUS Implementation Notes - 2026-06-20

Implemented as alpha HMAC hardening for the existing PR124 route:

- `apps/api/src/app.ts` now gives
  `/developer-spaces/ingest/observed-runtime` a raw JSON body before the global
  JSON parser, matching the local Stripe webhook raw-body pattern.
- `apps/api/src/routes/developer-spaces.ts` verifies
  `X-Station-Signature` after Developer Space key auth and before JSON parsing,
  rate/quota checks, import, receipt creation, or SSE broadcast.
- Header contract: `X-Station-Signature: t=<unix-seconds>,v1=<hex-hmac>`.
- Signing input: `<timestamp>.<raw-body-bytes>`.
- HMAC: SHA-256 using the existing Developer Space ingestion key as alpha
  signing material.
- Default timestamp tolerance: 300 seconds, configurable with
  `DEVELOPER_SPACE_OBSERVED_RUNTIME_WEBHOOK_SIGNATURE_TOLERANCE_SECONDS`.
- Existing PR124 idempotency remains: same id plus same payload returns the
  stored non-secret summary; same id plus different payload conflicts.

Focused tests now prove missing, malformed, stale, and invalid signatures fail
without import or receipt rows; valid signed requests import; signed replay is
idempotent; and signed same-id/different-payload conflict remains non-leaky.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 23 tests passed, including unsigned/malformed/stale/bad signature rejection, valid signed import, signed replay, signed conflict, and public readback safety. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 4 client tests passed; client package remains compatible. |
| `npm exec --yes pnpm@10.32.1 -- run test:billing` | Pass | 9 tests passed after app-level raw-body middleware changed; Stripe webhook raw-body gating remains green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API build completed. |
| `git diff --check` | Pass | CRLF normalization warnings only, including local agent state that was not staged. |

Non-claims preserved: no separate signing-secret management UI, partner
adapter, hosted runtime, Cloudflare Worker/Vectorize/D1, worker, queue,
user-pasted secret flow, billing/Stripe change, Redis memory truth, provider
routing, chat-native developer agent, or broad Developer Space UI redesign.

## ARGUS Verdict

Accepted on 2026-06-20.

ARGUS confirmed:

- raw-body middleware for `/developer-spaces/ingest/observed-runtime` is ordered
  before the global JSON parser and does not break the existing Stripe raw-body
  webhook path;
- signature verification happens after Developer Space key auth and before JSON
  parsing, rate/quota checks, import, receipt creation, usage mutation, or SSE
  broadcast;
- missing, malformed, stale, and invalid signatures return bounded auth errors
  without importing or creating receipts;
- valid signed requests preserve PR124 replay/conflict behavior;
- using the ingestion key as alpha signing material is acceptable for this
  bounded lane, while separate signing-secret management remains future work.

Validation: `test:developer-spaces` 23 passed,
`test:developer-space-client` 4 passed, `test:billing` 9 passed,
`typecheck` passed, `@station/api` build passed, and `git diff --check` passed
with CRLF normalization warnings only.

No ARIADNE rehearsal is required because no visible route changed.
