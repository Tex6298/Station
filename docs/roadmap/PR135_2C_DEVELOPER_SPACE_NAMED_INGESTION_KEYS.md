# PR135 2C Developer Space Named Ingestion Keys

Status: Opened by MIMIR on 2026-06-21 for DAEDALUS.

## Why This Lane

PR134 proved the Agents Observe adapter can cross from offline dry run to a
guarded live-send path without accidental network calls. A separate A1 wakeup
clarified the smoke-config boundary:

- `STATION_API_URL` is already local app/runtime config and should not remain a
  blocker.
- `STATION_DEVELOPER_KEY` is not general Station backend config; it is
  integration/operator secret material for an external sender.
- Smoke should prefer a dedicated smoke Developer Space/key or a proper
  operator secret flow.
- Do not rotate real integration keys just to make smoke pass.

Current API behavior makes `POST /developer-spaces/:id/api-key` revoke every
active `developer_space_ingestion_keys` row for the Developer Space before
creating a new default key. That is fine for legacy rotate semantics, but it is
not safe enough for a dedicated smoke/operator key because it can break an
existing integration.

PR135 should add named ingestion-key lifecycle behavior so live smoke can use a
dedicated key without disrupting real keys.

## Scope

- Preserve the existing legacy rotate/revoke endpoints and their current
  behavior unless a focused compatibility adjustment is unavoidable.
- Add a narrow owner/admin API for named ingestion keys:
  - create a named key without revoking unrelated active keys;
  - list non-secret key metadata for a Developer Space;
  - revoke a specific key by id;
  - return raw key material only once on create.
- Use the existing `developer_space_ingestion_keys` table if possible:
  - `label`;
  - `status`;
  - `key_last_four`;
  - `created_at`;
  - `last_used_at`;
  - `revoked_at`.
- Keep `developer_spaces.api_key_hash/api_key_last_four/api_key_created_at` as
  legacy/default summary fields unless DAEDALUS proves they need a small
  compatibility update.
- Ensure ingestion auth continues to accept any active named key for the target
  Developer Space and still rejects revoked/other-space/other-owner keys.
- Add tests for:
  - named key creation does not revoke existing active keys;
  - list returns metadata only, never key hashes or raw keys;
  - targeted revoke revokes only that key;
  - legacy rotate still revokes prior active keys as documented;
  - active named smoke key authorizes observed-runtime ingest;
  - revoked named key fails;
  - other-space key fails;
  - owner/admin authorization;
  - export/readback never exposes raw keys or hashes.
- Document the intended PR130 smoke setup:
  - create or select a dedicated smoke Developer Space;
  - create a named key labelled for smoke/operator use;
  - use that one-time raw key as `STATION_DEVELOPER_KEY` in the external sender
    environment only;
  - do not store it as general Station app/backend env;
  - do not rotate real integration keys for smoke.

## Acceptance

- Live smoke can get a dedicated integration key without invalidating unrelated
  active keys.
- Owner-facing/key-listing responses expose only safe metadata.
- Existing legacy rotate/revoke semantics remain covered by tests.
- The PR130 config boundary is documented accurately:
  - `STATION_API_URL` is app URL;
  - `STATION_DEVELOPER_KEY` is external sender/operator config;
  - `STATION_OBSERVED_RUNTIME_WEBHOOK_ID` is the delivery/idempotency value;
  - optional signing secret remains separate from the ingestion key when
    dedicated observed-runtime signing secrets are active.

## Validation

Run focused gates:

```bash
pnpm test:developer-spaces
pnpm test:developer-space-client
pnpm --filter @station/api build
pnpm typecheck
git diff --check
```

If UI types or shared types are touched, add the relevant web/shared package
typecheck and report it.

## Non-Scope

- No live smoke send.
- No creation of real staging keys from this agent.
- No committed secrets.
- No Railway/Supabase/Cloudflare config request.
- No Cloudflare Worker, Vectorize, D1, Queue, or Durable Object work.
- No hosted runtime, scheduler, agent control plane, or execution surface.
- No broad UI redesign; metadata/readback UI only if already necessary to prove
  owner usability.
- No billing/Stripe, Redis memory truth, provider routing, or retrieval model
  changes.

## Handoff

Wake ARGUS with:

- API route shape;
- schema/migration assessment if any;
- owner/admin auth proof;
- no-rotation proof for named keys;
- legacy rotate compatibility proof;
- targeted revoke proof;
- ingestion auth proof;
- serialization/no-secret proof;
- exact PR130 smoke-config guidance;
- validation results;
- explicit non-claims.

Wake MIMIR instead if the existing table/route shape cannot support named keys
without a broader secret-management design.
