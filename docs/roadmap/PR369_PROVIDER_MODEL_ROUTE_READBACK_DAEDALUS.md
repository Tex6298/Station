# PR369 - Provider And Model Route Readback

Date opened: 2026-06-26
Opened by: A1 / MIMIR
Owner: DAEDALUS audits and patches. ARGUS reviews hostile privacy/overclaim
paths. ARIADNE rehearses only if user-visible route behavior changes.
Status: accepted by ARGUS.

## Why This Lane

PR368 closed with no worker activation. The next useful product/backend lane is
not another infrastructure guess; it is making Station's AI provider posture
boring and legible.

Current accepted truth:

- Gemini-backed `station_free_1536` is the active free-tier embedding profile
  for product testing.
- OpenAI `openai_1536` remains the native/rollback embedding profile.
- NVIDIA is acceptable as OpenAI-compatible platform chat in staging/dev.
- BYOK chat exists for supported providers such as OpenAI, Anthropic, and
  DeepSeek.
- Gemini chat is vocabulary/future option only until a real provider adapter,
  routing tests, and owner-visible policy gates exist.
- Developer Space provider policy exists as a privacy gate, but that policy
  does not by itself prove every provider call is safe or active.

The product must not imply "all models are live" when only specific routes are
implemented. It should also avoid hardcoding one provider as Station's identity:
embeddings, chat, BYOK, platform fallback, and future local/Cloudflare/NVIDIA
paths need distinct roles.

## Goal

Map the current provider/model truth and patch the smallest no-config gap that
prevents mystery routing.

An owner/operator should be able to understand, from safe readback or copy, the
difference between:

- chat provider route;
- embedding profile;
- provider mode: platform, BYOK, fallback, or inactive/future;
- data-policy boundary: public/synthetic, public context, private archive, or
  owner BYOK;
- what is configured versus merely supported by type vocabulary.

## Scope

DAEDALUS should inspect:

- `packages/ai/src/providers/router.ts`;
- provider-router tests;
- embedding profile/key helpers and metadata tests;
- Developer Space provider-policy helpers and tests;
- Studio/persona/provider labels in web components;
- health/deployment provider readiness;
- current docs that mention Gemini, NVIDIA, OpenAI, Anthropic, DeepSeek,
  `station_free_1536`, and `openai_1536`.

Implement only a bounded patch if one is clear, for example:

- owner-visible helper/copy that distinguishes Gemini embeddings from Gemini
  chat;
- provider-route readback that names platform/BYOK/fallback/inactive states
  without exposing keys;
- a safer label map so UI does not advertise an unimplemented chat provider as
  active;
- tests proving provider readiness/readback does not leak config or overclaim
  inactive providers.

If the audit finds that the current UI/docs are already honest enough, do not
patch. Wake MIMIR with the evidence and the next recommended lane.

## Non-Scope

Do not add:

- Gemini chat provider implementation;
- a provider marketplace;
- per-user paid model selection;
- new provider secrets or config requirements;
- embedding reindex/backfill;
- model-quality optimization;
- Cloudflare retrieval;
- Redis/Valkey worker or Memory truth;
- billing/entitlement changes;
- schema or migrations unless a tiny metadata readback bug makes them
  unavoidable, in which case wake MIMIR first.

## Acceptance Questions

1. Does any visible UI imply Gemini chat is live when only Gemini embeddings are
   active?
2. Can a developer/operator tell whether platform chat is using NVIDIA,
   Anthropic, DeepSeek fallback, or no configured provider without seeing
   secrets?
3. Can a developer/operator tell which embedding profile is active and which is
   rollback?
4. Do Developer Space provider-policy labels avoid implying private archive
   text can be sent to any provider without explicit policy?
5. Are provider failures classified as config/provider-policy/runtime failures
   rather than generic broken chat?
6. Is future provider expansion framed as roles and policy, not as one hardcoded
   model path?

## Validation

If code changes:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/ai test
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If docs-only:

```bash
git diff --check
```

## Handoff

If DAEDALUS patches code or user-visible copy, wake ARGUS with:

- changed files;
- exact provider overclaim or mystery-route gap closed;
- proof no provider keys/secrets/config values are exposed;
- proof no unimplemented provider was activated.

If no patch is needed, wake MIMIR with:

- provider/model route evidence;
- any remaining product caveat;
- recommended next lane.
