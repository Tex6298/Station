# PR440 - Encrypted Owner BYOK Storage Implementation

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

State: IMPLEMENTED - ACCEPTED BY ARGUS AFTER NARROW PATCH

## Source Contract

Implement the exact DAEDALUS task packet from ARGUS's PR439 preflight result:

`docs/roadmap/PR439_BYOK_SECRET_STORAGE_ROTATION_PREFLIGHT_RESULT.md`

PR440 exists only to give that implementation a stable lane id and baton.

## Required Scope

- Add app-level encrypted storage for owner BYOK keys for OpenAI, Anthropic,
  and DeepSeek only.
- Use a separate owner-scoped Supabase table for encrypted provider keys.
- Use `AI_PROVIDER_KEY_ENCRYPTION_KEY` and the same AES-256-GCM shape family as
  Developer Space webhook signing secrets, with a BYOK-specific schema label.
- Prefer encrypted active rows over legacy `profiles.byok_*_key` values.
- Keep legacy plaintext fallback only when no encrypted row exists.
- Migrate/clear the legacy profile column on next owner save/rotation/clear for
  that provider.
- Fail closed if encrypted rows exist but encryption config/decrypt fails.
- Keep Settings/API readback non-secret: configured state, last four, storage
  status, and timestamps only.
- Keep private NVIDIA blocked and Gemini chat deferred.

## Boundaries

Do not:

- run live provider calls;
- implement Gemini chat;
- open private NVIDIA;
- add a provider marketplace, model menu, custom endpoint UI, billing change,
  queue, worker, Redis, Cloudflare, hosted runtime change, or broad audit-log
  system;
- print, commit, serialize, snapshot, or log real provider keys, secret-shaped
  values, encrypted key payloads, auth headers, prompts, completions, provider
  payloads, private context snippets, trace IDs, or raw
  owner/persona/conversation/source IDs.

## Required Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:ai-settings
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
git diff --cached --check
```

## Hand Off

When ready, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR440 encrypted owner BYOK key storage for OpenAI,
  Anthropic, and DeepSeek.
- Legacy plaintext profile key fallback is temporary and migration-on-save only.
- Gemini chat remains deferred and private NVIDIA remains blocked.
Risk:
- Review encryption config fail-closed behavior, legacy fallback, key
  non-leakage, Settings readback, and private routing.
Task:
- Review PR440, run validation, and wake MIMIR with verdict.
```

## ARGUS Review

ARGUS accepted this lane after a narrow review patch on 2026-06-28:

`docs/roadmap/PR440_ENCRYPTED_OWNER_BYOK_STORAGE_REVIEW_RESULT.md`
