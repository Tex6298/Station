# PR497B - Companion Home Initial Scroll Fix Review Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR497B_COMPANION_HOME_INITIAL_SCROLL_FIX_IMPLEMENTATION
```

## ARGUS Verdict

ARGUS accepts PR497B.

The fix is exactly scoped to the hosted PR497A defect: `PersonaChat` no longer
uses a child `scrollIntoView` marker that can move the document viewport after
an active conversation loads. Auto-scroll now targets only the
`.studio-persona-chat-thread` element with `thread.scrollTo(...)`.

No ARGUS code patch was needed.

## Accepted Implementation Truth

- Page-level `bottomRef.current?.scrollIntoView(...)` is gone.
- The only auto-scroll target is `threadRef.current`, the chat thread element.
- Initial active-thread load may move the in-thread scroll position to the
  newest message, but should not move the page away from PR497A's
  companion-first first viewport.
- Send/stream behavior remains on the existing `sendPersonaChatWithStream`
  path.
- Return-card actions did not change:
  - `Pick up where you left off` focuses the composer only;
  - `Ask for recap` pre-fills the composer only;
  - `Start fresh` clears local conversation state only.
- Archive, provider setup, Memory/Canon candidate review, route, privacy, and
  PR497A copy/hierarchy behavior did not change.
- Changed implementation files are limited to `PersonaChat` and its focused
  test, plus docs/state.

No backend/runtime/provider/schema/auth/billing/Redis/Cloudflare/worker/queue/
deployment/package metadata/CSS/public-chat/visibility drift was found.

## Hosted Proof Required

MIMIR should route ARIADNE for a PR497B hosted rerun before closeout.

The rerun should focus on the original failure:

- signed-in owner opens `/studio/personas/:personaId` with an active non-empty
  thread;
- desktop, `375px`, and `390px` landed viewport still starts with the persona
  identity/header and `Companion Home` hierarchy after chat data loads;
- the chat thread itself can be scrolled to the latest message without moving
  the document viewport;
- return-card controls remain local and owner-triggered;
- no horizontal overflow, clipped controls, private/raw/source id leakage,
  provider payloads, stack traces, secret-shaped values, stale endpoints,
  placeholder controls, automation claims, or backend/runtime scope drift
  appears.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| ARGUS code review | Pass | Reviewed scroll containment, send/stream behavior, return-card behavior, and changed-file scope. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/studio/persona-chat.test.ts` | Pass | 7 focused PersonaChat tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts` | Pass | 24 companion stack tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warning only for ARGUS state; no whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR497B as ACCEPT_PR497B_COMPANION_HOME_INITIAL_SCROLL_FIX_IMPLEMENTATION.
- PersonaChat removed page-level scrollIntoView and now scrolls only the chat thread element.
- Send/stream, archive, provider setup, return-card local actions, PR497A hierarchy/copy, and privacy/scope boundaries did not drift.
- Focused PersonaChat tests, companion stack tests, typecheck, lint, git diff --check, and git diff --cached --check passed.
Task:
- Route ARIADNE for a hosted desktop/375px/390px rerun proving active-thread load no longer lands below the companion-first first viewport.
```
