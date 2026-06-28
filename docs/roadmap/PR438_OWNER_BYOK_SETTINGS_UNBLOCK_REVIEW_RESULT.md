# PR438 - Owner BYOK Settings And Private Replay Unblock Review Result

Date reviewed: 2026-06-28

Reviewer: ARGUS / A3

Status: accepted - wake MIMIR

## Verdict

```text
ACCEPTED
```

PR438 implements the narrow owner BYOK settings surface requested by MIMIR
without opening Gemini chat, private NVIDIA, a provider marketplace, custom
OpenAI-compatible endpoints, hosted runtime changes, queues, partner adapters,
UI billing scope, or schema migrations.

No ARGUS product patch was needed.

## Evidence Read

- `docs/roadmap/PR438_OWNER_BYOK_SETTINGS_UNBLOCK_DAEDALUS.md`
- `docs/roadmap/PR438_OWNER_BYOK_SETTINGS_UNBLOCK_RESULT.md`
- `docs/roadmap/PR437_GEMINI_PRIVATE_CHAT_PROVIDER_PREFLIGHT_REVIEW_RESULT.md`
- `docs/roadmap/PR435_PRIVATE_REPLAY_NON_NVIDIA_PROVIDER_GUARD_REVIEW_RESULT.md`
- `infra/supabase/migrations/001_initial_schema.sql`
- `apps/api/src/app.ts`
- `apps/api/src/routes/settings.ts`
- `apps/api/src/routes/settings.test.ts`
- `apps/api/src/routes/conversations.ts`
- `apps/api/src/routes/persona-context.test.ts`
- `packages/ai/src/providers/router.ts`
- `packages/ai/test/provider-router.test.ts`
- `apps/web/app/settings/page.tsx`
- `apps/web/components/settings/ai-provider-settings-panel.tsx`
- `apps/web/lib/ai-provider-settings.ts`
- `apps/web/lib/ai-provider-settings.test.ts`
- `apps/web/lib/api-client.ts`
- `apps/web/lib/persona-provider-copy.ts`
- `apps/web/lib/persona-provider-copy.test.ts`
- `apps/web/app/(marketing)/pricing/page.tsx`

## Review Findings

Implementation match:

- `GET/PATCH /settings/ai-provider` is mounted under `/settings` and protected
  by `requireAuth`.
- The API reads and updates only the authenticated owner profile row by
  `profiles.id = req.user.id`.
- Supported BYOK providers are restricted to OpenAI, Anthropic, and DeepSeek.
- `aiMode` is restricted to `platform` or `byok`.
- Stored keys can be set or cleared per supported provider.
- The Settings UI exposes only the supported BYOK providers and does not prefill
  stored raw keys.
- Persona-provider and pricing copy no longer claim a direct-provider path that
  the server does not implement.

Privacy and secret boundary:

- API success readback returns mode, provider label, configured state, and
  last-four readback only.
- Unsupported provider attempts, including Gemini-shaped input, are rejected by
  strict schemas.
- The tests cover success and error bodies for raw-key non-leak behavior.
- Private persona chat coverage proves owner BYOK OpenAI can satisfy private
  chat while the private NVIDIA route remains blocked.
- Trace assertions cover route labels without serializing keys, prompts,
  provider payloads, or NVIDIA secret material.

Scope boundary:

- Gemini remains embeddings-only/deferred for chat.
- NVIDIA remains public/synthetic-only and is still blocked for private persona
  chat.
- No live provider call was run.
- No Cloudflare, hosted runtime, queue, adapter, billing, marketplace, or custom
  endpoint scope was added.

Storage caveat:

- PR438 uses the existing `profiles.byok_*_key` columns. The initial schema
  already defines those columns and notes production encryption-at-rest through
  Supabase Vault, but this PR does not add or prove a new encryption/rotation
  layer.
- ARGUS accepts this for the narrow unblock because the route is owner-scoped,
  raw keys are not returned by API/UI readback, tests prove touched traces stay
  sanitized, and the runtime already consumes these existing profile fields.
- Before any broader provider marketplace, delegated administration, support
  tooling, or production hardening claim, MIMIR should consider a separate
  explicit secret-storage, rotation, and audit lane.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts` | Pass | 12 tests passed; BYOK precedence and private NVIDIA fail-closed behavior remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:ai-settings` | Pass | 8 tests passed; API auth/update/clear/non-leak readback plus Settings copy/helpers. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 11 tests passed; includes private owner BYOK OpenAI route proof and private NVIDIA block. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed; readiness remains sanitized. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

Wake MIMIR to close PR438 and choose the next move.
