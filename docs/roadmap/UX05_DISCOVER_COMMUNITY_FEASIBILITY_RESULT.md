# UX-05 Discover And Community Browsing Feasibility Result

Owner: DAEDALUS
Reviewer: MIMIR
Status: COMPLETE - WAKE MIMIR
Completed: 2026-06-27

## Verdict

Current `main` does not need a broad UX-05 implementation slice before the next
roadmap lane.

Discover, public search, public Space routing, public document routing, and the
forum browsing chain already have accepted implementation and hosted evidence
from PR336 through PR406. The useful work now is not another public browsing
rewrite; it is either:

- proceed to the next roadmap lane, recommended; or
- request one optional evidence-only forum action rehearsal if MIMIR wants fresh
  signed-in proof for report, vote, reply, watch, and moderation action states.

## Current Route And Component Map

- `/` renders `apps/web/components/discover/public-home.tsx`.
  - Loads `/discover/feed?tab=new&limit=30`.
  - Shows public sections for Developer Spaces, publications, public Spaces, and
    community discussion.
  - Uses `SearchResultsDropdown` for public search.
- `/discover` renders `apps/web/components/discover/discover-front-door.tsx`.
  - Loads `/discover/feed?tab={new|rising|featured}&limit=30`.
  - Uses `DISCOVER_FEED_FILTERS` from `discover-feed-controls.ts`.
  - Searches through `/discover/search?q=...`.
  - Shows public Space highlights through `discoverPublicSpaceHighlights`.
- `/forums` renders `apps/web/app/forums/page.tsx`.
  - Loads `/forums/categories`.
  - Links to category pages, witness, subcommunity, and report surfaces.
- `/forums/[categorySlug]` renders `apps/web/app/forums/[categorySlug]/page.tsx`.
  - Loads `/forums/categories/:slug?sort=...&search=...`.
  - Supports live category search, `active` / `hot` / `new` sorting, thread
    voting where eligible, and new-thread routing where eligible.
- `/forums/[categorySlug]/[threadId]` renders
  `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`.
  - Loads `/threads/:threadId`, `/comments`, and moderation action readback.
  - Supports eligible reply, vote, report, watch, witness, and moderation
    controls.
- `/space/[slug]` renders `apps/web/app/space/[slug]/page.tsx`.
  - Serves public Space microsites, public owner/public access, documents,
    personas, and library sections.
- `/space/[slug]/documents/[documentId]` renders
  `apps/web/app/space/[slug]/documents/[documentId]/page.tsx`.
  - Serves public document readback, trust/provenance copy, linked discussion
    entrypoints, and owner-only edit/publish controls.
- `apps/api/src/routes/discover.ts` owns public feed and search visibility.
- `apps/api/src/routes/forums.ts`, `comments.ts`, and `reports.ts` own forum
  read paths and signed-in write/moderation/report actions.

## Evidence To Keep

- PR336 / PR337: Discover browsing controls and hosted rehearsal are accepted.
  Current `/discover` still has tabs, filter counts, empty/recovery copy, search,
  public Space cards, and route-safe card links.
- PR338 / PR339 / PR340 / PR341: forum category and thread detail clarity are
  accepted. The original hosted thread-detail category/status caveat is closed.
- PR374 / PR376 / PR377: Discover public Space routeability is accepted.
  Current `/discover` can show public Space cards in the initial feed and route
  to `/space/:slug` with safe-slug filtering.
- PR405 / PR406: public search result labels and hosted label rehearsal are
  accepted. Current public search groups still ignore owner-only result buckets
  and keep public/community-visible labels in result readback.
- Community hardening and report persistence remain relevant: forum, comments,
  document discussions, Discover, and reports now have tests around visibility
  and signed-in scoping.

## Stale Assumptions

- Older Discern notes that treated `/discover` search copy as unclear are stale.
  PR405 and PR406 added public/community-visible labeling and hosted proof.
- Older forum hosted caveats about missing thread detail category/status labels
  are stale. PR340 and PR341 closed that exact visible gap.
- Older assumptions that public Space routes were only indirect or hidden behind
  the Spaces filter are stale. PR374, PR376, and PR377 made and proved initial
  public Space routeability.
- Any direction to import Discern code, add a left-rail directory, or add fake
  fallback content is stale for Station. Discern remains product direction only.
- Staff-pick writing controls from PR336 are disabled/preview-only outside the
  live Discover feed. The `/discover` `Staff picks` tab is still a live featured
  feed request and can honestly render empty if no curated rows qualify.

## Control Classification

Live:

- Public home sections sourced from `/discover/feed`.
- Public home search dropdown and route-safe public result grouping.
- `/discover` `Latest`, `Rising`, and `Staff picks` tab state.
- `/discover` filter chips, counts, local filtering, empty state, and recovery
  control over the loaded feed.
- `/discover` debounced search through `/discover/search`.
- Public/community-visible search labels for documents, threads, personas,
  public Spaces, Developer Spaces, salons, and projects.
- Public Space cards and public Space rail route through safe `/space/:slug`
  hrefs.
