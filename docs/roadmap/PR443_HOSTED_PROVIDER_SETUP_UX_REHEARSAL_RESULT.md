# PR443 - Hosted Provider Setup UX Rehearsal Result

Date: 2026-06-28

Reviewer: ARIADNE / A4

Status: complete - pass

## Verdict

```text
PASS
```

The hosted PR442 provider-setup UX behaves like a clear product path instead of
a broken private chat. Missing accepted private provider config now produces a
setup callout that points the owner to AI Provider settings and names only the
accepted private setup providers.

## Deployment Gate

Hosted deployment freshness passed:

| Surface | Result | Service | Runtime commit |
| --- | --- | --- | --- |
| Web `/health/deployment` | HTTP 200, ready | `@station/web` | `43e300b8` |
| API `/health/deployment` | HTTP 200, ready | `@station/api` | `43e300b8` |

Both hosted surfaces were at the PR442 product commit.

## Provider Setup Path

The replay owner signed in through the hosted API and product UI. The replay
owner still has no accepted private route configured:

| Route source | Status |
| --- | --- |
| Platform Anthropic | not configured |
| Platform DeepSeek | not configured |
| Owner BYOK OpenAI | not configured |
| Owner BYOK Anthropic | not configured |
| Owner BYOK DeepSeek | not configured |
| Platform NVIDIA | configured, but not accepted for private Studio/replay/persona chat |

ARIADNE exercised the private Studio/replay persona chat path with a bounded
non-secret setup prompt. The owner-visible callout:

- appeared when private chat could not run;
- said private chat needs an accepted provider;
- pointed to `/settings#ai-provider`;
- named OpenAI, Anthropic, and DeepSeek as the setup path;
- kept Gemini as embeddings-only;
- kept NVIDIA unavailable for private Studio/replay chat.

## Settings Link

The setup action opened Settings at the AI Provider panel. The panel was
visible and exposed only OpenAI, Anthropic, and DeepSeek owner BYOK inputs.
Gemini and NVIDIA were not presented as private chat provider inputs.

## Non-Provider Error Check

ARIADNE also exercised the hosted web client with a browser-routed ordinary
non-provider chat failure. That ordinary error rendered as ordinary error copy
and did not show provider setup guidance.

This check did not call the hosted provider route and did not mutate provider
configuration.

## Privacy Notes

- No provider key, encrypted payload, credential, provider payload, prompt,
  completion, private source body, cookie, session value, screenshot, or raw
  network body is included in this committed evidence.
- The probe did not mutate owner BYOK config, billing, provider config, Redis,
  Cloudflare, Supabase schema, migrations, workers, queues, embeddings,
  vectors, or replay seed data.
- Console and response scans found no credential-shaped values or encrypted
  payload fields.

## Validation

- Hosted web/API `/health/deployment`: passed.
- Hosted API replay-owner sign-in: passed.
- Hosted product UI replay-owner sign-in: passed.
- Hosted private provider setup callout: passed.
- Settings AI Provider link target/readback: passed.
- Ordinary non-provider error rendering: passed.
- Leak scan over relevant UI text, console output, and inspected responses:
  passed.
- `git diff --check`: passed with line-ending normalization warnings only.
- Typecheck: not run; this result only updates docs.
