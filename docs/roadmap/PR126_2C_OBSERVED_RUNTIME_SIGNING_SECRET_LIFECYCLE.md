# PR126 - 2C Observed Runtime Signing Secret Lifecycle

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews owner scoping, secret storage,
signature verification, compatibility, and overclaim risk. ARIADNE only
rehearses if visible routes change.
Status: opened for DAEDALUS

## Why This Lane

PR125 accepted HMAC verification for observed-runtime webhooks using the
Developer Space ingestion key as alpha signing material. ARGUS accepted that
for the bounded lane, but separate signing-secret management remains future
work before partner-style use.

PR126 should add that lifecycle without introducing partner adapters, Cloudflare,
hosted runtime, workers, queues, or UI sprawl.

## Scope

- Add a small durable signing-secret model, likely
  `developer_space_webhook_signing_secrets`, with:
  - Developer Space and owner scoping;
  - hashed secret only;
  - last four or short fingerprint;
  - status such as `active` / `revoked`;
  - created, revoked, and last-used timestamps.
- Add owner-authenticated API endpoints to create/rotate and revoke the
  observed-runtime webhook signing secret. Secret value should be returned only
  on creation/rotation.
- Update `POST /developer-spaces/ingest/observed-runtime` signature verification
  to prefer an active dedicated signing secret when one exists.
- Define compatibility for the PR125 ingestion-key signing fallback:
  - keep fallback only when no active dedicated signing secret exists, or
  - wake MIMIR with the exact blocker if ARGUS/security reasoning requires
    immediate removal.
- Preserve existing Developer Space ingestion-key auth unless DAEDALUS finds a
  precise reason the dedicated signing secret should replace it. Do not create
  an unauthenticated public webhook route.
- Keep route responses and errors non-secret and machine-readable.
- Update docs/client types only as needed for API shape; do not build a broad UI
  management surface in this lane.

## Non-Scope

- No partner-specific adapter, partner branding, public onboarding wizard, or
  production partner claim.
- No browser-visible secret management UI unless an existing manage-page pattern
  makes a tiny show-once control unavoidable; prefer API/tests/docs first.
- No hosted runtime, container execution, scheduler, worker, queue, background
  loop, Cloudflare Worker, Vectorize index, D1 binding, or Cloudflare config
  request.
- No user-pasted secret flow, vault UI, billing, Stripe change, Redis memory
  truth, provider routing, chat-native developer agent, or broad Developer Space
  UI redesign.
- No claim that Station executes, controls, or hosts the observed runtime.

## Acceptance

- Owners can create/rotate a dedicated observed-runtime webhook signing secret
  and receive the raw value only once.
- Stored data is hashed/fingerprinted only; raw secrets are not persisted,
  serialized, logged, or committed.
- Non-owners cannot create, rotate, revoke, or inspect signing-secret metadata.
- Active dedicated signing secrets verify webhook signatures.
- Revoked/old dedicated signing secrets no longer verify.
- The ingestion-key fallback behavior is explicit, tested, and documented.
- Existing PR124/PR125 idempotency, visibility, secret-stripping, and non-secret
  response behavior remains intact.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
git diff --check
```

If raw-body middleware or billing wiring changes unexpectedly, rerun
`test:billing` and explain why.

## Handoff

Wake ARGUS with:

- exact files touched;
- migration/table/column choice;
- create/rotate/revoke API behavior;
- raw-secret show-once proof;
- owner/non-owner proof;
- active/revoked/fallback signature behavior;
- validation results;
- explicit non-claims around partner adapters, hosted runtime, Cloudflare,
  workers, queues, secret-management UI, and secrets.

If the signing-secret lifecycle cannot be implemented cleanly inside this
scope, wake MIMIR with the exact blocker and recommended next lane.
