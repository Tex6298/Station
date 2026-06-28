# PR433 - NVIDIA Platform Chat Synthetic Proof

Date opened: 2026-06-28

Opened by: MIMIR / A1

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3 if proof or code changes land

Status: open - prove synthetic-only staging chat or return blocker

## Why This Lane

PR432 proves the current Gemini-backed `station_free_1536` retrieval path. The
future-lanes sequence then allows staged replay with optional NVIDIA chat, but
only after provider/data-policy boundaries are explicit.

This lane is the first NVIDIA proof and must stay synthetic-only. It is not a
private archive, Memory, Continuity, companion, or production provider-policy
claim.

Relevant docs:

- `docs/roadmap/STATION_RETRIEVAL_PROVIDER_RESEARCH_ARIADNE.md`
- `docs/roadmap/DEPENDENCIES_UPSTREAM_CARRYOVER_CROSSWALK.md`
- `docs/roadmap/STATION_REPLAY_STAGING_READINESS.md`

## Task

Prove or precisely block the NVIDIA platform chat path for staging/dev.

Answer with evidence:

1. Does current repo code support NVIDIA platform chat through the existing
   OpenAI-compatible/provider router path?
2. Do hosted readiness surfaces report NVIDIA/platform-chat configuration as
   available without exposing key material?
3. Is the selected model/current config still valid in code and hosted env?
4. Can Station perform one synthetic-only NVIDIA chat probe using a harmless
   prompt and `/no_think` posture?
5. Does the probe avoid sending private archive text, Memory, Continuity,
   owner replay corpus, raw prompts from real users, or private context?
6. Does observability/readback show provider/model/status/token/cost labels
   without storing prompts, completions, payloads, keys, IDs, cookies, or
   secrets?
7. Does fallback/non-NVIDIA behavior still work when NVIDIA is unavailable?

If the answer is already yes, record sanitized proof and wake ARGUS.

If a repo-only gap is found, implement the narrowest code/test/docs patch that
stays inside this lane, then wake ARGUS.

If NVIDIA config, quota, model access, API key, hosted variable, data-policy, or
provider support is missing, wake MIMIR with the exact blocker label and the
smallest safe next action.

## Synthetic Prompt Boundary

Allowed prompt shape:

```text
/no_think Reply with exactly: Station NVIDIA synthetic probe OK.
```

or an equivalent harmless public-safe probe.

Do not send:

- private archive text;
- Memory or Continuity content;
- persona private profile text;
- replay corpus anchors;
- real user prompts;
- source snippets;
- IDs, tokens, credentials, database URLs, provider payloads, or secrets.

## Boundaries

Do not:

- switch embeddings to NVIDIA;
- change vector dimensions or retrieval schema;
- add Gemini chat/provider UI;
- add a broad model gateway;
- add Cloudflare, Redis, workers, queues, background jobs, billing, Stripe, or
  production provider policy;
- send private context to NVIDIA;
- record raw prompts, completions, provider payloads, trace IDs, owner IDs,
  persona IDs, cookies, tokens, or secrets in docs/logs.

## Expected Validation

Use current repo truth. Expected minimum if code/tests change:

```bash
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If provider/router tests exist or are added, run those too. If a hosted
synthetic probe is possible, record only sanitized provider/model/status/token/
cost labels and pass/fail.

## Wakeup

Wake ARGUS with proof/patch result and validation if the lane can be completed.

Wake MIMIR with the exact blocker if config/quota/model/data-policy/provider
support is missing.
