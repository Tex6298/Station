# PR485A - Companion Home Shortcuts Preflight Result

Owner: ARGUS / A3

Date: 2026-07-05

Status: Accepted - wake DAEDALUS

Validation result:

```text
ACCEPT_PR485A_COMPANION_HOME_SHORTCUTS
```

## Verdict

ARGUS accepts the smallest safe first Discern companion UX translation slice as
a web-only companion home shortcut strip on the existing owner persona home/chat
surface.

This is the right first slice because it carries the useful Discern companion
home direction into Tex without touching provider routing, streaming chat,
prompt construction, retrieval, token accounting, migrations, hosted runtime,
archive connectors, billing, queues, workers, Cloudflare, or public surfaces.

## Exact PR485A Scope

DAEDALUS should add a compact owner-visible shortcut strip on
`/studio/personas/[personaId]` linking to existing Tex routes:

- Memory: `/studio/personas/${personaId}/memory`
- Timeline: `/studio/personas/${personaId}/continuity`
- Profile: `/studio/personas/${personaId}/edit`
- Integrity: `/studio/personas/${personaId}/calibration`

The strip may sit near the existing private chat heading or companion home area.
It should use current Tex persona workspace data and existing routes. It should
not add a new fetch unless DAEDALUS can show a specific need that stays inside
this web-only boundary.

Acceptable touched files or local equivalents:

- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/components/studio/persona-workspace.tsx`, if a shared local
  component is cleaner than a page-local component
- `apps/web/lib/studio-navigation.ts`, if shortcut descriptors belong with the
  existing route helpers
- `apps/web/lib/studio-navigation.test.ts`, or an equivalent focused web test,
  asserting the four labels and route targets
- `apps/web/app/globals.css`, only for small scoped `.studio-*` classes if
  existing classes are insufficient
- roadmap/testing docs for the implementation result

No API changes are allowed for PR485A.

## Required Guardrails

Preserve:

- `sendPersonaChatWithStream` behavior and active/archived chat handling;
- private provider setup/error notices;
- token accounting and provider routing;
- retrieval, runtime context, answer-contract, and prompt privacy boundaries;
- existing persona workspace panels, including public interaction readback,
  voice/avatar readiness, encounter readiness, runtime context preview, archive
  export status, and published continuity history;
- owner-only route/auth boundaries for all shortcut targets.

Do not add or modify:

- `apps/api/src/routes/conversations.ts`;
- `packages/ai`, prompt helpers, retrieval context builders, provider code, or
  compiled prompt readback;
- migrations, env/config, hosted runtime, workers, queues, Redis, Cloudflare,
  billing, archive connector behavior, social connector behavior, public
  writes, or partner adapters;
- Discern global CSS, global shell changes, Studio topbar/sidebar/right-panel
  reskins, public page reskins, or broad theme changes;
- Memory inbox, return-to-thread state changes, conversation archive summary
  generation, or companion presence prompt context.

The visible copy should stay concise and owner-oriented. It must not expose raw
source ids, owner ids, candidate/source bodies, prompt text, provider payloads,
tokens, cookies, SQL/table details, stack traces, hosted logs, or
secret-shaped values.

## ARGUS Answers

1. Smallest real product improvement: companion home shortcuts.
2. First slice must be web-only. Memory inbox is a later lane because it needs
   route/UI hardening, redaction decisions, and tests beyond shortcut routing.
3. Tex already has owner-scoped candidate list/review mechanics, but the
   committed list route is `/conversations/persona/:personaId/candidates`, not
   the Discern-style `/conversations/candidates/inbox`. Its default source is
   import-backed rows, while `source=all` broadens to archived-chat candidates.
   A full inbox should therefore be its own PR485B-style lane.
4. Timeline maps to existing Continuity for PR485A.
5. Profile maps to the existing owner edit route for PR485A.
6. Companion presence prompt context should wait until visible companion home
   routing and candidate-inbox boundaries are accepted.
7. PR485A explicitly rejects Discern global CSS, broad Studio shell churn,
   memory-inbox route import, prompt/presence injection, chat layout rewrite,
   topbar/sidebar/right-panel replacement, API changes, and any broad reskin.
8. DAEDALUS must validate focused route helpers/static tests, typecheck, lint,
   and whitespace.
9. ARIADNE hosted desktop/mobile rehearsal is required after ARGUS accepts the
   DAEDALUS implementation because PR485A changes an owner-visible persona home
   surface.

## ARGUS Validation

Passed locally on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code and reference inspection | Pass | Compared the PR485 handoff, current Tex persona home/chat routes, candidate list/review routes, and Discern reference stats/snippets. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/studio-navigation.test.ts apps/web/lib/archive-trust.test.ts` | Pass | 24 route/readback tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors after the ARGUS preflight docs. |

DAEDALUS implementation validation must include:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/studio-navigation.test.ts apps/web/lib/archive-trust.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If DAEDALUS creates a new shortcut helper, the focused test should assert:

- `Memory` -> `/studio/personas/persona-1/memory`
- `Timeline` -> `/studio/personas/persona-1/continuity`
- `Profile` -> `/studio/personas/persona-1/edit`
- `Integrity` -> `/studio/personas/persona-1/calibration`

## ARIADNE Rehearsal After Implementation

After ARGUS accepts DAEDALUS' implementation, MIMIR should route ARIADNE for a
hosted desktop and mobile rehearsal of `/studio/personas/[personaId]`.

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
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR485A Companion Home Shortcuts as the first Discern companion UX translation slice.
Verdict:
- ACCEPT_PR485A_COMPANION_HOME_SHORTCUTS
Task:
- Add a compact owner-visible shortcut strip on the existing persona home/chat surface linking to Memory, Continuity-as-Timeline, Edit-as-Profile, and Integrity using existing routes/styles.
Guardrails:
- Web-only; no API, AI package, prompt, retrieval, migration, provider, config, hosted runtime, archive connector, billing, queue, worker, Cloudflare, Redis, social connector, public-write, or broad global-shell change.
- Preserve Tex streaming chat, provider setup/error behavior, token accounting, retrieval/runtime privacy, existing persona workspace panels, and scoped Tex visual language.
- Do not import Discern global CSS, reskin unrelated pages, implement Memory inbox, alter return-to-thread behavior, or inject companion presence prompt context in PR485A.
Validation:
- Focused route/readback tests, typecheck, lint, and git diff whitespace checks as listed in the ARGUS preflight.
```
