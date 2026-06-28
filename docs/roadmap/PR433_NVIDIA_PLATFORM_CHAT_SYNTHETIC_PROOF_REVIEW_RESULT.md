# PR433 - NVIDIA Platform Chat Synthetic Proof Review Result

Date reviewed: 2026-06-28

Reviewer: ARGUS / A3

Status: accepted with caveat - wake MIMIR

## Verdict

```text
ACCEPTED WITH EXACT-OUTPUT CAVEAT
```

PR433 is accepted as a synthetic-only NVIDIA platform-chat routeability proof.
The exact-output miss is an accepted model-behavior caveat for this lane,
because the lane proves route/config/model callability, not instruction
fidelity, private replay acceptance, provider policy, or product-provider
expansion.

No ARGUS product patch was needed.

## Review Findings

Implementation match:

- `apps/api/src/services/replay-readiness.service.ts` records PR433 under the
  existing `nvidia_platform_chat` setup proof.
- The readiness proof now states that `nvidia_openai_compatible` and the
  current `openai/gpt-oss-120b` model label are routeable.
- The remaining risk explicitly keeps exact-output compliance, NVIDIA usage
  accounting, and private/sensitive replay blocked until provider/data-policy
  boundaries are accepted.
- `apps/api/src/routes/replay-readiness.test.ts` pins the PR433 evidence and
  residual-risk text in authenticated, non-secret readiness output.

Proof boundary:

- The live NVIDIA probe was synthetic-only and did not send Station private
  archive text, Memory, Continuity, persona private profile text, replay corpus
  anchors, real user prompts, or source snippets.
- DAEDALUS recorded sanitized proof facts only: route label, provider mode,
  model labels, non-empty response boolean, and exact-match boolean.
- ARGUS reran the committed local provider-router, replay-readiness,
  persona-context, and API typecheck gates. The live provider probe is accepted
  as DAEDALUS's sanitized recorded evidence; no raw hosted proof artifact was
  added.

Privacy and scope:

- No prompt text, completion text, provider payload, key, cookie, token, owner
  ID, persona ID, trace ID, database URL, source snippet, or secret value was
  committed.
- PR433 did not switch embeddings to NVIDIA, change retrieval dimensions or
  schema, add Gemini chat, add a model gateway, add Cloudflare/Redis/workers/
  queues/background jobs/billing/Stripe, or alter production provider policy.
- PR433 must not be used as approval for private archive, Memory, Continuity,
  owner replay corpus, or real user prompt traffic through NVIDIA.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts` | Pass | 10 tests passed; NVIDIA route shape, alias trimming, BYOK precedence, and fallback behavior remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 9 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript typecheck passed. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Residual Risk

The current `openai/gpt-oss-120b` NVIDIA route is callable but not accepted for
exact wording, sensitive replay, private-data provider policy, provider usage
accounting, or product-provider expansion. MIMIR must make those decisions in a
separate lane before any private context is sent to NVIDIA.
