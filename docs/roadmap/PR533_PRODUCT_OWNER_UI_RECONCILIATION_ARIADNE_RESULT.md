# PR533 Product-Owner UI Reconciliation - ARIADNE Result

**Owner:** ARIADNE / A4 -> ARGUS / A3

**Date:** 2026-07-30

**Hosted source:** `12a72dc5b3861535948cd553abfa9ce2bbbe879b`

**State:**

```text
BLOCK_PR533_HOSTED_STUDIO_RAIL_AND_SETTINGS_THEME
```

## Verdict

PR533 does not pass its hosted human-eye gate. The accepted source is deployed
exactly and the public front door, navigation, request ownership, quick-card
state machine, mobile fallback, relocated destinations, loading truth, auth,
and privacy checks pass. Two presentation defects remain on affected PR533
surfaces:

1. The desktop Studio rail has `180px` of internal horizontal overflow. Moving
   the first companion row into pointer reach scrolls that rail from `0` to
   `180px`, exposing the quick controls by cutting companion and recent-
   conversation labels off on the left. The document itself does not overflow,
   so the failure is trapped inside the narrow rail and is easy to miss in a
   root-page geometry check.
2. Settings keeps fixed light cards and panels in Dark and System-dark. The
   page background resolves to `rgb(25, 25, 24)`, while `.station-card` remains
   `rgb(255, 255, 255)` on desktop and mobile. Human-eye review shows a broken
   mixed-theme surface, including visibly fragmented Settings copy and controls
   in the desktop Dark case.

This is a bounded hosted blocker, not a rejection of Adam's accepted hierarchy.
ARGUS should review the evidence and route the smallest rail containment and
Settings tokenization patch before ARIADNE reruns the affected cases.

## Deployment Gate

Web and API were checked before and after the rehearsal. Both stayed ready on
`main` at the exact ARGUS-accepted source with stable deployment identities.

| Service | Ready | Branch | Exact SHA |
| --- | --- | --- | --- |
| `@station/web` | Pass | `main` | `12a72dc5b3861535948cd553abfa9ce2bbbe879b` |
| `@station/api` | Pass | `main` | `12a72dc5b3861535948cd553abfa9ce2bbbe879b` |

No deployment drift occurred during the run.

## Hosted Matrix

ARIADNE captured and inspected these live cases:

| Surface | System | Light | Dark | Desktop | Mobile |
| --- | --- | --- | --- | --- | --- |
| Public front door | Pass | Pass | Pass | `1440x900` | `390x844` |
| Studio dashboard | Blocked only by desktop rail | Blocked only by desktop rail | Blocked only by desktop rail | `1440x900` | Pass at `390x844` |
| Settings | Blocked in System-dark | Pass | Blocked | `1440x900` | System-dark at `390x844` blocked |

System honestly resolved to Dark in the rehearsal environment. Across the
public and Studio page roots, every case had zero horizontal document overflow
and no uncontained control escape. Mobile Studio retained a coherent single-
column dashboard and direct companion-settings fallback.

The public front door was settled before capture. Its signed-out desktop and
mobile Light/Dark/System cases were coherent, responsive, and nonblank. The
empty public-persona state and Station statistics were truthful after live
reads completed.

## Studio Rail Blocker

The rail begins with:

```text
internal overflow: 180px
scrollLeft: 0px
```

After the pointer rehearsal brings the quick-action row into reach:

```text
internal overflow: 180px
scrollLeft: 180px
```

At that point, the chat and settings icons are reachable, but the rail's
companion names, filter, and recent-conversation rows are visibly cut off on
the left. The clipped state persists through the desktop System, Light, and
Dark captures. Mobile does not render the quick card and is unaffected.

The repair surface appears narrow: `.studio-rail-scroll` currently declares
vertical auto overflow without an explicit horizontal containment rule, while
the companion row and revealed quick triggers can produce wider internal
content. ARGUS should verify the exact source fix rather than treating document
overflow `0` as acceptance.

## Settings Theme Blocker

The shared page shell changes correctly between Light and Dark, but Settings
uses local inline style constants with fixed light values for cards, panels,
headings, muted copy, marks, and pills. The observed principal surface values
were:

| Appearance | Page background | Card background | Result |
| --- | --- | --- | --- |
| Light desktop | `rgb(244, 243, 239)` | `rgb(255, 255, 255)` | Pass |
| Dark desktop | `rgb(25, 25, 24)` | `rgb(255, 255, 255)` | Block |
| System-dark mobile | `rgb(25, 25, 24)` | `rgb(255, 255, 255)` | Block |

This is not a request for a Settings redesign. The bounded repair is to make
the existing composition consume Station theme tokens consistently, including
its embedded operational panels and controls.

## Passing Product Proof

- `/discover` canonicalized to the shared `/` public front door.
- Signed-out and signed-in top navigation exposed the expected public and
  private destinations.
- Six protected signed-out routes, including the companion Settings route,
  redirected to sign-in with the exact return path and made zero owner reads.
- Studio rendered the truthful live order `loading -> ready`; no empty or error
  flash appeared.
- Each unique companion produced exactly one recent-conversation request on
  the measured shell load.
- Recent conversations rendered either live links or the truthful empty state;
  no unavailable state appeared.
- Quick-card hover, click pinning, pointer-leave retention, Escape dismissal,
  trigger-focus restoration, keyboard activation, viewport containment, and
  center-point pointer reachability passed.
- The quick card retained Memory, Inbox, Timeline, Archive, Profile, and
  Integrity destinations. Detail-dependent controls loaded but were not
  changed.
- Mobile hid the desktop rail and quick card, exposed the Studio disclosure,
  and retained direct per-companion Settings links.
- Nine relocated Settings destinations were present. Eleven protected route
  reachability checks returned `200` without redirect for Memory, Inbox,
  Timeline, companion Archive, companion Settings, Integrity, Global Archive,
  both publishing routes, Public Space management, and Settings.
- Browser sign-in and sign-out passed; storage and the auth cookie cleared, and
  the prior access token returned `401` after sign-out.

## Diagnostics And Mutation Boundary

| Gate | Result |
| --- | --- |
| Hosted product-data writes | Pass, `0` |
| Auth writes | Expected only: one sign-in and one sign-out |
| Provider/model calls | Pass, `0` |
| API failures | Pass, `0` |
| Page errors | Pass, `0` |
| Unclassified console errors | Pass, `0` |
| Unclassified request failures | Pass, `0` |
| Classified Next RSC fallback notices | `6`, paired with cancelled navigation/prefetch GETs |

No avatar save, anonymous-chat toggle, provider call, schema/configuration
change, billing action, publishing action, or other hosted product mutation was
sent. Credentials, raw owner/persona identifiers, private payloads, and captures
remain only in ignored local evidence.

## Validation

- `node --check .station-private/pr533/hosted-rehearsal.mjs` - pass
- complete exact-SHA hosted browser rehearsal - completed with the bounded
  blocker above
- 6 public, 6 Studio, 3 Settings, quick-card, and mobile-fallback human-eye
  captures - inspected
- `git diff --check` - pass
- `pnpm typecheck` - not required; the tracked change is documentation only

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR533 exact-SHA hosted functional, auth, privacy, route, request-fanout,
  quick-card, mobile, and diagnostic gates pass.
- Hosted human-eye acceptance is blocked by 180px internal desktop Studio rail
  overflow and fixed light Settings surfaces in Dark/System-dark.
Task:
- Review the bounded evidence and send the smallest rail-containment and
  Settings-theme repair to DAEDALUS.
- Return the accepted repair to ARIADNE for affected desktop/mobile and
  System/Light/Dark hosted rerun.
```
