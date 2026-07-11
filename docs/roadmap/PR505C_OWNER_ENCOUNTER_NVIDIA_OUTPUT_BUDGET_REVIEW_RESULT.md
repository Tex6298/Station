# PR505C - Owner Encounter NVIDIA Output Budget Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Decision

ARGUS accepts PR505C as:

```text
ACCEPT_PR505C_OWNER_ENCOUNTER_NVIDIA_OUTPUT_BUDGET
```

The implementation matches the PR505C lane: owner encounter previews now apply
a route-local `512` max-token floor only for the
`nvidia_openai_compatible` route, while PR505A's empty-output guard remains
fail-closed.

No ARGUS code patch was required.

## Review

Accepted implementation facts:

- `selectEncounterPreviewMaxOutputTokens` keeps non-NVIDIA preview behavior at
  the existing requested/default budget;
- `nvidia_openai_compatible` previews use at least `512` max output tokens, so
  lower caller requests such as `140` are raised only on that route;
- quota estimation uses the selected route-local budget before the provider
  call;
- the provider call still happens once, with no retry loop;
- the PR505A guard still normalizes `aiResponse.content` and returns bounded
  `502` / `persona_encounter_provider_empty_reply` before success serialization
  or successful token usage if the provider returns blank output;
- the OpenAI-compatible adapter still reads only `message.content`; it does not
  parse or expose `reasoning_content`.

Preserved non-scope:

- no provider adapter, router, provider-policy, route-flag, auth, ownership,
  persistence, retrieval, Memory, Archive, Canon, Continuity, Integrity, public
  route, billing, social, queue/worker, Redis, Cloudflare, storage, schema,
  migration, UI, fake fallback content, or broad runtime behavior was added;
- no provider payloads, prompts, private persona notes, raw ids, keys, base
  URLs, model config, env values, SQL details, stack traces, tokens, or cookies
  were exposed or logged.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 20 persona encounter route/runtime tests passed in ARGUS review. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Changed-path/source scan | Pass | Matches were the intended `max_tokens`/`nvidia_openai_compatible` change, the existing empty-reply code, and negative boundary language only. |

Provider/router tests were not rerun because PR505C did not change
`packages/ai` provider adapter or router behavior.

## Remaining Hosted Proof

MIMIR should route ARIADNE for another hosted PR505 rerun after deploy. Hosted
pass still requires actual nonblank `message.content`; if the provider still
returns no visible responder reply, the PR505A empty-output guard must continue
to return bounded `502` without successful provenance or token accounting.

The hosted proof should not record provider payloads, raw prompts, private
persona notes, raw ids, keys, base URLs, model config, env values, SQL details,
stack traces, generated reply text, tokens, or cookies.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR505C owner encounter NVIDIA output budget handling.
- NVIDIA/OpenAI-compatible owner encounter previews now use a route-local 512 max-token floor; non-NVIDIA budget behavior is unchanged.
- PR505A empty-output guard remains fail-closed: blank output still returns bounded 502 / persona_encounter_provider_empty_reply before success serialization or successful token usage.
- No reasoning_content exposure, retry, fake fallback, provider policy, persistence, retrieval, billing, public, queue/worker, Redis, Cloudflare, storage, schema, migration, UI, or secret/payload leakage drift was added.
- Local validation passed: test:persona-encounters, typecheck, git diff --check, and git diff --cached --check.
Task:
- Close PR505C and route ARIADNE for the hosted PR505 rerun after deploy.
```
