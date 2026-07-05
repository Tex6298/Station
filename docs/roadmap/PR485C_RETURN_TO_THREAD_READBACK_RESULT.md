# PR485C - Return-To-Thread Readback Result

Owner: DAEDALUS / A2

Date: 2026-07-05

Status: Ready for ARGUS review

Validation result:

```text
READY_FOR_ARGUS_REVIEW
```

## Implementation

DAEDALUS added a compact owner-visible return card inside the existing
`PersonaChat` surface.

The card renders only when:

- the latest conversation has loaded;
- the conversation is active;
- a `conversationId` exists;
- at least one non-system message exists;
- the chat is not currently sending.

Actions stay local:

- `Continue` only focuses the existing composer;
- `Summarize` only pre-fills an owner-editable recap request and focuses the
  existing composer;
- `Start fresh` reuses the existing local `startNewChat()` path so the next
  send starts without a `conversationId`.

The owner must still press `Send` for any LLM call. If the owner sends the
prefilled summarize request, it goes through the existing
`sendPersonaChatWithStream` path and provider setup/error handling.

## Guardrails

Preserved:

- existing streaming send path and bearer-token client behavior;
- archived conversation read-only behavior and existing `New chat` recovery;
- provider setup/error callout behavior;
- token accounting, provider routing, runtime context, retrieval, prompt, and
  fallback behavior by leaving API/chat-stream internals untouched;
- PR485B Memory inbox routing and review behavior.

Not added:

- query params or route-selected conversation loading;
- automatic summarize/send behavior;
- durable summary storage;
- API, migration, prompt, retrieval, provider/runtime, token-accounting,
  Archive connector, billing, queue/worker, Redis, Cloudflare, social
  connector, public-write, broad shell, or Discern CSS changes.

## Validation

Passed locally on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/chat-stream.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts apps/web/components/studio/persona-chat.test.ts` | Pass | 27 chat-stream, navigation, Memory inbox, and PersonaChat no-drift tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API replayed from cache; web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint completed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

## ARGUS Review Request

ARGUS should review:

- the return card trigger conditions;
- `Continue` focus-only behavior;
- `Summarize` prefill-only behavior;
- local `Start fresh` behavior;
- archived read-only preservation;
- static no-drift coverage;
- absence of API/query-param/provider/runtime/scope drift.

If accepted, ARGUS should wake MIMIR with `WAKEUP A1:` for closeout and ARIADNE
hosted desktop/mobile rehearsal routing. If fixes are needed, wake DAEDALUS
with `WAKEUP A2:`.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR485C Web-Only Return-To-Thread Readback.
- The owner PersonaChat surface now shows a compact return card for active existing conversations with messages.
- Continue focuses the composer only, Summarize pre-fills only, and Start fresh uses local startNewChat().
Validation:
- Focused chat-stream/navigation/import-review/PersonaChat suite passed with 27 tests.
- typecheck passed.
- lint passed.
Task:
- Review trigger/action behavior, archived read-only preservation, and no-drift guardrails.
- If accepted, wake MIMIR with WAKEUP A1: for closeout and ARIADNE routing.
```
