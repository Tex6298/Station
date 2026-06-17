# PR14 - External Conversation Import Parsers

Date: 2026-06-17
Status: opened for A2 / DAEDALUS
Owner: DAEDALUS implementation, ARGUS review, ARIADNE only if the Studio import
journey changes materially.

## Why This Lane Is Next

PR12 closed the launch-core private archive search lane. The next launch-core
implementation item from `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md` is the
import pipeline.

`docs/roadmap/PR13_CLOUDFLARE_NESTSTACK_DECISION.md` already exists as a draft
Cloudflare decision packet, not the next implementation lane. To avoid two
different PR13 meanings, this active implementation lane is PR14.

## Goal

Make external conversation exports safer and more explicit by splitting parser
logic out of `archive.service.ts` and supporting ChatGPT and Claude export
formats with focused tests before any Reddit, Discord, worker, or recurring
import work begins.

The replay proof should be: "Station can ingest a known ChatGPT or Claude
conversation export as private archive material, preserve source format
metadata, fail safely on malformed input, and avoid silently treating unknown
JSON as trustworthy conversation history."

## Current Baseline

- `processUploadedFile` in `apps/api/src/services/archive.service.ts` downloads
  uploaded files and currently calls a private `extractTextFromJsonExport`
  helper for JSON.
- That helper handles a ChatGPT-like `mapping` shape and a simple array of
  `{ role, content }` messages, then falls back to stringifying unknown JSON.
- Import job status, storage reservation/rollback, and memory chunking already
  exist.
- There is no separate parser contract, no Claude-specific parser test, no
  Discord parser, and no Reddit import pipeline.

## Scope

Parser modules:

- Add a small parser boundary under
  `apps/api/src/services/imports/parsers/`.
- Implement ChatGPT export parsing first.
- Implement Claude export parsing second.
- Add an index/router helper that chooses the parser from file name, MIME type,
  and JSON shape.
- Preserve a safe plain-text fallback only for known text/markdown files.
- Unknown JSON should fail with an owner-visible error instead of being
  stringified into archive memory as if it were a parsed conversation.

Import behavior:

- Update `processUploadedFile` to use the parser boundary.
- Preserve existing import job transitions and storage rollback behavior.
- Keep imported output private and owner-scoped.
- Keep source names nonblank in UI/API output.
- Record parser/source metadata in the safest existing place. If a durable
  schema addition is required, keep it narrow and owner-scoped.
- Do not write raw parser payloads to public docs, logs, or wakeup commits.

Candidate/review behavior:

- Imported material must not become Canon directly.
- If existing continuity/memory candidate machinery can safely represent parsed
  import review items, use it narrowly.
- If the existing candidate schema cannot represent import review without a
  larger design change, document the gap and wake MIMIR rather than forcing a
  broad schema rewrite inside this parser slice.

## Out Of Scope

- Reddit OAuth/import.
- Discord parser beyond a disabled scaffold or explicit unsupported-format
  error.
- Background workers, BullMQ, Redis queues, recurring pulls, scheduled imports,
  or large async orchestration.
- Vector reindexing, embedding provider changes, Cloudflare retrieval, Redis
  memory truth, public publishing, or UI reskin.
- Full import review workspace if it requires a broad new product surface.

## Validation

Minimum local gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Required tests:

- ChatGPT parser extracts role-labelled turns in chronological order.
- Claude parser extracts role-labelled turns in chronological order.
- Unknown JSON fails safely and does not create memory chunks.
- Malformed JSON fails with an owner-visible sanitized import-job error.
- Text/Markdown imports still work.
- Existing storage rollback/idempotency tests still pass.
- Other owners cannot retry, read, or inspect another owner's import status.

## Handoff To ARGUS

Wake A3 / ARGUS with:

- parser files and route/service files changed;
- exact supported ChatGPT and Claude shapes;
- unsupported/unknown JSON behavior;
- import job status and storage rollback proof;
- whether any schema was added;
- validation commands and results;
- explicit caveats, especially candidate/review gaps left for a later lane.

ARGUS should review parser overclaiming, malformed JSON behavior, owner scoping,
secret/private-text redaction, memory poisoning risk, and accidental Reddit or
worker scope creep.
