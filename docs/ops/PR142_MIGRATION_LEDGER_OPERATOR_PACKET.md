# PR142 Migration Ledger Operator Packet

Date: 2026-06-21

Status: ledger repair remains blocked through available official/operator-safe
paths. No migration history rows were inserted, updated, faked, or hand-edited.

ARGUS review on 2026-06-21 accepted this as a blocked repair/operator packet,
not a ledger repair. ARGUS confirmed this checkout has no
`infra/supabase/.temp/project-ref` marker and did not attempt a repair path from
the current shell.

## Current Ledger State

DAEDALUS queried `supabase_migrations.schema_migrations` through the available
Postgres pooler/proxy connection using a temporary `pg@8.13.1` client outside
the repo.

| Migration prefix | Ledger rows |
| --- | ---: |
| `045` | 0 |
| `046` | 0 |
| `047` | 0 |
| `048` | 0 |

The query used `count(m.version)` against exact or prefix-matched versions. An
earlier local draft query used `count(*)` over a left join and was discarded
because it would have reported one row per requested prefix even when the ledger
row was absent.

## Available Connection Paths

Safe local env inspection found:

| Env path | Status | Classification |
| --- | --- | --- |
| `SUPABASE_POOLER_URL` | Present | Postgres pooler/proxy path |
| `SUPABASE_DB_URL` | Missing | No direct Postgres path |
| `SUPABASE_DIRECT_URL` | Missing | No direct Postgres path |
| `DATABASE_URL` | Present | Project API URL, not Postgres |
| `SUPABASE_URL` | Present | Project API URL |
| `SUPABASE_ACCESS_TOKEN` | Present | Management token, not a DB URL |

No credential value, host, project ref, token, URL, or password was printed.

## Official Repair Path Attempted

Command shape:

```bash
npm exec --yes supabase@latest -- migration repair --linked --status applied --workdir infra --yes 045 046 047 048 --output json
```

Result:

- The CLI used workdir `infra`.
- It failed before database mutation because the checkout has no linked project
  ref.
- The safe error class was: project ref not found; run `supabase link`.

This was the only official path available that could have avoided the known
pooler prepared-statement collision.

## Pooler Path Classification

The only available Postgres DB URL is the pooler/proxy path. PR139 already tried
the official `supabase migration repair --db-url <pooler>` path for the same
ledger family and the CLI failed on the Supabase pooler prepared-statement
collision before updating rows.

PR142 did not rerun that known-broken pooler repair path because this lane
explicitly asked for an official or operator-safe path that avoids the broken
pooler prepared-statement route if available. No such direct/non-pooler path is
available in the current local environment.

## Schema State Still Proved

PR142 made no schema changes. Metadata readback confirmed the PR138-PR141 schema
facts remain present:

- `045`: `observed_runtime_classifications jsonb` columns exist on
  `developer_space_nodes`, `developer_space_events`, and
  `developer_space_snapshots`; object-shape checks and column comments are
  present.
- `046`: `developer_space_observed_runtime_context` exists with RLS enabled,
  one policy, table comment, and two indexes.
- `047`: `developer_space_observed_runtime_webhook_receipts` exists with RLS
  enabled, one policy, table comment, three indexes, and the
  `(developer_space_id, webhook_id)` unique constraint.
- `048`: `developer_space_webhook_signing_secrets` exists with RLS enabled, one
  policy, table comment, four indexes, and one non-internal trigger.

Observed-runtime staging acceptance remains valid despite ledger drift because
PR141 proved accepted import, same-delivery receipt replay, public readback, and
owner readback against the live staging API after the schema repairs.

## Future Repair Path

A future operator should choose one of these supported paths:

1. Link the Supabase project for this checkout with the official CLI, then rerun
   the linked repair command above.
2. Provide a direct non-pooler Postgres connection string and rerun
   `supabase migration repair --db-url <direct-postgres-url> --status applied`
   for `045 046 047 048`.
3. If neither supported path is available, MIMIR must open a separate manual SQL
   approval lane with the exact audited migration-history statement. PR142 does
   not grant that approval.

## Non-Claims

- No ledger rows were repaired.
- No new schema migration was applied.
- No broad migration sweep was run.
- No manual ledger SQL was executed.
- No observed-runtime API, adapter, UI, auth, billing, hosted runtime,
  Cloudflare, queue, Redis, provider-routing, or Developer Space product
  behavior changed.
- No secret values, credential-bearing URLs, `.env` values, Railway variables,
  DB URLs, service keys, auth tokens, project refs, or passwords were printed,
  written, or committed.
