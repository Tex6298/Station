# PR533 Hosted Studio Rail And Settings Theme Repair - DAEDALUS Result

**Owner:** DAEDALUS / A2 -> ARGUS / A3

**Date:** 2026-07-30

**Base:** `85cae074 docs: route PR533 hosted UI blockers`

**State:**

```text
READY_PR533_HOSTED_STUDIO_RAIL_AND_SETTINGS_THEME_REPAIR_FOR_ARGUS
```

## Verdict

DAEDALUS implemented only the two presentation repairs confirmed by ARGUS. The
desktop Studio rail is now shrink-bounded inside the accepted `156px` width,
and Settings principal surfaces consume the existing semantic Station page
tokens instead of a fixed local Light palette.

Local source, interaction, geometry, computed-style, and human-eye proof pass.
This result is ready for ARGUS hostile source review. It does not claim hosted
acceptance; ARIADNE still owns the affected hosted rerun after source review.

## Desktop Rail Repair

- `.studio-rail-scroll` now has a shrinkable width and explicit horizontal
  containment while retaining vertical scrolling.
- Persona, recent-conversation section, and recent-conversation list widths are
  bounded to the rail content box.
- `.studio-companion-quick-wrap` is explicitly shrinkable and bounded, so long
  companion names ellipsize when both quick triggers appear.
- Secondary recent-conversation labels now ellipsize instead of widening the
  rail.
- The quick triggers remain in flow and visible; the quick card remains fixed,
  viewport-clamped, and pointer-reachable. The rail was not widened and no
  control was hidden to satisfy the overflow gate.

## Settings Theme Repair

- Settings page cards, side panels, headings, muted copy, marks, pills, profile
  readback, companion cards, and danger copy now use existing
  `--station-page-*` tokens.
- AI provider mode cards, copy panel, provider rows, status pills, key inputs,
  save action, and success/error copy use the same semantic tokens.
- Notification preference copy, row, checkbox accent, success/error states,
  unavailable rows, and pills use the same semantic tokens.
- A Settings-scoped focus rule gives links, buttons, and inputs the accepted
  accent outline without changing control behavior.
- Intentionally bounded usage, storage, and observability visualisation
  interiors were not restyled.

Provider selection, masked key readback, key save/clear behavior, notification
loading/saving/reconciliation, disabled controls, routes, auth, privacy, and API
contracts are unchanged.

## Failing-Before / Passing-After Proof

The focused source command was run after adding the assertions but before the
product repair:

```text
npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/theme.test.ts apps/web/lib/studio-workspace.test.ts
```

Accepted-source result: `13/15` passed and exactly two tests failed. The rail
test found no `min-width: 0` or horizontal containment in
`.studio-rail-scroll`; the Settings test found no semantic page-token use in
the fixed-palette source.

Repaired-source result: `15/15` passed, including both new regressions.

## Mocked Browser Proof

An ignored private Playwright harness used synthetic owner/session data and a
long-name fixture. It made no hosted request, product-data write, provider call,
or mutation.

| Proof | Result |
| --- | --- |
| Rail before hover | Pass; internal overflow `0`, `scrollLeft` `0` |
| Rail after hover | Pass; internal overflow `0`, `scrollLeft` `0` |
| Rail after pin | Pass; internal overflow `0`, `scrollLeft` `0` |
| Rail after Escape | Pass; internal overflow `0`, `scrollLeft` `0` |
| Rail after keyboard pin | Pass; internal overflow `0`, `scrollLeft` `0` |
| Quick controls/card | Pass; two visible triggers remain inside the `156px` rail; fixed card remains inside the viewport and center-point pointer-reachable |
| Mobile Studio | Pass at `390x844`; desktop rail/card stay absent and direct companion-settings fallback remains reachable |
| Request fanout | Pass; one conversation request per unique persona per shell load (`2` each across desktop and mobile loads) |
| Settings Light desktop | Pass; page `rgb(244, 243, 239)`, principal surface `rgb(255, 255, 255)` |
| Settings Dark desktop | Pass; page `rgb(25, 25, 24)`, principal surface `rgb(36, 35, 32)` |
| Settings System-dark mobile | Pass at `390x844`; page `rgb(25, 25, 24)`, principal surface `rgb(36, 35, 32)` |
| Settings inputs/actions/focus | Pass; inputs and preference row follow surface tokens, selected mode and strong action follow semantic tokens, focused input has a `2px` accent outline |
| Document overflow / human-eye | Pass; overflow `0` in all cases and Light, Dark, System-dark mobile, long-name desktop, and mobile captures are coherent |

Private scripts and captures remain ignored under `.station-private/pr533/` and
are not part of this commit.

## Validation

| Command / review | Result |
| --- | --- |
| Focused before-proof | Expected fail, `13/15`; only the two new blocker regressions failed |
| Focused after-proof | Pass, `15/15` |
| `npx --yes pnpm@10.32.1 test:studio-ui` | Pass, `277/277` |
| `npx --yes pnpm@10.32.1 test:ai-settings` | Pass, `14/14` |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/notification-preferences.test.ts` | Pass, `5/5` |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass; zero warnings/errors |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| Mocked browser matrix | Pass; exact geometry and computed-style results above |
| Changed-path and dependency review | Pass; four allowed product files, two focused tests, roadmap/validation receipts; no package or lockfile change |
| Added-line high-risk secret scan | Pass; no secret-shaped value or provider key material |
| `git diff --check` | Pass; line-ending notices only |

The existing Autoprefixer mixed-support warning for `end` remains unchanged and
outside this bounded repair.

## Frozen Boundaries

No API, database, migration, RLS, auth/session, cookie, visibility,
conversation, Integrity, provider-selection, stored-key, notification, billing,
publishing, deployment, dependency, or lockfile behavior changed. No hosted
data or runtime was touched.

## Baton

ARGUS should hostile-review the exact changed paths, rail sizing/containment,
quick-control and quick-card preservation, Settings semantic token use, Light
retention, Dark/System-dark behavior, provider/notification semantics, focused
tests, browser receipt, and frozen boundaries.

If accepted, ARGUS should wake ARIADNE only for the affected hosted desktop
Studio rail and Settings Light/Dark/System-dark rerun.
