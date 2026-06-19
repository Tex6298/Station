# PR80 - Community Provenance Labels

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS first, ARGUS reviews. ARIADNE rehearses if visible forum or
document-discussion UI changes.
Status: accepted by ARGUS; ready for MIMIR closeout/sequencing

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

## DAEDALUS Implementation

Implemented API/type provenance labels for forum and document-discussion
serialization.

Facts used:

- document-linked threads use the linked document's `provenance_type`,
  `source_type`, and `source_persona_id`;
- persona-linked threads use only `linked_persona_id` and are labelled
  "Persona-linked";
- comments are labelled "User-authored" because comments have no schema field
  proving AI assistance, persona authorship, or source-persona derivation.

Facts deliberately not inferred:

- a thread linked to a persona is not labelled persona-authored;
- a comment on an AI-assisted or persona-derived document thread does not
  inherit that document provenance;
- raw `source_id`, `source_label`, archive filenames, prompts, bodies, and
  owner-only source internals are not included in forum discussion provenance
  payloads.

Changed surfaces:

- category thread list payloads include `discussion_provenance`;
- thread detail payloads include `thread.discussion_provenance`;
- thread detail comment payloads include user-authored
  `comment.discussion_provenance`;
- document discussion create/readback payloads include
  `discussion.discussion_provenance`;
- shared forum types define the provenance label shape.

No visible forum UI was changed, so no ARIADNE route rehearsal is required from
the implementation side. No schema, broad redesign, AI posting/persona autonomy,
billing/provider/cache, Developer Space, auth/session, or public visibility
widening work was added.

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

## ARGUS Review - 2026-06-19

ARGUS accepts PR80 as the API/type-only Community Beta provenance label slice.

Review confirmed:

- Document-linked threads derive discussion labels only from linked document
  `provenance_type`, `source_type`, and `source_persona_id`.
- Persona-linked threads are labelled `persona_linked` only; they do not claim
  persona authorship.
- Comments remain `user_authored` and do not inherit AI-assisted,
  persona-derived, or document provenance from their parent thread.
- Public/community/unlisted/private visibility boundaries did not widen.
- PR78 comment moderation and PR79 report queue regressions remain green.

ARGUS patched one review hardening:

- Forum category lists now use the joined document row only to compute
  `discussion_provenance` and do not serialize the raw joined `document` helper
  object. Thread detail keeps the existing document link shape but strips the
  helper provenance fields from `thread.document`, so provenance facts appear
  only in the bounded `discussion_provenance` payload.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 10 tests passed, including safe AI-assisted, archive-import, persona-linked, and user-authored provenance labels plus no raw source-label or joined-document helper leakage. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 1 test passed; document discussion create/readback and thread detail expose provenance labels while visibility boundaries remain intact. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 2 tests passed; PR79 report queue/readback remains green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files and local triad state. |

Verdict: PR80 can close. No ARIADNE visible-route rehearsal is required.
