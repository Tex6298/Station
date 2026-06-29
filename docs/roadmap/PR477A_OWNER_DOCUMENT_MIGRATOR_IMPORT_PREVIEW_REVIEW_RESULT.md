# PR477A - Owner Document Migrator Import Preview ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-06-29

Status: Accepted

## Verdict

ARGUS accepts PR477A.

The implementation matches the accepted preflight: Document Migrator now has an
owner-only, no-write import preview before the existing pasted/file import
confirmation paths. It does not add live connector pulls, OAuth/API token
handling, recurring sync, automatic import without owner confirmation, storage
upload during preview, background workers/queues, provider calls, billing,
schema changes, or private source leakage.

## Review Findings

Accepted boundaries:

- `POST /imports/preview` is behind `requireAuth` through the existing imports
  router.
- The preview route verifies the requested `personaId` belongs to the signed-in
  owner and returns bounded `404` copy for missing/cross-owner personas.
- The route reads only the persona ownership row before parsing owner-supplied
  local text. It does not query or write import jobs, persona files, archive
  rows, Memory, Canon, Continuity, documents, storage, queues, workers, or
  provider services.
- The preview service uses the existing parser only to derive redacted readback
  fields: source kind/label, format/source family, estimated character count,
  non-empty line count, optional message count, next owner action, and explicit
  no-write safety booleans.
- The API response does not return `parsed.text`, raw source bodies, message
  snippets, parser metadata dumps, Reddit permalinks, URLs, storage paths,
  signed URLs, tokens, account ids, SQL/table detail, stack traces, or provider
  payloads.
- Parser failures return sanitized `ImportParseError` messages or generic
  preview failure copy with `noWritePerformed: true`.
- The pasted-source UI calls `/imports/preview` first and disables the existing
  `/imports/chat` confirmation until `importPreviewCanConfirm()` matches the
  exact current pasted source key.
- The local file UI reads selected `.txt`, `.text`, `.md`, `.markdown`, or
  `.json` text in the browser for preview before any signed upload URL or
  `/persona-files/.../register` request can run.
- File input changes clear stale preview state before upload confirmation can
  be enabled again.
- Onboarding and supported-format copy now frame Document Migrator as preview
  first, then explicit owner confirmation for pasted/uploaded exports, not live
  OAuth/API pulls or recurring sync.

Sensitive-readback findings:

- Hostile labels and parser errors are redacted or replaced with bounded
  fallback copy.
- Preview output exposes counts/status only. It does not expose source text,
  private snippets, URLs/permalinks, storage/signing details, table names,
  stack traces, secret-shaped values, provider payloads, or internal row ids.
- Diff scan hits are expected test fixtures and guardrail/negative-scope docs
  only.

Residual note:

- Pasted JSON preview can identify known JSON export structure, while the
  existing pasted confirmation still writes the pasted body through the current
  `/imports/chat` path. The UI/result copy stays honest by describing that
  confirmation as a private pasted import job/archive-chunk write, not as file
  parser candidate extraction. This is acceptable for PR477A.

Non-scope confirmation:

- No live Reddit, Discord, ChatGPT, Claude, social, website, cloud drive, or
  external API pull was added.
- No OAuth flow, bot token, API key, webhook, provider account link,
  credential storage, recurring sync, worker, queue, Redis, Cloudflare,
  provider/model call, billing, Stripe, schema change, migration, PDF/binary
  parser, broad workspace export, API Bridge credential setup, or Developer
  Space runtime change was added.

## Validation

ARGUS reran the requested validation:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/import-preview.test.ts` | Pass | 3 tests passed for auth, cross-owner fail-closed behavior, supported format summaries, sanitized parser errors, hostile-label redaction, and no-write table/storage checks. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/imports/parsers/import-parsers.test.ts` | Pass | 18 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts` | Pass | 14 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/import-review.test.ts` | Pass | 7 tests passed; helper/source-order checks included. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/onboarding-paths.test.ts` | Pass | 7 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |
| `git diff --check e3dcd4a1c81642a3d10a9a820f3fedbdc70b5eb6 c635fea9b26e7d6bb19281b2e5f7ff402dc24ad1` | Pass | No whitespace errors in the implementation diff. |
| `git diff --cached --check` | Pass | No staged whitespace errors before ARGUS review docs edits. |
| Diff-only sensitive/scope scan | Pass | Expected fixture and guardrail terms only; no new raw source body, parser text/snippet, URL/permalink, storage path, signed URL, OAuth/API token, app password, admin key, account id, SQL/table output, stack trace, worker, queue, Redis, Cloudflare, provider call, billing, schema change, automatic import, or live connector claim. |

## Hosted Proof Recommendation

MIMIR should route ARIADNE for hosted owner-only proof:

- signed-in persona files page on desktop and 390px mobile;
- pasted-source preview returns format/count/no-write readback before the
  confirm import button enables;
- local text/Markdown/JSON file preview returns format/count/no-write readback
  before any signed upload URL or file registration;
- changing the pasted source or selected file makes the previous preview stale
  and disables confirmation again;
- malformed or unsupported JSON returns bounded copy without echoing private
  source content;
- optional direct API sample: authenticated `POST /imports/preview` for a
  safe dummy source returns no-write safety booleans;
- no import job, persona file, archive source, Memory, Canon, Continuity,
  public document, signed upload URL, storage path, queue/worker, provider
  call, billing action, external pull, OAuth flow, token, hosted log,
  SQL/table output, stack trace, or private source body is captured during
  preview.

## Handoff

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
```

MIMIR should close PR477A or route ARIADNE for the hosted owner-only proof
above. Do not broaden into live external pulls, OAuth/API tokens, recurring
sync, automatic import without owner confirmation, workers/queues, Redis,
Cloudflare, provider calls, billing, schema changes, or private source leakage.
