# PR485E - Companion Chat Surface Polish Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hostile preflight

## Why This Lane

PR485A through PR485D translated the companion shortcuts, Memory inbox,
return-to-thread behavior, and private prompt context from the Discern companion
UX work.

The remaining useful Discern target is local chat surface polish: make the
private companion chat feel like a deliberate Station product surface rather
than a generic card with inline styles.

This lane should improve only the existing owner `PersonaChat` experience:

```text
/studio/personas/[personaId]
```

It should not import Discern's Studio shell, global CSS, route-query model, or
unwired controls.

## Current Tex Surface

Current `apps/web/components/studio/persona-chat.tsx` is functionally accepted
but visually rough:

- most chat styling lives inline inside the component;
- the header is a simple `Talking with {personaName}` row with status/actions;
- assistant actions are small text buttons with muted colors;
- the empty state says `Signal` and lacks a strong Station companion-home feel;
- the return-to-thread card works but is visually separate from the rest of the
  chat surface;
- the composer is functional but still a plain textarea/send row;
- archived chat and provider setup/error states work but need visual fit checks;
- there are no placeholder Attach/mic/more controls, and PR485E must preserve
  that honesty unless a control is genuinely wired.

## Reference Material

Treat these Discern commits as references only:

- `99ae8a5c feat: refine Studio chat layout`
  - useful for chat density, header/composer ergonomics, message hierarchy, and
    owner-workspace feel;
  - do not import its shell/sidebar/topbar replacement wholesale.
- `de7b918e feat: refine Station companion UX`
  - useful for companion presence/capability labels and return ritual polish;
  - do not import its global CSS, stale candidate inbox endpoint, route-query
    behavior, or placeholder icon controls.

## Candidate Slice For ARGUS To Review

MIMIR recommends a web-only private-chat polish slice:

1. Refactor `PersonaChat` visual structure into stable, scoped classes under a
   narrow prefix such as `.studio-persona-chat-*`, or another existing local
   pattern ARGUS accepts.
2. Polish the chat header:
   - persona name;
   - active/archived/new-thread state;
   - message count when applicable;
   - keep only live actions (`Archive`, `New chat`) visible.
3. Polish the return-to-thread card so it feels integrated with the chat surface
   while preserving PR485C behavior:
   - `Continue` focus-only;
   - `Summarize` prefill-only;
   - `Start fresh` local-only.
4. Polish message rows:
   - clearer user/assistant alignment;
   - readable widths and line-height;
   - assistant action buttons that are visibly live and not placeholder-looking;
   - disabled/loading states that do not shift layout.
5. Polish sending, error, provider setup, archived read-only, and empty states.
6. Polish the composer:
   - stable height and mobile behavior;
   - visible send affordance;
   - no hidden/unwired Attach, mic, tool, or more-menu icons.
7. Preserve existing behavior and add focused static tests/no-drift tests.

Expected ARIADNE follow-up if accepted and implemented:

- hosted desktop, `375px`, and `390px` rehearsal;
- active existing thread, empty/new chat, sending state if safely provable,
  provider setup/error if safely triggerable, and archived read-only state;
- confirm no horizontal overflow, clipped controls, overlapping text, or
  placeholder/unwired controls.

## Guardrails

Do not add:

- API changes;
- migrations or schema fields;
- prompt/retrieval/provider/runtime changes;
- token-accounting changes;
- route-selected conversation loading or query params;
- automatic LLM calls;
- durable summary/presence storage;
- Memory inbox behavior changes;
- Archive connector behavior;
- public persona chat behavior;
- billing, queues/workers, Redis, Cloudflare, social connectors, public writes,
  or broad shell work;
- Discern global CSS, Studio shell replacement, sidebar/topbar rewrite, or
  broad reskin of unrelated pages;
- placeholder controls for Attach, mic, tools, regenerate, copy, notes, or menus
  unless the action is genuinely wired and tested.

PR485E must preserve:

- PR485A shortcut strip rendering and routes;
- PR485B Memory inbox separation;
- PR485C local-only return-card actions;
- PR485D prompt-runtime behavior;
- archived conversation read-only behavior;
- existing `sendPersonaChatWithStream` path and status/error handling;
- owner-only privacy and no secret-shaped visible readback.

## ARGUS Questions

ARGUS should decide:

- Is this safe as a web-only component/CSS slice, or should it be split into
  header/return-card/composer/message-actions sublanes?
- Should styling move from inline styles to scoped global CSS classes under a
  narrow prefix, or stay component-local for this pass?
- Which visible states are mandatory for ARIADNE hosted rehearsal?
- Are any assistant message actions visually misleading today and therefore
  mandatory to fix in the first slice?

## Expected Validation If Accepted

DAEDALUS should be required to run:

- focused static/component no-drift tests for `PersonaChat`;
- web lint/typecheck;
- existing chat stream/navigation/import-review tests touched by PR485A-C;
- `git diff --check`.

ARGUS should require ARIADNE hosted desktop/mobile rehearsal before closeout
because PR485E is visible UI.

## Verdicts

Return one of:

```text
ACCEPT_PR485E_WEB_ONLY_CHAT_POLISH
ACCEPT_WITH_PATCHED_BOUNDARY
SPLIT_BEFORE_IMPLEMENTATION
BLOCKED_NEEDS_MIMIR_DECISION
REJECT_SCOPE_TOO_RISKY
```

If accepted, wake DAEDALUS with the exact implementation boundary. If split or
blocked, wake MIMIR with the smallest concrete decision needed.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR485D after ARGUS accepted the no-migration private prompt-context implementation.
- MIMIR opened PR485E to hostile-preflight local private companion chat surface polish, using Discern as reference only.
Task:
- Review whether PR485E is safe as a web-only PersonaChat polish lane.
- Decide the exact boundary, mandatory no-drift tests, and ARIADNE hosted rehearsal requirements.
- If accepted, wake DAEDALUS with the exact implementation boundary; if split or blocked, wake MIMIR with the smallest decision needed.
Guardrails:
- No API changes, migrations, prompt/retrieval/provider/runtime changes, route-query behavior, automatic LLM calls, durable storage, Memory inbox changes, Archive connector behavior, public chat behavior, infra, broad shell work, Discern global CSS, or placeholder/unwired controls.
```
