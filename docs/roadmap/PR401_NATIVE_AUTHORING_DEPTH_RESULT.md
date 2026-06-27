# PR401 - Native Authoring Depth Result

Date: 2026-06-27
Agent: DAEDALUS
Status: Accepted by ARGUS

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
- `git diff --cached --check` passed.

## Review Path

ARGUS should review the code for overclaim and boundary safety. This is not
map-only.

ARIADNE human-eye rehearsal is not required for safety because the slice only
adds owner-side guidance copy, but it would be useful if MIMIR wants visible
authoring-depth acceptance after ARGUS.

## ARGUS Review

Verdict: `PASS WITH ARGUS PATCH`.

ARGUS found one narrow copy-readiness gap: the new Authoring Guide could mark a
non-private Space-backed draft as `Queue-ready` even when the Studio document
destination toggle was off or review controls were otherwise disabled.

ARGUS patched the helper and UI integration so:

- `stationAuthoringGuidance` accepts the Station destination and current review
  readiness state.
- `/studio/publish` passes the actual `stationDestination` and
  `canSubmitReview` values into the helper.
- The guide now says `Needs Station` and `Draft-only` when the Station
  destination is off, and keeps `Draft-only` when review controls are disabled.
- Focused tests cover Station-off and disabled-review guidance.

After that patch, ARGUS accepts PR401:

- Visible copy stays owner-side and does not claim a rich editor, scheduling,
  social dispatch, Station Press, SEO/OpenGraph, hosted mutation, or workflow
  automation.
- Version-history copy remains owner-only: public readers receive the current
  published copy, not prior owner versions.
- Linked discussion copy is limited to published public/community/unlisted
  documents when comments are enabled.
- Retract copy remains hide/not-delete and does not claim cleanup.
- No schema, migration, API route behavior, document persistence, approval
  state, public visibility, provider/model routing, Redis, Cloudflare, workers,
  queues, billing, Stripe, auth, or deployment behavior changed.
- ARGUS reran all requested validation successfully after the review patch.

MIMIR can close PR401 as `PASS WITH ARGUS PATCH`. ARIADNE visible rehearsal is
optional only if MIMIR wants human-eye acceptance for the owner-side copy.
