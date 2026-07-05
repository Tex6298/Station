# PR485C - Return-To-Thread Readback Preflight Result

Owner: ARGUS / A3

Date: 2026-07-05

Status: Accepted - wake DAEDALUS

Validation result:

```text
ACCEPT_PR485C_WEB_ONLY_RETURN_TO_THREAD
```

## Verdict

ARGUS accepts a web-only return-to-thread card on the existing owner persona
home/chat surface.

The first PR485C slice must not add route selection, query params, API changes,
automatic summarization, durable summaries, prompt changes, retrieval changes,
or provider/runtime changes.

## Exact Product Slice

DAEDALUS should add a compact owner-visible return card inside
`PersonaChat` when an existing active conversation with non-system messages is
loaded.

Allowed actions:

- `Continue`: focus the existing composer without sending automatically.
- `Summarize`: prefill a short owner-editable summary request in the existing
  composer. It must not send automatically.
- `Start fresh`: reuse the existing local `startNewChat()` behavior so the next
  send starts without a `conversationId`.

The owner must still press `Send` for any LLM call. If the owner sends the
prefilled summarize request, it must go through the existing
`sendPersonaChatWithStream` path and fallback behavior.

## Route And State Decision

`?c=[conversationId]` and `?c=new` are out of scope for PR485C.

The first slice should not change the URL. It should use local component state
only. Conversation selection remains "latest conversation by default" until a
separate route-selection lane is accepted.

## Trigger Decision

Show the card only when:

- loading is complete;
- `conversationStatus` is `active`;
- `conversationId` is present;
- there is at least one non-system message;
- the chat is not currently sending.

Do not show the card for an empty new chat. Archived conversations must remain
read-only and keep the existing `Archived` / `New chat` path.

## API Scope

No API changes are allowed.

Do not touch:

- `apps/api/src/routes/conversations.ts`;
- `sendPersonaChatWithStream` implementation except for tests if needed;
- prompt construction, retrieval, answer contracts, runtime context selection,
  token accounting, provider routing, or provider setup/error handling;
- migrations, jobs, queues, Redis, Cloudflare, hosted runtime, billing, social
  connectors, Archive Connector behavior, public writes, or Developer Spaces.

## Acceptable Touched Files

Acceptable files or local equivalents:

- `apps/web/components/studio/persona-chat.tsx`
- `apps/web/lib/chat-stream.test.ts`
- `apps/web/lib/studio-navigation.test.ts`
- `apps/web/lib/import-review.test.ts`, only for no-drift coverage if the
  existing suite remains the easiest guard
- `apps/web/app/globals.css`, only for small scoped `.studio-*` classes if
  existing inline/local styles are insufficient
- roadmap/testing docs for the implementation result

## Required Guardrails

Preserve:

- `sendPersonaChatWithStream` import and send path;
- fallback chat POST behavior;
- private provider setup/error notices;
- token accounting and provider routing;
- archived conversation read-only behavior;
- existing `New chat` behavior;
- PR485B Memory inbox behavior and shortcut routing;
- runtime/retrieval privacy and existing persona panels.

Do not:

- send a summary request automatically on page load or button click;
- store a durable summary;
- expose raw conversation ids in visible copy;
- add query params or route-selected conversation loading;
- add stale Discern `/conversations/candidates/inbox` behavior;
- import Discern global CSS or broad Studio shell changes.

## ARGUS Answers

1. PR485C is safe as web-only; route selection can wait.
2. `Summarize` must prefill text only. The owner may edit and press `Send`,
   which uses existing streaming.
3. Trigger on any loaded active existing conversation with non-system messages.
4. `Start fresh` is local state only; no URL/query update.
5. Archived conversations remain read-only with the existing `Archived` /
   `New chat` path.
6. Static tests must prove `sendPersonaChatWithStream` remains imported/used,
   summarize is prefill-only, `startNewChat()` remains local, and no stale
   Discern endpoint or forbidden scope enters.
7. ARIADNE should rehearse the visible chat surface on hosted desktop and
   mobile after ARGUS accepts implementation.

## ARGUS Validation

Passed locally on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code and handoff inspection | Pass | Reviewed PR485C handoff, current PersonaChat streaming/archive/new-chat behavior, chat-stream client, and existing no-drift tests. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/chat-stream.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts` | Pass | 23 streaming, navigation, Memory inbox, and no-drift tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors after ARGUS preflight docs; CRLF normalization warnings only. |

DAEDALUS implementation validation must include:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/chat-stream.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

Focused tests should additionally prove:

- `PersonaChat` still imports and calls `sendPersonaChatWithStream`;
- `Summarize` only sets composer input and never calls `send()` directly;
- `Continue` only focuses the composer;
- `Start fresh` uses local `startNewChat()` and does not write query params;
- archived conversations keep composer/send disabled and only expose new-chat
  recovery;
- no stale `/conversations/candidates/inbox`, Memory inbox change, Archive
  connector, prompt/presence, billing, Redis, Cloudflare, social connector,
  public-write, queue/worker, broad shell, or Discern CSS drift enters scope.

## ARIADNE Rehearsal After Implementation

After ARGUS accepts DAEDALUS' implementation, MIMIR should route ARIADNE for
hosted desktop and mobile rehearsal of `/studio/personas/[personaId]`.

ARIADNE should verify:

- an active existing conversation shows the return card;
- `Continue` focuses the composer without sending;
- `Summarize` pre-fills editable text without sending;
- `Start fresh` clears local chat state and leaves the URL unchanged;
- archived conversations remain read-only and still offer `New chat`;
- private chat still streams and provider setup/error behavior remains intact;
- desktop, `375px`, and `390px` mobile have no overlap or clipped controls;
- no raw conversation ids, private ids, prompts, provider payloads, tokens,
  cookies, stack traces, hosted logs, or secret-shaped values render.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR485C Web-Only Return-To-Thread Readback as the next Discern companion UX translation slice.
Verdict:
- ACCEPT_PR485C_WEB_ONLY_RETURN_TO_THREAD
Task:
- Add a compact return-to-thread card inside the existing owner PersonaChat surface for active existing conversations.
Guardrails:
- Continue focuses the composer; Summarize pre-fills only; Start fresh uses local `startNewChat()`.
- No query params, API changes, automatic LLM calls, durable summaries, prompt/retrieval/provider/runtime changes, token-accounting changes, stale Discern inbox endpoint, Archive connector changes, billing, queues/workers, Redis, Cloudflare, social connectors, public writes, broad shell, or Discern CSS.
Validation:
- Run the chat-stream/studio-navigation/import-review focused suite, typecheck, lint, and git diff whitespace checks.
```
