# PR138 2C Observed Runtime Signing Secret Staging Proof

Status: Accepted by ARGUS on 2026-06-21 as a bounded signing-secret schema
proof plus new migration `047` receipts blocker; ready for MIMIR sequencing.

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

## DAEDALUS Result

DAEDALUS ran PR138 against staging on 2026-06-21 using local secret-bearing env
only. No raw Supabase URL, service role key, DB URL, auth token, replay
password, Developer Space key, signing material, raw webhook id, fixture
prompt/body/file path, `.env` value, Railway variable, or decrypted secret was
printed, written to docs, or committed.

Schema apply/proof method:

- The Supabase CLI pooler path remained unreliable for DDL after a first
  statement because it repeatedly hit:

```text
ERROR: prepared statement "lrupsc_1_0" already exists (SQLSTATE 42P05)
```

- DAEDALUS installed a temporary `pg@8.13.1` client outside the repo under the
  local temp directory, used simple unprepared SQL, and did not change Station
  package files.
- Migration `046` safety pieces were completed/proved:
  - `developer_space_observed_runtime_context_space_idx` returned
    `CREATE INDEX` through the CLI before the pooler collision returned;
  - RLS enable returned `ALTER`;
  - owner policy returned `CREATE`;
  - table comment returned `COMMENT`;
  - metadata queries proved table exists, RLS enabled, index present, owner
    policy present, and comment present.
- Migration `048` schema was applied/proved:
  - table returned `CREATE`;
  - both indexes returned `CREATE`;
  - trigger drop/create returned `DROP`/`CREATE`;
  - RLS enable returned `ALTER`;
  - owner policy returned `CREATE`;
  - table comment returned `COMMENT`;
  - metadata queries proved table exists, RLS enabled, both indexes present,
    trigger present, owner policy present, and comment present.
- `notify pgrst, 'reload schema'` returned `NOTIFY`.
- PostgREST/service-role probes then returned HTTP `200` for
  `developer_space_webhook_signing_secrets`.
- Active dedicated signing-secret count for `station-replay-dev-alpha` is `0`.
- The Supabase migration ledger is queryable, but direct DDL did not record
  migrations: matching ledger counts for `046` and `048` are both `0`. DAEDALUS
  did not repair or mutate ledger rows because that was not explicitly opened.

Bounded smoke result:

- Replay-owner signin returned HTTP `200`.
- `GET /developer-spaces` returned HTTP `200` with count `2`.
- Selected `station-replay-dev-alpha`, id hash `44e026dc4e6c`.
- Temporary named PR138 keys were created with
  `POST /developer-spaces/:id/ingestion-keys`, held in memory only, and revoked.
- The stale fixed-demo timestamp path returned HTTP `401`/`auth` with
  `developer_space_webhook_signature_stale`; this is a smoke-harness timestamp
  issue, not the remaining staging schema blocker.
- With a current timestamp, direct observed-runtime send got past signing-secret
  load/auth and returned the new bounded server blocker:

```text
developer_space_server_error: Could not claim observed runtime webhook receipt.
```

- PostGREST/service-role probe proves
  `public.developer_space_observed_runtime_webhook_receipts` is missing from the
  schema cache with `PGRST205`. That table is migration `047`, which PR138 did
  not authorize applying.
- Public and owner readback for `station-replay-dev-alpha` remained HTTP `200`
  with safe counts.
- Cleanup confirmed zero active PR138 smoke keys remain.

Classification:

- The prior PR137 signing-secret load blocker is cleared.
- No active dedicated signing secret exists, so the route uses ingestion-key
  HMAC fallback.
- The next blocker is not migration `048`; it is the missing/uncached migration
  `047` observed-runtime webhook receipts table.
- No accepted observed-runtime import/readback is claimed.
- Migration ledger repair for direct-applied `046`/`048` remains a separate
  operator decision.

Focused local validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 27 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 15 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API package build completed after dependency package builds. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks passed through turbo cache replay. |

## ARGUS Review - 2026-06-21

Verdict: Accepted as a bounded staging proof and blocker classification. Wake
MIMIR for the next schema/ledger sequencing decision.

Accepted findings:

- Migration `046` safety metadata is now proved for the supporting-context
  table: index present, RLS enabled, owner policy present, and table comment
  present.
- Migration `048` signing-secret metadata is proved: table present, both
  indexes present, update trigger present, RLS enabled, owner policy present,
  table comment present, and PostgREST sees the table after schema reload.
- Active dedicated signing-secret count for `station-replay-dev-alpha` is `0`,
  so ingestion-key HMAC fallback is the expected route behavior.
- The prior PR137 signing-secret load blocker is cleared. A current-timestamp
  send got past signing-secret load/auth and reached a new bounded server
  blocker: `Could not claim observed runtime webhook receipt.`
- The new blocker is correctly classified as missing/uncached
  `public.developer_space_observed_runtime_webhook_receipts`, which belongs to
  migration `047`, not the PR138-authorized `048` lane.
- Temporary PR138 named keys were revoked, cleanup found zero active PR138
  smoke keys, and no legacy key rotation was used.
- No raw Supabase URL, service key, DB URL, auth token, replay password,
  Developer Space key, signing material, raw webhook id, fixture prompt/body/
  path, `.env` value, Railway variable, decrypted secret, or committed secret
  was printed or written.

ARGUS cautions:

- No accepted observed-runtime import, successful replay/idempotency proof, or
  persisted import readback is claimed.
- Migration ledger state is not clean: `supabase_migrations.schema_migrations`
  is queryable but has zero matching rows for directly applied `046` and `048`.
  ARGUS accepts the metadata proof, not the migration-history state.
- Before applying `047` with another direct-DDL path, MIMIR should decide how to
  repair or intentionally document the ledger state for `046`/`048`, and how to
  avoid compounding migration-history drift.
- The stale fixed-demo timestamp `401` is correctly classified as a smoke
  harness timestamp issue; only the current-timestamp probe is relevant to the
  staging schema blocker.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 27 tests passed, including observed-runtime receipt, context, and signing-secret coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 15 tests passed, including guarded live-send helper behavior with mocked transport. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API package build completed after dependency package builds. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks replayed/passed through turbo. |
| `git diff --check` | Pass | CRLF normalization warnings only for local triad/docs state. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

ARGUS did not rerun live staging smoke because doing so would require
secret-bearing auth and another staging mutation. The accepted evidence is the
sanitized committed PR138 record plus local validation above.

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
