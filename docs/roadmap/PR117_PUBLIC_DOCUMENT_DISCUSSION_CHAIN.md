# PR117 - Public Document Discussion Chain

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
visible route behavior after technical acceptance.
Status: hosted ARIADNE rerun passed; ready for MIMIR closeout

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

## ARGUS Review

Accepted on 2026-06-20 for hosted/browser rehearsal by ARIADNE.

ARGUS confirmed:

- public discussion readback recovers only active, non-hidden,
  visibility-matching threads linked by `linked_document_id`;
- hidden, removed, wrong-visibility, private, unpublished, and
  comments-disabled documents remain closed or return no discussion;
- owner discussion creation relinks a recovered thread before inserting a new
  discussion thread;
- provenance labels stay bounded to accepted public-safe forum/document fields.

## ARIADNE Hosted Rehearsal

Status: blocker; ready for DAEDALUS follow-up.

Deployment:

- API `/health/deployment` returned 200, `ready:true`, and Railway runtime
  commit `59d63cebbe15`.

Observed:

- The replay public Space lists documents as discussion-open.
- `GET /forums/categories/documents-and-codexes?sort=active` returns active
  public threads linked to those replay documents by `linked_document_id`.
- For a representative replay public document, `GET /documents/:id/discussion`
  returns 200 with `eligible:true` and `discussion:null` even though the linked
  public forum thread exists.
- `GET /threads/:id` for that linked public discussion thread returns HTTP 500
  with the hosted schema-cache error:
  `Could not find the table 'public.community_subcommunities' in the schema cache`.
- In the hosted UI, `/space/station-replay-alpha` says `Discussion open`, but
  the matching public document page shows `Discussion has not been opened yet`
  and no `Open discussion` action on desktop and 390px mobile.
- The linked forum thread route visibly renders the same raw schema-cache error
  on desktop and 390px mobile.

Expected:

- The public chain should stay coherent: Discover/public Space -> public
  document -> linked forum discussion.
- If a linked public thread exists and is readable, the public document page
  should show the `Open discussion` action and route to that thread.
- If the thread cannot load because a hosted dependency is unavailable, the UI
  should show bounded user-facing copy instead of raw schema-cache details.

Classification: `blocker`.

DAEDALUS should verify the exact root cause. Likely patch areas:

- document discussion readback/recovery still uses a thread select that can fail
  against the hosted missing `threads.authorship_*` columns;
- thread detail reads still hit the missing `community_subcommunities` schema
  path and expose the raw error.

Follow-up must preserve document visibility, forum category visibility,
discussion eligibility, moderation/reporting, authorship provenance,
owner/private boundaries, and the accepted fail-closed behavior for non-legacy
or subcommunity-backed categories.

ARIADNE validation:

- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- Sanitized hosted API probe for replay Space, document category threads,
  document discussion readback, and linked thread detail.
- `npx --yes @playwright/test@1.41.2 test tmp-pr117-public-chain-blocker.spec.js --reporter=line --workers=1`
- `git diff --check`

## DAEDALUS Hosted Follow-Up

Implemented on 2026-06-20.

Verified root causes:

- Document discussion recovery still selected `threads.authorship_*` columns,
  so hosted missing-column/schema-cache errors could prevent recovery by
  `linked_document_id`.
- Public thread detail did not apply the accepted
  `community_subcommunities` missing-schema fallback, so the raw hosted
  schema-cache error leaked through `/threads/:id`.

Fix:

- Document discussion thread reads now retry with a legacy select only for
  missing `threads.authorship_*` hosted schema errors.
- Legacy discussion rows are defaulted to user-authored provenance before
  serialization.
- Public thread detail passes the loaded category slug into the subcommunity
  fallback.
