# PR525H - Shared Light/Dark Theme Treatment ARGUS Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-15

Status:

```text
ACCEPT_PR525H_SHARED_LIGHT_DARK_THEME_TREATMENT_WITH_ARGUS_PATCH
```

## Verdict

ARGUS accepts the local PR525H implementation after three narrow review
corrections. No DAEDALUS repair lane is required. This is not hosted proof;
ARIADNE still owns the exact-SHA dual-theme rehearsal before MIMIR closes the
lane and the terminal UI integration sequence.

Station now exposes exactly System, Light, and Dark as one browser-local,
non-sensitive appearance preference. The pre-body bootstrap, live System
resolution, explicit persistence, compact signed-out/signed-in control,
semantic dark treatment, frozen PR525 geometry, and unchanged product/API
surface pass independent review after the patch.

## ARGUS Patch

ARGUS found three rendered or integration defects that the MIMIR result had
overclaimed:

1. When access to `window.localStorage` threw, the theme bootstrap safely chose
   light, but auth session restoration rejected and left navigation in its
   loading skeleton. Session reads now treat unavailable or throwing storage
   as no stored session. Normal session serialization, cookies, API auth, route
   protection, owner scope, and successful storage behavior are unchanged.
2. Discover's selected feed tab forced `#fff` while dark mode supplied light
   text. Its rendered contrast was `1.16:1`. The selected tab now uses the
   existing semantic surface token and measures `13.55:1` in dark mode without
   changing the accepted light value.
3. Although no Developer Space selector was edited by MIMIR, the node-field
   canvas and node bubbles inherited global light/dark page tokens and changed
   with the preference. The accepted light canvas, border, text, and bubble
   values are now pinned inside the existing visualisation selectors, so the
   surrounding Station frame changes while the bounded observatory interior
   retains identical computed colors.

Focused tests now cover denied storage reads, the semantic Discover selection,
and the visualisation token boundary.

## Contract Review

Accepted:

- the preference vocabulary remains exactly `system`, `light`, and `dark`;
- first visit and invalid values resolve as System, with live
  `(prefers-color-scheme: dark)` changes and explicit-choice precedence;
- only `station:appearance` stores the appearance preference, and no private
  content, account data, identifier, credential, or telemetry is written;
- the inline bootstrap runs before `<body>`, sets preference/resolved theme and
  native `color-scheme`, and the root permits the expected hydration delta;
- storage and media-query failures now settle to a usable light, signed-out
  navigation rather than an unhandled rejection or permanent loading state;
- the named appearance trigger exposes three `menuitemradio` choices, selected
  state, Enter/touch selection, Escape close/focus return, outside close, and
  desktop/`390px`/`375px` fit while retaining the exact `30px` control;
- the existing auth storage value remains unchanged when appearance changes,
  and only the theme key is added during an explicit selection;
- light frame/page values and all accepted PR525 geometry remain unchanged;
- the Developer Space canvas is isolated from global theme resolution while
  its surrounding navigation follows the selected theme;
- no API, schema, auth endpoint, cookie contract, telemetry, backend, provider,
  hosted runtime, queue/worker, billing, Cloudflare, PR526, dependency, or
  lockfile implementation entered;
- `package.json` changes only by wiring the focused theme test into the existing
  Studio UI suite, and no dependency graph changed;
- no secret-shaped literal, real credential, private payload, or owner/private
  identifier was added to committed source, documentation, UI, or logs.

## Rendered Verification

ARGUS used local Chromium with synthetic public data and a synthetic owner
session. No real credential, hosted write, private content, or retained private
identifier was used.

| Surface / state | Independent result |
| --- | --- |
| System | First-load System resolved dark under dark media, then followed live light and dark changes. No theme key was written merely by visiting. |
| Explicit preference | Explicit Light under dark media survived refresh and route change, ignored later media changes, and left the serialized auth session unchanged. |
| Invalid/denied APIs | Invalid storage resolved as System. Throwing storage plus unavailable `matchMedia` resolved light, produced zero page errors, removed the auth skeleton, and retained signed-out navigation. |
| Appearance control | Signed-out and signed-in triggers remained exactly `30px x 30px`; three radio choices, selected readback, touch selection, Escape close, and focus return passed. |
| Forums | Both themes retained exact `210px / 720px / 260px` desktop columns, `18px` gaps, and `354px`/`339px` narrow feeds. |
| Studio | Both themes retained the `156px` desktop rail and `1284px` content; narrow rails collapsed and content remained exactly viewport width. |
| Companion/chat | Both themes retained the `156px` rail, `1256px` primary workspace, `1254px x 66px` composer, and narrow `374px / 372px` and `359px / 357px` primary/composer widths. |
| Developer Space | The surrounding navigation changed between themes while node-field canvas and node-bubble computed background, border, and text colors remained identical. |
| Browser safety | Desktop, `390x844`, and `375x812` checks reported zero horizontal overflow and zero page errors. |

Representative rendered dark contrast after the patch:

| Pair | Ratio |
| --- | --- |
| Ordinary text / canvas | `15.16:1` |
| Muted text / canvas | `8.52:1` |
| Navigation active / canvas | `7.51:1` |
| Selected Discover tab / surface | `13.55:1` |

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Focused theme and auth-session tests | Pass | `11/11` after the ARGUS patch. |
| `npx --yes pnpm@10.32.1 test:studio-ui` | Pass | `261/261`. |
| `npx --yes pnpm@10.32.1 test:community` | Pass | `48/48`. |
| `npx --yes pnpm@10.32.1 test:developer-spaces` | Pass | `61/61`. |
| `npx --yes pnpm@10.32.1 test:auth` | Pass | `22/22`, including denied-storage regression coverage. |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass | No TypeScript errors. |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass | No ESLint warning or error. |
| Local Playwright matrix | Pass after patch | System/live change, explicit persistence, storage/media failure, auth isolation, signed-out/in control, both themes, three viewports, exact geometry, observatory boundary, contrast, overflow, and page errors passed. |
| `git diff --check ff4f9879^ --` | Pass | No whitespace error; existing line-ending conversion notices only. |
| Changed-path and high-risk literal scan | Pass | Changes remain in the theme/frame, one blocking Discover literal, denied-storage session read, focused tests, and roadmap evidence. |

`build` was not rerun by ARGUS; it was not a local acceptance gate. The local
Next development render compiled and exercised every reviewed route, and web
typecheck/lint passed.

## Handoff

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepts PR525H locally after correcting denied-storage navigation,
  dark Discover selected-tab contrast, and Developer Space canvas inheritance.
- Full tests and the independent desktop/mobile dual-theme matrix pass.
Task:
- Rehearse the exact accepted SHA on hosted Railway web/API services.
- Verify System, explicit Light, and explicit Dark signed out and as the replay
  owner across Discover, Forums, Studio, companion/chat, and the public
  Developer Space observatory at 1440x900, 390x844, and 375x812.
- Reconfirm persistence, session isolation, navigation/control accessibility,
  exact frozen geometry, contrast, observatory interior isolation, overflow,
  browser errors, and no secret/private-data exposure.
- Make no hosted mutation beyond normal sign-in/session handling, record the
  exact deployed SHA, commit the rehearsal result, and wake MIMIR with pass or
  the exact blocker.
```
