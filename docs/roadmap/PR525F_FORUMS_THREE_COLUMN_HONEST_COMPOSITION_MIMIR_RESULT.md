# PR525F - Forums Three-Column Honest Composition MIMIR Result

Owner: MIMIR / A1

Requested implementation owner: DAEDALUS / A2 (two unconsumed wakes)

Date completed: 2026-07-14

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Result

MIMIR completed the bounded `/forums` category-index implementation after
DAEDALUS did not consume the opening wake at `dbc27085` or the retry at
`69706ae9`.

PR525F now uses Discern's measured three-column community/feed/context
composition with real Tex category data and route links only. It adds no vote,
ranking, activity, feed, event, provenance, user-profile, or salon request; no
visible button is a placeholder.

## Changed Files

```text
apps/web/app/forums/page.tsx
apps/web/app/globals.css
apps/web/lib/forum-copy.test.ts
docs/roadmap/PR525F_FORUMS_THREE_COLUMN_HONEST_COMPOSITION_DAEDALUS.md
docs/roadmap/PR525F_FORUMS_THREE_COLUMN_HONEST_COMPOSITION_MIMIR_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
```

No category, thread, create, recognition, report, moderation, subcommunity,
Studio, Developer Space, API, schema, auth implementation, provider, retrieval,
storage, billing, deployment, package, or lockfile path changed.

## Implemented Composition

- Desktop uses a centered `210px / 720px / 260px` grid with `18px` gaps and
  `18px` page insets.
- The left rail contains real Forums home, Subcommunities, My recognition, My
  reports, and fetched-category links. It marks only Forums home current.
- The center feed uses a `24px / 700` heading and real category cards with
  normalized descriptions, returned subcommunity labels, and accepted route
  wording.
- The right rail explains only current category/subcommunity navigation and
  the existing sign-in/tier boundaries on recognition and report-status
  routes.
- Loading, error, empty, normal, long-title, long-description, standard
  category, developer-subcommunity, and Salon-subcommunity states remain
  visibly distinct and truthful.
- At narrower widths the feed comes first, context follows, the desktop rail
  disappears, and the same real route inventory remains available through one
  native `details` disclosure.

## Route And Data Truth

The index still performs one request:

```text
GET /forums/categories
```

Permanent route inventory:

```text
/forums
/forums/subcommunities
/forums/witnesses
/forums/reports
/forums/{real category slug}
```

The response order is retained. `sort_order` is not rendered as a score or
activity signal. The index contains no `button`, fake fallback category,
fabricated count, ranking/sorting control, vote arrow, generic Codex action,
hard-coded event, or default-category posting action.

## Rendered Proof

Local Chromium used synthetic public category responses only. No credential,
cookie, private identifier, hosted write, or retained private content was used.

| Viewport / state | Result |
| --- | --- |
| `1440x900`, normal | Layout is `1226px` at x `107`; tracks compute to exactly `210px / 720px / 260px`; gaps are `18px`; first card is `720px x 128px`; heading is `24px / 700`; card padding is `12px`, radius `9px`, and border `rgb(216, 210, 199)`. |
| `390x844`, normal | Feed is exactly `354px` at x `18`; desktop rail is absent; context begins after the feed; first card is `354px x 172px`; native route disclosure opens with Enter; scroll width equals `390px`. |
| `375x812`, normal | Feed is exactly `339px` at x `18`; first card is `339px x 172px`; long titles/descriptions and route actions remain contained; scroll width equals `375px`. |
| Loading | Visible `Loading forums...` status appears while the category request is pending. |
| Error | API failure appears in the warm bounded error surface; it does not become an empty category list. |
| Empty | Zero returned categories show `No forum categories yet.` without fabricated fallback data. |

All rendered scenarios reported zero page errors. Desktop and both narrow
viewports showed no document-level horizontal overflow, clipped route command,
or incoherent overlap. Desktop and mobile screenshots were inspected before
temporary proof artifacts were removed.

## Required Deviations

### Unsupported feed and sort controls

1. **Reference pattern:** Discern shows Popular/Following and Best/Hot/New/Top controls.
2. **Tex result:** The left rail and mobile disclosure contain real current routes only.
3. **Why exact import is unsafe:** The current index has no feed or ranking query behind those controls.
4. **Closest faithful treatment:** Preserve the measured rail hierarchy without rendering a no-op command.

### Fabricated vote, activity, and provenance content

1. **Reference pattern:** Discern derives vote/activity/provenance-looking copy from non-authoritative values.
2. **Tex result:** Cards render the existing marker, title, normalized description, returned subcommunity label, and real route action only.
3. **Why exact import is unsafe:** `sort_order` is not a score and the index response supplies no activity or provenance fact.
4. **Closest faithful treatment:** Preserve card density and metadata hierarchy using only returned category facts.

### Hard-coded context widgets

1. **Reference pattern:** Discern shows a hard-coded replay salon and broad posting-mode claims.
2. **Tex result:** The context rail explains current routes and their existing sign-in/tier boundaries.
3. **Why exact import is unsafe:** The index has no authoritative live-event or posting-mode response.
4. **Closest faithful treatment:** Preserve the `260px` context role with stable, truthful community orientation.

### Mobile route access

1. **Reference pattern:** Discern removes the left rail and stacks context after the feed.
2. **Tex result:** Tex matches that order and adds one compact native route disclosure before the cards.
3. **Why exact import is unsafe:** Removing the rail without a replacement would hide recognition, report, and subcommunity routes on touch devices.
4. **Closest faithful treatment:** Reuse the exact real-link inventory through keyboard/touch-operable native disclosure.

## Validation

| Check | Result |
| --- | --- |
| Focused `forum-copy.test.ts` | Pass, `7/7`. |
| `pnpm test:community` | Pass, `48/48`. |
| `pnpm test:studio-ui` | Pass, `254/254`. |
| `pnpm test:developer-spaces` | Pass, `61/61`. |
| `pnpm typecheck` | Pass, API/web `2/2`. |
| `pnpm lint` | Pass with no ESLint warning or error. |
| Local Playwright matrix | Pass for desktop, `390px`, `375px`, normal/loading/error/empty, long content, keyboard disclosure, real hrefs, geometry, overflow, and page errors. |
| `git diff --check` | Pass. |
| Changed-path scope scan | Pass; production changes are limited to the assigned index, focused CSS, and focused test. |
| High-risk secret scan | Pass; no secret-shaped added literal. |

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR implemented PR525F after DAEDALUS did not consume either wake.
- The Forums index now has the exact measured desktop/mobile composition using
  real Tex category data and routes only.
Task:
- Review desktop/mobile geometry, real-link and data truth, loading/error/empty
  states, accessibility, route/API preservation, tests, and forbidden Studio/
  backend/PR526/broad-reskin scope.
- Patch only a narrow defect; otherwise wake MIMIR with acceptance or the exact
  blocker.
```
