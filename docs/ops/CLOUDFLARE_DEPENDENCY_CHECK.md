# Cloudflare dependency check

Date: 2026-06-10

Status: DAEDALUS result note for MIMIR. Cloudflare retrieval is optional by
adapter contract and can be deferred for the current staging replay plan.

## Verdict

Cloudflare is not required for current Station runtime, staging health, or the
accepted BE-00 through BE-08 backend flow. The repo contains a disabled-safe
adapter contract only:

- `packages/ai/src/retrieval/cloudflare-adapter.ts`
- `packages/ai/test/cloudflare-adapter.test.ts`
- `docs/architecture/cloudflare-retrieval-adapter.md`

No live API route imports the adapter for runtime retrieval. Current private
archive and memory retrieval still run through Station/Supabase surfaces, with
Gemini `gemini-embedding-2` selected for the active 1536-dimensional vector
contract and OpenAI retained as fallback/rollback.

## Dependency findings

| Area | Finding |
| --- | --- |
| Package dependencies | No `wrangler`, `@cloudflare/*`, Cloudflare Vectorize SDK, Workers AI SDK, or `@upstash/redis/cloudflare` package is present in root or `@station/ai` package dependencies. |
| Runtime imports | `packages/ai/src/index.ts` exports the adapter, but API/runtime routes do not call it for live retrieval. |
| Adapter behavior | `createCloudflareRetrievalAdapter` always returns the disabled adapter today. Without explicit config it reports `not_enabled`; with incomplete config it reports `missing_config`; with complete config it still reports `remote_adapter_pending`. |
| Network calls | The current adapter makes no Cloudflare network calls and returns no remote candidates. |
| Mirror payload | Helper payloads include IDs and minimal metadata only; private title/content/summary/archive source names are excluded. |
| Authorization | Candidate IDs must be reauthorized through Station/Supabase before private records return; Cloudflare metadata is not trusted. |
| Infra files | No `wrangler.toml`, Worker source, Vectorize binding, queue binding, Cloudflare deployment config, or Cloudflare migration exists in `infra/`. |
| Replay readiness | `/observability/replay-readiness` correctly treats Cloudflare account setup as `disabled_pending`, not a current readiness requirement. |

## Env and infra blockers if enabled

These are blockers only if MIMIR chooses to include Cloudflare retrieval in the
staging replay scope.

| Blocker | Practical next step |
| --- | --- |
| Provider decision | Decide whether Cloudflare is deferred, public/Discover-only, private Studio retrieval, or prototype-only. Default recommendation for current staging is defer. |
| Account/project | Choose the Cloudflare account/project and owner. Do not add secrets to repo docs or logs. |
| Worker URL | Provide `CLOUDFLARE_RETRIEVAL_WORKER_URL` after a Worker exists and its request/privacy contract is reviewed. |
| Worker auth token | Provide `CLOUDFLARE_RETRIEVAL_API_TOKEN` or choose a different auth scheme. Token scope and rotation policy need review. |
| Vectorize index | Provide `CLOUDFLARE_VECTORIZE_INDEX` after choosing index name, metric, and dimension. The current Station embedding contract is 1536 dimensions. |
| Enable flag | Set `CLOUDFLARE_RETRIEVAL_ENABLED=true` only after live adapter behavior exists; the current code still fails closed as pending even with complete config. |
| Query privacy | Decide whether private user queries may be sent to Cloudflare. Until accepted, do not send private snippets or prompt bodies. |
| Reauthorization proof | Prove remote candidate IDs are fetched back through Station/Supabase owner/persona and lifecycle filters before private rows return. |
| Deletion/export/reindex | Define propagation for memory deletion, archive deletion, owner deletion, exports, embedding model changes, and stale-index recovery. |

## Current staging recommendation

For the immediate staging replay plan, explicitly defer Cloudflare retrieval and
keep the active retrieval path on Station/Supabase. Cloudflare should not block
replay unless MIMIR names a Cloudflare-specific replay objective.

If MIMIR later opens a Cloudflare lane, start with an ID-only Vectorize mirror
and a Worker/query contract that returns candidate IDs only. Private records
must still be read from Station/Supabase after authorization.
