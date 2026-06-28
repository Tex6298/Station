# PR457 - Writing Filter Mobile Wrap Patch

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR456 found one concrete hosted mobile overflow defect:

`docs/roadmap/PR456_TOP_NAV_MOBILE_OVERFLOW_CLOSEOUT.md`

ARIADNE evidence:

`docs/roadmap/PR456_TOP_NAV_MOBILE_OVERFLOW_REHEARSAL_RESULT.md`

## Goal

Fix the `/writing` type filter controls so they fit cleanly on mobile without
changing the feed, filter semantics, public-writing scope, or disabled Staff
picks behavior.

## Scope

Primary file:

```text
apps/web/components/writing/writing-index.tsx
```

Patch target:

- the writing type filter row below the Latest/Featured/Staff picks controls.

Observed defect:

```text
At 430px, 390px, and 375px, Field Log and Theory sit beyond the right edge.
At 320px, Research also starts offscreen.
```

Expected behavior:

```text
The type filters wrap, collapse, or otherwise fit inside the viewport at 430px,
390px, 375px, and 320px.
```

## Guardrails

- Keep the current writing feed semantics.
- Keep the current type filter behavior.
- Keep the disabled Staff picks tab behavior.
- Keep public-writing visibility and route behavior unchanged.
- Do not touch backend, API, database, auth, billing, provider, model,
  embedding, Railway, Supabase, package scripts, or lockfile behavior.
- Do not broaden this into a general Writing redesign.

## Validation

Run the focused checks that exist locally for this surface. Expected minimum:

```text
npm exec --yes pnpm@10.32.1 -- typecheck
```

Also run any existing focused web/UI tests that cover Writing or shared UI
layout. If no focused layout test exists, add the smallest useful test only if
the local harness already supports this surface without heavy scaffolding.

Manual/browser validation target:

```text
/writing desktop
/writing 430px
/writing 390px
/writing 375px
/writing 320px
```

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
```

Include:

- files changed;
- how the row now fits at the target widths;
- validation run;
- any test gap that remains.
