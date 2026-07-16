# PR528B3 - Document Summary Contract DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Ready for ARGUS review

```text
READY_PR528B3_DOCUMENT_SUMMARY_CONTRACT_FOR_ARGUS
```

## Implemented Scope

1. Migration `085` adds nullable `public.documents.summary` with an
   idempotence-safe `add column if not exists` path and a trimmed `1..500`
   character constraint for non-null values. It performs no backfill, index,
   RLS change, or hosted mutation.
2. Generated DB and shared document types now carry the nullable summary.
   Document create/update accepts a trimmed optional summary, normalizes empty
   input to null, persists it, and returns it through owner and current public
   reads without changing the canonical body.
3. Summary participates in version-change detection, prior-version snapshots,
   owner readback, and the new owner-only version restore endpoint. Restore
   snapshots the current row first, preserves null exactly, rejects cross-owner
   or unavailable Space/persona links, and does not rewire the live discussion
   thread to a historical pointer.
4. Discover feed excerpts now use `summary ?? body`. Discover search keeps its
   existing title eligibility and canonical body field while returning summary
   for the existing summary-first search presentation. Public Space reads select
   summary, and public Space/document-card excerpts use the same null fallback.
5. Public document detail renders summary as separate supporting copy before
   the unchanged body. Provenance, visibility, publication, discussion, and
   owner-control behavior are unchanged.
6. Deployment readiness now proves `documents.version` and
   `documents.summary` together without exposing either value.

## Serializer Audit

DAEDALUS inspected the document serializers and projections in Documents,
Discover, Spaces, Threads, Developer Spaces, Projects, Exports, publishing
approvals, events, personas, imports, Continuity, and Station Assistant before
editing.

Only current document owner/public reads and the authorized Discover/public
Space excerpt surfaces changed. Developer Space evidence, Project evidence,
thread links, Station Press/export manifests, approval projections, seminar
sources, import links, storage accounting, and assistant projections remain on
their existing metadata-only or canonical-body contracts. This avoids expanding
Developer Spaces or silently treating summary as the document body.

## Focused Proof

The route contract proves:

- whitespace normalization and the 500-character API/DB bound;
- owner list/current readback and anonymous public visibility scoping;
- private summary non-disclosure;
- Discover summary-first and legacy body fallback excerpts;
- public Space summary selection without private draft disclosure;
- version snapshot/readback and owner-only restore;
- null summary round-trip through snapshot and restore; and
- rejection of a forged historical link to another owner's Space.

The web contract proves summary is rendered separately on document detail and
that public Space, Discover legacy cards, and shared document cards use
`summary ?? body` without deriving or replacing body.

## Boundary

No migration was applied. No hosted account, document, Space, thread, persona,
provider, corpus, credential, storage object, deployment, billing row, queue,
or configuration was read or mutated. PR528B4 was not started, and no summary
generation or search-ranking behavior was added.

## Validation

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 --filter @station/types --filter @station/config --filter @station/db --filter @station/auth build` | Pass |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/api/src/routes/community.test.ts` | Pass, `36/36` |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/api/src/routes/spaces.test.ts apps/api/src/routes/health.test.ts apps/web/lib/publishing-ui.test.ts` | Pass, `44/44` |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/api/src/routes/document-discussions.test.ts apps/api/src/routes/continuity-publication.test.ts apps/web/lib/writing-feed.test.ts apps/web/lib/public-story-polish.test.ts` | Pass, `21/21` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass, zero warnings/errors |
| `git diff --check` | Pass immediately before commit |

## Additional Required Files

- `packages/types/src/document.ts` keeps shared web/API document consumers typed.
- `apps/api/src/services/readiness.service.ts` and
  `apps/api/src/routes/health.test.ts` satisfy the lane's migration-readiness
  acceptance without applying migration `085`.
- `apps/api/src/routes/spaces.test.ts`, `apps/web/lib/publishing.ts`,
  `apps/web/components/discover/discover-home.tsx`, and
  `apps/web/components/documents/document-card.tsx` lock existing public/owner
  consumers that already expose document excerpts or version readback.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed the first-class document summary source and migration contract.
Verdict:
- READY_PR528B3_DOCUMENT_SUMMARY_CONTRACT_FOR_ARGUS
Task:
- Route ARGUS review; keep hosted public-corpus writes blocked until accepted deployment proof.
```
