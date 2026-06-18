# PR22 Assistant Contrast Rerun - ARIADNE

Date: 2026-06-18
Status: accepted for MIMIR closeout
Owner: ARIADNE / A4
Reviewer after rerun: MIMIR / A1

## Runtime Checked

- Web health: `ok:true`, `ready:true`, runtime commit
  `c495e5091bbbd3dbac2ae66ffaca310f4d6ccb42`.
- API health: `ok:true`, `ready:true`, runtime commit
  `da60378b3c041df2a9a9e4b16416610a9cd3ef20`.
- Route checked: `/studio/assistant`.
- Viewports checked:
  - desktop `1440x1100`
  - mobile `375x812`
  - mobile `375x812`, scrolled to action cards

The API service did not redeploy for this web-only contrast repair. That is
acceptable for this rerun because ARGUS already accepted the sanitized Assistant
API behavior at `da60378`, and DAEDALUS changed only
`StationAssistantPanel` presentation constants in `c495e509`.

## Browser Result

The focused contrast repair is live and acceptable.

Desktop `/studio/assistant`:

- The first-screen title, lede, operational-helper label, starter prompts,
  workspace signals, reply block, action cards, chips, and recent-import rows
  are readable.
- The clicked starter prompt `What should I finish next?` rendered
  `Intent: general` and the operational-only guardrail.
- Action cards remain links, not mutation buttons.
- Visible action links include:
  - `/studio/personas/:personaId/files`
  - `/studio/personas/:personaId/calibration`
  - `/studio/publishing`
- The visible buttons remain starter prompts plus `Ask Assistant`.
- No horizontal overflow was detected.

Mobile `375px` `/studio/assistant`:

- The title and lede are readable on the first viewport.
- Starter prompts wrap cleanly.
- The textarea and `Ask Assistant` control fit the viewport.
- The scrolled action-card pass shows readable failed, missing, and draft cards.
- Action cards wrap inside a `309px` card width with no horizontal overflow.
- Recent import rows are readable.

## Contrast Checks

The prior readability blocker is resolved.

Runtime computed styles after the repair:

- Main page background: `rgb(244, 243, 239)`.
- Page text color: `rgb(31, 37, 41)`.
- `Station Assistant` title color: `rgb(31, 37, 41)`.
- Lede color: `rgb(104, 112, 120)`.

The old failure mode was white/pale dark-theme heading copy on the light Station
surface. That is no longer present on desktop or mobile.

## Safety Checks

Direct signed API sanity checks still matched the accepted PR22 posture:

- `/assistant/summary`: 4 action cards, no secret-shaped strings, no
  storage-path-shaped strings.
- `/assistant/context`: `operational_helper_not_persona`, 5 next actions, no
  secret-shaped strings, no storage-path-shaped strings.
- `/assistant/message` with `What should I finish next?`: `general` intent, 3
  action cards, operational-only guardrail, no secret-shaped strings, no
  storage-path-shaped strings.

Visible browser checks found:

- no fake mutation buttons;
- no persona drift;
- no visible storage path, bearer/JWT/provider-key shaped string, or full
  private source dump;
- no Assistant-controlled publishing, exporting, Integrity Session start,
  Memory/Canon promotion, candidate mutation, or provider/tool execution.

## Recommendation

ARIADNE recommends closing PR22 from the product-experience side.

Do not expand this closeout into autonomous Assistant behavior, provider calls,
Memory/Canon writes, publishing/export/candidate/integrity mutation, backend
semantics, auth changes, or a broader UI reskin.
