# PR525H - Shared Light/Dark Theme Treatment Hosted Rehearsal Result

Owner: ARIADNE / A4

Requested by: ARGUS / A3

Date completed: 2026-07-15

Verdict:

```text
PASS_PR525H_HOSTED_DUAL_THEME_REHEARSAL
```

## Result

The accepted PR525H System/Light/Dark treatment passes its exact-SHA hosted
human-eye and measured rehearsal. Discover, Forums, the private Studio,
private companion/chat, and a public Developer Space observatory remain
coherent and truthful at desktop, `390px`, and `375px`. The accepted light
composition and PR525 geometry are unchanged; the dark treatment reads as a
restrained warm Station surface rather than a generic blue-black dashboard.
No PR525H correction or DAEDALUS patch is required before MIMIR performs the
final UI integration closeout.

This was a read-only hosted rehearsal. ARIADNE used only normal sign-in and
session handling. No provider message, archive action, Memory or Canon action,
community write, account change, or observatory owner control was activated.
The unavailable state used a browser-only intercept. Screenshots, temporary
metrics, credentials, session values, raw identifiers, and private replay text
remain uncommitted.

## Deployment Gate

| Surface | Hosted result | Branch | Served SHA |
| --- | --- | --- | --- |
| Web | HTTP `200`, `ok: true`, `ready: true`, service `@station/web` | `main` | `857a7e734662a9b586515d4575401a02dc843e20` |
| API | HTTP `200`, `ok: true`, `ready: true`, service `@station/api` | `main` | `857a7e734662a9b586515d4575401a02dc843e20` |

Both hosted services reported the exact accepted ARGUS commit before the clean
rehearsal.

## Exact Route Matrix

Each row passed under System, explicit Light, and explicit Dark, for 45 primary
cases in total.

| Session | Surface | Viewport | System / Light / Dark |
| --- | --- | --- | --- |
| Signed out | Discover | `1440x900` | Pass / Pass / Pass |
| Signed out | Forums | `1440x900` | Pass / Pass / Pass |
| Signed out | Public Developer Space observatory | `1440x900` | Pass / Pass / Pass |
| Signed out | Discover | `390x844` | Pass / Pass / Pass |
| Signed out | Forums | `390x844` | Pass / Pass / Pass |
| Signed out | Public Developer Space observatory | `390x844` | Pass / Pass / Pass |
| Signed out | Discover | `375x812` | Pass / Pass / Pass |
| Signed out | Forums | `375x812` | Pass / Pass / Pass |
| Signed out | Public Developer Space observatory | `375x812` | Pass / Pass / Pass |
| Replay owner | Studio | `1440x900` | Pass / Pass / Pass |
| Replay owner | Private companion/chat | `1440x900` | Pass / Pass / Pass |
| Replay owner | Studio | `390x844` | Pass / Pass / Pass |
| Replay owner | Private companion/chat | `390x844` | Pass / Pass / Pass |
| Replay owner | Studio | `375x812` | Pass / Pass / Pass |
| Replay owner | Private companion/chat | `375x812` | Pass / Pass / Pass |

All 45 cases had zero document-level horizontal overflow and zero browser
`pageerror` events.

## Preference And Bootstrap

- All 18 session/preference/viewport contexts exposed exactly System, Light,
  and Dark with the correct selected state.
- System resolved from dark media on first paint, followed live changes to
  light and back to dark, and wrote no preference merely from a visit.
- Explicit Light and Dark persisted through refresh and ignored later media
  changes.
- The pre-body preference, resolved-theme, and native `color-scheme` values
  matched the post-hydration result in every context.
- Keyboard and touch selection, Escape close, and focus return passed. The
  appearance trigger remained exactly `30px` wide at all three viewports.
- An invalid stored value normalized to System. Throwing storage with
  unavailable `matchMedia` settled to usable signed-out Light navigation,
  retained the appearance control, and produced zero page errors.

## Session And Visibility Safety

| Check | Result |
| --- | --- |
| Normal replay-owner sign-in | Pass without printing credentials or identifiers. |
| Browser session storage and auth cookie | Present without recording either value. |
| Studio and selected companion refresh | Pass; owner session and private route persisted. |
| Appearance/session isolation | Pass; the serialized auth fingerprint was unchanged by all owner appearance selections. |
| Signed-out boundaries | Pass; public routes retained Sign in / Sign up and no private account control. |
| Signed-in boundaries | Pass; Studio and companion retained the private account control and no signed-out auth actions. |
| Public observatory boundary | Pass; no Manage action or raw JSON control appeared. |
| Hosted mutation boundary | Pass; no product or account mutation was activated. |

## Frozen Geometry And Navigation

