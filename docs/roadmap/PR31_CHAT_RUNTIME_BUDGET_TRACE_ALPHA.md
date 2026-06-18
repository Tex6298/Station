# PR31 - Chat Runtime Budget Trace Alpha

Date: 2026-06-18
Status: accepted by ARGUS for MIMIR closeout
Owner: DAEDALUS implements, ARGUS reviews. ARIADNE rehearses only if Studio
chat/loading/error states change visibly.

## Purpose

Make persona chat assembly measurable before Station takes on heavier chat
runtime work such as SSE streaming, topology weighting changes, or provider
route expansion.

Launch-core already fixed latest-turn retrieval and production-gated debug
payloads. The next narrow step is to prove what context budget Station assembled
for a chat turn, where it spent that budget, and why a turn failed when quota,
provider configuration, or archived-state rules block a response.

## Scope

- Add an internal context/budget report before provider calls.
- Include the useful buckets already assembled by Station: recent turns, canon,
  memory, integrity, archive, continuity, and truncation/drop reasons where the
  code can know them.
- Persist or attach that report through the existing trace/debug path without
  leaking it in production chat responses.
- Keep dev/test explicit debug behavior useful for tests and operator probes.
- Tighten user/API error classification for quota, missing provider
  configuration, archived conversation state, and unknown provider failure.
- Add focused regression tests for budget metadata, production debug gating, and
  at least the archived/quota/config failure paths.

## Non-Scope

- Do not implement full SSE streaming in this PR.
- Do not change the embedding vector contract, retrieval provider policy, or
  model marketplace.
- Do not redesign Studio chat broadly.
- Do not store canonical memory in Redis.
- Do not change public/private visibility rules.

## Acceptance

- A test/dev chat turn can prove which context buckets were assembled and how
  much budget each used, without relying on private production response fields.
- Production chat responses still contain only the safe response shape already
  accepted by launch-core.
- Quota, provider-config, and archived-conversation failures are distinguishable
  enough for Studio and Station Assistant to explain the next safe action.
- Existing latest-turn ordering remains covered.

## Validation

Run the focused gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:token-credits
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
git diff --check
```

If Studio chat copy/loading/error states change, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
```

## ARGUS Review Ask

ARGUS should check:

- production responses do not leak context counts, raw memory/archive snippets,
  keys, or provider internals;
- trace/debug metadata is owner/test/operator useful without becoming product
  truth;
- failure classifications do not overclaim recovery or hide data safety;
- the implementation does not smuggle in streaming, provider marketplace,
  Redis memory truth, or retrieval rewrites.

## Wake Discipline

DAEDALUS should wake ARGUS with:

- files changed;
- budget/trace semantics;
- production response-shape proof;
- validation commands/results;
- whether ARIADNE needs a visible Studio chat rehearsal.

## ARGUS Review Result

ARGUS accepts PR31 for MIMIR closeout, 2026-06-18.

- The runtime budget report remains content-free: counts, token estimates,
  provider route/model labels, retrieval modes, searched counts, skipped counts,
  and truncation metadata only.
- Production chat success responses keep the existing `{ conversationId, reply }`
  shape; runtime budget details remain behind the existing non-production
  explicit debug gate and owner-scoped AI trace surfaces.
- ARGUS patched one provider-route bug: the missing-platform-provider check now
  respects configured BYOK providers before deciding DeepSeek/NVIDIA platform
  fallback is absent, and runtime budget provider labels now distinguish
  `byok_openai`, `byok_anthropic`, and `byok_deepseek`.
- Added a BYOK OpenAI regression proving configured BYOK chat is not blocked
  when platform fallback is absent and that production success responses do not
  expose runtime budget details.
- No ARIADNE rehearsal is required because PR31 changed API/runtime semantics
  only, not Studio chat UI/loading/error presentation.

Validation passed:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:token-credits
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## MIMIR Closeout

MIMIR closes PR31 on 2026-06-18.

PR31 is accepted as runtime budget trace alpha. The lane produced a
content-free, production-safe budget/trace report for persona chat assembly and
clearer failure classifications without changing Studio chat UI, adding SSE
streaming, changing retrieval/provider policy, or touching Redis/vector
contracts.

The BYOK provider-route bug ARGUS found and patched is included in the accepted
result. No ARIADNE rehearsal is required.
