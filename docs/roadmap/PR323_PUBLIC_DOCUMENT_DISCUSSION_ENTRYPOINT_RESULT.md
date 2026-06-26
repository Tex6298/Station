# PR323 - Public Document Discussion Entrypoint Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Accepted by ARGUS

## Result

DAEDALUS made the public document-to-discussion path more explicit without
changing backend data, schema, seeds, launch scope, chat, billing, provider
routing, Redis, Cloudflare, or discussion permissions.

The public Space featured and library surfaces now label linked-discussion
documents as `Open document and linked discussion` instead of passive
`Discussion open` text. Public document detail now promotes an attached forum
thread as `Open linked discussion` near the document title and in the discussion
panel, while preserving honest loading, no-discussion, and owner-start states.

## What Changed

- Added public-story helpers for:
  - linked discussion cues on public document cards/rows;
  - document-detail discussion entrypoint copy for linked, loading, eligible,
    owner-start, and unavailable states.
- Updated `/space/[slug]` featured works and library rows to use the explicit
  `Open document and linked discussion` cue.
- Updated `/space/[slug]/documents/[documentId]` to:
  - show a top-level `Open linked discussion` action when an attached public
    thread is known;
  - keep the existing discussion panel, but with clearer linked/loading/absent
    copy;
  - keep the owner-only `Start discussion` path honest for eligible documents
    without an attached thread.
- Did not add nested links inside Space document cards or library rows.

## Files Changed

- `apps/web/app/space/[slug]/page.tsx`
- `apps/web/app/space/[slug]/documents/[documentId]/page.tsx`
- `apps/web/lib/public-story-polish.ts`
- `apps/web/lib/public-story-polish.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/PR323_PUBLIC_DOCUMENT_DISCUSSION_ENTRYPOINT_DAEDALUS.md`
- `docs/roadmap/PR323_PUBLIC_DOCUMENT_DISCUSSION_ENTRYPOINT_RESULT.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 112 tests passed, including public document discussion cue/copy coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 31 tests passed; public/community forum behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 2 tests passed; linked document discussion visibility/readback remains green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck ran. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with known warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |
| `git diff --cached --check` | Pass | Staged whitespace check passed. |

## Privacy Notes

- The public UI still uses only document title/type/provenance cue,
  `discussion_thread_id` presence, resolved public discussion metadata, and
  existing public forum routes.
- No private source body, owner-only fields, credentials, reporter identity,
  report bodies, raw event rows, provider traces, billing identifiers, schema,
  or seed data changed.
- Documents without discussions do not claim a discussion exists.

## ARIADNE Recommendation

Yes, ARIADNE should rerun the hosted public chain after ARGUS accepts and the
change is deployed. The original caveat was human-visible discoverability on
hosted web, so local helper coverage is necessary but not sufficient to close
the browser evidence loop.

## ARGUS Review

Date reviewed: 2026-06-26

Verdict:

```text
PASS WITH HOSTED REHEARSAL RECOMMENDED
```

ARGUS accepts PR323. The implementation matches the lane:

- public Space featured works and library rows now cue
  `Open document and linked discussion` only when the existing
  `discussion_thread_id` pointer is present;
- public document detail now exposes `Open linked discussion` as a clear action
  near the title and again in the discussion panel once a linked discussion or
  fallback pointer is known;
- loading, no-discussion, owner-start, and unavailable states remain explicit;
- no schema, seed, backend contract, permission, private source, credential,
  raw event, reporter, billing, provider, Redis, Cloudflare, anonymous chat, or
  launch-scope change was added.

ARGUS notes that the Space card/library cue still routes to the public document
detail, not directly to the forum thread. That is acceptable for PR323 because
the lane's intended human chain is Space -> public document -> linked forum
discussion, and the detail page now carries the explicit discussion action.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 112 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed with 31 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` passed with
  2 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings only.
- `git diff --check` passed.
- `git diff --cached --check` passed.

Recommendation:

MIMIR should close PR323 as accepted and open an ARIADNE hosted/browser rerun
after deployment. The rerun should prove the actual hosted public chain:
front door or Discover -> public Space -> public document -> linked forum
discussion, including desktop/mobile fit and public/private boundary checks.
