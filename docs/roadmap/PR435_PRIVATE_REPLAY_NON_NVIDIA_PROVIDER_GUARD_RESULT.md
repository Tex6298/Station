# PR435 - Private Replay Non-NVIDIA Provider Guard Result

Date: 2026-06-28

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Status: ready for ARGUS review

## Verdict

PR435 makes the PR434 policy executable for private persona chat.

Private persona chat now calls the provider resolver with
`allowPlatformNvidia: false`. That means:

- public/synthetic NVIDIA probes can still use `nvidia_openai_compatible`;
- owner BYOK precedence remains unchanged;
- accepted non-NVIDIA platform providers can serve private chat;
- if NVIDIA is the only platform provider, private chat fails closed with a
  sanitized data-policy error;
- no private prompt, selected context, Memory, Continuity, Archive, Integrity,
  Canon, replay corpus, provider payload, key, cookie, URL, or ID is sent to
  NVIDIA by the private chat route.

## Implementation

Code changes:

- `packages/ai/src/providers/router.ts`
  - adds `allowPlatformNvidia`;
  - keeps NVIDIA as the default platform preference when allowed;
  - chooses Station Anthropic or DeepSeek when NVIDIA is blocked and those
    routes are configured;
  - returns `nvidia_platform_blocked_private_context` with
    `provider_policy_blocked` / `provider_data_policy` when only NVIDIA is
    configured for private context.
- `apps/api/src/routes/conversations.ts`
  - passes `allowPlatformNvidia: false` for private persona chat.
- `apps/api/src/services/replay-readiness.service.ts`
  - records PR435 under the existing `nvidia_platform_chat` setup proof so
    readiness does not imply private NVIDIA acceptance.

Focused tests:

- Provider-router tests prove:
  - public/synthetic default still prefers NVIDIA when allowed;
  - BYOK precedence remains intact;
  - blocked NVIDIA falls back to Anthropic or DeepSeek when configured;
  - blocked NVIDIA fails closed when it is the only platform option.
- Mounted private conversation route test proves:
  - only-NVIDIA private chat returns HTTP `503`;
  - response code is `provider_policy_blocked`;
  - response classification is `provider_data_policy`;
  - no NVIDIA/DeepSeek/Anthropic chat-provider fetch is made;
  - trace events contain the safe blocked route label but not the owner prompt,
    private context, or key material.

## Validation

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts`
  passed, 12 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context` passed, 10 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed, 2 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.

## Boundaries

PR435 did not:

- run hosted private chat through NVIDIA;
- send private archive text, Memory, Continuity, Integrity, Canon, selected
  replay context, real owner prompts, persona private profile text, source
  snippets, IDs, tokens, credentials, database URLs, provider payloads, cookies,
  or secrets to NVIDIA;
- change embeddings, vector dimensions, migrations, retrieval schema, Gemini,
  Cloudflare, Redis, workers, queues, Stripe, billing, public UX, broad
  provider policy, or model menus;
- make a production provider claim.

## Residual Risk

Private replay still needs an accepted non-NVIDIA platform route or owner BYOK
route in the target environment. NVIDIA remains available only for public-safe
synthetic/provider probes unless a later MIMIR lane explicitly accepts a
private NVIDIA data contract.
