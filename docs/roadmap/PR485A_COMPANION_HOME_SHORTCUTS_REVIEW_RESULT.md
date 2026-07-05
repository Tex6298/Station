# PR485A - Companion Home Shortcuts Review Result

Owner: ARGUS / A3

Date: 2026-07-05

Status: Accepted - wake MIMIR

Validation result:

```text
ACCEPT_PR485A_COMPANION_HOME_SHORTCUTS_IMPLEMENTATION
```

## Verdict

ARGUS accepts DAEDALUS' PR485A implementation without a review patch.

The implementation matches the accepted web-only slice:

- `studioPersonaCompanionShortcuts(personaId)` returns exactly the accepted
  owner routes for Memory, Timeline, Profile, and Integrity;
- `/studio/personas/[personaId]` renders a compact `Companion workspace
  shortcuts` strip above private chat;
- the strip uses ordinary `next/link` links and adds no fetch;
- CSS is scoped to `.studio-companion-*` and stacks on the existing mobile
  Studio breakpoint;
- `PersonaChat`, provider setup/error behavior, token accounting, runtime
  context preview, and existing persona panels are untouched;
- no API, AI package, prompt, retrieval, migration, provider, hosted runtime,
  archive connector, billing, queue, worker, Cloudflare, Redis, social
  connector, public-write, broad shell, Discern CSS, Memory inbox,
  return-to-thread, or companion presence prompt-context behavior changed.

## Review Notes

Route targets are correct:

- Memory -> `/studio/personas/[personaId]/memory`
- Timeline -> `/studio/personas/[personaId]/continuity`
- Profile -> `/studio/personas/[personaId]/edit`
- Integrity -> `/studio/personas/[personaId]/calibration`

The visible surface is owner-only because it is rendered inside the existing
owner persona workspace and links only to existing owner persona routes.

The static test coverage is narrow but appropriate for this slice: it asserts
the four route targets and guards the persona page against the explicitly
forbidden candidate-inbox, return-to-thread, and archive-connector drift.

Residual risk is visual only. Because this changes the hosted owner persona
home surface, MIMIR should route ARIADNE for desktop and `375px`/`390px` mobile
rehearsal before closeout.

## ARGUS Validation

Passed locally on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Reviewed changed web helper, persona page, scoped CSS, static tests, docs, and wakeup commit. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/studio-navigation.test.ts apps/web/lib/archive-trust.test.ts` | Pass | 26 route/readback tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API cached; web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint completed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warning only. |

Build was not rerun for PR485A. The existing local Windows Next standalone
symlink `EPERM` caveat remains the build truth if build is rerun.

## ARIADNE Rehearsal Required

MIMIR should route ARIADNE for hosted rehearsal of
`/studio/personas/[personaId]`.

ARIADNE should verify:

- the shortcut strip is visible, readable, and fitted on desktop, `375px`, and
  `390px` mobile;
- all four links route to the existing owner persona workspace targets;
- private chat still streams and still shows provider setup/error behavior;
- existing persona panels still render and no global shell/reskin drift appears;
- no private ids, source bodies, prompt/provider payloads, tokens, cookies,
  stack traces, logs, or secret-shaped values render.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR485A Companion Home Shortcuts implementation without a review patch.
Verdict:
- ACCEPT_PR485A_COMPANION_HOME_SHORTCUTS_IMPLEMENTATION
Task:
- Close or route PR485A according to the visible-surface process. ARGUS recommends ARIADNE hosted desktop and 375px/390px mobile rehearsal of /studio/personas/[personaId] before final closeout.
Guardrails:
- Keep PR485A scoped to the accepted shortcut strip. Memory inbox, return-to-thread behavior, companion presence prompt context, prompt/retrieval/provider changes, API changes, hosted runtime, archive connector behavior, billing, queues/workers, Cloudflare/Redis, social connectors, public writes, broad shell work, and Discern CSS remain out of scope.
Validation:
- ARGUS replayed focused route/readback tests, typecheck, lint, and git diff whitespace checks; all passed.
```
