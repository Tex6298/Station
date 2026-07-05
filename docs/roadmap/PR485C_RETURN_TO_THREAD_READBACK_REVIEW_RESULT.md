# PR485C - Return-To-Thread Readback Review Result

Owner: ARGUS / A3

Date: 2026-07-05

Status: Accepted - wake MIMIR

Validation result:

```text
ACCEPT_PR485C_RETURN_TO_THREAD_READBACK_IMPLEMENTATION
```

## Verdict

ARGUS accepts DAEDALUS' PR485C implementation without a review patch.

The implementation matches the accepted web-only return-to-thread lane:

- `PersonaChat` renders a compact return card only after the latest
  conversation has loaded, the conversation is active, a `conversationId`
  exists, at least one non-system message exists, and the chat is not sending;
- `Continue` only focuses the existing composer;
- `Summarize` only pre-fills an owner-editable recap request and focuses the
  existing composer;
- `Start fresh` reuses the local `startNewChat()` path so the next send starts
  without a `conversationId`;
- the owner must still press `Send` for any LLM call, and a sent summary request
  still goes through the existing `sendPersonaChatWithStream` path;
- archived conversations remain read-only and keep the existing `Archived` /
  `New chat` recovery path;
- no URL/query params, route-selected conversation loading, automatic LLM call,
  durable summary storage, API route, prompt/retrieval/provider/runtime,
  token-accounting, Archive connector, billing, queue/worker, Redis,
  Cloudflare, social connector, public write, broad shell, or Discern CSS
  behavior changed.

## Review Notes

Accepted trigger:

```text
!state.loading
state.conversationStatus === "active"
Boolean(state.conversationId)
visibleMessages.length > 0
!state.sending
```

The card does not render for a brand-new empty chat, an archived conversation,
or while a chat stream is already sending.

The visible card copy does not expose raw conversation ids, owner ids, source
ids, prompt/provider payloads, tokens, cookies, stack traces, logs, or
secret-shaped values.

The static PersonaChat tests are narrow, but appropriate for this slice: they
assert the existing streaming send import/path, the return-card trigger, the
local-only action handlers, archived read-only controls, and the explicit
no-drift guardrails for route/query/API/provider/runtime/broad-scope changes.

Residual risk is visual/hosted only. Because this changes the owner chat
surface, MIMIR should route ARIADNE for desktop and `375px`/`390px` mobile
rehearsal before final closeout.

## ARGUS Validation

Passed locally on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Reviewed `PersonaChat` handlers, trigger conditions, archived read-only preservation, static tests, docs, and wakeup commit. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/chat-stream.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts apps/web/components/studio/persona-chat.test.ts` | Pass | 27 streaming, navigation, Memory inbox, PersonaChat action, and no-drift tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API replayed from cache; web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint completed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warning only. |

Build was not rerun for PR485C. The existing local Windows Next standalone
symlink `EPERM` caveat remains the build truth if build is rerun.

## ARIADNE Rehearsal Required

MIMIR should route ARIADNE for hosted rehearsal of:

```text
/studio/personas/[personaId]
```

ARIADNE should verify:

- an active existing conversation with non-system messages shows the return
  card on desktop, `375px`, and `390px` mobile;
- `Continue` focuses the composer only and does not send or mutate text;
- `Summarize` pre-fills the editable recap request only and does not send;
- `Start fresh` locally clears the active thread state and the next send starts
  without a carried `conversationId`;
- archived conversations remain read-only and expose only the existing
  `New chat` recovery path;
- streaming success, provider setup/error callouts, and failed-send input
  restoration still behave as before;
- no private ids, source bodies, prompt/provider payloads, tokens, cookies,
  stack traces, logs, or secret-shaped values render;
- no Memory inbox, Archive connector behavior, query-param route selection,
  automatic summary call, prompt/presence context, billing, queues/workers,
  Redis, Cloudflare, social connector, public write, broad shell work, or
  Discern CSS drift appears.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR485C Return-To-Thread Readback implementation without a review patch.
Verdict:
- ACCEPT_PR485C_RETURN_TO_THREAD_READBACK_IMPLEMENTATION
Task:
- Close or route PR485C according to the visible-surface process. ARGUS recommends ARIADNE hosted desktop and 375px/390px mobile rehearsal of /studio/personas/[personaId] before final closeout.
Guardrails:
- Keep PR485C scoped to the accepted web-only return card. Query params, route-selected conversation loading, automatic summary/LLM calls, durable summary storage, API changes, prompt/retrieval/provider/runtime changes, token-accounting changes, Archive connector behavior, Memory inbox changes, billing, queues/workers, Redis, Cloudflare, social connectors, public writes, broad shell work, and Discern CSS remain out of scope.
Validation:
- ARGUS replayed the chat-stream/studio-navigation/import-review/PersonaChat focused suite, typecheck, lint, and git diff whitespace checks; all passed.
```
