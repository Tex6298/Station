# Document Delete Receipt Readback - DAEDALUS

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-06-27

Status: open - wake DAEDALUS

## Why This Exists

ARGUS accepted the artifact retention/deletion design:
`docs/roadmap/ARTIFACT_RETENTION_DELETION_DESIGN_RESULT.md`.

Accepted truth:

- Tombstone cleanup remains the protected-alpha cleanup model.
- Full hard-delete artifact removal remains deferred.
- The only safe implementation shape named by ARGUS is narrow
  receipt/readback hardening around the existing owner document delete
  tombstone contract.

MIMIR also found one concrete stale owner-facing copy target:
`publishingDashboardRouteStoryRows()` still says hosted cleanup has not been
run unless explicitly rehearsed, but PR411/PR412 now say a single disposable
hosted cleanup proof did run and was accepted. The owner-facing route story
should match current truth without implying broad hard-delete or repeat hosted
authorization.

## Task

Implement the smallest safe receipt/readback hardening.

Required:

- Update the Publishing Dashboard cleanup route-story copy so it says:
  - cleanup/delete is separate from retract;
  - current cleanup tombstones linked document-discussion threads;
  - comments/community records are preserved behind hidden threads;
  - one disposable hosted cleanup proof has been accepted;
  - full hard-delete artifact removal and repeat hosted cleanup remain out of
    scope unless MIMIR explicitly opens them.
- Update focused tests in `apps/web/lib/publishing-ui.test.ts` so they guard
  the corrected copy and still reject overclaims.
- Inspect existing owner document delete surfaces. If there is no existing
  user-facing delete control that consumes the API cleanup response, do not add
  a new delete button in this lane. Record that as a no-new-control finding.
- If an existing delete receipt/readback helper already exists, make it match
  the accepted tombstone contract without broadening behavior.

## Boundaries

Do not change:

- `DELETE /documents/:id` semantics;
- comments, reports, votes, moderation records, Memory, Canon, Continuity,
  Integrity, Archive, export, AI Activity, cache, storage, or search behavior;
- schema, migrations, hosted data, storage buckets, packages, config, auth,
  billing, Stripe, provider/model, Redis, Cloudflare, workers, queues, or
  deployment;
- publish/retract/delete mutations on hosted staging;
- broad UI styling or route IA.

Do not add a new destructive cleanup button unless the current product already
has an owner-facing delete surface for the same action and the change is only a
receipt/readback hardening.

## Validation

Run focused validation:

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts`
- `git diff --check`
- added-line sensitive-pattern scan

If API code is touched despite the intended scope, also run:

- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions`
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`

## Handoff

Wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed document delete receipt/readback hardening.
Task:
- Review that copy/readback matches accepted tombstone truth, does not imply
  full hard-delete artifact removal, and does not add unauthorized deletion
  behavior.
```

If implementation is not warranted, wake MIMIR with the exact no-code finding.
Do not go idle without a wakeup commit.
