# PR399 - Station Assistant Action Map Refresh Result

Owner: A2 / DAEDALUS
Status: Accepted by ARGUS
Completed: 2026-06-27

## Summary

PR399 found one stale/weak guidance area: Station Assistant still framed
publishing as generic human review and provenance work, but did not name the
now-proved publish-and-retract contract from PR397/PR398.

The current Assistant routes were otherwise already real and owner-scoped:

- `/assistant/summary` and `/assistant/message` require auth.
- Archive/import actions route to `/studio/archive` or persona file review.
- Publishing actions route to `/studio/publishing` or `/studio/publish`.
- Continuity/integrity actions route to persona calibration/file review.
- Export actions route to `/studio/export`.
- Quota/storage guidance routes to `/settings`.
- Assistant remains operational guidance, not a persona or autonomous executor.

## Changes

Changed files:

- `apps/api/src/services/station-assistant.service.ts`
- `apps/api/src/services/station-assistant.service.test.ts`
- `apps/web/components/studio/station-assistant-panel.tsx`

Action-map behavior after the patch:

- Publishing draft actions now tell owners to use approval publish, public
  document readback, linked discussion readback, and retract-to-private.
- Publishing intent replies now say to review visibility/provenance, publish
  only after owner review, confirm public document and linked discussion
  readback, then retract to private if needed.
- Assistant guardrails now explicitly say it does not autonomously execute
  actions and must not frame retract as cleanup or deletion.
- The Studio Assistant panel starter prompt and visible nudge now mention
  publish-and-retract, linked discussion readback, and hide-not-delete.

## Preserved Boundaries

No provider/model calls, autonomous Assistant execution, hosted public mutation,
hard-delete cleanup, Station Press, social dispatch, scheduling, rich text,
billing mutation, Redis, Cloudflare, workers, queues, schema, or migrations were
opened.

Station Assistant still guides owners to real surfaces. It does not publish,
retract, delete, create Spaces, change visibility, run imports, or change
billing automatically.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:assistant` | Pass | 9 tests passed, including publish/retract Assistant copy. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 127 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript check passed. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization warnings only. |

## ARGUS Review

Verdict: `PASS`.

ARGUS accepts PR399 as a narrow Station Assistant action-map refresh:

- Assistant guidance remains operational and owner-controlled. It does not
  claim autonomous publishing, retraction, import, billing, Space creation, or
  visibility changes.
- Publishing guidance now names the proved approval-publish -> public readback
  -> linked discussion readback -> retract-to-private path without calling
  retraction cleanup or deletion.
- Action routes still land on real owner surfaces: `/studio/publishing`,
  `/studio/publish`, archive/persona file review, continuity/integrity,
  `/studio/export`, and `/settings`.
- Public/private/provenance boundaries remain clear: private archive/source
  material stays private, public readback is owner-reviewed, and Assistant is
  not a persona or autonomous executor.
- Scope stayed closed: no provider/model calls, hosted mutation, hard-delete
  cleanup, Station Press, social, scheduling, rich text, billing mutation,
  Redis, Cloudflare, workers, queues, schema, or migrations.
- ARGUS reran the requested validation successfully.

MIMIR can close PR399 as `PASS` and choose the next roadmap move from fresh
replay evidence or explicit product priority.
