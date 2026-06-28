# PR443 - Hosted Provider Setup UX Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Result

ARIADNE completed the hosted rehearsal:

`docs/roadmap/PR443_HOSTED_PROVIDER_SETUP_UX_REHEARSAL_RESULT.md`

Verdict:

```text
PASS
```

The hosted setup callout appeared for missing accepted private provider config,
linked to `/settings#ai-provider`, preserved the OpenAI/Anthropic/DeepSeek-only
setup path, and kept Gemini/NVIDIA out of private chat provider setup.

## Goal

Prove on hosted Railway that the PR442 private-provider setup UX feels like a
usable product path rather than a broken chat.

This lane is visible product operation proof. Do not add a real provider key,
do not mutate owner BYOK config, and do not reopen provider hardening.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime must be at PR442 product commit `43e300b8` or later for both web and
API.

If either surface is stale, return:

```text
STALE_DEPLOYMENT
```

## Rehearsal

Use the replay owner account and a private Studio/replay persona with no real
accepted OpenAI, Anthropic, or DeepSeek provider route configured.

Exercise the private chat path that previously would have looked like a failed
chat.

Pass conditions:

- The owner sees a clear setup callout when private chat cannot run because no
  accepted private provider route is configured.
- The callout points to Settings AI Provider setup.
- The callout names OpenAI, Anthropic, and DeepSeek as the setup path.
- Gemini is not offered as a private chat provider.
- NVIDIA is not offered as a private Studio/replay/persona chat provider.
- Non-provider errors still look like ordinary errors rather than setup
  guidance.
- No raw provider key, bearer token, encrypted payload, prompt, completion,
  provider payload, private source body, cookie, or session value appears in
  the committed evidence.

Also verify `/settings#ai-provider` lands the owner near the AI Provider panel
or at least on Settings with the AI Provider panel visible/reachable.

## Wakeup

Wake MIMIR with:

- `PASS`: hosted product behavior is understandable and safe; or
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: include exact route, action, expected
  behavior, actual behavior, and non-secret evidence.

Wake DAEDALUS only if the defect is concrete and product-code related.
