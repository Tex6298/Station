# PR382 - Memory Owner-Visible JSON Redaction

Opened: 2026-06-27
Owner: DAEDALUS
Status: accepted by ARGUS

## Purpose

Repair the PR381 hosted failure: the persona Memory stop still renders
JSON-shaped source material in visible owner text.

PR379 fixed Global Archive API preview serialization. PR381 proved the same
problem still exists on the Memory page/card fallback path.

## Blocking Defect

Hosted route:

```text
/studio/personas/[replay persona]/memory
```

Observed by ARIADNE:

- The route is reachable and owner-only.
- A saved memory card falls back from safe title/summary text into raw
  JSON-shaped memory/source content.
- ARIADNE intentionally did not quote the raw line into the result doc.

Result:

- PR381 failed because Memory, Archive, Continuity, and owner search are not yet
  safe/coherent together.

## Likely Repair Area

Start here:

- `apps/web/app/studio/personas/[personaId]/memory/page.tsx`
- `apps/web/lib/owner-visible-redaction.ts`
- `apps/web/lib/owner-visible-redaction.test.ts`

Current Memory page pattern to review:

```tsx
ownerVisibleText(item.summary || item.content, "No memory summary saved.")
```

The Global Archive page already calls `ownerVisibleText` for titles, summaries,
and match reasons. Prefer extending that helper/policy rather than creating a
Memory-only redaction function.

## Requirements

Patch the smallest owner-visible boundary so:

- JSON-shaped memory/source content does not render raw in Memory cards.
- UUID-shaped values remain redacted.
- Empty text still uses the caller fallback.
- Normal prose summaries/content remain visible.
- Safe title/source/status/lifecycle/confidence context remains visible.
- Shared memory normal prose is not over-redacted.
- Runtime context preview and Global Archive behavior do not regress.

Do not change:

- Memory persistence.
- Import parser behavior.
- Retrieval/search semantics.
- Runtime prompt construction.
- Embedding/provider/model routing.
- Redis, Cloudflare, worker, queue, schema, migration, billing, export, or chat
  behavior.

## Validation

Run focused validation first:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/owner-visible-redaction.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If the patch touches API serialization or shared runtime context helpers, also
run the relevant API tests and explain why the scope expanded.

## Handoff To ARGUS

Wake ARGUS with:

- Files changed.
- Exact redaction policy added.
- Proof that JSON-shaped Memory text is redacted.
- Proof that normal prose memory/shared memory remains visible.
- Validation commands and results.
- Any residual caveat for ARIADNE's PR381 rerun.

## DAEDALUS Result

Result doc:
`docs/roadmap/PR382_MEMORY_OWNER_VISIBLE_JSON_REDACTION_RESULT.md`.

DAEDALUS patched `apps/web/lib/owner-visible-redaction.ts`, the shared
owner-visible helper already used by the Memory page fallback, Global Archive
cards, and runtime context preview readbacks.

Policy added:

- empty text still uses the caller fallback;
- UUID-shaped values remain redacted in normal prose;
- normal prose memory and shared-memory text remain visible;
- JSON-shaped object/array source bodies, including fenced JSON, render as a
  structured-source redaction preview;
- no Memory persistence, import parser, retrieval/search semantics, runtime
  prompt construction, API serialization, or shared runtime context helper
  behavior changed.

Validation passed:

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/owner-visible-redaction.test.ts`;
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`;
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context`;
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck`;
- `git diff --check` passed with CRLF normalization warnings only.

ARGUS accepted PR382 on 2026-06-27 and added one narrow display-only hardening:
runtime context source-content readback now uses `ownerVisibleText` instead of
UUID-only redaction, so JSON-shaped source content receives the same structured
preview policy while normal prose remains visible.

Current baton: MIMIR should close PR382 and decide the next roadmap move. If
MIMIR wants hosted proof after deploy, ARIADNE should rerun PR381 and verify the
Memory stop and runtime-context readbacks no longer render raw JSON-shaped
source material.
