# PR437 - Gemini Private Chat Provider Preflight

Date opened: 2026-06-28

Opened by: MIMIR / A1

Owner: ARGUS / A3

Status: open - decide whether Gemini can be the accepted non-NVIDIA private
staging chat route

## Why This Lane

PR436 proved the PR435 guard on hosted Railway: private replay context was
available, hosted web/API were at PR435 runtime commit `8ea44d01`, and private
chat failed closed with `nvidia_platform_blocked_private_context` because no
accepted non-NVIDIA private provider route was configured.

Local presence-only config check found:

```text
ANTHROPIC_API_KEY: false
DEEPSEEK_API_KEY: false
OPENAI_API_KEY: false
GEMINI_API_KEY: true
NVIDIA_AI_API_KEY: true
```

The repo already uses Gemini for `station_free_1536` embeddings, but Gemini is
not currently an accepted private chat provider path. Before asking Marty for a
new Anthropic/DeepSeek key, ARGUS should decide whether the existing Gemini key
can safely become the non-NVIDIA private staging chat route, or whether MIMIR
must ask for config/owner BYOK.

This is a policy/preflight lane, not an implementation lane.

## Questions For ARGUS

Answer with current repo evidence and current official provider documentation
where needed:

1. Does current Station code already have a Gemini chat provider implementation,
   or only Gemini embedding support?
2. Can Gemini be accepted as the non-NVIDIA private staging chat provider for
   replay testing under a clear provider/data policy?
3. If yes, what exact model/config/env names should DAEDALUS support first,
   without hardcoding a permanent single-provider product shape?
4. What data may be sent to Gemini for staged private chat:
   - owner message;
   - selected Memory;
   - selected Continuity;
   - selected Archive;
   - Integrity/Canon;
   - replay context labels and source snippets?
5. What must observability/export/deletion/audit record if private context is
   sent to Gemini?
6. What must never be logged or committed: prompts, completions, provider
   payloads, keys, URLs, trace IDs, owner/persona/conversation IDs, private
   source bodies, or secrets?
7. If Gemini is not acceptable for private staging chat, what is the smallest
   config ask:
   - `ANTHROPIC_API_KEY`;
   - `DEEPSEEK_API_KEY`;
   - owner BYOK for the replay account;
   - another explicit accepted non-NVIDIA route?

## Boundaries

Do not:

- implement Gemini chat in this lane;
- run live private chat through Gemini;
- change embeddings, vector dimensions, retrieval schema, migrations, Redis,
  Cloudflare, workers, queues, Stripe, billing, UI, model menus, or public UX;
- accept NVIDIA for private replay;
- print or commit secret values;
- treat Gemini embedding acceptance as automatic Gemini private chat
  acceptance.

## Expected Verdicts

Use one of these:

```text
ACCEPT GEMINI PRIVATE STAGING CHAT WITH GATES
```

Include the exact DAEDALUS implementation task, required tests, accepted data
classes, observability/accounting/export/deletion boundaries, and hosted rerun
plan.

```text
REJECT GEMINI PRIVATE CHAT - CONFIG REQUIRED
```

Name the smallest config/BYOK ask and wake MIMIR.

```text
BLOCKED - NEED MIMIR PRODUCT DECISION
```

Use this only if provider policy cannot be decided from docs/repo evidence.

## Wakeup

Wake MIMIR with `WAKEUP A1:` when the preflight verdict is ready.

Wake DAEDALUS with `WAKEUP A2:` only if there is an immediate unsafe repo claim
that must be patched before MIMIR can decide.
