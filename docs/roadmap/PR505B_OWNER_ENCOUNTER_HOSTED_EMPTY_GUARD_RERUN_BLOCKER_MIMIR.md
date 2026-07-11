# PR505B - Owner Encounter Hosted Empty Guard Rerun Blocker

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
BLOCK_PR505B_HOSTED_PROVIDER_EMPTY_REPLY_GUARD_WORKING
```

## Summary

ARIADNE reran PR505B against hosted `@station/api` with PR505A deployed:

`docs/roadmap/PR505B_OWNER_ENCOUNTER_HOSTED_EMPTY_GUARD_RERUN_RESULT.md`

Hosted proof:

- web/API/deployment checks passed;
- hosted API was ready at `@station/api`, branch `main`, commit
  `28411374e523...`;
- owner and non-owner auth passed;
- same-owner persona availability passed with `5` owner personas;
- owner readiness returned `ready:true`;
- the required same-owner preview returned bounded `502` /
  `persona_encounter_provider_empty_reply`;
- signed-out preview returned `401`;
- cross-owner preview returned `403` with
  `persona_encounter_persona_not_owned`;
- sampled public Space/persona routes exposed no owner-encounter controls or
  claims;
- privacy/secret scan passed.

Interpretation:

- PR505A guard works on hosted.
- PR505B cannot pass because there is still no hosted nonblank responder
  preview.
- The remaining blocker is provider output/completion budget for the
  NVIDIA/OpenAI-compatible route, not auth, ownership, config readiness,
  persistence, public exposure, retrieval, billing, social, queue, Redis, or
  Cloudflare.

## MIMIR Sanitized Provider Probe

MIMIR ran two direct local NVIDIA/OpenAI-compatible probes using local env
config. No key, prompt body, generated content, base URL, model value, provider
payload, raw response body, or secret was printed or recorded.

Probe 1:

```text
max_tokens: 64
status: 200
finishReason: length
messageContentLength: null
messageReasoningContentLength: 290
```

Probe 2:

```text
max_tokens: 512
status: 200
finishReason: stop
messageContentLength: 19
messageReasoningContentLength: 292
completionTokens: 68
```

Conclusion:

- The active NVIDIA/OpenAI-compatible model can spend the completion budget on
  reasoning tokens and return no final `message.content` when the cap is too
  low.
- The adapter should not expose `reasoning_content` as user-visible reply
  content.
- The owner encounter route likely needs route-aware completion-budget handling
  for NVIDIA/OpenAI-compatible previews while preserving PR505A's empty-output
  fail-closed guard.

## Next

Open PR505C for DAEDALUS:

- inspect encounter `maxOutputTokens` defaults and caps;
- use the sanitized NVIDIA evidence above;
- preserve `persona_encounter_provider_empty_reply`;
- do not parse or expose reasoning as reply content;
- do not add retries, fake fallback content, persistence, retrieval, public
  routes, billing, social, queue/worker, Redis, Cloudflare, provider key
  exposure, or broad provider policy changes.
