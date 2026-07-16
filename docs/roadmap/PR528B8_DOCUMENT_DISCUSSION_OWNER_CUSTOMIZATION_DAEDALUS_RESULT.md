# PR528B8 - Document Discussion Owner Customization DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Ready for MIMIR routing to ARGUS

```text
READY_PR528B8_DOCUMENT_DISCUSSION_OWNER_CUSTOMIZATION_FOR_ARGUS
```

## Result

Added the bounded product operation:

```text
PATCH /documents/:id/discussion
```

The endpoint:

- requires authenticated Private tier or above;
- requires the document owner or a platform admin;
- accepts only optional trimmed `title` and `body` fields, with at least one
  required;
- preserves the forum thread limits of 300 title characters and 50,000 body
  characters;
- requires a published, non-private, comments-enabled document;
- resolves the document pointer first and the existing linked-discussion
  recovery path second;
- rejects a missing existing discussion without creating one;
- updates only the requested thread title and/or body; and
- returns the normal serialized document-discussion response.

The existing forum rule remains unchanged: a linked thread cannot be created
for a document while comments are disabled. No general thread-edit endpoint was
added.

## Contract Proof

Focused coverage now proves:

- enabling comments creates exactly one helper-owned linked discussion;
- the owner can customize that exact thread and read the copy back through both
  document-discussion and thread-detail routes;
- repeating the same customization retains one linked thread;
- title-only and body-only updates preserve the other field;
- anonymous and Visitor callers are blocked by auth/tier gates;
- an authenticated non-owner is denied without mutation;
- a platform admin may customize the same existing discussion;
- a missing document pointer can recover the existing linked thread without
  rewriting the pointer;
- a cross-document pointer cannot be used to mutate another thread;
- disabled-comments, private, missing-discussion, empty, whitespace-only,
  wrong-type, over-limit, and unknown-field payloads fail closed; and
- category, author, document/Space/persona links, authorship provenance,
  visibility, status, moderation state, score, counts, creation time, and the
  document pointer remain unchanged.

The route also returns a stable public error for a database update failure and
does not expose private database details.

## Validation

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:document-discussions` | Pass: 7 tests |
| `npx --yes pnpm@10.32.1 test:community` | Pass: 56 tests |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass |

## Boundaries

No migration, hosted write, deployment, public corpus creation, UI change,
general forum editing, moderation change, provider work, or private Aster
mutation occurred. PR528B7 remains paused until ARGUS accepts this repair and
MIMIR authorizes deployment and the revised corpus sequence.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS added the owner-only existing document-discussion customization contract and focused tests.
Verdict:
- READY_PR528B8_DOCUMENT_DISCUSSION_OWNER_CUSTOMIZATION_FOR_ARGUS
Task:
- Route ARGUS review before deployment and PR528B7 retry.
```
