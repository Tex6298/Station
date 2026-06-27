# PR379 - Global Archive JSON Preview Redaction

Date opened: 2026-06-27
Opened by: A1 / MIMIR
Owner: DAEDALUS. ARGUS reviews before any hosted rerun.
Status: accepted by ARGUS.

## Why This Lane

PR378 failed one owner-only hosted surface: `/studio/archive` showed raw
JSON-shaped source material inside visible Global Archive result text.

Export trust and persona import-pipeline readback passed. This repair is only
for Global Archive owner-visible result previews/readback.

## Goal

Patch the smallest archive search/result text path so Global Archive cards never
render raw JSON-shaped source bodies. The page should show safe owner-facing
context instead:

- title;
- source label;
- source type;
- persona/status/provenance readback;
- short sanitized summary;
- explicit redacted preview for structured imports.

Owner-only does not mean raw source bodies should be dumped in summary cards.
Full private source inspection can be a deliberate future route, not the default
archive search overview.

## Scope

Inspect:

- `apps/web/components/studio/archive-library.tsx`;
- `apps/web/lib/archive-search.ts`;
- Global Archive/import search route serializers if the raw preview comes from
  API data;
- storage/archive/conversation tests around `/imports/archive` and
  `/imports/archive/search`;
- PR365 helper/tests.

Patch where the boundary is best enforced. If the API currently returns a raw
body preview intended only for internal use, prefer sanitizing the API field or
adding a safe display field. If the API response is already safe but the web
chooses the wrong field, patch the web helper.

## Acceptance

Pass if:

- `/studio/archive` result cards do not render raw JSON-shaped source material;
- JSON-like archive/import bodies are summarized or redacted in card previews;
- useful context remains visible through title/source/status/persona/provenance
  fields;
- owner-only grouping/readback from PR365 still works;
- no private source body, raw transcript dump, provider payload, raw IDs, raw
  URLs, SQL, stack traces, or secret-shaped values are visible by default;
- no import parser, persistence, search semantics, owner scoping, public archive
  behavior, provider, Redis, Cloudflare, worker, queue, schema, migration, or
  billing behavior changes.

## Validation

Run the focused relevant set:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web lint
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

Add/adjust focused helper or route coverage proving JSON-shaped source content
does not appear in owner-visible result previews.

## Handoff

Wake ARGUS with:

- changed files;
- exact preview/redaction boundary;
- validation results;
- proof Global Archive owner scoping still holds;
- proof raw JSON-shaped source bodies are not rendered in result cards;
- recommendation for ARIADNE to rerun PR378 after deploy if accepted.

## DAEDALUS Result

Result doc:
`docs/roadmap/PR379_GLOBAL_ARCHIVE_JSON_PREVIEW_REDACTION_RESULT.md`.

DAEDALUS patched the API response preview boundary for `/imports/archive` and
`/imports/archive/search`. Archive item summaries now pass through a safe
archive preview helper that replaces JSON-shaped source bodies with an explicit
structured-source redaction message while preserving normal sanitized prose
summaries.

Regression coverage in `apps/api/src/routes/storage.test.ts` proves that a
summary-less JSON-shaped owner archive item:

- returns the redacted preview in archive overview;
- returns the redacted preview in archive search;
- still exposes safe title/source/privacy context;
- does not return private JSON body text, private marker text, or raw JSON field
  names in overview or search responses;
- keeps the existing owner-scoped archive search assertions green.

Validation passed:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`;
- `npm exec --yes pnpm@10.32.1 -- run test:storage`;
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive`;
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck`;
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint`;
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`;
- `git diff --check` passed with CRLF normalization warnings only.

ARGUS accepted PR379 on 2026-06-27 and added one narrow regression assertion
that normal prose summaries remain visible while JSON-shaped source bodies are
redacted.

Current baton: MIMIR should close PR379 and decide the next roadmap move. If
MIMIR wants hosted proof after deploy, ARIADNE should rerun PR378 to verify
`/studio/archive` no longer renders raw JSON-shaped source material.
