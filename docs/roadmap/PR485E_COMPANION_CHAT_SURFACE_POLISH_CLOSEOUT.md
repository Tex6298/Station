# PR485E - Companion Chat Surface Polish Closeout

Owner: MIMIR / A1

Date closed: 2026-07-05

Status: Closed - hosted rehearsal passed

## Result

PR485E is closed as:

```text
PASS_READY_TO_CLOSE
```

DAEDALUS implemented the scoped private `PersonaChat` polish:

`docs/roadmap/PR485E_COMPANION_CHAT_SURFACE_POLISH_RESULT.md`

ARGUS accepted the implementation without a review patch:

`docs/roadmap/PR485E_COMPANION_CHAT_SURFACE_POLISH_REVIEW_RESULT.md`

ARIADNE passed the hosted desktop, `375px`, and `390px` rehearsal:

`docs/roadmap/PR485E_COMPANION_CHAT_SURFACE_POLISH_REHEARSAL_RESULT.md`

## Accepted Product Truth

The private owner persona chat surface now has a more deliberate Station chat
presentation without changing chat behavior.

Accepted behavior:

- scoped `.studio-persona-chat-*` CSS replaces inline private chat surface
  styling;
- private chat header, state/count readback, message rows, return card,
  assistant action row, composer, status/error copy, provider setup copy,
  archived read-only state, and candidate/archive panel fit the current Studio
  visual language;
- PR485C return-card actions remain local and honest: `Continue` focus-only,
  `Summarize` prefill-only, and `Start fresh` local-only;
- archived conversations remain read-only with `New chat` recovery;
- existing streaming send, status/error, archive, save-memory, promote-canon,
  and candidate review behavior are preserved;
- no Attach, mic, tools, copy, regenerate, notes, menu, or similar placeholder
  controls were added.

## Hosted Proof

ARIADNE verified hosted web/API freshness at app commit `a0dc474f`.

Passed:

- active owner thread on desktop, `375px`, and `390px`;
- return-card local actions without network requests;
- archived read-only proof with candidate panel and wired assistant actions;
- one explicit owner `Send` to exercise the existing stream/error path;
- Memory and Memory inbox route separation;
- public persona chat no-drift;
- no visible overflow, clipped controls, fake controls, private source bodies,
  raw ids, tokens, cookies, prompts, provider payloads, stack traces, SQL
  details, hosted logs, or secret-shaped values.

## Not In PR485E

No API route, migration, prompt/retrieval/provider/runtime change,
token-accounting change, route-query behavior, route-selected conversation
loading, automatic LLM call, durable summary/presence storage, Memory inbox
change, Archive connector change, public chat behavior, billing, queue, worker,
Redis, Cloudflare, social connector, broad shell work, Discern global CSS,
sidebar/topbar replacement, unrelated page reskin, or infra work entered this
lane.

## PR485 Chain Closeout

PR485A through PR485E now cover the specific Discern companion UX translation
requested for this sequence:

- companion shortcuts;
- Memory / continuity candidate inbox;
- return-to-thread readback;
- private companion capability/presence prompt context;
- private chat surface polish.

ARIADNE found no PR485E product defect requiring a chat-polish repair lane.

## Next Lane

MIMIR is opening PR486 as a new customer-facing product lane, not another
companion-chat extension:

`docs/roadmap/PR486_DOCUMENT_MIGRATOR_PRODUCT_DEPTH_PREFLIGHT_ARGUS.md`

