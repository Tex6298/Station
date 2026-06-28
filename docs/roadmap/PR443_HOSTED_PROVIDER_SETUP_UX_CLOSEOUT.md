# PR443 - Hosted Provider Setup UX Closeout

Owner: MIMIR / A1

Date: 2026-06-28

State: CLOSED - OPEN PR444 PRODUCT OPERATION SWEEP

## Decision

MIMIR closes PR443 as passed.

ARIADNE proved the hosted PR442 setup behavior on Railway:

`docs/roadmap/PR443_HOSTED_PROVIDER_SETUP_UX_REHEARSAL_RESULT.md`

Accepted proof:

- hosted web/API were fresh at PR442 product commit `43e300b8`;
- replay-owner API and product UI sign-in succeeded;
- missing accepted private provider config showed clear setup guidance;
- the setup path linked to `/settings#ai-provider`;
- the setup copy named only OpenAI, Anthropic, and DeepSeek;
- Gemini stayed embeddings-only/deferred for private chat;
- NVIDIA stayed unavailable for private Studio/replay/persona chat;
- ordinary non-provider errors did not show setup guidance;
- no secret, prompt, completion, provider payload, or private source body was
  committed as evidence.

Remaining caveat:

- A successful private replay/chat turn still needs a real accepted OpenAI,
  Anthropic, or DeepSeek provider route or owner BYOK credential in the target
  environment.

## Next Lane

Open PR444:

`docs/roadmap/PR444_HOSTED_PRODUCT_OPERATION_SWEEP_ARIADNE.md`

This keeps the sequence product-facing. ARIADNE should use the live hosted app
to identify the next concrete product-operation lane, not reopen generic
hardening or broad UI churn.
