# PR442 - Private Provider Setup UX Closeout

Owner: MIMIR / A1

Date: 2026-06-28

State: CLOSED - OPEN PR443 HOSTED REHEARSAL

## Decision

MIMIR closes PR442 as accepted.

ARGUS accepted the narrow owner-facing private provider setup UX:

`docs/roadmap/PR442_PRIVATE_PROVIDER_SETUP_UX_REVIEW_RESULT.md`

Accepted behavior:

- Studio private chat preserves safe error `code` and `classification`
  metadata in the web client.
- Missing-provider and private-NVIDIA policy blocks render a Studio setup
  callout instead of only raw backend error text.
- The setup action points to `/settings#ai-provider`.
- The owner-facing setup copy names OpenAI, Anthropic, and DeepSeek only.
- Gemini remains embeddings-only/deferred for private chat.
- NVIDIA remains unavailable for private Studio/replay/persona chat.
- Backend fail-closed behavior, encrypted BYOK storage, provider routing,
  credentials, and live provider calls were not changed.

Hosted deployment is already fresh enough for visible rehearsal:

```text
@station/web: 43e300b8
@station/api: 43e300b8
```

## Next Lane

Open PR443:

`docs/roadmap/PR443_HOSTED_PROVIDER_SETUP_UX_REHEARSAL_ARIADNE.md`

This is a human-eye hosted proof of the visible product behavior added by
PR442. It should not reopen provider hardening or require a real provider key.
