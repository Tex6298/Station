# PR533 Hosted Studio Rail And Settings Theme Blocker - ARGUS Result

**Owner:** ARGUS / A3 -> DAEDALUS / A2

**Date:** 2026-07-30

**Reviewed handoff:** `99af825c docs: record PR533 hosted UI blockers`

**State:**

```text
CONFIRM_PR533_HOSTED_STUDIO_RAIL_AND_SETTINGS_THEME_BLOCKER
READY_PR533_BOUNDED_UI_REPAIR_FOR_DAEDALUS
```

## Verdict

ARGUS confirms ARIADNE's two bounded hosted presentation blockers. PR533 source
acceptance remains valid for request ownership, interaction behavior, route,
auth, privacy, and scope, but hosted human-eye acceptance remains blocked until
the rail containment and Settings theme defects are repaired and rerun.

This result routes only the smallest source repair to DAEDALUS. It does not
authorize a Settings redesign, global theme rewrite, backend change, hosted
mutation, or a new product lane.

## Bound Evidence Review

- The committed ARIADNE result is documentation-only and contains no credential
  value, raw private payload, hosted identifier, or secret-shaped material.
- The ignored private receipt records exactly two blocker classifications:
  `studio_rail_horizontal_clip_blocks_quick_controls` and
  `settings_dark_theme_keeps_fixed_light_surfaces`.
- The Studio rail measured `180px` of internal horizontal overflow before
  quick-card hover. Bringing the row controls into pointer reach changed
  `scrollLeft` from `0` to `180`, visibly cutting companion, filter, and recent-
  conversation labels off on the left.
- Root document overflow remained `0`; this is an internal rail failure and is
  not disproved by page-level geometry checks.
- Settings Light measured page `rgb(244, 243, 239)` and card
  `rgb(255, 255, 255)`. Dark and System-dark correctly changed the page to
  `rgb(25, 25, 24)` but left the principal card at `rgb(255, 255, 255)`.
- ARGUS inspected the desktop Studio hover capture, desktop Dark Settings
  capture, and `390px` System-dark Settings capture. They visibly match the
  receipt and public result.
- The same receipt retains one conversation request per persona, passing quick-
  card mouse/keyboard/focus/viewport checks, zero owner reads while signed out,
  zero product-data writes, zero provider calls, zero API failures, zero page
  errors, and zero unclassified console or request failures.
- `node --check .station-private/pr533/hosted-rehearsal.mjs` and
  `git diff --check 99af825c^ 99af825c` pass independently.

## Source Diagnosis

### Desktop Studio rail

`.studio-rail-scroll` owns vertical scrolling but can still acquire a horizontal
scroll range. Its companion grid items contain `.studio-companion-quick-wrap`,
which does not currently establish a shrinkable bounded width around long
hosted companion names and the revealed action controls.

DAEDALUS must repair the item sizing/containment so the rail has no horizontal
scroll range with long names. A blanket clipping rule is not sufficient if it
hides either quick trigger or prevents the fixed quick card from remaining
pointer-reachable.

### Settings theme

`apps/web/app/settings/page.tsx` overrides the existing semantic
`.station-page` and `.station-card` theme rules with fixed inline light colors
for panels, cards, headings, muted copy, marks, and pills. The embedded AI
provider and notification-preference controls repeat the same fixed-light
palette.

The shared `--station-page-*` tokens already preserve those exact Light values
and provide accepted Dark values. The repair should consume those tokens in the
bounded Settings surface instead of adding another palette or broad global
attribute override.

## Exact DAEDALUS Repair Contract

Allowed product surface:

- `apps/web/app/globals.css` for the Studio rail containment and narrowly
  scoped Settings support if required;
- `apps/web/app/settings/page.tsx`;
- `apps/web/components/settings/ai-provider-settings-panel.tsx`;
- `apps/web/components/settings/notification-preferences-panel.tsx`;
- focused theme/Studio tests and the PR533 DAEDALUS result.

Additional Settings component edits are allowed only if a rendered fixed-light
surface remains in Dark/System-dark and the result identifies that exact
computed-style failure. Do not restyle intentionally bounded data visualisation
or observability interiors merely to remove every hexadecimal literal.

Required rail acceptance:

1. At desktop width with the hosted long-name shape, `.studio-rail-scroll`
   reports `scrollWidth - clientWidth <= 1` and `scrollLeft <= 1` before hover,
   after hover, after pinning, and after keyboard focus.
2. Companion and recent-conversation labels ellipsize in place rather than
   moving off the left edge.
3. Both quick triggers remain visible and pointer/keyboard reachable.
4. The fixed quick card remains inside the viewport, center-point pointer-
   reachable, and correct for hover, pin, pointer leave, Escape, and focus
   restoration.
5. Mobile rail replacement and companion-settings fallback remain unchanged.

Required Settings acceptance:

1. Light retains the current principal page and card computed colors and keeps
   the accepted control/state treatment without a material visual regression.
2. Dark at `1440x900` and System-dark at `390x844` use the accepted
   `--station-page-*` surface, border, text, muted, accent, success, danger, and
   strong-action tokens; no principal Settings card, panel, input, or button
   remains fixed white.
3. Existing provider selection, key-status/readback, notification preference,
   loading, unavailable, disabled, and danger-zone semantics do not change.
4. Text/control contrast, wrapping, focus visibility, and zero horizontal
   document overflow pass in all three appearances.

Required validation:

- focused Settings theme and rail containment tests that fail on the accepted
  `12a72dc5` source and pass on the repair;
- mocked desktop/mobile System/Light/Dark browser proof with the long-name rail
  shape and computed Settings surfaces;
- `npx --yes pnpm@10.32.1 test:studio-ui`;
- `npx --yes pnpm@10.32.1 test:ai-settings`;
- `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/notification-preferences.test.ts`;
- web lint and typecheck;
- changed-path, sensitive-literal, and `git diff --check` review.

## Frozen Boundaries

- No API, database, migration, RLS, auth/session, cookie, visibility,
  conversation, Integrity, provider-selection behavior, stored-key behavior,
  notification behavior, billing action, publishing action, or route change.
- No Cloudflare, Railway configuration, hosted runtime, Redis, queue/worker,
  provider/model call, partner adapter, dependency, or lockfile change.
- No hosted product-data write or deployment from this repair handoff.
- Do not hide the quick controls, widen the accepted `156px` rail, restore the
  superseded dashboard composition, or claim hosted acceptance from local
  proof.

After DAEDALUS commits the bounded repair, wake ARGUS for hostile source review.
If accepted, ARGUS will return only the affected Studio desktop and Settings
theme cases to ARIADNE.

## Handoff

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS confirms ARIADNE's two PR533 hosted blockers and the rest of the hosted
  functional/auth/privacy proof remains accepted.
- The desktop rail has 180px internal overflow before hover and scrolls left
  when quick controls are reached; Settings leaves fixed-white principal
  surfaces in Dark and System-dark.
Task:
- Implement only the bounded rail sizing/containment and semantic Settings
  token repair defined in the ARGUS result.
- Preserve the 156px rail, quick-card behavior, exact Light presentation,
  provider/notification semantics, routes, auth/privacy, and every backend
  contract.
- Add focused failing-before/passing-after tests, run the required local
  matrix, commit a public-safe result, and WAKEUP A3 for hostile review.
```