- Missing `community_subcommunities` is tolerated only for legacy public
  categories `general` and `documents-and-codexes`; non-legacy or
  subcommunity-backed categories fail closed with 404 and no raw schema-cache
  message.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` passed with
  2 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed with 20 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.

## ARGUS Review - Hosted Follow-Up

Accepted on 2026-06-20 for hosted/browser rerun by ARIADNE.

ARGUS confirmed:

- document discussion recovery retries with a legacy select only for hosted
  missing `threads.authorship_*` schema/column errors while preserving active,
  non-hidden, and visibility filters;
- public thread detail applies the missing `community_subcommunities` fallback
  only for legacy public categories `general` and `documents-and-codexes`;
- non-legacy and subcommunity-backed categories fail closed with 404 and no raw
  schema-cache text.

## ARIADNE Hosted Rerun - Hosted Follow-Up

Status: blocker remains; ready for DAEDALUS follow-up.

Deployment:

- API `/health/deployment` returned 200, `ready:true`, and Railway runtime
  commit `b25f61e34f7d`.

What improved:

- For a representative replay public document with a linked public forum
  thread, `GET /documents/:id/discussion` now returns 200 with `eligible:true`
  and a recovered `discussion`.
- The hosted public document page now shows `Community thread attached` and an
  `Open discussion` action on desktop and 390px mobile.

Remaining blocker:

- `GET /threads/:id` for that linked public discussion thread still returns
  HTTP 500 on the hosted target.
- The sanitized API error is:
  `column comments.authorship_kind does not exist`.
- The linked forum thread page visibly renders the same missing-column error on
  desktop and 390px mobile.

Expected:

- The linked forum thread page should load for public visitors when the linked
  thread is active, non-hidden, and public.
- If hosted comment provenance columns are unavailable, the UI should still not
  expose raw missing-column text.

Classification: `blocker`.

DAEDALUS should verify the exact root cause. Likely patch area:

- thread detail comment reads still select hosted-missing `comments.authorship_*`
  columns without the legacy fallback used for thread provenance.

Follow-up must preserve thread/comment visibility, hidden/removed comment
filtering, moderation/reporting boundaries, authorship provenance labels,
owner/private boundaries, and the accepted fail-closed behavior for non-legacy
or subcommunity-backed categories.

ARIADNE validation:

- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- Sanitized hosted API probe for replay Space, document category threads,
  document discussion readback, and linked thread detail.
- `npx --yes @playwright/test@1.41.2 test tmp-pr117-public-chain-rerun.spec.js --reporter=line --workers=1` failed at linked thread detail status 500.
- `npx --yes @playwright/test@1.41.2 test tmp-pr117-public-chain-thread-blocker.spec.js --reporter=line --workers=1`
- `git diff --check`

## DAEDALUS Hosted Thread-Detail Follow-Up

Implemented on 2026-06-20.

Verified root cause:

- Public thread detail comment reads still selected hosted-missing
  `comments.authorship_*` columns without a legacy fallback.

Fix:

- Thread detail comment reads now retry with a legacy select only for missing
  `comments.authorship_*` hosted schema/column errors.
- Legacy comment rows are defaulted to user-authored provenance before
  serialization.
- Active, non-hidden, status, parent-thread, moderation/reporting, and comment
  visibility filters are unchanged.
- The accepted missing-`community_subcommunities` legacy-category fallback and
  non-legacy fail-closed behavior are unchanged.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` passed with
  2 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed with 21 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.

## ARGUS Review - Thread-Detail Follow-Up

Accepted on 2026-06-20 for hosted/browser rerun by ARIADNE.

ARGUS confirmed:

- comment legacy select is gated on hosted missing `comments.authorship_*`
  schema/column errors;
- the retry keeps the same `parent_type`, `parent_id`, active, and non-hidden
  filters as the normal thread-detail comment query;
- legacy comments receive bounded user-authored provenance defaults before the
  public serializer removes raw authorship columns;
- vote, witness, moderation-action, and viewer-moderation lookups still operate
  on filtered comment IDs only;
- the legacy-category/subcommunity fail-closed boundary from the previous
  follow-up remains unchanged.

## ARIADNE Hosted Rerun - Thread-Detail Follow-Up

Status: pass; ready for MIMIR closeout.

Deployment:

- API `/health/deployment` returned 200, `ready:true`, and Railway runtime
  commit `3d2e07511fea`.

API checks:

- `GET /documents/:id/discussion` returned 200 with `eligible:true` and a
  recovered linked public discussion for a representative replay public
  document.
- `GET /threads/:id` for that linked discussion returned 200 without raw
  hosted schema or missing-column text.
- `GET /forums/categories/documents-and-codexes?sort=active` continued to
  return active public threads linked to replay documents.

Browser checks:

- Hosted `/discover` and `/space/station-replay-alpha` loaded on desktop and
  390px mobile without visible application error or document-level horizontal
  overflow.
- The public document page loaded on desktop and 390px mobile, showed
  `Community thread attached`, showed `Open discussion`, and linked to the
  expected forum thread.
- The linked forum thread page loaded on desktop and 390px mobile with no raw
  hosted schema-cache or missing-column text visible.

Notes:

- The hosted replay dataset no longer had a public document with
  `eligible:true` and `discussion:null`, so no hosted no-discussion copy state
  was available to recheck in this pass.

Closeout verdict:

- PR117's hosted public Space -> public document -> linked forum discussion
  chain is accepted for the replay scope.

ARIADNE validation:

- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- `npx --yes @playwright/test@1.41.2 test tmp-pr117-public-chain-rerun.spec.js --reporter=line --workers=1`
- `git diff --check`
