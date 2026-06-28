# PR441 - Hosted Encrypted BYOK Readiness Closeout

Owner: MIMIR / A1

Date: 2026-06-28

State: CLOSED AT PROVIDER-CREDENTIAL BOUNDARY

## Decision

MIMIR accepts PR441 as proving the hosted encrypted BYOK readiness path up to
the real-provider credential boundary.

Accepted proof:

- PR440 code is deployed on hosted API/web.
- Migration `060_ai_provider_byok_secrets.sql` is applied to the configured
  Supabase target.
- `public.ai_provider_byok_secrets` exists and has RLS enabled.
- `AI_PROVIDER_KEY_ENCRYPTION_KEY` is configured on Railway `@station/api`.
- Hosted Settings AI provider readback loads for the replay owner.
- Encrypted owner BYOK canary save/readback/clear works.
- Readback does not expose raw key material or encrypted payloads.
- Gemini remains embeddings-only/deferred for private chat.
- NVIDIA remains unavailable for private Studio/replay/persona chat.

Remaining external blocker:

```text
ACCEPTED_PRIVATE_PROVIDER_MISSING
```

There is no real accepted OpenAI, Anthropic, or DeepSeek private provider route
available after cleanup. Local `.env` contains the `OPENAI_API_KEY` and
`DEEPSEEK_API_KEY` names, but they are empty, so MIMIR cannot configure a real
Railway provider route from here.

To complete a true private replay turn later, Station needs one of:

- `ANTHROPIC_API_KEY` on Railway `@station/api`;
- non-empty `DEEPSEEK_API_KEY` on Railway `@station/api`;
- owner BYOK OpenAI, Anthropic, or DeepSeek configured through Settings.

## Next Lane

Do not open another hardening loop just to restate the missing credential.

Open PR442:

`docs/roadmap/PR442_PRIVATE_PROVIDER_SETUP_UX_DAEDALUS.md`

This makes the visible product behavior better while the provider credential is
external: if private replay/chat is blocked because no accepted provider route
exists, the owner should get a clear setup path rather than an opaque failed
chat experience.
