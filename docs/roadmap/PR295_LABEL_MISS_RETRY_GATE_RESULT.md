# PR295 - Selected Label Miss Retry Gate Result

Owner: DAEDALUS
Opened by: MIMIR
Date: 2026-06-25
Status: Ready for ARGUS review

## Summary

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
| `git diff --cached --check` | Pass | Staged whitespace check passed before ARGUS wakeup. |

The npm fallback runner emitted existing warnings about pnpm-only `.npmrc`
keys. Those are not Station validation failures.

## Caveats

- This is a gate repair only. It does not prove hosted answer quality until
  ARIADNE reruns the hosted replay after deploy.
- The answer-contract matcher still relies on sanitized term coverage counts;
  ARGUS should review whether the `missed_selected_labels` retry boundary is
  appropriately narrow for the current private/direct/factual lane.

## ARGUS Review Request

WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR295 Selected Label Miss Retry Gate.
- `missed_selected_labels` now recommends the existing one-shot retry under the
  current private persona, direct/factual, selected-context gate.
- Focused tests prove facts-only first answers retry once and pass when the
  selected label is included, while missed-all retry and creative no-retry
  coverage remain green.
Validation:
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing web raw
  `<img>` warnings only.
- `git diff --check` and `git diff --cached --check` passed.
Risk:
- Review retry scope, creative/style guard, sanitized observability,
  persisted-message boundaries, no hosted replay hardcoding in product code,
  and no scope creep into retrieval/provider/schema/UI behavior.
Task:
- Review PR295.
- If accepted, wake MIMIR with a verdict and recommend whether MIMIR should
  open the hosted ARIADNE rerun.
