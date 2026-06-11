# Staging migration 029 proof

Date: 2026-06-11

Status: applied and proven on staging. The provider-aware RPC signatures are
available through PostgREST and public deployment health now reports migration
object proof as green.

## 2026-06-11 resolution

MIMIR applied `infra/supabase/migrations/029_gemini_embedding_provider_prep.sql`
through the Supabase shared pooler after Marty provided the IPv4-compatible
pooler host/user details. The existing direct `DATABASE_URL` supplied the
database password, and the assembled pooler URL stayed in process memory only.

Apply path:

- Supabase MCP remained blocked with `OAuth authorization required`.
- The direct database host remained IPv6-only from this Windows shell.
- Supabase CLI `db query` could connect through the transaction pooler only when
  statement caching was disabled, but it could not execute the multi-command
  migration file as one prepared statement.
- MIMIR used a temporary `node-postgres` client outside the repo, connected
  through the shared pooler with TLS enabled, ran the migration inside a
  transaction, and notified PostgREST to reload schema.

Remote schema proof:

| Probe | Result |
| --- | --- |
| Provider-aware RPC count before apply | `0` |
| Provider-aware RPC count after apply | `2` |
| `node scripts/prove-staging-migration-029.mjs` | Pass; both RPCs returned HTTP `200` with `rowCount: 0`. |
| `/health/deployment` migration readiness | Pass; `readiness.migrations.ok: true`, latest proof `025-029/public_schema_object_and_rpc_proof`. |

Deployment readiness is still not fully green because Supabase Auth redirect
management proof remains `not_supported`; this is separate from migration
`029`.

Supabase advisory surfaced during the pooler query:

- `public.integrity_questions` has Row Level Security disabled.
- No RLS remediation was applied in this migration lane.
- ARGUS should review whether this table is intentionally public seed/config
  data or needs explicit RLS plus policies before staging replay is called
  hardened.

## Current result

DAEDALUS attempted the migration-029 proof lane after MIMIR opened it with
`WAKEUP A2:` in commit `01c9586`. The earlier blocked state below is retained as
historical access context.

What was proven before the pooler apply:

- The local migration file exists at
  `infra/supabase/migrations/029_gemini_embedding_provider_prep.sql`.
- Public API readiness is deployed far enough to require provider-aware RPC
  proof for `station_free_1536`.
- The current staging project was still missing the provider-aware RPC overloads
  introduced by migration `029`.

What was not proven before the pooler apply:

- Data-backed Gemini retrieval is not proven.
- Replay readiness must not be claimed from this state.

## Exact blocker

Supabase MCP was available but not authorized:

```text
OAuth authorization required
```

The local Supabase CLI is available, but it is not logged in or linked:

```text
Access token not provided. Supply an access token by running `supabase login` or setting the SUPABASE_ACCESS_TOKEN environment variable.
Cannot find project ref. Have you run supabase link?
```

The local `.env` has a staging `DATABASE_URL`, but the direct Supabase database
host resolves only to an IPv6 address on this machine. Both migration history
and dry-run push attempts fail before authentication:

```text
failed to connect to `host=db.jdewavktyemnpehdzvgl.supabase.co user=postgres database=postgres`: hostname resolving error
```

Retrying with `--dns-resolver https` still returned no usable IPv4 address:

```text
failed to locate valid IP for db.jdewavktyemnpehdzvgl.supabase.co
```

DAEDALUS retried after MIMIR completed `codex mcp login supabase` on
2026-06-11. This loaded DAEDALUS process still receives the same MCP transport
error:

```text
OAuth authorization required
```

The Supabase CLI still has no local access token or link state, and `.env` does
not contain a pooler/supavisor URL. The remaining apply paths are therefore:

- a genuinely fresh Codex/MCP worker that sees the completed Supabase OAuth
  grant;
- a `SUPABASE_ACCESS_TOKEN` for the Supabase CLI;
- an IPv6-capable shell for the direct database host; or
- a staging pooler connection string.

DAEDALUS retried again after MIMIR routed commit `b209ac0` back to A2 for a
fresh Supabase MCP check. This process still fails before any Supabase read with
the same MCP transport error on both `list_tables` and `list_migrations`:

```text
OAuth authorization required
```

No migration apply was attempted from this state.

## Remote proof attempt

Public readiness probe:

```bash
curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment
```

Sanitized result observed on 2026-06-11:

| Field | Result |
| --- | --- |
| `ready` | `false` |
| `checks.embeddingProfileCode` | `station_free_1536` |
| `checks.embeddingProvider` | `gemini` |
| `checks.embeddingsConfigured` | `true` |
| `checks.geminiEmbeddings` | `true` |
| `checks.stripeBilling` | `true` |
| `checks.stripePrices` | `true` |
| `checks.redisConfigured` | `true` |
| `readiness.database.ok` | `true` |
| `readiness.storage.ok` | `true` |
| `readiness.migrations.ok` | `false` |
| `readiness.migrations.error` | `query_failed` |

Direct PostgREST RPC proof can run without printing keys:

```bash
node scripts/prove-staging-migration-029.mjs
```

Current output fails with `PGRST202` for both provider-aware RPC calls:

```text
match_memory_items: could not find parameters match_count, p_embedding_index_name, p_embedding_model, p_embedding_provider, p_persona_id, query_embedding
match_private_archive_chunks: could not find parameters match_count, p_embedding_index_name, p_embedding_model, p_embedding_provider, p_owner_user_id, p_persona_id, query_embedding
```

PostgREST hints show the old signatures are still the only cached functions:

```text
match_memory_items(match_count, p_persona_id, query_embedding)
match_private_archive_chunks(match_count, p_owner_user_id, p_persona_id, query_embedding)
```

That is the expected blocker when migration `029` has not been applied.

## Apply checklist

Use exactly one of these apply paths after confirming the target is the staging
Supabase project, not production.

Supabase MCP path:

1. Authorize the Supabase MCP connection.
2. Apply migration `029_gemini_embedding_provider_prep` with the contents of
   `infra/supabase/migrations/029_gemini_embedding_provider_prep.sql`.
3. Re-run the proof commands below.

Supabase CLI linked-project path:

```bash
npx --yes supabase link --project-ref <staging-project-ref> --workdir infra/supabase
npx --yes supabase db push --linked --workdir infra/supabase
```

Supabase CLI explicit database URL path:

```bash
npx --yes supabase db push --db-url <percent-encoded-staging-database-url> --workdir infra/supabase
```

If the direct database host is IPv6-only from the local machine, use either an
IPv6-capable shell or the Supabase dashboard's pooler connection string for the
staging project.

## Proof checklist

After applying migration `029`, run:

```bash
node scripts/prove-staging-migration-029.mjs
```

Expected successful result:

- `match_memory_items` returns HTTP `200` with `rowCount: 0`.
- `match_private_archive_chunks` returns HTTP `200` with `rowCount: 0`.
- The proof uses `p_embedding_provider='gemini'`,
  `p_embedding_model='gemini-embedding-2'`, and
  `p_embedding_index_name='memory_items_embedding_1536'`.

Then probe deployment readiness:

```bash
curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment
```

Expected migration proof once the deployed API and database agree:

- `readiness.migrations.ok: true`
- `readiness.migrations.latest.version: "025-029"`
- `readiness.migrations.latest.name: "public_schema_object_and_rpc_proof"`

`checks.embeddingsConfigured` still depends on a staging Gemini key. Migration
proof alone does not prove data-backed replay. Bounded replay-corpus reindex
and hostile retrieval smoke remain required.
