# PR295 - Selected Label Miss Retry Gate Result

Owner: DAEDALUS
Opened by: MIMIR
Date: 2026-06-25
Status: PASS WITH CAVEATS - accepted by ARGUS

## Summary

ARGUS accepts PR295 with a test-only hygiene patch.

PR295 repairs the selected-context answer-contract gate proven by ARIADNE's
PR294 hosted evidence.

The first answer can now match selected supporting facts while missing selected
labels/names and still trigger the existing one-shot answer-contract retry,
provided the existing safe gate applies:

- private persona chat,
- selected context is present,
- owner message is direct/factual,
- selected focus includes labels/names/titles,
- retry has not already happened.

## What Changed

- `apps/api/src/routes/conversations.ts` now treats
  `missed_selected_labels` as retryable alongside
  `missed_all_selected_focus`.
- `apps/api/src/routes/conversation-archive.test.ts` adds focused coverage for
  a facts-matched, label-missed first answer that retries exactly once and
  succeeds when the retry includes the selected label.
- The new coverage also asserts that provider-only selected-context scaffolding
  and the discarded first answer are not persisted as owner-visible user or
  assistant messages, and that raw selected strings remain absent from trace and
  session rows.
- ARGUS rewrote the new focused test's synthetic auth fixture to avoid a
  token-shaped added line; no product behavior changed.

## What Did Not Change

- No hosted probing was added.
- No provider/model selection changed.
- No embedding, retrieval ranking, context assembly, prompt fixture, schema,
  seed, import, Redis, Cloudflare, queue, worker, billing, Stripe, public UI, or
  Studio UI behavior changed.
- The one-shot retry maximum remains `1`.
- Creative/style selected-context prompts remain single-shot unless they include
  an explicit factual command.
- Sanitized trace/readiness output shape was not widened.
- Product code does not hardcode hosted replay labels, phrases, ids, prompts,
  completions, or private source bodies.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 38 tests passed, including label-miss retry, missed-all retry, creative no-retry, persisted-message boundary, and trace/session raw-string checks. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed; owner-scoped sanitized trace detail remains green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | 2 turbo tasks passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | Whitespace check passed. |
| `git diff --cached --check` | Pass | Staged whitespace check passed before ARGUS verdict. |
| Added-line hygiene scan | Pass | No credential-like values, emails, credentialed URLs, UUID-shaped ids, raw prompts, raw completions, private source bodies, or secret-bearing env values found in the PR295 ARGUS diff. |

The npm fallback runner emitted existing warnings about pnpm-only `.npmrc`
keys. Those are not Station validation failures.

## Caveats

- This is a gate repair only. It does not prove hosted answer quality until
  ARIADNE reruns the hosted replay after deploy.
- The answer-contract matcher still relies on sanitized term coverage counts;
  ARGUS accepted the `missed_selected_labels` retry boundary as narrow enough
  for the current private/direct/factual lane.

## ARGUS Review Request

ARGUS accepts the repair. MIMIR should open the next hosted ARIADNE rerun after
deploy.
