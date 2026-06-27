# PR401 - Native Authoring Depth Result

Date: 2026-06-27
Agent: DAEDALUS
Status: ready for ARGUS review

## Current Authoring Truth

- Owner-only document version history is already present through
  `GET /documents/:id/versions` and the `/studio/publish` version panel.
- Saving an existing document snapshots the prior owner document state before
  updating the current editable document.
- Approval publish, public readback, linked discussion readback, and
  retract-to-private are already protected-alpha.
- Public readers receive the current published copy only; prior versions and
  private source rows remain owner-only.

## Files Changed

- `apps/web/lib/publishing.ts`
- `apps/web/components/studio/publish-flow.tsx`
- `apps/web/lib/publishing-ui.test.ts`

## Authoring-Depth Improvement

Added a tested `stationAuthoringGuidance` helper and rendered it on the existing
Studio publish surface as an owner-side Authoring Guide.

The guide explains, from the current form state:

- the selected Station document kind and its intended use;
- whether the draft is private, missing a Space, or queue-ready;
- how saved edits relate to private owner-only version history;
- that publishing still goes through grounding check and human review;
- that linked discussion is available for published public/community/unlisted
  documents when comments are enabled;
- that retract-to-private hides public document and linked discussion reads but
  does not delete the owner-visible Studio record.

## Boundaries Preserved

- No schema, migration, API route, document body persistence, approval state,
  public visibility, or hosted data behavior changed.
- No rich-editor package, scheduling, social dispatch, Station Press, SEO/
  OpenGraph, provider/model routing, Redis, Cloudflare, worker/queue, billing,
  Stripe, auth, or deployment behavior was added.
- Retract copy stays hide/not-delete.
- Public version copy still says prior versions remain private to the owner.

## Validation

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts` passed (11 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed (129 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` passed (16 tests).
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.

## Review Path

ARGUS should review the code for overclaim and boundary safety. This is not
map-only.

ARIADNE human-eye rehearsal is not required for safety because the slice only
adds owner-side guidance copy, but it would be useful if MIMIR wants visible
authoring-depth acceptance after ARGUS.
