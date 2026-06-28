# PR440 - Encrypted Owner BYOK Storage Review Result

Date reviewed: 2026-06-28

Reviewer: ARGUS / A3

Status: accepted after narrow ARGUS patch - wake MIMIR

## Verdict

```text
ACCEPTED AFTER NARROW ARGUS PATCH
```

PR440 implements the PR439 encrypted owner BYOK storage contract for OpenAI,
Anthropic, and DeepSeek without opening Gemini chat, private NVIDIA, provider
marketplace, custom endpoints, billing, queues, Cloudflare, hosted runtime, or
adapter scope.

ARGUS found and patched one narrow fail-closed bug before acceptance.

## ARGUS Patch

Issue found:

- `rotateAiProviderKey` revoked the active encrypted row before proving the new
  key could be encrypted. If `AI_PROVIDER_KEY_ENCRYPTION_KEY` was missing during
  a rotation attempt, the request returned `503` but could still revoke the
  existing active encrypted key.
- The Settings route also applied `aiMode` before key rotation, so a combined
  failed key save could still change mode.

Patch applied:

- Encrypt, fingerprint, and compute last-four metadata before revoking the
  active encrypted row.
- Apply key set/clear operations before updating `aiMode`.
- Add a regression test proving missing encryption config during rotation
  leaves the existing encrypted key active and leaves `ai_mode` unchanged.

## Evidence Read

- `docs/roadmap/PR440_ENCRYPTED_OWNER_BYOK_STORAGE_DAEDALUS.md`
- `docs/roadmap/PR440_ENCRYPTED_OWNER_BYOK_STORAGE_RESULT.md`
- `docs/roadmap/PR439_BYOK_SECRET_STORAGE_ROTATION_PREFLIGHT_RESULT.md`
- `infra/supabase/migrations/060_ai_provider_byok_secrets.sql`
- `packages/db/src/types.ts`
- `apps/api/src/services/ai-provider-key.service.ts`
- `apps/api/src/routes/settings.ts`
- `apps/api/src/routes/settings.test.ts`
- `apps/api/src/routes/conversations.ts`
- `apps/api/src/routes/persona-context.test.ts`
- `apps/api/src/services/embedding-key.service.ts`
- `apps/web/components/settings/ai-provider-settings-panel.tsx`
- `apps/web/lib/ai-provider-settings.ts`
- `apps/web/lib/ai-provider-settings.test.ts`
- `apps/web/lib/api-client.ts`

## Review Findings

Implementation match:

- `public.ai_provider_byok_secrets` is owner-scoped, provider-scoped, limited
  to OpenAI, Anthropic, and DeepSeek, and has a unique active provider row per
  owner.
- The encryption payload uses AES-256-GCM with BYOK-specific schema
  `station.ai_provider.byok_key.v1`.
- Settings readback prefers encrypted active rows and falls back to legacy
  profile columns only when no encrypted active row exists.
- Save/rotation writes encrypted key payloads, stores last-four/fingerprint
  metadata, and clears the matching legacy profile column.
- Clear/revoke revokes active encrypted rows and clears the matching legacy
  profile column.
- Settings UI displays non-secret storage status and timestamps only.

Privacy and runtime boundary:

- Private runtime key resolution decrypts encrypted keys in memory only.
- If encrypted storage exists but encryption config/decrypt is unavailable,
  private chat fails closed before conversation/message/provider side effects.
- Legacy plaintext fallback is temporary and only applies when no encrypted
  active row exists for that provider.
- API/UI/trace tests assert raw keys, encrypted payload fields, prompts,
  provider payloads, and private runtime content are not serialized.
- Gemini chat remains deferred.
- Private NVIDIA remains blocked through `allowPlatformNvidia:false`.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:ai-settings` | Pass | 12 tests passed; includes ARGUS regression for missing-config rotation preserving active encrypted key and `ai_mode`. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 12 tests passed; encrypted BYOK runtime preference, missing encryption fail-closed, and private NVIDIA block remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed; readiness remains sanitized. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 53 tests passed; existing encrypted Developer Space signing-secret lifecycle remains green. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts` | Pass | 12 tests passed; provider routing behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `git diff --check` | Pass | Passed with CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | Passed. |

## Wakeup

Wake MIMIR to close PR440 and decide the next move.
