# PR528C7 - Public Document Discover Text Search Review

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - hostile local API review

## Review Target

Review DAEDALUS commit `da520604a7ee1e4b6e09f1149c562c4f83213d8b`
and `PR528B10_PUBLIC_DOCUMENT_DISCOVER_TEXT_SEARCH_DAEDALUS_RESULT.md` against
the PR528B9 body-phrase blocker and PR528B10 contract.

## Required Review

1. Prove public document matching is exactly title, nullable summary, and body,
   with fixed trusted field names and parameterized `.ilike` values. Reject any
   raw user interpolation into a PostgREST logical-filter expression.
2. Audit query cardinality and ordering. Anonymous search should add only three
   document queries; an eligible signed-in search may add at most nine for the
   existing three visibilities. Require title, summary, then body field priority
   and existing visibility order within each field.
3. Prove deduplication occurs before the existing eight-document cap and that a
   multi-field match appears once at its highest priority. Hostile-test enough
   title/summary/body rows to expose early-cap or per-query starvation errors.
4. Reprove every visibility boundary: published public anonymously; existing
   community/member eligibility only when signed in; no private, unlisted,
   draft, archived, hidden, or cross-owner private document in the public
   group.
5. Reprove `privateResults` remains owner-scoped, separate, and title-only. A
   public body phrase must not bridge into Memory, Archive, Continuity, private
   documents, imports, files, or archived chats.
6. Require the response shape, safe Space document route data, provenance,
   summary/body values, and linked discussion id to remain unchanged. The lane
   must not broaden any non-document search group.
7. Check real PostgREST behavior for nullable summary matching and special
   ordinary phrase characters. Do not expand this lane into wildcard escaping
   or full-text ranking unless a concrete correctness/security blocker is
   demonstrated.
8. Confirm zero migration, hosted write, deployment, corpus, provider, cache,
   or private Aster mutation.

Run at minimum:

```text
npx --yes pnpm@10.32.1 test:community
npx --yes pnpm@10.32.1 test:document-discussions
npx --yes pnpm@10.32.1 --filter @station/api typecheck
git diff --check
```

Keep review local. Any patch must remain inside the Discover document-search
source and focused test boundary. Do not deploy or retry PR528B9.

## Result And Handoff

Create:

`docs/roadmap/PR528C7_PUBLIC_DOCUMENT_DISCOVER_TEXT_SEARCH_REVIEW_ARGUS_RESULT.md`

Use one exact verdict:

```text
ACCEPT_PR528B10_PUBLIC_DOCUMENT_DISCOVER_TEXT_SEARCH_FOR_DEPLOYMENT
BLOCK_PR528B10_PUBLIC_DOCUMENT_DISCOVER_TEXT_SEARCH_<EXACT_REASON>
```

Commit and push public-safe evidence and any narrowly required patch, then wake
MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS reviewed public document title/summary/body Discover search and its visibility/dedupe boundaries.
Verdict:
- ACCEPT_PR528B10_PUBLIC_DOCUMENT_DISCOVER_TEXT_SEARCH_FOR_DEPLOYMENT (or exact blocker)
Task:
- If accepted, serialize deployment and resume the still-zero-state PR528B9 corpus operation.
```
