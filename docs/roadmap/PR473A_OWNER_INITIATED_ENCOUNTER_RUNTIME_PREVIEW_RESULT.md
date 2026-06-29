# PR473A - Owner-Initiated Encounter Runtime Preview Result

Owner: DAEDALUS / A2

Date: 2026-06-29

Status: Ready for ARGUS review

## Summary

DAEDALUS implemented the accepted PR473A slice as a private Studio-only,
same-owner, owner-initiated encounter preview.

The private persona Studio home can now run one disposable preview where the
owner writes the setup, selects one same-owner responder persona, and receives
one model-generated responder reply. The preview is not saved, not a
transcript, not shareable, and does not retrieve Memory, Archive, Canon,
Continuity, Integrity, transcript, or public source buckets.

## Implementation

Files changed:

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/api/src/app.ts`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `package.json`

Runtime shape:

- `POST /persona-encounters/preview` is authenticated.
- The route verifies both selected personas belong to `req.user!.id` before
  any provider call.
- The owner-authored setup is trimmed and bounded.
- The provider call is direct through `provider.sendMessage`; it does not use
  `enqueueLlmCall` and does not retry provider failures.
- Provider configuration, token-budget checks, and encounter-specific
  per-minute/per-day operational-cache rate limits fail closed before any
  provider call.
- Token usage is recorded only after a successful provider response and uses
  `chatId: null`.
- The response contains bounded provenance labels for owner-authored setup,
  selected same-owner personas, model-generated responder reply, and disposable
  non-persistence.

Private Studio UI:

- The runtime preview panel renders only under the existing private persona
  Studio owner guard.
- The current persona is the initiator; the owner selects another owned persona
  as responder.
- The setup field is owner-authored.
- The visible readback says the preview is disposable, not saved, not a
  transcript, not shareable, and uses no private source retrieval buckets.
- Error copy stays bounded for cross-owner, provider-config, quota,
  rate-limit, and provider-failure cases.

## Non-Scope Confirmation

This patch does not add:

- durable conversation rows, conversation message rows, encounter transcripts,
  archived transcripts, drafts, generated documents, generated comments,
  generated threads, public posts, public/shareable encounter pages, or
  storage objects;
- Memory, Archive, Canon, Continuity, Integrity, transcript, public source, or
  retrieval-context reads for the preview;
- cross-owner encounters, public encounters, anonymous encounter participation,
  background conversations, scheduled encounters, autonomous loops, queue or
  worker execution, retry helper use, Redis, Cloudflare, schema, migration,
  storage, billing, Stripe, or broad UI;
- provider prompt/output persistence beyond token accounting with `chatId:
  null`.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/persona-encounters.test.ts` | Pass | 6 tests passed: same-owner preview, cross-owner block, provider-config fail-closed, quota fail-closed, rate-limit fail-closed, provider failure no retry. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-runtime.test.ts` | Pass | 4 tests passed: payload, readiness, provenance readback, bounded error copy. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 10 tests passed after package builds; covers API route and web helper together. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 158 tests passed, including the new encounter runtime helper. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Handoff

ARGUS should review PR473A against the accepted PR473 preflight boundaries:

- same-owner-only, owner-initiated, private Studio-only preview;
- one model-generated responder reply only;
- owner-authored setup, not model-generated initiator turn;
- both personas owned by `req.user!.id` before provider call;
- provider config, token budget, and encounter-specific rate limits fail
  closed before provider call;
- direct provider call with no `enqueueLlmCall` and no automatic retry;
- no durable transcript, message, conversation, archive, memory, canon,
  continuity, public/shareable, schema, migration, storage, queue, worker,
  Redis, Cloudflare, billing, or broad UI scope.

If ARGUS accepts this implementation, ARGUS should wake MIMIR for closeout or
hosted rehearsal routing. If fixes are needed, ARGUS should wake DAEDALUS with
the smallest repair.
