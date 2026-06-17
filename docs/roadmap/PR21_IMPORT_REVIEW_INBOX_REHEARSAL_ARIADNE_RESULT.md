# PR21 Import Review Inbox - ARIADNE rehearsal result

Date: 2026-06-17
Reviewer: A4 / ARIADNE
Status: blocked for MIMIR decision and DAEDALUS repair

## Verdict

The live human-eye rehearsal cannot accept PR21 yet.

The Import Review Inbox code is mounted in the existing persona Archive page,
but the deployed page does not reach the inbox in the replay environment. The
Archive route stops on an owner-visible error banner before Archive Trust,
Import Review, Archive Import, or Archive Import Library can render.

## Environment

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Web/API deployment commit reported by `/health/deployment`:
  `e61c801f06f64e3a6e2c3c779b8f220b296e7a17`
- Replay owner sign-in: passed; token held in memory only
- Page checked: `/studio/personas/:personaId/files` for the replay persona
- Viewports checked:
  - desktop `1440x1100`
  - mobile `375x812`

## Blocking defect

### ARCHIVE-PR21-01 - Persona Archive page cannot load import jobs

Reproduction:

1. Sign in as the replay owner.
2. Open `/studio/personas/:personaId/files`.
3. Observe the page before the new Import Review Inbox area.

Observed:

- Desktop and mobile both render a red error banner:
  `column import_jobs.file_id does not exist`
- The same failure reproduces directly through the API:
  - `GET /imports/persona/:personaId` -> HTTP 500
  - body: `{"error":"column import_jobs.file_id does not exist"}`
- The adjacent owner-scoped endpoints do respond:
  - `GET /persona-files/persona/:personaId` -> HTTP 200 with no files
  - `GET /conversations/persona/:personaId/candidates?source=import&status=all`
    -> HTTP 200 with zero candidates

Impact:

- The visible Archive page cannot reach the Import Review Inbox.
- ARIADNE cannot verify inbox placement, counts, empty state, candidate cards,
  accept-with-edits, reject, reviewed states, source labels, or mobile wrapping
  on the actual page.
- This appears to be deployed database/schema drift or a compatibility issue
  around `import_jobs.file_id`. The repo contains
  `infra/supabase/migrations/035_import_job_file_pointer.sql`, but the deployed
  API cannot select that column.

Needed before rerun:

- DAEDALUS should repair the deployed API/schema compatibility or provide
  migration proof that `import_jobs.file_id` exists where the app is running.
- MIMIR should not mark PR21 fully closed until the Archive route reaches the
  inbox in the review environment.

## Seed caveat

The replay persona currently has no import review seed:

- import sources: 0
- import jobs: 0
- import-backed candidates: 0
- pending candidates: 0
- reviewed candidates: 0

Even after the route-level blocker is fixed, ARIADNE will still need seeded
import-backed candidates to verify Memory vs Canon labels, ChatGPT/Claude/
Reddit/Discord source labels, accept-with-edits, reject-preserves-source copy,
and reviewed states. Without that seed, only the empty state can be rehearsed.

## Scope notes

- No broad UI reskin or new workspace could be assessed because the route stops
  before the Archive page content.
- No private candidate text, replay corpus text, token, cookie, provider key, or
  secret was captured in this result.
- No production import candidate was accepted, rejected, seeded, or mutated.

## Recommendation

Treat this as a blocked ARIADNE rehearsal, not an accepted product-experience
pass. MIMIR should route a DAEDALUS fix for the import-job column mismatch and
decide whether to seed a small synthetic import-candidate set for the rerun.
