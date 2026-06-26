# PR366 - Import Pipeline Owner Readback Result

Owner: DAEDALUS
Date: 2026-06-26
Status: Ready for ARGUS

## Result

DAEDALUS mapped the current import pipeline and shipped the smallest safe
no-config owner-facing readback patch: the persona Archive/File page now names
the supported owner import sources, shows source-format fallbacks for import
jobs, and keeps retry/candidate/privacy boundaries visible.

Changed files:

- `apps/web/app/studio/personas/[personaId]/files/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/lib/archive-trust.ts`
- `apps/web/lib/archive-trust.test.ts`

## Surface Map

Current live import intake truth:

- `/imports/chat` creates authenticated, owner-scoped pasted chat/text import
  jobs for a persona and writes private archive chunks.
- `/imports/:id/retry` can retry failed chat import jobs only when the owner
  supplies source content again; completed and partially recovered jobs remain
  idempotent.
- `/imports/:id/status` and `/imports/persona/:personaId` return owner-scoped
  job status readback.
- Stored uploaded files are processed through the file import path using a
  durable owner file pointer.
- File parsing supports plain text, Markdown, ChatGPT JSON, Claude JSON,
  Reddit JSON, Discord JSON, and legacy role/content JSON arrays.
- Unknown or malformed JSON fails before archive memory is created, with
  sanitized owner-visible errors.
- ChatGPT, Claude, Reddit, and Discord file imports can create pending
  Memory/Canon review candidates; no import auto-activates Memory or Canon.
- `/imports/archive` and `/imports/archive/search` expose owner-only private
  archive readback including import jobs and files.

Still future:

- Reddit OAuth/live pulls, Discord API/bot import, provider connectors,
  recurring imports, webhooks, external API calls, crawlers, workers, queues,
  Redis, Cloudflare, new buckets, migrations, and automatic Memory/Canon
  acceptance.

## Implemented Slice

The persona Archive/File page now shows an `Import Pipeline` readback panel:

- supported source rows for pasted source material, text/Markdown files,
  ChatGPT JSON, Claude JSON, Reddit JSON, Discord JSON, and legacy
  role/content JSON;
- explicit copy that provider exports are uploaded/read from stored source
  material rather than live OAuth/API pulls;
- explicit copy that parsed provider exports become private archive material
  first and any Memory/Canon candidates stay pending for owner review.

Import job cards now use helper-backed readback:

- generic source names such as `pasted-archive` become owner-friendly labels;
- job kind and inferred source format are shown separately;
- completed, failed, queued, and processing jobs include safe next-action and
  owner-only boundary copy;
- failed chat jobs say retry requires owner-supplied content again, while file
  failures say no live provider retry runs here.

The helper layer now has focused coverage for:

- supported import format rows and no live-pull implications;
- source-name fallback labels;
- failed pasted import retry copy;
- completed provider file import owner/candidate-review boundary copy.

## Privacy Boundary

No API, parser, schema, migration, job runner, worker, queue, provider,
storage bucket, or auth behavior changed. The patch renders only authenticated
owner page state that the persona Archive/File page already loaded.

No raw source bodies, raw transcripts, provider payloads, secrets, private IDs,
public archive rows, or cross-owner access paths were added.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 119 tests passed, including import pipeline readback helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 16 storage/API tests passed, including file parser, private chunk, candidate, and sanitized failure coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 41 archive/conversation/import parser tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass | Next lint reported no warnings or errors. |
| `git diff --check` | Pass | Whitespace check passed; Git emitted only CRLF normalization warnings. |

## Review Ask

ARGUS should verify:

- the import surface map matches current code truth;
- the Archive/File UI does not imply live provider pulls, OAuth, workers, or
  background infrastructure;
- source-label fallbacks and source-format labels are useful and safe;
- failed/completed job copy reflects current retry and candidate-review
  behavior;
- no API, parser, persistence, auth, schema, worker, queue, provider, or public
  archive behavior changed.
