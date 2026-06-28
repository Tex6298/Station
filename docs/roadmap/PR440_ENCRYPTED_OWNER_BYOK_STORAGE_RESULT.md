# PR440 - Encrypted Owner BYOK Storage Result

Owner: DAEDALUS / A2

Date: 2026-06-28

State: ACCEPTED BY ARGUS AFTER NARROW PATCH - WAKE MIMIR

## Summary

DAEDALUS implemented app-level encrypted owner BYOK storage for OpenAI,
Anthropic, and DeepSeek.

What changed:

- added `public.ai_provider_byok_secrets` migration with owner/provider/status
  lookup, a unique active provider row per owner, updated-at trigger, and
  owner-only RLS;
- updated hand-authored DB types for the new table;
- added `AI_PROVIDER_KEY_ENCRYPTION_KEY` AES-256-GCM encryption/decryption
  service using payload schema `station.ai_provider.byok_key.v1`;
- added deterministic non-secret key fingerprint and last-four metadata;
- changed Settings API readback to prefer encrypted active rows, fall back to
  legacy profile columns only when no encrypted row exists, and expose only
  non-secret metadata;
- changed Settings API save/rotation to require encryption config, revoke prior
  active encrypted rows, insert the new encrypted row, and clear the matching
  legacy profile column;
- changed Settings API clear to revoke active encrypted rows and clear the
  matching legacy profile column;
- changed private persona chat/runtime key resolution to decrypt active
  encrypted rows in memory only and fail closed if encrypted storage exists but
  encryption config/payload decrypt is unavailable;
- updated OpenAI embedding key resolution to accept the decrypted owner OpenAI
  key when the active embedding profile needs OpenAI;
- updated Settings UI readback for storage status and timestamps.

## Safety Boundaries

Unchanged:

- Gemini chat remains deferred and was not implemented.
- Private NVIDIA remains blocked for private persona/replay chat.
- No provider marketplace, model menu, custom endpoint UI, billing, queue,
  worker, Redis, Cloudflare, hosted runtime, or broad audit-log work was added.
- No live provider calls were run.
- Tests use local fixture values and assert API/UI/trace responses do not
  serialize raw key material or encrypted payload fields.

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- run test:ai-settings
```

Result: 11 tests passed.

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-context
```

Result: 12 tests passed.

```text
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
```

Result: 2 tests passed.

```text
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
```

Result: 53 tests passed.

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts
```

Result: 12 tests passed.

```text
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
```

Result: both passed.

```text
git diff --check
```

Result: passed with CRLF normalization warnings only.

```text
git diff --cached --check
```

Result: passed.

## Review Focus For ARGUS

- Confirm `AI_PROVIDER_KEY_ENCRYPTION_KEY` missing/malformed behavior fails
  closed for encrypted runtime reads.
- Confirm legacy `profiles.byok_*_key` fallback is used only when no encrypted
  active row exists for that provider.
- Confirm save/rotation/clear clears the matching legacy profile column.
- Confirm Settings readback never returns raw keys or encrypted payloads.
- Confirm private chat uses decrypted key material in memory only and keeps
  traces free of keys, encrypted payloads, prompts, completions, provider
  payloads, headers, and private context.
- Confirm Gemini chat remains deferred and private NVIDIA remains blocked.

## ARGUS Review

ARGUS accepted PR440 after a narrow review patch on 2026-06-28:

`docs/roadmap/PR440_ENCRYPTED_OWNER_BYOK_STORAGE_REVIEW_RESULT.md`

Patch summary:

- `rotateAiProviderKey` now encrypts, fingerprints, and computes last-four
  metadata before revoking the active encrypted row.
- Settings PATCH now applies key set/clear operations before updating `aiMode`.
- A regression test proves missing encryption config during rotation preserves
  the existing encrypted key and leaves `ai_mode` unchanged.
