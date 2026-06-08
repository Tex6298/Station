# Station staging setup blockers

Status: Lane 1 DAEDALUS inventory, 2026-06-08. This is a setup boundary
document, not a claim that full staged replay is ready.

## Current remote shape

- Active repo/remote for the Railway lane: `fork/main` on `Tex6298/Station`.
- Railway API: `https://stationapi-production.up.railway.app`.
- Railway web: `https://stationweb-production.up.railway.app`.
- Both public `/health` probes currently return `{ "ok": true }`.
- Remote API deployment health returns non-secret booleans showing
  `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and
  `JWT_SECRET` are configured on the deployed API.
- The same deployment-health response still reports default local app/API URLs
  (`http://localhost:3000` and `http://localhost:4000`) and no Stripe billing or
  OpenAI embedding provider booleans. It does not prove `DATABASE_URL`,
  migration state, storage bucket existence, Supabase Auth dashboard settings,
  or secret values.

## Lane 1 inventory from this shell

Local `.env` presence-only check:

| Key group | Local result |
| --- | --- |
| Supabase API/database keys | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present but empty. |
| Supabase management token | `SUPABASE_ACCESS_TOKEN` is absent. |
| Railway token | `RAILWAY_TOKEN` is present and non-empty locally, but Railway CLI project access is unauthorized from this shell. |
| NVIDIA chat aliases | `NVIDIA_AI_API_KEY` and `NVIDIA_MODEL_BASE_URL` are present and non-empty locally; `NVIDIA_MODEL` is absent locally and defaults in code. |
| Stripe | Stripe secret, webhook, publishable key, and price IDs are present but empty locally. |
| JWT | `JWT_SECRET` is present and non-empty locally. |

Railway CLI/API access:

- No global Railway CLI is installed.
- `npx --yes @railway/cli` is available, and its help confirms `variable list
  --json` includes raw values; do not print that output in shared logs.
- With the local `RAILWAY_TOKEN` injected into the command environment,
  `npx --yes @railway/cli service list --project
  4c716631-6110-4cec-85f1-ab925239b337 --environment production --json`
  returned `Unauthorized`. Railway service-list, deployment-log, and
  variable-name inventory still require a Railway-authorized shell/dashboard.

Supabase CLI access:

- `npx --yes supabase --version` works and reports Supabase CLI `2.105.0`.
- The repo has migration files under `infra/supabase/migrations`, but no local
  `supabase/config.toml`, `.supabase` link state, project ref, database URL, or
  access token is available in this shell.
- `supabase db push` supports either a linked project (`supabase link
  --project-ref <staging-project-ref>` then `supabase db push --linked`) or an
  explicit `--db-url <percent-encoded-staging-database-url>`. Neither target is
  available here, so migrations were not applied or dry-run against remote.

## Supabase migrations

Repo path:

- Migration SQL lives in `infra/supabase/migrations`.
- The ordered migration list lives in `infra/supabase/README.md`.
- `infra/supabase/README.md` now lists migrations `001` through `024` and names
  both linked-project and explicit-`--db-url` CLI paths.

What can be done from code/CLI:

- Review migration ordering.
- Run syntax/static checks against SQL files if a checker is added later.
- Run `npx supabase db push --linked` only after the staging project is linked,
  or `npx supabase db push --db-url <staging-database-url>` only after the
  target database URL is confirmed as staging.

Blocked external facts:

- Staging Supabase project URL.
- Project ref or linked Supabase CLI workspace.
- Database URL or Supabase access token with permission to apply migrations.
- Confirmation that the target project is staging, not production.
- Confirmation whether migrations `001` through `024` have already been applied
  to the staging project.

## Storage bucket

Required bucket:

- `persona-files`.
- Private.
- Used by `apps/api/src/routes/persona-files.ts` through signed upload URLs.

What can be done from code/CLI:

- Keep app code using the existing `persona-files` bucket name.
- Add a future idempotent setup script if Supabase credentials are provided.
- Verify the bucket through Supabase dashboard or a service-role/admin script
  after the staging `SUPABASE_URL` and service-role key are confirmed.

Blocked external facts:

- Staging Supabase service-role key or dashboard access.
- Confirmation that `persona-files` exists and is private.
- Storage policy decision if dashboard defaults are not enough.
- A no-values confirmation that signed upload/download flows work against the
  staged bucket.

## Supabase auth redirects

Current web/API URLs:

- Web site URL: `https://stationweb-production.up.railway.app`.
- API URL: `https://stationapi-production.up.railway.app`.

Dashboard settings needed:

- Supabase Auth site URL set to the Railway web URL.
- Supabase Auth redirect URLs include the Railway web URL and password-reset
  redirect target currently used by the web app:
  `https://stationweb-production.up.railway.app/reset-password/update`.
- Social OAuth apps should use API callback URLs of the form
  `https://stationapi-production.up.railway.app/social/callback/<provider>`.

Blocked external facts:

- Supabase dashboard access.
- Social provider app credentials and callback registration.
- Confirmation of the exact allowed redirect URL list.
- Product/API decision for the current password reset target:
  `apps/web/app/reset-password/page.tsx` sends users to `/reset-password/update`,
  but that web route is not implemented yet. Either add the route in a future
  auth lane or change the reset flow before relying on staged password reset.

## NVIDIA platform chat

Reference checked: NVIDIA's
[NIM chat-completions API](https://docs.api.nvidia.com/nim/reference/create_chat_completion_v1_chat_completions_post)
documents the OpenAI-compatible
`https://integrate.api.nvidia.com/v1/chat/completions` endpoint.

Repo-safe work completed:

- API env parsing accepts `NVIDIA_AI_API_KEY`, `NVIDIA_MODEL_BASE_URL`, and
  `NVIDIA_MODEL`.
- Platform chat can use NVIDIA's OpenAI-compatible chat endpoint when
  a non-empty `NVIDIA_AI_API_KEY` is present.
- `NVIDIA_AI_API_KEY` is trimmed before provider selection; blank or whitespace
  aliases keep the DeepSeek platform fallback.
- A non-empty NVIDIA key takes precedence over the legacy Anthropic platform
  shortcut in the conversation route, so staging probes are not silently routed
  to Anthropic when both variables are configured.
- `NVIDIA_MODEL_BASE_URL` is normalized to a `/v1` base URL before appending
  `/chat/completions`.
- DeepSeek platform fallback remains available when NVIDIA is not configured.

Important boundary:

- Station embeddings still use OpenAI `text-embedding-3-small`, which matches
  the existing `vector(1536)` Supabase schema.
- Do not switch embeddings to a non-1536 model without a migration and reindex
  plan.

Blocked external facts:

- Railway API service variable values for NVIDIA.
- Final model choice if `openai/gpt-oss-120b` is not the desired staging model.
- Provider usage/rate-limit expectations for replay.

## Redis cache evaluation

No Redis cache is implemented yet.

If opened later, keep Redis API-side only:

- Source of truth stays in Supabase and pgvector.
- Cache keys must include owner and persona scope, for example
  `station:staging:user:<userId>:persona:<personaId>:context:<hash>`.
- Do not cache auth tokens, service-role keys, or raw provider secrets.
- Suggested initial TTLs:
  - Persona runtime context: 60 seconds.
  - Owner-scoped persona/profile summary: 300 seconds.
  - Public-safe Discover/search snippets: 120 seconds.
- Invalidate or bypass cache on archive import, canon/memory mutation,
  continuity writes, persona edits, and visibility changes.

Blocked external facts:

- Redis provider decision.
- Redis URL/token secret.
- Cache budget and eviction expectations.
- Tests for owner/persona key scoping and stale-data invalidation.
