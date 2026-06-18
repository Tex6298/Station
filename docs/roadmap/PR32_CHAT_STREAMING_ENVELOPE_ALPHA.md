# PR32 - Chat Streaming Envelope Alpha

Date: 2026-06-18
Status: accepted by ARGUS for ARIADNE rehearsal
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses because Studio
chat behavior changes visibly.

## Purpose

Make persona chat feel alive without weakening the runtime safety PR31 just
proved.

PR31 added content-free budget/trace truth before provider calls. PR32 can now
add a bounded streaming path that reuses the same ownership, archive-state,
quota, provider, trace, and production-response safety rules.

This lane must be honest about what streams. If a provider adapter supports
token deltas safely, stream token deltas. If it does not, stream status/progress
events and a final saved reply without pretending those are token deltas.

## Scope

- Add an authenticated streaming chat route for persona chat.
- Reuse the existing non-streaming chat validation, owner checks,
  archived-conversation block, runtime context assembly, token quota check,
  provider selection, AI trace metadata, token accounting, message persistence,
  and error classification.
- Use a safe browser transport that can send auth headers, such as `fetch()` and
  a readable response stream. Do not put bearer tokens in URL query params.
- Emit a small stable event vocabulary, for example:
  - `chat.status` for assembling context, checking quota, waiting for provider,
    and saving;
  - `chat.delta` only for real provider text deltas;
  - `chat.complete` with the saved reply payload;
  - `chat.error` with production-safe `code` and `classification`.
- Keep `POST /conversations/persona/:personaId/chat` stable for non-streaming
  clients.
- Add Studio chat integration with a graceful fallback to the existing
  non-streaming POST path if streaming is unsupported or fails before provider
  execution.
- Keep runtime budget details behind the accepted PR31 trace/debug boundaries.

## Non-Scope

- Do not add unauthenticated EventSource token-in-query chat streams.
- Do not claim token-delta streaming for providers that only return final text.
- Do not add provider marketplace, model routing policy, Redis memory truth, or
  vector-contract changes.
- Do not redesign Studio chat beyond the minimum streaming/status affordance.
- Do not change memory/canon/archive retrieval semantics.

## Acceptance

- Streaming and non-streaming chat paths share the same security and failure
  behavior for owner scope, archived conversations, quota, provider config, and
  provider failure.
- Production streaming events never expose raw runtime budget, private archive
  internals, provider keys, or hidden debug metadata.
- A successful stream persists exactly one user message and one assistant reply
  and returns the saved reply in `chat.complete`.
- Provider-token deltas are emitted only when backed by a real provider stream;
  otherwise the UI shows honest progress and final completion.
- Studio chat shows a visible streamed/progress state and falls back cleanly
  without duplicating messages.

## Validation

Run the focused gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:token-credits
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

## ARGUS Review Ask

ARGUS should hostile-review:

- auth and token handling for the streaming transport;
- parity between streaming and non-streaming chat gates;
- no duplicate persisted messages on retry/fallback;
- no debug/runtime-budget/private material leakage in stream events;
- provider-delta honesty;
- whether the visible Studio change requires ARIADNE rehearsal.

## ARIADNE Rehearsal Ask

If ARGUS accepts the implementation, ARIADNE should run a human-eye Studio chat
rehearsal on desktop and 375px:

- send a normal message;
- watch the status/streaming state;
- confirm fallback/error copy is understandable if a provider/config failure is
  simulated or already visible;
- confirm messages do not duplicate;
- confirm no layout overlap or horizontal overflow.

## Wake Discipline

DAEDALUS should wake ARGUS with:

- files changed;
- streaming route and event contract;
- transport/auth decision;
- provider-delta honesty statement;
- fallback behavior;
- validation commands/results;
- whether ARIADNE should run browser rehearsal.

## ARGUS Review Result

ARGUS accepts PR32 for ARIADNE rehearsal, 2026-06-18.

- The streaming route uses the same authenticated Express route/middleware and
  shared internal chat-turn runner as the non-streaming JSON POST.
- The web client uses `fetch()` with `Authorization: Bearer`; no bearer token is
  placed in the URL or query string.
- Stream events are `chat.status`, `chat.complete`, and `chat.error`; no
  `chat.delta` is emitted until a real provider-delta adapter exists.
- Stream events avoid raw prompts, user text echoes, archive/memory content,
  runtime budget/debug payloads, and provider keys.
- BYOK stream tests prove one user message and one assistant reply are persisted
  without duplicate fallback writes.
- ARIADNE should rehearse Studio chat on desktop and 375px because the visible
  waiting/status state changed.

Validation passed:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:token-credits
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

`npm exec --yes pnpm@10.32.1 -- --filter @station/web build` compiled, linted,
type checked, and generated 30 pages, then reproduced the known local Windows
Next standalone symlink `EPERM` caveat during traced-file copy.
