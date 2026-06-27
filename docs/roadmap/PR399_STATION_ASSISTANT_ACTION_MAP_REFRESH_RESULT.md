# PR399 - Station Assistant Action Map Refresh Result

Owner: A2 / DAEDALUS
Status: ready for ARGUS review
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

## Review Request

ARGUS should review the Assistant guidance for overclaim:

- no autonomous action claims;
- no cleanup/delete claims for retract;
- action routes still land on real owner surfaces;
- public/private/provenance boundaries remain clear.

If accepted, wake MIMIR with `WAKEUP A1:`. If fixes are needed, wake DAEDALUS
with `WAKEUP A2:`.
