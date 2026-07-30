# PR533 Hosted Studio Rail And Settings Theme Repair - ARIADNE Result

**Owner:** ARIADNE / A4 -> ARGUS / A3

**Date:** 2026-07-30

**Hosted source:** `8e6cea04741f815dc0808e8f1a9e431c0563fa06`

**State:**

```text
PASS_PR533_AFFECTED_HOSTED_STUDIO_SETTINGS_RERUN
```

## Verdict

The bounded exact-SHA hosted rerun passes. The repaired desktop Studio rail no
longer creates internal horizontal overflow, and Settings principal surfaces
follow the selected Light, Dark, and System-dark appearance. Human-eye review
found no remaining presentation blocker in the seven affected captures.

The hosted deployment identity stayed on reviewed `main` source
`8e6cea04741f815dc0808e8f1a9e431c0563fa06` before and after the run. This result
is ready for ARGUS final review; it does not independently close PR533.

## Studio Rail Result

The hosted desktop Studio shell was checked at `1440x900` in System, Light, and
Dark appearances against the existing long-name owner data.

| Stage | Internal overflow | `scrollLeft` |
| --- | ---: | ---: |
| Before hover | `0` | `0` |
| After hover | `0` | `0` |
| After pointer pin | `0` | `0` |
| After Escape | `0` | `0` |
| After keyboard pin | `0` | `0` |

- The rail remained `156px` wide with no page-level horizontal overflow.
- Long companion and recent-conversation labels ellipsized inside the rail
  instead of clipping its left edge or widening its scroll range.
- Both companion quick triggers remained visible and inside the rail.
- The fixed quick card remained inside the viewport and pointer-reachable.
- Hover, pointer pin, pointer-leave retention, Escape dismissal with focus
  restoration, focus, and keyboard pin all passed.
- Studio moved truthfully from loading to ready, with one conversation request
  per persona for the shell load.

## Settings Appearance Result

| Case | Viewport | Page | Principal surface | Fixed-white principal surfaces |
| --- | --- | --- | --- | ---: |
| Light | `1440x900` | `rgb(244, 243, 239)` | `rgb(255, 255, 255)` | `0` |
| Dark | `1440x900` | `rgb(25, 25, 24)` | `rgb(36, 35, 32)` | `0` |
| System-dark | `390x844` | `rgb(25, 25, 24)` | `rgb(36, 35, 32)` | `0` |

- Principal cards, side panels, provider modes and rows, inputs, actions, and
  notification rows resolved to coherent semantic surfaces.
- Light retained its intended white card surface. Dark and System-dark contained
  no fixed-white principal surface.
- The focused Settings control rendered a `2px solid rgb(174, 161, 239)` outline.
- All three Settings cases had zero document horizontal overflow.
- Human-eye review found legible hierarchy, coherent controls, and no overlap or
  clipping in Light desktop, Dark desktop, or System-dark mobile.

## Preserved Gates

- Hosted sign-in and sign-out passed; the prior-token rejection gate remained
  intact.
- The run made zero product-data writes and zero provider calls. The only writes
  were the bounded authentication sign-in and sign-out requests.
- No provider key was saved, notification preference toggled, persona changed,
  or unrelated PR533 path exercised.
- API failures, page errors, unclassified console errors, RSC fallback notices,
  and unclassified request failures were all `0`. Browser navigation aborts were
  classified separately and did not represent API or product failures.
- Deployment source identity remained stable for the complete run.

Private credentials, owner identifiers, session material, request details, and
captures remain ignored under `.station-private/pr533/`. This receipt contains
only redacted aggregate evidence.

## Validation

| Command / review | Result |
| --- | --- |
| `node --check .station-private/pr533/hosted-rehearsal.mjs` | Pass |
| Exact-SHA affected hosted harness | Pass; `PASS_PR533_AFFECTED_HOSTED_STUDIO_SETTINGS_RERUN` |
| Human-eye review | Pass; three Studio, quick-card, and three Settings captures |
| `git diff --check` | Pass |
| `pnpm typecheck` | Not required; documentation-only tracked change |

## Baton

ARGUS should perform final review of this redacted exact-SHA hosted receipt. If
accepted, return PR533 to MIMIR for closure or the next explicitly authorized
lane. No successor implementation lane is implied by this result.
