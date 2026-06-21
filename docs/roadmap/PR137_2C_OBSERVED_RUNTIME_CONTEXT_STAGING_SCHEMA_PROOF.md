# PR137 2C Observed Runtime Context Staging Schema Proof

Status: Opened by MIMIR on 2026-06-21 for DAEDALUS.

## Why This Lane

PR136 proved the dedicated-key staging smoke path up to the deployed schema
boundary:

- named key create/list/revoke worked;
- legacy key rotation was not used;
- the guarded Agents Observe live-send path reached staging;
- the temporary smoke key was revoked;
- no secrets were printed, committed, written to `.env`, or written to Railway.

The blocker is not client code or named-key behavior. Staging failed with:

```text
Could not find the table 'public.developer_space_observed_runtime_context' in the schema cache
```

The repo already contains `infra/supabase/migrations/046_observed_runtime_supporting_context.sql`,
which creates `public.developer_space_observed_runtime_context`. PR137 should
apply/prove that schema on the staging Supabase target, reload PostgREST schema
cache if needed, and rerun the bounded PR136 smoke/readback.

## Scope

- Confirm whether staging already has migration `046` recorded/applied without
  printing secrets.
- Apply only the missing observed-runtime supporting-context schema if absent:
  `infra/supabase/migrations/046_observed_runtime_supporting_context.sql`.
- If migration `046` is recorded but PostgREST still cannot see the relation,
  trigger or request a schema-cache reload rather than reapplying blindly.
- Prove the table exists in the staging database through non-secret metadata:
  table presence, index/policy presence where safely queryable, and migration
  ledger status if available.
- Rerun the PR136 smoke using `station-replay-dev-alpha` and a temporary named
  `PR137/PR136 observed-runtime smoke` key:
  - create named key with `POST /developer-spaces/:id/ingestion-keys`;
  - do not use legacy `POST /developer-spaces/:id/api-key`;
  - keep raw key in memory only;
  - run guarded Agents Observe live send;
  - verify accepted/bounded response;
  - verify public/owner readback no longer fails on missing
    `developer_space_observed_runtime_context`;
  - revoke the temporary named key.
- Capture only sanitized evidence: route/status classes, counts, table/migration
  names, short non-sensitive identifiers, and no raw secrets.

## Acceptance

- Staging table/schema-cache blocker is resolved or precisely classified.
- PR136 smoke can either:
  - complete with accepted import plus safe readback proof; or
  - fail with a new bounded non-secret blocker that is not the missing context
    table/schema-cache error.
- Temporary smoke named key is revoked unless MIMIR explicitly accepts keeping a
  reusable smoke key.
- No legacy key rotation is used.
- No secret values are printed, committed, written to `.env`, written to docs,
  or written to Railway variables.

## Validation

Run focused local gates:

```bash
pnpm test:developer-spaces
pnpm test:developer-space-client
pnpm --filter @station/api build
pnpm typecheck
git diff --check
```

For staging proof, record safe facts only:

- migration/table presence;
- PostgREST/schema-cache reload status if used;
- named-key create/revoke status classes;
- live-send accepted/bounded response class;
- public/owner readback status classes and safe counts.

## Non-Scope

- No broad migration sweep.
- No unrelated staging schema repair.
- No legacy key rotation.
- No committed secrets.
- No writing smoke keys to `.env` or Railway variables.
- No Cloudflare Worker, Vectorize, D1, Queue, or Durable Object work.
- No hosted runtime, scheduler, agent control plane, or execution surface.
- No UI changes.
- No billing/Stripe, Redis memory truth, provider routing, or retrieval model
  changes.

## Handoff

Wake ARGUS with:

- schema apply/proof method;
- migration/table/schema-cache evidence;
- PR136 rerun evidence;
- named-key create/revoke proof;
- no legacy rotation proof;
- accepted/bounded live-send response;
- public/owner readback proof;
- validation results;
- no-secret proof;
- explicit non-claims.

Wake MIMIR instead if staging schema application is blocked by missing external
access, if migration state is ambiguous, or if applying `046` would risk a broad
schema change outside this lane.
