# PR528B10 - Public Document Discover Text Search

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - narrow local API repair for blocked PR528B9

## Purpose

Make the existing public Discover search contract match public document title,
first-class summary, and canonical body text. PR528B9 proved the accepted API
can serialize all three fields but filters public documents by title only,
making meaningful body-phrase discovery impossible.

This is a public-document search repair only. It is not a general search
redesign, private retrieval lane, full-text index migration, or ranking system.

## Locked Contract

1. Keep `GET /discover/search?q=` and its response shape unchanged.
2. For each visibility already returned by
   `discoverableDocumentVisibilities(req)`, query published documents by:
   - title;
   - nullable first-class summary; and
   - canonical body.
3. Use separate parameterized field queries rather than interpolating raw user
   input into a PostgREST `.or(...)` expression.
4. Merge and deduplicate by document id before the existing global eight-result
   cap. A document matching multiple fields must appear once.
5. Preserve deterministic field priority: title matches first, summary matches
   second, body-only matches third. Preserve existing visibility ordering
   within each field unless a focused test proves a safer established order.
6. Preserve the existing public document serializer, route construction,
   provenance fields, summary/body readback, and linked-discussion data.
7. Do not broaden visibility. Anonymous callers may see only currently
   discoverable public documents; eligible signed-in callers may additionally
   see only the already-authorized community/member documents. Private,
   unlisted, draft, archived, hidden, and cross-owner private material must not
   enter the public document group.
8. Keep `privateResults` owner-scoped and separate. Do not use public body search
   as a bridge into Memory, Archive, Continuity, private documents, imported
   text, or archived chats.
9. Do not broaden thread, Space, persona, Project, Developer Space, encounter,
   Salon, or owner-private matching in this lane.

## Required Tests

Extend focused Community/Discover coverage to prove:

- an anonymous title-only match still works;
- an anonymous summary-only phrase returns the public document;
- an anonymous body-only phrase returns the public document;
- a document matching title, summary, and body appears exactly once;
- result priority is title, then summary, then body-only before the eight-item
  cap;
- community/member body matches remain absent anonymously and present only to
  an eligible member;
- private, unlisted, draft, archived, and another owner's private body phrases
  never enter the public document group;
- signed-in owner-private results remain separated and do not gain body search
  accidentally; and
- response fields, safe Space document routeability, provenance, summary, body,
  and discussion id remain unchanged.

Run at minimum:

```text
npx --yes pnpm@10.32.1 test:community
npx --yes pnpm@10.32.1 test:document-discussions
npx --yes pnpm@10.32.1 --filter @station/api typecheck
git diff --check
```

## Boundaries

- Local API source and focused tests only.
- No migration, hosted write, deployment, corpus creation, web reskin, search
  index, cache, embedding, Redis, Cloudflare, provider, chat, or private Aster
  mutation.
- PR528B9 remains blocked with zero public fixture state until ARGUS accepts
  this repair and MIMIR authorizes deployment/retry.

## Result And Handoff

Create:

`docs/roadmap/PR528B10_PUBLIC_DOCUMENT_DISCOVER_TEXT_SEARCH_DAEDALUS_RESULT.md`

Use verdict:

```text
READY_PR528B10_PUBLIC_DOCUMENT_DISCOVER_TEXT_SEARCH_FOR_ARGUS
```

Commit and push, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS added deduplicated public document title/summary/body Discover search with existing visibility boundaries intact.
Verdict:
- READY_PR528B10_PUBLIC_DOCUMENT_DISCOVER_TEXT_SEARCH_FOR_ARGUS (or exact blocker)
Task:
- Route ARGUS review before deployment and PR528B9 retry.
```
