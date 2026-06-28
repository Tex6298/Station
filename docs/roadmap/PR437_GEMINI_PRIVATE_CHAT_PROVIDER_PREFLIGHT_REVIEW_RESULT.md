# PR437 - Gemini Private Chat Provider Preflight Review Result

Date reviewed: 2026-06-28

Reviewer: ARGUS / A3

Status: rejected Gemini private chat - config required - wake MIMIR

## Verdict

```text
REJECT GEMINI PRIVATE CHAT - CONFIG REQUIRED
```

Do not use the existing Gemini embedding key as a private staged chat route.
Current Station code has Gemini embedding support and Gemini provider
vocabulary, but no Gemini chat provider implementation, no Gemini chat route,
and no tests proving private Gemini chat request shape, observability,
accounting, deletion/export/audit posture, or fail-closed policy behavior.

The smallest safe unblock for PR436 rerun is to configure an already implemented
and accepted non-NVIDIA private chat route on Railway, preferably
`ANTHROPIC_API_KEY`. If Anthropic is not available, `DEEPSEEK_API_KEY` is the
next already implemented platform route. Owner BYOK for the replay account is
also acceptable if MIMIR chooses that path.

No DAEDALUS implementation patch is required before MIMIR decides the config
path.

## Evidence Read

- `docs/roadmap/PR437_GEMINI_PRIVATE_CHAT_PROVIDER_PREFLIGHT_ARGUS.md`
- `docs/roadmap/PR436_HOSTED_NON_NVIDIA_STAGED_REPLAY_RESULT.md`
- `docs/roadmap/PR435_PRIVATE_REPLAY_NON_NVIDIA_PROVIDER_GUARD_REVIEW_RESULT.md`
- `docs/roadmap/DEPENDENCIES_UPSTREAM_CARRYOVER_CROSSWALK.md`
- `docs/ops/FREE_EMBEDDINGS_DECISION.md`
- `docs/ops/GEMINI_EMBEDDING_MIGRATION_PLAN.md`
- `packages/ai/src/providers/router.ts`
- `packages/ai/src/providers/`
- `packages/ai/src/retrieval/embeddings.ts`
- `apps/api/src/lib/env.ts`
- Google Gemini API Additional Terms of Service:
  `https://ai.google.dev/gemini-api/terms`
- Google Gemini 2.5 Flash model docs:
  `https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash`

Repo truth:

- `packages/ai/src/providers/` contains OpenAI, Anthropic, DeepSeek, and router
  providers only. There is no `GeminiProvider`.
- `resolveChatProviderRuntimeRoute` supports BYOK OpenAI/Anthropic/DeepSeek,
  Station Anthropic, NVIDIA OpenAI-compatible platform chat, and DeepSeek
  fallback. It does not route chat to Gemini.
- `GEMINI_API_KEY` / `GOOGLE_API_KEY` are used for embeddings under
  `station_free_1536`, not chat.
- The carryover matrix explicitly records Gemini chat as deferred and says
  Gemini embeddings are separate from chat provider support.
- PR436 proved the hosted private replay path now fails closed because no
  accepted non-NVIDIA private provider route is configured.

Official-provider truth checked on 2026-06-28:

- Gemini unpaid services may use submitted content and generated responses to
  improve Google products, may involve human review, and warn not to submit
  sensitive, confidential, or personal information.
- Gemini paid API service, through an active Cloud Billing project, has a
  different data-use posture: prompts/responses are not used to improve Google
  products, but Google still logs prompts/responses for a limited period for
  abuse/safety/security and legal/regulatory needs.
- `gemini-2.5-flash` is a stable text-output Gemini API model and would be the
  first model to evaluate if MIMIR later opens a paid Gemini chat provider lane.

## Answers For PR437

1. Current Station code has only Gemini embedding support. Gemini chat is not
   implemented.
2. Gemini is not accepted as the immediate non-NVIDIA private staging chat
   provider. A future paid-Gemini private chat lane could be considered, but
   only after MIMIR explicitly accepts paid Gemini API data posture and
   DAEDALUS implements a tested chat provider.
3. If MIMIR later chooses Gemini chat, do not silently reuse the embedding key.
   Use explicit chat config such as `GEMINI_CHAT_API_KEY` and
   `GEMINI_CHAT_MODEL=gemini-2.5-flash`, with a documented requirement that the
   project is a paid Gemini API project with active Cloud Billing. Keep
   `GEMINI_API_KEY` / `GOOGLE_API_KEY` scoped to embeddings unless a separate
   lane migrates config deliberately.
4. No private staged chat data may be sent to Gemini in the current repo. In a
   future paid Gemini lane, only the minimal provider prompt, owner message, and
   Station-selected private context needed for the replay turn could be sent
   after tests prove owner scope, minimization, and observability redaction.
5. Future observability/export/deletion/audit would need provider route, model,
   mode, paid-service confirmation, status, latency, token/cost accounting,
   policy labels, selected-source counts/classes, export disclosure, deletion
   caveat, and owner-visible audit receipts without raw private content.
6. Never log or commit prompt text, completion text, provider payloads, keys,
   base URLs, headers, cookies, tokens, trace IDs, owner/persona/conversation
   IDs, source IDs, private source bodies, selected private snippets, or
   secret-shaped values.
7. Smallest config ask: configure `ANTHROPIC_API_KEY` on the Railway API
   service and rerun PR436. If Anthropic is not available, configure
   `DEEPSEEK_API_KEY` with its accepted base/model defaults, or configure owner
   BYOK for the replay account using an already supported BYOK provider.

## Future Gemini Chat Lane Gate

Only open DAEDALUS work for Gemini private chat if MIMIR explicitly chooses it.
That lane must:

- implement a separate Gemini chat provider class and runtime route label;
- keep embeddings and chat config separate unless MIMIR deliberately unifies
  them;
- require paid Gemini API / active Cloud Billing confirmation before private
  context is sent;
- avoid Google Search/Maps grounding, file upload, URL context, caching, tools,
  or agentic services for the first private replay route;
- add provider-router tests for Gemini route selection, BYOK precedence,
  no-NVIDIA private behavior, missing-config fail-closed behavior, and no
  accidental use of embedding-only envs;
- add mounted private chat tests proving prompt/context minimization, no raw
  provider payloads in traces, no keys/URLs/IDs, and owner/non-owner boundaries;
- add replay-readiness wording that separates Gemini embeddings from Gemini
  chat.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/provider-router.test.ts` | Pass | 12 tests passed; current accepted chat routes and blocked-private NVIDIA behavior remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed; readiness keeps NVIDIA public/synthetic-only and trace details sanitized. |
| `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` | Pass | 12 tests passed; Gemini remains the active embedding metadata path, not a chat provider. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript typecheck passed. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

Wake MIMIR with the config verdict. Do not wake DAEDALUS unless MIMIR chooses a
future paid-Gemini chat implementation lane or a narrow repo-doc correction.
