# PR21 Import Review Inbox - Accept Repair

Status: opened for A2 / DAEDALUS
Opened: 2026-06-17
Owner: DAEDALUS repair, ARGUS review if code changes are non-trivial, ARIADNE rerun after repair.

## Why this exists

ARIADNE's seeded Railway rerun proved the Import Review Inbox is visible and
mostly usable, but accept-with-edits still blocks PR21 closeout.

Observed on live staging:

- Page: `/studio/personas/:personaId/files`
- Viewports: desktop `1440x1100`, mobile `375x812`
- Rejecting the seeded Canon import candidate worked.
- Accept-with-edits on the seeded Memory import candidate failed.
- Browser preflight for `PATCH /conversations/candidates/:candidateId` returned
  HTTP `204`.
- The actual PATCH returned Railway fallback HTTP `502`.
- Chrome reported `MissingAllowOriginHeader`.
- The UI showed `Failed to fetch`.
- After the PATCH attempt, `/health/deployment` and candidate listing also
  returned Railway `502`.

## DAEDALUS task

Repair the import-backed Memory accept-with-edits path so the deployed API stays
healthy and the user can complete the review action from the browser.

Stay narrow:

- Do not redesign the review inbox.
- Do not open workers, Cloudflare, Redis/vector memory work, live Reddit/Discord
  pulls, billing, publishing, or a UI reskin.
- Preserve archived-chat candidate behavior.
- Preserve owner scoping on candidate reads and accept/reject actions.
- Preserve private archive source material; accepted Memory/Canon may point back
  to source provenance without dumping raw private source text into public
  surfaces.

## Required investigation

Before patching, identify which layer is failing:

- route handler or repository error in `PATCH /conversations/candidates/:id`;
- schema/projection mismatch on import-backed candidate accept;
- CORS/error middleware only hiding a real API crash;
- Railway deployment health crash after the accept attempt;
- exhausted or stale seeded candidate state.

If the Canon seed is already rejected, reset or add a fresh synthetic replay
candidate pair as needed so ARIADNE can rerun both accept and reject without
asking Marty for manual setup.

## Acceptance proof

DAEDALUS should provide:

- focused local regression for import-backed Memory accept-with-edits;
- existing candidate reject/archived-chat regression still passing;
- deployed or deploy-ready smoke proof that:
  - `PATCH /conversations/candidates/:candidateId` succeeds for an import-backed
    Memory candidate;
  - the candidate moves to a reviewed/accepted state;
  - `/health/deployment` remains healthy after the action;
  - candidate listing still returns normally after the action;
- seed status for ARIADNE: exact replay persona/candidate state, sanitized.

## Handoff

After repair, wake ARGUS if code safety changed beyond a tiny obvious fix.
Otherwise wake ARIADNE directly for the same human-eye rerun:

- Archive page visibility;
- import candidate cards;
- accept-with-edits;
- reject;
- reviewed states;
- no raw paths, secrets, or private source dumps;
- mobile usability.
