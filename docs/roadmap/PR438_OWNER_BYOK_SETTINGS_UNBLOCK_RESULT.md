# PR438 - Owner BYOK Settings And Private Replay Unblock Result

Owner: DAEDALUS / A2

Date: 2026-06-28

State: ACCEPTED BY ARGUS - WAKE MIMIR

## Summary

DAEDALUS implemented the narrow owner BYOK settings surface requested by MIMIR.

What changed:

- added authenticated API read/update support at `GET/PATCH /settings/ai-provider`;
- readback returns `aiMode`, supported provider status, and last-four only where
  appropriate;
- supported BYOK providers are OpenAI, Anthropic, and DeepSeek only;
- raw keys are never returned by the API or Settings UI;
- stored keys can be cleared per provider;
- `/settings` now exposes an AI Provider panel for platform/BYOK mode and key
  setup;
- persona setup copy now points supported BYOK setup to Settings and keeps
  Gemini chat deferred;
- pricing BYOK copy no longer claims direct provider handling that the server
  route does not provide;
- private persona chat route coverage now proves owner BYOK OpenAI can satisfy
  private chat while private NVIDIA remains blocked.

## Safety Boundaries

Unchanged:

- no Gemini chat route was implemented;
- Gemini remains embeddings-only/deferred for private chat;
- no private NVIDIA route was opened;
- no provider marketplace, model menu, custom endpoint, or schema migration was
  added;
- no live provider call was run;
- tests use local fixture keys only and assert trace/readback surfaces do not
  serialize key material.

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts
```

Result: 12 tests passed.

```text
npm exec --yes pnpm@10.32.1 -- run test:ai-settings
```

Result: 8 tests passed.

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-context
```

Result: 11 tests passed.

```text
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
```

Result: 2 tests passed.

```text
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
```

Result: both passed.

Pending before commit:

```text
git diff --check
```

Result: passed with CRLF normalization warnings only.

```text
git diff --cached --check
```

Result: passed.

## Review Focus For ARGUS

- Confirm `/settings/ai-provider` never returns raw key values in success or
  error bodies.
- Confirm unsupported providers, especially Gemini and NVIDIA, cannot be
  configured through this surface.
- Confirm the Settings UI does not display raw stored key values after save or
  reload.
- Confirm private chat with owner BYOK still avoids NVIDIA and keeps trace
  payloads sanitized.
- Confirm the use of existing `profiles` columns is acceptable for this narrow
  unblock, or send the smallest secret-storage decision back to MIMIR.

## ARGUS Review

ARGUS accepted PR438 on 2026-06-28:

`docs/roadmap/PR438_OWNER_BYOK_SETTINGS_UNBLOCK_REVIEW_RESULT.md`

Decision:

- `/settings/ai-provider` is authenticated and owner-scoped.
- Readback does not return raw key values.
- Unsupported providers remain rejected.
- Settings UI is honest about supported BYOK providers, Gemini chat deferral,
  and private NVIDIA blocking.
- Private persona chat route coverage proves owner BYOK OpenAI can serve
  private chat while private NVIDIA remains blocked.
- Existing `profiles.byok_*_key` storage is acceptable for this narrow unblock,
  with a future secret-storage/rotation/audit lane recommended before broader
  production hardening claims.
