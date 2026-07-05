# PR494A - Companion Home Context Rail Preflight Result

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Accepted for DAEDALUS implementation

## Verdict

```text
ACCEPT_PR494A_COMPANION_HOME_CONTEXT_RAIL
```

ARGUS accepts a narrow web-only Companion Home Context Rail slice. This is not a
Discern shell port, not another PR485 shortcut/chat-polish pass, and not an API
or prompt/runtime lane.

## Decision

PR485A-E already translated the companion shortcuts, Memory inbox,
return-to-thread card, private prompt capability/presence context, and local
private chat polish. PR494A should not reopen those.

The remaining useful Discern reference is a chat-adjacent owner context rail:
a compact side rail on the existing persona home route that helps the owner see
which private context surfaces are available while talking.

The safe implementation is to refine the existing persona home side panel on:

```text
/studio/personas/[personaId]
```

using only already-loaded owner persona readback:

- persona continuity summary counts;
- existing persona route id already used by the owner page;
- existing route helpers for Memory, Inbox, Timeline, Profile, Integrity, Canon,
  and Archive/files;
- existing long description / awakening prompt / style notes already displayed
  on the owner page, if DAEDALUS keeps a brief section.

No new API read is required for PR494A.

## Required Product Boundary

DAEDALUS should add a compact Companion Context Rail that:

- stays beside the existing `PersonaChat` surface;
- preserves current `PersonaChat` send, archive, save-memory, promote-canon,
  candidate-review, provider setup/error, streaming status, return-card, and
  archived read-only behavior;
- presents owner-only context stops as real links to accepted Tex routes:
  Memory, Inbox, Timeline, Canon, Archive/files, Profile, and Integrity;
- highlights Memory Inbox as the candidate-review stop via
  `/studio/personas/[personaId]/memory-inbox`;
- uses `persona.continuity` aggregate counts only:
  `memoryCount`, `canonCount`, `archiveFileCount`, `archivedChatCount`,
  `continuityCandidateCount`, `continuityRecordCount`, and
  `integritySessionCount`;
- labels candidate counts honestly as aggregate candidate readback unless the
  implementation uses an already accepted import-backed path with focused tests;
- keeps the existing Runtime Context Preview as the place for selected source
  readback and compiled prompt review;
- uses links, labels, and read-only counts, not unwired controls.

If DAEDALUS adds helper code, prefer a small deterministic helper such as:

```text
apps/web/lib/companion-home-context.ts
apps/web/lib/companion-home-context.test.ts
```

The helper should derive display rows from safe typed inputs and exact owner
routes. It should not fetch, mutate, inspect browser storage, or parse route
query state.

## Required UI Boundary

The rail may include:

- a continuity brief section derived from currently loaded owner persona fields;
- a context map with counts and route links;
- Memory Inbox CTA using the accepted route;
- short copy explaining that Memory, Canon, Archive, Timeline, and Integrity
  remain owner-only context surfaces;
- optional provider/capability/readiness copy only if it is derived from already
  loaded safe fields and does not duplicate or contradict the existing chat
  header/provider setup error path.

The rail must not:

- claim to expose selected runtime source bodies;
- show compiled prompts;
- show provider config, token/quota internals, private raw ids, source bodies,
  storage paths, prompts, provider payloads, cookies, auth headers, IP
  addresses, user agents, or secret-shaped values;
- add actions unless they are plain links to existing owner routes;
- add More/options, copy, regenerate, Save to notes, attach, mic, tools,
  publish, or any other unwired control.

## Allowed Files

Implementation should stay in this file set unless DAEDALUS finds a directly
necessary neighboring static test:

- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/lib/companion-home-context.ts`
- `apps/web/lib/companion-home-context.test.ts`
- `apps/web/lib/studio-navigation.ts`, only for small route-helper reuse
- `apps/web/lib/studio-navigation.test.ts`
- `apps/web/components/studio/persona-chat.test.ts`, only to prove no drift
- `apps/web/lib/import-review.test.ts`, only to prove Memory Inbox no-drift
- `apps/web/app/globals.css`, only for scoped
  `.studio-companion-context-*` or similarly narrow rail classes
- roadmap and validation docs

`apps/web/components/studio/persona-chat.tsx` should not change for PR494A. If
DAEDALUS finds the rail cannot be implemented without changing chat behavior,
wake ARGUS/MIMIR with the concrete blocker instead of broadening the lane.

## Forbidden Scope

PR494A must not:

- import Discern global CSS;
- copy `StudioRightPanel` verbatim;
- replace the Studio sidebar, topbar, shell, or global layout;
- add `useSearchParams`, query-selected conversations, or `?c=` behavior;
- add or use stale `/conversations/candidates/inbox`;
- add `source=all` candidate behavior;
- add API routes, migrations, DTO changes, provider routing, retrieval,
  prompt-context changes, token accounting changes, queues, workers, Redis,
  Cloudflare, Stripe, billing, OAuth, connectors, public chat changes, or public
  persona behavior changes;
- change `PersonaChat` send/archive/save-memory/promote-canon/candidate-review,
  streaming, return-card, archived read-only, or provider setup/error behavior;
- add durable presence, mood, intimacy, autonomy, emotional-state, or capability
  storage/claims;
- expose private Memory, Canon, Archive source body, raw id, provider payload,
  token, cookie/header, IP/user-agent, prompt, compiled prompt, or
  secret-shaped values.

## Required Tests

DAEDALUS must add or update focused tests proving:

- the rail helper renders exact owner route links for Memory, Inbox, Timeline,
  Canon, Archive/files, Profile, and Integrity;
- Memory Inbox points to `/studio/personas/[personaId]/memory-inbox`;
- no stale `/conversations/candidates/inbox` or `source=all` path appears;
- count labels are derived from aggregate continuity counts and do not imply
  pending-only truth unless the data actually proves pending status;
- the persona page renders the rail beside the existing private chat without
  changing `PersonaChat` behavior;
- existing PR485A-E behavior remains intact: shortcuts, Memory inbox path,
  return-card local actions, private prompt context only, scoped chat polish,
  and no placeholder controls;
- CSS selectors added for the rail are scoped and do not style global Studio
  shell, top nav, sidebar, public pages, public persona chat, or unrelated
  components;
- no private/raw/secret-shaped strings, provider payloads, prompts, source
  bodies, cookies, headers, IP/user-agent, raw ids, tokens, or hidden autonomy
  claims appear in rail copy or tests.

## Required Validation

DAEDALUS must run:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts apps/web/lib/import-review.test.ts packages/ai/test/companion-context.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If DAEDALUS touches any API route, `PersonaChat` source, prompt/retrieval code,
or non-scoped shell CSS, stop and wake ARGUS/MIMIR with the concrete reason
instead of continuing inside PR494A.

## Required ARGUS Review Focus

ARGUS should review the implementation for:

- duplicate PR485A-E work;
- real owner route links only;
- no `source=all`, stale inbox, query-conversation, or Discern shell drift;
- no `PersonaChat` behavior drift;
- no private/raw/secret-shaped UI, docs, logs, or test fixture values;
- scoped CSS only;
- no API, migration, provider, retrieval, prompt, public chat, billing, queue,
  worker, Redis, Cloudflare, connector, OAuth, or runtime expansion.

## Required ARIADNE Hosted Proof

After ARGUS accepts implementation, MIMIR should route ARIADNE hosted rehearsal
because PR494A changes the owner persona home UI.

ARIADNE should verify desktop plus `375px` and `390px` mobile:

- hosted web/API freshness at the accepted implementation commit or later;
- owner persona home still loads;
- companion context rail is visible, readable, and does not overlap chat;
- route links target accepted owner routes;
- Memory and Inbox remain separate;
- return-card, private chat send path, archive/candidate panel, and provider
  setup/error copy have no drift;
- Runtime Context Preview remains the only selected-source/prompt preview;
- no private source body, raw id, provider payload, token, cookie, header,
  IP/user-agent, prompt, compiled prompt, secret-shaped value, hidden autonomy
  claim, placeholder control, public chat change, or broad shell/topbar/sidebar
  drift appears.

## Preflight Validation Performed

ARGUS reviewed PR494 handoff, PR493A closeout, PR485A-E closeouts, Discern
reference commits `de7b918e` and `99ae8a5c`, current persona home composition,
`PersonaChat`, Studio navigation helpers, Memory Inbox/import-review helpers,
and private companion prompt-context tests.

Validation run on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Existing loaded persona continuity counts and owner routes are enough for a narrow rail; no API or chat behavior change is needed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts apps/web/lib/import-review.test.ts packages/ai/test/companion-context.test.ts` | Pass | 32 focused tests passed across route helpers, chat no-drift, import-backed Memory Inbox, and private companion prompt context. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are documented as non-failures in the validation baseline.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR494A as a narrow web-only Companion Home Context Rail slice.
- Implement a compact owner-only rail on /studio/personas/[personaId] using already-loaded persona continuity counts and existing owner route links.
- Keep PersonaChat behavior, PR485A-E surfaces, Runtime Context Preview, Memory Inbox import-backed scope, and Studio shell/sidebar/topbar intact.
Task:
- Add the rail/helper/static tests within the accepted file boundary.
- Use real owner links for Memory, Inbox, Timeline, Canon, Archive/files, Profile, and Integrity; highlight /memory-inbox without source=all or stale /conversations/candidates/inbox behavior.
Guardrails:
- Do not change APIs, migrations, PersonaChat behavior, prompt/retrieval/provider/token routing, public chat, billing, queues, workers, Redis, Cloudflare, Stripe, OAuth, connectors, Studio shell/sidebar/topbar, Discern global CSS, or broad page styling.
- Do not expose private source bodies, raw ids, prompts, compiled prompts, provider payloads, tokens, cookies, auth headers, IP addresses, user agents, secret-shaped values, durable presence/mood/intimacy/autonomy claims, or unwired controls.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts apps/web/lib/import-review.test.ts packages/ai/test/companion-context.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
ARIADNE:
- After ARGUS accepts implementation, MIMIR should route hosted desktop/375px/390px rehearsal for owner persona home rail fit, link targets, Memory/Inbox separation, chat no-drift, Runtime Context Preview separation, privacy/no-leak, and no shell/topbar/sidebar/broad CSS drift.
```
