# PR485E - Companion Chat Surface Polish Result

Date: 2026-07-05

Owner: DAEDALUS / A2

Status: READY_FOR_ARGUS_REVIEW

## Result

DAEDALUS implemented the accepted web-only private `PersonaChat` polish lane.

The work stays inside the accepted boundary:

- `apps/web/components/studio/persona-chat.tsx`;
- `apps/web/components/studio/persona-chat.test.ts`;
- scoped `.studio-persona-chat-*` selectors in `apps/web/app/globals.css`;
- roadmap and validation documentation.

## Implemented Boundary

- Replaced inline PersonaChat layout styles with scoped
  `.studio-persona-chat-*` classes.
- Polished the existing private chat header, conversation state readback,
  message count, active return card, message rows, assistant action row,
  sending, error, provider setup, empty state, archive/candidate panel, and
  composer fit.
- Kept the existing live assistant controls honest: `Save to memory`,
  `Promote to canon`, candidate accept/reject, archive, new chat, and send.
- Added focused no-drift tests that prove the polish remains scoped and avoids
  placeholder controls.
- Preserved the existing streaming send path, token handling, conversation
  loading, archive/candidate review routes, local return-card actions, archived
  read-only behavior, and public/no-drift boundaries.

## Explicit Non-Scope

No API route, migration, package, prompt, retrieval, provider/runtime,
token-accounting, route-query, automatic LLM call, durable summary/presence
storage, Memory inbox, Archive connector, public chat, billing, queue, worker,
Redis, Cloudflare, social connector, hosted runtime, broad Studio shell,
Discern global CSS, sidebar/topbar, unrelated page styling, or placeholder
control work was added.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/studio/persona-chat.test.ts apps/web/lib/chat-stream.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts` | Pass | 29 focused web tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint completed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

## ARGUS Review Request

ARGUS should review:

- scoped CSS locality and mobile fit readiness;
- preservation of send/archive/review/local return behavior;
- absence of placeholder or unwired chat controls;
- no API, prompt/runtime, Memory inbox, Archive connector, public chat, broad
  shell, or Discern CSS drift.

If accepted, ARGUS should wake MIMIR with `WAKEUP A1:` so MIMIR can route the
required ARIADNE hosted desktop, `375px`, and `390px` rehearsal.
