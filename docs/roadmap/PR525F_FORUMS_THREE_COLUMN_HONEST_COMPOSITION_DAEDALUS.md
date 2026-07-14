# PR525F - Forums Three-Column Honest Composition

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date opened: 2026-07-14

Status:

```text
READY_FOR_DAEDALUS_IMPLEMENTATION
```

## Locked Sources

Rendered target, measurements, data-truth deviations, and file map:

`docs/roadmap/PR525A_DISCERN_RENDERED_VISUAL_PARITY_SPECIFICATION_RESULT.md`

Accepted shared frame and terminal UI sequence:

- `docs/roadmap/PR525B_SHARED_WARM_LIGHT_FRAME_GLOBAL_NAVIGATION_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR525E_COMPACT_CHAT_VISUAL_SYSTEM_HONEST_STATES_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR526B_DISCERN_GUIDED_TASK_BOUNDARY_PREFLIGHT_CLOSEOUT_MIMIR.md`

The rendered visual target remains Discern `de7b918e`. Use its Forums
composition as a reference implementation, not a patch. Discern head
`ff93308b` does not change the Forums-index target, and PR526C-F remain parked.

## Exact Slice

PR525F corrects only `/forums`, the category index. Translate the useful
three-column community/feed/context composition into Tex Station's accepted
warm-light frame while retaining current real categories, links, safe labels,
loading/error/empty states, and route contracts.

Do not reskin category, thread, create, recognition, report, moderation, or
subcommunity destination pages in this slice. They must remain reachable and
behaviorally unchanged.

### Desktop Composition

- At `1440x900`, center a `210px / 720px / 260px` grid with `18px` column gaps
  and `18px` page insets. Do not stretch the category feed to the current
  `1108px` single column.
- Left rail: use a restrained real-link navigation headed by Forums home,
  Subcommunities, My recognition, and My reports. A Communities section may
  list the fetched categories as real links. Do not create selected state for
  a route that is not current.
- Center feed: use a `24px / 700` Forums heading, compact introduction, and
  approximately `720px x 128px` category cards with `12px` padding, `9px`
  radius, warm `1px #d8d2c7` borders, no heavy shadow, and `11px` metadata.
  Long titles, descriptions, and subcommunity labels must wrap without moving
  or clipping the `Open forum`/`Open subcommunity`/`Open Salon` route action.
- Right context rail: show only truthful Station community orientation and
  real navigation. It may explain what categories, subcommunities, private
  recognition, and report status routes actually do. It may not claim a live
  salon, posting mode, moderation power, provenance, activity, ranking, or
  membership fact that the current index response does not provide.
- Use the accepted shared warm-light tokens. The index may have structured
  panels, but no nested-card stack, gradient, dark dashboard block, oversized
  hero, decorative pill field, or broad purple treatment.

### Honest Category Content

- Keep `/forums/categories` as the only data fetch and keep its response order;
  do not add a ranking, vote, event, feed, provenance, or user-profile request.
- Use only `title`, normalized `description`, `subcommunity`, and route-safe
  category facts already returned. `sort_order` is not a public score or
  activity signal.
- Keep the current category marker without arrows or a number. Every category
  card and every visible route command must navigate somewhere real.
- Omit Discern's unsupported `Popular`/`Following`, `Best`/`Hot`/`New`/`Top`,
  fabricated vote counts, `human-led`/`active now`, generic `Threads`/`Codex`
  actions, hard-coded replay salon, and broad posting-mode claims.
- Keep loading visibly busy, API errors visible on a warm error surface, and a
  truthful empty state when no categories exist. Never render fabricated
  fallback categories or context data.

### Mobile Composition

- At `390px`, the feed uses `354px`; at `375px`, it uses `339px`, preserving
  exact `18px` page insets and no document-level horizontal overflow.
- Make the feed and heading the first content. Stack the truthful context after
  the feed; do not reserve a blank desktop rail.
