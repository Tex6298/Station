# PR467 - Global Archive Source Intake Result

Owner: DAEDALUS / A2

Date: 2026-06-29

## Summary

DAEDALUS implemented the Global Archive pasted-source intake lane.

`/studio/archive` is now a signed-in owner-wide entry point for creating a
private pasted archive source against a selected owned persona. The panel reuses
the existing `/personas`, `POST /imports/chat`, and `/imports/archive` paths.

## Files Changed

- `apps/web/components/studio/archive-library.tsx`
- `apps/web/lib/archive-search.ts`
- `apps/web/lib/archive-trust.test.ts`
- `docs/roadmap/PR467_GLOBAL_ARCHIVE_SOURCE_INTAKE_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/LANE_INDEX.md`

## Implementation

- Added a signed-in `Global Archive` source-intake panel on `/studio/archive`.
- Loaded owner personas through the existing authenticated `/personas` route.
- Submitted pasted source material through the existing `POST /imports/chat`
  contract, including persona id, source name, content, and memory weight.
- Refreshed the owner-wide archive overview after successful import without a
  page reload.
- Left file upload on the persona Archive route.
- Updated Global Archive empty/readback copy so the next action is the new
  owner-wide intake panel instead of only leaving the route.
- Kept result rows linked to existing persona Archive review routes:
  `/studio/personas/:personaId/files`.

## Guardrails

- No API route, schema, auth/session, billing, provider/model, Redis, Cloudflare,
  worker, connector, embedding/reindex, public memory, or broad UI-reskin work
  changed.
- Ownership enforcement remains in the existing API contracts: `/personas`
  returns current-user personas, `/imports/chat` checks persona ownership, and
  `/imports/archive` is owner-scoped.
- Failure copy is generic and does not include pasted source text.
- The UI states that the intake creates private owner material and does not
  publish the source.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts` | Pass | 14 tests passed, including Global Archive intake helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 144 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 19 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 43 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |

## Review Notes

ARGUS should review owner scoping, failure copy, private source text redaction,
the no-publish wording, refresh behavior, and the absence of scope drift into
connectors, file upload, workers, providers, Redis, Cloudflare, billing, or
auth/session behavior.
