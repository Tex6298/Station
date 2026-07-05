# PR485D - Companion Presence And Capability Context Result

Owner: DAEDALUS / A2

Date: 2026-07-05

Status: Ready for ARGUS review

Validation result:

```text
READY_FOR_ARGUS_REVIEW
```

Implementation label:

```text
PR485D_NO_MIGRATION_PRIVATE_PROMPT_CONTEXT
```

## Implementation

DAEDALUS implemented the accepted no-migration private prompt-context slice.

Added:

- deterministic `packages/ai` companion capability helpers;
- deterministic `packages/ai` companion presence helpers;
- optional private-only capability and presence sections in
  `buildPersonaChatPrompt`;
- optional preformatted prompt-context pass-through in
  `assemblePersonaRuntimeContext`;
- private chat route wiring that computes capability and same-thread presence
  from already-loaded conversation history before inserting the new owner
  message;
- owner context-preview capability context only, with presence omitted.

Default capability remains `conversation-first`. Future assisted modes require
explicit typed helper input and are not inferred from provider, tier, archive
volume, imported source material, persona name, or private corpus content.

Presence remains soft same-thread context only:

- `first_contact`;
- `active_thread`;
- `returning`;
- `long_gap`.

## Guardrails

Preserved:

- public persona chat behavior;
- public persona context-preview behavior;
- selected-context answer focus, retry, and finalizer paths;
- provider routing;
- token-budget checks and token usage recording;
- retrieval ordering and topology;
- runtime trace shape and source redaction;
- private chat response/readback safety.

Not added:

- migrations or schema fields;
- route-selected conversation loading or query params;
- automatic LLM calls;
- durable presence, mood, intimacy, emotional-state, or capability storage;
- tool execution, browsing, file access, MCP, external-service, or autonomy
  claims;
- queue/worker, Redis, Cloudflare, billing, Archive connector, Memory inbox,
  web UI, broad shell, public write, social connector, or Discern CSS changes.

## Validation

Passed locally on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/ai build` | Pass | Rebuilt local AI package output so API package-export imports used the new helper modules during tests. Generated `dist` output remains untracked. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/companion-context.test.ts packages/ai/test/retrieval-metadata.test.ts apps/api/src/routes/conversation-archive.test.ts apps/api/src/routes/persona-context.test.ts apps/api/src/routes/personas.test.ts` | Pass | 58 helper, prompt, private chat, runtime context, public persona, and no-drift tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

## ARGUS Review Request

ARGUS should review:

- capability helper determinism and boundary copy;
- presence threshold behavior and soft same-thread framing;
- private-only prompt injection;
- private chat use of already-loaded history before owner-message insert;
- context-preview capability-only behavior;
- public persona no-drift;
- provider/token/retrieval/runtime trace preservation;
- static no-drift coverage.

If accepted, ARGUS should wake MIMIR with `WAKEUP A1:` for closeout/sequencing.
If fixes are needed, wake DAEDALUS with `WAKEUP A2:`.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR485D no-migration private prompt context.
- Added deterministic companion capability/presence helpers, private-only prompt sections, private chat wiring from already-loaded same-thread history, and capability-only owner context-preview.
- Public persona chat/preview, schema, route/query behavior, provider routing, token accounting, retrieval ordering, UI, Archive connector, Memory inbox, Redis, Cloudflare, billing, public writes, and Discern CSS stayed out of scope.
Validation:
- AI package build passed.
- Focused AI/API suite passed with 58 tests.
- typecheck passed.
- lint passed.
Task:
- Review helper boundaries, private chat prompt wiring, context-preview capability-only behavior, and no-drift coverage.
- If accepted, wake MIMIR with WAKEUP A1: for closeout/sequencing.
```
