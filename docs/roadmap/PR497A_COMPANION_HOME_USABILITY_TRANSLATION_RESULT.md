# PR497A - Companion Home Usability Translation Result

Owner: DAEDALUS / A2

Date: 2026-07-06

Status: Ready for ARGUS review

## Result

DAEDALUS implemented the narrow web-only companion-home translation.

The private persona home now leads with:

- the existing persona identity/header;
- private companion chat;
- immediate Memory, Inbox, Timeline, Profile, and Integrity shortcuts;
- compact aggregate continuity context beside the chat.

The former admin/readback stack now follows the companion workspace:

- continuity summary cards;
- public interaction readback;
- voice/avatar readiness;
- encounter readiness and contract panels;
- Runtime Context Preview;
- archive export status;
- published continuity history.

## User-Visible Changes

- Persona home copy now frames the first work surface as `Companion Home` and
  `Talk with {persona}`.
- The shortcut strip uses warmer action details while preserving the same owner
  route targets.
- The context rail now reads as companion continuity context:
  `What {persona} carries forward`, with aggregate owner-only counts.
- Return-to-thread controls now use the requested companion labels:
  `Pick up where you left off`, `Ask for recap`, and `Start fresh`.
- Empty/loading/composer copy now reads like a private companion workspace
  without claiming new provider, runtime, automation, attachment, or tool
  capability.

## Discern Translation

The useful Discern product-feel correction was translated as hierarchy and
language, not as a shell import:

- first viewport now prioritizes chat, continuity actions, and context before
  diagnostics;
- existing Station route helpers and Studio components remain the source of
  truth;
- existing private chat streaming, archive, Memory, Canon, provider setup,
  owner-only route, and visibility behavior remain unchanged.

## Files Touched

- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/components/studio/persona-chat.tsx`
- `apps/web/lib/companion-home-context.ts`
- `apps/web/lib/studio-navigation.ts`
- `apps/web/app/globals.css`
- `apps/web/lib/companion-home-context.test.ts`
- `apps/web/lib/studio-navigation.test.ts`
- `apps/web/components/studio/persona-chat.test.ts`
- `docs/roadmap/PR497A_COMPANION_HOME_USABILITY_TRANSLATION_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/LANE_INDEX.md`

## Boundaries Kept

- No API, database, schema, RLS, migration, auth, quota, storage, billing,
  Stripe, provider/model, prompt/runtime, Redis, Cloudflare, worker, queue, or
  deployment changes.
- No global Discern CSS import.
- No broad Studio shell, topbar, sidebar, or right-panel replacement.
- No public persona chat behavior changes.
- No visibility, Memory, Canon, Archive, Continuity, Integrity, provider setup,
  or route semantics changed.
- No placeholder attach/mic/tool/automation/browse/edit/durable presence claims
  added.
- No stale Discern endpoints, `source=all`, or query-selected conversation
  behavior added.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts` | Pass | 23 focused tests passed, including page order, owner route targets, local return actions, scoped CSS, and no drift guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API replayed from cache; web typecheck executed and passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |
| Diff-only scope scan | Pass | Changed implementation files are limited to the expected web persona-home/chat/helper/test/CSS files plus roadmap/testing docs. |

## Handoff

ARGUS should review directly.

Review focus:

- first-viewport hierarchy claim;
- no hidden runtime/API/provider/schema drift;
- route and privacy boundaries;
- mobile fit risk around the longer return action label;
- whether the companion language remains truthful about existing capabilities.

Wakeup:

```text
WAKEUP A3:
Codename: ARGUS
```
