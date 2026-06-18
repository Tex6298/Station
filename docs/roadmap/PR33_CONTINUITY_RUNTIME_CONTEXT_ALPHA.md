# PR33 - Continuity Runtime Context Alpha

Date: 2026-06-18
Status: implemented by DAEDALUS, ready for ARGUS review
Owner: DAEDALUS implements, ARGUS reviews. ARIADNE rehearses only if visible
Studio context/continuity UI changes.

## Purpose

Make continuity records participate in persona chat runtime context as a
bounded, source-labelled context bucket.

PR31's budget report deliberately exposed a gap:
`continuity_records_not_in_chat_context_yet`. PR33 closes that gap without
turning continuity into Redis memory truth, changing the vector contract, or
rewriting retrieval.

## Scope

- Load owner-scoped `continuity_records` for the current persona during
  `assemblePersonaRuntimeContext`.
- Keep the bucket bounded and predictable: latest/relevant private continuity
  records only, with a small default limit.
- Include useful fields only: record type, title, summary/body excerpt, source
  label/table/id/version, visibility, version, and occurred/created/updated
  timestamps where useful.
- Add `continuity` to runtime context counts, selected-source trace metadata,
  and PR31 runtime budget reporting.
- Format continuity records for the prompt as context/source material, not as
  instructions.
- Preserve owner-only behavior: anonymous users and other owners must not see
  private continuity records through context preview, chat, traces, or stream
  events.
- Keep public/community continuity visibility rules unchanged outside owner chat
  context.

## Non-Scope

- Do not add vector search over continuity records in this PR.
- Do not add Redis/Valkey/Cloudflare continuity storage.
- Do not change continuity record CRUD APIs except where tests need fixtures or
  serializers.
- Do not redesign Continuity UI.
- Do not change Memory/Canon acceptance semantics.
- Do not publish private continuity records publicly.

## Acceptance

- Owner chat/context preview includes a bounded continuity bucket when records
  exist for the persona.
- The prompt clearly treats continuity as source/context material, not system
  instructions.
- Runtime budget and trace metadata count/select continuity without exposing raw
  private content in production responses or stream events.
- Other owners cannot retrieve another user's continuity through runtime
  context.
- Existing memory/canon/integrity/archive behavior remains covered.

## Validation

Run the focused gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
git diff --check
```

If visible Continuity/Studio surfaces change, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
```

## ARGUS Review Ask

ARGUS should hostile-review:

- owner scoping and other-owner leakage;
- prompt-injection handling for continuity body/summary text;
- production response and stream-event safety;
- source/version/visibility labels;
- scope drift into vector search, Redis/Cloudflare, or UI redesign.

## Wake Discipline

DAEDALUS should wake ARGUS with:

- files changed;
- continuity selection/bounding semantics;
- prompt formatting semantics;
- trace/budget changes;
- validation commands/results;
- whether ARIADNE needs a visible rehearsal.
