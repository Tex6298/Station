# PR135 2C Developer Space Named Ingestion Keys

Status: Accepted by ARGUS on 2026-06-21; ready for MIMIR closeout.

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

## Implementation Notes

API route shape:

- `GET /developer-spaces/:id/ingestion-keys`: owner/admin only, lists
  non-secret key metadata.
- `POST /developer-spaces/:id/ingestion-keys`: owner/admin only, creates one
  named active key without revoking unrelated active keys and returns raw
  `apiKey` only in that create response.
- `POST /developer-spaces/:id/ingestion-keys/:keyId/revoke`: owner/admin only,
  revokes a specific key scoped to that Developer Space.

Schema assessment:

- No migration was needed. The existing `developer_space_ingestion_keys` table
  already has `label`, `status`, `key_last_four`, `created_at`,
  `last_used_at`, and `revoked_at`.
- `developer_spaces.api_key_hash`, `api_key_last_four`, and
  `api_key_created_at` remain legacy/default summary fields.

Behavior:

- Legacy `POST /developer-spaces/:id/api-key` and
  `POST /developer-spaces/:id/api-key/revoke` keep their existing rotate/revoke
  semantics.
- Ingestion auth already checks `developer_space_ingestion_keys` by hash and
  active status before the legacy `developer_spaces.api_key_hash` fallback, so
  active named keys authorize ingestion and revoked keys fail.
- Metadata serialization exposes id, Developer Space id, owner id, label,
  status, key last four, and timestamps only. It never exposes raw keys or
  hashes.

PR130 smoke setup guidance:

- Create or select a dedicated smoke Developer Space.
- Create a named ingestion key labelled for smoke/operator use.
- Copy the one-time raw key from the create response into the external sender
  environment as `STATION_DEVELOPER_KEY`.
- Do not store `STATION_DEVELOPER_KEY` as general Station app/backend config.
- Do not rotate real integration keys for smoke.

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

DAEDALUS implementation validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 27 tests passed, including named-key no-rotation, metadata-only list, targeted revoke, legacy rotate compatibility, active named observed-runtime ingest, revoked key failure, cross-space targeted revoke failure, owner/admin auth, and no raw key/hash readback. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 15 tests passed, including observed-runtime client signing and guarded Agents Observe live-send tests. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API build completed after dependency package builds. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck executed; web typecheck passed from cache. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

## ARGUS Review - 2026-06-21

Verdict: Accepted. Wake MIMIR for closeout and next sequencing.

Review findings:

- The implementation matches the PR135 lane: owner/admin-only create/list/revoke
  routes were added for named ingestion keys, while the legacy rotate/revoke
  endpoints keep their existing semantics.
- No migration was needed; the existing baseline migration already defines
  `developer_space_ingestion_keys.label`, `status`, `key_last_four`,
  `created_at`, `updated_at`, `last_used_at`, and `revoked_at`.
- Named key creation inserts an active key row and does not revoke unrelated
  active keys. Legacy `POST /developer-spaces/:id/api-key` still revokes prior
  active keys, including named keys, so PR130 smoke should use the new named-key
  route rather than legacy rotate.
- Targeted revoke is scoped by both key id and Developer Space id, with
  cross-space revoke returning 404.
- Ingestion auth checks active named-key hashes before the legacy
  `developer_spaces.api_key_hash` fallback. Active named keys authorize signed
  observed-runtime ingest; revoked named keys fail auth.
- Key list/revoke serializers return metadata only: id, Developer Space id,
  owner id, label, status, last-four, and timestamps. Raw key material is
  returned only once from create, and hashes are not serialized.
- PR130 guidance correctly keeps `STATION_DEVELOPER_KEY` as external
  sender/operator env only, not general Station backend config.
- No live smoke send, real staging key creation, committed secret, hosted
  runtime, Cloudflare, queue, UI, billing, provider-routing, Redis, or retrieval
  scope expansion was introduced.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 27 tests passed, including named-key no-rotation, metadata-only list, targeted revoke, legacy rotate compatibility, active signed observed-runtime ingest, revoked-key failure, and no raw key/hash readback. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 15 tests passed; PR128-PR134 client signing, dry-run, and guarded live-send behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API package build completed after dependency package builds. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck executed; web typecheck replayed from cache. |
| `git diff --check` | Pass | CRLF normalization warnings only for local triad state. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## MIMIR Closeout - 2026-06-21

MIMIR closes PR135 as accepted. The next chosen lane is PR136 2C Observed
Runtime Dedicated-Key Staging Smoke: use the new named-key route for a
dedicated smoke/operator key and run the guarded Agents Observe live-send path
against staging if auth/config is available, without using legacy key rotation
or printing/writing secrets.

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
