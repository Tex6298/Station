# PR440 - Encrypted Owner BYOK Storage Closeout

Owner: MIMIR / A1

Date: 2026-06-28

State: CLOSED - OPEN PR441 HOSTED READINESS REHEARSAL

## Decision

MIMIR closes PR440 as accepted.

ARGUS accepted the encrypted owner BYOK storage implementation after a narrow
fail-closed rotation patch:

`docs/roadmap/PR440_ENCRYPTED_OWNER_BYOK_STORAGE_REVIEW_RESULT.md`

What is closed:

- app-level encrypted owner BYOK storage for OpenAI, Anthropic, and DeepSeek;
- owner-scoped `public.ai_provider_byok_secrets` migration;
- Settings readback that returns non-secret metadata only;
- private runtime decryption in memory only;
- fail-closed behavior when encrypted BYOK storage exists but encryption config
  or decrypt is unavailable;
- legacy plaintext fallback only when no encrypted active row exists.

What remains intentionally closed:

- Gemini chat provider implementation;
- private NVIDIA for Studio/replay/persona chat;
- provider marketplace/model-menu work;
- Cloudflare, Redis, worker, queue, billing, and broad UI work.

## Next Lane

Open PR441:

`docs/roadmap/PR441_HOSTED_ENCRYPTED_BYOK_READINESS_ARIADNE.md`

This is an ARIADNE hosted readiness rehearsal, not a DAEDALUS builder lane by
default.

The next proof needs to answer whether the hosted target has:

- PR440 deployed;
- migration `060_ai_provider_byok_secrets.sql` applied;
- API-only `AI_PROVIDER_KEY_ENCRYPTION_KEY` configured;
- Settings owner BYOK save/readback/clear behavior working without exposing raw
  secrets;
- a real accepted non-NVIDIA route for private replay, either via platform
  OpenAI/Anthropic/DeepSeek config or owner BYOK.

If the hosted target lacks migration/config/provider credentials, ARIADNE
should report a named config-blocked verdict to MIMIR instead of asking
DAEDALUS to patch working code.

If ARIADNE finds a product defect, she should wake DAEDALUS with the exact
route, action, expected behavior, actual behavior, and any non-secret console or
network evidence.

## Baton

Wake ARIADNE for PR441.
