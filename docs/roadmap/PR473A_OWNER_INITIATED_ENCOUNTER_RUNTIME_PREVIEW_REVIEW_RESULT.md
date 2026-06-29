# PR473A - Owner-Initiated Encounter Runtime Preview ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-06-29

Status: Accepted after narrow ARGUS patch

## Verdict

ARGUS accepts PR473A after a narrow token-accounting correction.

The implementation matches the accepted PR473 preflight lane: private
Studio-only, same-owner-only, owner-initiated, non-durable, and limited to one
model-generated responder reply from a selected same-owner persona.

## Review Findings

Accepted boundaries:

- `POST /persona-encounters/preview` is authenticated.
- Both the initiator and responder personas are loaded through
  `owner_user_id = req.user!.id` before any provider call.
- The setup is owner-authored and bounded.
- Provider configuration, token budget, and encounter-specific per-minute and
  per-day operational-cache rate limits fail closed before provider calls.
- The route calls `provider.sendMessage` directly and does not use
  `enqueueLlmCall` or automatic retry behavior.
- Successful calls record token usage with `chatId: null`.
- The private Studio UI renders under the existing owner-only persona Studio
  guard and labels the preview as disposable, not saved, not a transcript, not
  shareable, and not sourced from Memory, Archive, Canon, Continuity,
  Integrity, transcripts, or public source retrieval.

Narrow ARGUS patch:

- The implementation used a conservative quota estimate of input prompt plus
  `maxOutputTokens`, but reused that combined estimate as fallback
  `inputTokens` when the provider returned no usage.
- ARGUS split the values so quota still reserves input plus output cap, while
  fallback token accounting records only the estimated input prompt as
  `inputTokens`.
- ARGUS added a regression assertion that derives the expected input estimate
  from the provider system/user messages and verifies the recorded transaction
  does not include the output cap in `input_tokens`.

Non-scope confirmation:

- No conversation, message, transcript, draft, archive, memory, canon,
  continuity candidate, generated document/comment/thread/post, public or
  shareable output, schema, migration, storage, queue, worker, Redis,
  Cloudflare, billing, Stripe, public route, cross-owner route, autonomous loop,
  retry helper, provider prompt persistence, provider output persistence, or
  broad UI scope was added.
- Diff-only secret-shaped scans found no real committed secret values; broad
  token-label matching hit only dummy `owner-token` test fixtures and token
  prop/type names.
- Diff-only scope scans found only expected route, test, and bounded UI/doc
  references for the accepted PR473A slice.

## Validation

ARGUS reran the requested validation after the accounting patch:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/persona-encounters.test.ts` | Pass | 6 tests passed, including same-owner success, cross-owner block, provider-config fail-closed, quota fail-closed, rate-limit fail-closed, no retry, and fallback input-token accounting. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-runtime.test.ts` | Pass | 4 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 10 tests passed after package builds. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 158 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Diff-only scope scan | Pass | Expected PR473A route/test/UI/doc references only. |
| Diff-only secret-shaped-pattern scan | Pass | No real committed secret values found; broad token-label hits were dummy `owner-token` test fixtures and token prop/type names only. |

## Residual Risk

Hosted owner-route visual rehearsal has not run for the new private Studio
preview panel. MIMIR should decide whether to close PR473A on ARGUS technical
acceptance or route ARIADNE for a hosted owner desktop/mobile rehearsal before
closeout.

## Handoff

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
```

MIMIR should close PR473A or route the narrow hosted owner-route visual
rehearsal. Do not broaden into public/shareable encounters, cross-owner
encounters, durable transcripts, source retrieval, queues/workers, Cloudflare,
Redis, billing, schema, migrations, or broader UI.
