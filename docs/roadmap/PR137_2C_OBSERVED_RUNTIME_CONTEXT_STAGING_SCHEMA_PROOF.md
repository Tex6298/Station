# PR137 2C Observed Runtime Context Staging Schema Proof

Status: Implemented by DAEDALUS on 2026-06-21; ready for ARGUS review.

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

## DAEDALUS Result

DAEDALUS ran PR137 against staging on 2026-06-21 using local secret-bearing env
only. No raw Supabase URL, service key, auth token, Developer Space key,
webhook signing material, replay password, raw webhook id, fixture prompt/body,
fixture file path, or Railway variable value was printed, written to docs, or
committed.

Schema/cache result:

- Initial public and owner readback for `station-replay-dev-alpha` still failed
  with HTTP `500` and:

```text
Could not find the table 'public.developer_space_observed_runtime_context' in the schema cache
```

- `npx --yes supabase@latest db query --db-url <local pooler url> --file
  infra/supabase/migrations/046_observed_runtime_supporting_context.sql` could
  connect, but failed because the pooler/CLI path cannot execute the
  multi-statement migration file as one prepared statement.
- DAEDALUS applied only the first migration `046` statement, the
  `create table if not exists public.developer_space_observed_runtime_context`
  DDL, through a temporary no-BOM one-statement SQL file. The CLI returned
  `CREATE TABLE`.
- The remaining `046` index/RLS-policy/comment statements and migration-ledger
  proof were blocked by the Supabase pooler prepared-statement collision:

```text
ERROR: prepared statement "lrupsc_1_0" already exists (SQLSTATE 42P05)
```

- A later public/owner readback probe returned HTTP `200` for both public and
  owner reads. Safe counts were nodes `1`, events `1`, supporting context `0`.
  The missing `developer_space_observed_runtime_context` schema-cache error was
  gone.

Bounded smoke result:

- Replay-owner signin returned HTTP `200`.
- `GET /developer-spaces` returned HTTP `200` with count `2`.
- Selected `station-replay-dev-alpha`, id hash `44e026dc4e6c`.
- Temporary named PR137 key create returned HTTP `201`; the key was held in
  memory only and revoked after the probe.
- Guarded Agents Observe live send was explicitly enabled with
  `liveSend.enabled: true`, reached staging twice, and returned HTTP `500`
  with response class `server`.
- Public and owner readback after live-send attempts both returned HTTP `200`,
  not the prior missing-context schema-cache error.
- Direct sanitized send captured the new bounded server error:

```text
developer_space_server_error: Could not load Developer Space webhook signing secret.
```

- Targeted revoke returned HTTP `200`, and a cleanup probe confirmed zero
  active PR137 smoke keys remain for labels `PR137 observed-runtime staging
  smoke` and `PR137 observed-runtime direct error probe`.

Classification:

- The original PR136 blocker, missing
  `public.developer_space_observed_runtime_context` from PostgREST schema cache,
  is cleared for readback.
- PR137 did not prove a complete migration-ledger/index/RLS-policy state
  because the current Supabase CLI/pooler path rejects follow-up prepared
  statements.
- The next live-ingest blocker is not the supporting-context table. It is the
  deployed observed-runtime signing-secret load/config boundary:
  `Could not load Developer Space webhook signing secret.`
- No accepted observed-runtime import/readback is claimed.

Focused local validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 27 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 15 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API package build completed after dependency package builds. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks passed through turbo cache replay. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

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
