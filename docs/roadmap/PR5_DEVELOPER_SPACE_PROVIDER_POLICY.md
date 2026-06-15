# PR 5 - Developer Space Provider Policy

Date opened: 2026-06-15

Opened by: A1 / MIMIR

Prerequisite: PR 4 Redis operational boundary accepted by A3 / ARGUS in
`9bc8e59`.

Owner: A2 / DAEDALUS first, then A3 / ARGUS.

Status: DAEDALUS result is ready for ARGUS review. See
`docs/roadmap/PR5_DEVELOPER_SPACE_PROVIDER_POLICY_RESULT.md`.

## Goal

Make Developer Space provider/data routing explicit enough that staging cannot
quietly send the wrong context to the wrong provider.

The replay claim to earn is:

> A Developer Space can explain its provider posture without exposing secrets:
> what context is allowed, which platform chat route is selected when configured,
> which embedding profile is active, and why private archive material is or is
> not allowed.

## Current Truth To Reconcile

- `developer_spaces.provider_policy` already exists and supports
  `public_synthetic_only`, `public_context_allowed`,
  `private_archive_allowed`, `owner_byok_only`, and `platform_allowed`.
- `POST /developer-spaces/:id/provider-policy/evaluate` already evaluates
  owner-only policy decisions and writes sanitized AI observability metadata.
- Platform chat routing currently prefers NVIDIA through the OpenAI-compatible
  adapter when `NVIDIA_AI_API_KEY` is configured, otherwise it falls back to the
  existing DeepSeek platform provider behavior.
- Active replay/staging embeddings are the `station_free_1536` profile backed by
  Gemini. OpenAI-compatible 1536 embeddings remain the paid/rollback profile,
  not the active free-tier product-testing path.
- Existing policy evaluation is a data/context gate. It should not imply a full
  provider marketplace or per-user billing/provider product.

## Scope

- Audit current Developer Space policy evaluation, serialization, tests,
  provider-router behavior, embedding-profile metadata, readiness docs, and
  observability payloads.
- Add or reconcile a small non-secret provider posture resolver if needed. It
  should explain:
  - Developer Space provider policy,
  - requested context and allow/deny reason,
  - provider mode (`platform` or `owner_byok`),
  - selected platform chat route label such as `nvidia_openai_compatible` or
    `deepseek_fallback`, without keys or URLs,
  - active embedding profile code/provider/dimension,
  - whether private archive context is permitted.
- Prefer extending the existing owner-only evaluation/read surface over adding a
  broad new route.
- Keep policy evaluation separate from actual LLM execution unless current code
  already executes a provider in the touched path.
- Add focused tests proving the selected provider route is explainable and that
  private archive remains denied unless `private_archive_allowed` is explicit.

## Do Not

- Do not build a full provider marketplace.
- Do not add per-user billing/provider complexity.
- Do not add BYOK secret storage or secret display.
- Do not switch active embeddings or vector dimensions.
- Do not switch chat providers globally.
- Do not send private archive text to any provider as part of this lane.
- Do not block current staging replay.
- Do not add Redis, Cloudflare, worker queue, Stripe, archive/import, or broad UI
  work.
- Do not print or commit provider keys, base URLs, prompts, completions, private
  archive excerpts, raw observability bodies, owner IDs, tokens, cookies, or
  replay credentials.

## Acceptance Gates

- The owner-facing policy/evaluation surface can explain the current
  Developer Space provider posture without secrets.
- Private archive context remains denied unless the policy is explicitly
  `private_archive_allowed`.
- `owner_byok_only` still fails closed when platform mode is requested.
- Platform route explanation distinguishes configured NVIDIA
  OpenAI-compatible chat from the DeepSeek fallback without exposing config
  values.
- Embedding profile explanation distinguishes active Gemini `station_free_1536`
  from OpenAI-compatible rollback assumptions without changing retrieval
  behavior.
- Sanitized AI observability contains only policy decision metadata, not prompt
  text, private archive chunks, provider keys, or raw provider payloads.

## Validation

Expected focused gate:

```bash
npx --yes pnpm@10.32.1 test:developer-spaces
npx --yes pnpm@10.32.1 exec tsx --test packages/ai/test/provider-router.test.ts
npx --yes pnpm@10.32.1 test:replay-readiness
npx --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If health/readiness provider wording changes, also run:

```bash
npx --yes pnpm@10.32.1 test:health
```

## Handoff

DAEDALUS should wake ARGUS with:

- files changed,
- whether the result is reconciliation-only or behavior-changing,
- provider posture response/metadata shape,
- private archive allow/deny evidence,
- NVIDIA-vs-fallback explanation evidence,
- embedding profile explanation evidence,
- sanitization evidence,
- validation run,
- remaining caveat if PR 5 should continue.
