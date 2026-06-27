# PR394 - Owner Publication Retract Contract Result

Owner: A2 / DAEDALUS
Status: Accepted by ARGUS
Completed: 2026-06-27

## Summary

PR394 makes the owner publication retract contract explicit without adding a
new deletion workflow or hosted mutation proof.

What changed:

- `/studio/publishing` now shows `Retract to private` for owner-visible
  published documents whose visibility is public-readable.
- The action uses the existing authenticated owner `PATCH /documents/:id`
  contract with `{ visibility: "private" }`.
- Successful retraction updates dashboard state in place and surfaces copy that
  the document is private, public readers and linked discussion routes can no
  longer open it, and the owner-visible record remains in Studio.
- Public `View` links now render only for Space-backed published documents with
  public-readable visibility (`public`, `community`, or `unlisted`).
- Publishing helper tests cover public route gating and retraction copy.
- Document discussion tests now prove repeated owner retraction is idempotent
  enough for staging rehearsal: the linked thread remains public-hidden, public
  document reads 404, and the owner can still read the private document.

## Scope Kept Closed

No hard delete cleanup was added. No threads or comments are deleted. No hosted
publish/retract/delete mutation was run. No Station Press, social dispatch,
rich text, scheduling, provider/model, Redis, Cloudflare, worker/queue,
billing, Stripe, schema, or migration scope was opened.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 14 tests passed, including the new retraction helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 2 tests passed, including idempotent private retraction and linked-thread hiding. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 22 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 127 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript check passed. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization warnings only. |

## ARGUS Review

Verdict: `PASS`.

ARGUS accepts PR394 as a narrow owner publication retract contract:

- The dashboard action uses the existing authenticated owner
  `PATCH /documents/:id` path, which scopes updates by `author_user_id`.
- The action is guarded to public-readable published documents and updates the
  owner dashboard state in place after success.
- Public `View` links now require a Space-backed published document with
  public-readable visibility; retracted/private published documents no longer
  get a public route link.
- Existing server-side discussion sync hides the linked thread when the document
  becomes private, and the new coverage proves repeated private retraction keeps
  public document and thread reads hidden while owner readback remains
  available.
- Copy is honest: this is visibility/hide behavior, not deletion or artifact
  cleanup.
- Scope stayed closed: no hard delete cleanup, thread/comment deletion, hosted
  mutation, Station Press, social dispatch, rich text, scheduling,
  provider/model, Redis, Cloudflare, worker/queue, billing, Stripe, schema, or
  migration work was added.
- ARGUS reran the requested validation successfully.

MIMIR can close PR394 as `PASS`. If a full hosted mutation proof is now useful,
the next lane should be an ARIADNE publish-and-retract rehearsal that uses this
contract and explicitly avoids hard delete cleanup claims.
