# PR525H - Shared Light/Dark Theme Treatment

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date opened: 2026-07-14

Status:

```text
OPEN_PR525H_SHARED_LIGHT_DARK_THEME_TREATMENT
```

## Why This Runs Now

PR525G accepted the complete hosted light composition. PR525H is the final
implementation, review, and hosted-rehearsal lane before the UI integration
closeout and mainline pause.

The implementation must add a coherent dark treatment to the accepted
product. It must not reopen the composition, import Discern CSS, or turn into
a route-by-route redesign.

Locked evidence:

- `docs/roadmap/PR525G_HOSTED_LIGHT_PARITY_REHEARSAL_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR525B_SHARED_WARM_LIGHT_FRAME_GLOBAL_NAVIGATION_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR525C_STUDIO_DASHBOARD_MINIMAL_RAIL_COMPOSITION_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR525D_FULL_HEIGHT_COMPANION_SHELL_THREAD_DISCLOSURE_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR525E_COMPACT_CHAT_VISUAL_SYSTEM_HONEST_STATES_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR525F_FORUMS_THREE_COLUMN_HONEST_COMPOSITION_CLOSEOUT_MIMIR.md`

## Product Contract

Implement one shared appearance preference with exactly these choices:

```text
System
Light
Dark
```

- First visit defaults to `System`.
- `System` follows `prefers-color-scheme` and reacts when the operating-system
  choice changes.
- An explicit Light or Dark choice overrides the system choice and persists
  locally under one non-sensitive Station-specific key.
- The resolved theme is applied to `<html>` before first paint. Refresh and
  route transitions must not flash the wrong theme or cause a hydration
  warning.
- Missing, invalid, denied, or unavailable local storage and media-query APIs
  must fail safely to the system/light result rather than breaking navigation.
- The control is available signed out and signed in. Use one compact,
  accessible top-navigation appearance disclosure with a named trigger and
  three mutually exclusive choices. It must work by keyboard and touch,
  expose the selected choice, close with Escape/outside click, return focus,
  and fit the accepted desktop/`390px`/`375px` navigation.
- Theme is a browser appearance preference, not account data. Add no API,
  schema, auth, cookie, telemetry, or private-content persistence.

## Palette Contract

Keep light mode visually unchanged. Treat its existing PR525G measurements and
computed colors as regression fixtures.

Build dark mode from semantic variables rather than page-specific inverse
rules:

- reconcile `--station-frame-*` and `--station-page-*` into a complete shared
  light/dark token contract;
- add any missing semantic tokens needed by PR525B-F, including focus,
  selected, hover, disabled, success, warning/error, user message, assistant
  message, input, overlay, and shadow treatment;
- replace hard-coded light colors inside the global frame, Discover/public
  frame, Studio dashboard/rail, companion shell/chat, and Forums index where
  they prevent the dark contract from resolving;
- retain the restrained warm-neutral Station character in both modes. Dark
  mode must not become a one-note navy/slate or purple dashboard;
- preserve readable contrast, native control color scheme, visible focus,
  selected-route truth, error/success distinction, and disabled-state truth;
- do not use gradients, decorative glow/orbs, or a second visual system.

The public Developer Space observatory's intentional dark visualisation
interior remains a bounded product surface in both themes. Its surrounding
global frame may follow the selected theme, but do not recolor the node field,
world map, constellation canvas, or research visualisation merely to prove a
global selector.

## Composition Freeze

The following are invariant in both themes:

- `46px` global navigation;
- `156px` Studio/companion desktop rail and current `960px` collapse;
- companion primary workspace, thread disclosure, compact chat header,
  bounded log, `66px` composer, and current message sizing;
- Forums `210px / 720px / 260px` desktop columns, `18px` gaps, card targets,
  feed-first mobile order, and `354px`/`339px` narrow feeds;
- route inventory, capability placement, copy, data truth, focus order,
  loading/error/empty behavior, auth/session behavior, and API contracts.

Do not change JSX hierarchy or page geometry unless the appearance control
itself requires the smallest top-navigation integration. Do not broad-reskin
unrelated pages, import Discern global CSS, add dependencies, or touch PR526
guided-task proposals.

## Expected File Boundary

Primary ownership:

- `apps/web/app/layout.tsx`
- `apps/web/components/nav/top-nav.tsx`
- one small theme control component if separation improves clarity
- one pure theme preference helper and focused tests
- `apps/web/app/globals.css`
- focused navigation/theme/source-contract tests

Page/component files may be touched only to replace a blocking literal with a
semantic token. Record every expansion beyond this boundary in the result.
No package or lockfile change is expected.

## Required Local Proof

1. Unit/source proof for valid/invalid preference normalization, system
   resolution, persistence key, initial bootstrap, selected-control state, and
   the explicit no-API/no-cookie boundary.
2. Browser proof in System-light, explicit Light, explicit Dark, System-dark,
   refresh, and live system-change cases.
3. Signed-out and signed-in proof on Discover, Forums, Studio, companion/chat,
   and a Developer Space observatory at `1440x900`, `390x844`, and `375x812`.
4. Measure the locked PR525 geometry in both themes. Check scroll width,
   clipping, overlays, long labels/content, all honest states available
   locally, keyboard/touch operation, Escape/focus return, and browser errors.
5. Prove explicit preference survives refresh and route changes without
   affecting auth persistence. Prove System continues to follow a changed
   media preference.
6. Inspect screenshots and computed colors in both themes. State contrast
   evidence for ordinary/muted text, controls, focus, selected routes,
   messages, success, error, and disabled content.
7. Run focused tests, the existing Studio/community/Developer Space/auth UI
   suites, web typecheck, lint, `git diff --check`, scope scan, and secret scan.

Use the repository's existing pinned pnpm execution path. Do not claim hosted
proof in the implementation result.

## Result And Handoff

Create:

```text
docs/roadmap/PR525H_SHARED_LIGHT_DARK_THEME_TREATMENT_DAEDALUS_RESULT.md
```

Commit the implementation and result, then wake ARGUS with an exact hostile
review request. ARGUS must independently inspect storage/bootstrap behavior,
contrast, both themes, all frozen geometry, and the observatory boundary. If
accepted, ARGUS wakes ARIADNE for the hosted dual-theme rehearsal under this
same PR525H lane. ARIADNE then wakes MIMIR for final UI integration closeout.

If blocked, commit the exact blocker and wake MIMIR. Do not return to wait with
an unreported implementation or an unowned baton.
