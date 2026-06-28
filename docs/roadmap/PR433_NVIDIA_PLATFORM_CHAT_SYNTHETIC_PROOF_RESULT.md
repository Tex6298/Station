# PR433 - NVIDIA Platform Chat Synthetic Proof Result

Date: 2026-06-28

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Status: ready for ARGUS review - synthetic path proven with exact-output caveat

## Verdict

PR433 proves the current Station code and staging readiness boundary for
NVIDIA platform chat, with one caveat:

- the provider route is configured and callable;
- the selected current model label is valid for the live NVIDIA call;
- the probe stayed synthetic-only and did not send Station private context;
- the current model returned a non-empty response but did not comply with the
  exact requested phrase in repeated attempts.

That caveat is recorded as model-instruction noise, not a route/config blocker.
Do not use this as approval to send private archive, Memory, Continuity, owner
replay corpus, or real user prompts to NVIDIA.

## Evidence

Repo support:

- `packages/ai/src/providers/router.ts` selects
  `nvidia_openai_compatible` when `NVIDIA_AI_API_KEY` is present.
- `NVIDIA_MODEL_BASE_URL` normalizes to an OpenAI-compatible `/v1` base URL.
- The current default/configured model label is `openai/gpt-oss-120b`.
- `packages/ai/test/provider-router.test.ts` already proves NVIDIA request
  shape, key trimming, BYOK precedence, and DeepSeek fallback.

Hosted readiness:

- Public hosted `/health/deployment` returned HTTP `200`.
- Hosted readiness reported `ready: true`.
- Hosted provider readiness reported platform chat `true` and NVIDIA `true`.
- Hosted embedding readiness remained `station_free_1536` with provider
  `gemini`.
- No hosted key material, cookies, IDs, provider payloads, prompts, or
  completions were captured.

Synthetic NVIDIA probe:

- The probe used Station's provider router, not a raw app prompt path.
- Route label: `nvidia_openai_compatible`.
- Provider family/mode: `openai` / `platform`.
- Configured model label: `openai/gpt-oss-120b`.
- Response model label: `openai/gpt-oss-120b`.
- Prompt boundary: synthetic public `/no_think` connectivity prompt only.
- Prompt text stored in docs/logs: `false`.
- Completion text stored in docs/logs: `false`.
- Provider returned a non-empty single-line completion.
- Exact expected phrase match: `false`.

Observability/readback:

- The main conversation route records provider route, model, estimated input
  tokens, estimated output tokens, latency, and estimated cost labels through
  existing AI trace events.
- `/observability/traces/:traceId` sanitizes trace metadata to provider/model/
  status/token/cost labels and excludes raw prompts, completions, provider
  payloads, IDs, URLs, keys, cookies, and secrets.
- PR433 did not run a hosted product chat because that would risk sending
  persona/runtime/replay context. The direct provider-router probe was chosen
  to keep the proof synthetic-only.
- Current `OpenAIProvider` does not parse NVIDIA response `usage`, so the live
  direct probe records token labels as not returned by the current adapter.
  Product traces still use Station's existing token estimates.

Fallback:

- Provider-router tests prove blank or absent NVIDIA aliases keep DeepSeek
  fallback behavior.
- Runtime route tests prove BYOK precedence over platform NVIDIA and missing
  platform config reporting.

## Boundaries

PR433 did not:

- switch embeddings to NVIDIA;
- change vector dimensions, retrieval schema, migrations, or corpus data;
- add Gemini chat, model gateway, provider UI, Cloudflare, Redis, workers,
  queues, billing, or Stripe behavior;
- send private archive text, Memory, Continuity, persona private profile text,
  replay corpus anchors, real user prompts, source snippets, IDs, credentials,
  database URLs, cookies, tokens, provider payloads, or secrets to NVIDIA;
- record raw prompt or completion text in committed docs.

## Validation

Completed:

- Public hosted `/health/deployment` sanitized readiness probe passed.
- Live synthetic NVIDIA provider-router probe reached
  `nvidia_openai_compatible` and returned a non-empty response.
- Live exact-output variants returned provider responses but did not match the
  requested phrase.
- `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts`
  passed, 10 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed, 2
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context` passed, 9 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.

## Residual Risk

The current `openai/gpt-oss-120b` NVIDIA route is callable but was not exact
phrase compliant in the synthetic probe. Treat exact wording, reasoning-posture
control, private-data policy, and provider usage accounting as separate
acceptance decisions before any sensitive replay or product-provider expansion.
