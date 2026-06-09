# Station staging setup blockers

Status: Lane 1 DAEDALUS inventory, accepted by ARGUS on 2026-06-08 as blocked
on external setup facts. This is a setup boundary document, not a claim that
full staged replay is ready.

ARGUS verdict:

- No secret values were found in this inventory; it records presence/absence and
  non-secret booleans only.
- Repo-side work is correctly separated from dashboard/credential-only work.
- The reset-password redirect target is correctly called out as incomplete:
  `/reset-password/update` is used by the current web flow, but no route exists
  yet.
- `infra/supabase/README.md` was corrected during review so raw
  `community_moderation_actions` rows are not described as public-safe.
- MIMIR's follow-up Redis/provider correction is accepted: Redis role remains an
  open architecture decision, and provider/privacy posture can vary by
  Developer Space after explicit contract review.

Shortest next human/dashboard actions:

1. Run or explicitly waive the remaining remote vector/RPC smoke proof for
   archive retrieval, lifecycle filtering, Developer Space provider policy, and
   retrieval metadata. Migrations `025` through `028` are applied/proven at setup
   level on staging.
2. Smoke the signed upload/read flow for the private `persona-files` bucket if
   needed for replay. The bucket exists and is private in staging.
3. Set Supabase Auth site URL and allowed redirects for the Railway web URL;
   either add `/reset-password/update` or change the reset flow before testing
   password reset.
4. Use a Railway-authorized dashboard/shell to verify and set API/web service
   variables without printing values, especially `DATABASE_URL`, Supabase keys,
   `API_URL`, `NEXT_PUBLIC_APP_URL`, Stripe test keys/prices, and provider keys.
5. Confirm Stripe test resources, replay account/data, any social OAuth callback
   credentials, cache provider decision, Cloudflare account/index decision, and
   platform-provider/embedding configuration needed for staged replay.

## Current remote shape

- Active repo/remote for the Railway lane: `fork/main` on `Tex6298/Station`.
- Railway API: `https://stationapi-production.up.railway.app`.
- Railway web: `https://stationweb-production.up.railway.app`.
- Both public `/health` probes currently return `{ "ok": true }`.
- Remote API deployment health returns non-secret booleans showing
  `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `DATABASE_URL`, and `JWT_SECRET` are configured on the deployed API.
- The same deployment-health response now reports the Railway web/API URLs, not
  localhost defaults. MIMIR's 2026-06-09 proof update reports database `ok:
  true`, migrations `ok: true` via `025-028/public_schema_object_proof`, storage
  `ok: true` with `persona-files` private, and NVIDIA platform chat true. It
  still reports `ready: false` because Supabase Auth redirects are not
  management-API proven and OpenAI embeddings, Stripe, Redis/cache readiness,
  Cloudflare setup, and replay data remain pending. It does not expose secret
  values.

## Lane 1 inventory from this shell

Historical note: this section records the DAEDALUS/ARGUS Lane 1 inventory from
2026-06-08. MIMIR's 2026-06-09 proof update supersedes the Supabase/Railway
readiness parts above without printing secret values.

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

Current staging proof:

- Supabase MCP applied migrations `025` through `028` and remote migration
  history now includes `001` through `028`.
- Public API readiness proves the public schema objects introduced by
  migrations `025` through `028`.

Remaining external facts:

- Hostile remote vector/RPC smoke for archive retrieval, lifecycle filtering,
  provider-policy persistence, and retrieval metadata if MIMIR requires it
  before replay.

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

Current staging proof:

- `persona-files` exists in the staging Supabase project.
- The bucket is private.
- Public API readiness proves storage `ok: true`.

Remaining external facts:

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

## Redis role evaluation

BE-05 added the repo-side optional operational cache boundary for API-owned
runtime context, idempotency, rate-limit, and lightweight queue-state scopes.
No Redis/Valkey provider has been configured or proven in staging yet, and no
working-memory layer or memory-truth store is implemented.

Current conservative starting option, not a final decision:

- API-side Redis/Valkey cache, queue, idempotency, or rate-limit state.
- Cache keys must include owner and persona scope, for example
  `station:staging:user:<userId>:persona:<personaId>:context:<hash>`.
- Do not cache auth tokens, service-role keys, or raw provider secrets.
- Current BE-05 TTL defaults:
  - Runtime context: 300 seconds.
  - Idempotency: 86400 seconds.
  - Rate limit: 60 seconds.
  - Queue state: 900 seconds.
- Invalidate or bypass cache on archive import, canon/memory mutation,
  continuity writes, persona edits, and visibility changes.

Open architecture discussion before accepting Redis as memory truth:

- Which memory tier Redis would own: session scratchpad, working memory,
  retrieval hot set, long-term persona memory, queue/job state, or all of them.
- Whether the Redis data is ephemeral, rebuildable, mirrored to Supabase, or
  canonical.
- Persistence, backups, eviction, expiry, export, deletion, owner isolation,
  and audit semantics.
- Search/index shape if Redis stores memory: Redis vector search, Supabase
  pgvector, Cloudflare Vectorize, or a hybrid.
- Runtime/provider fit: Railway Redis/Valkey for API-owned workloads, Upstash
  for Worker-friendly HTTP access, or another Redis-compatible provider.

Blocked external facts:

- Redis role/provider decision.
- Redis URL/token secret.
- Staging smoke proof for whichever provider is selected.
- Cache budget and eviction expectations.
- Tests for owner/persona key scoping, stale-data invalidation, and any
  canonical-memory semantics if Redis is promoted beyond cache/queue.
