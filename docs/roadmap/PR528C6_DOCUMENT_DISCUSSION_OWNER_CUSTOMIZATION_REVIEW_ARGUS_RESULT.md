# PR528C6 - Document Discussion Owner Customization Review ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Accepted with narrow ARGUS safety patch

```text
ACCEPT_PR528B8_DOCUMENT_DISCUSSION_OWNER_CUSTOMIZATION_FOR_DEPLOYMENT
```

## Findings

DAEDALUS commit `ec15564c81fbedac23ab2abe20cade8dd5a6e915`
correctly added the bounded route, strict payload contract, owner/admin gate,
existing-thread-only update, stable error response, and focused one-thread
coverage. Hostile review found two safety gaps in the submitted source:

1. A pointer-resolved thread was accepted solely because its
   `linked_document_id` matched. The route did not require the thread author to
   be the document owner, so a document owner could edit another user's thread
   if that thread was linked to the document.
2. A canonical hidden or removed thread could have its title/body changed. The
   existing discussion-start and document-toggle helpers could also restore
   that moderation-restricted thread, allowing the new route's guard to be
   bypassed indirectly.

ARGUS made the smallest local route/test patch needed to close both gaps. No
blocking finding remains after the patch and validation below.

## Payload Contract

`PATCH /documents/:id/discussion` uses a strict Zod object with only optional
`title` and `body` fields and a refinement requiring at least one field.

| Input | Result |
| --- | --- |
| Empty object | `400` before document/thread mutation |
| Whitespace-only title or body | `400` after trimming |
| Wrong type | `400` |
| Unknown field | `400` |
| Title over `300` characters | `400` |
| Body over `50,000` characters | `400` |
| Valid title/body | Trimmed and preserved within the existing forum limits |

Title-only and body-only requests update only the requested column. Repeating
the same request remains one-thread idempotent.

## Authority And Eligibility

The route remains behind `requireAuth` and `requireTier("private")`. It then
loads the document and applies both existing boundaries:

- the caller must be able to read the document; and
- the caller must be the document owner or a platform admin.

Focused proof covers signed-out `401`, Visitor-tier `403`, readable non-owner
`403`, owner success, and platform-admin success. Admin authority is limited to
the document owner's canonical discussion; it does not turn this route into a
general or cross-owner thread editor.

The document must still be published, non-private, and comments-enabled.
Disabled comments, private visibility, and a missing discussion fail without a
thread or document mutation. The route does not enable comments, publish a
document, create a category or thread, weaken `POST /forums/threads`, or call
the discussion-creation helper.

## Canonical Resolution

The patched resolver now accepts a pointer-resolved thread only when all of the
following remain true:

- its exact `linked_document_id` is the requested document;
- its `author_user_id` is the document owner;
- its visibility matches the eligible document discussion visibility;
- status is readable `active` or `locked`;
- `is_hidden` is false; and
- moderation state is `normal` or `needs_review`.

If the pointer is missing or forged across documents, fallback queries only
owner-authored threads linked to the requested document and applies the same
visibility and moderation eligibility. A forged pointer with an eligible local
fallback updates only that fallback; the unrelated thread remains byte-for-byte
unchanged. A forged pointer without an eligible fallback remains `404` and
no-write.

ARGUS also tightened the surrounding read/start/synchronization helpers so a
forged document pointer cannot expose, restore, hide, lock, or otherwise mutate
the unrelated thread. The normal helper may still recover the eligible linked
discussion and repair the document pointer through its pre-existing path.

## Moderation Decision

Document-owner customization is allowed for a visible locked discussion,
including `needs_review`, because locking prevents new replies while leaving
the existing discussion readable. The route changes only title/body and
preserves the lock and review state.

Customization is not allowed when either the stored status/visibility flags or
moderation state mark the discussion hidden or removed. Owner and admin calls
both fail closed. The update itself repeats the author, document, category,
visibility, active-or-locked, non-hidden, and allowed-moderation predicates, so
a concurrent moderation action cannot be crossed between resolution and write.

The existing discussion-start route and comments-disable/re-enable helper now
honor the same moderation authority. A normal document-driven hidden/locked
discussion with moderation state `normal` can still be restored when comments
are re-enabled; a moderator-hidden or removed discussion cannot.

## Mutation Boundary

The database update constrains both exact thread id and linked document id,
plus the owner and moderation predicates above. Its payload contains only the
requested `title` and/or `body`.

Tests prove category, author, document/Space/persona links, authorship and
discussion provenance, visibility, status, moderation state, pin/hidden state,
scores, vote/reply counts, report count, creation time, and document pointer
remain unchanged. Only the normal thread `updated_at` effect is permitted.

Document-discussion and thread-detail readback return the same thread id and
customized copy. Repeated, title-only, and body-only calls leave exactly one
linked thread in the normal repair sequence.

Database update failures return only:

```json
{
  "error": "Could not update discussion thread.",
  "code": "document_discussion_update_failed"
}
```

Hostile database messages, table/column names, identifiers, private text,
URLs, tokens, provider payloads, and stack details are not exposed. The
specific discussion PATCH route remains before the generic document PATCH
route and does not collide with it.

## Validation

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:document-discussions` | Pass: `9/9` |
| `npx --yes pnpm@10.32.1 test:community` | Pass: `56/56` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass |

The npm launcher repeated only its existing warnings for pnpm-specific npm
configuration keys.

## Scope

The review patch changes only the document discussion route and focused test
harnesses. It adds no general thread-edit route, UI, migration, public corpus,
provider, chat, billing, queue, Cloudflare, or hosted behavior by itself.

No deployment or hosted write was performed. PR528B7 remains paused until
MIMIR serializes deployment of the accepted source and separately authorizes
the revised public-corpus retry.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS hostile-reviewed the owner-only existing document-discussion customization repair.
Verdict:
- ACCEPT_PR528B8_DOCUMENT_DISCUSSION_OWNER_CUSTOMIZATION_FOR_DEPLOYMENT
Task:
- If accepted, serialize deployment and the revised PR528B7 public-corpus retry.
```
