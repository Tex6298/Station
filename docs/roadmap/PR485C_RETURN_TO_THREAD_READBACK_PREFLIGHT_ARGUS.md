# PR485C - Return-To-Thread Readback Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - wake ARGUS

## Why This Lane

PR485A and PR485B are closed. The next useful Discern companion UX translation
slice is return-to-thread readback:

- continue an existing open thread;
- ask for orientation or a summary before continuing;
- start fresh without confusing that with archived read-only state.

Discern's reference commit `de7b918e` includes a useful return ritual pattern,
but it must not be copied wholesale. It uses a stale candidate inbox endpoint,
non-streaming chat calls, and Discern shell assumptions.

Current Tex truth:

- `PersonaChat` uses `sendPersonaChatWithStream` and fallback chat POST;
- private provider setup/error handling and token accounting must stay intact;
- the page loads the latest conversation by default;
- active conversations continue implicitly when the owner sends another message;
- archived conversations are read-only and already offer `New chat`;
- no explicit return-to-thread card currently offers Continue, summarize, or
  start fresh;
- current `/studio/personas/[personaId]` does not expose route-level
  conversation selection or `?c=new` behavior.

## ARGUS Task

Hostile-preflight PR485C and decide the smallest safe implementation slice.

Return exactly one of:

```text
ACCEPT_PR485C_WEB_ONLY_RETURN_TO_THREAD
ACCEPT_PR485C_ROUTE_SELECTION_ONLY
ACCEPT_PR485C_COPY_ONLY
PATCH_SCOPE
BLOCKED_NEEDS_UNBLOCK_LANE
BLOCKED_NEEDS_MIMIR_DECISION
REJECT_DEFER
```

If accepted, specify:

- exact product slice;
- exact surface: owner persona home/chat only, or another Tex-local equivalent;
- whether `?c=[conversationId]` and `?c=new` behavior is in scope;
- whether "Summarize" should prefill a prompt or send a user-triggered normal
  chat turn through existing streaming;
- whether any API changes are allowed;
- acceptable touched files or local equivalents;
- validation commands;
- whether ARIADNE hosted desktop/mobile rehearsal is required after ARGUS
  accepts DAEDALUS implementation.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables return-to-thread readback.

## Candidate Implementation Shape

ARGUS may accept, patch, or reject this shape.

### Web-Only Return-To-Thread Card

Add a compact owner-visible return card inside the existing persona chat/home
surface when an active existing conversation is loaded.

The card may offer:

- `Continue`: focus the composer or prefill a short carry-on prompt without
  sending automatically;
- `Summarize`: either prefill a summary request or, if ARGUS accepts it, send a
  normal owner-triggered chat turn through existing `sendPersonaChatWithStream`;
- `Start fresh`: clear local chat state and start the next send without a
  `conversationId`, or route to an accepted `?c=new` state if ARGUS includes
  route selection.

The card should:

- preserve streaming chat and fallback behavior;
- preserve provider setup/error notices;
- preserve archived conversation read-only behavior;
- avoid automatic LLM calls on page load;
- avoid new durable summary storage;
- avoid route/query params unless ARGUS explicitly accepts them.

### Route Selection Only

If the return card depends on safer conversation targeting first, ARGUS may
accept a smaller route-selection lane:

- support `?c=[conversationId]` for owner-selected conversation load;
- support `?c=new` for a clean new local chat;
- keep UI copy minimal and defer summarize/continue/start-fresh affordances.

### Copy-Only Orientation

If actions are too risky for the first slice, ARGUS may accept copy-only
orientation:

- show the loaded conversation state, archived/read-only status, and last
  message freshness;
- leave all mutation and summarization behavior unchanged.

## Questions ARGUS Should Answer

1. Is PR485C safe as web-only, or does conversation route selection need API
   hardening first?
2. Should `Summarize` prefill text or send a normal owner-triggered chat turn?
3. What trigger should show the return card: any existing active conversation,
   only after a time threshold, only after page reload, or only when a
   conversation is selected by query param?
4. Should `Start fresh` update the URL/query state, or is local state enough?
5. How should archived conversations remain clearly read-only while still
   offering a new chat path?
6. What static tests should prove streaming chat remains imported/used and no
   stale Discern inbox endpoint returns?
7. What hosted desktop/mobile checks should ARIADNE run if PR485C changes the
   chat surface?

## Guardrails

Do not:

- remove or bypass `sendPersonaChatWithStream`;
- add automatic summarization on page load;
- add durable summary storage, migrations, jobs, queues, Redis, Cloudflare, or
  provider/model configuration;
- change prompt construction, retrieval, answer contracts, runtime context
  selection, token accounting, or provider routing;
- reintroduce Discern's stale `/conversations/candidates/inbox` endpoint;
- change PR485B Memory inbox behavior, import review behavior, Archive
  Connector behavior, billing, social connectors, public writes, or Developer
  Spaces;
- broad-reskin Studio, import Discern global CSS, or replace the global shell;
- expose private ids, raw conversation ids in visible copy, source bodies,
  compiled prompts, provider payloads, tokens, cookies, SQL details, stack
  traces, hosted logs, or secret-shaped values.

## Suggested Validation

ARGUS may refine this, but DAEDALUS implementation validation should likely
include:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/chat-stream.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If route/query behavior is accepted, add focused tests for:

- `?c=new`;
- selected conversation load behavior if statically testable;
- archived read-only copy/action boundaries;
- no stale Discern endpoint, prompt/presence, Memory inbox, Archive connector,
  billing, Redis, Cloudflare, social, public-write, queue/worker, broad shell,
  or Discern CSS drift.

## Wakeup Template

If accepted:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR485C Return-To-Thread Readback preflight.
Verdict:
- ACCEPT_PR485C_WEB_ONLY_RETURN_TO_THREAD | ACCEPT_PR485C_ROUTE_SELECTION_ONLY | ACCEPT_PR485C_COPY_ONLY | PATCH_SCOPE
Task:
- Implement the exact PR485C slice ARGUS names, translating Discern's return-to-thread behavior into Tex Station's streaming chat and owner workspace.
Guardrails:
- Preserve streaming, provider setup/error handling, archived read-only state, token accounting, runtime/retrieval privacy, and scoped Studio UI.
```

If blocked or decision-dependent:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR485C Return-To-Thread Readback preflight.
Verdict:
- BLOCKED_NEEDS_UNBLOCK_LANE | BLOCKED_NEEDS_MIMIR_DECISION | REJECT_DEFER
Task:
- Choose the smallest unblock lane, make the product decision, or choose another numbered Discern companion UX slice.
```

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR485B Memory / continuity candidate inbox is closed after ARGUS acceptance and ARIADNE hosted rehearsal pass.
- MIMIR opens PR485C as the next Discern companion UX translation slice: return-to-thread readback.
- Discern has a useful continue/summarize/start-fresh return ritual, but Tex must preserve `sendPersonaChatWithStream`, provider setup/error behavior, archived read-only state, and current owner workspace privacy.
Task:
- Hostile-preflight PR485C and choose the smallest safe implementation slice.
- Decide web-only vs route-selection first, summarize prefill vs owner-triggered streamed chat turn, trigger conditions, URL/state behavior, validation, and ARIADNE rehearsal needs.
- Wake DAEDALUS with an accepted implementation lane, or wake MIMIR with a concrete blocker/unblock decision.
```

