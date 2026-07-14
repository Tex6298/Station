# PR525B - Shared Warm-Light Frame And 46px Global Navigation

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date opened: 2026-07-14

Status:

```text
CLOSE_PR525B_SHARED_WARM_LIGHT_FRAME_GLOBAL_NAVIGATION_ACCEPTED
```

Implementation result:

`docs/roadmap/PR525B_SHARED_WARM_LIGHT_FRAME_GLOBAL_NAVIGATION_MIMIR_RESULT.md`

Review and closeout:

- `docs/roadmap/PR525B_SHARED_WARM_LIGHT_FRAME_GLOBAL_NAVIGATION_ARGUS_RESULT.md`
- `docs/roadmap/PR525B_SHARED_WARM_LIGHT_FRAME_GLOBAL_NAVIGATION_CLOSEOUT_MIMIR.md`

## Locked Source

ARIADNE completed the rendered comparison against final Discern commit
`de7b918e` and locked the measurable target here:

`docs/roadmap/PR525A_DISCERN_RENDERED_VISUAL_PARITY_SPECIFICATION_RESULT.md`

PR525B is the first implementation dependency in that result. It establishes
the shared light-frame tokens and `46px` global navigation geometry that PR525C
through PR525F consume. Commit `99ae8a5c` is lineage only; do not restore its
removed Studio topbar or right panel.

## Allowed Files

```text
apps/web/app/globals.css
apps/web/app/layout.tsx
apps/web/components/nav/top-nav.tsx
apps/web/lib/studio-navigation.ts              only for a pure route-group helper
apps/web/lib/studio-navigation.test.ts         focused route-preservation tests
apps/web/components/nav/top-nav.test.ts        only if a focused nav contract test is useful
```

No other production file is in scope without a concrete blocker committed for
MIMIR. Do not alter package metadata or lockfiles.

## Required Patch

### Shared frame

- Define reusable warm-light frame tokens for the measured target:
  - canvas/nav: `#f6f4ee`;
  - Studio rail: `#f3f1ea`;
  - panel: `#ffffff`;
  - soft assistant surface: `#f0eee9`;
  - structural border: `#d7d2c8`;
  - primary text: `#1a1a18`;
  - muted text: `#6b6b67`;
  - active blue: `#1f5fa8`.
- Apply the new frame tokens to global navigation in this slice. Later PR525
  slices consume the Studio/chat/forum tokens. Do not use the token declaration
  itself as permission to recolor unrelated product surfaces now.
- Preserve Developer Space observatory interior tokens and its existing dark
  visual mode.

### Navigation geometry and treatment

- Make `.top-nav` and `.top-nav-loading` exactly `46px` high at desktop,
  `390px`, and `375px`; keep the loading shell geometrically stable.
- Replace every navigation-dependent `52px` viewport offset in
  `apps/web/app/globals.css` with the shared `46px` height contract. Do not
  change unrelated `52px` sizes such as typography or decorative grids.
- Use `16px` horizontal padding, `13px` links, the warm canvas, a `1px`
  warm-neutral lower border, and no blur/heavy shadow.
- Replace filled active navigation pills with blue text and a `1px` inset
  underline. Preserve visible keyboard focus and expose the current route with
  `aria-current="page"`.
- Keep the Station brand visually compact and avoid duplicate Station labels.

### Route and account placement

- Keep Discover, Writing, and Forums as the public primary destinations.
- When signed in, keep the current private section legible in the primary bar
  without rendering every private destination as a permanent top-level link.
- Keep Studio, Projects, My Space, Developer Spaces, Billing, Settings, and
  Sign out reachable through a named keyboard-safe work/account disclosure.
- Keep Sign in and Sign up visible when signed out.
- At `390px` and `375px`, render a compact brand/current-section/account or auth
  frame. Put remaining destinations in a named accessible navigation menu; do
  not retain the current horizontally scrolling route strip as the only way to
  reach them.
- Menus must close on selection, outside interaction, and Escape, restore
  sensible focus, and communicate expanded state. Native links remain native
  links.

## Preserved Contracts

- Do not change route URLs, login redirect behavior, session restoration,
  sign-out behavior, auth boundaries, API calls, visibility, or backend data.
- Do not remove a destination merely to match Discern's smaller rendered link
  count.
- Do not import Discern global CSS, broad-reskin unrelated pages, or add
  Discern-only product assumptions.
- Do not touch Studio rail, companion shell, chat bubbles, Forums composition,
  provider behavior, Memory, Continuity, Archive, Canon, Integrity, billing,
  retrieval, Redis, Cloudflare, database, or deployment behavior in PR525B.

## Acceptance Gates

- Computed navigation and loading-shell height is `46px` in signed-out,
  signed-in public, and active Studio states at desktop, `390px`, and `375px`.
- No document-level horizontal overflow, clipped account/auth control, or
  layout jump while auth restores.
- Every current destination is keyboard reachable, correctly named, and has a
  correct active state; menu focus and Escape behavior work.
- The public/private route boundary and login redirect behavior are unchanged.
- Reduced-motion and focus-visible behavior remain intact.
- Developer Space observatory interiors remain visually unchanged.
- Focused navigation tests pass.
- `pnpm test:studio-ui`, `pnpm typecheck`, and `pnpm lint` pass.
- `git diff --check` passes with no package or lockfile drift.

## Result And Handoff

Commit the implementation plus a PR525B result document containing:

- changed-file inventory;
- route-reachability inventory for signed-out, signed-in desktop, and mobile;
- exact validation commands and results;
- any permitted visible deviation with its concrete accessibility, privacy,
  security, data-truth, or technical reason.

Then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR525B shared warm-light frame and 46px global navigation.
Task:
- Review exact geometry, route/auth preservation, menu accessibility, viewport
  offsets, Developer Space no-drift, tests, and forbidden-scope boundaries.
- If accepted, wake MIMIR with the verdict; ARIADNE rendered comparison follows
  the implementation review.
```

Do not return to wait without committing either the implementation result or a
concrete blocker and explicit `WAKEUP A1:` handoff.
