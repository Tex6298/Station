# PR139 2C Observed Runtime Webhook Receipts Staging Proof

Status: Opened by MIMIR on 2026-06-21 for DAEDALUS.

## Why This Lane

PR138 cleared the prior signing-secret load blocker for
`station-replay-dev-alpha`: migration `048` metadata is proved, active dedicated
signing-secret count is `0`, and the deployed route can use ingestion-key HMAC
fallback.

The current-timestamp live-send path now reaches the next bounded server
blocker:

```text
developer_space_server_error: Could not claim observed runtime webhook receipt.
```

PostgREST/service-role proof classified that blocker as missing or uncached
`public.developer_space_observed_runtime_webhook_receipts`, which belongs to
migration `047_observed_runtime_webhook_receipts.sql`.

PR138 also proved that `supabase_migrations.schema_migrations` is queryable but
has zero matching rows for the direct-applied `046` and `048` DDL. PR139 must
not pretend that migration history is clean.

## Scope

- Inspect and document the migration ledger state for direct-applied `046` and
  `048`.
- Reconcile ledger rows only if the deployed schema is proved equivalent to the
  exact migration files and the repair method is clearly safe.
- If safe ledger repair is not available, classify the ledger gap explicitly
  and avoid compounding it silently.
- Apply or prove migration `047_observed_runtime_webhook_receipts.sql`:
  - table;
  - unique `(developer_space_id, webhook_id)` constraint;
  - index;
  - RLS enabled;
  - owner policy;
  - table comment;
  - PostgREST/schema-cache visibility;
  - migration ledger status.
- Rerun the bounded named-key smoke for `station-replay-dev-alpha`:
  - create one temporary named key;
  - keep the raw key in memory only;
  - do not use legacy rotation;
  - revoke only the temporary named key;
  - prove cleanup.
- Retry current-timestamp observed-runtime live send.
- If receipts are now claimable, prove one of:
  - accepted import plus public/owner readback; or
  - a newly bounded blocker with exact route/error classification.
- If the route accepts a delivery, prove idempotency at least once with a safe
  repeat delivery or explain why the repeat would be unsafe in staging.

## Acceptance

- Ledger state for direct-applied `046`/`048` is no longer ambiguous.
- Migration `047` receipt storage is applied/proved or its absence is precisely
  classified.
- PostgREST can see
  `public.developer_space_observed_runtime_webhook_receipts`, or the schema-cache
  blocker is explicitly classified.
- Current-timestamp live send no longer stops on
  `Could not claim observed runtime webhook receipt`, or that exact blocker is
  re-proved after the `047` attempt.
- Temporary named key is revoked and cleanup is proved.
- No secret values, raw webhook ids, fixture bodies, URLs with credentials,
  tokens, signing material, `.env` values, or Railway variables are printed,
  written, or committed.

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

- migration `046`/`048` ledger classification;
- migration `047` table/constraint/index/RLS/policy/comment proof;
- schema-cache reload status if used;
- named-key create/revoke status classes;
- no legacy rotation proof;
- live-send accepted/bounded response class;
- idempotency/replay response class if reached;
- public/owner readback status classes and safe counts.

## Non-Scope

- No broad migration sweep.
- No unrelated schema repair.
- No fake migration ledger rows when schema equivalence is not proved.
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

- ledger classification/repair proof for direct-applied `046`/`048`;
- migration `047` apply/proof method;
- table/constraint/index/RLS/policy/comment/schema-cache evidence;
- named-key create/revoke proof;
- no legacy rotation proof;
- accepted/bounded live-send response;
- idempotency/replay proof if reached;
- public/owner readback proof if reached;
- validation results;
- no-secret proof;
- explicit non-claims.

Wake MIMIR instead if ledger repair requires a product/operator decision, if
staging schema application is blocked by missing external access, or if the next
blocker requires changing PR scope.
