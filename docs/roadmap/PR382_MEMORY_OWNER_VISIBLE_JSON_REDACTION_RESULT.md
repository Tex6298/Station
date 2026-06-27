# PR382 - Memory Owner-Visible JSON Redaction Result

Date: 2026-06-27
Owner: A2 / DAEDALUS
Reviewer: A3 / ARGUS
Status: accepted by ARGUS.

## Summary

DAEDALUS repaired the Memory page owner-visible fallback by extending the shared
owner-visible redaction helper used by Memory, Global Archive, and runtime
context readbacks.

The Memory page still calls:

```tsx
ownerVisibleText(item.summary || item.content, "No memory summary saved.")
```

The boundary is now safer because `ownerVisibleText` detects structured
JSON-shaped source bodies and returns an explicit redacted preview instead of
rendering the raw object or array text.

## Changed Files

- `apps/web/lib/owner-visible-redaction.ts`
- `apps/web/lib/owner-visible-redaction.test.ts`
- `apps/web/components/studio/runtime-context-preview.tsx`
- `docs/roadmap/PR382_MEMORY_OWNER_VISIBLE_JSON_REDACTION_DAEDALUS.md`
- `docs/roadmap/PR382_MEMORY_OWNER_VISIBLE_JSON_REDACTION_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Redaction Policy

`ownerVisibleText` now:

- returns the caller fallback for empty text;
- redacts UUID-shaped values in normal prose;
- preserves normal prose memory and shared-memory text;
- redacts valid JSON object/array strings and fenced JSON object/array strings
  into a structured-source preview message;
- leaves Memory persistence, import parsing, retrieval, search semantics,
  runtime prompt construction, and API serialization unchanged.

This is intentionally an owner-visible display helper policy, not a data
mutation or search/retrieval policy.

## Proof

Focused helper coverage now proves:

- UUID-shaped values are still redacted without dropping useful prose.
- Empty text still uses the supplied fallback.
- JSON-shaped source bodies do not render their private body text, secret marker,
  or raw field names.
- Fenced JSON-shaped source bodies are also redacted.
- Normal prose memory/shared-memory text remains visible.

Because the Memory page already sends memory summaries and fallback content
through `ownerVisibleText`, the hosted defect path now receives the redacted
preview instead of the raw structured source body.

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/owner-visible-redaction.test.ts` | Pass, 5 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, 125 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass, 8 tests. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass. |
| `git diff --check` | Pass with CRLF normalization warnings only. |

No API tests were added because the patch did not touch API serialization,
persistence, retrieval, runtime prompt construction, or shared packages.

## ARGUS Review

Verdict: `PASS`.

ARGUS accepted the Memory owner-visible fallback repair. `ownerVisibleText`
redacts JSON-shaped object/array source bodies, fenced JSON, and obvious
JSON-like structured prefixes into an explicit structured-source preview, while
empty fallbacks, UUID redaction, and normal prose memory/shared-memory text
remain intact.

ARGUS also added one narrow display-only hardening: runtime context
source-content readback now uses `ownerVisibleText` instead of UUID-only
redaction. That closes the remaining shared owner-visible readback gap without
changing persistence, retrieval/search semantics, runtime prompt construction,
import parsing, API serialization, provider routing, Redis, Cloudflare, worker,
queue, schema, migration, billing, export, chat, or broad UI behavior.

Validation passed after the ARGUS hardening: focused owner-visible redaction
tests, `test:studio-ui`, `test:persona-context`, web typecheck, and
`git diff --check`.

## Hosted Follow-Up

ARIADNE should rerun PR381 after deploy if MIMIR wants live proof that the
Memory stop and runtime-context readbacks no longer render raw JSON-shaped
source material.
