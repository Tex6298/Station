# PR477A - Owner Document Migrator Import Preview Result

Owner: DAEDALUS / A2

Date: 2026-06-29

State: `READY_FOR_ARGUS_REVIEW`

## Summary

DAEDALUS implemented PR477A as an owner-only, no-write import preview before
the existing pasted/file import confirmation paths.

What changed:

- Added authenticated `POST /imports/preview`.
- Added API preview shaping that converts parser output into redacted
  format/count/readback fields only.
- Updated the persona Archive/files page so pasted source and selected local
  text/Markdown/JSON files must be previewed before the existing import/upload
  write action is enabled.
- Updated Document Migrator and supported-format copy to say preview first,
  then explicit owner confirmation.
- Added focused API and web tests for no-write preview and UI/source ordering.

## Boundaries Preserved

PR477A does not add:

- live external pulls or connector imports;
- OAuth/API tokens, bot tokens, credentials, or secret storage;
- recurring sync, workers, queues, Redis, Cloudflare, provider calls, billing,
  or schema changes;
- automatic import without owner confirmation;
- automatic Memory, Canon, Continuity, public document, or external service
  promotion;
- PDF/binary parsing or broad workspace export.

The preview path reads only the signed-in user profile and requested persona
ownership row before parsing the owner-supplied local text. It does not create
signed upload URLs, storage reservations, import jobs, persona files, archive
chunks, import review candidates, Memory, Canon, Continuity, or documents.

## Preview Contract

`POST /imports/preview` requires auth and verifies the requested persona belongs
to the signed-in owner.

Accepted inputs:

- pasted local text;
- local `.txt`, `.text`, `.md`, `.markdown`, or `.json` file text read in the
  browser before upload.

Returned fields are limited to:

- status and source kind;
- sanitized source label;
- format/source-family labels;
- estimated character count;
- estimated non-empty line count;
- message count when the existing parser provides one;
- next owner action;
- explicit no-write safety booleans.

The response does not return parser `text`, raw source bodies, message snippets,
raw JSON, metadata dumps, permalinks, URLs, storage paths, signed URLs, tokens,
account ids, SQL/table details, stack traces, or provider payloads.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/import-preview.test.ts` | Pass | 3 tests passed; auth, cross-owner fail-closed, supported format summaries, sanitized parser errors, hostile-label redaction, and no-write table/storage checks. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/imports/parsers/import-parsers.test.ts` | Pass | 18 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts` | Pass | 14 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/import-review.test.ts` | Pass | 7 tests passed; import preview helper/source checks included. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/onboarding-paths.test.ts` | Pass | 7 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Diff-only sensitive/scope scan | Pass | Expected guardrail test/doc strings only; no raw source body, parser text/snippet, URL/permalink, storage path, signed URL, OAuth/API token, app password, admin key, account id, SQL/table output, stack trace, worker, queue, Redis, Cloudflare, provider call, billing, schema change, automatic import, or live connector claim introduced. |

## ARGUS Review Ask

Review PR477A for:

- owner-only auth and persona ownership checks;
- whether preview performs no writes or storage/signing work;
- whether preview output stays count/status-only and redacted;
- whether the persona files UI requires preview before import/upload
  confirmation;
- whether onboarding and format copy remain explicit about local uploaded/pasted
  exports rather than live OAuth/API pulls.

If accepted, wake MIMIR for PR477A closeout and ARIADNE hosted proof. If fixes
are needed, wake DAEDALUS with the exact route, output field, UI source, or test
expectation that failed.
