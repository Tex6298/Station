# PR528B8 - Document Discussion Owner Customization

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - smallest local API repair for blocked PR528B7

## Purpose

Add one bounded product-API operation that lets a document owner customize the
title and body of the document's existing linked discussion. This removes the
PR528B7 sequence contradiction without direct database writes, duplicate
threads, a general forum-edit surface, or a change to document comment
semantics.

## Decision

Implement owner-only `PATCH /documents/:id/discussion` in the document route.

The resumed public-corpus sequence will be:

1. create the exact draft with comments disabled;
2. publish it while comments remain disabled;
3. enable comments through the existing owner document update, allowing the
   helper to create exactly one linked discussion;
4. patch that same linked discussion through the new endpoint with the exact
   approved title and body; and
5. prove that no second linked thread exists.

Do not add a general thread-edit route. Do not weaken the forum rule that a
document with comments disabled cannot be discussed publicly. Do not use a
service-role bridge.

## Locked API Contract

- Require authenticated Private tier or above, then require document owner or
  platform admin exactly as the existing discussion-start route does.
- Accept only optional `title` and `body` fields, with at least one field
  required. Trim and bound them consistently with the existing forum thread
  create contract.
- Require an eligible published, non-private document with comments enabled.
  Disabled comments and otherwise ineligible documents remain `400` and do not
  mutate anything.
- Resolve only the document's canonical existing discussion through
  `discussion_thread_id`, with the existing linked-discussion recovery path as
  a fallback. If no existing linked discussion can be resolved, fail closed;
  this endpoint must not create a thread.
- Update only the requested `title` and/or `body` on that exact thread.
- Preserve category, author, document/Space/persona links, authorship and
  discussion provenance, visibility, status, moderation state, scores, counts,
  timestamps other than the normal thread update timestamp, and the document
  pointer.
- Repeating the same request must remain one-thread idempotent and must not
  create, hide, remove, or tombstone any thread.
- Return the normal serialized document-discussion shape so the caller can bind
  the exact thread id and readback.

## Tests

Extend focused document-discussion coverage to prove:

1. the owner enables comments, receives one helper-created discussion, patches
   its exact title/body, and reads those values back through both document
   discussion and thread detail routes;
2. repeating the patch retains exactly one linked thread;
3. title-only and body-only updates preserve the other field;
4. a non-owner is denied without mutation;
5. disabled-comments, private, missing-discussion, empty-payload, and malformed
   payload cases fail closed without mutation; and
6. linkage, visibility, provenance, moderation, score, and comment-count fields
   remain unchanged.

Run at minimum:

```text
npx --yes pnpm@10.32.1 test:document-discussions
npx --yes pnpm@10.32.1 test:community
npx --yes pnpm@10.32.1 --filter @station/api typecheck
git diff --check
```

## Boundaries

- Local source and focused tests only.
- No migration, hosted write, deployment, corpus creation, UI change, general
  forum editing, moderation change, provider work, or private Aster mutation.
- ARGUS must review this repair before any deployment or PR528B7 retry.

## Result And Handoff

Create:

`docs/roadmap/PR528B8_DOCUMENT_DISCUSSION_OWNER_CUSTOMIZATION_DAEDALUS_RESULT.md`

Use verdict:

```text
READY_PR528B8_DOCUMENT_DISCUSSION_OWNER_CUSTOMIZATION_FOR_ARGUS
```

Commit and push the bounded repair, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS added the owner-only existing document-discussion customization contract and focused tests.
Verdict:
- READY_PR528B8_DOCUMENT_DISCUSSION_OWNER_CUSTOMIZATION_FOR_ARGUS (or exact blocker)
Task:
- Route ARGUS review before deployment and PR528B7 retry.
```
