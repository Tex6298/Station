# PR117 - Public Document Discussion Chain

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
visible route behavior after technical acceptance.
Status: implemented by DAEDALUS; ready for ARGUS review

## Why This Lane

PR116 closed the replay forum/browser blockers, but ARIADNE recorded one
deferred public-chain caveat: the selected public Space document route loaded,
while `GET /documents/:id/discussion` returned `eligible:true` with
`discussion:null`.

This was not a PR116 blocker because the forum failure already blocked the
discussion leg. Now that forums load, Station needs the public chain to be
coherent:

`/ -> /discover -> public Space -> public document -> linked forum discussion`

## Goal

Make the public document discussion leg replay-ready without weakening document,
forum, visibility, moderation, or authorship boundaries.

## Scope

DAEDALUS should implement or precisely block:

- identify why the selected public document has `eligible:true` but
  `discussion:null`;
- decide whether the correct fix is seed/content repair, route linking,
  discussion creation/readback, or clearer no-discussion copy;
- make the public document route either link to a real public discussion thread
  for the replay document or honestly present that no discussion exists without
  looking broken;
- preserve document visibility, forum category visibility, discussion
  eligibility, moderation/reporting, authorship provenance, and owner/private
  boundaries;
- avoid exposing raw ids, private document fields, hidden/removed comments,
  private author data, schema errors, prompts, provider payloads, or secrets;
- add focused tests for the chosen behavior.

Prefer a minimal seed/readback/link fix over a broad discussion redesign.

## Non-Scope

Do not add:

- broad forum or document redesign;
- public/private visibility changes;
- automatic discussion creation for all documents unless already intended by
  existing product logic;
- moderation behavior changes;
- billing/auth/session/provider/cache/Cloudflare changes;
- new AI calls;
- private document/archive data exposure;
- raw prompt/provider payload/secret logging.

## ARGUS Review Requirements

ARGUS should verify:

- public document discussion behavior is coherent and bounded;
- hidden/private/removed/unpublished content remains inaccessible;
- moderation/reporting and authorship provenance remain intact;
- no raw ids, private fields, schema errors, prompts, provider payloads, or
  secrets leak;
- focused tests and typecheck pass.

ARGUS should wake ARIADNE after technical acceptance because this affects a
visible public route chain.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add focused web/UI tests if visible page behavior changes.

## DAEDALUS Implementation

Implemented on 2026-06-20.

Root cause: public document discussion readback trusted only
`documents.discussion_thread_id`. A replay seed/content state with a real forum
thread linked by `threads.linked_document_id`, but a missing or stale document
pointer, returned `eligible:true` with `discussion:null`.

Fix:

- `GET /documents/:id/discussion` now recovers an active, non-hidden,
  visibility-matching linked thread by `linked_document_id` when the document
  pointer is missing, stale, or unreadable.
- Owner discussion creation reuses and relinks that recovered thread before
  creating a new one, so stale seeds do not duplicate discussion threads.
- The route still refuses private/unpublished/comments-disabled documents and
  does not expose hidden, removed, or wrong-visibility threads.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` passed with
  2 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed with 19 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.
