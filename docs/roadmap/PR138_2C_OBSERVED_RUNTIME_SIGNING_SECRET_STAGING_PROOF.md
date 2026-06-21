# PR138 2C Observed Runtime Signing Secret Staging Proof

Status: Opened by MIMIR on 2026-06-21 for DAEDALUS.

## Why This Lane

PR137 cleared the original PR136 readback blocker:
`public.developer_space_observed_runtime_context` is now visible enough that
public and owner Developer Space readback return HTTP `200`.

The next live-send blocker is different:

```text
developer_space_server_error: Could not load Developer Space webhook signing secret.
```

Local route code reaches this error when
`loadActiveObservedRuntimeSigningSecret()` cannot query
`public.developer_space_webhook_signing_secrets`. That table is created by
`infra/supabase/migrations/048_developer_space_webhook_signing_secrets.sql`.

PR138 should first finish/prove the remaining migration `046` safety pieces
that PR137 could not prove, then prove whether staging has migration
`048`/schema-cache visibility for the signing-secret table, apply or reload
narrowly if needed, classify any active-secret/encryption-config state, and
rerun the bounded PR136/PR137 smoke.

## Scope

- Finish/prove the remaining migration `046` safety pieces before claiming
  accepted observed-runtime imports:
  - `developer_space_observed_runtime_context` index;
  - RLS enabled;
  - owner policy;
  - table comment;
  - migration ledger status if safely queryable.
- Confirm staging table/schema-cache state for
  `public.developer_space_webhook_signing_secrets` without printing secrets.
- Confirm whether migration `048` is recorded/applied if the migration ledger is
  safely queryable.
- Apply only `infra/supabase/migrations/048_developer_space_webhook_signing_secrets.sql`
  if absent and safe to apply.
- If the table exists but PostgREST/schema cache cannot see it, trigger/request
  schema-cache reload rather than reapplying blindly.
- Prove safe metadata where queryable:
  - table exists;
  - indexes exist;
  - trigger exists;
  - RLS/policy exists;
  - active signing-secret row count for `station-replay-dev-alpha` without
    exposing secret material.
- Do not create, rotate, revoke, decrypt, print, or persist any real signing
  secret unless MIMIR explicitly opens that as a separate lane.
- Rerun the bounded smoke with `station-replay-dev-alpha`:
  - create a temporary named ingestion key via
    `POST /developer-spaces/:id/ingestion-keys`;
  - do not use legacy key rotation;
  - keep raw key in memory only;
  - run the guarded Agents Observe live-send path;
  - verify whether ingestion-key HMAC fallback now works when no active
    dedicated signing secret exists;
  - revoke the temporary named key.
- If an active dedicated signing secret exists and blocks fallback due to
  config/decryption state, classify that precisely without printing values.

## Acceptance

- Migration `046` is fully applied/proved, or any remaining unproved index/RLS/
  policy/comment/ledger state is precisely classified and does not get glossed
  over.
- The prior generic signing-secret-load error is cleared or precisely
  classified.
- If no active dedicated signing secret exists, the deployed route should be
  able to use ingestion-key fallback after the signing-secret table query works.
- If an active dedicated signing secret exists, PR138 must classify whether the
  blocker is encryption config, malformed encrypted material, schema/cache, or
  something else.
- Temporary smoke named key is revoked.
- No secret values are printed, committed, written to `.env`, docs, logs, or
  Railway variables.

## Validation

Run focused local gates:

```bash
pnpm test:developer-spaces
pnpm test:developer-space-client
pnpm --filter @station/api build
pnpm typecheck
git diff --check
```

For staging proof, record only safe facts:

- migration `046` index/RLS/policy/comment/ledger proof;
- migration `048` table/index/policy/trigger presence;
- schema-cache reload status if used;
- active dedicated-signing-secret count only;
- named-key create/revoke status classes;
- live-send accepted/bounded response class;
- public/owner readback status classes and safe counts.

## Non-Scope

- No broad migration sweep.
- No unrelated schema repair.
- No signing-secret create/rotate/revoke/decrypt lane.
- No legacy key rotation.
- No committed secrets.
- No writing smoke keys or signing secrets to `.env` or Railway variables.
- No Cloudflare Worker, Vectorize, D1, Queue, or Durable Object work.
- No hosted runtime, scheduler, agent control plane, or execution surface.
- No UI changes.
- No billing/Stripe, Redis memory truth, provider routing, or retrieval model
  changes.

## Handoff

Wake ARGUS with:

- schema apply/proof method for migration `048`;
- table/index/trigger/RLS/policy/schema-cache evidence;
- active dedicated signing-secret count classification;
- PR136/PR137 rerun evidence;
- named-key create/revoke proof;
- no legacy rotation proof;
- accepted/bounded live-send response;
- public/owner readback proof if reached;
- validation results;
- no-secret proof;
- explicit non-claims.

Wake MIMIR instead if staging schema application is blocked by missing external
access, if migration state is ambiguous, or if active signing-secret/config
state requires a product/security decision before continuing.
