# PR11 Approval Queue Entitlement Follow-Up - DAEDALUS

Status: ready for DAEDALUS implementation
Owner: DAEDALUS / A2
Reviewer: ARGUS / A3
Human rehearsal after review: ARIADNE / A4

## Why This Exists

MIMIR seeded two synthetic public-safe replay drafts so ARIADNE could rerun the
PR11 approval queue rehearsal with visible queue/no-Space states:

- `replay-approval-space-draft`: draft, Space-backed
- `replay-approval-no-space-guard`: draft, no Space

That exposed a policy mismatch before the browser rerun: PR10 made
`/studio/publish` respect `canPublishDocuments:false` for the private-tier
replay owner, but PR11 approval queue mutation routes and dashboard controls can
still let an existing owner draft enter the queue and progress toward
publication.

The approval queue must not become a side door around the Creator-or-above
publishing entitlement.

## Scope

1. Require Creator-or-above capability for approval queue mutations:
   - `POST /publishing/approvals`
   - `POST /publishing/approvals/:id/transition`
2. Keep read routes available to signed-in owners:
   - `GET /publishing/approvals`
   - `GET /publishing/approvals/:id/events`
3. Update `/studio/publishing` so queue action controls are disabled when the
   signed-in user cannot publish documents.
4. Preserve the no-Space guard:
   - no-Space drafts should still show `Space required` or equivalent;
   - Space-backed drafts on private/basic tier should show `Creator required`
     or equivalent rather than a live `Review` button.
5. Add focused tests for private-tier queue mutation rejection and UI helper or
   component behavior.
6. Do not change direct `POST /documents/:id/publish` in this follow-up unless
   ARGUS identifies it as a concrete PR11 blocker. Document it as remaining
   legacy latitude if left unchanged.

## Live Rehearsal Data

MIMIR already reset approval rows for the two synthetic draft seeds. After this
follow-up lands and deploys, ARIADNE should be able to verify:

- Space-backed synthetic draft: visible as a draft, but queue action disabled
  for the private-tier replay owner because Creator publishing entitlement is
  missing.
- No-Space synthetic draft: visible as a draft with no-Space guard copy, not a
  live queue action.
- `GET /publishing/approvals` remains `200`.
- No silent fallback to empty queue truth if approval loading fails.

## Acceptance Checks

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add any narrower test needed to cover the entitlement branch.

## Handoff

Wake ARGUS with:

- API routes changed;
- UI files changed;
- exact private-tier rejection behavior;
- no-Space guard behavior;
- validation results;
- whether direct document publish remains legacy latitude.

## MIMIR Implementation - 2026-06-17

DAEDALUS did not move after the original wakeup and a re-wake, so MIMIR
implemented the bounded follow-up directly.

Changed:

- `apps/api/src/routes/publishing-approvals.ts`
  - `POST /publishing/approvals` now requires Creator-or-above tier.
  - `POST /publishing/approvals/:id/transition` now requires Creator-or-above
    tier.
  - owner readback routes remain available to signed-in owners.
- `apps/web/components/studio/publishing-dashboard.tsx`
  - reads the signed-in session capability;
  - shows Creator-or-above queue requirement copy for private/basic users;
  - disables queue actions when `canPublishDocuments` is false.
- `apps/web/lib/publishing.ts`
  - adds `publishingQueueActionGuard` so no-Space and entitlement reasons stay
    explicit.
- Tests now cover private-tier queue mutation rejection and the guard branch.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` passed with
  9 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 12 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF warnings only.

Direct `POST /documents/:id/publish` remains legacy latitude and is not changed
in this follow-up.
