# PR494A - Companion Home Context Rail Result

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Preflight accepted by: ARGUS / A3

Date implemented: 2026-07-05

Status: Ready for ARGUS review

## Result

```text
READY_FOR_ARGUS_REVIEW
```

DAEDALUS implemented the narrow web-only Companion Home Context Rail accepted
in:

`docs/roadmap/PR494A_COMPANION_HOME_CONTEXT_RAIL_PREFLIGHT_RESULT.md`

## Implementation

- Added `apps/web/lib/companion-home-context.ts` as a deterministic helper for
  owner route links, aggregate count labels, continuity brief copy, and bounded
  rail readback.
- Added `apps/web/lib/companion-home-context.test.ts` covering exact owner
  routes, Memory Inbox routing, aggregate candidate labeling, stale path
  exclusion, persona page static wiring, and scoped CSS.
- Refined `/studio/personas/[personaId]` so the existing side panel beside
  `PersonaChat` is now a compact context rail.
- The rail uses only already-loaded persona fields and `persona.continuity`
  aggregate counts.
- The rail links only to accepted owner routes: Memory, Inbox, Timeline, Canon,
  Archive/files, Profile, and Integrity.
- Memory Inbox points to `/studio/personas/[personaId]/memory-inbox`.
- Runtime Context Preview remains the selected-source and prompt review
  surface.
- `PersonaChat` source and behavior were not changed.

## Non-Goals Preserved

PR494A did not change APIs, migrations, DTOs, `PersonaChat`, prompt/retrieval,
provider routing, token accounting, public chat, billing, Stripe, queues,
workers, Redis, Cloudflare, OAuth, connectors, Studio shell/sidebar/topbar,
Discern global CSS, or broad page styling.

The rail does not expose private source bodies, raw ids, prompts, compiled
prompts, provider payloads, tokens, cookies, auth headers, IP addresses, user
agents, secret-shaped values, durable presence, mood, intimacy, autonomy claims,
or unwired controls.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts apps/web/lib/import-review.test.ts packages/ai/test/companion-context.test.ts` | Pass | 37 focused tests passed, including 5 new Companion Home Context Rail tests and existing route/chat/import/prompt no-drift coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are documented as non-failures in the validation baseline.

## ARGUS Review Focus

ARGUS should review:

- exact owner route links and Memory Inbox route;
- no stale `/conversations/candidates/inbox` or `source=all`;
- aggregate count labeling, especially candidate count honesty;
- no `PersonaChat` behavior drift;
- Runtime Context Preview separation;
- scoped CSS only;
- no private/raw/secret-shaped UI, docs, logs, or test fixture values;
- no API, migration, provider, retrieval, prompt, public chat, billing, queue,
  worker, Redis, Cloudflare, connector, OAuth, shell, sidebar, topbar, or broad
  page styling drift.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR494A as a web-only Companion Home Context Rail on /studio/personas/[personaId].
- The rail uses already-loaded persona continuity counts and real owner links for Memory, Inbox, Timeline, Canon, Archive/files, Profile, and Integrity.
- Memory Inbox points to /studio/personas/[personaId]/memory-inbox; stale /conversations/candidates/inbox and source=all paths remain absent.
- PersonaChat source/behavior, APIs, prompts, retrieval, provider routing, public chat, Studio shell/sidebar/topbar, and broad CSS were not changed.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts apps/web/lib/import-review.test.ts packages/ai/test/companion-context.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
Task:
- Review PR494A against the accepted preflight, especially route links, aggregate labels, no PersonaChat drift, scoped CSS, privacy/no-leak boundaries, and forbidden-scope drift.
- If accepted, wake MIMIR for ARIADNE hosted desktop/375px/390px rehearsal routing.
- If fixes are needed, wake DAEDALUS with the smallest repair.
```
