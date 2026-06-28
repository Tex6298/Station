# PR441 - Hosted Encrypted BYOK Readiness Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Goal

Run a human-eye hosted rehearsal for the encrypted owner BYOK path that PR440
made safe. The target is the Railway-hosted Station web/API environment.

This lane is about deployment truth, config truth, and visible owner flow truth.
It is not a broad UI redesign, provider marketplace, Gemini chat lane, private
NVIDIA lane, Cloudflare lane, Redis lane, billing lane, or memory/retrieval
rewrite.

## URLs

Primary hosted web URL:

```text
https://stationweb-production.up.railway.app
```

Use the current deployed Station API wiring from the hosted web runtime. Do not
print secrets, tokens, cookies, bearer headers, raw provider keys, raw encrypted
payloads, or private source bodies.

## Preconditions To Check

Check these as presence/readiness facts only:

1. The hosted deployment is fresh enough to include PR440.
2. The hosted API can reach the Supabase schema containing
   `public.ai_provider_byok_secrets`.
3. The API has `AI_PROVIDER_KEY_ENCRYPTION_KEY` configured well enough to save
   and rotate an owner BYOK key.
4. The owner can open Settings and see the AI provider settings panel.

Named config blockers:

- `STALE_DEPLOYMENT`: hosted deployment is older than PR440.
- `MIGRATION_060_NOT_APPLIED`: Settings/API path errors because
  `ai_provider_byok_secrets` is missing or inaccessible.
- `AI_PROVIDER_KEY_ENCRYPTION_KEY_MISSING_OR_INVALID`: save/rotation fails
  because encryption config is unavailable or malformed.
- `ACCEPTED_PRIVATE_PROVIDER_MISSING`: encrypted BYOK storage works, but no
  real OpenAI/Anthropic/DeepSeek owner BYOK or platform config is available for
  a private replay turn.

## Rehearsal

### 1. Settings Readback

Open the signed-in account settings route and find the AI provider settings
panel.

Pass conditions:

- The panel loads without a route error.
- OpenAI, Anthropic, and DeepSeek are the only owner BYOK chat providers exposed
  by this surface.
- Gemini is not presented as private chat.
- NVIDIA is not presented as private chat.
- Existing provider readback shows only configured/unconfigured state,
  provider labels, last-four style metadata, storage status, and timestamps.
- No raw key or encrypted payload appears in the UI, network-visible JSON, or
  console output.

### 2. Non-Secret Storage Canary

If no real test provider key is available to ARIADNE, use a clearly fake,
non-secret canary value only to prove save/readback/clear behavior. Do not use a
canary for private chat.

Pass conditions:

- Saving the canary succeeds only when the hosted API encryption key is
  configured.
- Readback does not return the raw canary.
- Readback shows non-secret configured/storage metadata.
- Clearing the provider removes configured readback.
- The canary is cleared before the rehearsal ends.

If save fails because encryption config is missing or malformed, stop the
mutation path and wake MIMIR with
`AI_PROVIDER_KEY_ENCRYPTION_KEY_MISSING_OR_INVALID`.

### 3. Private Replay Route

Only run this step if there is a real accepted private provider route:

- owner BYOK OpenAI, Anthropic, or DeepSeek; or
- platform OpenAI, Anthropic, or DeepSeek configured for private replay.

Pass conditions:

- Private replay/persona chat can answer a bounded staging prompt.
- The request does not route to NVIDIA.
- The answer does not expose private archive/source bodies beyond the existing
  owner-visible replay context contract.
- Provider traces/readback do not show raw keys, encrypted payloads, bearer
  headers, raw prompts, raw completions, or provider payloads.

If encrypted storage works but no real accepted provider credential is
available, wake MIMIR with `ACCEPTED_PRIVATE_PROVIDER_MISSING`. That is a
config-blocked hosted result, not a DAEDALUS defect.

## Wakeup Rules

Wake MIMIR with:

- `PASS`: hosted deployment, migration, encryption config, Settings flow, and
  private replay route are proven; or
- one named config-blocked verdict from above; or
- `PRODUCT_DEFECT_NEEDS_DAEDALUS` with the exact defect if the hosted code is
  deployed/configured but behavior is wrong.

Wake DAEDALUS only for a concrete product defect. Include route, action,
expected behavior, actual behavior, and non-secret evidence.
