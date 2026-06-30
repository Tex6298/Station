# PR484J-H - Archive Connector Source Body Read Dry-Run Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR

## Verdict

```text
ACCEPT_PR484J_H_REDDIT_SAVED_ITEMS_SOURCE_PREVIEW
```

ARGUS accepts the PR484J-H implementation without a review patch.

The accepted lane is one owner-only Reddit saved-items source-body dry-run. It
does not execute imports, create archive source rows, write existing
`import_jobs`, create connector job tables, stage private source bodies, enqueue
jobs, run workers, expose UI, or touch hosted/runtime, packages, billing, Redis,
Cloudflare, marketplace, partner adapter, or social surfaces.

## Review Checks

ARGUS reviewed the DAEDALUS handoff, implementation diff, source-preview
helper, route failure mapping, credential and import-intent helpers, focused
tests, static no-drift guards, and roadmap/testing docs.

Findings:

- `POST /archive-connectors/import-intents/:intentId/source-preview` is behind
  `requireAuth` and uses only `req.user.id` for owner scope.
- UUID path and strict empty body validation happen before storage, credential,
  provider, or write work.
- Missing, wrong-owner, wrong-purpose, pending, cancelled, non-activated,
  unsupported-family, unsupported-kind, and stale-source-key intents fail before
  credential decrypt or provider fetch.
- Persona ownership is rechecked before credential decrypt and provider fetch.
- Preview requires a source-ready Reddit credential with completed account
  proof.
- The helper calls Reddit identity first, validates an internal username from
  the fresh provider payload, fingerprint-matches the live raw account id
  against stored account proof, and only then calls the bounded saved-items
  endpoint.
- The implementation does not use stored `accountLabel` as a provider path
  component.
- The saved-items request is limited to
  `/user/{username}/saved?limit=10&raw_json=1`, with a 5 second timeout, no
  retries, and no pagination loop.
- Success returns safe intent metadata, count metadata, truncation boolean, and
  safety booleans only.
- Tests use hostile provider payload fields and prove no titles, text, URLs,
  authors, subreddit names, raw account ids, usernames, cursors, provider
  payloads, headers, tokens, storage details, SQL, stack traces, or
  secret-shaped values return in readback.
- No storage writes occur on success or failure.
- Static guards found no source-preview drift into Discord guild/channel/message
  reads, Reddit history endpoints beyond saved items, Reddit broad discovery,
  Reddit `read` expansion, archive source rows, existing `import_jobs`,
  `persona_files`, Memory, Canon, Continuity, public documents, review
  candidates, queues, workers, UI, hosted/runtime code, packages, billing,
  Redis, Cloudflare, marketplace, partner adapters, social behavior, provider
  SDKs, or unaccepted provider endpoints.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 66 archive connector route tests passed, including source-preview owner/auth/body/intent/persona/credential/account/provider/redaction/no-write/static-guard coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 134 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors. |
| Forbidden behavior scan | Pass | Review scans found no new source-preview writes, jobs, queues, UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapter, social, Discord content reads, broad Reddit reads, or unaccepted Reddit history endpoints. |

## Residual Risk

This lane proves only the first bounded live source-body read boundary. It does
not persist private source data, display previews, execute imports, create
archive sources, write jobs, crawl pagination, add recurring pulls, expose UI,
or prove hosted runtime behavior.

Future lanes must separately preflight and review any content readback,
private staging, import execution, archive source writes, connector job tables,
queue/worker behavior, pagination crawls, additional Reddit history categories,
Discord channel/message/member reads, UI, hosted/runtime work, packages,
billing, Redis, Cloudflare, marketplace, partner adapters, or social behavior.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484J-H Archive Connector Source Body Read Dry-Run without a review patch.
- The accepted implementation is limited to activated owner-only Reddit saved-items source-preview counts, with live identity fingerprint matching and no source content/readback, private staging, import writes, jobs, queues, UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapter, social, or unaccepted provider reads.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- git diff --check
Task:
- Close PR484J-H or choose the next archive connector move.
- Content readback, private staging, import execution, archive source writes, jobs/queues/workers, pagination crawls, UI, hosted/runtime, packages, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, additional Reddit history categories, and Discord channel/message/member reads remain separate lanes unless explicitly opened.
```
