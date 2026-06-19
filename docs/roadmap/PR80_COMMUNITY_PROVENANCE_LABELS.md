# PR80 - Community Provenance Labels

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS first, ARGUS reviews. ARIADNE rehearses if visible forum or
document-discussion UI changes.
Status: open

## Why This Lane

PR78 and PR79 covered the first moderation/action-log slices. The launch-core
Community Beta instructions still require persona-authored or AI-assisted posts
to be labelled. The current schema already proves some provenance facts:

- documents have `provenance_type`, `source_type`, `source_label`, and
  `source_persona_id`;
- threads can link to a document, Space, or persona;
- comments and ordinary threads do not obviously carry their own AI/persona
  authorship fields.

This lane should make proven provenance visible where the current schema
supports it and document exact blockers where it does not. Do not invent
persona or AI authorship from weak signals.

## Goal

Add bounded provenance labels to public/community discussion serialization and,
if cheap, forum UI readback.

The ideal slice:

- document-linked threads expose a safe discussion provenance label derived from
  the linked document's provenance fields;
- persona-linked threads expose only a safe "persona-linked" label unless a real
  source-persona/authorship field proves more;
- comments remain user-authored unless the schema proves otherwise;
- public and member readers get only safe labels, not private source bodies,
  prompts, raw archive text, or owner-only provenance internals.

If the schema cannot prove persona-authored or AI-assisted post labels for
threads/comments, return a blocker naming the exact fields or migration needed.

## Inspect Before Editing

- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/documents.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/document-discussions.test.ts`
- `apps/web/app/forums/*`
- `packages/types/src/forum.ts`
- `packages/db/src/types.ts`
- `docs/roadmap/PR78_COMMUNITY_MODERATION_PROVENANCE_FIRST_SLICE.md`
- `docs/roadmap/PR79_COMMUNITY_MODERATION_QUEUE_READBACK.md`
- `docs/roadmap/community-beta.md`
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`

## Preferred Implementation Order

1. Inventory which forum/discussion payloads already carry linked document,
   linked persona, or source-persona data.
2. Add a small shared serializer/helper if it prevents ad hoc label drift.
3. Prefer API/type coverage before UI:
   - category thread list;
   - thread detail;
   - document discussion readback if it serializes thread data separately.
4. If forum UI changes are small and direct, surface the labels in existing
   compact badge areas without a broad visual redesign.
5. If provenance cannot be safely inferred, wake MIMIR with exact blockers and
   a recommended migration/test boundary.

## Guardrails

- No broad forum redesign or visual reskin.
- No new AI posting or persona-autonomy feature.
- No schema migration unless the blocker is tiny and clearly necessary; wake
  MIMIR before opening a data-model change.
- No private source bodies, prompts, archive text, hidden moderation data, or
  owner-only provenance internals in public/community responses.
- No billing/provider/Redis/Cloudflare/Developer Space work.
- No auth/session changes.
- No public/private/community visibility widening.

## Acceptance

- Proven document discussion provenance labels are visible in API payloads and,
  if UI changed, on the relevant forum/document-discussion pages.
- Labels distinguish at least user-authored, AI-assisted, archive/import, and
  persona-derived document provenance where existing document fields prove it.
- Persona-linked threads are labelled cautiously without implying persona
  authorship unless the schema proves authorship.
- Comments do not claim AI/persona authorship without data support.
- Anonymous/member visibility boundaries remain unchanged.
- PR78 comment moderation and PR79 report queue tests remain green.

## Validation

Run the narrow relevant gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If web UI changes, also run the relevant web check and wake ARIADNE after ARGUS
if the labels need human-eye route review.

## Handoff

DAEDALUS wakes ARGUS with:

- implementation or blocker summary;
- exact provenance facts used and facts not inferred;
- files changed;
- visibility proof;
- validation results;
- explicit non-scope confirmation.

ARGUS wakes MIMIR with the closeout verdict, or wakes ARIADNE first if visible
forum/document-discussion UI changed enough to need a human-eye route rehearsal.
