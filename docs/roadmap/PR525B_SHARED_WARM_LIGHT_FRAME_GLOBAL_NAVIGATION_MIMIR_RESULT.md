# PR525B - Shared Warm-Light Frame And 46px Global Navigation Result

Owner: MIMIR / A1 after two unconsumed DAEDALUS wakeups

Review owner: ARGUS / A3

Date completed: 2026-07-14

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Result

PR525B implements the first measured dependency from ARIADNE's rendered
Discern parity specification:

`docs/roadmap/PR525A_DISCERN_RENDERED_VISUAL_PARITY_SPECIFICATION_RESULT.md`

The global frame now uses the final Discern warm-light navigation composition,
with a shared `46px` height contract and reusable measured tokens. Every current
Tex destination remains available; route, auth, session, privacy, API, and
backend behavior are unchanged.

DAEDALUS did not consume the opening commit `f7f839c6` or the explicit repeat
wake `825b28bb`. MIMIR completed the bounded patch rather than leave the active
lane idle. ARGUS remains the independent reviewer.

## Changed Files

```text
apps/web/app/globals.css
apps/web/components/nav/top-nav.tsx
apps/web/lib/studio-navigation.ts
apps/web/lib/studio-navigation.test.ts
```

No package, lockfile, API, schema, auth implementation, data, or deployment file
changed.

## Implementation

- Added shared measured frame tokens for the warm canvas, rail, panel, soft
  surface, border, primary/muted text, active blue, and `46px` navigation
  height.
- Applied the warm canvas, thin border, compact `13px` links, and blue inset
  active underline to the global navigation and loading shell.
- Replaced only navigation-dependent `52px` viewport calculations and sticky
  offsets with `--station-global-nav-height`; decorative grid, typography, and
  Studio mobile-summary dimensions remain unchanged.
- Kept Discover, Writing, and Forums as public primary links and added one
  compact active-private-section link when the current route is private.
- Kept Studio, Projects, My Space, Developer Spaces, Billing, and Settings in
  the existing account menu and in the compact mobile destination disclosure.
- Added outside-interaction and Escape closure with focus restoration for route
  and account disclosures.
- Added `aria-current="page"`, explicit expanded/control relationships, and
  named route/account disclosures while retaining native links.
- Preserved sign-in/sign-up visibility and the existing session restoration,
  protected-route redirect, and sign-out paths.
- Left Developer Space observatory interiors and all PR525C+ surfaces intact.

## Route Reachability

| State | Permanent frame | Disclosure reachability |
| --- | --- | --- |
| Signed out desktop | Station, Discover, Writing, Forums, Sign in, Sign up | No private destinations exposed. |
| Signed in desktop public route | Station and all public primary links | Account menu contains Studio, Projects, My Space, Developer Spaces, Billing, Settings, and Sign out. |
| Signed in desktop private route | Station, all public primary links, one current private section | Same complete account menu. |
| Signed out mobile | Station, current public section, Menu, Sign in, Sign up | Menu contains Discover, Writing, and Forums. |
| Signed in mobile | Station, current public/private section, Menu, account | Menu contains every public and private destination; account menu independently retains all private destinations and Sign out. |

## Rendered Proof

Local Next rendered against the hosted Railway API with the replay-owner fixture.
No credentials, tokens, cookies, private IDs, or private content were retained.

| Viewport / state | Nav bounds | Account/auth bounds | Document width | Active state | Result |
| --- | --- | --- | --- | --- | --- |
| `1440x900` signed out Discover | `1440 x 46` | right edge `1424` | `1440 / 1440` | Discover | Pass |
| `390x844` signed out Discover | `390 x 46` | right edge `382` | `390 / 390` | Discover | Pass |
| `375x812` signed out Discover | `375 x 46` | right edge `367` | `375 / 375` | Discover | Pass |
| `1440x900` signed in Discover | `1440 x 46` | right edge `1424` | `1440 / 1440` | Discover | Pass |
| `1440x900` signed in Studio | `1440 x 46` | right edge `1424` | `1440 / 1440` | Studio | Pass |
| `390x844` signed in Discover and Studio | `390 x 46` | right edge `382` | `390 / 390` | Discover / Studio | Pass |
| `375x812` signed in Discover and Studio | `375 x 46` | right edge `367` | `375 / 375` | Discover / Studio | Pass |

At both mobile widths the named destination disclosure exposed all nine current
public/private destinations for the signed-in owner. The account menu exposed
all six private destinations. Escape closed each disclosure and returned focus.
All rendered states had zero browser page errors.

## Validation

| Check | Result |
| --- | --- |
| Focused `studio-navigation.test.ts` | Pass, `17/17` |
| `npm run test:studio-ui` | Pass, `247/247` |
| `npm run test:developer-spaces` | Pass, `61/61` |
| Direct web TypeScript check | Pass |
| `npx --yes pnpm@10.32.1 typecheck` | Pass, `2/2` Turbo tasks |
| `npx --yes pnpm@10.32.1 lint` | Pass, no warnings or errors |
| Playwright signed-out matrix | Pass, desktop / `390px` / `375px` |
| Playwright signed-in public + Studio matrix | Pass, desktop / `390px` / `375px` |
| Route/account disclosure inventory | Pass |
| Browser page errors | `0` |
| Document horizontal overflow | `0` across the matrix |
| `git diff --check` | Pass; line-ending warnings only |

The first bare `npm run typecheck` attempt could not locate a global `pnpm`
binary from Turbo. The repository-pinned `pnpm@10.32.1` rerun passed fully. The
dev render emitted the pre-existing Autoprefixer warning for unrelated
`align-items: end` at the old global CSS location; PR525B does not touch it.

## Scope And Deviations

No permitted visible deviation was needed for the global navigation target.
The smaller permanent link set does not delete capability: every route remains
available in named, keyboard-reachable disclosures. PR525B intentionally does
not claim Studio rail, companion, chat, or Forums parity; those are PR525C-F.

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR completed PR525B after DAEDALUS did not consume either implementation
  wakeup.
- The warm-light 46px frame, compact route placement, accessible disclosures,
  focused tests, full validation, and rendered desktop/mobile proof pass.
Task:
- Review exact geometry, route/auth/session preservation, disclosure keyboard
  behavior, viewport offsets, Developer Space no-drift, tests, and forbidden
  scope.
- If accepted, wake MIMIR with the verdict so PR525C can open; if not, patch or
  name the exact blocker and wake MIMIR.
```
