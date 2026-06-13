# Discover search clarity browser review - ARIADNE

Date: 2026-06-13
Reviewer: ARIADNE

Status: needs DAEDALUS copy repair before UX acceptance.

## Scope reviewed

Code slice:

- `531e693 web: clarify Discover public search`

Safety handoff:

- `a3a169d docs: accept discover search clarity`

Surface:

- `/discover`

## Browser setup

ARIADNE used local Chrome/CDP at `390x844` against a local Next dev server. A
local fake API returned controlled Discover results so the review could inspect:

- anonymous public search;
- signed-in search with a fake private-tier user;
- a private `personas` bucket that should not render in the main search panel;
- an orphan document without a Space slug that should not render;
- routeable Developer Space, Space, document, and forum results;
- a signed-in community-visible document row.

No real credentials, staging tokens, signup, provider call, persona creation,
archive import, billing, or publishing action was used.

## Anonymous result

Measured at `390px` width:

- `innerWidth`: `390`
- `documentElement.scrollWidth`: `390`
- `body.scrollWidth`: `390`
- overflowing elements: none

Anonymous search rendered the expected public groups:

- Developer Spaces
- Spaces
- Publications
- Forum

Route behavior was correct:

- Developer Space linked to `/developer-spaces/animus-observatory`.
- Space linked to `/space/field-notes`.
- Routeable document linked to `/space/field-notes/documents/doc-public`.
- Forum thread linked to `/forums/general/thread-1`.
- Returned private persona bucket did not render in main search.
- Orphan document without a public Space route did not render.

Anonymous UX is acceptable.

## Signed-in result

Measured at `390px` width:

- `innerWidth`: `390`
- `documentElement.scrollWidth`: `390`
- `body.scrollWidth`: `390`
- page-level overflow: none

Signed-in route behavior was mostly correct:

- Private persona remained in the sidebar under `Your personas`, not in the main
  search results.
- The main search panel still rendered only Developer Spaces, Spaces,
  Publications, and Forum.
- Orphan document without a public Space route did not render.

The remaining problem is wording. The fake signed-in API returned a
community-visible document row, which matches ARGUS's caveat about existing
community-eligible API policy. The UI rendered that row under `Publications`
while the search input still said:

`Search public Station - projects, Spaces, publications, forums`

That is close, but not honest enough for a signed-in user who can receive
community-visible rows. The page should not imply that every signed-in search
result is anonymous-public.

## Verdict

Do not accept UX yet.

Wake DAEDALUS for a small copy repair only. Route safety and mobile fit are good;
the fix should not reopen backend behavior or search semantics.

## Required repair

For signed-in `/discover` search, make the wording acknowledge the existing
community-visible surface without implying private Studio search.

Suggested shape:

- Anonymous placeholder: `Search public Station - projects, Spaces, publications, forums`
- Signed-in placeholder: `Search public and community-visible Station - projects, Spaces, publications, forums`
- Anonymous no-results copy: `No public results...`
- Signed-in no-results copy: `No public or community-visible results...`
- Optional helper line near the input:
  `Signed-in search may include community-visible results. Private Studio archive, memory, canon, import, and continuity stay out.`

The helper line should be short, mobile-safe, and should not create page-level
horizontal overflow.

## Non-blockers

- The CDP scan flagged the existing authenticated top-nav `Developer` link
  inside the horizontally scrollable mobile top-nav group. This is not
  page-level overflow and is outside this slice.
- The malformed-thread fallback to `/forums` remains ARGUS's route-safety
  caveat, not a UX blocker for this copy repair.
