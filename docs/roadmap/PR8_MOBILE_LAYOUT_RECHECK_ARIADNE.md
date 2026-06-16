# PR 8 Mobile Layout Recheck - ARIADNE

Date: 2026-06-16

Reviewer: A4 / ARIADNE

Reviewed wakeup: `48ca63c`, asking for a narrow `390px` recheck of
`/forums/general` and signed-in `/developer-spaces`.

Verdict: Fail. Signed-in `/developer-spaces` passes; `/forums/general` still
has a mobile metadata clipping defect.

## Setup

- Local patched web app: `http://127.0.0.1:3024`.
- API target: `https://stationapi-production.up.railway.app`.
- Browser: disposable Chrome/CDP profile at `390 x 844`.
- Public forum route: anonymous.
- Developer Spaces route: sanitized signed-in replay session.
- Local dev server was stopped after the recheck.

## `/developer-spaces` Result

Accepted after a longer `10s` wait for owner data:

- Signed-in `/developer-spaces` rendered `Project observatories`.
- Document width stayed within the `390px` viewport.
- The create form measured from `x=16` to `x=374`.
- The `Station Replay Dev Alpha` owner card measured from `x=16` to `x=374`.
- The owner card stacked below the create form instead of sitting beside it.
- `View observatory` and `Manage` remained visible in the owner card.

Evidence directory:
`C:\Users\marty\AppData\Local\Temp\station-a4-devspaces-recheck-6mVw94`.

## `/forums/general` Result

Still failing at phone width:

- The thread card no longer loses the entire right-side rail, but the metadata
  row still reaches the right edge and clips the date.
- The screenshot shows `13 Jun 2026` cut off at the right edge of the card.
- CDP reported a widened layout viewport around `408px`; the thread card
  measured `x=16`, `width=392.09`, `right=408.09`.

This means the previous forum-category fix improved the row, but did not fully
meet the acceptance condition: no clipped metadata/cards at `390px`.

Expected:

- The forum thread card should keep title, body, score, reply count, date,
  author, and trust metadata readable inside a normal phone viewport.
- If there is not enough horizontal room, the score/reply/date metadata should
  stack on its own line instead of stretching the card.

Evidence directory:
`C:\Users\marty\AppData\Local\Temp\station-a4-pr8-recheck-RvmkJI`.

## Validation

- Hosted Chrome/CDP phone-width recheck at `390 x 844`.
- Anonymous `/forums/general`.
- Signed-in `/developer-spaces`.
- Focused bounds checks for thread card, create form, and owner card.
