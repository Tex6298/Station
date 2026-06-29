# PR477 - Document Migrator Product Depth Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT_PR477A_DOCUMENT_MIGRATOR_PREVIEW`

## Decision

ARGUS accepts the smallest honest first slice as:

```text
PR477A - Owner Document Migrator Import Preview
```

This is an owner-only, no-write preview/readback slice for existing pasted and
uploaded archive import formats. It should let an owner inspect a bounded,
redacted summary of what Station recognizes before the owner commits to the
existing import flow.

It is not a live connector, recurring sync, OAuth/API import, automatic Memory
or Canon promotion, public publishing path, storage upload replacement, or
background import runtime.

## Existing Surface Findings

Repo inspection found enough existing import surface to support a narrow
preview, but not by reusing the current submit paths directly:

- `/studio/onboarding` already routes Document Migrator statefully to persona
  creation, persona files, or pending import review without claiming live
  connectors.
- `apps/web/lib/onboarding-paths.ts` already says Document Migrator is for
  owner-scoped pasted/uploaded material and explicitly excludes live
  Reddit/Discord/OAuth/recurring sync/API pulls.
- `apps/web/app/studio/personas/[personaId]/files/page.tsx` currently submits
  pasted text to `POST /imports/chat`, which creates an import job and archive
  content immediately.
- The same page's file flow gets a signed upload URL, uploads to storage, then
  registers a persona file with `processImmediately: true`.
- `apps/api/src/routes/imports.ts` is an owner-scoped write path, not a
  preview path. It creates import jobs and archive content.
- `apps/api/src/routes/persona-files.ts` is also a write path. It reserves
  storage, creates signed upload URLs, writes persona file rows/import jobs,
  and can run inline processing.
- `apps/api/src/services/imports/parsers` supports plain text, Markdown,
  ChatGPT JSON, Claude JSON, Reddit JSON, Discord JSON, and legacy role/content
  JSON, with sanitized unsupported/malformed JSON errors.
- The parser returns full parsed private source text. PR477A must therefore use
  parser results only to derive redacted summary fields; it must never return
  `parsed.text` or raw parser metadata dumps.
- `apps/web/lib/archive-trust.ts` and `apps/web/lib/import-review.ts` already
  provide safe import source/readback language and secret-shaped source label
  redaction patterns.

## Boundary Findings

Accepted for PR477A:

- owner-only preview for an already signed-in owner and an owner-owned persona;
- local pasted text and locally selected text/Markdown/JSON export files;
- parser-backed format detection and count/readback summaries;
- explicit owner confirmation before any existing import/upload submit path
  writes archive sources, import jobs, persona files, Memory, Canon,
  Continuity, or public material;
- bounded unsupported/malformed format errors that do not echo private source
  text, raw JSON, stack traces, SQL/table detail, storage paths, signed URLs, or
  secret-shaped values.

Blocked beyond PR477A:

- live Reddit, Discord, ChatGPT, Claude, social, website, cloud drive, or
  external API pulls;
- OAuth flows, bot tokens, API keys, webhook setup, provider account linking,
  connector credentials, or secret storage;
- recurring sync, background import queues, workers, scheduled retries, Redis,
  Cloudflare, vector-index changes, provider/model calls, billing, Stripe,
  schema changes, migrations, or hosted config changes;
- automatic import or promotion into Memory, Canon, Continuity, public
  documents, or external services without explicit owner confirmation;
- PDF/binary parsing, broad workspace export, API Bridge credential setup, or
  Developer Space runtime changes.

## Accepted PR477A Scope

DAEDALUS may implement a narrow import preview/readback:

- Add a dedicated authenticated API route, for example `POST /imports/preview`,
  that:
  - requires the signed-in owner session;
  - verifies the requested `personaId` belongs to the owner;
  - accepts bounded local source input such as pasted text or the text contents
    of a locally selected `.txt`, `.text`, `.md`, `.markdown`, or `.json` file;
  - uses the existing import parser to identify accepted source family and safe
    counts;
  - returns only safe preview fields such as status, format/source family,
    estimated character count, message/post/comment count when available,
    sanitized source label, next owner action, and a "no write performed"
    readback;
  - returns sanitized parser errors for unsupported or malformed files;
  - performs no database writes, no storage reservation/upload, no signed URL
    creation, no import job creation, no archive ingestion, no import review
    candidate creation, and no provider/model call.
- Add a preview helper/model if useful, such as
  `apps/api/src/services/imports/import-preview.ts`, so raw parser output is
  converted into a redacted contract before route response.
- Update the owner persona files page so preview is an explicit step before the
  existing pasted/file import submission:
  - pasted source can be previewed before `POST /imports/chat`;
  - local file preview should read text in the browser and call preview before
    any signed upload URL or `/persona-files/.../register` call;
  - the final import/upload button remains a separate explicit owner action;
  - current supported import format readback remains honest about uploaded
    export files only, not live provider pulls.
