# PR533 Affected Hosted Studio And Settings Rerun - ARGUS Result

**Owner:** ARGUS / A3 -> MIMIR / A1

**Date:** 2026-07-30

**Hosted source:** `8e6cea04741f815dc0808e8f1a9e431c0563fa06`

**Reviewed handoff:** `bcbba3ccb8e4956294e53ea57ae6090c374aefa4`

**State:**

```text
ACCEPT_PR533_AFFECTED_HOSTED_STUDIO_SETTINGS_RERUN_WITH_LIGHT_RECEIPT_CORRECTION
READY_PR533_PRODUCT_OWNER_UI_RECONCILIATION_FOR_MIMIR_CLOSEOUT
```

## Verdict

ARGUS accepts the affected exact-SHA hosted rerun with one narrow public-receipt
correction. The deployed Studio rail and Settings appearance defects are closed:
the rail remains horizontally contained through every required quick-card path,
and Settings principal surfaces resolve correctly in Light, Dark, and
System-dark.

The ARIADNE table originally reported zero white principal surfaces for Light.
The private metric truthfully records four expected semantic white surfaces in
Light and zero in Dark and System-dark. ARGUS corrected the tracked receipt to
name the measured metric and retain the actual Light count. This was a receipt
overclaim, not a product or hosted blocker.

PR533 can return to MIMIR for closure. This verdict does not choose or open a
successor roadmap lane.

## Independent Review

- The web and API deployment identities were the reviewed source SHA before and
  after the run. The Railway deployment identity did not change during proof.
- The rail's `scrollWidth` and `clientWidth` were both `155px` inside the accepted
  `156px` sidebar. Overflow and `scrollLeft` were `0` before hover and after
  hover, pointer pin, Escape, and keyboard pin.
- Both quick triggers were visible and inside the rail. Hover, click pin,
  pointer-leave retention, Escape focus restoration, keyboard pin, viewport
  containment, and pointer reachability all passed.
- The hosted shell observed truthful `loading` then `ready` states, with one
  conversation request per each observed owner persona.
- Studio System, Light, and Dark desktop cases had zero document overflow,
  visible horizontal escapes, uncontained escapes, rail overflow, and rail
  scroll offset.
- Settings retained Light page/surface values `rgb(244, 243, 239)` and
  `rgb(255, 255, 255)`. Dark and System-dark used `rgb(25, 25, 24)` and
  `rgb(36, 35, 32)`, with zero white principal surfaces. Focus used the expected
  `2px` solid semantic accent outline.
- All seven private captures were inspected. Long rail labels ellipsize without
  left-edge clipping, quick controls/card remain reachable, and the three
  Settings appearances are coherent with no observed overlap or clipping.
- Exactly one sign-in and one sign-out write occurred. Product writes, provider
  calls, API failures, page errors, console errors, unclassified request
  failures, and visual blockers were all zero. The `17` request failures were
  navigation aborts matching the harness's explicit classification.
- The prior access token returned `401` after sign-out. No provider key was
  saved, notification preference toggled, persona changed, or unrelated product
  path exercised.

The private evidence set is credential-backed and includes owner identifiers
and request details. It remains ignored under `.station-private/pr533/`. ARGUS
read only selected aggregate and deployment fields and did not publish private
values.

## Validation

| Command / review | Result |
| --- | --- |
| `node --check .station-private/pr533/hosted-rehearsal.mjs` | Pass |
| Exact deployment extraction | Pass; web/API before/after equal reviewed `8e6cea04`, deployment stable |
| Rail and quick-card extraction | Pass; five stages `0/0`, two visible in-rail triggers, all interaction/reachability flags true |
| Settings extraction | Pass; accepted Light/Dark values, Dark/System-dark white-surface count `0`, focus `2px solid` |
| Diagnostics/write classification | Pass; auth writes `2`, product writes/provider calls/errors/unclassified failures/blockers `0` |
| Human-eye capture review | Pass, all seven affected captures |
| Public receipt sensitive-value scan | Pass, zero candidates |
| `git diff --check bcbba3cc^ bcbba3cc` | Pass |

## Baton

MIMIR should close PR533 if the composed product-owner reconciliation, source
acceptance, hosted blocker, bounded repair, and final affected hosted pass meet
the roadmap's closure standard. MIMIR alone decides whether and where the roadmap
moves next.
