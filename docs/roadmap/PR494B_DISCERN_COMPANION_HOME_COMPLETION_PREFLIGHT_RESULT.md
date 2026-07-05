# PR494B - Discern Companion Home Completion Preflight Result

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Close PR494; no remaining safe companion-home delta

## Verdict

```text
CLOSE_PR494_NO_REMAINING_COMPANION_DELTA
```

ARGUS does not accept another DAEDALUS implementation lane for PR494B. After
PR485A-E and PR494A, the remaining Discern reference material is duplicate,
unsafe, or visual/shell skin rather than a concrete missing Tex Station product
behavior.

## Decision

The safe Discern companion-home translation is complete enough to close.

Already covered:

- companion shortcut strip;
- Memory / continuity candidate inbox;
- return-to-thread readback;
- private companion capability/presence prompt context;
- private chat surface polish inside Tex Station's design language;
- owner-only Companion Home Context Rail beside `PersonaChat`;
- Runtime Context Preview separation;
- hosted desktop, `375px`, and `390px` proof for the visible companion-home
  changes.

ARGUS could not name one concrete user-visible behavior that remains both:

- distinct from PR485A-E / PR494A; and
- safe inside the current owner persona home boundaries.

The Discern leftovers are not suitable for a PR494B implementation because they
mainly imply broad CSS/shell work, copied right-panel structure, stale candidate
inbox assumptions, query-selected conversations, placeholder controls, or
presence/autonomy claims.

## Rejected Remaining Material

Do not open a DAEDALUS lane for:

- Discern `globals.css` or broad page reskin;
- Studio sidebar/topbar/shell replacement;
- copied `StudioRightPanel`;
- stale `/conversations/candidates/inbox`;
- `source=all` candidate behavior;
- route-selected conversations or `?c=` behavior;
- automatic summaries;
- durable presence, mood, intimacy, hidden autonomy, or relationship-state
  claims;
- attach, mic, tools, copy, regenerate, notes, menu, publish, or other unwired
  placeholder controls;
- API routes, migrations, prompt/retrieval/provider routing, queues, workers,
  Redis, Cloudflare, Stripe, billing, connectors, OAuth, or public chat changes;
- private Memory, Canon, Archive source bodies, raw ids, provider payloads,
  tokens, cookies/headers, IP/user-agent values, prompts, compiled prompts, or
  secret-shaped readback.

If a future lane wants any of those areas, it should be opened as a new named
product problem with its own evidence and guardrails, not as leftover Discern
translation.

## Validation

ARGUS reran the focused no-drift validation on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Current Tex Station already covers the safe Discern companion-home deltas through PR485A-E and PR494A; remaining material is duplicate, unsafe, or skin. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts apps/web/lib/import-review.test.ts packages/ai/test/companion-context.test.ts` | Pass | 37 focused tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warning only for `.station-agents/state/ARGUS.json`; no whitespace errors. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are documented as non-failures in the validation baseline.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS closes PR494B as CLOSE_PR494_NO_REMAINING_COMPANION_DELTA.
- PR485A-E plus PR494A already cover the safe Discern companion-home translation: shortcuts, Memory Inbox, return-to-thread, private prompt context, chat polish, and owner context rail.
- The remaining Discern material is duplicate, unsafe, or skin: broad CSS/shell/right-panel work, stale candidate inbox/source=all assumptions, query-selected conversations, placeholder controls, autonomy/presence claims, or API/prompt/runtime/infra drift.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts apps/web/lib/import-review.test.ts packages/ai/test/companion-context.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
Task:
- Close the Discern companion-home translation lane and choose the next distinct customer-facing product lane.
```
