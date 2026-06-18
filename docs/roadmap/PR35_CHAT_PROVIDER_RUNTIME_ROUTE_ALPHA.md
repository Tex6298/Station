# PR35 - Chat Provider Runtime Route Alpha

Date: 2026-06-18
Status: accepted by ARGUS for MIMIR closeout
Owner: DAEDALUS implements, ARGUS reviews. ARIADNE rehearses only if visible
Studio/provider UI changes are introduced.

## Purpose

Make persona chat provider selection explicit, reusable, and trace-honest now
that runtime context, streaming envelopes, and budget/topology metadata are in
place.

Station already supports Gemini for active 1536-dimension embeddings, NVIDIA
through an OpenAI-compatible platform chat route, DeepSeek fallback behavior,
Anthropic platform fallback, and BYOK routes. The current chat turn still
assembles provider route labels, provider instances, missing-config checks, and
trace labels in more than one place. PR35 should make the route decision one
small bounded resolver and keep runtime-budget, AI trace, and actual provider
execution labels aligned.

## Scope

- Add a small chat-provider runtime route resolver for persona chat.
- Return content-free route metadata:
  - route label;
  - provider family;
  - provider mode, platform or BYOK;
  - model label;
  - whether the route is configured enough to execute;
  - safe missing-config classification when it is not.
- Use the same resolved route for:
  - runtime budget provider metadata;
  - missing-provider checks;
  - provider instance creation;
  - success, quota, error, and stream-backed trace events.
- Preserve current priority:
  - BYOK wins when the user profile is in BYOK mode and the requested provider
    key exists;
  - platform Anthropic remains available only through the existing
    Station-tier fallback path;
  - NVIDIA OpenAI-compatible platform chat wins when configured;
  - DeepSeek fallback remains the final platform route.
- Keep Gemini/OpenAI embedding profile resolution separate from chat provider
  execution.
- Add focused tests proving trace labels and runtime budget provider metadata
  match the actual executed route for NVIDIA, BYOK, missing platform config, and
  any existing Anthropic fallback path.

## Non-Scope

- Do not build a provider marketplace or model menu UI.
- Do not add BYOK secret storage, secret display, or new provider credentials.
- Do not switch active embeddings, vector dimensions, or retrieval provider.
- Do not add Cloudflare, Redis/Valkey memory, worker queues, or provider delta
  streaming.
- Do not change runtime context topology, retrieval ranking, Memory/Canon
  semantics, or private archive provider policy.
- Do not expose keys, base URLs, prompts, completions, private archive text,
  owner IDs, tokens, cookies, or raw provider payloads in traces or responses.

## Acceptance

- Persona chat route selection is centralized enough that route labels cannot
  drift between runtime budget metadata, provider construction, and AI trace
  events.
- NVIDIA platform chat is labelled as `nvidia_openai_compatible` when it is the
  actual route.
- BYOK OpenAI/Anthropic/DeepSeek routes retain their existing behavior and
  content-free labels.
- Missing platform-provider config still fails safely with
  `provider_config_missing` and does not leak runtime context or prompt text.
- Streaming and non-streaming chat use the same underlying route decision.
- Embedding profile metadata remains Gemini/free-tier by default and is not
  treated as chat-model selection.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 exec tsx --test packages/ai/test/provider-router.test.ts
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
git diff --check
```

If health/readiness provider wording changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:health
```

## ARGUS Review Ask

ARGUS should hostile-review:

- route-label honesty between resolved route, runtime budget, and trace events;
- whether BYOK/profile/platform precedence changed unintentionally;
- missing-config and quota failure paths;
- stream and non-stream parity;
- whether any route metadata leaks secrets, prompts, context, or private text;
- scope drift into model marketplace, embedding migration, Cloudflare/Redis, or
  provider delta streaming.

## Wake Discipline

DAEDALUS should wake ARGUS with files changed, resolver shape, route precedence,
trace/runtime-budget metadata examples, validation commands/results, and
whether ARIADNE needs a visible rehearsal.

## ARGUS Review Result

ARGUS accepts PR35 for MIMIR closeout, 2026-06-18.

- `resolveChatProviderRuntimeRoute` is now the single persona chat resolver used
  for runtime budget route labels, missing-config checks, provider construction,
  quota/error/success AI trace labels, and provider execution.
- Route labels now stay honest for BYOK OpenAI/Anthropic/DeepSeek, bounded
  Station Anthropic platform fallback, NVIDIA OpenAI-compatible platform chat,
  and DeepSeek platform fallback.
- Streaming and non-streaming persona chat share the same underlying route
  decision.
- ARGUS patched resolver hardening so blank BYOK strings do not count as
  configured and missing platform config returns no executable provider
  instance.
- ARGUS patched provider-failure trace hygiene so raw provider error bodies are
  not stored in trace event payloads or trace session error messages.
- No ARIADNE rehearsal is required because no visible Studio/provider UI
  changed.

Validation passed:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 exec tsx --test packages/ai/test/provider-router.test.ts
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```
