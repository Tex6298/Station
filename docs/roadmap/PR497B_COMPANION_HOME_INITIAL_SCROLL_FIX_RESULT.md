# PR497B - Companion Home Initial Scroll Fix Result

Owner: DAEDALUS / A2

Date: 2026-07-06

Status: Ready for ARGUS review

## Result

DAEDALUS implemented the narrow scroll containment fix.

`PersonaChat` no longer uses a bottom marker with `scrollIntoView`. Instead it
keeps a ref on `.studio-persona-chat-thread` and scrolls that element directly
to its own `scrollHeight` when messages update.

## Scroll Behavior Changed

Before:

- message changes called `bottomRef.current?.scrollIntoView({ behavior:
  "smooth" })`;
- initial active-thread load could move the document viewport down to the lower
  chat/composer area.

After:

- message changes call `thread.scrollTo({ top: thread.scrollHeight, behavior })`
  on the chat thread container only;
- initial active-thread load can still place the in-thread scroll at the latest
  message, but it should not move the page away from the companion-first
  persona home viewport.

## First-Viewport Expectation

The PR497A first-viewport hierarchy is preserved by containment:

- persona identity/header;
- `Companion Home` heading;
- shortcut strip;
- return card/private chat surface;
- compact context rail.

ARGUS/ARIADNE should verify hosted browser behavior, but the page-level
`scrollIntoView` cause has been removed.

## Files Touched

- `apps/web/components/studio/persona-chat.tsx`
- `apps/web/components/studio/persona-chat.test.ts`
- `docs/roadmap/PR497B_COMPANION_HOME_INITIAL_SCROLL_FIX_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/LANE_INDEX.md`

## Boundaries Kept

- No API, database, schema, RLS, migration, auth, quota, storage, billing,
  Stripe, provider/model, prompt/runtime, Redis, Cloudflare, worker, queue,
  deployment, or package metadata changes.
- No CSS changes were required.
- No public persona chat behavior changed.
- No return-card action bodies changed:
  - `Pick up where you left off` still focuses the composer only;
  - `Ask for recap` still pre-fills the composer only;
  - `Start fresh` still clears local conversation state only.
- No Memory, Canon, Archive, Continuity, Integrity, visibility, provider setup,
  or route semantics changed.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/studio/persona-chat.test.ts` | Pass | 7 focused PersonaChat tests passed, including the new no-`scrollIntoView` containment guard. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts` | Pass | 24 companion stack tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API replayed from cache; web typecheck executed and passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |
| Diff-only scope scan | Pass | Changed implementation files are limited to `PersonaChat` and its focused test, plus roadmap/testing docs. |

## Handoff

ARGUS should review directly.

Review focus:

- confirm page-level `scrollIntoView` is gone;
- confirm auto-scroll remains contained to `.studio-persona-chat-thread`;
- confirm send/stream, archive, provider setup, and return-card local actions
  did not regress;
- confirm no hidden backend/runtime/provider/scope drift entered the patch.

Wakeup:

```text
WAKEUP A3:
Codename: ARGUS
```
