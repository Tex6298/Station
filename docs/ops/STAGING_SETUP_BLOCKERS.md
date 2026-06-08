# Station staging setup blockers

Status: DAEDALUS audit, 2026-06-08. This is a setup boundary document, not a
claim that full staged replay is ready.

## Current remote shape

- Active repo/remote for the Railway lane: `fork/main` on `Tex6298/Station`.
- Railway API: `https://stationapi-production.up.railway.app`.
- Railway web: `https://stationweb-production.up.railway.app`.
- Both public `/health` probes currently return `{ "ok": true }`.

## Supabase migrations

Repo path:

- Migration SQL lives in `infra/supabase/migrations`.
- The ordered migration list lives in `infra/supabase/README.md`.
- `infra/supabase/README.md` names `npx supabase db push` as the CLI path.

What can be done from code/CLI:

- Review migration ordering.
- Run syntax/static checks against SQL files if a checker is added later.
- Run `npx supabase db push` only after the staging project is linked or the
  required Supabase CLI credentials/project reference are available.

Blocked external facts:

- Staging Supabase project URL.
- Project ref or linked Supabase CLI workspace.
- Database URL or Supabase access token with permission to apply migrations.
- Confirmation that the target project is staging, not production.

## Storage bucket

Required bucket:

- `persona-files`.
- Private.
- Used by `apps/api/src/routes/persona-files.ts` through signed upload URLs.

What can be done from code/CLI:

- Keep app code using the existing `persona-files` bucket name.
- Add a future idempotent setup script if Supabase credentials are provided.

Blocked external facts:

- Staging Supabase service-role key or dashboard access.
- Confirmation that `persona-files` exists and is private.
- Storage policy decision if dashboard defaults are not enough.

## Supabase auth redirects

Current web/API URLs:

- Web site URL: `https://stationweb-production.up.railway.app`.
- API URL: `https://stationapi-production.up.railway.app`.

Dashboard settings needed:

- Supabase Auth site URL set to the Railway web URL.
- Supabase Auth redirect URLs include the Railway web URL and app auth routes
  used by login/reset flows.
- Social OAuth apps should use API callback URLs of the form
  `https://stationapi-production.up.railway.app/social/callback/<provider>`.

Blocked external facts:

- Supabase dashboard access.
- Social provider app credentials and callback registration.
- Confirmation of the exact allowed redirect URL list.

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