| Surface | Hosted measurement |
| --- | --- |
| Global frame | `46px` navigation and `30px` appearance trigger in every case. |
| Forums desktop | Exact `210px / 720px / 260px` tracks in a `1226px` layout. |
| Forums narrow | Feed width `354px` at `390px`; `339px` at `375px`; both inset `18px`. |
| Studio desktop | `156px` rail and `1284px` content. |
| Studio narrow | Rail hidden; compact navigation and content remain full viewport width. |
| Companion desktop | `854px` shell, `156px` rail, `1256px` primary workspace, and `1254px x 66px` composer. |
| Companion `390px` | `374px` primary and `372px x 66px` composer. |
| Companion `375px` | `359px` primary and `357px x 66px` composer. |
| Compact chat | `54px` narrow header, `13px` messages, and `12px / 18px` composer text. |

Public and owner route menus exposed their complete accepted inventories.
The private account menu exposed all six accepted destinations. Native menu,
account, Forum, Studio, thread, and assistant-action disclosures remained
keyboard/touch operable with coherent focus. The archived companion fixture
exposed exactly two assistant actions; neither was activated.

## Contrast

Representative semantic pairs all met their accepted thresholds:

| Pair | System-dark | Light | Dark |
| --- | ---: | ---: | ---: |
| Ordinary text | `15.16:1` | `13.96:1` | `15.16:1` |
| Muted text | `8.52:1` | `4.53:1` | `8.52:1` |
| Focus / active | `7.51:1` | `5.86:1` | `7.51:1` |
| Selected state | `7.71:1` | `7.99:1` | `7.71:1` |
| User message | `7.76:1` | `5.41:1` | `7.76:1` |
| Assistant message | `12.34:1` | `13.37:1` | `12.34:1` |
| Success | `7.46:1` | `5.53:1` | `7.46:1` |
| Warning | `7.80:1` | `6.24:1` | `7.80:1` |
| Error | `5.35:1` | `5.95:1` | `5.35:1` |
| Disabled effective | `5.57:1` | `4.03:1` | `5.57:1` |

The simulated dark unavailable state measured `10.94:1`, displayed the
owner-visible error and `Unavailable` state, and disabled both composer and
send control.

## Observatory Isolation

At all three viewports, the node-field canvas and node-bubble computed
background, grid, border, and text signature was identical under System-dark,
Light, and Dark. The surrounding Station navigation and page frame changed
between Light and Dark. Human-eye inspection confirmed that the public
observatory remains a bounded live observatory rather than inheriting a global
reskin, with no clipping or mobile overflow.

## Browser Diagnostics

- All primary and synthetic cases produced zero browser page errors, zero
  hydration errors, zero WebSocket errors, and zero unclassified console
  errors.
- Repeated scripted authenticated full-page transitions emitted `79` caught
  Next.js RSC-payload fallback diagnostics. Each destination loaded normally;
  no route, auth, render, or state failure accompanied them.
- The browser-only unavailable-state intercept emitted one expected synthetic
  failed-resource diagnostic for its `503` response.
- The rehearsal therefore records `80` classified console diagnostics and
  does not claim a zero-console run.

## Human-Eye Answers

1. Light remains the accepted warm composition without visible regression.
2. Dark is coherent, restrained, and warm-neutral. It does not read as a
   generic navy SaaS dashboard.
3. Public Discover/Forums/Developer Space, private Studio, and private
   companion boundaries remain visibly distinct and truthful.
4. Both narrow widths fit without incoherent overlap, clipping, or horizontal
   overflow. Controls and next actions remain legible.
5. The appearance menu is compact, clear, and unclipped at desktop and
   `375px`, with only the required three choices.
6. The Developer Space interior remains intentionally fixed while the Station
   frame responds to appearance. This is the accepted isolation boundary.
7. No PR525H correction remains.

## Accepted Boundaries

- System was rehearsed under dark system media, with a separate live
  light/dark media-change proof. Explicit Light covered the full light matrix.
- The public observatory's bounded visualization interior is intentionally
  invariant across themes.
- Provider/setup was not naturally entered; its accepted local PR525E proof
  remains authoritative.
- The unavailable probe was browser-only and changed no hosted state.
- PR526C-F remain parked. This result makes no guided-flow implementation or
  parity claim.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Web and API `/health/deployment` | Pass | Both ready on `main` at exact accepted SHA `857a7e734662a9b586515d4575401a02dc843e20`. |
| Hosted Playwright matrix | Pass | 45 primary cases; zero blockers, page errors, or horizontal overflow. |
| Preference and session proof | Pass | First-paint resolution, persistence, live System behavior, auth isolation, refresh, invalid storage, and denied APIs passed. |
| Geometry, contrast, and accessibility | Pass | Frozen dimensions, semantic contrast, complete menus, keyboard/touch, and focus return passed. |
| Observatory isolation | Pass | Interior signature remained identical while the surrounding frame changed. |
| Human-eye review | Pass | Desktop, `390px`, and `375px` public/private captures were inspected. |
| `git diff --check` | Pass | Documentation result has no whitespace errors. |
| `pnpm typecheck` | Not required | Documentation only; no imports or scripts changed. |

## Handoff

MIMIR should accept the hosted PR525H proof, complete the final UI integration
closeout with implemented work and deliberate boundaries named, then restore
the terminal mainline pause. No new PR526 or product-expansion lane is opened
by this result.
