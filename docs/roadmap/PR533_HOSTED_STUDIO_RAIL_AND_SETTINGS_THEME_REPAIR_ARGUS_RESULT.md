# PR533 Hosted Studio Rail And Settings Theme Repair - ARGUS Result

**Owner:** ARGUS / A3 -> ARIADNE / A4

**Date:** 2026-07-30

**Reviewed commit:** `8e6cea04741f815dc0808e8f1a9e431c0563fa06`

**State:**

```text
ACCEPT_PR533_HOSTED_STUDIO_RAIL_AND_SETTINGS_THEME_REPAIR_SOURCE_ONLY
READY_PR533_AFFECTED_HOSTED_STUDIO_SETTINGS_RERUN_FOR_ARIADNE
```

## Verdict

ARGUS accepts DAEDALUS's bounded source repair without a review patch. The two
confirmed hosted presentation defects are repaired locally, the changed paths
stay inside the authorized lane, and no auth, privacy, owner-scope, provider,
notification-state, API, backend, dependency, deployment, or billing boundary
was widened.

This is source acceptance only. It does not close PR533 or supersede the hosted
blocker. ARIADNE owns the exact-SHA rerun of the affected hosted Studio desktop
rail and Settings appearance cases.

## Hostile Review

- The Studio sidebar remains exactly `156px`. Shrink bounds now contain the
  persona and recent-conversation rows, while long primary and secondary labels
  ellipsize instead of creating an internal horizontal scroll range.
- Both companion quick triggers remain visible and in flow. The quick card is
  still fixed, viewport-clamped, hoverable, pinnable by pointer and keyboard,
  dismissible with Escape, and pointer-reachable.
- Settings principal cards, panels, provider rows, inputs, selected state,
  actions, notification rows, and status copy now consume the existing semantic
  `--station-page-*` contract. Light retains its accepted page and white surface;
  Dark and System-dark no longer retain fixed-white principal surfaces.
- Provider key handling and masked readback are unchanged. Notification loading,
  saving, stale-request protection, reconciliation, and disabled-state behavior
  are unchanged.
- The four product files, two focused test files, and documentation receipts are
  the only changed paths. There is no package, lockfile, route, middleware, API,
  schema, migration, or hosted runtime configuration change.
- Added-line secret scanning found no high-risk value. The public receipt contains
  no credential, private identifier, owner data, or secret value.

## Independent Validation

| Command / review | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/theme.test.ts apps/web/lib/studio-workspace.test.ts` | Pass, `15/15` |
| `npx --yes pnpm@10.32.1 test:studio-ui` | Pass, `277/277` |
| `npx --yes pnpm@10.32.1 test:ai-settings` | Pass, `14/14` |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/notification-preferences.test.ts` | Pass, `5/5` |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass, zero warnings/errors |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| Independent ignored mocked browser rerun | Pass; rail overflow and `scrollLeft` remain `0` before hover, after hover, pin, Escape, and keyboard pin; both triggers and the quick card remain reachable; mobile fallback remains present |
| Settings appearance matrix | Pass; Light page/surface `rgb(244, 243, 239)` / `rgb(255, 255, 255)`, Dark and System-dark `rgb(25, 25, 24)` / `rgb(36, 35, 32)`, focus outline `2px`, document overflow `0` |
| Human-eye review | Pass for long-name Studio desktop/mobile and Settings Light/Dark/System-dark captures |
| Bounded path/dependency scan | Pass; `10` expected paths, no dependency metadata |
| Added-line high-risk secret scan | Pass, zero candidates |
| `git diff --check 85cae074..8e6cea04` | Pass |

The mocked harness used synthetic owner/session data, intercepted API reads, and
made no hosted request, product-data write, provider call, or mutation. Its
script and captures remain ignored under `.station-private/pr533/`.

## ARIADNE Rerun Contract

ARIADNE should wait for the reviewed SHA to be deployed, bind the hosted proof
to that exact source identity, and rerun only the affected cases:

1. On hosted desktop Studio, record the `156px` rail's internal overflow and
   `scrollLeft` before hover and after hover, pointer pin, Escape, and keyboard
   pin against the existing long-name owner rows. Both quick triggers and the
   fixed card must remain visible, inside the viewport, and pointer-reachable.
2. On hosted Settings, verify Light desktop, Dark desktop, and System-dark mobile.
   Principal cards, panels, provider rows, inputs, actions, and notification rows
   must resolve to semantic surfaces; Dark cases must contain no fixed-white
   principal surface, and Light must retain the accepted values.
3. Preserve the previous functional, auth, privacy, request-fanout, mobile
   fallback, route, diagnostics, and zero-product-write gates. Do not save a
   provider key, toggle notifications, change a persona, or broaden into an
   unrelated PR533 rehearsal.
4. Keep private session/evidence material ignored and publish only redacted
   metrics, exact source/deployment identity, diagnostics, and write/provider-call
   counts.

If those affected hosted cases pass, wake ARGUS for final review. If either
presentation defect remains, wake ARGUS with the exact measured blocker and
leave PR533 open.
