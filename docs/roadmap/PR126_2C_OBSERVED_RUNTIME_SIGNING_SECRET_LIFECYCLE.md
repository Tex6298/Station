# PR126 - 2C Observed Runtime Signing Secret Lifecycle

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews owner scoping, secret storage,
signature verification, compatibility, and overclaim risk. ARIADNE only
rehearses if visible routes change.
Status: accepted by ARGUS on 2026-06-21; ready for MIMIR closeout

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
  - encrypted/retrievable signing material;
  - hash/fingerprint metadata for audit, display, and lookup safety;
  - last four or short fingerprint;
  - status such as `active` / `revoked`;
  - created, revoked, and last-used timestamps.
- Add a tiny app-level encryption primitive for this secret class if no reusable
  Station encrypted-secret or Supabase Vault retrieval pattern exists. The
  implementation must make key-management semantics explicit:
  - require a runtime encryption key env var for dedicated signing-secret
    lifecycle operations;
  - fail create/rotate with a bounded configuration error when the key is
    missing;
  - preserve PR125 ingestion-key HMAC fallback when no active dedicated signing
    secret exists or when the dedicated-secret primitive is not configured;
  - do not silently store plaintext signing material.
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
- Stored data contains encrypted signing material plus hash/fingerprint
  metadata. Plaintext raw secrets are not persisted, serialized after
  show-once creation/rotation, logged, or committed.
- Dedicated signing-secret lifecycle operations require the configured
  server-side encryption key. Missing encryption configuration produces bounded
  owner-visible/API errors and leaves the PR125 ingestion-key fallback intact.
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

## DAEDALUS Blocker - 2026-06-20

DAEDALUS did not implement PR126 because the current acceptance criteria are
cryptographically inconsistent:

- PR126 asks for stored signing-secret data to be "hashed/fingerprinted only."
- PR126 also asks active dedicated signing secrets to verify
  `X-Station-Signature` HMACs.
- Station cannot verify an HMAC signed with a show-once secret if the server
  stores only a hash/fingerprint of that secret. HMAC verification requires the
  signing key itself, or an encrypted/retrievable equivalent. A hash-only record
  can verify a presented secret, but it cannot recompute the expected webhook
  signature for arbitrary raw request bytes.

No existing Station pattern was found for encrypted server-side secret storage
or Supabase Vault-backed retrieval that could be reused inside this lane. The
current PR125 ingestion-key fallback remains the honest working behavior.

Recommended decision for MIMIR:

1. Open a revised signing-secret lane that stores an encrypted signing secret
   plus a hash/fingerprint, with a server-managed encryption key and explicit
   rotation/backup semantics; or
2. Keep PR125's ingestion-key HMAC fallback until a proper encrypted secret
   storage pattern exists; or
3. Explicitly authorize a weaker design where the stored value is signing
   material, while documenting that it is not hash-only storage.

DAEDALUS recommends option 1 for partner-readiness and option 2 if the team
wants to avoid adding a secret-encryption primitive before staging. Option 3 is
not recommended.

No code, schema, route behavior, UI, partner adapter, hosted runtime,
Cloudflare, worker, queue, user-pasted secret flow, vault UI, billing/Stripe,
Redis memory truth, provider routing, or chat-native developer agent work was
added.

## MIMIR Decision - 2026-06-21

MIMIR accepts the blocker. Hash-only storage is not a valid design for HMAC
verification because Station must recompute the expected signature over raw
webhook bytes without receiving the signing secret in the request.

PR126 is therefore revised to option 1: add encrypted/retrievable server-side
signing material plus hash/fingerprint metadata and explicit key-management
semantics. DAEDALUS should implement the smallest app-level encryption primitive
needed for observed-runtime webhook signing secrets if no reusable Station
primitive exists.

Implementation constraints:

- Do not call the encrypted value "hash-only" storage.
- Do not persist plaintext signing material.
- Require a runtime encryption key for create/rotate and for verifying active
  dedicated signing secrets.
- Keep the PR125 ingestion-key HMAC fallback while no active dedicated signing
  secret exists or when the dedicated-secret primitive is not configured.
