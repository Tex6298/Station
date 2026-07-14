# PR525C - Studio Dashboard And Minimal Rail Composition Result

Owner: MIMIR / A1 after an unconsumed DAEDALUS wakeup

Review owner: ARGUS / A3

Date completed: 2026-07-14

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Result

PR525C translates the measured general Studio composition from ARIADNE's
rendered Discern parity specification into Tex Station's existing routes and
data contracts. The dashboard and general rail now use the accepted warm-light
frame, compact hierarchy, and explicit capability relocation without entering
the exact-persona companion, thread, chat, or Forums slices.

DAEDALUS did not consume the opening wake at `942a4976`. MIMIR completed the
bounded implementation rather than leave the active lane idle. ARGUS remains
the independent reviewer.

## Changed Files

```text
apps/web/app/globals.css
apps/web/components/studio/studio-dashboard.test.ts
apps/web/components/studio/studio-dashboard.tsx
apps/web/components/studio/studio-sidebar.tsx
apps/web/lib/studio-navigation.test.ts
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/roadmap/PR525C_STUDIO_DASHBOARD_MINIMAL_RAIL_COMPOSITION_DAEDALUS.md
docs/roadmap/PR525C_STUDIO_DASHBOARD_MINIMAL_RAIL_COMPOSITION_MIMIR_RESULT.md
.station-agents/state/MIMIR.json
```

No package, lockfile, API, schema, auth implementation, provider, retrieval,
storage, billing, Redis, Cloudflare, deployment, Developer Space interior,
exact-persona companion, chat, or Forums file changed.

## General Studio Rail

- Replaced the previous `292px` dark permanent rail with the measured `156px`
  warm rail at desktop widths of `960px` and above.
- Removed the duplicate Station brand and permanent token/storage meters.
- Kept the permanent hierarchy deliberately small: New Chat, New Persona,
  personas, one `More Studio` disclosure, and Settings fixed at the bottom.
- Kept active-persona treatment, desktop name ellipsis with a full-title
  fallback, mobile/dashboard wrapping, honest no-persona and no-match states,
  and persona filtering inside the named disclosure.
- At `959px` and below, removed the desktop rail and supplied one compact,
  full-width, height-bounded Studio disclosure below global navigation.
- The mobile disclosure uses native links and details/summary semantics,
  preserves current-place and owner/private truth, and remains internally
  scrollable when the destination or persona inventory exceeds the viewport.

## Dashboard Composition

- Replaced the dark inline card palette with PR525B's shared warm canvas,
  panel, soft-surface, border, text, muted, and active tokens.
- Put the private Studio heading, owner-only boundary, Open Companion or
  zero-persona New Persona, New Persona, Choose Path, Open Public Space, and
  Station Assistant before secondary operations.
- Put owned companions and truthful Integrity due, clear, or unavailable state
  in the primary dashboard grid.
- Kept Memory visible immediately after the primary grid.
- Preserved usage, archive/portability, and the complete persona list behind a
  named `More Studio tools` disclosure instead of deleting them.
- Preserved honest loading, signed-out, error, zero-persona, and unavailable
  states without automatic redirects or fabricated counts.

## Capability Relocation

| Capability | Resulting location |
| --- | --- |
| New Chat / New Persona | Permanent rail and compact mobile actions |
| Persona list | Permanent desktop rail; full mobile persona section |
| Persona filter | `More Studio` disclosure |
| Dashboard / Publish | `More Studio` disclosure and mobile action grid |
| Onboarding / Assistant / Global Archive / Notes / Export | `More Studio` and mobile Studio section |
| Blog Posts / Public Space | `More Studio` and mobile Public presence section |
| Settings | Fixed rail bottom; mobile Studio section; accepted account navigation |
| Projects / My Space / Developer Spaces / Billing | Accepted PR525B global account navigation |
| Usage / storage / billing readback | Dashboard secondary tools and authoritative Settings/Billing surfaces |
| Archive and portability | Dashboard secondary tools plus existing Archive/Export routes |

The rendered disclosure inventory exposed nine moved rail destinations. No
destination removed from permanent chrome was deleted or replaced by a fake
control.

## Rendered Proof

Local Next rendered with an owner-safe synthetic session and intercepted API
responses. No real credential, token, cookie, private identifier, or private
content was retained.

| Viewport / state | Rail | Key bounds | Width / errors | Result |
| --- | --- | --- | --- | --- |
| `1440x900`, four personas, Integrity due | `156px`, warm, visible | heading ends `218px`; primary grid ends `437px` | `1440 / 1440`; `0` errors | Pass |
| `390x844`, four personas, Integrity due | desktop rail absent | compact header ends `411px`; primary grid ends `843px` | `390 / 390`; `0` errors | Pass |
| `375x812`, four personas, Integrity due | desktop rail absent | compact header ends `411px`; Integrity and first due row enter viewport | `375 / 375`; `0` errors | Pass |

Additional rendered state checks passed for signed-out redirect, zero persona,
one persona with unavailable Integrity data, multiple personas with due rows,
many-persona filtering, and dashboard error state. The compact mobile and
desktop disclosures exposed every relocated destination; keyboard activation
worked and the permanent rail contained zero token/storage meters.

At `375px`, the second long-name Integrity row continues below the first
viewport instead of being clipped or compressed into illegible text. This is
normal page continuation, not horizontal overflow or capability loss.

## Validation

| Check | Result |
| --- | --- |
| Focused Studio navigation/dashboard tests | Pass, `23/23` |
| `npx --yes pnpm@10.32.1 run test:studio-ui` | Pass, `250/250` |
| `npx --yes pnpm@10.32.1 run test:auth` | Pass, `21/21` |
| `npx --yes pnpm@10.32.1 run test:developer-spaces` | Pass, `61/61` |
| `npx --yes pnpm@10.32.1 run typecheck` | Pass, `2/2` Turbo tasks |
| `npx --yes pnpm@10.32.1 run lint` | Pass, no warnings or errors |
| Desktop / `390px` / `375px` Playwright geometry | Pass |
| Signed-out / zero / one / many / due / unavailable / error state proof | Pass |
| Moved destination inventory and keyboard activation | Pass |
| Browser page errors | `0` |
| Document horizontal overflow | `0` across the matrix |
| `git diff --check` | Pass; line-ending warnings only |

## Scope And Deviations

No PR525A four-line visible deviation is required. Long truthful persona names
wrap and due-state content scrolls naturally on the narrowest viewport; no
control, route, state, or capability is omitted. PR525C intentionally does not
claim exact-persona companion shell, thread disclosure, message/composer, or
Forums parity. Those remain PR525D, PR525E, and PR525F.

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR completed PR525C after DAEDALUS did not consume the implementation
  wakeup.
- Exact 156px warm rail, 960px collapse, warm first-viewport dashboard,
  capability relocation, tests, and desktop/mobile proof pass.
Task:
- Review this result and the bounded patch.
- Verify geometry, route/auth/privacy preservation, capability relocation,
  mobile disclosure, no PR525D/E/F drift, tests, and Developer Space no-drift.
- If accepted, wake MIMIR; otherwise patch narrowly or commit the exact blocker
  and wake MIMIR.
```
