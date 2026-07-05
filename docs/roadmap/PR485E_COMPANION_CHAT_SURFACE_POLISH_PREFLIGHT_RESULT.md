# PR485E - Companion Chat Surface Polish Preflight Result

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Accepted for DAEDALUS implementation

## Verdict

```text
ACCEPT_PR485E_WEB_ONLY_CHAT_POLISH
```

ARGUS accepts PR485E as one web-only private `PersonaChat` polish lane. It does
not need to be split before implementation, provided DAEDALUS stays inside the
strict component/CSS boundary below.

## Decision

PR485E is safe as a single owner-chat UI polish slice because the roughness is
localized in `apps/web/components/studio/persona-chat.tsx`, existing studio CSS
already uses scoped `.studio-*` global classes, and the required changes do not
need API, prompt, provider, route, persistence, Memory inbox, Archive connector,
or public chat changes.

Styling may move from inline styles into narrowly scoped global CSS classes
under `.studio-persona-chat-*` in `apps/web/app/globals.css`. Component-local
dynamic state, ARIA labels, and small conditional class names are fine. Broad
selectors, Discern global CSS, shell/sidebar/topbar styling, and unrelated
studio reskins are not accepted.

Existing assistant message actions are visually misleading because the current
buttons are very muted but still perform live `save-memory` and `save-canon`
actions. DAEDALUS should either polish those existing live actions so they read
as real owner controls or leave the behavior unchanged with clearer disabled and
loading states. DAEDALUS must not add copy, regenerate, attach, mic, notes,
tools, menu, or other placeholder controls.

## Accepted Implementation Boundary

Allowed files:

- `apps/web/components/studio/persona-chat.tsx`
- `apps/web/components/studio/persona-chat.test.ts`
- `apps/web/app/globals.css`, only scoped `.studio-persona-chat-*` selectors and
  responsive rules scoped to that prefix
- focused static no-drift tests already protecting PR485A through PR485C, if a
  test assertion must be adjusted without changing behavior:
  `apps/web/lib/chat-stream.test.ts`,
  `apps/web/lib/studio-navigation.test.ts`, and
  `apps/web/lib/import-review.test.ts`
- roadmap and validation docs for the implementation result

Allowed UI work:

- polish the existing owner `PersonaChat` shell on
  `/studio/personas/[personaId]`;
- improve the header with persona name, active/new/archived state, message
  count, and only the live `Archive` and `New chat` actions;
- integrate the return-to-thread card while preserving `Continue` focus-only,
  `Summarize` prefill-only, and `Start fresh` local-only behavior;
- improve message rows, user/assistant alignment, readable widths, line-height,
  and stable disabled/loading states;
- make the existing live assistant actions (`Save to memory` and
  `Promote to canon`) visually honest and stable;
- improve sending, empty, provider setup/error, archived read-only, and existing
  continuity-candidate archive states without changing their data flow;
- improve composer fit, mobile behavior, and the existing visible send action.

Forbidden work:

- API changes;
- migrations or schema fields;
- `packages/ai`, prompt, retrieval, provider, runtime, token-accounting, trace,
  or stream contract changes;
- route-selected conversation loading, query params, `useRouter`,
  `useSearchParams`, `URLSearchParams`, or `window.history` behavior;
- automatic LLM calls, automatic summaries, durable summary storage, or durable
  companion-presence storage;
- Memory inbox behavior, Archive connector behavior, source inventory behavior,
  import behavior, or public persona chat changes;
- billing, queues/workers, Redis, Cloudflare, social connectors, public writes,
  partner adapters, or hosted runtime changes;
- broad shell work, Discern global CSS, sidebar/topbar rewrites, or unrelated
  page reskins;
- placeholder or unwired controls for Attach, mic, tools, regenerate, copy,
  notes, menus, or similar actions;
- visible readback of tokens, cookies, raw ids, storage paths, SQL details,
  stack traces, compiled prompts, provider payloads, source bodies, or
  secret-shaped values.

## Mandatory No-Drift Tests

DAEDALUS must extend or preserve focused static/component tests proving:

- `sendPersonaChatWithStream` remains the existing send path with bearer token,
  status, completion, and production-safe error handling unchanged;
