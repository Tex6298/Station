# PR435 - Private Replay Non-NVIDIA Provider Guard Review Result

Date reviewed: 2026-06-28

Reviewer: ARGUS / A3

Status: accepted - wake MIMIR

## Verdict

```text
ACCEPTED
```

PR435 correctly makes the PR434 public/synthetic-only NVIDIA policy executable
for the private persona chat path. Private persona chat now resolves providers
with `allowPlatformNvidia:false`, preserving public/synthetic NVIDIA routeability
while preventing private runtime context from silently using NVIDIA platform
chat.

No ARGUS product patch was needed.

## Review Findings

Implementation match:

- `packages/ai/src/providers/router.ts` adds `allowPlatformNvidia` to the
  runtime route resolver.
- When NVIDIA is allowed, the public/synthetic default still prefers
  `nvidia_openai_compatible`.
- When NVIDIA is blocked for private context, the resolver uses accepted
  non-NVIDIA platform routes in order: Station Anthropic when configured, then
  DeepSeek when configured.
- When NVIDIA is blocked and no accepted non-NVIDIA platform route exists, the
  resolver returns `nvidia_platform_blocked_private_context` with
  `provider_policy_blocked` / `provider_data_policy` and no provider instance.
- `apps/api/src/routes/conversations.ts` passes `allowPlatformNvidia:false` for
  private persona chat before any provider call.
- The route exits with HTTP `503` before quota/provider fetch when the blocked
  route is unconfigured.

Privacy and trace boundary:

- The mounted private chat regression proves the only-NVIDIA private case makes
  no NVIDIA, DeepSeek, or Anthropic chat-provider fetch.
- The same test proves trace events include the safe blocked route label but not
  the owner prompt, private continuity context, or NVIDIA key material.
- Runtime budget trace payloads remain content-free counts and estimates; they
  do not store raw private source text.

Scope boundary:

- PR435 did not accept private NVIDIA usage.
- PR435 did not change embeddings, vector dimensions, retrieval schema,
  migrations, Gemini, Cloudflare, Redis, workers, queues, Stripe, billing, UI,
  model gateway, model menus, or broad provider policy.
- Public persona and public/synthetic routes can still use NVIDIA when allowed.
- Existing non-private resolver call sites are outside this private persona chat
  guard and are not broadened by this review.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts` | Pass | 12 tests passed, including blocked-private NVIDIA fallback/fail-closed behavior. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 10 tests passed, including mounted private chat no-NVIDIA guard and content-free runtime budget coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed; readiness labels NVIDIA as public/synthetic-only. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript typecheck passed. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Residual Risk

Private replay still needs accepted non-NVIDIA platform configuration or owner
BYOK in the target environment. If neither exists, private persona chat should
fail closed with the PR435 data-policy error.

NVIDIA remains available only for public-safe synthetic/provider probes unless
a later MIMIR lane explicitly accepts a private NVIDIA data contract and ARGUS
reviews the implementation.

## Wakeup

Wake MIMIR for closeout and next-lane sequencing.
