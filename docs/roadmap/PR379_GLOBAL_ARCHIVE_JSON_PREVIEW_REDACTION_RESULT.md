# PR379 - Global Archive JSON Preview Redaction Result

Date: 2026-06-27
Owner: A2 / DAEDALUS
Reviewer: A3 / ARGUS
Status: accepted by ARGUS.

## Summary

DAEDALUS patched the Global Archive API preview boundary so JSON-shaped source
bodies are redacted before they can render in `/studio/archive` result cards.

The repair is intentionally narrow:

- `/imports/archive` and `/imports/archive/search` now use a shared safe archive
  preview helper for returned item summaries.
- JSON-shaped object or array bodies, including fenced JSON blocks, are replaced
  with an explicit structured-source redaction message.
- Non-structured summaries still use the existing job-error and preview
  sanitization path.
- Search matching semantics remain unchanged because private search fields are
  still built server-side and removed before responses are returned.
- Owner scoping remains enforced by the existing route query filters and
  regression test coverage.

## Changed Files

- `apps/api/src/routes/imports.ts`
- `apps/api/src/routes/storage.test.ts`
- `docs/roadmap/PR379_GLOBAL_ARCHIVE_JSON_PREVIEW_REDACTION_DAEDALUS.md`
- `docs/roadmap/PR379_GLOBAL_ARCHIVE_JSON_PREVIEW_REDACTION_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Boundary

The redaction boundary is API response serialization for archive overview and
archive search item summaries.

Structured source text is still usable internally for owner-scoped search
matching, but default owner-visible result previews do not return the raw JSON
body. The visible card can still show title, source label, status, persona
context, privacy, and other provenance already present on the result item.

No parser, import pipeline, repository, schema, migration, provider, cache,
public archive behavior, owner-scoping rule, or broad Studio UI behavior was
changed.

## Proof

Focused storage coverage now seeds an owner archive memory item whose source
body is JSON-shaped and summary-less. The test proves:

- `/imports/archive` returns the structured-source redaction summary for that
  item;
- `/imports/archive/search?q=ChatGPT` can still find the item by title/source
  context;
- the search response preserves safe `source` and `owner_only` privacy
  readback;
- archive overview and search responses do not include the private JSON body,
  private marker text, or raw JSON field names;
- existing owner-scoped archive search assertions remain green.

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, 122 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass, 16 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass, 41 tests. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass, no warnings or errors. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass. |
| `git diff --check` | Pass with CRLF normalization warnings only. |

## ARGUS Review

Verdict: `PASS`.

ARGUS accepted the API serialization boundary. `/imports/archive` and
`/imports/archive/search` now redact JSON-shaped preview summaries before they
can reach `/studio/archive`, while server-side private search fields remain
internal and are stripped before response.

The structured-source detector is narrow enough for this lane: it targets
object/array JSON, fenced JSON blocks, and obvious JSON-like object/array
prefixes. ARGUS added one regression assertion proving a normal prose archive
summary remains visible instead of being replaced by the structured-source
redaction message.

Owner scoping remains unchanged, and regression coverage proves other-owner
items stay out while the JSON-shaped fixture does not return private body text,
private marker text, or raw JSON field names. No parser, import pipeline,
repository, schema, migration, provider, cache, public archive behavior,
owner-scoping rule, billing, worker, queue, Redis, Cloudflare, hosted runtime,
or broad Studio UI behavior changed.

If MIMIR wants hosted proof after deploy, ARIADNE should rerun PR378 and verify
`/studio/archive` no longer renders raw JSON-shaped source material.

## Hosted Follow-Up

ARIADNE should rerun the PR378 hosted rehearsal after deploy if MIMIR wants live
proof that `/studio/archive` cards receive the redacted summary rather than raw
JSON source material.
