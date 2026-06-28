# PR439 - BYOK Secret Storage And Rotation Preflight Result

Date reviewed: 2026-06-28

Reviewer: ARGUS / A3

Status: open DAEDALUS implementation - wake MIMIR

## Verdict

```text
OPEN DAEDALUS IMPLEMENTATION - APP-LEVEL ENCRYPTED BYOK STORAGE
```

Do not defer BYOK secret hardening beyond the current protected-alpha storage
surface. PR438 made owner BYOK key write access real in Settings, and the repo
already has a bounded app-level AES-256-GCM secret pattern in Developer Space
webhook signing secrets. The narrowest safe next move is to reuse that pattern
for OpenAI, Anthropic, and DeepSeek BYOK keys before making broader production
hardening claims or adding more provider-key persistence.

This preflight is docs-only. No code was implemented and no live provider calls
were run.

## Evidence Read

- `docs/roadmap/PR439_BYOK_SECRET_STORAGE_ROTATION_PREFLIGHT_ARGUS.md`
- `.station-agents/inbox/ARGUS/pr439-byok-secret-storage-rotation-preflight.md`
- `docs/roadmap/PR438_OWNER_BYOK_SETTINGS_UNBLOCK_REVIEW_RESULT.md`
- `docs/roadmap/PR438_OWNER_BYOK_SETTINGS_UNBLOCK_RESULT.md`
- `infra/supabase/migrations/001_initial_schema.sql`
- `infra/supabase/migrations/048_developer_space_webhook_signing_secrets.sql`
- `apps/api/src/services/developer-space.service.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `apps/api/src/routes/settings.ts`
- `apps/api/src/routes/settings.test.ts`
- `apps/api/src/routes/conversations.ts`
- `apps/api/src/services/embedding-key.service.ts`
- `apps/api/src/routes/persona-context.test.ts`
- `packages/ai/src/providers/router.ts`
- `packages/db/src/types.ts`

## ARGUS Answers

1. Current `profiles.byok_*_key` storage is acceptable only as the PR438 narrow
   unblock and temporary legacy fallback. It should not be the continuing
   production-hardening contract now that Settings can write keys.
2. DAEDALUS should reuse the existing app-level AES-256-GCM pattern, with a
   separate API-only env var: `AI_PROVIDER_KEY_ENCRYPTION_KEY`.
3. Use a separate owner-scoped provider-secret table, not encrypted JSON blobs
   on `profiles`. A separate table gives per-provider metadata, rotation,
   revocation, RLS, and compatibility without overloading profile rows.
4. Legacy plaintext compatibility should be temporary and lazy:
   - prefer encrypted rows;
   - if no encrypted row exists, allow existing plaintext profile keys as a
     fallback;
   - migrate on next owner save/rotation for that provider;
   - clear the legacy profile column when encrypted storage exists for that
     provider;
   - if an encrypted row exists but encryption config is missing or malformed,
     fail closed and do not fall back to plaintext.
5. Settings should show configured state, last four, and non-secret timestamps
   for last update/rotation/revocation where available. It must never prefill
   or return raw key material.
6. Provider routing should consume decrypted keys in memory only. No trace,
   provider payload, docs, UI, or error body should include raw keys, encrypted
   payloads, auth headers, prompts, completions, private context, or provider
   response bodies.
7. First-slice owner-visible audit should be the Settings readback metadata:
   provider, configured state, last four, storage status, updated timestamp,
   rotated timestamp, and revoked timestamp. Do not add a broad audit-log system
   or hosted readiness surface in this lane.
8. DAEDALUS must add focused storage, settings, routing, legacy fallback,
   missing-encryption-config, no-leak, and type/schema tests before waking
   ARGUS.

## DAEDALUS Task Packet

MIMIR may forward this as the implementation lane.

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARGUS completed PR439 BYOK secret storage preflight.
- Verdict: open app-level encrypted BYOK storage now.
- Scope is limited to OpenAI, Anthropic, and DeepSeek owner BYOK keys.
- Gemini chat remains deferred and private NVIDIA remains blocked.

Task:
Implement app-level encrypted BYOK key storage and rotation for existing owner
BYOK providers only.

Exact scope:
1. Add a Supabase migration for `public.ai_provider_byok_secrets`:
   - `id uuid primary key default gen_random_uuid()`;
   - `owner_user_id uuid not null references public.profiles(id) on delete cascade`;
   - `provider text not null check (provider in ('openai', 'anthropic', 'deepseek'))`;
   - `encrypted_key jsonb not null`;
   - `key_fingerprint text not null`;
   - `key_last_four text not null`;
   - `status text not null default 'active' check (status in ('active', 'revoked'))`;
   - `created_at timestamptz not null default now()`;
   - `updated_at timestamptz not null default now()`;
   - `rotated_at timestamptz`;
   - `revoked_at timestamptz`.
2. Add indexes:
   - unique active provider per owner:
     `(owner_user_id, provider) where status = 'active'`;
   - owner/provider/status lookup.
3. Enable RLS with owner-only read/write policy:
   `auth.uid() = owner_user_id`.
4. Add/update `packages/db/src/types.ts` for the new table.
5. Add an API service, for example
   `apps/api/src/services/ai-provider-key.service.ts`, that:
   - uses `AI_PROVIDER_KEY_ENCRYPTION_KEY`;
   - uses AES-256-GCM with payload schema
     `station.ai_provider.byok_key.v1`;
   - stores `{ schema, algorithm, iv, ciphertext, authTag }`;
   - derives a deterministic non-secret fingerprint without storing raw key
     material;
   - exposes `encrypt`, `decrypt`, `configured`, `lastFour`, and sanitized
     serialization helpers;
   - throws stable sanitized errors if encryption config is missing or payloads
     are malformed.
6. Update `GET/PATCH /settings/ai-provider`:
   - read encrypted active rows first;
   - use legacy `profiles.byok_*_key` only when no encrypted active row exists;
   - never return raw keys or encrypted payloads;
   - on key set/rotation, require `AI_PROVIDER_KEY_ENCRYPTION_KEY`, revoke the
     prior active encrypted row for that owner/provider, insert the new
     encrypted row, and clear the matching legacy profile column;
   - on clear/revoke, revoke active encrypted rows and clear the matching legacy
     profile column;
   - keep unsupported providers rejected by strict schema.
7. Update private persona chat/provider routing:
   - resolve owner BYOK keys through the new service;
   - prefer encrypted rows over legacy profile columns;
   - if encrypted storage exists but encryption config/decrypt fails, fail
     closed with sanitized provider-config copy and no provider call;
   - keep `allowPlatformNvidia:false` for private chat;
   - keep traces free of raw keys, encrypted payloads, prompts, completions,
     provider payloads, headers, and private context.
8. Update OpenAI embedding key resolution only as needed so owner OpenAI BYOK
   still works through the new encrypted source when the active embedding
   profile needs OpenAI. Do not change Gemini embedding policy or implement
   Gemini chat.
9. Update Settings UI/API client types to show only non-secret metadata:
   configured state, last four, storage status, updated timestamp, rotated
   timestamp, and revoked timestamp where available. Do not prefill raw keys.
10. Preserve temporary legacy compatibility:
    - legacy profile columns may be read only when no encrypted row exists;
    - any owner save/rotation/clear for a provider must clear that provider's
      legacy column;
    - do not add a bulk background migration in this lane.

Boundaries:
- Do not run live provider calls.
- Do not implement Gemini chat.
- Do not open private NVIDIA.
- Do not add a provider marketplace, model menu, custom endpoint UI, billing
  change, queue, worker, Redis, Cloudflare, hosted runtime change, or broad
  audit-log system.
- Do not print, commit, serialize, snapshot, or log real provider keys,
  secret-shaped values, encrypted key payloads, auth headers, prompts,
  completions, provider payloads, private context snippets, trace IDs, or raw
  owner/persona/conversation/source IDs.

Required validation before waking ARGUS:
- `npm exec --yes pnpm@10.32.1 -- run test:ai-settings`
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context`
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness`
- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces`
- `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts`
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck`
- `git diff --check`
- `git diff --cached --check`

Wake ARGUS when ready with:

WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented encrypted owner BYOK key storage for OpenAI,
  Anthropic, and DeepSeek.
- Legacy plaintext profile key fallback is temporary and migration-on-save only.
- Gemini chat remains deferred and private NVIDIA remains blocked.
Risk:
- Review encryption config fail-closed behavior, legacy fallback, key
  non-leakage, Settings readback, and private routing.
Task:
- Review PR439 implementation, run validation, and wake MIMIR with verdict.
```

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 53 tests passed; existing encrypted webhook signing-secret lifecycle remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:ai-settings` | Pass | 8 tests passed; current BYOK Settings non-leak and supported-provider coverage remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 11 tests passed; current owner BYOK private chat and private NVIDIA block remain green. |

## Wakeup

Wake MIMIR with this preflight verdict and the exact DAEDALUS task packet above.
