# PR438 - Owner BYOK Settings And Private Replay Unblock Surface

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

State: IMPLEMENTED - ACCEPTED BY ARGUS

## Context

PR436 proved hosted private replay now fails closed instead of sending private
context to NVIDIA. PR437 then rejected using the existing Gemini embedding key
as an immediate private staged chat route:

- current Station has Gemini embeddings, not Gemini chat;
- unpaid Gemini API posture is not acceptable for private replay context;
- paid Gemini chat would need a separate future provider/data-policy lane;
- existing supported private chat routes are platform Anthropic, platform
  DeepSeek, or owner BYOK for OpenAI/Anthropic/DeepSeek.

MIMIR chooses not to open Gemini chat now. The immediate hosted proof still needs
one accepted non-NVIDIA route configured:

- preferred platform config: `ANTHROPIC_API_KEY` on the API service;
- fallback platform config: `DEEPSEEK_API_KEY`;
- product route: owner BYOK using an already supported provider.

Do not block this implementation lane on Marty adding config. This lane removes
the product gap where the backend supports owner BYOK, but Settings does not
give the replay owner a safe way to configure it.

## Task

Implement a narrow owner BYOK settings surface for already supported chat
providers:

1. Add authenticated API support to read and update the current user's AI
   provider settings without returning raw keys.
2. Support `ai_mode` as `platform` or `byok`.
3. Support BYOK keys for `openai`, `anthropic`, and `deepseek` only.
4. Support clearing stored BYOK keys.
5. Surface only masked/presence readback, such as provider configured/not
   configured and last-four where already appropriate. Do not return raw keys.
6. Add a Settings UI entry/panel for AI provider/BYOK setup.
7. Make the existing persona/provider copy honest:
   - `platform` remains the normal Station route;
   - OpenAI/Anthropic/DeepSeek require BYOK setup or platform config;
   - Gemini is embeddings-only/deferred for chat and must not appear as a live
     private chat option.
8. Add tests for API auth, update, clear, non-leak readback, and chat routing
   using an owner BYOK provider.
9. Add or update readiness/observability copy only if needed to keep PR436
   replay blockers understandable.

## Boundaries

Do not:

- implement Gemini chat;
- send private replay data to Gemini;
- unblock private NVIDIA;
- add a provider marketplace or full model menu;
- add OpenAI-compatible custom endpoints;
- add schema migrations unless the existing `profiles` columns cannot support
  the narrow task;
- commit, log, echo, serialize, or snapshot raw provider keys, prompts,
  completions, provider payloads, private context snippets, cookies, headers,
  Railway/Supabase variables, trace IDs, or owner/persona/conversation IDs;
- run a live provider call unless MIMIR explicitly provides a test-safe route.

## Expected Validation

Run the focused tests that cover touched code, plus:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If a web build is run and hits the known Windows standalone symlink `EPERM`
after compile/page generation, record it as the known local Windows failure with
the pre-failure result.

## Hand Off

When complete, wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR438 owner BYOK settings and private replay unblock surface.
- Gemini remains embeddings-only/deferred for chat.
- No private NVIDIA route was opened.
Risk:
- BYOK key storage/readback, Settings UI honesty, and private replay routing need hostile review.
Task:
- Review PR438, run validation, and wake MIMIR with verdict.
```

If this cannot be implemented without a broader secret-storage or schema
decision, wake MIMIR instead with the smallest explicit decision needed.

## ARGUS Review

ARGUS accepted this lane on 2026-06-28:

`docs/roadmap/PR438_OWNER_BYOK_SETTINGS_UNBLOCK_REVIEW_RESULT.md`

The accepted scope remains OpenAI/Anthropic/DeepSeek owner BYOK settings only.
Gemini chat remains deferred, and private NVIDIA remains blocked.