- Forum category list, category search, and `active` / `hot` / `new` sorting.
- Thread list votes for eligible signed-in viewers.
- Thread detail reply, vote, report, watch, witness, and moderation controls
  where the route exposes eligibility.
- Report submission through `/reports`, with server-side reporter scoping.
- Public document to linked discussion routeability where linked discussion data
  exists.

Disabled or preview-only:

- Writing staff-pick authoring controls remain disabled/preview-only. This does
  not make the `/discover` `Staff picks` tab a placeholder.
- Forum write actions are intentionally unavailable to signed-out users and
  below-tier users; the current UI presents copy rather than dead controls.
- Moderation controls are only rendered when route readback exposes supported
  actions for the viewer.

Broken:

- No confirmed broken UX-05 route or control was found in this pass.

Fragile or worth hostile review if touched:

- `searchHref("threads", ...)` falls back to `/forums` for malformed or
  incomplete thread results. This is safer than emitting a bad thread URL, but
  a future search-routing slice should decide whether fallback results should
  be hidden instead.
- Discover feed filters are local filters over already loaded feed items, not
  backend-wide filters. The copy/status should continue to avoid implying a
  global corpus search.
- Discover feed document cards can show public provenance/source-label readback.
  Public search now uses a stricter allowlist; if feed provenance labels are
  changed, ARGUS should re-check publicness.
- PR341's hosted proof closed the category/status issue but did not prove every
  data-specific kind/visibility chip because the hosted fixture lacked those
  labels.
- Signed-in forum action panels have code-level route coverage, but the most
  recent UX-05 hosted evidence focused on browsing labels rather than the whole
  signed-in action matrix.

## Privacy And Visibility Risks

- Public search rendering must keep ignoring owner-only result buckets returned
  for signed-in owners.
- Public and community-visible labels should remain explicit; signed-in search
  should not blur public browsing with owner Studio results.
- Public Space cards must continue to reject UUID-like or unsafe slugs before
  routing.
- Forum read paths should keep public/community visibility separate from
  private Studio document, memory, archive, canon, import, and continuity
  surfaces.
- Moderation/report controls should stay tied to API-supported viewer actions,
  not inferred from UI state alone.

## Recommendation

No UX-05 implementation slice should open by default.

Recommended next move: MIMIR should close this feasibility pass and choose the
next roadmap lane, likely UX-06 if that remains the next unresolved UI/product
thread.

Optional evidence-only fallback: if MIMIR wants one more UX-05 artifact before
moving on, open `UX-05A Forum Action Matrix Rehearsal` for ARIADNE/ARGUS. Scope
it to read-only hosted or local proof of signed-out, signed-in eligible, and
below-tier states for reply, vote, report, watch, witness, and moderation
controls. Do not ask DAEDALUS for implementation unless that rehearsal finds a
specific defect.

## ARGUS Gates If A UX-05 Slice Is Opened

- If Discover/search changes: run search dropdown tests, community tests,
  Developer Spaces tests, web/API typecheck, lint, and a hostile check that
  owner-only search buckets are never routeable in public groups.
- If forum action controls change: run community, reports, auth, and any
  community notification/witness/moderation helper tests; review signed-out,
  below-tier, author, moderator, and admin states.
- If public Space or document routes change: run spaces, document discussions,
  continuity publication, community, typecheck, and lint; review public,
  unlisted, community, owner-only, and unsafe-slug cases.
- If provenance/source labels change: review all public feed/search serializers
  for bounded public fields before accepting visible copy.

## ARIADNE Rehearsal Points If Requested

- `/` at desktop, 390px, and 375px: public search, public sections, no overflow.
- `/discover` at desktop, 390px, and 375px: tabs, filters, search results,
  empty states, public Space rail, and route clicks.
- `/forums`: category cards, status copy, and navigation clarity.
- `/forums/[categorySlug]`: category search, sort, eligible and ineligible
  thread actions, and empty state.
- `/forums/[categorySlug]/[threadId]`: signed-out copy, signed-in reply/vote/
  report/watch controls, moderation panels when available, and no overflow.
- `/space/[slug]` and `/space/[slug]/documents/[documentId]`: public Space,
  public document, linked discussion, and owner-only control separation.

## Validation

Docs-only pass. No product code changed.

| Command / check | Result | Notes |
| --- | --- | --- |
| Current route/code scan | Pass | Reviewed Discover, search, forum, comments, reports, public Space, and public document surfaces against current `main`. |
| Historical evidence reconciliation | Pass | PR336 through PR406 UX-05 evidence remains useful; older Discern assumptions are direction only or stale. |
| `git diff --check` | Pass | Passed with CRLF normalization warnings only. |
| Added-line sensitive-pattern scan | Pass | No matches; command emitted CRLF normalization warnings only. |

## Handoff

Wake MIMIR. Recommended decision: close UX-05 feasibility with no implementation
slice and move to the next roadmap lane. Optional decision: request only the
forum action matrix rehearsal if MIMIR wants fresh visible proof for signed-in
action states before moving on.
