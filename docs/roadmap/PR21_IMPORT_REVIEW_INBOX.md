# PR21 - Import Review Inbox

Date: 2026-06-17
Status: opened for A2 / DAEDALUS
Owner: DAEDALUS implementation, ARGUS review, ARIADNE after MIMIR only if the
visible Studio journey changes materially.

## Why This Lane Is Next

PR17 through PR20 now create pending owner-scoped Memory/Canon candidates from
external imports. The backend can accept or reject a known candidate ID, but
import-backed candidates are not yet a clear owner-facing review stop in Studio.

That leaves the product promise awkward: Station preserves imported source
material safely, but the user may not know what is waiting for review or how to
promote it without finding an archived-chat-specific surface.

## Goal

Add a narrow Import Review Inbox so owners can see pending import-backed
Memory/Canon candidates for a persona and accept, edit, or reject them through
the existing review machinery.

The replay proof should be:

> After importing ChatGPT, Claude, Reddit, or Discord material, the owner sees a
> clear review queue, can accept/edit/reject candidates, rejected material stays
> archived privately, accepted Memory/Canon becomes active with provenance, and
> non-owners cannot see or mutate the queue.

## Current Baseline

- `continuity_candidates` supports archived-chat candidates and import-backed
  candidates with `source_table: "persona_files"`.
- `PATCH /conversations/candidates/:candidateId` accepts/rejects candidates and
  preserves import provenance.
- Imported archive chunks remain private/quarantined until accepted.
- `apps/web/components/studio/persona-chat.tsx` has a candidate card/review UI
  for archived chat candidates.
- Studio persona management shows a continuity candidate count, but import
  candidates do not have a first-class owner review inbox.

## Scope

API behavior:

- Add or extend an owner-scoped endpoint to list continuity candidates for a
  persona, with filters for pending/reviewed and import-backed source refs.
- The response should include stable, non-secret fields needed by Studio:
  candidate id, type, title, content excerpt/full candidate content as already
  owner-visible, rationale, status, source label, source table/id, accepted
  target refs, and timestamps.
- Reuse the existing candidate accept/reject endpoint unless a tiny shared
  service extraction is needed.
- Preserve archived-chat candidate behavior and tests.
- Non-owners must not list, accept, reject, or infer another owner's candidates.
- Candidate listing must not expose raw file bodies, storage paths, provider
  keys, or private source payloads beyond the owner-visible candidate text.

Studio behavior:

- Add a narrow Import Review Inbox surface in the existing persona Studio flow.
  Prefer the Archive or Memory area if that fits current navigation; do not add
  a broad new workspace.
- Show pending Memory and Canon candidates grouped or labelled by source.
- Let the owner accept with edits, reject, and see reviewed status using the
  existing review semantics.
- Keep rejected/private source material visibly preserved as archive source
  material; do not imply rejection deletes the import.
- Empty states should explain that imports create review items only when Station
  can safely parse source material.
- Use the existing Station UI style. Do not reskin the app in this lane.

## Out Of Scope

- Full import review workspace redesign.
- Broad UI reskin or Discern visual parity work.
- Live Reddit/Discord OAuth/API pulls.
- Recurring import jobs or worker deployment.
- Export worker redesign.
- Public publishing from import candidates.
- Cloudflare retrieval, vector reindexing, Redis memory truth, billing/pricing
  changes, social posting, or public community bridge.

## Validation

Minimum local gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add `test:persona-context` if runtime inclusion/exclusion logic changes; this
lane should not need to change it.

## Required Tests

- Owner can list pending import-backed candidates for a persona.
- Owner can filter or distinguish pending and reviewed candidates.
- Other owners cannot list or infer another owner's import candidates.
- Existing candidate accept/edit/reject behavior still works for import-backed
  Memory and Canon.
- Rejection leaves private archive source material intact.
- Archived-chat candidate behavior still works.
- Studio review UI helper coverage proves pending counts, source labels,
  accept/reject controls, reviewed states, and empty states.
- Existing ChatGPT, Claude, Reddit, and Discord import tests still pass.

## Handoff To ARGUS

Wake A3 / ARGUS with:

- endpoint/service changes and exact response shape;
- UI files changed and where the inbox lives;
- owner/non-owner listing and mutation evidence;
- accept/edit/reject behavior and archived-source preservation evidence;
- archived-chat regression evidence;
- validation commands and results;
- caveats about deferred full review workspace, live Reddit/Discord pulls,
  workers, Cloudflare, vectors, Redis memory truth, publishing, billing, social
  posting, public community bridge, and UI reskin.

ARGUS should review owner scoping, source-content leakage, stale candidate
status handling, import-vs-archived-chat regressions, runtime-memory poisoning,
and accidental product/UI expansion.
