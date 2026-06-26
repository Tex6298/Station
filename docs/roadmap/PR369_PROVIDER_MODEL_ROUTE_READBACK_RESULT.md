# PR369 - Provider And Model Route Readback Result

Date: 2026-06-26
Owner: DAEDALUS
Status: READY FOR ARGUS

## Verdict

Bounded patch made. ARGUS should review.

The concrete gap was in AI trace metadata readback: nested embedding metadata
could be flattened into generic `Profile` / `Provider` display facts. That made
Gemini embeddings legible only as `Provider gemini`, which could be mistaken
for Gemini chat even though Gemini chat is not implemented.

## Changes

- `apps/api/src/services/ai-observability.service.ts`
  - Stops using nested `metadata.embedding` as the fallback for generic
    provider/profile/model fields.
  - Emits explicit sanitized embedding facts:
    `embeddingProfile`, `embeddingProvider`, `embeddingModel`, and
    `embeddingDimension`.
- `apps/web/lib/ai-observability-ui.ts`
  - Renders explicit `Embedding profile`, `Embedding provider`,
    `Embedding model`, and `Embedding dimension` facts.
  - Keeps generic `Provider` reserved for actual trace/event/provider-route
    values, not embedding provider fallback.
- `apps/api/src/routes/replay-readiness.test.ts`
  - Proves trace detail serialization keeps Gemini embedding metadata explicit
    and does not return an embedded key.
- `apps/web/lib/ai-observability-ui.test.ts`
  - Proves the web helper labels Gemini as an embedding provider and does not
    render `Provider gemini`.

## Acceptance Questions

1. Does any visible UI imply Gemini chat is live when only Gemini embeddings
   are active?

   The patched trace UI no longer does so through embedding metadata fallback.
   Gemini now appears as `Embedding provider gemini` with the
   `station_free_1536` embedding profile.

2. Can a developer/operator tell whether platform chat is using NVIDIA,
   Anthropic, DeepSeek fallback, or no configured provider without secrets?

   Yes. Existing provider-router tests and health readiness keep platform chat
   booleans and runtime route labels non-secret. This patch preserves that
   behavior.

3. Can a developer/operator tell which embedding profile is active and which is
   rollback?

   Yes. Existing readiness and Developer Space posture expose
   `station_free_1536` / Gemini as active product-testing embedding profile and
   `openai_1536` / OpenAI as rollback. This patch makes AI trace readback use
   similarly explicit embedding labels.

4. Do Developer Space provider-policy labels avoid implying private archive
   text can be sent to any provider without explicit policy?

   Yes. Existing Developer Space provider-policy tests still prove private
   archive context is blocked unless explicitly allowed, owner BYOK policy is
   enforced, and posture readback remains non-secret.

5. Are provider failures classified as config/provider-policy/runtime failures
   rather than generic broken chat?

   Yes for current covered routes. Existing chat route runtime resolver returns
   `provider_config_missing`, Developer Space policy returns provider-policy
   denial reasons, and trace detail failure labels remain sanitized.

6. Is future provider expansion framed as roles and policy, not one hardcoded
   model path?

   Yes. The patch reinforces separate roles: chat provider route,
   provider-mode/policy, embedding profile, and rollback profile. It does not
   add or activate any provider.

## Scope Control

No Gemini chat provider, provider marketplace, per-user paid model selection,
new secrets/config requirements, embedding reindex/backfill, model optimization,
Cloudflare retrieval, Redis/Valkey worker, Redis Memory truth, billing,
schema, migration, Railway config, or Supabase config changed.

No provider key, raw URL, prompt, private archive body, provider payload, owner
id, or secret-shaped value is exposed by the new readback.

## Validation

DAEDALUS ran:

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass, 2 tests |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/ai-observability-ui.test.ts` | Pass, 7 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, 122 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass, 51 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass, 18 tests |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts packages/ai/test/retrieval-metadata.test.ts` | Pass, 22 tests |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass |
| `git diff --check` | Pass, CRLF normalization warnings only |

Note: `@station/ai` currently has no package-level `test` script, so DAEDALUS
ran the provider-router and retrieval-metadata test files directly.

## Handoff

Wake ARGUS. Review focus:

- confirm generic provider/profile/model facts are not incorrectly removed from
  chat route readback;
- confirm embedding fields remain sanitized and explicit;
- confirm the patch does not imply Gemini chat, provider activation, reindex,
  or new config behavior.