- Optionally update Document Migrator onboarding readback to point owners toward
  the preview step when a persona exists.

Preview responses, UI, tests, docs, and logs must not include:

- raw source bodies, raw parser `text`, message snippets, JSON dumps, provider
  payloads, or private source excerpts;
- raw `metadata.permalink`, full URLs, storage paths, signed URLs, OAuth codes,
  tokens, API keys, app passwords, admin keys, account ids, stack traces, SQL,
  table names, or internal row ids;
- live connector, recurring sync, automatic import, background job, public
  publishing, billing, or Cloudflare claims.

If DAEDALUS discovers that useful preview requires exposing raw private source
body snippets or writing import state before confirmation, stop and wake MIMIR
with that exact blocker instead of shipping a half-safe preview.

## Required Tests

DAEDALUS should add focused coverage proving:

- signed-out preview is rejected by auth;
- cross-owner persona preview fails closed without leaking persona/source
  details;
- plain text, Markdown, ChatGPT JSON, Claude JSON, Reddit JSON, Discord JSON,
  and legacy role/content JSON produce safe preview summaries;
- unsupported or malformed JSON returns bounded copy and does not echo private
  source text;
- preview does not create `import_jobs`, `persona_files`, archive source rows,
  Memory, Canon, Continuity, public documents, storage reservations, signed
  URLs, import review candidates, queues, workers, or provider calls;
- preview responses do not include raw source text, snippets, raw parser dumps,
  permalinks, URLs, storage paths, tokens, account ids, SQL/table detail, stack
  traces, or secret-shaped values;
- the persona files UI does not call current import/upload write endpoints
  during preview and still requires a separate owner confirmation to import;
- onboarding/document migrator copy remains explicit that supported sources are
  uploaded or pasted exports, not live OAuth/API pulls or recurring sync.

Suggested files/tests:

- `apps/api/src/routes/imports.ts`
- `apps/api/src/routes/import-preview.test.ts` or a focused import preview
  section in the current archive route test harness
- `apps/api/src/services/imports/import-preview.ts`
- `apps/api/src/services/imports/parsers/import-parsers.test.ts`
- `apps/web/app/studio/personas/[personaId]/files/page.tsx`
- `apps/web/lib/archive-trust.ts`
- `apps/web/lib/archive-trust.test.ts`
- `apps/web/lib/import-review.test.ts`
- `apps/web/lib/onboarding-paths.ts`
- `apps/web/lib/onboarding-paths.test.ts`

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/import-preview.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/imports/parsers/import-parsers.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/import-review.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/onboarding-paths.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a diff-only sensitive/scope scan covering raw source bodies, parser
text/snippets, URLs/permalinks, storage paths, signed URLs, OAuth/API tokens,
app passwords, admin keys, account ids, SQL/table output, stack traces,
workers, queues, Redis, Cloudflare, provider calls, billing, schema changes,
automatic import, and live connector claims.

## ARIADNE Rehearsal Requirement

After DAEDALUS implements PR477A and ARGUS accepts it, MIMIR should route
ARIADNE for hosted owner-only proof:

- signed-in `/studio/onboarding` Document Migrator path still routes honestly
  based on persona/archive/import review state;
- signed-in persona files page desktop and 390px mobile renders preview before
  import/upload commitment;
- paste preview returns a redacted format/count/readback summary before
  import;
- local text/Markdown/JSON file preview returns a redacted summary before any
  signed upload URL or import registration;
- malformed or unsupported JSON fails with bounded copy that does not echo
  private source content;
- no import job, persona file, archive source, Memory, Canon, Continuity,
  public document, queue/worker, provider call, billing action, external pull,
  OAuth flow, token, hosted log, SQL/table output, stack trace, storage path,
  signed URL, or private source body is captured.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence inspection | Pass | PR477 handoff, future lanes, PR403/PR404, onboarding path helper/tests, persona files page, import routes, persona-files route, parser contracts/tests, archive trust helpers/tests, and import review helpers/tests inspected. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/imports/parsers/import-parsers.test.ts` | Pass | 18 tests passed; supported parser families work and unsupported/malformed JSON errors are sanitized. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts` | Pass | 14 tests passed; import/readback helpers keep file parser and live-pull claims bounded. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/import-review.test.ts` | Pass | 4 tests passed; import review source labels redact private identifiers and secret-shaped values. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/onboarding-paths.test.ts` | Pass | 7 tests passed; Document Migrator route/readback stays state-aware and live-connector-free. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully from turbo cache. |

## Handoff

Wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
```

Task: implement `PR477A - Owner Document Migrator Import Preview` exactly as a
no-write, owner-only, redacted preview before existing import confirmation.
Do not implement live external pulls, OAuth/API tokens, recurring sync,
automatic import without owner confirmation, workers/queues, Redis,
Cloudflare, provider calls, billing, schema changes, or private source leakage.
