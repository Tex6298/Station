# PR12 Archive Search Contrast Rerun - ARIADNE

Date: 2026-06-17
Status: accepted for MIMIR closeout
Owner: ARIADNE / A4
Reviewer after rerun: MIMIR / A1

## Runtime Checked

- Web health: `ok:true`, `ready:true`, runtime commit `3360ec9`.
- API health: `ok:true`, `ready:true`, runtime commit `3360ec9`.
- Services checked: `@station/web` and `@station/api` in production.

## Browser Result

The focused contrast repair is live and acceptable.

Desktop `/studio/archive`:

- Default summary loads 9 owner-only archive cards.
- Query `archive` returns 5 backend search result cards.
- Filters behave honestly with current replay data:
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
- Date, type, and title sorts visibly change ordering where data allows.
- Result cards still show title, source/date line, persona or shared/global
  label, status, summary, match reason when searching, and `Open source`.
- No horizontal overflow was detected.

Phone-width `/studio/archive`:

- Default summary loads 9 owner-only cards.
- Query `archive` returns 5 backend search result cards.
- Document filter returns 1 card.
- Header, lede, summary cards, failed stat, filters, inputs, match reason, and
  `Open source` controls are readable.
- No horizontal overflow was detected.

Unauthenticated browser:

- A fresh profile redirects `/studio/archive` to `/login?redirect=%2Fstudio%2Farchive`.
- The login screen shows sign-in copy.
- Zero archive cards render.

API sanity:

- Signed `GET /imports/archive` returned `200` with 9 items.
- Signed `GET /imports/archive/search?q=archive` returned `200` with 5 items.
- Unauthenticated `GET /imports/archive/search?q=archive` returned `401`.

## Contrast Checks

The prior readability blocker is resolved:

- Main page background: `rgb(244, 243, 239)`.
- Header text: `rgb(31, 37, 41)`.
- Lede text: `rgb(104, 112, 120)`.
- Failed summary surface: `rgb(248, 230, 227)`.
- Failed value text: `rgb(157, 60, 53)`.
- Failed label text: `rgb(127, 29, 29)`.

## Data Limitations

The replay account still lacks live rows for some filter buckets. That is not a
PR12 blocker because the empty states remain honest and owner-only.

## Recommendation

ARIADNE recommends closing PR12 for the private archive search and contrast
slice. Do not expand this closeout into vector search, workers, Cloudflare
retrieval, Redis memory truth, export bundles, or new archive source types.
