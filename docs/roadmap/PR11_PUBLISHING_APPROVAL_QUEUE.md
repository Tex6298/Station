# PR11 - Publishing Approval Queue

Status: ready for DAEDALUS implementation
Owner: DAEDALUS / A2
Reviewer: ARGUS / A3
Human rehearsal: ARIADNE / A4 only after ARGUS accepts the code slice

## Why This Is Next

PR10 made `/studio/publish` and `/studio/publishing` live-backed through the
document API. The next launch-core finish item is the Station publishing
approval queue.

This PR should make publishing explicit, reviewable, and provenance-aware
without implementing background workers or external social dispatch.

## Scope

1. Add a server-side approval queue model for Station documents.
2. Support the state path:
   - `draft`
   - `grounding_check`
   - `human_review`
   - `approved`
   - `regenerate`
   - `cancelled`
   - `scheduled`
   - `published`
   - `archived`
3. Add durable storage for queue items and document review/provenance events.
4. Add API routes or route extensions for:
   - enqueueing a draft for review;
   - advancing to grounding/human-review states;
   - approving, requesting regeneration, cancelling, scheduling, publishing,
     and archiving;
   - listing owner-scoped queue items.
5. Keep public publication an explicit owner action.
6. Keep private source material private; publication should point to a public
   document copy/reference rather than exposing private archive/canon/memory
   sources.
7. Surface the current approval state in `/studio/publishing` and the publish
   flow where narrowly useful.

## Out Of Scope

- BullMQ/Redis worker execution.
- Social connector dispatch.
- Actual scheduled job execution.
- Large visual redesign.
- Creator-account staging setup for the PR10 positive browser proof.

## Implementation Notes

- Prefer a narrow service such as
  `apps/api/src/services/publishing-approval.service.ts`.
- Add migrations only for durable approval/provenance tables needed by this
  lane.
- Use existing document ownership checks and visibility semantics.
- Keep direct `POST /documents/:id/publish` behavior compatible unless ARGUS
  finds a concrete policy hole.
- If a state transition is not implemented yet, it must be visibly unavailable
  rather than pretend-live.

## Acceptance Checks

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run test:continuity-publication
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
```

Add focused approval-queue tests covering owner scoping, invalid transitions,
private source safety, and publish visibility.

## Handoff

When complete, wake ARGUS with:

- migrations/tables added;
- route/service files changed;
- state transitions implemented;
- intentionally deferred states or controls;
- validation command results;
- any visibility/provenance risk needing hostile review.
