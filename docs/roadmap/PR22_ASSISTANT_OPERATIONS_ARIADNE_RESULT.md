# PR22 Station Assistant Operations - ARIADNE Result

Date: 2026-06-18
Reviewer: A4 / ARIADNE
Status: DAEDALUS UI patch required before PR22 closeout

## Verdict

ARIADNE does not accept PR22 for product-experience closure yet.

The Assistant operational model passes the rehearsal: action cards are live
links, the Assistant stays operational rather than persona-like, starter prompts
return usable guidance and cards, and the checked API/browser text did not show
storage paths, token-shaped strings, provider keys, or full private source
dumps.

The visible route still has a blocking readability defect: the global Station
visual reconciliation CSS forces the Assistant page background to the light
Station surface while the Assistant heading and lede keep dark-theme inline text
colors. That makes the first-screen title/positioning copy too low contrast on
desktop and 375px mobile.

## Environment

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Deployed web/API commit: `da60378b3c041df2a9a9e4b16416610a9cd3ef20`
- Route checked: `/studio/assistant`
- Viewports checked:
  - desktop `1440x1100`
  - mobile `375x812`
  - mobile `375x812`, scrolled to action cards

## What Passed

- `/health/deployment` was `ok:true` and `ready:true` for both web and API at
  runtime commit `da60378b3c041df2a9a9e4b16416610a9cd3ef20`.
- Signed replay owner could load `/studio/assistant` on desktop and mobile.
- The page stayed inside Studio and labeled the surface as an operational
  helper.
- Copy explicitly says the Assistant is not a persona and does not create its
  own canon or continuity.
- The starter prompt `What should I finish next?` rendered an `Intent: general`
  response and the operational-only guardrail in the browser.
- `/assistant/summary`, `/assistant/context`, and `/assistant/message` returned
  no secret-shaped strings, no storage-path-shaped strings, and no very long
  private-body dumps in the checked payloads.
- Summary action cards used exact Studio routes for:
  - failed import review: `/studio/personas/:personaId/files`
  - Integrity Session review: `/studio/personas/:personaId/calibration`
  - publishing review: `/studio/publishing`
  - private archive search: `/studio/archive`
- Action cards rendered as links, not mutation buttons.
- The only visible buttons were starter prompts and `Ask Assistant`.
- No fake mutation affordances appeared for publishing, exporting,
  Memory/Canon promotion, Integrity Session start, candidate mutation, or
  provider/tool execution.
- Status/kind chips were visible in the action cards, including failed, missing,
  draft, and archive search states.
- Desktop had no horizontal overflow.
- Mobile `375px` had no horizontal overflow; action cards wrapped within a
  `309px` card width in the scrolled action-card pass.
- Recent imports remained owner-visible status context rather than an
  Assistant mutation surface.

## Blocking UX Defect

The live page has a contrast regression caused by the global visual
reconciliation CSS.

Observed runtime styles:

- The Assistant root `main` includes inline style
  `background:#0b0e14`, but `main[style*="#0b0e14"]` in `globals.css` forces it
  to `var(--station-page-bg) !important`.
- Computed page background: `rgb(244, 243, 239)`.
- Computed `h1` color: `rgb(248, 250, 252)`.
- Computed lede color: `rgb(169, 176, 189)`.

Result:

- The first-screen `Station Assistant` title is effectively white on a light
  background.
- The explanatory lede is pale gray on the same light background.
- This affects both desktop and 375px mobile.

The action cards themselves are readable and operationally correct; the blocker
is the first-screen product-positioning copy and heading contrast.

## Required Fix

DAEDALUS should make a focused UI patch only:

- Either align `StationAssistantPanel` with the Station light surface tokens or
  isolate the Assistant route from the global dark-to-light inline-style
  override.
- Ensure the page title, lede, helper label, starter prompts, reply block,
  action cards, chips, and recent-import rows are readable on desktop and
  375px mobile.
- Preserve the existing owner-scoped Assistant API behavior.
- Preserve exact action-card links and link-only semantics.
- Do not add autonomous Assistant execution, Memory/Canon writes, publishing or
  export mutation, provider calls, backend semantics, auth changes, or broader
  reskin scope.

## Recommendation

Do not close PR22 yet. Send DAEDALUS a narrow contrast/readability repair, then
rerun ARIADNE against `/studio/assistant` at desktop and 375px mobile.
