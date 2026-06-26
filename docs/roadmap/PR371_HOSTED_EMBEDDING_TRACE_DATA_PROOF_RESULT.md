# PR371 - Hosted Embedding Trace Data Proof Result

Date: 2026-06-26
Owner: DAEDALUS
Status: ACCEPTED BY ARGUS

## Verdict

Bounded instrumentation patch made. ARGUS should review.

PR370 proved the hosted AI Activity route and PR369 readback UI were healthy,
but the available hosted trace rows did not contain embedding metadata. The
gap was in conversation trace creation: `startAiTrace()` stored context counts
and the chat runtime budget, but not the safe embedding metadata already present
on `runtimeContext.trace.embedding`.

## Changes

- `apps/api/src/routes/conversations.ts`
  - Adds `embedding: runtimeContext.trace.embedding` to conversation
    `ai_trace_sessions.metadata`.
  - This is profile metadata only: profile code, provider, model, dimension,
    and index name.
- `apps/api/src/routes/conversation-archive.test.ts`
  - Proves conversation traces now store the active embedding metadata.
  - Proves the embedding metadata does not contain owner message text or
    private continuity prompt text.

PR369's already-accepted serializer/readback path turns the stored embedding
object into explicit trace-detail fields:

- `embeddingProfile`;
- `embeddingProvider`;
- `embeddingModel`;
- `embeddingDimension`.

## Expected Hosted Proof

After this patch is reviewed and deployed, ARIADNE can produce the data-shape
proof without private archive ingestion:

1. Sign in to the hosted web app as the replay owner.
2. Open the replay persona chat route from Studio.
3. Send one safe synthetic chat turn, for example:

   ```text
   Give a one-sentence readiness check for provider-route metadata.
   ```

4. Open `/settings`.
5. In `AI Activity`, open the newest conversation trace detail.
6. Confirm visible facts include:

   - `Embedding profile station_free_1536`;
   - `Embedding provider gemini`;
   - `Embedding model gemini-embedding-2`;
   - `Embedding dimension 1536`.

7. Confirm visible facts do not include:

   - generic `Provider gemini`;
   - Gemini chat copy;
   - provider keys, raw URLs, prompts, completions, provider payload bodies,
     private archive text, owner ids, raw trace ids, SQL, stack traces, or
     secret-shaped values.

## Scope Control

No Gemini chat, provider marketplace, paid model selection, new provider
config/secrets, embedding reindex/backfill, Cloudflare retrieval, Redis Memory
truth, worker/queue infrastructure, billing, schema, migration, broad Settings
or AI Activity redesign, private archive ingestion, Railway config, or Supabase
config changed.

The patch does not change provider routing or retrieval behavior. It only
copies existing safe runtime embedding metadata into the existing AI trace
metadata envelope.

## Validation

DAEDALUS ran:

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass, 41 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass, 2 tests |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/ai-observability-ui.test.ts` | Pass, 7 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, 122 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass, 18 tests |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass |
| `git diff --check` | Pass, CRLF normalization warnings only |

## ARGUS Review

Verdict: `PASS`.

ARGUS verified that `runtimeContext.trace.embedding` is fixed profile metadata
only: profile code, provider, model, dimension, and index name. It does not
carry query text, prompts, completions, vectors, provider keys, provider
payload bodies, private archive content, owner ids, or raw trace ids.

ARGUS also verified that the accepted PR369 trace-detail serializer turns the
stored embedding object into explicit embedding fields while keeping Gemini out
of generic chat provider readback. The hosted rerun steps are sufficient to
prove the live data shape after deploy.

No provider routing, Gemini chat, provider activation, marketplace, paid model
selection, new config/secrets, embedding reindex/backfill, Cloudflare, Redis
Memory truth, worker/queue, billing, schema, migration, private archive
ingestion, Railway config, Supabase config, or Settings redesign changed.

## Handoff

Wake ARGUS. Review focus:

- confirm embedding trace metadata is safe profile metadata only;
- confirm no provider routing, Gemini chat, reindex, config, or schema behavior
  changed;
- confirm the ARIADNE hosted rerun steps are sufficient to prove the PR369
  visible readback on live data.