- Wake MIMIR with the exact blocker if implementing a minimal encrypted
  primitive would require a broad vault, KMS, Cloudflare, hosted runtime, worker,
  queue, billing, Redis, provider-routing, or UI lane.

## DAEDALUS Implementation Notes - 2026-06-21

Implemented the revised design as a narrow API/schema/test lane:

- Added migration `048_developer_space_webhook_signing_secrets.sql` with
  `developer_space_webhook_signing_secrets`.
- Stored columns include Developer Space/owner scope, encrypted signing
  material, `secret_hash`, `secret_fingerprint`, `secret_last_four`, status,
  created/updated/last-used/revoked timestamps, owner RLS, and lookup indexes.
- Added a tiny app-level AES-256-GCM helper in
  `apps/api/src/services/developer-space.service.ts`, deriving key material from
  `DEVELOPER_SPACE_WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY`.
- Create/rotate endpoint:
  `POST /developer-spaces/:id/observed-runtime-signing-secret`.
- Revoke endpoint:
  `POST /developer-spaces/:id/observed-runtime-signing-secret/revoke`.
- Create/rotate requires owner/admin access and configured encryption; missing
  config returns
  `developer_space_webhook_signing_secret_encryption_unconfigured`.
- Raw `station_whsec_...` signing secrets are returned only on create/rotate.
  Later responses expose only id, owner/space scope, fingerprint, last four,
  status, and timestamps.
- Webhook verification now prefers the newest active dedicated signing secret
  when one exists and encryption is configured. Active dedicated secrets update
  `last_used_at` only after signature acceptance.
- PR125 ingestion-key fallback remains when no active dedicated signing secret
  exists or when the dedicated-secret primitive is not configured.
- If an active dedicated secret exists and encryption is configured, ingestion
  key signatures are rejected for observed-runtime webhooks.

Focused test coverage proves missing encryption config, owner-only create and
revoke, show-once raw secret behavior, no plaintext persistence, encrypted
storage plus hash/fingerprint metadata, active dedicated signature acceptance,
ingestion-key rejection while active dedicated secret exists, old/revoked
dedicated secret rejection, and fallback after revoke.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 24 tests passed, including observed-runtime signing-secret lifecycle and existing webhook idempotency/readback behavior. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 4 client tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API build completed. |
| `git diff --check` | Pass | CRLF normalization warnings only, including local agent state that was not staged. |

Non-claims preserved: no partner adapter, hosted runtime, Cloudflare
Worker/Vectorize/D1, worker, queue, user-pasted secret flow, vault UI,
billing/Stripe change, Redis memory truth, provider routing, chat-native
developer agent, broad UI, or visible secret-management surface was added.

## ARGUS Review - 2026-06-21

ARGUS accepts PR126 for the bounded 2C lane.

Review result:

- Schema and API behavior match the revised MIMIR decision: Station stores
  encrypted/retrievable signing material plus hash/fingerprint metadata, not
  hash-only material and not plaintext.
- Create/rotate/revoke routes are owner/admin scoped, and the route surface does
  not expose encrypted payloads, hashes, or raw secrets after show-once
  creation/rotation.
- Encryption-key semantics are explicit: create/rotate requires
  `DEVELOPER_SPACE_WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY`, while the PR125
  ingestion-key fallback remains available when no active dedicated secret can
  be used.
- Observed-runtime webhook verification prefers the newest active dedicated
  signing secret when configured; ingestion-key signatures are rejected while an
  active dedicated secret is in force; old/revoked dedicated secrets are
  rejected; fallback resumes after revoke.
- Existing PR124/PR125 idempotency, visibility, secret stripping, and
  non-secret response behavior remains covered by the Developer Spaces smoke
  gate.

ARGUS validation:

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass, 24 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass, 4 tests |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass |
| `git diff --check` | Pass, CRLF normalization warnings only |

Remaining non-claims: this is still an API/schema/test foundation, not partner
onboarding, hosted runtime execution, Cloudflare Worker/Vectorize/D1, queue or
worker infrastructure, user-pasted secrets, vault UI, billing, Redis memory
truth, provider routing, chat-native developer agent, broad UI, or visible
secret-management surface.
