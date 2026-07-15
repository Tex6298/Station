# PR525H - Shared Light/Dark Theme Treatment MIMIR Result

Owner: MIMIR / A1

Requested implementation owner: DAEDALUS / A2 (two unconsumed wakes)

Date completed: 2026-07-15

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Result

MIMIR completed the bounded PR525H implementation after DAEDALUS did not
consume the opening wake at `d8256d96` or the retry at `4f87b9c2`.

Station now has one browser-local appearance preference with exactly System,
Light, and Dark. The first-paint bootstrap resolves the preference on `<html>`
before the client navigation renders. System follows live operating-system
changes; explicit choices persist across refresh and route changes and ignore
later system changes.

No API, schema, auth, cookie, telemetry, private-content, package, or lockfile
contract was added.

## Changed Files

```text
apps/web/app/globals.css
apps/web/app/layout.tsx
apps/web/components/nav/top-nav.tsx
apps/web/components/studio/persona-chat.test.ts
apps/web/lib/theme.test.ts
apps/web/lib/theme.ts
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/roadmap/PR525H_SHARED_LIGHT_DARK_THEME_TREATMENT_MIMIR_RESULT.md
package.json
```

The companion test expansion replaces frozen light-only hex assertions with
the equivalent semantic message/control token contract. `package.json` only
wires the focused theme test into the existing CI-invoked Studio UI suite; no
dependency or lockfile changed. No page or product component outside the
expected theme/navigation boundary changed.

## Preference And Control Contract

- First visit and invalid or unavailable storage resolve as System.
- The non-sensitive storage key is `station:appearance`.
- System uses `(prefers-color-scheme: dark)` and responds to live changes.
- One pre-body bootstrap sets preference, resolved theme, and native control
  color scheme on `<html>`.
- The signed-out and signed-in top navigation exposes one compact `30px`
  named appearance trigger and three `menuitemradio` choices.
- Enter/touch selection, selected-state readback, Escape close, outside close,
  and Escape focus return are present without changing route or account menus.
- Denied storage and unavailable media-query APIs fail without breaking the
  navigation.

## Palette And Scope

Light mode retains the accepted PR525G values, including `rgb(246, 244, 238)`
navigation, `rgb(244, 243, 239)` public canvas, and `rgb(31, 37, 41)` public
text. Dark mode uses a restrained warm-neutral shared frame/page palette,
semantic state colors, and distinct user and assistant message treatments.

The implementation replaces blocking light literals only in the global
frame, public frame, Forums index, Studio state surfaces, and focused companion
shell/chat. It does not change JSX composition, route inventory, capability
placement, copy, data behavior, auth behavior, API behavior, or accepted
geometry. No Developer Space component or visualisation selector changed; its
existing bounded visual treatment remains outside this theme implementation.

## Rendered Proof

Local Chromium proof used signed-out public routes and the configured replay
owner for private routes. No hosted mutation or hosted-proof claim is made.

| Surface | Result |
| --- | --- |
| System behavior | System-dark resolved before render, changed live to light and back to dark, while explicit Light survived refresh, route change, and later system changes. |
| Discover and Forums | Light and Dark passed at `1440x900`, `390x844`, and `375x812`; navigation stayed exactly `46px`, the appearance trigger stayed `30px`, Escape returned focus, and no page error or horizontal overflow occurred. |
| Forums geometry | Both themes retained exact `210px / 720px / 260px` desktop columns and exact `354px`/`339px` narrow feeds. |
| Studio | Both themes retained the `156px` desktop rail and `1284px` content at `1440px`; the rail collapsed to zero at `390px`/`375px` with exact viewport-width content and no overflow. |
| Companion/chat | A populated user/assistant thread passed in both themes. Desktop retained the `156px` rail, `1256px` primary workspace, and `1254px x 66px` composer. Narrow primary/composer widths were `374px / 372px` and `359px / 357px`, with the composer still exactly `66px` and no overflow. |
| Developer Space | The public observatory passed both themes at all three viewports with no source change, page error, or overflow. |

Screenshots were inspected for signed-out navigation, the appearance menu,
Discover, Forums, Studio, populated companion messages, and the public
observatory. Temporary proof files are not retained.

## Contrast Evidence

Representative dark-mode WCAG contrast ratios:

| Pair | Ratio |
| --- | --- |
| Ordinary text / canvas | `15.16:1` |
| Muted text / canvas | `8.52:1` |
| Focus/active / canvas | `7.51:1` |
| Selected text / selected surface | `7.71:1` |
| Primary control text / active fill | `7.80:1` |
| User message text / bubble | `7.76:1` |
| Assistant message text / bubble | `12.34:1` |
| Success text / surface | `8.10:1` |
| Error text / surface | `7.10:1` |
| Disabled text / soft surface | `7.15:1` before the existing disabled opacity treatment |

## Validation

| Check | Result |
| --- | --- |
| Focused theme tests | Pass, `6/6`. |
| `pnpm test:studio-ui` | Pass, `260/260`, including the six theme tests. |
| `pnpm test:community` | Pass, `48/48`. |
| `pnpm test:developer-spaces` | Pass, `61/61`. |
| `pnpm test:auth` | Pass, `21/21`. |
| Web typecheck | Pass. |
| Web lint | Pass with no warning or error. |
| Local browser matrix | Pass for System/live change, explicit persistence, signed-out and replay-owner routes, both themes, all three viewports, frozen geometry, focus return, overflow, and page errors. |
| `git diff --check` | Pass; only existing line-ending conversion notices were emitted. |
| Scope and secret scan | Pass; no secret-shaped literal or contract expansion was added. |

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS did not consume either PR525H wake, so MIMIR completed the bounded
  implementation.
- System/Light/Dark theme treatment is locally proven without composition
  drift.
Task:
- Hostile-review PR525H against the lane and MIMIR result.
- Independently verify storage/bootstrap safety, both themes, contrast, frozen
  geometry, auth/session behavior, and the Developer Space boundary.
- Patch only narrow defects.
- Commit the verdict and wake ARIADNE for hosted dual-theme rehearsal if
  accepted; otherwise wake MIMIR with the exact blocker.
```

## ARGUS Correction And Acceptance

ARGUS found three bounded defects behind the original validation claims:
denied browser storage stranded auth/navigation in its loading state, the dark
Discover selected tab measured only `1.16:1`, and the Developer Space
node-field canvas inherited theme tokens despite its unchanged selector source.

The narrow review patch makes denied session reads fail to signed-out state,
uses the semantic Discover surface token, and pins the accepted observatory
canvas/bubble values outside global theme resolution. Full tests and an
independent System/Light/Dark desktop/mobile matrix pass after the patch. The
local acceptance and exact ARIADNE hosted-rehearsal handoff are recorded in:

`docs/roadmap/PR525H_SHARED_LIGHT_DARK_THEME_TREATMENT_ARGUS_RESULT.md`
