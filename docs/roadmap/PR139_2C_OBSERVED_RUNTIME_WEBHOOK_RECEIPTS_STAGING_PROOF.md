# PR139 2C Observed Runtime Webhook Receipts Staging Proof

Status: Accepted by ARGUS on 2026-06-21 as a bounded webhook-receipts schema
proof plus observed-runtime classification blocker; ready for MIMIR sequencing.

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

## DAEDALUS Result

DAEDALUS ran PR139 against staging on 2026-06-21 using local secret-bearing env
only. No raw Supabase URL, service role key, DB URL, auth token, replay
password, Developer Space key, signing material, raw webhook id, fixture
prompt/body/file path, `.env` value, or Railway variable was printed, written
to docs, or committed.

Schema apply/proof method:

- Reused a temporary `pg@8.13.1` client outside the repo for simple unprepared
  SQL. Station package files were not changed.
- Applied/proved migration `047_observed_runtime_webhook_receipts.sql`:
  - table returned `CREATE`;
  - `(developer_space_id, webhook_id)` unique constraint is present;
  - `developer_space_observed_runtime_webhook_receipts_space_idx` is present;
  - RLS enable returned `ALTER`;
  - owner policy returned `CREATE`;
  - table comment returned `COMMENT`;
  - metadata queries proved table, unique constraint, index, RLS, owner policy,
    and comment.
- `notify pgrst, 'reload schema'` returned `NOTIFY`.
- PostgREST/service-role probe for
  `developer_space_observed_runtime_webhook_receipts` returned HTTP `200`.

Ledger classification:

- Before ledger repair, matching ledger counts for direct-applied migrations
  `046`, `047`, and `048` were all `0`.
- The official Supabase command
  `migration repair --status applied --db-url <encoded pooler url> --workdir
  infra --yes 046 047 048` found the right migration directory but failed
  before updating rows with:

```text
ERROR: prepared statement "lrupsc_1_0" already exists (SQLSTATE 42P05)
```

- A follow-up metadata query confirmed ledger counts for `046`, `047`, and
  `048` remained `0`.
- DAEDALUS did not hand-edit migration history rows. Ledger repair remains an
  operator/tooling follow-up, not silently faked migration state.

Bounded smoke result:

- Replay-owner signin returned HTTP `200`.
- `GET /developer-spaces` returned HTTP `200` with count `2`.
- Selected `station-replay-dev-alpha`, id hash `44e026dc4e6c`.
- Temporary named PR139 keys were created with
  `POST /developer-spaces/:id/ingestion-keys`, held in memory only, and revoked.
- Current-timestamp observed-runtime delivery no longer stops on
  `Could not claim observed runtime webhook receipt`.
- First delivery with a fresh webhook id reached payload validation and returned
  HTTP `400` with:

```text
developer_space_observed_runtime_classification_failed
```

- Repeating the same delivery returned HTTP `400` with:

```text
developer_space_webhook_processing_failed
```

  That proves the receipt row was claimed and finalized with a failed response;
  idempotency/replay now works for the failed-delivery path.
- A follow-up fresh delivery captured the same high-level classification error;
  the sanitized `details` array was empty.
- Public and owner readback for `station-replay-dev-alpha` remained HTTP `200`
  with safe counts.
- Cleanup confirmed zero active PR139 smoke keys remain.

Classification:

- The migration `047` receipt-table/schema-cache blocker is cleared.
- Current-timestamp live send now reaches the next bounded blocker:
  observed-runtime payload classification validation for the Agents Observe
  fixture.
- No accepted observed-runtime import/readback is claimed.
- Direct-applied migration ledger rows for `046`/`047`/`048` remain absent
  because official repair failed on the pooler prepared-statement collision.

Focused local validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 27 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 15 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API package build completed after dependency package builds. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks passed through turbo cache replay. |

## ARGUS Review - 2026-06-21

Verdict: Accepted as a bounded staging proof and blocker classification. Wake
MIMIR for the next ledger/classification sequencing decision.

Accepted findings:

- Migration `047` receipt storage is now metadata-proved: table present,
  `(developer_space_id, webhook_id)` unique constraint present, index present,
  RLS enabled, owner policy present, table comment present, and PostgREST sees
  the table after schema reload.
- The prior PR138 receipt-claim blocker is cleared. Current-timestamp live send
  no longer stops on `Could not claim observed runtime webhook receipt`.
- First delivery now reaches the next bounded blocker:
  `developer_space_observed_runtime_classification_failed`.
- Repeating the same webhook id/payload returns the stored failed response,
  `developer_space_webhook_processing_failed`, so failed-delivery receipt replay
  is proved. This is not a successful import replay proof.
- Temporary PR139 named keys were revoked, cleanup found zero active PR139
  smoke keys, and no legacy key rotation was used.
- No Supabase URL, service key, DB URL, auth token, replay password, Developer
  Space key, signing material, raw webhook id, fixture prompt/body/path, `.env`
  value, Railway variable, or committed secret was printed or written.

ARGUS cautions:

- No accepted observed-runtime import, successful replay/idempotency proof, or
  persisted import readback is claimed.
- Migration ledger state remains unclean: official Supabase migration repair
  found `046`, `047`, and `048` but failed on the pooler prepared-statement
  collision, and matching ledger counts remain `0`. ARGUS accepts metadata
  proof, not migration-history cleanliness.
- The classification error is now the next real blocker. The committed staging
  evidence records the high-level code and an empty sanitized `details` array
  for one fresh probe; it should not be generalized into a guarantee that all
  future classification details are empty.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 27 tests passed, including observed-runtime receipt, failed-receipt replay, context, and signing-secret coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 15 tests passed, including guarded live-send helper behavior with mocked transport. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API package build completed after dependency package builds. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks replayed/passed through turbo. |
| `git diff --check` | Pass | CRLF normalization warnings only for local triad/docs state. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

ARGUS did not rerun live staging smoke because doing so would require
secret-bearing auth and another staging mutation. The accepted evidence is the
sanitized committed PR139 record plus local validation above.

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
