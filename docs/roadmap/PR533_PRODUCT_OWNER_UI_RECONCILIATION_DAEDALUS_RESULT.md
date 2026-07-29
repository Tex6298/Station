# PR533 Product-Owner UI Reconciliation - DAEDALUS Result

**Owner:** DAEDALUS / A2 -> ARGUS / A3

**State:** `READY_PR533_PRODUCT_OWNER_UI_RECONCILIATION_FOR_ARGUS`

**Base:** `5bd3c15 wake: open PR533 product-owner UI reconciliation`

**Product source:** `962fe8ca feat: companion hover settings card, sidebar/dashboard declutter, merge Station+Discover nav`

## Result

DAEDALUS retained Adam's accepted public-front-door and Studio hierarchy and
completed the bounded repair requested by MIMIR. The pass does not reopen a
reskin, backend, schema, auth, billing, provider, or hosted-data lane.

The repaired source is ready for hostile review. It is not PR533 closeout and
does not claim hosted System/Light/Dark or human-eye acceptance.

## Reconciled Defects

- `StudioWorkspaceProvider` now owns the non-persona Studio shell load. The
  dashboard and sidebar consume one shared `/personas` and `/integrity/due`
  result rather than mounting competing workspace hooks.
- The same provider owns recent-conversation loading. Desktop rail, mobile rail,
  and dashboard consume one result, so each unique persona produces one
  `/personas/:id/conversations?archived=true` request per shell load rather than
  one request from every consumer.
- Workspace session/load failures now terminate loading and show an explicit
  failure state. Conversation failures are distinguished from a genuinely empty
  history, including partial failure across personas.
- The companion quick card now has an explicit `closed | hover | pinned` state
  contract. Pointer hover is transient; click or keyboard activation pins; a
  second activation, outside click, focus departure, or Escape dismisses it.
  Escape restores focus to the settings trigger.
- The quick card is positioned against the viewport and clamped after content
  resize, window resize, and ancestor scrolling. It no longer clips inside the
  Studio rail's overflow boundary.
- Quick-card controls expose `aria-expanded`, `aria-controls`, and dialog
  semantics. Detail-dependent mutations remain unavailable while persona detail
  is loading or unavailable.
- Lucide chat/settings icons replace unloaded `ti-*` glyph classes, removing
  blank quick actions without introducing hand-drawn SVG.
- Archive is restored to the companion shortcut inventory. Mobile Studio has a
  direct `Companion settings` fallback for each persona plus the existing global
  Settings route.
- Settings destination data now has one exported inventory so route
  reachability assertions and the page use the same source.

## Capability Reachability

| Capability | Retained route |
| --- | --- |
| Companion home / conversation | `/studio/personas/:id` and `?c=:conversationId` |
| New companion conversation | `/studio/personas/:id?c=new` |
| Memory | `/studio/personas/:id/memory` |
| Integrity | `/studio/personas/:id/calibration` |
| Companion Archive | `/studio/personas/:id/files` |
| Companion profile/settings | `/studio/personas/:id/edit` |
| Global Archive | `/studio/archive` |
| Public Space | `/space` |
| Publishing | `/studio/publish` and `/studio/publishing` |
| Relocated operational tools | `/settings` destination inventory |

The existing route boundary remains authoritative: `/` and `/discover` are
public; Studio, Settings, owner Public Space management, and their data requests
remain protected. No API authorization or visibility contract changed.

## Focused Coverage

- `apps/web/lib/companion-quick-card.test.ts` covers the state transition matrix
  and source accessibility wiring.
- `apps/web/lib/studio-workspace.test.ts` covers the single provider/loader
  architecture, truthful loading/error copy, Settings reachability, and mobile
  companion-settings fallback.
- Existing Studio navigation, persona conversation, and dashboard suites now
  assert Archive reachability, unique persona request paths, and shared recent
  conversation input.
- A private ignored Playwright harness used owner-scoped mocked API responses;
  it did not touch hosted data. Its desktop and 390 px runs proved hover, pinned
  click, pointer leave, Escape focus restoration, keyboard activation, mobile
  fallback, route boundaries, viewport containment, and one conversation request
  per unique persona.

## Validation

| Command / proof | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 install --frozen-lockfile` | Pass; lockfile already current |
| `npx --yes pnpm@10.32.1 test:studio-ui` | Pass, `275/275` |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, `24/24` |
| `npx --yes pnpm@10.32.1 test:writing` | Pass, `35/35` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `57/57` |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass; zero warnings/errors |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| Private mocked desktop/mobile browser proof | Pass; overflow `0`, one conversation request per persona, card inside viewport and pointer-reachable, mobile settings reachable, public front door and protected Studio redirect exact |
| `npx --yes pnpm@10.32.1 --filter @station/web build` | Application build passes through compilation, lint/type validation, page-data collection, and `40/40` static pages; final standalone traced-file copy stops at the documented Windows symlink `EPERM` |

The existing Autoprefixer warning for mixed support of `end` remains unchanged.
The final Windows standalone-copy `EPERM` is the established local-environment
limitation already documented in `docs/testing/VALIDATION_BASELINE.md`; it is
not a PR533 source failure.

Private local browser artifacts remain ignored under `.station-private/pr533/`
and are not part of the commit.

## Baton

ARGUS should hostile-review the bounded source against MIMIR's packet and Adam's
accepted hierarchy. Review request ownership/fanout, quick-card interaction and
accessibility, route/auth/privacy preservation, loading/error truth, focused
tests, dependency scope, and this validation receipt.

If accepted, ARGUS should wake ARIADNE for the hosted desktop/mobile and
System/Light/Dark rehearsal specified by the PR533 packet.
