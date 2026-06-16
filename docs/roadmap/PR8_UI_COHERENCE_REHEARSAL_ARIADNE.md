# PR 8 UI Coherence Rehearsal - ARIADNE

Date: 2026-06-16

Reviewer: A4 / ARIADNE

Reviewed wakeup: `b43285a`, asking for desktop and `390px` mobile human-eye
route rehearsal across the PR 8 route set.

Verdict: Fail with two narrow mobile layout defects. Wake DAEDALUS.

## Setup

- Local patched web app: `http://127.0.0.1:3023`.
- API target: `https://stationapi-production.up.railway.app`.
- Browser: disposable Chrome/CDP profile with anonymous public routes and a
  sanitized signed-in replay session for owner routes.
- Seeded routes:
  - Space: `station-replay-alpha`.
  - Document: `450e0e9f-530b-4434-af64-b83b25beb959`.
  - Forum thread: `4c1365f9-04d0-4a7c-9bdb-7ab678ce4712`.
  - Developer Space: `station-replay-dev-alpha`.
  - Persona: `7944d8be-6b1d-49d9-b3b9-7e438810b414`.

The local dev server was stopped after the rehearsal.

## Coverage

Captured 46 desktop/mobile route screenshots and DOM metrics:

- Anonymous desktop/mobile: `/`, `/discover`, `/writing`, `/forums`,
  `/forums/general`, `/forums/general/:threadId`, `/space/:slug`,
  `/space/:slug/documents/:documentId`, `/developer-spaces`, and
  `/developer-spaces/:slug`.
- Signed-in desktop/mobile: `/space`, `/developer-spaces`,
  `/developer-spaces/:slug`, `/developer-spaces/:slug/manage`, `/studio`,
  `/studio/personas/:personaId`, `/studio/personas/:personaId/continuity`,
  `/studio/personas/:personaId/memory`,
  `/studio/personas/:personaId/files`, `/studio/publishing`, `/billing`,
  `/settings`, and the signed-in forum thread.

Screenshot/metrics directory:
`C:\Users\marty\AppData\Local\Temp\station-a4-pr8-bxdEIc`.

Focused Developer Space manage recheck:
`C:\Users\marty\AppData\Local\Temp\station-a4-manage-lZ2Gdq`.

## Accepted

- Desktop route pass found no app error, route-level collision, or
  document-level horizontal overflow across the covered routes.
- `/writing` uses the shared Station page treatment; tabs and chips remain
  enabled and stateful. The mobile chip rail can scroll inside the control area
  and did not create document-level overflow.
- `/billing` and `/settings` read as calm account pages; settings placeholder
  controls remain honestly unavailable, and token-credit `Buy` buttons are
  wired to checkout rather than no-ops.
- `/studio/publishing` keeps tab controls live and labels `Publish`, `Retry`,
  `View`, and `Delete` as unavailable/disabled.
- Public Space, public document, and the document discussion thread render with
  no observed discussion-route error. The `test:document-discussions` timeout
  remains validation debt unless DAEDALUS/ARGUS connect it to a separate test
  harness issue.
- `/developer-spaces/:slug/manage` was initially captured too early while
  loading. A focused `12s` recheck rendered the management console on mobile
  with no document-level overflow, so ARIADNE does not count manage as a
  defect.

## Defects

### 1. `/forums/general` mobile thread card clips right-side metadata

Route: `/forums/general`, anonymous, `390 x 844`.

Observed:

- The thread card extends past the visible phone viewport.
- The right-side score/reply/date metadata is clipped; the screenshot shows
  only the start of the reply count at the far right edge.
- CDP reported a widened layout viewport around `459px`, which matches the
  visual clipping.

Expected:

- Thread cards should stay within the `390px` viewport.
- The score/reply/date metadata should stack under the title/body or otherwise
  wrap without pushing the card wider than the screen.

Implementation clue:

- `apps/web/app/forums/[categorySlug]/page.tsx` keeps the thread title/body and
  right-side metadata in one flex row, with the metadata column set to
  `flexShrink: 0`. That row needs a mobile stack/wrap path.

### 2. Signed-in `/developer-spaces` mobile owner index clips the project card

Route: `/developer-spaces`, signed in, `390 x 844`.

Observed:

- The create form and existing Developer Space card remain side by side on a
  phone-width viewport.
- The existing `Station Replay Dev Alpha` card is clipped on the right instead
  of stacking below the create form.
- CDP reported a widened layout viewport around `476px`, matching the visual
  clipping.

Expected:

- The create form and owner-space cards should stack in one readable column on
  mobile.
- The `View observatory` and `Manage` actions should remain visible without
  horizontal clipping.

Implementation clue:

- `apps/web/app/developer-spaces/page.tsx` uses `className="grid grid-2"` for
  the signed-in create/list layout. The global `.grid-2` still uses a fixed
  `280px 1fr` grid and does not collapse for this mobile route. Use the
  responsive Station primitive or add a focused responsive stack.

## Validation

- Hosted Chrome/CDP route rehearsal against local PR 8 web and Railway API.
- Desktop viewport: `1366 x 900`.
- Mobile viewport: `390 x 844`.
- Direct seeded API route discovery for persona, Space, forum thread, and
  Developer Space IDs.
- Focused longer-wait Developer Space manage recheck.
