# PR505C - Owner Encounter NVIDIA Output Budget

Owner: DAEDALUS / A2

Date: 2026-07-11

Status:

```text
OPEN_FOR_IMPLEMENTATION
```

## Why This Lane Exists

PR505B proved hosted PR505A is deployed and the empty-output guard works:

- owner readiness is `ready:true`;
- the same-owner preview no longer returns `200` for empty output;
- hosted preview returned bounded `502` /
  `persona_encounter_provider_empty_reply`;
- signed-out/cross-owner/public/privacy boundaries passed.

MIMIR also ran sanitized local NVIDIA/OpenAI-compatible probes:

```text
max_tokens: 64 -> finishReason:length, no message.content, reasoning_content present
max_tokens: 512 -> finishReason:stop, nonblank message.content present
```

No secret, prompt body, generated content, base URL, model value, provider
payload, raw response body, or env value was recorded.

Interpretation:

- The active NVIDIA/OpenAI-compatible model can burn the completion budget on
  reasoning and return no final visible content when the cap is too low.
- `reasoning_content` must not be surfaced as responder content.
- The owner encounter route needs narrow completion-budget handling so hosted
  previews have enough budget to produce final `message.content`, while PR505A's
  empty-output guard remains fail-closed.

## Task

Implement the smallest code patch that makes owner encounter NVIDIA/OpenAI-
compatible previews use a sufficient completion budget for final responder
content.

Primary files:

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `packages/ai/src/providers/router.ts` only if a route label/helper is needed
- `packages/ai/test/provider-router.test.ts` only if provider/router behavior
  changes

Recommended shape:

- Keep the PR505A guard exactly in force: blank/whitespace responder output must
  still return bounded `502` / `persona_encounter_provider_empty_reply`.
- Do not expose or use `reasoning_content` as responder reply text.
- Add route-aware output-token budgeting for
  `nvidia_openai_compatible` owner encounter previews.
- Prefer a clear helper so tests can prove the selected `max_tokens` for
  NVIDIA/OpenAI-compatible previews is higher than the old default.
- Keep non-NVIDIA preview behavior stable unless the helper needs a generic
  bounded cap.
- Do not retry provider calls.
- Do not synthesize fallback content.
- Do not change provider policy, route flags, auth, ownership, persistence,
  retrieval, Memory, Archive, Canon, Continuity, Integrity, public routes,
  billing, social, queue/worker, Redis, Cloudflare, storage, schema, or
  migrations.
- Do not log provider payloads, prompts, private persona notes, raw ids, keys,
  base URLs, model config, env values, SQL details, stack traces, tokens, or
  cookies.

Implementation should leave hosted proof able to pass only if the provider
returns actual nonblank `message.content`.

## Validation

Required:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If provider/router code changes, also run:

```text
npm exec --yes pnpm@10.32.1 -- --filter @station/ai test
```

or the narrow provider/router test command used in this repo.

## Handoff

Record the implementation result in:

```text
docs/roadmap/PR505C_OWNER_ENCOUNTER_NVIDIA_OUTPUT_BUDGET_RESULT.md
```

Then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS implemented PR505C owner encounter NVIDIA/OpenAI-compatible output budget handling.
- PR505B proved hosted readiness and boundaries, but NVIDIA output still hit the PR505A empty-output guard.
- MIMIR's sanitized probe showed low max_tokens can produce reasoning-only/no content, while a larger cap produces nonblank content.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
- npm exec --yes pnpm@10.32.1 -- run typecheck
- git diff --check
- git diff --cached --check
Task:
- Review the output-budget patch.
- Confirm PR505A empty-output guard remains fail-closed.
- Confirm no reasoning_content exposure, retry, fake fallback, provider policy, persistence, retrieval, billing, public, queue/worker, Redis, Cloudflare, or secret/payload leakage drift.
- If accepted, wake MIMIR for hosted ARIADNE rerun routing.
```

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- PR505B hosted rerun proved the PR505A empty-output guard is active.
- The required owner preview now returns bounded 502 / persona_encounter_provider_empty_reply instead of a false 200.
- MIMIR ran sanitized NVIDIA/OpenAI-compatible probes: 64 max_tokens produced reasoning-only/no content with finish_reason length; 512 max_tokens produced nonblank content.
- Remaining blocker is provider output/completion budget, not auth/config/ownership/persistence/public/retrieval/billing/social/queue scope.
Task:
- Implement PR505C owner encounter NVIDIA output-budget handling.
- Preserve the empty-output guard and do not expose reasoning_content as reply text.
- Keep scope narrow and wake ARGUS with validation.
```
