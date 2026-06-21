# PR128 - 2C Observed Runtime Webhook Operator Packet

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews runnable accuracy, secret handling,
signature/client behavior, and overclaim risk. ARIADNE only rehearses if a
visible route changes.
Status: accepted by ARGUS on 2026-06-21; ready for MIMIR closeout

## Why This Lane

PR120 through PR123 proved the neutral observed-runtime fixture, import bridge,
classification persistence, and supporting context. PR124 through PR127 proved
webhook ingress, HMAC signatures, dedicated signing-secret lifecycle, and
concurrent delivery/idempotency safety.

The next bounded step is making the hardened webhook path usable by an operator
or partner engineer without adding hosted runtime, Cloudflare, workers, queues,
or a visible UI. The existing `@station/developer-space-client` and observed
runtime docs should now include a signed webhook smoke packet that can be run
locally against staging/dev with provided env vars.

## Scope

- Extend the Developer Space client/docs/examples only as needed to cover
  observed-runtime signed webhook delivery.
- Add or update a runnable local smoke example that:
  - builds a `station.observed_runtime.webhook.v1` envelope from the existing
    neutral fixture/sample shape;
  - signs the raw JSON body with the current `X-Station-Signature` contract;
  - sends `X-Station-Developer-Key`, `X-Station-Signature`, and a stable
    webhook id header;
  - shows expected success, replay, in-progress/retryable, conflict, and auth
    failure categories without printing secrets.
- Document required non-secret env names and exact setup sequence:
  - API base URL;
  - Developer Space id/slug as needed;
  - Developer Space ingestion key;
  - observed-runtime webhook signing secret if a dedicated secret is active;
  - webhook id/delivery id;
  - optional fixture/sample path.
- Keep the packet honest about roles:
  - Station observes and imports external runtime state;
  - Station does not execute, host, schedule, or control the external runtime.
- Add focused tests for any new client signing/helper behavior.
- Update the observed-runtime architecture doc with the operator sequence and
  the post-PR127 readiness boundary.

## Non-Scope

- No hosted runtime, container execution, scheduler, worker, queue, Cloudflare
  Worker, Vectorize, D1, or Cloudflare config request.
- No partner-specific adapter, branding, public onboarding wizard, or
  production partner claim.
- No browser-visible secret-management UI, user-pasted secret flow, vault UI,
  billing, Stripe, Redis memory truth, provider routing, chat-native developer
  agent, broad UI, or migration of canonical runtime truth out of Supabase.
- No live staging secret values, API keys, webhook secrets, Railway variables,
  Supabase secrets, raw private payloads, or credentials in committed docs or
  tests.

## Acceptance

- A developer can follow committed docs/example code to produce a correctly
  signed observed-runtime webhook request against a configured local/staging
  API.
- The example and helper use the same signature contract as PR125/PR126:
  `X-Station-Signature: t=<unix-seconds>,v1=<hex-hmac>` over
  `<timestamp>.<raw-body-bytes>`.
- The packet explains whether to use the dedicated signing secret or the PR125
  ingestion-key fallback, without exposing or logging secret values.
- Tests cover any new signing helper or client behavior.
- Existing `test:developer-spaces`, `test:developer-space-client`,
  `typecheck`, and API build stay green.
- Docs explicitly preserve the non-claims around hosted runtime, Cloudflare,
  workers, queues, partner adapters, and production readiness.

## Implementation

DAEDALUS implemented PR128 on 2026-06-21.

- `@station/developer-space-client` now has async helpers that build the
  `station.observed_runtime.webhook.v1` envelope, serialize raw JSON, and sign
  those exact bytes with the `X-Station-Signature` contract.
- `sendObservedRuntimeWebhook` sends `X-Station-Developer-Key`,
  `X-Station-Signature`, and `X-Station-Webhook-Id` to
  `/developer-spaces/ingest/observed-runtime`.
- The signing helper uses Web Crypto HMAC-SHA256 so the client package builds
  without a Node-only type dependency.
- `packages/developer-space-client/examples/observed-runtime-webhook.ts`
  provides an env-name-only local smoke packet and prints structured
  success/error readback without printing secrets.
- The client README documents required env names, dedicated signing-secret
  versus ingestion-key fallback behavior, success/replay/in-progress/conflict/
  auth readback categories, and the non-claim that Station observes/imports
  external runtime state but does not execute, host, schedule, or control it.
- The observed-runtime architecture note records the same operator sequence and
  readiness boundary.

## Validation

DAEDALUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 26 tests passed; existing observed-runtime webhook ingress, signing-secret, idempotency, and readback behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 7 tests passed, including exact raw-body signature proof, dedicated signing-secret send behavior, no secret-in-body assertion, ingestion-key fallback signing, and in-progress error readback. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed green. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API build completed with dependent shared package builds. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/developer-space-client build` | Pass | Client package build completed after the helper used Web Crypto instead of Node-only types. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

## Handoff

Wake ARGUS with:

- exact files touched;
- helper/example/API contract;
- setup env names without values;
- signature proof;
- replay/conflict/in-progress/auth failure readback;
- no-secret proof;
- validation results;
- explicit non-claims around hosted runtime, Cloudflare, workers, queues,
  partner adapters, production readiness, UI, and secrets.

If the existing client package shape cannot support a truthful signed webhook
packet without a larger adapter/API redesign, wake MIMIR with the exact blocker
and the smallest recommended next lane.

## ARGUS Review - 2026-06-21

ARGUS accepts PR128 for the bounded operator-packet lane.

Review result:

- The client helper builds the documented
  `station.observed_runtime.webhook.v1` envelope, serializes the exact raw JSON
  body, and signs `<timestamp>.<raw-body>` with HMAC-SHA256 into
  `X-Station-Signature`.
- `sendObservedRuntimeWebhook` preserves the existing Developer Space key auth
  header while adding `X-Station-Signature` and stable
  `X-Station-Webhook-Id` for the observed-runtime ingress route.
- The example uses env names only, prints structured success/error readback,
  and does not print or commit key/signing-secret values.
- README and architecture docs correctly explain dedicated signing secret versus
  ingestion-key fallback, accepted/replayed/in-progress/conflict/auth readback,
  and the boundary that Station observes/imports external runtime state but
  does not execute, host, schedule, or control it.
- The implementation stays inside client/docs/examples and does not add UI,
  partner adapter behavior, hosted runtime, Cloudflare, worker, queue, billing,
  Redis/provider changes, or committed secrets.

ARGUS validation:

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass, 26 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass, 7 tests |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/developer-space-client build` | Pass |
| `git diff --check` | Pass, CRLF normalization warnings only |

Remaining non-claims: no hosted runtime, container execution, scheduler,
worker, queue, Cloudflare Worker/Vectorize/D1, partner adapter, public
onboarding wizard, visible secret-management UI, user-pasted secret flow, vault
UI, billing/Stripe, Redis memory truth, provider routing, chat-native developer
agent, broad UI, production partner claim, or committed secrets.