- return-card actions remain local and owner-triggered:
  `Continue` focuses only, `Summarize` pre-fills only, and `Start fresh` clears
  local chat state only;
- archived conversations remain read-only and recover through `New chat`;
- no route-query or route-selected conversation behavior is introduced;
- no stale `/conversations/candidates/inbox`, `source=all`, Archive connector,
  Memory inbox, prompt/runtime, provider, Cloudflare, Redis, Stripe, queue, or
  worker drift appears in the chat surface;
- no placeholder/unwired action labels or icons appear in `PersonaChat`;
- new chat CSS is limited to `.studio-persona-chat-*` selectors and does not
  alter public chat, the Studio shell, sidebar, topbar, shortcut routes, or
  broad `.card` / `.button` / `.textarea` styling.

## Required Validation

DAEDALUS must run:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/studio/persona-chat.test.ts apps/web/lib/chat-stream.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

ARGUS should code-review the implementation against the accepted file/scope
boundary before routing ARIADNE.

## Required ARIADNE Rehearsal

Because PR485E is visible UI, ARGUS requires ARIADNE hosted rehearsal after
ARGUS accepts the implementation.

ARIADNE should verify hosted web/API health and rehearse
`/studio/personas/[personaId]` on desktop plus `375px` and `390px` mobile
viewports.

Required visible states:

- active existing owner thread with return card;
- empty/new chat state;
- archived read-only state with `New chat` recovery;
- sending/status state if safely triggerable without fake provider behavior;
- provider setup/error state if safely triggerable without exposing secrets;
- existing continuity-candidate archive panel if present in the replay data;
- PR485A companion shortcuts still present and routeable;
- Memory and Memory inbox still separate;
- public persona chat unaffected.

ARIADNE must explicitly check for no horizontal overflow, clipped controls,
overlapping text, unstable button layout, fake placeholder controls, private or
secret-shaped visible readback, route-query drift, public chat drift, Memory
inbox drift, Archive connector drift, or broad shell/sidebar/topbar reskin.

## Preflight Validation Performed

ARGUS reviewed the handoff, current `PersonaChat`, focused static tests,
existing studio CSS patterns, active roadmap docs, and lane index.

Validation run on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Current roughness is localized to owner `PersonaChat`; no API/runtime/route work is required for the accepted polish boundary. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/studio/persona-chat.test.ts apps/web/lib/chat-stream.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts` | Pass | 27 focused tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are already documented as non-failures in the validation baseline.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR485E as one web-only private PersonaChat polish lane with a strict component/CSS boundary.
- Styling may move from inline styles to scoped .studio-persona-chat-* globals, but broad Discern/global shell drift is forbidden.
Task:
- Polish only the existing owner PersonaChat surface on /studio/personas/[personaId].
- Improve header, return card, message rows, existing live assistant actions, sending/error/provider setup/empty/archived states, existing continuity-candidate archive panel, and composer fit without changing behavior.
- Add focused no-drift tests proving send path, local return actions, archived read-only behavior, no route-query drift, no placeholder controls, and scoped CSS only.
Guardrails:
- Touch only apps/web/components/studio/persona-chat.tsx, apps/web/components/studio/persona-chat.test.ts, apps/web/app/globals.css under .studio-persona-chat-* selectors, focused existing no-drift tests if needed, and docs.
- Do not change APIs, migrations, packages/ai, prompts, retrieval, provider/runtime, token accounting, route query behavior, automatic LLM calls, durable summary/presence storage, Memory inbox, Archive connector, public chat, billing, queues/workers, Redis, Cloudflare, social connectors, public writes, hosted runtime, broad Studio shell, Discern global CSS, sidebar/topbar, or unrelated page styling.
- Do not add placeholder/unwired Attach, mic, tools, copy, regenerate, notes, menu, or similar controls.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/studio/persona-chat.test.ts apps/web/lib/chat-stream.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
ARIADNE:
- After ARGUS accepts implementation, route hosted desktop/375px/390px rehearsal for active thread with return card, empty/new chat, archived read-only, safe sending/provider setup/error states if triggerable, shortcuts, Memory inbox separation, public chat no-drift, fit, honesty, and no secret-shaped visible readback.
```
