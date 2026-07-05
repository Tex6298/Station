# PR485B - Memory And Continuity Candidate Inbox Result

Owner: DAEDALUS / A2

Date: 2026-07-05

Status: Ready for ARGUS review

## Result

DAEDALUS implemented the accepted PR485B web-only Memory inbox slice.

The new owner route lives at:

```text
/studio/personas/[personaId]/memory-inbox
```

It loads import-backed Memory/Canon continuity candidates through the existing
persona-scoped candidate API:

```text
GET /conversations/persona/:personaId/candidates?source=import&status=all
```

Review actions reuse the existing candidate review API through
`ImportReviewInbox`:

```text
PATCH /conversations/candidates/:candidateId
```

The PR485A companion home shortcut strip now includes a separate `Inbox` link
to `/memory-inbox`; the existing `Memory` shortcut remains pointed at
`/memory`.

## Changed Files

- `apps/web/app/studio/personas/[personaId]/memory-inbox/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/components/studio/import-review-inbox.tsx`
- `apps/web/lib/import-review.ts`
- `apps/web/lib/import-review.test.ts`
- `apps/web/lib/studio-navigation.ts`
- `apps/web/lib/studio-navigation.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/roadmap/PR485B_MEMORY_CONTINUITY_INBOX_RESULT.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Scope Boundary

PR485B stayed web-only.

No API route, migration, AI package, prompt helper, retrieval/context builder,
provider code, hosted runtime, archive connector behavior, billing,
queue/worker, Redis, Cloudflare, social connector, public write, broad shell,
Discern CSS, return-to-thread behavior, `source=all` inbox, stale
`/conversations/candidates/inbox` endpoint, archived-chat candidate
generalization, or companion presence prompt context changed.

## Validation

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/conversation-archive.test.ts apps/web/lib/import-review.test.ts apps/web/lib/studio-navigation.test.ts`
  passed with 38 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed.
- `git diff --check` passed with CRLF normalization warnings only.

Build was not rerun for PR485B. The existing local Windows Next standalone
symlink `EPERM` caveat remains the build truth if build is rerun.

## ARGUS Review Focus

- The new page calls only
  `importBackedCandidateInboxPath(personaId)`, which expands to
  `source=import&status=all`.
- No code path uses `source=all` or `/conversations/candidates/inbox`.
- Accept/reject remains inside `ImportReviewInbox` and calls only
  `/conversations/candidates/:candidateId`.
- `ImportReviewInbox` copy is configurable while Archive/files defaults remain
  unchanged.
- The separate `Inbox` shortcut points to `/memory-inbox`, while `Memory`
  remains `/memory`.
- Static tests guard against raw source field/table readback and
  return-to-thread, prompt/presence, archive connector, billing, Redis,
  Cloudflare, social, public-write, queue/worker, broad shell, and Discern CSS
  drift.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
```
