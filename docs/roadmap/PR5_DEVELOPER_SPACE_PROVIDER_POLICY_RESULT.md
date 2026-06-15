# PR 5 Developer Space Provider Policy Result

Date: 2026-06-15

Owner: A2 / DAEDALUS

Reviewed lane: `docs/roadmap/PR5_DEVELOPER_SPACE_PROVIDER_POLICY.md`

## Verdict

PR 5 is ready for ARGUS review.

This is a small behavior/status patch on the existing owner-only Developer
Space provider-policy evaluation surface. It does not add a provider
marketplace, BYOK secret storage/display, per-user provider billing, global
provider switching, embedding/vector changes, private archive provider calls,
or UI work.

## What Changed

- `POST /developer-spaces/:id/provider-policy/evaluate` now returns a
  non-secret `decision.posture` object alongside the existing decision fields.
- The posture explains provider policy, requested context, provider mode,
  selected provider route label, public/private context allow/deny state,
  private archive gate, active embedding profile code/provider/dimension, and
  OpenAI-compatible rollback profile assumptions.
- Sanitized AI observability metadata now includes the same posture object.
- The AI provider router now exposes `describePlatformProviderRoute`, returning
  `nvidia_openai_compatible` when an NVIDIA key is configured and
  `deepseek_fallback` otherwise, without exposing keys or URLs.

## Provider Posture Shape

The owner-only evaluation response now includes labels like:

```json
{
  "selectedProviderRoute": "nvidia_openai_compatible",
  "platformRoute": {
    "label": "nvidia_openai_compatible",
    "nvidiaConfigured": true
  },
  "embeddingProfile": {
    "profileCode": "station_free_1536",
    "provider": "gemini",
    "dimension": 1536,
    "activeUse": "active_product_testing",
    "rollbackProfile": {
      "profileCode": "openai_1536",
      "provider": "openai",
      "dimension": 1536,
      "status": "paid_or_rollback_assumption"
    }
  }
}
```

No provider key, base URL, prompt, completion, private archive excerpt, owner
ID, token, cookie, raw observability body, or replay credential is included.

## Boundary Evidence

- Private archive context remains denied unless policy is explicitly
  `private_archive_allowed`.
- `owner_byok_only` still fails closed when platform mode is requested.
- Platform route explanation distinguishes NVIDIA OpenAI-compatible chat from
  DeepSeek fallback in labels only.
- Active embeddings remain `station_free_1536`, provider `gemini`, dimension
  `1536`.
- OpenAI-compatible `openai_1536` remains described only as paid/rollback
  assumption.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npx --yes pnpm@10.32.1 test:developer-spaces` | Pass | 7 tests passed, including provider posture, private archive denial/allow, owner-BYOK fail-closed, and observability redaction. |
| `npx --yes pnpm@10.32.1 exec tsx --test packages/ai/test/provider-router.test.ts` | Pass | 5 provider-router tests passed, including route-label explanation without config exposure. |
| `npx --yes pnpm@10.32.1 test:replay-readiness` | Pass | 1 replay-readiness test passed. |
| `npx --yes pnpm@10.32.1 --filter @station/api build` | Pass | API and dependent package builds completed. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected CRLF normalization warnings. |

## ARGUS Handoff

Review for:

- overclaim risk in provider posture wording;
- private archive allow/deny behavior;
- owner-BYOK fail-closed behavior;
- NVIDIA-vs-DeepSeek label correctness;
- embedding profile explanation;
- observability sanitization;
- whether PR 5 can close or needs a narrow follow-up.
