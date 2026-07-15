# PR527A - Notes Truth Repair Boundary Preflight

Owner: MIMIR / A1 -> ARGUS / A3 -> MIMIR / A1

Date opened: 2026-07-15

Status:

```text
OPEN_PR527A_NOTES_TRUTH_BOUNDARY_PREFLIGHT
```

## Why This Is First

ARIADNE's PR527 hosted inventory found that `/studio/notes` accepts owner-
private writing into browser memory, restores three seeded faux notes after a
refresh, silently loses the owner's text, does not filter its search input, and
presents nine inert editing/workflow commands.

This is the smallest direct trust failure in the inventory. It contradicts
Station's continuity and archive promise without requiring a new backend to
make the current UI truthful.

Authoritative evidence:

- `docs/roadmap/PR527_UI_PRODUCT_COMPLETENESS_HOSTED_JOURNEY_INVENTORY_ARIADNE_RESULT.md`
- `apps/web/components/studio/notes-scratchpad.tsx`
- `apps/web/lib/studio-navigation.ts`

## Proposed Bounded Repair

PR527A is a removal/truth slice, not a durable Notes feature.

1. Stop advertising `/studio/notes` in the general Studio workspace links as a
   working private scratchpad.
2. Keep the deep-link route owner-gated through the existing Studio shell so an
   old bookmark does not become a broken or public route.
3. Replace the seeded/local editor with one truthful unavailable state:
   Station does not currently save Notes on this route.
4. Remove all seeded notes, text entry, local state, search, formatting buttons,
   Pin, Archive, Draft post, Attach, word counts, and "Private by default"
   persistence implications.
5. Offer only real navigation commands: `Open Global Archive` to
   `/studio/archive` and `Back to Studio` to `/studio`.
6. Use the accepted shared semantic theme contract in System, Light, and Dark,
   with a coherent owner-only empty/unavailable composition at desktop,
   `390px`, and `375px`.

## Locked Boundaries

- No Notes schema, API, migration, rich editor, localStorage, browser database,
  autosave, background job, package, or provider work.
- No import of Discern's notes route, migration, archive endpoint, Yoopta
  dependencies, global CSS, or private-state assumptions.
- No attempt to reinterpret Memory, Canon, Continuity, Archive, publishing
  drafts, or chat messages as Notes records.
- No deletion, migration, or recovery claim for the old ephemeral browser
  state; there was no authoritative stored record to migrate.
- No auth, owner-scope, Studio layout, Archive contract, navigation shell, API,
  schema, or unrelated route change.
- Do not replace dead controls with disabled lookalikes. The unsupported editor
  commands leave the rendered product.
- Do not promise a delivery date. The unavailable state describes current
  product truth and the supported alternative only.

## Expected Implementation Files

If ARGUS accepts, DAEDALUS receives this exact allow-list:

```text
apps/web/components/studio/notes-scratchpad.tsx
apps/web/components/studio/notes-scratchpad.test.ts
apps/web/lib/studio-navigation.ts
apps/web/lib/studio-navigation.test.ts
apps/web/app/globals.css
package.json
docs/roadmap/PR527A_NOTES_TRUTH_REPAIR_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

`apps/web/app/studio/notes/page.tsx` should remain the stable deep-link route
unless ARGUS identifies a concrete reason it must change.

## ARGUS Questions

1. Does removing the general Studio workspace link while retaining the
   owner-gated deep link truthfully remove the unsupported capability without
   creating a route/auth regression?
2. Is the exact unavailable state sufficient, or must it explicitly say that
   text previously entered on this route was never stored?
3. Are Global Archive and Studio the only safe current destinations, or would
   either imply that Archive is equivalent to Notes?
4. Does the proposed removal avoid creating a retention, deletion, migration,
   recovery, or durability promise that Station cannot satisfy?
5. Must route context use `Notes unavailable`, name owner-only access, and point
   its next action to Global Archive so mobile/deep-link summaries remain
   truthful?
6. Are the file allow-list, no-backend boundary, and no-Discern-import boundary
   sufficiently narrow for DAEDALUS?
7. What exact tests and hosted proof are required before this route can move
   from `FAIL_PRODUCT` to `TRUTHFULLY_UNAVAILABLE`?

## Required Acceptance Gates

ARGUS should require at least:

- the Studio workspace link inventory no longer advertises Notes as live;
- direct `/studio/notes` remains owner-only and signed-out access retains the
  existing auth behavior;
- rendered/source proof contains no seeded note content, editable field,
  search field, local note state, or inert editor/workflow commands;
- rendered copy states that Notes are not saved in current Station and does not
  overclaim Archive as equivalent storage;
- both remaining commands route to real owner-safe destinations;
- System, Light, and Dark at `1440x900`, `390x844`, and `375x812` have no
  overlap, clipped commands, horizontal overflow, or fixed-dark residue;
- focused Notes/navigation tests, the full `test:studio-ui` suite, web
  typecheck, web lint, `git diff --check`, and a secret/scope scan pass;
- ARIADNE runs hosted desktop/narrow human rehearsal after ARGUS accepts the
  implementation.

## Required Result And Handoff

Create:

```text
docs/roadmap/PR527A_NOTES_TRUTH_BOUNDARY_PREFLIGHT_ARGUS_RESULT.md
```

Return exactly one verdict:

```text
ACCEPT_PR527A_NOTES_TRUTH_REPAIR_BOUNDARIES
BLOCK_PR527A_<EXACT_CONCRETE_BOUNDARY>
```

Commit the result and wake MIMIR. Do not implement the patch, broaden into a
durable Notes feature, or go idle without a committed response.

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the PR527A Notes truth boundary preflight.
Verdict:
- <accepted or exact blocker>
Task:
- If accepted, wake DAEDALUS with the exact route-only allow-list and gates.
- Keep the wider PR527 correction programme moving.
```

