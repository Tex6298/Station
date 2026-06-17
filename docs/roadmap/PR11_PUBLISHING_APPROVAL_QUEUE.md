# PR11 - Publishing Approval Queue

Status: accepted by ARGUS for MIMIR sequencing
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

## DAEDALUS Implementation Notes

Implemented on 2026-06-17:

- Added `infra/supabase/migrations/034_publishing_approval_queue.sql` with
  durable `publishing_approval_items` and `publishing_approval_events` tables.
- Added `apps/api/src/services/publishing-approval.service.ts` and
  `apps/api/src/routes/publishing-approvals.ts`, mounted at
  `/publishing/approvals`.
- Implemented owner-scoped list/enqueue/event reads and state transitions for
  `draft -> grounding_check -> human_review -> approved/regenerate/cancelled`
  plus `approved/scheduled -> published` and archive/cancel paths. Scheduling
  records `scheduled_for`, but execution remains deferred to the worker lane.
- Kept direct `POST /documents/:id/publish` compatible. The approval queue
  publish transition updates the owner document to `published` with public,
  community, or unlisted visibility.
- Updated Studio publish flow to save the draft and send it into the approval
  queue instead of pretending dispatch/workers exist.
- Updated Studio publishing dashboard to show approval state and expose narrow
  owner actions for review, approval, publish, regenerate, cancel, and queue
  archive. Schedule remains visibly deferred.

Validation:

- `npm exec --yes pnpm@10.32.1 -- install` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with the known warning
  inventory.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` passed
  5 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:continuity-publication` passed
  1 test.
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` passed
  1 test.
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed 8 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed 11 tests.
- `npm exec --yes pnpm@10.32.1 -- run build` compiled, lint/type checked,
  and generated pages, then hit the already documented Windows Next standalone
  symlink `EPERM` caveat.

ARGUS review focus:

- Hostile-review owner scoping across queue items, events, and document publish
  transitions.
- Confirm private-source safety: queue responses intentionally expose provenance
  labels but not private document bodies or raw source IDs.
- Confirm whether direct API publish-without-Space remains an accepted policy
  caveat for this lane.

## DAEDALUS Blocker Repair

Repaired on 2026-06-17 after ARGUS review:

- Added RLS and owner-scoped policies for `publishing_approval_items` and
  `publishing_approval_events` in migration `034`.
- Enforced Space-backed drafts at approval enqueue and Space-backed documents
  before scheduled/published transitions in the API service.
- Disabled queue actions in `/studio/publishing` for no-Space drafts with an
  explicit `Space required` control.
- Added focused tests for no-Space enqueue/publish rejection and migration RLS
  policy expectations.

Repair validation:

- `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` passed
  7 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:continuity-publication` passed
  1 test.
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` passed
  1 test.
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed 8 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed 11 tests.

## ARGUS Review - 2026-06-17

Result: blocked before ARIADNE or MIMIR acceptance.

Validation rerun by ARGUS:

- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals`
- `npm exec --yes pnpm@10.32.1 -- run test:continuity-publication`
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions`
- `npm exec --yes pnpm@10.32.1 -- run test:community`
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`
- `git diff abc3b3d..503fa84 --check`
- `git diff --check`

All passed locally, with CRLF warnings only for consumed agent state.

Blockers:

1. Migration `034_publishing_approval_queue.sql` creates owner-scoped approval
   tables without `alter table ... enable row level security` or owner policies.
   This differs from the repo pattern for private owner tables and leaves the
   durable queue relying only on API discipline.
2. `/studio/publishing` can enqueue and publish any owner draft through the new
   queue controls, including documents with no `space_id`. That recreates a
   published-no-public-Space-route path inside PR11, even though PR10 tightened
   `/studio/publish` to require a Space before submission.

Required follow-up:

- Add RLS and owner-scoped policies for `publishing_approval_items` and
  `publishing_approval_events`.
- Enforce Space-backed queue publication in the API service, not only in the
  Studio publish form. A no-Space document should not enqueue/publish through
  the approval queue unless MIMIR explicitly changes the product policy.
- Hide or disable queue actions in `/studio/publishing` for no-Space drafts with
  clear copy instead of letting the owner create a queue item that cannot produce
  a routable public document.
- Add focused tests for the no-Space rejection path and the RLS/policy migration
  expectations.

## ARGUS Repair Review - 2026-06-17

Result: accepted for MIMIR sequencing.

The two ARGUS blockers are cleared:

- Migration `034_publishing_approval_queue.sql` now enables RLS on
  `publishing_approval_items` and `publishing_approval_events`.
- The migration now adds owner policies for approval item access and approval
  event select/insert.
- The API rejects no-Space drafts at approval enqueue.
- The API rejects scheduled/published queue transitions when the document is not
  Space-backed.
- `/studio/publishing` disables queue actions for no-Space drafts with explicit
  `Space required` copy.
- Focused tests now cover no-Space enqueue/publish rejection and migration
  RLS/policy expectations.

ARGUS reran:

- `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run test:continuity-publication`
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions`
- `npm exec --yes pnpm@10.32.1 -- run test:community`
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`
- `git diff aeb63db..2797520 --check`
- `git diff --check`

All passed locally. Minor future hardening note: the new RLS policies are
owner-column policies; a later DB-hardening pass could also validate child rows
against their parent approval/document ownership. That is not a PR11 blocker
because the Express service enforces the parent ownership path and the policies
prevent cross-owner queue reads.
