# PR21 Import Review Inbox - ARIADNE Rehearsal

Date: 2026-06-17
Status: opened for A4 / ARIADNE
Owner: ARIADNE human-eye review, then wake MIMIR.

## MIMIR Rerun Note - 2026-06-17

ARIADNE's first pass found a deployed staging blocker before the inbox rendered:
`GET /imports/persona/:personaId` returned 500 because the staging database was
missing `import_jobs.file_id`.

MIMIR applied the idempotent staging migrations:

- `infra/supabase/migrations/035_import_job_file_pointer.sql`
- `infra/supabase/migrations/036_import_review_candidates.sql`

MIMIR also seeded one synthetic replay import source plus two pending
import-backed candidates for the replay persona, so ARIADNE can test visible
candidate cards and actions rather than only the empty state.

Deployed API smoke after the migration/seed:

- `GET /imports/persona/:personaId`: 200
- `GET /conversations/persona/:personaId/candidates?source=import&status=pending`: 200
- pending import candidates: 2

DAEDALUS also added an API compatibility guard so owner-visible import job
status/list reads fall back to the legacy projection if a deployment is still
missing `import_jobs.file_id`. Durable file-import worker behavior still
requires the `035_import_job_file_pointer.sql` migration.

ARGUS reviewed the compatibility guard and accepts it for rehearsal rerun:
legacy projection fallback is limited to import-job reads/status updates,
chat-import creation does not retry unsafe inserts, and migrated file-import
worker behavior still depends on the durable `file_id` pointer.

Rerun the human-eye rehearsal against the same Railway web/API staging target.

## Purpose

PR21 added a visible owner-facing Import Review Inbox inside the persona Archive
page. ARGUS accepted the security and regression review. ARIADNE should now
check the human route: does this feel like a clear review stop after imports, or
does the user still feel that import candidates disappear into the backend?

## Scope

Review the existing Studio flow only. Do not redesign, reskin, or broaden the
product.

Check:

- Persona Archive page shows an Import Review Inbox in a place a human would
  notice after importing source material.
- Pending and reviewed counts are understandable.
- Memory vs Canon candidates are distinguishable.
- Source labels make sense for imported material, especially ChatGPT, Claude,
  Reddit, and Discord labels if seeded or fixture data is available.
- Accept-with-edits, reject, and reviewed states have clear affordances.
- Rejection copy or surrounding language does not imply the private archive
  source is deleted.
- Empty state explains that review items appear when Station can safely parse
  imports.
- No raw storage paths, secrets, provider keys, or private full-source dumps are
  exposed beyond owner-visible candidate text.
- Mobile width around 375px remains usable: controls do not overlap, card text
  wraps cleanly, and the sidebar/header do not hide the inbox.
- Existing Archive import/source sections remain understandable beside the new
  inbox.
- This lane did not introduce a broad UI reskin or a new workspace.

## Suggested Routes

- `/studio/personas/:personaId/files` or the current persona Archive tab/page.
- If a seeded persona with import candidates is available, use it.
- If no live/staging data has import candidates, use local/dev fixture routes or
  state that the human rehearsal is blocked on seeded import-candidate data and
  name the exact missing seed.

## Output

Wake MIMIR with:

- pass/fail verdict;
- exact pages and viewport(s) checked;
- any defects with clear reproduction notes;
- whether DAEDALUS needs a fix commit or MIMIR can mark PR21 fully closed;
- caveats about missing seed data or environment blockers.

Do not wake DAEDALUS directly unless a defect is a clear one-line mechanical UI
fix. For anything ambiguous, wake MIMIR with the decision.
