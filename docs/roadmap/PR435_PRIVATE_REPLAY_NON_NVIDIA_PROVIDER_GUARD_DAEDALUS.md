# PR435 - Private Replay Non-NVIDIA Provider Guard

Date opened: 2026-06-28

Opened by: MIMIR / A1

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Status: open - prove or patch private chat cannot use NVIDIA

## Why This Lane

PR434 accepts NVIDIA platform chat only for public/synthetic-safe use. Private
Studio, Memory, Continuity, Archive, Integrity, Canon, selected replay context,
owner messages, and replay corpus traffic must not go through NVIDIA platform
calls.

Current code evidence shows the platform provider resolver prefers
`nvidia_openai_compatible` whenever `NVIDIA_AI_API_KEY` is present. Before
ARIADNE runs another private staged replay, DAEDALUS must make the accepted
policy executable for the private persona chat path.

This lane is not a model gateway, provider marketplace, embeddings switch, or
private-NVIDIA acceptance lane.

Inputs:

- `docs/roadmap/PR434_NVIDIA_PROVIDER_DATA_POLICY_PREFLIGHT_REVIEW_RESULT.md`
- `docs/roadmap/PR433_NVIDIA_PLATFORM_CHAT_SYNTHETIC_PROOF_RESULT.md`
- `packages/ai/src/providers/router.ts`
- `apps/api/src/routes/conversations.ts`
- `apps/api/src/services/ai-observability.service.ts`
- `apps/api/src/services/replay-readiness.service.ts`

## Task

Prove or patch the private persona chat route so private/replay context cannot
silently use NVIDIA just because the NVIDIA platform key exists.

Required behavior:

1. Public/synthetic NVIDIA probes may continue to use the existing
   `nvidia_openai_compatible` route.
2. Private persona chat, selected private runtime context, and staged replay
   chat must not route to NVIDIA platform calls.
3. If a non-NVIDIA platform provider is configured, private chat should use the
   accepted non-NVIDIA route.
4. If no accepted non-NVIDIA route is configured, private chat should fail
   closed with a sanitized provider/config or data-policy error.
5. Observability may record provider route, model, status, policy/deny labels,
   token/cost estimates, and latency only. It must not record raw prompts,
   completions, private context, provider payloads, secrets, URLs, cookies, or
   IDs.
6. Hosted readiness/readback should not imply private NVIDIA use is accepted.

If current repo already proves this, document the evidence and wake ARGUS.

If a gap exists, implement the narrowest guard and tests, then wake ARGUS.

If the only safe next action needs external config, wake MIMIR with the exact
non-secret config ask and do not run private NVIDIA calls.

## Boundaries

Do not:

- run hosted private chat through NVIDIA;
- send private archive text, Memory, Continuity, Integrity, Canon, selected
  replay context, real owner prompts, persona private profile text, source
  snippets, IDs, tokens, credentials, database URLs, provider payloads, cookies,
  or secrets to NVIDIA;
- change embeddings, vector dimensions, migrations, retrieval schema, Gemini,
  Cloudflare, Redis, workers, queues, Stripe, billing, public UX, broad
  provider policy, or model menus;
- make a production provider claim;
- weaken existing BYOK precedence or DeepSeek/Anthropic fallback tests.

## Expected Validation

Run the focused gates affected by the patch/proof:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If conversation-route/provider-policy tests exist or are added, run them too.

## Wakeup

Wake ARGUS with `WAKEUP A3:` when the proof or patch is ready.

Wake MIMIR with `WAKEUP A1:` only if the lane is blocked by missing accepted
non-NVIDIA config or an external product decision.
