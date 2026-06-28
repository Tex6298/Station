# PR452 - Archive Trust Status Readback Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-06-28

## Verdict

PR452 was accepted by ARGUS after a narrow review patch.

The owner-only persona Archive/files route now separates source-count semantics
from archived chats, storage/imported content, and Continuity-linked archive
readback. Counts use only data already available from owner-safe route state.
Unavailable archive-linked Continuity counts are labelled honestly instead of
being guessed.

ARGUS result:

`docs/roadmap/PR452_ARCHIVE_TRUST_STATUS_READBACK_REVIEW_RESULT.md`

## What Changed

- Added `archiveTrustScopeRows` in `apps/web/lib/archive-trust.ts`.
- Added an Archive scope readback panel to
  `apps/web/app/studio/personas/[personaId]/files/page.tsx`.
- Extended `apps/web/lib/archive-trust.test.ts` with count-semantics tests for:
  - pasted/file import sources;
  - archived chats;
  - server-reported storage usage;
  - Continuity-linked archive material not being broken out on this route;
  - unavailable counts staying explicit instead of being faked.
- ARGUS patched unavailable archived-chat count copy so `Not tracked here` is
  not described as zero.

## Readback Semantics

- Pasted/file import sources: counted from the existing page data, excluding
  archived conversation transcripts.
- Archived chats: shown from the existing owner-safe persona continuity summary
  when available.
- Storage/imported content: points to the existing server-reported Storage and
  Quota panel; this page does not invent byte usage or capacity.
- Continuity-linked archive material: labelled as not broken out on the Archive
  route. The page points owners to Continuity for source-level review of
  `archive_file`, `archive_import`, and `archived_chat` records.

## Boundary

No backend, schema, auth/session, provider/model, billing/quota enforcement,
archive import execution, file upload/storage semantics, conversation archival,
continuity selection, runtime retrieval, export package shape, publication
visibility, Redis, Cloudflare, Railway, Supabase config, migration, worker,
queue, or Developer Space behavior changed.

The new readback does not expose private source bodies, storage paths, raw
archive IDs, raw owner IDs, prompts, provider payloads, credentials, or raw
import errors beyond the existing owner-only sanitized import cards.

## Validation

Passed on 2026-06-28:

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts`
  - 13 tests passed.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`
  - 143 tests passed.
- `npm exec --yes pnpm@10.32.1 -- run test:storage`
  - 19 tests passed.
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive`
  - 43 tests passed.
- `npm exec --yes pnpm@10.32.1 -- run test:exports`
  - 7 tests passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck`
  - passed.
- `git diff --check`
  - passed with line-ending normalization warnings only.
- `git diff --cached --check`
  - passed.

Notes:

- npm emitted the known pinned-runner warnings about pnpm-only `.npmrc` keys.
- API typecheck was not run because PR452 changed only web UI/helper code and
  docs.

## ARGUS Review

ARGUS confirmed the new readback does not fake unavailable archive-linked
Continuity counts, `0` pasted/file import sources does not read as "no
Archive-backed material," archived chats and storage usage remain distinct from
import source counts, mobile readability stays within the existing responsive
Archive layout, and no backend/storage/import/continuity semantics changed.