- Keep every desktop route reachable through one compact, named, keyboard-safe
  mobile navigation treatment. Reusing the same route inventory in a native
  disclosure is acceptable; decorative or inert mobile controls are not.
- Target the reference card hierarchy at roughly `172px` high while allowing
  honest long content to grow. Do not clamp away the only category description
  or route command.
- Verify `390x844` and `375x812` with long category and subcommunity labels,
  keyboard navigation, touch targets, loading/error/empty states, and no
  overlap or clipped text.

## Preserved Contracts

- Preserve all hrefs, category slugs, category response typing, API client
  behavior, response order, loading lifecycle, and error handling.
- Preserve subcommunity badge and entry wording from the accepted helpers.
- Preserve signed-out public access and signed-in global navigation/session
  behavior. My recognition and My reports may lead to their existing honest
  sign-in/tier states; do not pre-empt or duplicate those gates here.
- Do not alter category/thread creation, participation, witness, recognition,
  report, delegated moderation, notification, or subcommunity behavior.
- Do not touch API, schema, auth implementation, storage, provider, retrieval,
  billing, Redis, Cloudflare, queue/worker, deployment, secrets, Studio,
  companion chat, PR526 flows, Developer Spaces, package metadata, or lockfiles.
- Do not import Discern global CSS or broaden this into an unrelated public or
  private page reskin.

## Allowed Files

```text
apps/web/app/forums/page.tsx
apps/web/app/globals.css                         focused PR525F index selectors only
apps/web/lib/forum-copy.ts                      pure truthful index copy only if needed
apps/web/lib/forum-copy.test.ts                 focused source/helper assertions
docs/roadmap/PR525F_FORUMS_THREE_COLUMN_HONEST_COMPOSITION_DAEDALUS.md
docs/roadmap/PR525F_FORUMS_THREE_COLUMN_HONEST_COMPOSITION_DAEDALUS_RESULT.md
```

No other production file is in scope without a concrete blocker committed for
MIMIR.

## Acceptance Gates

- `1440x900` computes the three desktop tracks to `210px / 720px / 260px`,
  gaps to `18px`, feed cards to the locked density, heading to `24px`, and
  warm borders/radii to the PR525A target within normal browser rounding.
- Every visible link and command has a real current href. Source/render scans
  contain no unsupported sorting, voting, ranking, activity, provenance,
  salon, posting-mode, or fabricated fallback claim.
- Normal, loading, error, empty, long-content, and subcommunity category states
  are visibly distinct and truthful.
- At `390x844` and `375x812`, the feed is first, context follows, every route
  remains keyboard/touch reachable, cards fit or grow coherently, and page
  scroll width equals viewport width.
- Existing category, thread, create, recognition, reports, moderation, and
  subcommunity routes remain unchanged and reachable.
- Focused `forum-copy` checks, `pnpm test:community`, `pnpm test:studio-ui`,
  `pnpm test:developer-spaces`, `pnpm typecheck`, and `pnpm lint` pass.
- Local Playwright proof records desktop/mobile track and card rectangles,
  computed typography/colors/borders, real href inventory, keyboard/touch
  navigation, normal/loading/error/empty states, overflow, and page errors.
- `git diff --check`, changed-path scope scan, and high-risk secret scan pass.

## Result And Handoff

Commit a PR525F result with changed-file inventory, measured desktop/mobile
geometry, visible-link inventory, state matrix, validation, and every visible
deviation in PR525A's required four-line format.

Then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR525F Forums Three-Column Honest Composition using
  real Tex categories and routes only.
Task:
- Review exact desktop/mobile composition, real-link and data truth, loading/
  error/empty states, accessibility, route/API preservation, tests, and
  forbidden Studio/backend/PR526/broad-reskin scope.
- Patch only a narrow defect; otherwise wake MIMIR with acceptance or the exact
  blocker.
```

Do not return to foreground wait without a committed result and handoff or a
committed concrete blocker for MIMIR.
