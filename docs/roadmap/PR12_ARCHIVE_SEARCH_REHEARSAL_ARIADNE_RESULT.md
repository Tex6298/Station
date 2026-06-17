# PR12 Archive Search Rehearsal - ARIADNE Result

Date: 2026-06-17
Status: DAEDALUS fix required before PR12 closeout
Owner: ARIADNE / A4
Next reviewer: DAEDALUS / A2

## Runtime Checked

- Web health: `ok:true`, `ready:true`, runtime commit `2cf7b98`.
- API health: `ok:true`, `ready:true`, runtime commit `2cf7b98`.
- Services checked: `@station/web` and `@station/api` in production.

## What Passed

- Signed replay owner can load `/studio/archive` on desktop and phone width.
- Default view loads the owner-only archive summary.
- Querying `archive` visibly switches to backend search and returns matching
  private archive cards.
- Result cards include title, source/date line, persona or shared/global label,
  status, summary, match reason when searching, and `Open source`.
- No desktop or mobile horizontal overflow was detected.
- Sort by date, type, and title changes visible result ordering when data allows.
- Direct API probe confirms unauthenticated `/imports/archive/search` returns
  `401`.
- A fresh unauthenticated browser profile redirects `/studio/archive` to
  `/login?redirect=%2Fstudio%2Farchive`, shows sign-in copy, and renders zero
  archive cards.

## Browser Data Shape

Signed API/browser rehearsal used sanitized counts only:

- Default summary: 9 cards.
- Query `archive`: 5 cards.
- No-query filters:
  - Memory: 4 cards.
  - Canon: empty with owner-only empty copy.
  - Continuity: 1 card.
  - Import: 1 card.
  - Conversation: 1 card.
  - Document: 3 cards.
  - Image: empty with owner-only empty copy.
  - Data: empty with owner-only empty copy.
  - Integrity: empty with owner-only empty copy.
  - Shared/global: 2 cards.

Missing live rows for Canon, Image, Data, and Integrity are rehearsal data
limitations only; the empty states are honest and do not imply exposure or data
loss.

## Blocking UX Defect

The search mechanics are acceptable, but the live page has a contrast regression
from the global visual reconciliation CSS partially overriding the archive
component's dark inline styles.

Observed on desktop:

- `main[style*="#0b0e14"]` is forced to the light Station page background.
- The archive heading and lede remain dark-theme inline colors.
- Computed styles: `h1` is `rgb(248, 250, 252)` on a light page background
  `rgb(244, 243, 239)`; the lede is `rgb(169, 176, 189)` on the same light
  background.

Observed on phone width:

- The search and card flow works, but the `Failed` summary card has dark text on
  a dark panel, making the count and label hard to read.

This is a readability/blocking UX issue, not a privacy or backend search issue.

## Required Fix

DAEDALUS should make a focused UI patch only:

- Align `ArchiveLibrary` with the Station light surface tokens or isolate it
  from the global `[style*="..."]` override rules.
- Replace dark inline header/lede/summary-card colors with `var(--station-page-*)`
  tokens or existing Station page classes.
- Ensure the failed summary card has readable text and an honest warning tone on
  both desktop and phone width.
- Preserve the current owner-scoped search route, filter behavior, sort behavior,
  result shape, auth behavior, and empty-state copy.

## Recommendation

Do not close PR12 yet. Wake DAEDALUS for the focused contrast repair. After that
patch is deployed, ARIADNE should rerun the `/studio/archive` desktop and phone
width visual pass and then wake MIMIR with the closeout recommendation if clean.
